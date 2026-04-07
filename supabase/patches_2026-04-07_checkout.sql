-- Orders checkout transaction (inventory reserved on add-to-cart)
drop function if exists public.create_order_with_items(text, text, text, jsonb);
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id),
  quantity integer not null,
  price numeric not null default 0,
  name text not null,
  created_at timestamptz default now()
);

alter table public.order_items enable row level security;

drop policy if exists "Admins can read order items" on public.order_items;
create policy "Admins can read order items"
  on public.order_items
  for select
  using (exists (select 1 from public.admin_users where id = auth.uid()));

create or replace function public.create_order_with_items(
  p_buyer_name text,
  p_buyer_email text,
  p_delivery_note text,
  p_items jsonb,
  p_session_id text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid := gen_random_uuid();
  v_total numeric := 0;
  v_item jsonb;
  v_id text;
  v_qty integer;
  v_price numeric;
  v_name text;
  v_items jsonb := '[]'::jsonb;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'Invalid items';
  end if;
  if p_session_id is null or length(p_session_id) = 0 then
    raise exception 'Invalid session';
  end if;

  -- Create order first so FK on order_items is satisfied
  insert into public.orders(
    id,
    buyer_name,
    buyer_email,
    total,
    delivery_note,
    items,
    status
  )
  values (
    v_order_id,
    p_buyer_name,
    p_buyer_email,
    0,
    p_delivery_note,
    '[]'::jsonb,
    'pending'
  );

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_id := v_item->>'id';
    v_qty := (v_item->>'qty')::int;

    if v_id is null or v_qty is null or v_qty <= 0 then
      raise exception 'Invalid item';
    end if;

    select name, price
      into v_name, v_price
    from public.products
    where id = v_id
    for update;

    if not found then
      raise exception 'Product not found';
    end if;

    v_total := v_total + (v_price * v_qty);

    -- Ensure reservation exists for this session
    if not exists (
      select 1 from public.product_reservations
      where session_id = p_session_id and product_id = v_id and quantity >= v_qty and expires_at > now()
    ) then
      raise exception 'Reservation missing';
    end if;

    insert into public.order_items(order_id, product_id, quantity, price, name)
    values (v_order_id, v_id, v_qty, v_price, v_name);

    -- Reduce reservation quantity or clear it
    update public.product_reservations
    set quantity = quantity - v_qty
    where session_id = p_session_id and product_id = v_id;

    delete from public.product_reservations
    where session_id = p_session_id and product_id = v_id and quantity <= 0;

    v_items := v_items || jsonb_build_object(
      'id', v_id,
      'name', v_name,
      'qty', v_qty,
      'price', v_price
    );
  end loop;

  update public.orders
  set total = v_total,
      items = v_items
  where id = v_order_id;

  return v_order_id;
end;
$$;

grant execute on function public.create_order_with_items(text, text, text, jsonb, text) to anon, authenticated;

-- Reservation holds table
create table if not exists public.product_reservations (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  session_id text not null,
  quantity integer not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

create unique index if not exists product_reservations_session_product_idx
  on public.product_reservations (session_id, product_id);

create index if not exists product_reservations_expires_at_idx
  on public.product_reservations (expires_at);

alter table public.product_reservations enable row level security;

-- Cleanup helper: release expired reservations back to inventory
create or replace function public.cleanup_expired_reservations()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  with expired as (
    delete from public.product_reservations
    where expires_at < now()
    returning product_id, quantity
  )
  update public.products p
  set inventory = p.inventory + e.quantity,
      status = case when p.status = 'sold-out' and p.inventory + e.quantity > 0 then 'available' else p.status end
  from expired e
  where p.id = e.product_id;
end;
$$;

grant execute on function public.cleanup_expired_reservations() to anon, authenticated;

-- Reserve inventory on add-to-cart (atomic)
drop function if exists public.reserve_product_inventory(text, integer);
create or replace function public.reserve_product_inventory(p_product_id text, p_qty integer, p_session_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_preorder boolean;
  v_inventory integer;
  updated_count integer;
begin
  if p_qty is null or p_qty <= 0 then
    return false;
  end if;
  perform public.cleanup_expired_reservations();

  select status, is_preorder, inventory
    into v_status, v_preorder, v_inventory
  from public.products
  where id = p_product_id
  for update;

  if not found then
    return false;
  end if;

  if v_status = 'sold-out' then
    return false;
  end if;

  if v_status = 'in-production' and v_preorder is not true then
    return false;
  end if;

  if v_inventory < p_qty then
    return false;
  end if;

  update public.products
  set inventory = inventory - p_qty,
      status = case when inventory - p_qty <= 0 then 'sold-out' else status end
  where id = p_product_id;

  insert into public.product_reservations(product_id, session_id, quantity, expires_at)
  values (p_product_id, p_session_id, p_qty, now() + interval '15 minutes')
  on conflict (session_id, product_id)
  do update set
    quantity = public.product_reservations.quantity + excluded.quantity,
    expires_at = excluded.expires_at;

  get diagnostics updated_count = row_count;
  return updated_count = 1;
end;
$$;

grant execute on function public.reserve_product_inventory(text, integer, text) to anon, authenticated;

-- Release reservation (when user removes from cart)
drop function if exists public.release_product_inventory(text, integer);
create or replace function public.release_product_inventory(p_product_id text, p_qty integer, p_session_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_qty integer;
  v_release integer;
begin
  if p_qty is null or p_qty <= 0 then
    return;
  end if;

  perform public.cleanup_expired_reservations();

  select quantity into v_qty
  from public.product_reservations
  where session_id = p_session_id and product_id = p_product_id
  for update;

  if not found then
    return;
  end if;

  v_release := least(v_qty, p_qty);

  update public.products
  set inventory = inventory + v_release,
      status = case when status = 'sold-out' and inventory + v_release > 0 then 'available' else status end
  where id = p_product_id;

  update public.product_reservations
  set quantity = quantity - v_release
  where session_id = p_session_id and product_id = p_product_id;

  delete from public.product_reservations
  where session_id = p_session_id and product_id = p_product_id and quantity <= 0;
end;
$$;

grant execute on function public.release_product_inventory(text, integer, text) to anon, authenticated;

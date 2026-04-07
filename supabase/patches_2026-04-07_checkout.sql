-- Orders + inventory checkout transaction
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

create policy "Admins can read order items"
  on public.order_items
  for select
  using (exists (select 1 from public.admin_users where id = auth.uid()));

create or replace function public.create_order_with_items(
  p_buyer_name text,
  p_buyer_email text,
  p_delivery_note text,
  p_items jsonb
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
  v_status text;
  v_preorder boolean;
  v_inventory integer;
  v_items jsonb := '[]'::jsonb;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'Invalid items';
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_id := v_item->>'id';
    v_qty := (v_item->>'qty')::int;

    if v_id is null or v_qty is null or v_qty <= 0 then
      raise exception 'Invalid item';
    end if;

    select name, price, status, is_preorder, inventory
      into v_name, v_price, v_status, v_preorder, v_inventory
    from public.products
    where id = v_id
    for update;

    if not found then
      raise exception 'Product not found';
    end if;

    if v_status = 'sold-out' then
      raise exception 'Sold out';
    end if;

    if v_status = 'in-production' and v_preorder is not true then
      raise exception 'Preorder closed';
    end if;

    if v_inventory < v_qty then
      raise exception 'Insufficient stock';
    end if;

    update public.products
    set inventory = inventory - v_qty,
        status = case when inventory - v_qty <= 0 then 'sold-out' else status end
    where id = v_id;

    v_total := v_total + (v_price * v_qty);

    insert into public.order_items(order_id, product_id, quantity, price, name)
    values (v_order_id, v_id, v_qty, v_price, v_name);

    v_items := v_items || jsonb_build_object(
      'id', v_id,
      'name', v_name,
      'qty', v_qty,
      'price', v_price
    );
  end loop;

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
    v_total,
    p_delivery_note,
    v_items,
    'pending'
  );

  return v_order_id;
end;
$$;

grant execute on function public.create_order_with_items(text, text, text, jsonb) to anon, authenticated;

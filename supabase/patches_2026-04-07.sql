-- Decrement inventory on checkout (atomic, safe).
create or replace function public.decrement_order_inventory(p_items jsonb)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  v_id text;
  v_qty integer;
  v_status text;
  v_preorder boolean;
  v_inventory integer;
begin
  if p_items is null then
    return false;
  end if;

  -- Lock and validate all items first
  for item in select * from jsonb_array_elements(p_items)
  loop
    v_id := item->>'id';
    v_qty := (item->>'qty')::int;
    if v_id is null or v_qty <= 0 then
      return false;
    end if;

    select status, is_preorder, inventory
      into v_status, v_preorder, v_inventory
    from public.products
    where id = v_id
    for update;

    if not found then
      return false;
    end if;

    if v_status = 'sold-out' then
      return false;
    end if;

    if v_status = 'available' and v_inventory < v_qty then
      return false;
    end if;

    if v_status = 'in-production' and v_preorder is not true then
      return false;
    end if;

    if v_status = 'in-production' and v_preorder is true and v_inventory < v_qty then
      return false;
    end if;
  end loop;

  -- Apply decrements
  for item in select * from jsonb_array_elements(p_items)
  loop
    v_id := item->>'id';
    v_qty := (item->>'qty')::int;
    select status, is_preorder into v_status, v_preorder from public.products where id = v_id;
    if v_status in ('available', 'in-production') then
      update public.products
      set inventory = inventory - v_qty,
          status = case when inventory - v_qty <= 0 then 'sold-out' else status end
      where id = v_id;
    end if;
  end loop;

  return true;
end;
$$;

create or replace function public.restore_order_inventory(p_items jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  v_id text;
  v_qty integer;
begin
  if p_items is null then
    return;
  end if;

  for item in select * from jsonb_array_elements(p_items)
  loop
    v_id := item->>'id';
    v_qty := (item->>'qty')::int;
    if v_id is null or v_qty <= 0 then
      continue;
    end if;
    update public.products
    set inventory = inventory + v_qty,
        status = case when status = 'sold-out' and inventory + v_qty > 0 then 'available' else status end
    where id = v_id;
  end loop;
end;
$$;

grant execute on function public.decrement_order_inventory(jsonb) to anon, authenticated;
grant execute on function public.restore_order_inventory(jsonb) to anon, authenticated;

-- Reserve inventory immediately on add-to-cart
create or replace function public.reserve_product_inventory(p_product_id text, p_qty integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_preorder boolean;
  v_inventory integer;
begin
  if p_qty is null or p_qty <= 0 then
    return false;
  end if;

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

  return true;
end;
$$;

create or replace function public.release_product_inventory(p_product_id text, p_qty integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_qty is null or p_qty <= 0 then
    return;
  end if;

  update public.products
  set inventory = inventory + p_qty,
      status = case
        when status = 'sold-out' and inventory + p_qty > 0 then
          case when is_preorder then 'in-production' else 'available' end
        else status
      end
  where id = p_product_id;
end;
$$;

grant execute on function public.reserve_product_inventory(text, integer) to anon, authenticated;
grant execute on function public.release_product_inventory(text, integer) to anon, authenticated;

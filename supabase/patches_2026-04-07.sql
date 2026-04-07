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
  end loop;

  -- Apply decrements
  for item in select * from jsonb_array_elements(p_items)
  loop
    v_id := item->>'id';
    v_qty := (item->>'qty')::int;
    select status, is_preorder into v_status, v_preorder from public.products where id = v_id;
    if v_status = 'available' then
      update public.products
      set inventory = inventory - v_qty,
          status = case when status = 'available' and inventory - v_qty <= 0 then 'sold-out' else status end
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

-- Reserve and release inventory from the shop in a safe, atomic way
create or replace function public.reserve_product_inventory(p_product_id text, p_qty integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
begin
  if p_qty is null or p_qty <= 0 then
    return false;
  end if;

  update public.products
  set inventory = inventory - p_qty
  where id = p_product_id
    and inventory >= p_qty
    and status = 'available';

  get diagnostics updated_count = row_count;
  return updated_count = 1;
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
  set inventory = inventory + p_qty
  where id = p_product_id;
end;
$$;

grant execute on function public.reserve_product_inventory(text, integer) to anon, authenticated;
grant execute on function public.release_product_inventory(text, integer) to anon, authenticated;

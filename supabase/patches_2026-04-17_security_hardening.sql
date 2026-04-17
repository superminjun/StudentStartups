-- Security hardening for public forms and checkout helpers.
-- Run this after the server API routes are deployed with SUPABASE_SERVICE_ROLE_KEY configured.

drop policy if exists "Anyone can submit messages" on public.messages;
drop policy if exists "Anyone can place orders" on public.orders;

revoke execute on function public.create_order_with_items(text, text, text, jsonb, text) from anon, authenticated;
revoke execute on function public.reserve_product_inventory(text, integer, text) from anon, authenticated;
revoke execute on function public.release_product_inventory(text, integer, text) from anon, authenticated;

comment on table public.messages is 'Messages are now intended to be inserted through the server API.';
comment on table public.orders is 'Orders are now intended to be inserted through the server checkout API.';

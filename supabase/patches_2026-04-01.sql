-- Add admin delete permissions for members + attendance
drop policy if exists "Admins can delete members" on public.members;
create policy "Admins can delete members"
  on public.members
  for delete
  using (exists (select 1 from public.admin_users where id = auth.uid()));

drop policy if exists "Admins can delete attendance" on public.attendance;
create policy "Admins can delete attendance"
  on public.attendance
  for delete
  using (exists (select 1 from public.admin_users where id = auth.uid()));

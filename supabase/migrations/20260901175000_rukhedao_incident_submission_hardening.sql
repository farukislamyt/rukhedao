-- ============================================================
-- RUKHEDAO INCIDENT SUBMISSION HARDENING
-- ============================================================
-- Purpose:
--   Make anonymous incident creation deterministic and safe on
--   an already-deployed RukheDao v1 database.
--
-- This migration does NOT add, remove, rename, split, or merge
-- any of the 8 frozen application tables.
--
-- Public write path:
--   anon -> public.create_anonymous_incident() -> incidents
--
-- The RPC owns validation and public-id generation. The existing
-- database trigger remains as a second invariant for validation
-- and initial revision creation.
-- ============================================================

begin;


-- ------------------------------------------------------------
-- 1. API role/schema access
-- ------------------------------------------------------------

grant usage on schema public to anon, authenticated;


-- ------------------------------------------------------------
-- 2. Rebuild anonymous incident creation RPC
-- ------------------------------------------------------------
--
-- Important design choice:
--   The RPC supplies the public_id itself instead of relying on
--   the INSERT trigger to manufacture it. This removes one moving
--   part from the public submission path while preserving the
--   trigger as a defensive fallback.
--
-- The function is SECURITY DEFINER because anon has deliberately
-- been denied direct INSERT access to the incidents table.
--
-- No reporter identity, IP address, device id, session id, or
-- tracking value is accepted or stored.
-- ------------------------------------------------------------

create or replace function public.create_anonymous_incident(
  p_title text,
  p_description text,
  p_category_id uuid,
  p_division_id smallint,
  p_district_id smallint,
  p_incident_date date
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_public_id text;
begin

  -- Normalize and validate the payload before touching data.
  if p_title is null
     or char_length(btrim(p_title)) not between 5 and 200 then
    raise exception 'Invalid incident title'
      using errcode = '22023';
  end if;

  if p_description is null
     or char_length(btrim(p_description)) not between 20 and 10000 then
    raise exception 'Invalid incident description'
      using errcode = '22023';
  end if;

  if p_incident_date is null then
    raise exception 'Incident date is required'
      using errcode = '22023';
  end if;

  if p_incident_date >
     (current_timestamp at time zone 'Asia/Dhaka')::date then
    raise exception 'Incident date cannot be in the future'
      using errcode = '22023';
  end if;

  -- Validate against the canonical base tables inside the
  -- security-definer transaction. This means reference checks do
  -- not depend on API-role table grants or RLS configuration.
  if not exists (
    select 1
    from public.categories c
    where c.id = p_category_id
      and c.is_active = true
  ) then
    raise exception 'Category is not active'
      using errcode = '23503';
  end if;

  if not exists (
    select 1
    from public.divisions d
    where d.id = p_division_id
      and d.is_active = true
  ) then
    raise exception 'Division is not active'
      using errcode = '23503';
  end if;

  if not exists (
    select 1
    from public.districts d
    where d.id = p_district_id
      and d.division_id = p_division_id
      and d.is_active = true
  ) then
    raise exception 'District is not active or does not belong to division'
      using errcode = '23503';
  end if;

  -- Generate a unique public reference. The loop is intentionally
  -- inside the same transaction as the INSERT, so a rare collision
  -- is retried instead of being exposed as a generic failure.
  loop
    new_public_id :=
      'RK-' || upper(encode(public.gen_random_bytes(6), 'hex'));

    insert into public.incidents (
      public_id,
      category_id,
      division_id,
      district_id,
      title,
      description,
      incident_date
    )
    values (
      new_public_id,
      p_category_id,
      p_division_id,
      p_district_id,
      btrim(p_title),
      btrim(p_description),
      p_incident_date
    )
    on conflict (public_id) do nothing;

    if found then
      return new_public_id;
    end if;
  end loop;

end;
$$;


-- The function must be callable by anonymous visitors and by no
-- other API role. Table writes remain unavailable to anon.
revoke all on function public.create_anonymous_incident(
  text,
  text,
  uuid,
  smallint,
  smallint,
  date
) from public, authenticated;

grant execute on function public.create_anonymous_incident(
  text,
  text,
  uuid,
  smallint,
  smallint,
  date
) to anon;


-- ------------------------------------------------------------
-- 3. Re-assert least privilege on frozen core tables
-- ------------------------------------------------------------

revoke insert, update, delete
on public.categories,
   public.divisions,
   public.districts,
   public.admin_users,
   public.incidents,
   public.incident_revisions,
   public.incident_reports,
   public.moderation_actions
from anon, authenticated;


-- Public users never receive direct writes. All public writes are
-- controlled RPCs.
revoke all
on public.incidents
from anon;

revoke all
on public.incident_revisions
from anon;

revoke all
on public.incident_reports
from anon;

revoke all
on public.moderation_actions
from anon;


-- ------------------------------------------------------------
-- 4. Re-assert the public-safe reference views
-- ------------------------------------------------------------

create or replace view public.public_categories
with (security_invoker = true)
as
select
  id,
  name,
  slug,
  description,
  sort_order
from public.categories
where is_active;

create or replace view public.public_divisions
with (security_invoker = true)
as
select
  id,
  name,
  slug,
  sort_order
from public.divisions
where is_active;

create or replace view public.public_districts
with (security_invoker = true)
as
select
  id,
  division_id,
  name,
  slug,
  sort_order
from public.districts
where is_active;

create or replace view public.public_incidents
with (security_invoker = true)
as
select
  i.public_id,
  i.title,
  i.description,
  i.incident_date,
  i.verification_status,
  i.published_at,
  c.name as category,
  c.slug as category_slug,
  d.name as division,
  d.slug as division_slug,
  ds.name as district,
  ds.slug as district_slug
from public.incidents i
join public.categories c
  on c.id = i.category_id
join public.divisions d
  on d.id = i.division_id
join public.districts ds
  on ds.id = i.district_id
  and ds.division_id = i.division_id
where i.status = 'approved'
  and i.published_at is not null
  and c.is_active
  and d.is_active
  and ds.is_active;

revoke all on public.public_categories,
              public.public_divisions,
              public.public_districts,
              public.public_incidents
from anon, authenticated;

grant select on public.public_categories,
              public.public_divisions,
              public.public_districts,
              public.public_incidents
to anon, authenticated;


-- ------------------------------------------------------------
-- 5. Contract marker
-- ------------------------------------------------------------

comment on function public.create_anonymous_incident(
  text,
  text,
  uuid,
  smallint,
  smallint,
  date
)
is
'RukheDao anonymous incident submission RPC v2. Canonical public write path. Generates public ID, validates active references, rejects future dates, and stores no reporter identity.';


commit;

-- ============================================================
-- END
-- ============================================================

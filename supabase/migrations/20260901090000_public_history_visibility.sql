-- ============================================================
-- RUKHEDAO PUBLIC HISTORY VISIBILITY HARDENING
-- ============================================================
-- Published incident records must remain publicly visible even
-- when a reference record (category/division/district) is later
-- deactivated for new submissions.
--
-- The original public_incidents view incorrectly required all
-- joined reference rows to remain active. That could make an
-- already-published historical incident disappear from the
-- public archive without changing the incident itself.
--
-- Reference views remain active-only for new submissions.
-- ============================================================

begin;

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
  and i.published_at is not null;

comment on view public.public_incidents is
'Public published incident records. Historical records remain visible even if their reference category, division, or district is later deactivated.';

commit;

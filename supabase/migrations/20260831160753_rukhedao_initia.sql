-- ============================================================
-- RUKHEDAO
-- ============================================================
-- Project Name       : RukheDao
-- Database Name      : RukheDao Frozen Database Contract
-- Developer          : Faruk Islam
-- Database Platform  : Supabase / PostgreSQL
-- Target Plan        : Supabase Free Plan
-- Schema Version     : 1.0.0
-- Migration Type     : Initial Baseline
-- Migration Status   : FROZEN
-- Created            : 2026-08-31
--
-- ============================================================
-- PRODUCT PRINCIPLE
-- ============================================================
--
-- RukheDao is a completely anonymous public-interest reporting
-- platform.
--
-- There is NO public registration system.
-- There is NO public login system.
-- There is NO public user profile.
-- There is NO reporter identity.
--
-- Public submissions intentionally do NOT store:
--
--   * user_id
--   * reporter_id
--   * email
--   * phone number
--   * IP address
--   * device identifier
--   * fingerprint
--   * tracking identifier
--
-- Internal staff authentication is handled separately through
-- Supabase Auth.
--
-- auth.users is Supabase-managed infrastructure and is NOT part
-- of the RukheDao application database contract.
--
-- ============================================================
-- FROZEN DATABASE CONTRACT
-- ============================================================
--
-- EXACTLY 8 RUKHEDAO APPLICATION TABLES:
--
--   01. categories
--   02. divisions
--   03. districts
--   04. admin_users
--   05. incidents
--   06. incident_revisions
--   07. incident_reports
--   08. moderation_actions
--
-- These 8 tables constitute the permanent RukheDao core schema.
--
-- Future migrations MUST NOT:
--
--   * add another core application table
--   * remove a core table
--   * rename a core table
--   * split a core table
--   * merge a core table
--   * repurpose a core table
--   * change the meaning of core relationships
--
-- Future features must work with this contract.
--
-- If a future requirement is fundamentally incompatible with
-- this database contract, it must be treated as a separately
-- versioned database architecture rather than silently changing
-- this baseline.
--
-- PostgreSQL cannot technically prevent a database owner from
-- executing DDL. "FROZEN" is therefore an explicit project-level
-- database architecture contract.
--
-- Ordinary API roles are also denied CREATE on the public schema.
--
-- ============================================================
-- SUPABASE FREE PLAN COMPATIBILITY
-- ============================================================
--
-- This migration uses standard PostgreSQL/Supabase capabilities.
--
-- It does NOT require:
--
--   * paid compute
--   * PITR
--   * database branching
--   * Realtime
--   * Storage
--   * Edge Functions
--   * paid-only extensions
--
-- The database can therefore be used as the initial RukheDao
-- database on the Supabase Free Plan.
--
-- ============================================================
-- MIGRATION ORDER
-- ============================================================
--
-- 00. Schema protection
-- 01. Extensions
-- 02. Enum types
-- 03. Base helper functions
-- 04. categories
-- 05. divisions
-- 06. districts
-- 07. admin_users
-- 08. incidents
-- 09. incident_revisions
-- 10. incident_reports
-- 11. moderation_actions
-- 12. Immutability functions
-- 13. Incident validation
-- 14. Public ID generation
-- 15. Initial incident revision
-- 16. Staff authorization helpers
-- 17. Staff incident revision
-- 18. Anonymous incident creation
-- 19. Anonymous incident reporting
-- 20. First-admin bootstrap
-- 21. Staff management
-- 22. Staff incident editing
-- 23. Incident status moderation
-- 24. Incident verification moderation
-- 25. Report moderation
-- 26. Row Level Security
-- 27. RLS policies
-- 28. Least-privilege table grants
-- 29. Public-safe views
-- 30. Default privileges
-- 31. Metadata/comments
-- 32. Seed — categories
-- 33. Seed — Bangladesh divisions
-- 34. Seed — Bangladesh districts
-- 35. Final contract marker
--
-- ============================================================


begin;


-- ============================================================
-- 00. SCHEMA PROTECTION
-- ============================================================
--
-- API roles must not be able to create arbitrary objects in
-- the public schema.
--
-- ============================================================

revoke create
on schema public
from public, anon, authenticated;


-- Private helper schema.
--
-- This schema is intentionally not exposed to API roles.

create schema if not exists private;

revoke all
on schema private
from public, anon, authenticated;


-- ============================================================
-- 01. EXTENSIONS
-- ============================================================

create extension if not exists pgcrypto;


-- ============================================================
-- 02. ENUM TYPES
-- ============================================================

create type public.admin_role as enum (
  'admin',
  'moderator'
);


create type public.incident_status as enum (
  'pending',
  'under_review',
  'needs_revision',
  'approved',
  'rejected',
  'archived'
);


create type public.verification_status as enum (
  'reported',
  'partially_verified',
  'verified',
  'disputed'
);


create type public.revision_change_type as enum (
  'submitted',
  'edited',
  'redacted',
  'location_corrected',
  'category_corrected',
  'date_corrected',
  'content_corrected',
  'restored'
);


create type public.incident_report_reason as enum (
  'false_or_misleading',
  'privacy_concern',
  'harmful_content',
  'duplicate',
  'wrong_location',
  'wrong_date',
  'other'
);


create type public.moderation_action_type as enum (
  'incident_edited',
  'incident_redacted',
  'status_changed',
  'verification_changed',
  'published',
  'unpublished',
  'archived',
  'restored',
  'report_reviewed',
  'report_dismissed',
  'report_action_taken'
);


-- ============================================================
-- 03. BASE HELPER FUNCTIONS
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin

  new.updated_at = now();

  return new;

end;
$$;


revoke all
on function public.set_updated_at()
from public, anon, authenticated;


-- ============================================================
-- 04. CATEGORIES
-- ============================================================
--
-- Controlled classification of incidents.
--
-- Categories are public reference data.
--
-- ============================================================

create table public.categories (

  id uuid primary key
    default gen_random_uuid(),

  name text not null,

  slug text not null,

  description text,

  is_active boolean not null
    default true,

  sort_order integer not null
    default 0,

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now(),

  constraint categories_name_length
    check (
      char_length(btrim(name)) between 2 and 100
    ),

  constraint categories_slug_length
    check (
      char_length(slug) between 2 and 100
    ),

  constraint categories_slug_format
    check (
      slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    ),

  constraint categories_description_length
    check (
      description is null
      or char_length(description) <= 1000
    ),

  constraint categories_sort_order_check
    check (sort_order >= 0)
);


create unique index categories_name_unique_idx
on public.categories (
  lower(btrim(name))
);


create unique index categories_slug_unique_idx
on public.categories (slug);


create index categories_public_order_idx
on public.categories (
  sort_order,
  name
)
where is_active;


create trigger categories_set_updated_at
before update
on public.categories
for each row
execute function public.set_updated_at();


-- ============================================================
-- 05. DIVISIONS
-- ============================================================

create table public.divisions (

  id smallint
    generated by default as identity
    primary key,

  name text not null,

  slug text not null,

  sort_order smallint not null,

  is_active boolean not null
    default true,

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now(),

  constraint divisions_name_length
    check (
      char_length(btrim(name)) between 2 and 100
    ),

  constraint divisions_slug_length
    check (
      char_length(slug) between 2 and 100
    ),

  constraint divisions_slug_format
    check (
      slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    ),

  constraint divisions_sort_order_check
    check (sort_order > 0),

  constraint divisions_sort_order_unique
    unique (sort_order)
);


create unique index divisions_name_unique_idx
on public.divisions (
  lower(btrim(name))
);


create unique index divisions_slug_unique_idx
on public.divisions (slug);


create index divisions_public_order_idx
on public.divisions (
  sort_order,
  name
)
where is_active;


create trigger divisions_set_updated_at
before update
on public.divisions
for each row
execute function public.set_updated_at();


-- ============================================================
-- 06. DISTRICTS
-- ============================================================

create table public.districts (

  id smallint
    generated by default as identity
    primary key,

  division_id smallint not null,

  name text not null,

  slug text not null,

  sort_order smallint not null,

  is_active boolean not null
    default true,

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now(),

  constraint districts_division_fk
    foreign key (division_id)
    references public.divisions(id)
    on update cascade
    on delete restrict,

  constraint districts_name_length
    check (
      char_length(btrim(name)) between 2 and 100
    ),

  constraint districts_slug_length
    check (
      char_length(slug) between 2 and 100
    ),

  constraint districts_slug_format
    check (
      slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    ),

  constraint districts_sort_order_check
    check (sort_order > 0),

  constraint districts_division_name_unique
    unique (division_id, name),

  constraint districts_division_slug_unique
    unique (division_id, slug),

  constraint districts_division_sort_unique
    unique (division_id, sort_order),

  constraint districts_id_division_unique
    unique (id, division_id)
);


create index districts_division_idx
on public.districts (division_id);


create index districts_public_order_idx
on public.districts (
  division_id,
  sort_order,
  name
)
where is_active;


create trigger districts_set_updated_at
before update
on public.districts
for each row
execute function public.set_updated_at();


-- ============================================================
-- 07. ADMIN USERS
-- ============================================================
--
-- Internal staff only.
--
-- This is NOT a public user system.
--
-- auth.users is owned by Supabase Auth.
--
-- ============================================================

create table public.admin_users (

  id uuid primary key
    default gen_random_uuid(),

  auth_user_id uuid not null
    unique,

  display_name text not null,

  role public.admin_role not null
    default 'moderator',

  is_active boolean not null
    default true,

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now(),

  constraint admin_users_auth_user_fk
    foreign key (auth_user_id)
    references auth.users(id)
    on update cascade
    on delete restrict,

  constraint admin_users_display_name_length
    check (
      char_length(btrim(display_name)) between 2 and 100
    )
);


create index admin_users_active_role_idx
on public.admin_users (role)
where is_active;


create trigger admin_users_set_updated_at
before update
on public.admin_users
for each row
execute function public.set_updated_at();


-- ============================================================
-- 08. INCIDENTS
-- ============================================================
--
-- Core public-interest records.
--
-- IMPORTANT:
-- No reporter identity exists in this table.
--
-- ============================================================

create table public.incidents (

  id uuid primary key
    default gen_random_uuid(),

  public_id text not null
    unique,

  category_id uuid not null,

  division_id smallint not null,

  district_id smallint not null,

  title text not null,

  description text not null,

  incident_date date not null,

  status public.incident_status not null
    default 'pending',

  verification_status public.verification_status not null
    default 'reported',

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now(),

  published_at timestamptz,

  first_published_at timestamptz,

  archived_at timestamptz,

  constraint incidents_category_fk
    foreign key (category_id)
    references public.categories(id)
    on update cascade
    on delete restrict,

  constraint incidents_division_fk
    foreign key (division_id)
    references public.divisions(id)
    on update cascade
    on delete restrict,

  constraint incidents_district_division_fk
    foreign key (district_id, division_id)
    references public.districts(id, division_id)
    on update cascade
    on delete restrict,

  constraint incidents_title_length
    check (
      char_length(btrim(title)) between 5 and 200
    ),

  constraint incidents_description_length
    check (
      char_length(btrim(description)) between 20 and 10000
    ),

  constraint incidents_publication_consistency
    check (
      (
        status = 'approved'
        and published_at is not null
      )
      or
      (
        status <> 'approved'
        and published_at is null
      )
    ),

  constraint incidents_archive_consistency
    check (
      (
        status = 'archived'
        and archived_at is not null
      )
      or
      (
        status <> 'archived'
        and archived_at is null
      )
    )
);


create index incidents_category_idx
on public.incidents (category_id);


create index incidents_division_idx
on public.incidents (division_id);


create index incidents_district_idx
on public.incidents (district_id);


create index incidents_status_queue_idx
on public.incidents (
  status,
  created_at desc
)
where status in (
  'pending',
  'under_review',
  'needs_revision'
);


create index incidents_public_listing_idx
on public.incidents (
  published_at desc,
  id
)
where status = 'approved'
  and published_at is not null;


create index incidents_verification_public_idx
on public.incidents (
  verification_status,
  published_at desc
)
where status = 'approved'
  and published_at is not null;


create trigger incidents_set_updated_at
before update
on public.incidents
for each row
execute function public.set_updated_at();


-- ============================================================
-- 09. INCIDENT REVISIONS
-- ============================================================
--
-- Immutable historical snapshots of incidents.
--
-- Revision #1 is the original anonymous submission.
--
-- Later revisions are staff changes.
--
-- ============================================================

create table public.incident_revisions (

  id uuid primary key
    default gen_random_uuid(),

  incident_id uuid not null,

  revision_number integer not null,

  title text not null,

  description text not null,

  category_id uuid not null,

  division_id smallint not null,

  district_id smallint not null,

  incident_date date not null,

  changed_by uuid,

  change_type public.revision_change_type not null,

  change_reason text,

  created_at timestamptz not null
    default now(),

  constraint incident_revisions_incident_fk
    foreign key (incident_id)
    references public.incidents(id)
    on update cascade
    on delete restrict,

  constraint incident_revisions_category_fk
    foreign key (category_id)
    references public.categories(id)
    on update cascade
    on delete restrict,

  constraint incident_revisions_district_division_fk
    foreign key (district_id, division_id)
    references public.districts(id, division_id)
    on update cascade
    on delete restrict,

  constraint incident_revisions_changed_by_fk
    foreign key (changed_by)
    references public.admin_users(auth_user_id)
    on update cascade
    on delete restrict,

  constraint incident_revisions_revision_number_check
    check (revision_number >= 1),

  constraint incident_revisions_revision_unique
    unique (incident_id, revision_number),

  constraint incident_revisions_title_length
    check (
      char_length(btrim(title)) between 5 and 200
    ),

  constraint incident_revisions_description_length
    check (
      char_length(btrim(description)) between 20 and 10000
    ),

  constraint incident_revisions_reason_length
    check (
      change_reason is null
      or char_length(change_reason) <= 2000
    ),

  constraint incident_revisions_submission_identity
    check (
      (
        revision_number = 1
        and change_type = 'submitted'
        and changed_by is null
        and change_reason is null
      )
      or
      (
        revision_number > 1
        and changed_by is not null
      )
    )
);


create index incident_revisions_incident_idx
on public.incident_revisions (
  incident_id,
  revision_number desc
);


create index incident_revisions_changed_by_idx
on public.incident_revisions (
  changed_by,
  created_at desc
)
where changed_by is not null;


-- ============================================================
-- 10. INCIDENT REPORTS
-- ============================================================
--
-- Anonymous reports about published incidents.
--
-- No reporter identity is stored.
--
-- ============================================================

create table public.incident_reports (

  id uuid primary key
    default gen_random_uuid(),

  incident_id uuid not null,

  reason public.incident_report_reason not null,

  description text,

  created_at timestamptz not null
    default now(),

  constraint incident_reports_incident_fk
    foreign key (incident_id)
    references public.incidents(id)
    on update cascade
    on delete restrict,

  constraint incident_reports_description_length
    check (
      description is null
      or char_length(btrim(description)) between 5 and 2000
    )
);


create index incident_reports_incident_idx
on public.incident_reports (
  incident_id,
  created_at desc
);


create index incident_reports_created_at_idx
on public.incident_reports (
  created_at desc
);


-- ============================================================
-- 11. MODERATION ACTIONS
-- ============================================================
--
-- Immutable staff audit trail.
--
-- ============================================================

create table public.moderation_actions (

  id uuid primary key
    default gen_random_uuid(),

  incident_id uuid not null,

  incident_report_id uuid,

  actor_id uuid not null,

  action public.moderation_action_type not null,

  from_status public.incident_status,

  to_status public.incident_status,

  revision_id uuid,

  reason text,

  metadata jsonb not null
    default '{}'::jsonb,

  created_at timestamptz not null
    default now(),

  constraint moderation_actions_incident_fk
    foreign key (incident_id)
    references public.incidents(id)
    on update cascade
    on delete restrict,

  constraint moderation_actions_report_fk
    foreign key (incident_report_id)
    references public.incident_reports(id)
    on update cascade
    on delete restrict,

  constraint moderation_actions_actor_fk
    foreign key (actor_id)
    references public.admin_users(auth_user_id)
    on update cascade
    on delete restrict,

  constraint moderation_actions_revision_fk
    foreign key (revision_id)
    references public.incident_revisions(id)
    on update cascade
    on delete restrict,

  constraint moderation_actions_reason_length
    check (
      reason is null
      or char_length(btrim(reason)) <= 2000
    ),

  constraint moderation_actions_metadata_object
    check (
      jsonb_typeof(metadata) = 'object'
    ),

  constraint moderation_actions_status_pair
    check (
      (
        action = 'status_changed'
        and from_status is not null
        and to_status is not null
      )
      or
      (
        action <> 'status_changed'
        and from_status is null
        and to_status is null
      )
    )
);


create index moderation_actions_incident_idx
on public.moderation_actions (
  incident_id,
  created_at desc
);


create index moderation_actions_report_idx
on public.moderation_actions (
  incident_report_id,
  created_at desc
)
where incident_report_id is not null;


create index moderation_actions_actor_idx
on public.moderation_actions (
  actor_id,
  created_at desc
);


-- ============================================================
-- 12. IMMUTABILITY FUNCTIONS
-- ============================================================

create or replace function private.prevent_revision_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin

  raise exception
    'Incident revisions are immutable';

end;
$$;


create or replace function private.prevent_report_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin

  raise exception
    'Incident reports are immutable';

end;
$$;


create or replace function private.prevent_moderation_action_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin

  raise exception
    'Moderation actions are immutable';

end;
$$;


revoke all
on function private.prevent_revision_mutation()
from public, anon, authenticated;


revoke all
on function private.prevent_report_mutation()
from public, anon, authenticated;


revoke all
on function private.prevent_moderation_action_mutation()
from public, anon, authenticated;


create trigger incident_revisions_immutable
before update or delete
on public.incident_revisions
for each row
execute function private.prevent_revision_mutation();


create trigger incident_reports_immutable
before update or delete
on public.incident_reports
for each row
execute function private.prevent_report_mutation();


create trigger moderation_actions_immutable
before update or delete
on public.moderation_actions
for each row
execute function private.prevent_moderation_action_mutation();


-- ============================================================
-- 13. INCIDENT VALIDATION
-- ============================================================

create or replace function private.validate_incident_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin

  if new.incident_date >
     (current_timestamp at time zone 'Asia/Dhaka')::date then

    raise exception
      'Incident date cannot be in the future';

  end if;


  if not exists (
    select 1
    from public.categories c
    where c.id = new.category_id
      and c.is_active = true
  ) then

    raise exception
      'Category is not active';

  end if;


  if not exists (
    select 1
    from public.divisions d
    where d.id = new.division_id
      and d.is_active = true
  ) then

    raise exception
      'Division is not active';

  end if;


  if not exists (
    select 1
    from public.districts d
    where d.id = new.district_id
      and d.division_id = new.division_id
      and d.is_active = true
  ) then

    raise exception
      'District is not active or does not belong to division';

  end if;


  return new;

end;
$$;


revoke all
on function private.validate_incident_insert()
from public, anon, authenticated;


create trigger incidents_validate_insert
before insert
on public.incidents
for each row
execute function private.validate_incident_insert();


-- ============================================================
-- 14. PUBLIC ID GENERATION
-- ============================================================

create or replace function private.generate_incident_public_id()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin

  if new.public_id is null
     or btrim(new.public_id) = '' then

    new.public_id :=
      'RK-' ||
      upper(
        encode(
          public.gen_random_bytes(6),
          'hex'
        )
      );

  end if;

  return new;

end;
$$;


revoke all
on function private.generate_incident_public_id()
from public, anon, authenticated;


create trigger incidents_generate_public_id
before insert
on public.incidents
for each row
execute function private.generate_incident_public_id();


-- ============================================================
-- 15. INITIAL INCIDENT REVISION
-- ============================================================

create or replace function private.create_initial_incident_revision()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin

  insert into public.incident_revisions (
    incident_id,
    revision_number,
    title,
    description,
    category_id,
    division_id,
    district_id,
    incident_date,
    changed_by,
    change_type,
    change_reason
  )
  values (
    new.id,
    1,
    new.title,
    new.description,
    new.category_id,
    new.division_id,
    new.district_id,
    new.incident_date,
    null,
    'submitted',
    null
  );

  return new;

end;
$$;


revoke all
on function private.create_initial_incident_revision()
from public, anon, authenticated;


create trigger incidents_create_initial_revision
after insert
on public.incidents
for each row
execute function private.create_initial_incident_revision();


-- ============================================================
-- 16. STAFF AUTHORIZATION HELPERS
-- ============================================================

create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.auth_user_id = (select auth.uid())
      and au.is_active = true
  );
$$;


create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.auth_user_id = (select auth.uid())
      and au.is_active = true
      and au.role = 'admin'
  );
$$;


create or replace function private.current_staff_auth_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select au.auth_user_id
  from public.admin_users au
  where au.auth_user_id = (select auth.uid())
    and au.is_active = true
  limit 1;
$$;


revoke all
on function private.is_staff()
from public, anon, authenticated;


revoke all
on function private.is_admin()
from public, anon, authenticated;


revoke all
on function private.current_staff_auth_id()
from public, anon, authenticated;


grant execute
on function private.is_staff()
to authenticated;


grant execute
on function private.is_admin()
to authenticated;


grant execute
on function private.current_staff_auth_id()
to authenticated;


-- ============================================================
-- 17. STAFF INCIDENT REVISION
-- ============================================================

create or replace function private.create_staff_incident_revision()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare

  staff_auth_id uuid;

  next_revision integer;

  change_type_value public.revision_change_type;

begin

  staff_auth_id :=
    private.current_staff_auth_id();


  if staff_auth_id is null then

    raise exception
      'Active staff identity required for incident edits';

  end if;


  if
    new.title is not distinct from old.title
    and new.description is not distinct from old.description
    and new.category_id is not distinct from old.category_id
    and new.division_id is not distinct from old.division_id
    and new.district_id is not distinct from old.district_id
    and new.incident_date is not distinct from old.incident_date
  then

    return new;

  end if;


  perform pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      new.id::text,
      0
    )
  );


  select
    coalesce(
      max(ir.revision_number),
      0
    ) + 1

  into next_revision

  from public.incident_revisions ir

  where ir.incident_id = new.id;


  if new.category_id is distinct from old.category_id then

    change_type_value :=
      'category_corrected';


  elsif
    new.division_id is distinct from old.division_id
    or new.district_id is distinct from old.district_id
  then

    change_type_value :=
      'location_corrected';


  elsif new.incident_date is distinct from old.incident_date then

    change_type_value :=
      'date_corrected';


  elsif new.description is distinct from old.description then

    change_type_value :=
      'content_corrected';


  else

    change_type_value :=
      'edited';

  end if;


  insert into public.incident_revisions (
    incident_id,
    revision_number,
    title,
    description,
    category_id,
    division_id,
    district_id,
    incident_date,
    changed_by,
    change_type,
    change_reason
  )
  values (
    new.id,
    next_revision,
    new.title,
    new.description,
    new.category_id,
    new.division_id,
    new.district_id,
    new.incident_date,
    staff_auth_id,
    change_type_value,
    nullif(
      current_setting(
        'rukhedao.edit_reason',
        true
      ),
      ''
    )
  );


  return new;

end;
$$;


revoke all
on function private.create_staff_incident_revision()
from public, anon, authenticated;


create trigger incidents_create_staff_revision
after update
on public.incidents
for each row
execute function private.create_staff_incident_revision();


-- ============================================================
-- 18. ANONYMOUS INCIDENT CREATION
-- ============================================================

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

  if char_length(btrim(p_title))
     not between 5 and 200 then

    raise exception
      'Invalid incident title';

  end if;


  if char_length(btrim(p_description))
     not between 20 and 10000 then

    raise exception
      'Invalid incident description';

  end if;


  if p_incident_date >
     (current_timestamp at time zone 'Asia/Dhaka')::date then

    raise exception
      'Incident date cannot be in the future';

  end if;


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
    '',
    p_category_id,
    p_division_id,
    p_district_id,
    btrim(p_title),
    btrim(p_description),
    p_incident_date
  )
  returning public_id
  into new_public_id;


  return new_public_id;

end;
$$;


revoke all
on function public.create_anonymous_incident(
  text,
  text,
  uuid,
  smallint,
  smallint,
  date
)
from public, authenticated;


grant execute
on function public.create_anonymous_incident(
  text,
  text,
  uuid,
  smallint,
  smallint,
  date
)
to anon;


-- ============================================================
-- 19. ANONYMOUS INCIDENT REPORT
-- ============================================================

create or replace function public.submit_incident_report(
  p_incident_public_id text,
  p_reason public.incident_report_reason,
  p_description text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare

  target_incident_id uuid;

  new_report_id uuid;

begin

  select i.id
  into target_incident_id

  from public.incidents i

  where i.public_id = btrim(p_incident_public_id)

    and i.status = 'approved'

    and i.published_at is not null

  limit 1;


  if target_incident_id is null then

    raise exception
      'Incident not found';

  end if;


  if p_description is not null
     and char_length(btrim(p_description))
         not between 5 and 2000 then

    raise exception
      'Invalid report description';

  end if;


  insert into public.incident_reports (
    incident_id,
    reason,
    description
  )
  values (
    target_incident_id,
    p_reason,
    case
      when p_description is null
      then null
      else btrim(p_description)
    end
  )
  returning id
  into new_report_id;


  return new_report_id;

end;
$$;


revoke all
on function public.submit_incident_report(
  text,
  public.incident_report_reason,
  text
)
from public, authenticated;


grant execute
on function public.submit_incident_report(
  text,
  public.incident_report_reason,
  text
)
to anon;


-- ============================================================
-- 20. FIRST ADMIN BOOTSTRAP
-- ============================================================

create or replace function public.bootstrap_first_admin(
  p_auth_user_id uuid,
  p_display_name text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare

  new_id uuid;

begin

  perform pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'rukhedao:first-admin',
      0
    )
  );


  if exists (
    select 1
    from public.admin_users
    where role = 'admin'
      and is_active = true
  ) then

    raise exception
      'First-admin bootstrap is already completed';

  end if;


  if not exists (
    select 1
    from auth.users
    where id = p_auth_user_id
  ) then

    raise exception
      'Auth user does not exist';

  end if;


  if char_length(btrim(p_display_name))
     not between 2 and 100 then

    raise exception
      'Invalid display name';

  end if;


  insert into public.admin_users (
    auth_user_id,
    display_name,
    role,
    is_active
  )
  values (
    p_auth_user_id,
    btrim(p_display_name),
    'admin',
    true
  )
  returning id
  into new_id;


  return new_id;

end;
$$;


revoke all
on function public.bootstrap_first_admin(
  uuid,
  text
)
from public, anon, authenticated;


-- Intentionally no client grant.
-- Execute this from a trusted environment only.


-- ============================================================
-- 21. STAFF MANAGEMENT
-- ============================================================

create or replace function public.admin_create_staff(
  p_auth_user_id uuid,
  p_display_name text,
  p_role public.admin_role
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare

  new_id uuid;

begin

  if not private.is_admin() then

    raise exception
      'Admin privileges required';

  end if;


  if not exists (
    select 1
    from auth.users
    where id = p_auth_user_id
  ) then

    raise exception
      'Auth user does not exist';

  end if;


  if char_length(btrim(p_display_name))
     not between 2 and 100 then

    raise exception
      'Invalid display name';

  end if;


  insert into public.admin_users (
    auth_user_id,
    display_name,
    role,
    is_active
  )
  values (
    p_auth_user_id,
    btrim(p_display_name),
    p_role,
    true
  )
  returning id
  into new_id;


  return new_id;

end;
$$;


create or replace function public.admin_deactivate_staff(
  p_auth_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare

  target_role public.admin_role;

  active_admins integer;

begin

  if not private.is_admin() then

    raise exception
      'Admin privileges required';

  end if;


  select role
  into target_role

  from public.admin_users

  where auth_user_id = p_auth_user_id
    and is_active = true;


  if target_role is null then

    raise exception
      'Active staff member not found';

  end if;


  if target_role = 'admin' then

    select count(*)
    into active_admins

    from public.admin_users

    where role = 'admin'
      and is_active = true;


    if active_admins <= 1 then

      raise exception
        'Cannot deactivate the last active admin';

    end if;

  end if;


  update public.admin_users

  set is_active = false

  where auth_user_id = p_auth_user_id;

end;
$$;


create or replace function public.admin_change_staff_role(
  p_auth_user_id uuid,
  p_role public.admin_role
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare

  old_role public.admin_role;

  active_admins integer;

begin

  if not private.is_admin() then

    raise exception
      'Admin privileges required';

  end if;


  select role
  into old_role

  from public.admin_users

  where auth_user_id = p_auth_user_id
    and is_active = true;


  if old_role is null then

    raise exception
      'Active staff member not found';

  end if;


  if
    old_role = 'admin'
    and p_role = 'moderator'
  then

    select count(*)
    into active_admins

    from public.admin_users

    where role = 'admin'
      and is_active = true;


    if active_admins <= 1 then

      raise exception
        'Cannot demote the last active admin';

    end if;

  end if;


  update public.admin_users

  set role = p_role

  where auth_user_id = p_auth_user_id;

end;
$$;


revoke all
on function public.admin_create_staff(
  uuid,
  text,
  public.admin_role
)
from public, anon, authenticated;


revoke all
on function public.admin_deactivate_staff(uuid)
from public, anon, authenticated;


revoke all
on function public.admin_change_staff_role(
  uuid,
  public.admin_role
)
from public, anon, authenticated;


grant execute
on function public.admin_create_staff(
  uuid,
  text,
  public.admin_role
)
to authenticated;


grant execute
on function public.admin_deactivate_staff(uuid)
to authenticated;


grant execute
on function public.admin_change_staff_role(
  uuid,
  public.admin_role
)
to authenticated;


-- ============================================================
-- 22. STAFF INCIDENT EDIT
-- ============================================================

create or replace function public.edit_incident(
  p_public_id text,
  p_title text,
  p_description text,
  p_category_id uuid,
  p_division_id smallint,
  p_district_id smallint,
  p_incident_date date,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare

  target_id uuid;

  latest_revision_id uuid;

begin

  if not private.is_staff() then

    raise exception
      'Staff privileges required';

  end if;


  if char_length(btrim(p_title))
     not between 5 and 200 then

    raise exception
      'Invalid incident title';

  end if;


  if char_length(btrim(p_description))
     not between 20 and 10000 then

    raise exception
      'Invalid incident description';

  end if;


  if char_length(btrim(p_reason))
     not between 3 and 2000 then

    raise exception
      'Edit reason is required';

  end if;


  if p_incident_date >
     (current_timestamp at time zone 'Asia/Dhaka')::date then

    raise exception
      'Incident date cannot be in the future';

  end if;


  select i.id
  into target_id

  from public.incidents i

  where i.public_id = btrim(p_public_id)

  for update;


  if target_id is null then

    raise exception
      'Incident not found';

  end if;


  if not exists (
    select 1
    from public.categories c
    where c.id = p_category_id
      and c.is_active = true
  ) then

    raise exception
      'Category is not active';

  end if;


  if not exists (
    select 1
    from public.divisions d
    where d.id = p_division_id
      and d.is_active = true
  ) then

    raise exception
      'Division is not active';

  end if;


  if not exists (
    select 1
    from public.districts d
    where d.id = p_district_id
      and d.division_id = p_division_id
      and d.is_active = true
  ) then

    raise exception
      'District is not active or does not belong to division';

  end if;


  perform pg_catalog.set_config(
    'rukhedao.edit_reason',
    btrim(p_reason),
    true
  );


  update public.incidents

  set
    title = btrim(p_title),
    description = btrim(p_description),
    category_id = p_category_id,
    division_id = p_division_id,
    district_id = p_district_id,
    incident_date = p_incident_date

  where id = target_id;


  select ir.id
  into latest_revision_id

  from public.incident_revisions ir

  where ir.incident_id = target_id

  order by ir.revision_number desc

  limit 1;


  insert into public.moderation_actions (
    incident_id,
    actor_id,
    action,
    revision_id,
    reason
  )
  values (
    target_id,
    private.current_staff_auth_id(),
    'incident_edited',
    latest_revision_id,
    btrim(p_reason)
  );

end;
$$;


revoke all
on function public.edit_incident(
  text,
  text,
  text,
  uuid,
  smallint,
  smallint,
  date,
  text
)
from public, anon, authenticated;


grant execute
on function public.edit_incident(
  text,
  text,
  text,
  uuid,
  smallint,
  smallint,
  date,
  text
)
to authenticated;


-- ============================================================
-- 23. INCIDENT STATUS MODERATION
-- ============================================================

create or replace function public.moderate_incident_status(
  p_public_id text,
  p_to_status public.incident_status,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare

  current_id uuid;

  old_status public.incident_status;

  old_published_at timestamptz;

  old_first_published_at timestamptz;

  old_archived_at timestamptz;

  new_published_at timestamptz;

  new_first_published_at timestamptz;

  new_archived_at timestamptz;

begin

  if not private.is_staff() then

    raise exception
      'Staff privileges required';

  end if;


  select
    id,
    status,
    published_at,
    first_published_at,
    archived_at

  into
    current_id,
    old_status,
    old_published_at,
    old_first_published_at,
    old_archived_at

  from public.incidents

  where public_id = btrim(p_public_id)

  for update;


  if current_id is null then

    raise exception
      'Incident not found';

  end if;


  if old_status = p_to_status then

    raise exception
      'Incident is already in requested status';

  end if;


  if not (
    (
      old_status = 'pending'
      and p_to_status in (
        'under_review',
        'rejected'
      )
    )
    or
    (
      old_status = 'under_review'
      and p_to_status in (
        'needs_revision',
        'approved',
        'rejected'
      )
    )
    or
    (
      old_status = 'needs_revision'
      and p_to_status in (
        'under_review',
        'rejected'
      )
    )
    or
    (
      old_status = 'approved'
      and p_to_status = 'archived'
    )
    or
    (
      old_status = 'archived'
      and p_to_status = 'approved'
    )
  ) then

    raise exception
      'Invalid incident status transition: % -> %',
      old_status,
      p_to_status;

  end if;


  if p_reason is not null
     and char_length(btrim(p_reason)) > 2000 then

    raise exception
      'Reason too long';

  end if;


  if p_to_status = 'approved' then

    new_published_at :=
      coalesce(old_published_at, now());

    new_first_published_at :=
      coalesce(old_first_published_at, now());

    new_archived_at := null;


  elsif p_to_status = 'archived' then

    new_published_at := null;

    new_archived_at := now();

    new_first_published_at :=
      old_first_published_at;


  else

    new_published_at := null;

    new_archived_at := null;

    new_first_published_at :=
      old_first_published_at;

  end if;


  update public.incidents

  set
    status = p_to_status,
    published_at = new_published_at,
    first_published_at = new_first_published_at,
    archived_at = new_archived_at

  where id = current_id;


  insert into public.moderation_actions (
    incident_id,
    actor_id,
    action,
    from_status,
    to_status,
    reason
  )
  values (
    current_id,
    private.current_staff_auth_id(),
    'status_changed',
    old_status,
    p_to_status,
    case
      when p_reason is null
      then null
      else btrim(p_reason)
    end
  );


  if p_to_status = 'approved' then

    insert into public.moderation_actions (
      incident_id,
      actor_id,
      action,
      reason
    )
    values (
      current_id,
      private.current_staff_auth_id(),
      'published',
      case
        when p_reason is null
        then null
        else btrim(p_reason)
      end
    );


  elsif old_status = 'approved' then

    insert into public.moderation_actions (
      incident_id,
      actor_id,
      action,
      reason
    )
    values (
      current_id,
      private.current_staff_auth_id(),
      'unpublished',
      case
        when p_reason is null
        then null
        else btrim(p_reason)
      end
    );

  end if;


  if p_to_status = 'archived' then

    insert into public.moderation_actions (
      incident_id,
      actor_id,
      action,
      reason
    )
    values (
      current_id,
      private.current_staff_auth_id(),
      'archived',
      case
        when p_reason is null
        then null
        else btrim(p_reason)
      end
    );


  elsif
    old_status = 'archived'
    and p_to_status = 'approved'
  then

    insert into public.moderation_actions (
      incident_id,
      actor_id,
      action,
      reason
    )
    values (
      current_id,
      private.current_staff_auth_id(),
      'restored',
      case
        when p_reason is null
        then null
        else btrim(p_reason)
      end
    );

  end if;

end;
$$;


revoke all
on function public.moderate_incident_status(
  text,
  public.incident_status,
  text
)
from public, anon, authenticated;


grant execute
on function public.moderate_incident_status(
  text,
  public.incident_status,
  text
)
to authenticated;


-- ============================================================
-- 24. INCIDENT VERIFICATION MODERATION
-- ============================================================

create or replace function public.moderate_incident_verification(
  p_public_id text,
  p_to_status public.verification_status,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare

  current_id uuid;

  old_value public.verification_status;

begin

  if not private.is_staff() then

    raise exception
      'Staff privileges required';

  end if;


  select
    id,
    verification_status

  into
    current_id,
    old_value

  from public.incidents

  where public_id = btrim(p_public_id)

  for update;


  if current_id is null then

    raise exception
      'Incident not found';

  end if;


  if old_value = p_to_status then

    raise exception
      'Verification status is unchanged';

  end if;


  if p_reason is not null
     and char_length(btrim(p_reason)) > 2000 then

    raise exception
      'Reason too long';

  end if;


  update public.incidents

  set verification_status = p_to_status

  where id = current_id;


  insert into public.moderation_actions (
    incident_id,
    actor_id,
    action,
    reason,
    metadata
  )
  values (
    current_id,
    private.current_staff_auth_id(),
    'verification_changed',
    case
      when p_reason is null
      then null
      else btrim(p_reason)
    end,
    jsonb_build_object(
      'from',
      old_value,
      'to',
      p_to_status
    )
  );

end;
$$;


revoke all
on function public.moderate_incident_verification(
  text,
  public.verification_status,
  text
)
from public, anon, authenticated;


grant execute
on function public.moderate_incident_verification(
  text,
  public.verification_status,
  text
)
to authenticated;


-- ============================================================
-- 25. REPORT MODERATION
-- ============================================================

create or replace function public.moderate_incident_report(
  p_report_id uuid,
  p_action public.moderation_action_type,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare

  target_incident_id uuid;

begin

  if not private.is_staff() then

    raise exception
      'Staff privileges required';

  end if;


  if p_action not in (
    'report_reviewed',
    'report_dismissed',
    'report_action_taken'
  ) then

    raise exception
      'Invalid report moderation action';

  end if;


  if p_reason is not null
     and char_length(btrim(p_reason)) > 2000 then

    raise exception
      'Reason too long';

  end if;


  select incident_id
  into target_incident_id

  from public.incident_reports

  where id = p_report_id;


  if target_incident_id is null then

    raise exception
      'Report not found';

  end if;


  insert into public.moderation_actions (
    incident_id,
    incident_report_id,
    actor_id,
    action,
    reason
  )
  values (
    target_incident_id,
    p_report_id,
    private.current_staff_auth_id(),
    p_action,
    case
      when p_reason is null
      then null
      else btrim(p_reason)
    end
  );

end;
$$;


revoke all
on function public.moderate_incident_report(
  uuid,
  public.moderation_action_type,
  text
)
from public, anon, authenticated;


grant execute
on function public.moderate_incident_report(
  uuid,
  public.moderation_action_type,
  text
)
to authenticated;


-- ============================================================
-- 26. ROW LEVEL SECURITY
-- ============================================================

alter table public.categories
enable row level security;


alter table public.divisions
enable row level security;


alter table public.districts
enable row level security;


alter table public.admin_users
enable row level security;


alter table public.incidents
enable row level security;


alter table public.incident_revisions
enable row level security;


alter table public.incident_reports
enable row level security;


alter table public.moderation_actions
enable row level security;


-- ============================================================
-- 27. RLS POLICIES
-- ============================================================

create policy categories_public_select
on public.categories
for select
to anon
using (
  is_active
);


create policy categories_staff_select
on public.categories
for select
to authenticated
using (
  (select private.is_staff())
);


create policy divisions_public_select
on public.divisions
for select
to anon
using (
  is_active
);


create policy divisions_staff_select
on public.divisions
for select
to authenticated
using (
  (select private.is_staff())
);


create policy districts_public_select
on public.districts
for select
to anon
using (
  is_active
);


create policy districts_staff_select
on public.districts
for select
to authenticated
using (
  (select private.is_staff())
);


create policy admin_users_staff_select
on public.admin_users
for select
to authenticated
using (
  auth_user_id = (select auth.uid())
  or
  (select private.is_admin())
);


create policy incidents_public_select
on public.incidents
for select
to anon
using (
  status = 'approved'
  and published_at is not null
);


create policy incidents_staff_select
on public.incidents
for select
to authenticated
using (
  (select private.is_staff())
);


create policy incident_revisions_staff_select
on public.incident_revisions
for select
to authenticated
using (
  (select private.is_staff())
);


create policy incident_reports_staff_select
on public.incident_reports
for select
to authenticated
using (
  (select private.is_staff())
);


create policy moderation_actions_staff_select
on public.moderation_actions
for select
to authenticated
using (
  (select private.is_staff())
);


-- ============================================================
-- 28. LEAST-PRIVILEGE TABLE GRANTS
-- ============================================================
--
-- RLS determines row visibility.
-- GRANT/REVOKE determines object access.
--
-- Public:
--   Read only approved/public data.
--   No direct writes.
--
-- Staff:
--   Read through RLS.
--   Writes through controlled RPCs.
--
-- ============================================================

revoke all
on public.categories,
   public.divisions,
   public.districts,
   public.admin_users,
   public.incidents,
   public.incident_revisions,
   public.incident_reports,
   public.moderation_actions
from anon, authenticated;


-- Public clients use security-invoker views. PostgreSQL therefore requires
-- SELECT privilege on the underlying columns referenced by those views.
-- Grant only the minimum columns needed by the public views.

grant select (
  id,
  name,
  slug,
  description,
  is_active,
  sort_order
)
on public.categories
to anon;

grant select (
  id,
  name,
  slug,
  is_active,
  sort_order
)
on public.divisions
to anon;

grant select (
  id,
  division_id,
  name,
  slug,
  is_active,
  sort_order
)
on public.districts
to anon;

grant select (
  id,
  public_id,
  category_id,
  division_id,
  district_id,
  title,
  description,
  incident_date,
  status,
  verification_status,
  published_at
)
on public.incidents
to anon;


-- Staff clients may read raw tables, subject to staff-only RLS policies.
grant select
on public.admin_users,
   public.categories,
   public.divisions,
   public.districts,
   public.incidents,
   public.incident_revisions,
   public.incident_reports,
   public.moderation_actions
to authenticated;


-- No direct INSERT.
-- No direct UPDATE.
-- No direct DELETE.
--
-- All sensitive writes occur through controlled functions.
--
-- Public anon clients receive read access only through the views below.
-- Authenticated raw-table access is restricted by staff-only RLS policies.


-- ============================================================
-- 29. PUBLIC-SAFE VIEWS
-- ============================================================

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


revoke all
on public.public_incidents,
   public.public_categories,
   public.public_divisions,
   public.public_districts
from anon, authenticated;


grant select
on public.public_incidents,
   public.public_categories,
   public.public_divisions,
   public.public_districts
to anon, authenticated;


-- ============================================================
-- 30. DEFAULT PRIVILEGES
-- ============================================================

alter default privileges
in schema public
revoke execute
on functions
from public, anon, authenticated;


alter default privileges
in schema public
revoke all
on tables
from anon, authenticated;


alter default privileges
in schema public
revoke all
on sequences
from anon, authenticated;


-- ============================================================
-- 31. DATABASE METADATA
-- ============================================================

comment on schema public is
'RukheDao FROZEN DATABASE CONTRACT v1.0.0. Exactly 8 application tables. Anonymous public reporting. Supabase Free Plan compatible.';


comment on schema private is
'RukheDao internal database helper functions. Not exposed to API roles.';


comment on table public.categories is
'RukheDao FROZEN CORE TABLE #1. Public incident classification.';


comment on table public.divisions is
'RukheDao FROZEN CORE TABLE #2. Bangladesh administrative divisions.';


comment on table public.districts is
'RukheDao FROZEN CORE TABLE #3. Bangladesh districts belonging to divisions.';


comment on table public.admin_users is
'RukheDao FROZEN CORE TABLE #4. Internal staff authorization only. Not a public user system.';


comment on table public.incidents is
'RukheDao FROZEN CORE TABLE #5. Anonymous public-interest incidents. No reporter identity is stored.';


comment on table public.incident_revisions is
'RukheDao FROZEN CORE TABLE #6. Immutable incident revision history.';


comment on table public.incident_reports is
'RukheDao FROZEN CORE TABLE #7. Anonymous immutable reports about published incidents.';


comment on table public.moderation_actions is
'RukheDao FROZEN CORE TABLE #8. Immutable internal moderation audit trail.';


comment on function public.create_anonymous_incident(
  text,
  text,
  uuid,
  smallint,
  smallint,
  date
)
is
'Anonymous public incident submission RPC. No reporter identity is accepted or stored.';


comment on function public.submit_incident_report(
  text,
  public.incident_report_reason,
  text
)
is
'Anonymous public incident-reporting RPC. No reporter identity is accepted or stored.';


comment on function public.bootstrap_first_admin(
  uuid,
  text
)
is
'One-time trusted-environment bootstrap for the first RukheDao administrator.';


-- ============================================================
-- 32. SEED — CATEGORIES
-- ============================================================

insert into public.categories (
  name,
  slug,
  description,
  sort_order
)
values

(
  'দুর্নীতি ও ঘুষ',
  'corruption-bribery',
  'দুর্নীতি, ঘুষ ও অনৈতিক সুবিধা সংক্রান্ত ঘটনা',
  1
),

(
  'প্রতারণা',
  'fraud',
  'প্রতারণা ও জালিয়াতি সংক্রান্ত ঘটনা',
  2
),

(
  'চাঁদাবাজি',
  'extortion',
  'চাঁদাবাজি বা জোরপূর্বক সুবিধা আদায়',
  3
),

(
  'হয়রানি',
  'harassment',
  'হয়রানি ও অনাকাঙ্ক্ষিত আচরণ',
  4
),

(
  'সহিংসতা',
  'violence',
  'সহিংসতা ও জননিরাপত্তা-সম্পর্কিত ঘটনা',
  5
),

(
  'নির্যাতন ও শোষণ',
  'abuse-exploitation',
  'নির্যাতন, শোষণ ও জবরদস্তি',
  6
),

(
  'সাইবার অপরাধ',
  'cybercrime',
  'অনলাইন ও ডিজিটাল অপরাধ',
  7
),

(
  'সরকারি সেবায় অনিয়ম',
  'public-service-irregularity',
  'সরকারি সেবা ও প্রশাসনিক অনিয়ম',
  8
),

(
  'স্বাস্থ্যসেবা',
  'healthcare',
  'স্বাস্থ্যসেবা সংক্রান্ত জনস্বার্থের অভিযোগ',
  9
),

(
  'শিক্ষা',
  'education',
  'শিক্ষা প্রতিষ্ঠান ও শিক্ষা ব্যবস্থার অনিয়ম',
  10
),

(
  'পরিবেশ',
  'environment',
  'পরিবেশ দূষণ ও পরিবেশগত অনিয়ম',
  11
),

(
  'জননিরাপত্তা',
  'public-safety',
  'জননিরাপত্তা ও ঝুঁকি সংক্রান্ত ঘটনা',
  12
),

(
  'ভোক্তা অধিকার',
  'consumer-rights',
  'পণ্য ও সেবা সংক্রান্ত ভোক্তা অধিকার সমস্যা',
  13
),

(
  'ভূমি ও সম্পত্তি',
  'land-property',
  'ভূমি ও সম্পত্তি সংক্রান্ত জনস্বার্থের ঘটনা',
  14
),

(
  'কর্মক্ষেত্রের অনিয়ম',
  'workplace-irregularity',
  'কর্মক্ষেত্রের অনিয়ম ও অধিকার সংক্রান্ত ঘটনা',
  15
),

(
  'অন্যান্য জনস্বার্থের বিষয়',
  'other-public-interest',
  'অন্যান্য জনস্বার্থের ঘটনা',
  16
);


-- ============================================================
-- 33. SEED — BANGLADESH DIVISIONS
-- ============================================================

insert into public.divisions (
  id,
  name,
  slug,
  sort_order
)
overriding system value
values

(1, 'ঢাকা', 'dhaka', 1),
(2, 'চট্টগ্রাম', 'chattogram', 2),
(3, 'রাজশাহী', 'rajshahi', 3),
(4, 'খুলনা', 'khulna', 4),
(5, 'বরিশাল', 'barishal', 5),
(6, 'সিলেট', 'sylhet', 6),
(7, 'রংপুর', 'rangpur', 7),
(8, 'ময়মনসিংহ', 'mymensingh', 8);


select setval(
  pg_catalog.pg_get_serial_sequence(
    'public.divisions',
    'id'
  ),
  8,
  true
);


-- ============================================================
-- 34. SEED — BANGLADESH DISTRICTS
-- ============================================================

insert into public.districts (
  division_id,
  name,
  slug,
  sort_order
)
values

-- DHAKA
(1, 'ঢাকা', 'dhaka', 1),
(1, 'ফরিদপুর', 'faridpur', 2),
(1, 'গাজীপুর', 'gazipur', 3),
(1, 'গোপালগঞ্জ', 'gopalganj', 4),
(1, 'কিশোরগঞ্জ', 'kishoreganj', 5),
(1, 'মাদারীপুর', 'madaripur', 6),
(1, 'মানিকগঞ্জ', 'manikganj', 7),
(1, 'মুন্সিগঞ্জ', 'munshiganj', 8),
(1, 'নারায়ণগঞ্জ', 'narayanganj', 9),
(1, 'নরসিংদী', 'narsingdi', 10),
(1, 'রাজবাড়ী', 'rajbari', 11),
(1, 'শরীয়তপুর', 'shariatpur', 12),
(1, 'টাঙ্গাইল', 'tangail', 13),

-- CHATTOGRAM
(2, 'বান্দরবান', 'bandarban', 1),
(2, 'ব্রাহ্মণবাড়িয়া', 'brahmanbaria', 2),
(2, 'চাঁদপুর', 'chandpur', 3),
(2, 'চট্টগ্রাম', 'chattogram', 4),
(2, 'কুমিল্লা', 'cumilla', 5),
(2, 'কক্সবাজার', 'coxsbazar', 6),
(2, 'ফেনী', 'feni', 7),
(2, 'খাগড়াছড়ি', 'khagrachhari', 8),
(2, 'লক্ষ্মীপুর', 'lakshmipur', 9),
(2, 'নোয়াখালী', 'noakhali', 10),
(2, 'রাঙ্গামাটি', 'rangamati', 11),

-- RAJSHAHI
(3, 'বগুড়া', 'bogura', 1),
(3, 'জয়পুরহাট', 'joypurhat', 2),
(3, 'নওগাঁ', 'naogaon', 3),
(3, 'নাটোর', 'natore', 4),
(3, 'চাঁপাইনবাবগঞ্জ', 'chapainawabganj', 5),
(3, 'পাবনা', 'pabna', 6),
(3, 'রাজশাহী', 'rajshahi', 7),
(3, 'সিরাজগঞ্জ', 'sirajganj', 8),

-- KHULNA
(4, 'বাগেরহাট', 'bagerhat', 1),
(4, 'চুয়াডাঙ্গা', 'chuadanga', 2),
(4, 'যশোর', 'jashore', 3),
(4, 'ঝিনাইদহ', 'jhenaidah', 4),
(4, 'খুলনা', 'khulna', 5),
(4, 'কুষ্টিয়া', 'kushtia', 6),
(4, 'মাগুরা', 'magura', 7),
(4, 'মেহেরপুর', 'meherpur', 8),
(4, 'নড়াইল', 'narail', 9),
(4, 'সাতক্ষীরা', 'satkhira', 10),

-- BARISHAL
(5, 'বরগুনা', 'barguna', 1),
(5, 'বরিশাল', 'barishal', 2),
(5, 'ভোলা', 'bhola', 3),
(5, 'ঝালকাঠি', 'jhalokathi', 4),
(5, 'পটুয়াখালী', 'patuakhali', 5),
(5, 'পিরোজপুর', 'pirojpur', 6),

-- SYLHET
(6, 'হবিগঞ্জ', 'habiganj', 1),
(6, 'মৌলভীবাজার', 'moulvibazar', 2),
(6, 'সুনামগঞ্জ', 'sunamganj', 3),
(6, 'সিলেট', 'sylhet', 4),

-- RANGPUR
(7, 'দিনাজপুর', 'dinajpur', 1),
(7, 'গাইবান্ধা', 'gaibandha', 2),
(7, 'কুড়িগ্রাম', 'kurigram', 3),
(7, 'লালমনিরহাট', 'lalmonirhat', 4),
(7, 'নীলফামারী', 'nilphamari', 5),
(7, 'পঞ্চগড়', 'panchagarh', 6),
(7, 'রংপুর', 'rangpur', 7),
(7, 'ঠাকুরগাঁও', 'thakurgaon', 8),

-- MYMENSINGH
(8, 'জামালপুর', 'jamalpur', 1),
(8, 'ময়মনসিংহ', 'mymensingh', 2),
(8, 'নেত্রকোনা', 'netrokona', 3),
(8, 'শেরপুর', 'sherpur', 4);


-- ============================================================
-- 35. FINAL CONTRACT MARKER
-- ============================================================

comment on schema public is
'RUKHEDAO v1.0.0 — FROZEN DATABASE CONTRACT. Exactly 8 application tables. Anonymous public platform. Supabase Free Plan baseline.';


-- ============================================================
-- FINAL COMMIT
-- ============================================================

commit;


-- ============================================================
-- END OF RUKHEDAO INITIAL FROZEN DATABASE CONTRACT
-- ============================================================
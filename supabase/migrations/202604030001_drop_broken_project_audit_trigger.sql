drop trigger if exists audit_projects_trigger on public.projects;

drop function if exists public.audit_trigger_function();

drop function if exists public.log_access(
  uuid,
  text,
  text,
  inet,
  text,
  boolean,
  text,
  jsonb
);

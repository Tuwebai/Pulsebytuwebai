create extension if not exists pg_net with schema extensions;

create or replace function public.dispatch_notification_push()
returns trigger
language plpgsql
security definer
set search_path = public, vault, net
as $$
declare
  dispatch_secret text;
  dispatch_url text;
begin
  if new.user_id is null then
    return new;
  end if;

  select secret_value.decrypted_secret
    into dispatch_secret
    from (
      select
        decrypted_secret,
        case
          when name = 'PUSH_DISPATCH_SECRET' then 0
          when name = 'push_dispatch_secret' then 1
          else 2
        end as priority,
        created_at
      from vault.decrypted_secrets
      where name in ('PUSH_DISPATCH_SECRET', 'push_dispatch_secret')
    ) as secret_value
   order by secret_value.priority, secret_value.created_at desc
   limit 1;

  if coalesce(dispatch_secret, '') = '' then
    raise log 'dispatch_notification_push skipped: missing PUSH_DISPATCH_SECRET vault secret for notification %', new.id;
    return new;
  end if;

  select url_value.decrypted_secret
    into dispatch_url
    from (
      select
        decrypted_secret,
        case
          when name = 'PUSH_DISPATCH_URL' then 0
          when name = 'push_dispatch_url' then 1
          else 2
        end as priority,
        created_at
      from vault.decrypted_secrets
      where name in ('PUSH_DISPATCH_URL', 'push_dispatch_url')
    ) as url_value
   order by url_value.priority, url_value.created_at desc
   limit 1;

  dispatch_url := coalesce(
    nullif(dispatch_url, ''),
    'https://vgrnwxeakiszctvpnnck.supabase.co/functions/v1/dispatch-push-notifications'
  );

  perform net.http_post(
    url := dispatch_url,
    body := jsonb_build_object('notificationId', new.id),
    params := '{}'::jsonb,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-push-dispatch-secret', dispatch_secret
    ),
    timeout_milliseconds := 5000
  );

  raise log 'dispatch_notification_push queued: notification %, user %, url %', new.id, new.user_id, dispatch_url;
  return new;
end;
$$;

drop trigger if exists dispatch_notification_push_after_insert on public.notifications;

create trigger dispatch_notification_push_after_insert
after insert on public.notifications
for each row
execute function public.dispatch_notification_push();

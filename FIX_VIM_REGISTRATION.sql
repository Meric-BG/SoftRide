-- Function to safely check VIM status without exposing table
create or replace function check_vim_availability(input_vim text)
returns json
language plpgsql
security definer -- Bypass RLS
as $$
declare
  is_present boolean;
  sold_status boolean;
begin
  -- Check existence
  select exists(select 1 from vehicles where vim = input_vim) into is_present;
  
  if not is_present then
    return json_build_object('exists', false, 'is_sold', false);
  end if;

  -- Check sold status
  select is_sold into sold_status from vehicles where vim = input_vim;
  
  return json_build_object('exists', true, 'is_sold', sold_status);
end;
$$;

-- Grant access to anonymous users (for registration)
grant execute on function check_vim_availability(text) to anon, authenticated, service_role;

create or replace function update_waybill_and_adjust_stock(waybill_id_to_update text, waybill_data jsonb)
returns void
as $$
declare
  old_items jsonb;
  new_items jsonb;
  item_diff record;
begin
  -- Get the old items from the waybill
  select items into old_items from public.waybills where id = waybill_id_to_update;

  -- Get the new items from the payload
  new_items := waybill_data->'items';

  -- Calculate the difference and update reserved stock
  with old as (
    select (value->>'id') as id, (value->>'quantity')::int as quantity
    from jsonb_array_elements(old_items)
  ),
  new as (
    select (value->>'id') as id, (value->>'quantity')::int as quantity
    from jsonb_array_elements(new_items)
  )
  select 
    coalesce(old.id, new.id) as id, 
    coalesce(new.quantity, 0) - coalesce(old.quantity, 0) as diff
  into item_diff
  from old full outer join new on old.id = new.id;

  for item_diff in 
    with old as (
      select (value->>'id') as id, (value->>'quantity')::int as quantity
      from jsonb_array_elements(old_items)
    ),
    new as (
      select (value->>'id') as id, (value->>'quantity')::int as quantity
      from jsonb_array_elements(new_items)
    )
    select 
      coalesce(old.id, new.id) as id, 
      coalesce(new.quantity, 0) - coalesce(old.quantity, 0) as diff
    from old full outer join new on old.id = new.id
  loop
    -- Check if available stock is sufficient
    if (select total_stock - reserved from public.items where id = item_diff.id) < item_diff.diff then
      raise exception 'Insufficient stock for item %', item_diff.id;
    end if;

    update public.items
    set reserved = reserved + item_diff.diff
    where id = item_diff.id;
  end loop;

  -- Update the waybill
  update public.waybills
  set
    site_id = waybill_data->>'site_id',
    driver_name = waybill_data->>'driver_name',
    vehicle = waybill_data->>'vehicle',
    issue_date = (waybill_data->>'issue_date')::timestamp,
    expected_return_date = (waybill_data->>'expected_return_date')::timestamp,
    purpose = waybill_data->>'purpose',
    service = waybill_data->>'service',
    return_to_site_id = waybill_data->>'return_to_site_id',
    status = waybill_data->>'status',
    type = waybill_data->>'type',
    items = new_items
  where id = waybill_id_to_update;
end;
$$ language plpgsql;
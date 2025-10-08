create or replace function create_waybill_and_reserve_stock(waybill_data jsonb)
returns jsonb
as $$
declare
  waybill_id text;
  item_record record;
  item_id text;
  quantity_to_reserve int;
begin
  -- Generate a new waybill ID
  select 'WB' || lpad(nextval('waybill_id_seq')::text, 3, '0') into waybill_id;

  -- Insert the new waybill
  insert into public.waybills (id, site_id, driver_name, vehicle, issue_date, expected_return_date, purpose, service, return_to_site_id, status, type, items)
  values (
    waybill_id,
    waybill_data->>'site_id',
    waybill_data->>'driver_name',
    waybill_data->>'vehicle',
    (waybill_data->>'issue_date')::timestamp,
    (waybill_data->>'expected_return_date')::timestamp,
    waybill_data->>'purpose',
    waybill_data->>'service',
    waybill_data->>'return_to_site_id',
    'Draft/Pending', -- Set status to Draft/Pending
    waybill_data->>'type',
    (waybill_data->'items')::jsonb
  );

  -- Reserve the stock for each item
  for item_record in select * from jsonb_to_recordset(waybill_data->'items') as x(id text, quantity int)
  loop
    item_id := item_record.id;
    quantity_to_reserve := item_record.quantity;

    -- Check if available stock is sufficient
    if (select total_stock - reserved from public.items where id = item_id) < quantity_to_reserve then
      raise exception 'Insufficient stock for item %', item_id;
    end if;

    -- Update the reserved stock
    update public.items
    set reserved = reserved + quantity_to_reserve
    where id = item_id;
  end loop;

  return jsonb_build_object('id', waybill_id);
end;
$$ language plpgsql;  

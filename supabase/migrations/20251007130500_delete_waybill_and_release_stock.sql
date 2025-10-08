create or replace function delete_waybill_and_release_stock(waybill_id_to_delete text)
returns void
as $$
declare
  item_record record;
begin
  -- Get the items from the waybill
  for item_record in 
    select (value->>'id') as id, (value->>'quantity')::int as quantity
    from public.waybills, jsonb_array_elements(items)
    where id = waybill_id_to_delete
  loop
    -- Release the reserved stock
    update public.items
    set reserved = reserved - item_record.quantity
    where id = item_record.id;
  end loop;

  -- Delete the waybill
  delete from public.waybills
  where id = waybill_id_to_delete;
end;
$$ language plpgsql;
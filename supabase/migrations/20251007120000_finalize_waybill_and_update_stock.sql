create or replace function finalize_waybill_and_update_stock(waybill_id_to_finalize text)
returns void
as $$
declare
  item_record record;
  item_id text;
  quantity_to_finalize int;
begin
  -- Update the waybill status to "Sent"
  update public.waybills
  set status = 'Sent'
  where id = waybill_id_to_finalize;

  -- Finalize the stock for each item
  for item_record in 
    select i.id, (wi.item_data->>'quantity')::int as quantity
    from public.waybills w
    cross join jsonb_array_elements(w.items) with ordinality as wi(item_data, position)
    join public.items i on (wi.item_data->>'id') = i.id
    where w.id = waybill_id_to_finalize
  loop
    item_id := item_record.id;
    quantity_to_finalize := item_record.quantity;

    -- Update the reserved and total stock
    update public.items
    set 
      reserved = reserved - quantity_to_finalize,
      total_stock = total_stock - quantity_to_finalize
    where id = item_id;
  end loop;
end;
$$ language plpgsql;
CREATE OR REPLACE FUNCTION public.generate_order_number()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  seq_val int;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 5) AS integer)), 0) + 1
  INTO seq_val
  FROM public.purchase_attempts
  WHERE order_number IS NOT NULL;
  RETURN 'GBC-' || LPAD(seq_val::text, 5, '0');
END;
$function$;
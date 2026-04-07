-- Add order number to purchase_attempts
ALTER TABLE public.purchase_attempts ADD COLUMN order_number text;

-- Add payment tracking to enrolled_classes
ALTER TABLE public.enrolled_classes ADD COLUMN order_number text;
ALTER TABLE public.enrolled_classes ADD COLUMN payment_date date;
ALTER TABLE public.enrolled_classes ADD COLUMN payment_method text;

-- Create a sequence-like function for order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
  seq_val int;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 5) AS integer)), 0) + 1
  INTO seq_val
  FROM public.purchase_attempts
  WHERE order_number IS NOT NULL;
  RETURN 'GBC-' || LPAD(seq_val::text, 5, '0');
END;
$$;
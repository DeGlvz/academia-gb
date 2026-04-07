-- Grant execute permission on generate_order_number to anon and authenticated
GRANT EXECUTE ON FUNCTION public.generate_order_number() TO anon;
GRANT EXECUTE ON FUNCTION public.generate_order_number() TO authenticated;
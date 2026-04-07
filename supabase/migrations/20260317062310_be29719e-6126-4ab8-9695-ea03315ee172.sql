INSERT INTO storage.buckets (id, name, public) VALUES ('class-images', 'class-images', true);

CREATE POLICY "Anyone can view class images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'class-images');

CREATE POLICY "Admins can manage class images"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'class-images' AND public.has_role(auth.uid(), 'admin'));
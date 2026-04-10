
-- Allow authenticated users to upload evidence files to their own folder
CREATE POLICY "Users can upload own evidence"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'evidence' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to read their own evidence
CREATE POLICY "Users can read own evidence"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'evidence' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to delete their own evidence
CREATE POLICY "Users can delete own evidence"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'evidence' AND auth.uid()::text = (storage.foldername(name))[1]);

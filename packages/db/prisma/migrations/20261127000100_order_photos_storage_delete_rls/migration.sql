-- 정책: 대기 주문을 재사용할 때 기존 order_photos의 복사 파일("{orderId}/...")을 지우고 새로 복사한다.
-- 기존 draft_photos_delete_own_or_unclaimed 정책은 경로의 첫 세그먼트를 drafts.id로만
-- 검증해서 주문 경로의 DELETE가 거부(0건 삭제)된다. INSERT와 같은 패턴을 orders 기준으로 추가한다.
CREATE POLICY "order_photos_delete_own_or_unclaimed" ON storage.objects
  FOR DELETE
  TO authenticated, anon
  USING (
    bucket_id = 'draft-photos'
    AND EXISTS (
      SELECT 1 FROM "orders"
      WHERE id = (storage.foldername(name))[1]
        AND (user_id = (select auth.uid())::text OR user_id IS NULL)
    )
  );

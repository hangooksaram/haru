-- 정책: 주문 생성 시 draft-photos 버킷 안에서 draft 사진을 "{orderId}/..." 경로로 복사한다.
-- 기존 draft_photos_insert_own_or_unclaimed 정책은 경로의 첫 세그먼트를 drafts.id로만
-- 검증해서, orderId가 첫 세그먼트인 복사 대상 경로는 누구 소유도 아닌 것으로 판정되어
-- INSERT(복사)가 거부된다. drafts와 같은 "본인 소유 또는 소유자 없음" 패턴을
-- orders 기준으로도 추가한다.

ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;

-- storage.objects 정책의 서브쿼리가 orders를 읽으려면 권한(GRANT) 자체가 필요하다.
GRANT SELECT ON "orders" TO authenticated, anon;

CREATE POLICY "orders_select_own_or_unclaimed" ON "orders"
  FOR SELECT
  TO authenticated, anon
  USING (user_id = (select auth.uid())::text OR user_id IS NULL);

CREATE POLICY "order_photos_insert_own_or_unclaimed" ON storage.objects
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    bucket_id = 'draft-photos'
    AND EXISTS (
      SELECT 1 FROM "orders"
      WHERE id = (storage.foldername(name))[1]
        AND (user_id = (select auth.uid())::text OR user_id IS NULL)
    )
  );

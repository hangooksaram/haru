-- 정책: 사진 접근에는 서비스 키를 쓰지 않고, 요청한 유저의 로그인 세션으로 저장소에 접근한다.
-- 서버 코드의 소유자 검증(assertDraftOwner)과 같은 조건을 DB 레벨에도 걸어,
-- 서버 코드에 버그가 있어도 RLS가 한 번 더 막도록 한다(이중 방어).
--
-- 주의: Prisma 런타임 연결(DATABASE_URL)은 Supabase의 postgres 역할로 접속하며
-- BYPASSRLS 권한을 갖는 것이 일반적이라 이 마이그레이션이 기존 Prisma 쿼리를
-- 막지는 않을 것으로 보이나, 실제 연결 역할에 BYPASSRLS가 없다면 drafts를 다루는
-- 모든 기능이 깨질 수 있다. 배포 전 로컬/스테이징에서 기존 시안 기능이 정상
-- 동작하는지 반드시 먼저 확인한다.

ALTER TABLE "drafts" ENABLE ROW LEVEL SECURITY;

-- RLS 정책과 별개로, storage.objects 정책의 서브쿼리가 drafts를 읽으려면
-- anon/authenticated 역할에 SELECT 권한(GRANT) 자체가 있어야 한다. 권한이 없으면
-- 정책으로 막히는 게 아니라 permission denied 에러가 난다.
GRANT SELECT ON "drafts" TO authenticated, anon;

CREATE POLICY "drafts_select_own_or_unclaimed" ON "drafts"
  FOR SELECT
  TO authenticated, anon
  USING (user_id = (select auth.uid())::text OR user_id IS NULL);

-- draft-photos 버킷. 경로가 "{draftId}/{파일명}" 형태이므로, 경로의 첫 세그먼트로
-- drafts 소유자를 조회해 본인 소유(또는 소유자 없음) 시안의 사진에만 접근을 허용한다.

CREATE POLICY "draft_photos_select_own_or_unclaimed" ON storage.objects
  FOR SELECT
  TO authenticated, anon
  USING (
    bucket_id = 'draft-photos'
    AND EXISTS (
      SELECT 1 FROM "drafts"
      WHERE id = (storage.foldername(name))[1]
        AND (user_id = (select auth.uid())::text OR user_id IS NULL)
    )
  );

CREATE POLICY "draft_photos_insert_own_or_unclaimed" ON storage.objects
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    bucket_id = 'draft-photos'
    AND EXISTS (
      SELECT 1 FROM "drafts"
      WHERE id = (storage.foldername(name))[1]
        AND (user_id = (select auth.uid())::text OR user_id IS NULL)
    )
  );

-- uploadDraftPhoto가 upsert: true로 호출될 때를 대비한 UPDATE 정책.
CREATE POLICY "draft_photos_update_own_or_unclaimed" ON storage.objects
  FOR UPDATE
  TO authenticated, anon
  USING (
    bucket_id = 'draft-photos'
    AND EXISTS (
      SELECT 1 FROM "drafts"
      WHERE id = (storage.foldername(name))[1]
        AND (user_id = (select auth.uid())::text OR user_id IS NULL)
    )
  )
  WITH CHECK (
    bucket_id = 'draft-photos'
    AND EXISTS (
      SELECT 1 FROM "drafts"
      WHERE id = (storage.foldername(name))[1]
        AND (user_id = (select auth.uid())::text OR user_id IS NULL)
    )
  );

CREATE POLICY "draft_photos_delete_own_or_unclaimed" ON storage.objects
  FOR DELETE
  TO authenticated, anon
  USING (
    bucket_id = 'draft-photos'
    AND EXISTS (
      SELECT 1 FROM "drafts"
      WHERE id = (storage.foldername(name))[1]
        AND (user_id = (select auth.uid())::text OR user_id IS NULL)
    )
  );

-- 정책: 서명된 업로드 URL 방식으로 전환하면서 서버가 더 이상 업로드 바이트를 직접 보지 않는다.
-- 클라이언트가 업로드 URL을 요청할 때 보내는 용량/타입 메타데이터는 속일 수 있으므로,
-- 실제 업로드가 일어나는 Storage 버킷 레벨에도 같은 제한(10MB, jpg/jpeg/png/webp)을 걸어
-- 이중으로 방어한다.

UPDATE storage.buckets
SET file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id = 'draft-photos';

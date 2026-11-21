"use client";

import { useTemplatePhotoElements } from "@/features/template/hooks/useTemplatePhotoElements";

import type { DraftPhoto } from "@/features/draft/types";

// 배포 전 제거 대상: 사진 순서 디버깅용 컴포넌트.
type Props = {
  templateId: string;
  photos: DraftPhoto[];
};

export function DraftPhotoOrderDebug({ templateId, photos }: Props) {
  const { data: labels, isLoading } = useTemplatePhotoElements(templateId);

  if (isLoading || !labels) return null;

  const photoByName = new Map(photos.map((photo) => [photo.name, photo]));

  return (
    <div className="rounded-md border border-dashed border-amber-500 bg-amber-50 p-3 text-xs">
      <p className="mb-2 font-semibold text-amber-700">
        [DEBUG] 사진 순서 매핑
      </p>
      <table className="w-full table-fixed font-mono">
        <thead>
          <tr className="text-left text-amber-700">
            <th className="w-10">#</th>
            <th>요소명</th>
            <th className="w-16">position</th>
            <th className="w-20">사진</th>
          </tr>
        </thead>
        <tbody>
          {labels.map((label, index) => {
            const photo = photoByName.get(label);

            return (
              <tr
                key={label}
                className={photo ? undefined : "text-red-600"}
              >
                <td>{index}</td>
                <td className="truncate">{label}</td>
                <td>{photo ? photo.position : "-"}</td>
                <td className="py-1">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo.url}
                      alt={label}
                      className="h-12 w-16 rounded object-cover"
                    />
                  ) : (
                    "매칭된 photo 없음"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

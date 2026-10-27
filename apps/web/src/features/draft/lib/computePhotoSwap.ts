type PhotoRef = { id: string; name: string };

type PhotoSwapUpdate = { id: string; name: string };

// 정책: 두 라벨의 사진을 서로 교체한다. 한쪽 라벨이 비어 있으면 사진이 그 라벨로 옮겨가고, 원래 라벨은 빈 상태가 된다.
export function computePhotoSwap(
  photoAtLabelA: PhotoRef | null,
  photoAtLabelB: PhotoRef | null,
  labelA: string,
  labelB: string,
): PhotoSwapUpdate[] {
  const updates: PhotoSwapUpdate[] = [];

  if (photoAtLabelA) updates.push({ id: photoAtLabelA.id, name: labelB });
  if (photoAtLabelB) updates.push({ id: photoAtLabelB.id, name: labelA });

  return updates;
}

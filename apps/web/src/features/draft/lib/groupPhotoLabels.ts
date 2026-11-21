export type PhotoLabelGroup = {
  label: string;
  slotNames: string[];
};

function splitSlotName(name: string): { prefix: string; suffix: string | null } {
  const separatorIndex = name.indexOf("_");
  if (separatorIndex === -1) return { prefix: name, suffix: null };

  return {
    prefix: name.slice(0, separatorIndex),
    suffix: name.slice(separatorIndex + 1),
  };
}

function sortSlotNames(names: string[]): string[] {
  if (names.length <= 1) return names;

  const suffixes = names.map((name) => splitSlotName(name).suffix);
  const allNumeric = suffixes.every(
    (suffix) => suffix !== null && /^\d+$/.test(suffix),
  );
  if (!allNumeric) return names;

  return [...names].sort(
    (a, b) => Number(splitSlotName(a).suffix) - Number(splitSlotName(b).suffix),
  );
}

// 정책: name의 프리픽스(첫 "_" 앞)가 라벨이다. 같은 프리픽스를 가진 요소는 같은 라벨의 서로 다른 입력으로 묶인다.
export function groupPhotoLabels(names: string[]): PhotoLabelGroup[] {
  const order: string[] = [];
  const groups = new Map<string, string[]>();

  for (const name of names) {
    const { prefix } = splitSlotName(name);
    const existing = groups.get(prefix);
    if (existing) {
      existing.push(name);
    } else {
      groups.set(prefix, [name]);
      order.push(prefix);
    }
  }

  return order.map((label) => ({
    label,
    slotNames: sortSlotNames(groups.get(label)!),
  }));
}

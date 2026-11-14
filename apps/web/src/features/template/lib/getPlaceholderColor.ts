// 썸네일이 API에 없어서, id로 색상을 정해 placeholder로 사용한다.
const PLACEHOLDER_COLORS = ["#DCEFFB", "#FCE4E4", "#FFF3D6", "#E7E1F7"];

export function getPlaceholderColor(id: string): string {
  const sum = [...id].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return PLACEHOLDER_COLORS[sum % PLACEHOLDER_COLORS.length];
}

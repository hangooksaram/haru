// 썸네일이 API에 없어서, id로 배경색 클래스를 정해 placeholder로 사용한다.
const PLACEHOLDER_BG_CLASSES = [
  "bg-sky-100",
  "bg-pink-100",
  "bg-amber-100",
  "bg-violet-100",
];

export function getPlaceholderBgClass(id: string): string {
  const sum = [...id].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return PLACEHOLDER_BG_CLASSES[sum % PLACEHOLDER_BG_CLASSES.length];
}

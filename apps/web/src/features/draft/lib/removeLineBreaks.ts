export function removeLineBreaks(text: string): string {
  return text.replace(/[\r\n]+/g, " ");
}

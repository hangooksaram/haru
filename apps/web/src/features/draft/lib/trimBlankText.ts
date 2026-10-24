// 공백 = 유니코드 공백 문자(스페이스·탭·줄바꿈·전각 공백 등, \s로 커버)
// + 화면에 보이지 않는 문자(제로폭 공백, 한글 채움 문자).
// trim()은 제로폭 공백·한글 채움 문자를 지우지 않으므로 직접 정의한다.
const LEADING_BLANK = /^[\s​ᅟᅠㅤﾠ]+/;
const TRAILING_BLANK = /[\s​ᅟᅠㅤﾠ]+$/;

export function trimBlankText(text: string): string {
  return text.replace(LEADING_BLANK, "").replace(TRAILING_BLANK, "");
}

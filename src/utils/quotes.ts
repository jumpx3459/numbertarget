export interface MathQuote {
  ko: string;
  en: string;
  author: string;
}

export const MATH_QUOTES: MathQuote[] = [
  { ko: '수는 우주를 지배한다.', en: 'Numbers rule the universe.', author: '피타고라스' },
  { ko: '나는 거인들의 어깨 위에 서 있었기에 더 멀리 볼 수 있었다.', en: 'If I have seen further, it is by standing on the shoulders of giants.', author: '아이작 뉴턴' },
  { ko: '수학은 과학의 여왕이다.', en: 'Mathematics is the queen of the sciences.', author: '카를 프리드리히 가우스' },
  { ko: '천재는 1%의 영감과 99%의 노력으로 이루어진다.', en: 'Genius is one percent inspiration and ninety-nine percent perspiration.', author: '토머스 에디슨' },
  { ko: '나는 실패한 게 아니라, 작동하지 않는 방법 만 가지를 찾아낸 것이다.', en: "I have not failed. I've just found 10,000 ways that won't work.", author: '토머스 에디슨' },
  { ko: '나는 생각한다, 고로 존재한다.', en: 'Cogito, ergo sum.', author: '르네 데카르트' },
  { ko: '수학은 신이 우주를 써 내려간 언어다.', en: 'Mathematics is the language with which God has written the universe.', author: '갈릴레오 갈릴레이' },
  { ko: '기하학에는 왕도가 없다.', en: 'There is no royal road to geometry.', author: '유클리드' },
  { ko: '설 자리만 준다면 지구도 움직여 보이겠다.', en: 'Give me a place to stand, and I shall move the earth.', author: '아르키메데스' },
  { ko: '순수 수학은 그 나름의 방식으로 논리적 사고의 시다.', en: 'Pure mathematics is, in its way, the poetry of logical ideas.', author: '알베르트 아인슈타인' },
  { ko: '신은 정수를 만들었고, 나머지는 모두 인간의 작품이다.', en: 'God made the integers, all else is the work of man.', author: '레오폴트 크로네커' },
  { ko: '나에게 방정식은 신의 생각을 표현하지 않으면 의미가 없다.', en: 'An equation for me has no meaning unless it expresses a thought of God.', author: '스리니바사 라마누잔' },
  { ko: '수학자는 커피를 정리로 바꾸는 장치다.', en: 'A mathematician is a device for turning coffee into theorems.', author: '폴 에르되시' },
];

export function getQuoteForPuzzle(puzzleNumber: number): MathQuote {
  const idx = ((puzzleNumber - 1) % MATH_QUOTES.length + MATH_QUOTES.length) % MATH_QUOTES.length;
  return MATH_QUOTES[idx];
}

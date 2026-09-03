# 타겟너머 (Target Beyond)

숫자 카드와 사칙연산/고급 연산자를 조합해 목표 숫자를 만드는 두뇌 트레이닝 퍼즐 게임입니다.

- 4가지 모드: 클래식(난이도 선택) · 블리츠(60초 타임어택) · 데일리 챌린지(날짜 시드) · 커스텀(목표/카드 직접 지정 + URL 공유)
- 한국어/영어 다국어 지원, 다크/라이트 테마
- 순수 프론트엔드 SPA — 백엔드, DB, 인증, 외부 API 키가 전혀 필요 없습니다

프로젝트 구조와 아키텍처, 알려진 이슈 등 자세한 내용은 [DEVELOPER_HANDOFF.md](./DEVELOPER_HANDOFF.md)를 참고하세요.

## 실행 방법

**요구사항:** Node.js

```bash
npm install
npm run dev       # http://localhost:3000
npm run build      # dist/ 로 프로덕션 빌드
npm run preview    # 빌드 결과 로컬 미리보기
npm run lint        # tsc --noEmit 타입체크
```

환경변수나 API 키 설정이 필요 없습니다.

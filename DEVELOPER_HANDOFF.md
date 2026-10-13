# 타겟너머 (Target Beyond) — 개발자 인수인계 문서

> 숫자 카드와 사칙연산/고급 연산자를 조합해 목표 숫자를 만드는 두뇌 트레이닝 퍼즐 게임.
> 이 문서는 코드를 처음 넘겨받는 개발자가 프로젝트 구조, 상태 관리, 컴포넌트 역할, 스타일/애니메이션 규칙과
> 알려진 이슈를 빠르게 파악할 수 있도록 작성되었습니다. 작성 시점 기준 `src/` 전체 소스코드를 직접 읽고 정리한 내용입니다.

작성일: 2026-08-31 · 최종 갱신: 2026-10-13 (버그 수정 라운드 — 9.1절 "2026-10-13 수정" 참고, 문서 전반을 실제 코드에 맞게 재검토)

---

## 1. 프로젝트 개요

- **이름**: 타겟너머 (영문: Target Beyond)
- **장르**: 숫자 연산 퍼즐 (24 Game / Krypto / Countdown Numbers 계열)
- **핵심 규칙**: 주어진 숫자 카드 여러 장을 사칙연산(+, −, ×, ÷)과 고급 연산자(거듭제곱, mod, 제곱근, 팩토리얼, 두배, 절반, 부호반전)로 조합해 카드가 1장만 남을 때까지 계산하고, 그 최종 값이 목표 숫자와 정확히 일치하면 승리합니다.
- **모드 4종**: 클래식(난이도 선택), 블리츠(60초 타임어택+콤보 점수), 데일리 챌린지(날짜 시드 기반 매일 동일 문제), 커스텀(목표/카드 직접 지정 + URL 공유).
- **다국어**: 한국어/영어 완전 지원 (`src/utils/i18n.ts`).
- **테마**: 다크/라이트 모드 지원, 매일 바뀌는 실사진 배경 + 글래스모피즘 UI.
- **백엔드 없음**: 순수 프론트엔드 SPA입니다. 서버, DB, 인증 없음. 모든 상태는 `localStorage`에 저장됩니다.

---

## 2. 기술 스택

| 영역 | 사용 기술 |
|---|---|
| 프레임워크 | React 19 + TypeScript (strict 아님, `noEmit` 타입체크만). `@types/react`/`@types/react-dom`(devDependencies)이 설치되어 있어야 `npm run lint`가 통과합니다 |
| 빌드 도구 | Vite 6 (`@vitejs/plugin-react`) |
| 스타일링 | Tailwind CSS v4 (`@tailwindcss/vite` 플러그인 방식, `tailwind.config.js` 없이 CSS `@import "tailwindcss"`로 로드) |
| 애니메이션 | `motion/react` (Framer Motion 최신 패키지명) |
| 아이콘 | `lucide-react` |
| 이펙트 | `canvas-confetti` (승리 시 색종이) |
| 사운드 | Web Audio API 순수 코드 합성 (효과음은 외부 오디오 파일 없음, `src/utils/audio.ts`). 인트로 영상만 `public/maldimaldi-intro.mp4` |
| 정답 탐색 | Web Worker (`src/utils/solver.worker.ts`, Vite의 `new Worker(new URL(...), { type: 'module' })` 번들링) |
| 패키지 매니저 | `npm` (스크립트 구성 기준, `package-lock.json` 단일 체계 — 9.1절 참고) |

루트의 `package.json`에는 원래 `express`, `dotenv`, `@google/genai` 의존성과 `GEMINI_API_KEY`를 요구하는 `.env.example`, `metadata.json`의 `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` 항목이 남아 있었습니다. Google AI Studio 템플릿에서 프로젝트를 생성할 때 딸려온 잔재로, 실제 소스코드 어디에서도 Gemini API나 Express 서버를 호출/구동하는 코드가 없었기 때문에(서버 진입점인 `server.js`도 존재하지 않음) 이번 인수인계 작업에서 모두 정리했습니다(9.1절 "정리 완료된 항목" 참고).

---

## 3. 폴더 구조

```
numbertarget/
├── index.html                  # HTML 엔트리, 폰트(Google Fonts) 프리커넥트, <title>/OG 메타, viewport(확대 허용)
├── metadata.json                # AI Studio 템플릿 메타데이터 (앱 이름/설명, 사용 안 함)
├── vite.config.ts               # Vite 설정 (react, tailwindcss 플러그인, HMR 옵션)
├── tsconfig.json                 # TypeScript 컴파일러 옵션 (lib: DOM — 워커 파일은 자체 최소 타입 사용)
├── package.json
├── .env.example                  # 환경변수가 필요 없다는 안내만 남아 있음
├── public/
│   └── maldimaldi-intro.mp4      # IntroSplash 인트로 영상
└── src/
    ├── main.tsx                  # ReactDOM 루트 마운트 (StrictMode)
    ├── index.css                 # Tailwind import + 커스텀 keyframes/유틸 클래스 + 모달 포커스 링 제거
    ├── App.tsx                   # ⭐ 최상위 컴포넌트 — 전체 게임 상태와 로직의 중심
    ├── types.ts                  # 전역 TypeScript 타입/인터페이스 정의
    ├── assets/                   # 마스코트/온보딩 배경 이미지 (maldimaldi*.jpg)
    ├── hooks/
    │   └── useModalA11y.ts        # 모든 모달 공용: ESC 닫기(최상위 모달만), 포커스 이동/복원, 열린 모달 스택
    ├── components/
    │   ├── Navbar.tsx             # 상단 브랜드 로고 + 모드 탭 + 유틸 버튼(사운드/테마/언어/카드테마 등)
    │   ├── WorldBackdrop.tsx      # 매일 바뀌는 실사진 배경 (Unsplash 핫링크)
    │   ├── SceneBackground.tsx    # 별/반딧불이 반짝임 오버레이 (배경 위 장식)
    │   ├── Mascot.tsx             # 리액션 마스코트 캐릭터 (CardDeck 안에 inline 모드로 렌더)
    │   ├── TargetDisplay.tsx      # 목표 숫자 카드(카운트업 애니메이션, 문제 번호, 타이머)
    │   ├── CardDeck.tsx           # 보유 숫자 카드 목록 + 드래그앤드롭 연산 UI
    │   ├── OperatorPanel.tsx      # 연산자 버튼 덱(기본/고급), 실시간 미리보기(ghost result)
    │   ├── HistoryTimeline.tsx    # 실행취소/리셋/힌트/정답보기/새게임 버튼 + 연산 히스토리
    │   ├── VictoryModal.tsx       # 승리 모달 (별점, 컨페티, 공유)
    │   ├── HintModal.tsx          # 3단계 점진적 힌트 모달 (현재 카드 기준)
    │   ├── SolutionModal.tsx      # 연산자 유형별 전체 정답 탐색기 + 자동 실행
    │   ├── StatsModal.tsx         # 누적 전적/업적/데일리 달력/최근 기록 모달
    │   ├── RulesModal.tsx         # 게임 규칙 + 단축키 안내 모달
    │   ├── CustomGameModal.tsx    # 커스텀 목표/카드 직접 설정 + 링크 공유
    │   ├── CardThemeModal.tsx     # 카드 스킨(neo/poker/hwatu/monster/fairytale) 선택
    │   ├── IntroSplash.tsx        # 탭 세션당 1회 재생되는 인트로 스플래시
    │   └── OnboardingModal.tsx    # 4단계 프로필 설정 온보딩 마법사 (닉네임/아키타입/샌드박스 튜토리얼/사운드)
    └── utils/
        ├── gameLogic.ts           # 연산자 정의, 퍼즐 생성기, 해답 탐색(DFS+BFS) 알고리즘, 시드/스트릭 유틸
        ├── solver.worker.ts        # findAllDistinctSolutions를 실행하는 Web Worker 엔트리
        ├── solverClient.ts         # 워커 호출(solveInWorker) + React 훅(useSolverSolutions)
        ├── audio.ts                # Web Audio API 사운드 신디사이저 (SoundEngine 클래스)
        ├── storage.ts              # localStorage 읽기/쓰기 헬퍼 (통계/설정/프로필/카드테마/기록)
        ├── dragState.ts            # HTML5 드래그앤드롭 payload 전역 공유(pub-sub)
        ├── cardThemes.ts           # 카드 스킨 정의 및 클래스/워터마크 헬퍼
        ├── quotes.ts               # 문제 번호별 수학 명언 (공유 텍스트/기록용)
        └── i18n.ts                 # 한국어/영어 번역 딕셔너리 + getTranslation()
```

---

## 4. 실행 방법

```bash
npm install
npm run dev        # http://localhost:3000 (vite --port=3000 --host=0.0.0.0)
npm run build       # dist/ 로 프로덕션 빌드
npm run preview     # 빌드 결과 로컬 미리보기
npm run lint         # tsc --noEmit 타입체크만 수행 (별도 ESLint 설정 없음)
```

정적 파일(`dist/`)만 생성되므로 Vercel/Netlify/Cloudflare Pages/S3+CDN 등 어떤 정적 호스팅에도 그대로 배포 가능합니다. 별도 백엔드/환경변수가 필요하지 않습니다(`.env.example`은 이 사실을 안내하는 내용으로 정리되어 있습니다).

---

## 5. 전체 아키텍처

`App.tsx`가 사실상 유일한 "스마트 컴포넌트"입니다. 게임 진행에 필요한 모든 상태(카드, 목표 숫자, 히스토리, 타이머, 통계, 프로필, 테마, 언어, 모달 열림 여부 등)를 `useState`로 여기서 직접 관리하고, 하위 컴포넌트에는 상태 값과 콜백 함수를 props로 그대로 내려주는 **단방향 데이터 흐름(props drilling)** 구조입니다. Redux/Zustand/Context API 등 별도 상태관리 라이브러리는 사용하지 않습니다.

렌더링 트리는 대략 다음과 같습니다.

```
App
├── WorldBackdrop        (fixed, 최하단 배경 사진)
├── SceneBackground       (absolute, 반짝임 오버레이)
└── 플로팅 글래스 패널 (motion.div, max-w-3xl 중앙 정렬)
    ├── Navbar
    └── main
        ├── 데일리 배너 (데일리 모드 한정) / 난이도 선택 바 (클래식 모드 한정, App.tsx 인라인)
        ├── TargetDisplay
        ├── CardDeck     (내부에 Mascot inline 렌더)
        ├── OperatorPanel
        └── HistoryTimeline
    └── footer
├── VictoryModal / HintModal / SolutionModal / StatsModal
├── RulesModal / CustomGameModal / CardThemeModal / OnboardingModal
└── IntroSplash
```

모달 컴포넌트는 항상 마운트되어 있고, `App.tsx`가 가진 `isOpen` boolean이 `false`이면 렌더 결과로 `null`을 반환합니다(별도 라우터 없음). **주의**: 컴포넌트 자체는 마운트된 상태이므로, `if (!isOpen) return null` 위에 있는 훅(`useMemo`/`useEffect`)은 닫혀 있어도 매 렌더마다 실행됩니다. 무거운 계산은 반드시 `isOpen`일 때만 돌도록 하세요(과거 SolutionModal/CustomGameModal이 닫힌 상태에서도 정답 탐색을 돌려 메인 스레드를 막던 버그의 원인 — 9.1절).

모든 모달은 `hooks/useModalA11y.ts`를 사용합니다: 패널에 `ref`를 연결하고 `role="dialog" aria-modal="true" aria-labelledby=<제목 id> tabIndex={-1}`을 지정하면 ESC로 닫기(여러 개가 열려 있으면 가장 마지막에 열린 것만), 열릴 때 패널로 포커스 이동, 닫힐 때 이전 포커스 복원이 처리됩니다. 새 모달을 추가할 때도 같은 패턴을 따르세요. 포커스 트랩(Tab 순환 가두기)은 아직 구현되지 않았습니다.

### 5.1 App.tsx 핵심 상태 목록

| 상태 | 타입 | 설명 |
|---|---|---|
| `language` | `Language` | `'ko' \| 'en'`, `localStorage`에서 초기값 로드 |
| `profile` | `UserProfile` | 닉네임, 아키타입, 아바타 이모지, 테마 아우라 색상, 사운드 팩, 기본 난이도, 컨페티/햅틱 on-off, 온보딩 완료 여부 |
| `stats` | `GameStats` | 누적 플레이/승리 횟수, 연속 스트릭, 블리츠 최고점, 난이도별 최소 이동수, 업적 목록 |
| `isMuted`, `theme` | - | 사운드 음소거, 다크/라이트 |
| `mode` | `GameMode` | `'classic' \| 'blitz' \| 'daily' \| 'custom'` |
| `difficulty` | `Difficulty` | `'easy' \| 'normal' \| 'hard' \| 'expert'` (카드 4~7장) |
| `puzzle` | - | `generatePuzzle()` 결과: 목표 숫자, 초기 카드, 검증된 정답 목록 |
| `cards` | `CardItem[]` | 현재 보드 위의 카드 목록 (id, value, isComputed 등) |
| `selected` | `string[]` | 선택된 카드 id (최대 2개) |
| `history` | `HistoryStep[]` | 각 연산 단계의 스냅샷(롤백/되돌리기용) |
| `moves`, `isWon` | - | 이동 횟수, 승리 여부 |
| `timeSec`, `blitzTimeLeft`, `blitzScore`, `blitzCombo` | - | 타이머/블리츠 모드 점수 시스템 |
| `mascotState`, `mascotTrigger` | - | 마스코트 리액션 상태 머신 (`idle/happy/sad/win`), `trigger`는 같은 상태를 재발동시키기 위한 카운터 |
| `cardTheme` | `CardTheme` | 카드 스킨, `localStorage` 저장 |
| `puzzleNumber` | `number` | "문제 #N" — `stats.totalPlayed`와 1:1로 연동 |
| `initialCards` | `number[]` | 현재 퍼즐의 시작 카드 (리셋/자동 실행 기준) |
| `showVictory`, `showHint`, `showSolution`, `showStats`, `showRules`, `showCustom`, `showCardThemes`, `showOnboarding`, `showIntro` | - | 각 모달 열림 상태. 하나라도 열려 있으면(`anyModalOpen`) 전역 단축키가 무시됩니다 |
| `autoSolvedRef` (ref) | `boolean` | 현재 퍼즐에서 정답 탐색기의 "자동 실행"을 사용했는지. `true`이면 승리해도 통계/스트릭/업적/기록에 집계하지 않음. 새 퍼즐 시작 시에만 `false`로 초기화(리셋/되돌리기로는 해제되지 않음) |

### 5.2 핵심 로직 함수 (모두 `App.tsx` 내부, `useCallback`으로 메모이즈)

- `startNewGame(mode, difficulty, customData?)` — 새 퍼즐 생성(`generatePuzzle`), 카드/히스토리/타이머 초기화. 데일리 모드는 `getTodaySeed()`로 날짜 기반 시드를 생성해 같은 날엔 항상 같은 문제가 나오도록 함.
- `toggleSelectCard(id)` — 카드 선택/해제. 이미 2장이 선택된 상태에서 세 번째를 클릭하면 두 번째 선택이 교체됨.
- `handleApplyBinaryBetween(idA, idB, opKey)` / `handleApplyUnaryOnCard(id, opKey)` — 실제 연산 실행의 핵심. 연산 실패 시(0으로 나누기, 음수 제곱근 등) `sound.playError()` + 마스코트 `sad` 상태 트리거. 성공 시 카드 목록 갱신, 히스토리 기록, `verifyGameEnd()` 호출.
- `verifyGameEnd(nextCards, currentMoves)` — 카드가 1장 남고 그 값이 목표와 같으면 승리 처리: 승리 모달/마스코트 `win` 트리거 후, `autoSolvedRef`가 `false`일 때만 통계 갱신, 업적 unlock, 데일리 완료/스트릭, 블리츠 콤보/보너스 시간, 퍼즐 기록(`savePuzzleHistory`) 저장.
- `handleApplyFullSolution(steps, source)` — "정답 탐색기"에서 고른 풀이를 자동 실행. `source === 'initial'`이면 시작 카드부터 재현하고 히스토리를 교체, `'current'`이면 지금 보드의 카드에서 이어서 진행하고 기존 히스토리/이동 수에 덧붙입니다. 스텝이 보드와 맞지 않으면(값을 찾지 못하면) 보드를 건드리지 않고 에러음만 냅니다. 실행 시 `autoSolvedRef`를 `true`로 설정합니다.
- `handleUndo` / `handleRollback(index)` / `handleReset` — 히스토리 되돌리기.
- 전역 키보드 단축키 핸들러(`useEffect` + `keydown` 리스너) — 아래 5.3절 참고.

### 5.3 전역 키보드 단축키

| 키 | 동작 |
|---|---|
| `1`~`7` | n번째 카드 선택/해제 |
| `+` `-` `*` `/` `^` `%` | 선택한 2장(또는 남은 2장)에 이항 연산 |
| `s` / `!` | 선택한 1장에 √ / 팩토리얼 |
| `u`, `Ctrl/Cmd+Z` | 되돌리기 |
| `r` | 리셋 |
| `h`, `Space` | 힌트 모달 |
| `a` | 정답 탐색기 |
| `o`, `p` | 온보딩(프로필) 모달 |

무시되는 경우: 모달이 하나라도 열려 있을 때(App의 `anyModalOpen` + `useModalA11y`의 `isAnyModalOpen()`), 입력 필드(`input`/`textarea`/`select`/contentEditable)에 포커스가 있을 때, IME 조합 중, 포커스된 컨트롤(버튼·카드 등 body가 아닌 요소) 위에서 `Space`/`Enter`를 눌렀을 때(해당 컨트롤의 기본 동작에 맡김), `Ctrl/Cmd/Alt` 조합(브라우저 단축키 — 단 `Ctrl/Cmd+Z`는 되돌리기).

---

## 6. 게임 로직 (`src/utils/gameLogic.ts`)

이 파일이 게임의 "두뇌"입니다.

- **`BINARY_OPS`** (6개): `+`, `-`(음수 방지, 큰 값에서 작은 값을 뺌), `*`, `/`(나누어떨어질 때만), `^`(거듭제곱, 지수 0~5, 결과 절댓값 100만 이하), `%`(나머지, 항상 양수로 정규화).
- **`UNARY_OPS`** (6개): `sqrt`(완전제곱수만), `fact`(0!~7!), `sqr`(제곱, 결과 100만 이하), `dbl`(×2), `half`(짝수만 ÷2), `neg`(부호 반전).
- **`generateCardPool(count, difficulty, rng)`** — 난이도별로 스몰(1~10)/미디엄(12,15,20,25)/라지(50,75,100) 카드 풀에서 확률적으로 카드를 뽑음. 난이도가 높을수록 큰 수 비중 증가.
- **`generateSolvablePuzzle(difficulty, cardCount, seed?)`** — 역방향 생성 방식: 무작위 카드를 뽑은 뒤 무작위 연산을 반복 적용해 카드를 1장으로 줄이고, 그 결과값을 목표 숫자로 역산합니다. 난이도별 목표값 범위를 벗어나면 재시도(최대 150회). 실패 시 하드코딩된 안전한 폴백 퍼즐(`[10,5,2,8,4]` → 목표 42)을 반환하므로 **항상 풀 수 있는 문제만 출제됩니다.**
- **`findAllDistinctSolutions(initialCards, target, maxSolutions, seedSolution?)`** — 2단계 탐색: 1) 사칙연산(+,−,×,÷)만으로 완전 탐색(DFS, 상태 캐시로 중복 방지), 2) 부족하면 고급 연산자까지 포함한 BFS(최대 3000회 반복, 깊이 6단계 제한)로 보강. 찾은 해법들을 스텝 수/사용 연산자 종류에 따라 `shortest`, `add_sub`, `mul_div`, `power_exp`, `special_unary`, `arithmetic` 카테고리로 자동 분류합니다. 카드 수에 대해 지수적으로 비싸고(특히 풀이가 없는 보드는 트리를 끝까지 탐색), UI에서 호출할 때는 **반드시 `utils/solverClient.ts`의 `useSolverSolutions` 훅(Web Worker)을 통해** 호출합니다. 현재 사용처: `SolutionModal`(초기/현재 카드), `HintModal`(현재 카드, 1개), `CustomGameModal`(입력 검증). 퍼즐 생성(`generateSolvablePuzzle`) 시 `allSolutions` 사전 계산만 메인 스레드에서 동기 실행됩니다(9.2절).
- **`solvePuzzle(cards, target)`** — `findAllDistinctSolutions(..., 1)`의 얇은 래퍼. 현재 앱 내 사용처는 없습니다(HintModal은 워커 훅으로 교체됨).
- **`getTodaySeed()`** — `YYYY-MM-DD` 문자열, 데일리 챌린지용 시드.
- **`createPRNG(seedStr)`** — 문자열 시드 기반 결정론적 의사난수 생성기 (xorshift 계열). 같은 시드는 항상 같은 퍼즐을 생성 → 데일리 챌린지가 전 세계 유저에게 동일하게 출제되는 원리(단, 서버 검증은 없으므로 클라이언트 조작에 취약함).
- **`encodeCustomPuzzle` / `decodeCustomPuzzle`** — 커스텀 퍼즐을 `?p=T24_C3_8_4_1` 형태의 URL 쿼리 파라미터로 인/디코딩. `App.tsx` 마운트 시 URL을 검사해 자동으로 커스텀 게임을 시작합니다.

---

## 7. 컴포넌트별 상세

### Navbar.tsx
브랜드 로고(클릭 시 온보딩 재오픈) + 타이틀("타겟너머") + 닉네임 배지 + 부제, 우측에 스트릭 배지·언어토글·프로필·규칙·통계·음소거·테마 버튼. 하단에 4개 모드 탭(클래식/블리츠/데일리/커스텀)이 있으며 선택된 탭 배경은 `motion.div layoutId="activeModePill"`로 부드럽게 슬라이드 이동합니다. 브랜드 타이틀과 모드별 활성 탭 배경은 원래 그라데이션이었으나, 사용자 피드백으로 브랜드 타이틀은 단색 틸(teal) 텍스트로 변경되었습니다(탭 pill 배경 그라데이션은 유지).

### WorldBackdrop.tsx / SceneBackground.tsx
- `WorldBackdrop`: `fixed inset-0` 최배경. `WORLD_PHOTOS` 배열(13장, Unsplash CDN 직링크 + 촬영자 크레딧)에서 `getDayOfYear() % length`로 하루에 한 장씩 순환 노출(Ken Burns 팬/줌 애니메이션 포함). 이미지 로드 실패(`onError`) 시 다음 사진으로 자동 폴백, 전부 실패하면 사진 레이어를 숨기고 테마 그라데이션만 표시. **주의**: Unsplash 직링크이므로 Unsplash 정책 변경이나 CDN 만료 시 개별 URL이 깨질 수 있습니다(9장 참고).
- `SceneBackground`: 배경 사진 위에 얹는 장식용 별/반딧불이 반짝임 레이어. 두 컴포넌트 모두 `pointer-events-none`으로 클릭을 방해하지 않습니다.
- **z-index/스태킹 컨텍스트 주의사항(중요)**: 최상위 루트 `<div>`(`App.tsx`)에 `isolate` 클래스가 적용되어 있어야 `WorldBackdrop`/`SceneBackground`의 `z-0`, `z-[1]` 값이 그 안에서만 유효한 스태킹 컨텍스트를 형성합니다. 이 `isolate`가 빠지면 음수/양수 z-index가 상위(문서 루트) 스태킹 컨텍스트로 새어나가 배경 사진이 글래스 패널의 배경색 뒤로 완전히 숨어버리는 버그가 재현됩니다(실제로 개발 중 겪었던 이슈). 이 레이어 구조를 수정할 때는 반드시 실제 브라우저에서 사진이 보이는지 확인하세요.

### Mascot.tsx
원형 리액션 캐릭터. 현재는 `CardDeck` 안에서 `inline` prop으로 카드 영역에 붙어 렌더되며(App이 직접 렌더하지 않음), `inline`이 없으면 우하단 고정(`fixed bottom-4 right-3 z-40`) 모드로 동작합니다. `state`(`idle/happy/sad/win`)에 따라 이모지와 애니메이션(바운스/흔들림/회전+점프)이 바뀌고, `happy/sad/win`일 땐 말풍선이 함께 뜹니다. `trigger`(정수 카운터)를 key로 사용해 동일한 state가 연속으로 들어와도 애니메이션이 처음부터 재생되도록 설계되어 있습니다. `App.tsx`의 `triggerMascot()` 헬퍼가 연산 성공/실패/승리 시점에 호출합니다.

### TargetDisplay.tsx
목표 숫자를 크게 표시하는 히어로 카드. `motion/react`의 `animate()` 명령형 API로 숫자가 바뀔 때 0.85초에 걸쳐 카운트업되며, 동시에 스프링 등장 애니메이션(`scale/opacity/rotate`)과 숨쉬기 펄스(`scale: [1, 1.025, 1]`, 무한 반복)가 적용됩니다. 다크 테마에서는 카드 내부에 고정 좌표의 작은 별(`STAR_ACCENTS`) 장식이 함께 표시됩니다.

### CardDeck.tsx
가장 복잡한 상호작용 컴포넌트. 카드 클릭 선택과 HTML5 Drag & Drop(연산자를 카드 사이 슬롯에 드래그, 또는 카드 위에 드래그) 두 가지 조작 방식을 모두 지원합니다. 드래그 상태는 `utils/dragState.ts`의 전역 pub-sub(`getDragPayload/setDragPayload/subscribeDragPayload`)로 컴포넌트 간 공유됩니다(React Context 대신 순수 모듈 레벨 상태를 사용한 것에 유의). 카드 등장 시 위에서 떨어져 착지하는 drop-and-land 애니메이션(`idx * 0.06`초 스태거, 최대 0.35초 지연, 계산 결과 카드는 착지 글로우 강조), 숫자 텍스트에는 개별 숨쉬기 펄스가 적용되어 있습니다. 카드/연산자 `motion.div`의 `onDragStart`는 motion 타입상 팬 제스처 이벤트로 선언되어 있지만 `draggable`이 지정되고 `drag` prop이 없으면 motion이 네이티브 HTML5 `dragstart`를 그대로 전달하므로, 코드에서 `React.DragEvent`로 캐스팅해 `dataTransfer`를 사용합니다(OperatorPanel 동일). **연속 반복 애니메이션은 카드를 감싸는 클릭/드래그 가능한 `motion.div` 자체가 아니라 내부의 `motion.span`(숫자 텍스트)에만 적용**되어 있는데, 이는 개발 중 "인터랙티브 요소 자체에 무한 반복 애니메이션을 걸면 자동화 테스트 도구가 클릭 안정성을 잃는다"는 문제를 겪은 뒤 의도적으로 분리한 설계입니다. 향후 카드에 애니메이션을 추가할 때도 이 원칙(조작 가능한 컨테이너는 정적으로, 장식만 반복 애니메이션)을 유지하는 것을 권장합니다.

### OperatorPanel.tsx
기본 연산자 6개(그리드) + 고급 연산자 6개(접기/펼치기 가능, `showAdvanced`)를 표시. 카드 2장(또는 1장) 선택 상태에 따라 실시간으로 연산 결과를 미리 계산해 버튼 위에 `=결과값` 뱃지로 보여주는 "고스트 프리뷰"가 핵심 UX입니다. 아우라 색상(`profile.aura`)에 따라 버튼 활성 색상 팔레트가 5종류(teal/mint/rose/violet/amber)로 바뀝니다.

### HistoryTimeline.tsx
되돌리기/리셋/힌트/정답보기/새게임 5개 액션 버튼과, 지금까지의 연산 단계를 칩(chip) 형태로 나열해 클릭 시 해당 시점으로 롤백할 수 있는 히스토리 목록을 제공합니다.

### VictoryModal.tsx
승리 시 `canvas-confetti`로 3방향 컨페티 발사(`profile.enableConfetti`가 꺼져 있으면 생략, `prefers-reduced-motion` 사용자도 생략), 이동 횟수 기준 1~3점 별점 계산(`moves <= minPossibleMoves`이면 3점), 클립보드로 결과 텍스트 공유(`navigator.clipboard`) 기능을 제공합니다. ESC로 닫으면(`onClose`) 보드는 풀린 상태로 남고, 새 게임은 HistoryTimeline의 새게임 버튼으로 시작합니다.

### HintModal.tsx / SolutionModal.tsx
- `HintModal`: 3단계로 점진 공개되는 힌트(1단계: 어떤 카드를 조합할지, 2단계: 정확한 수식, 3단계: 전체 풀이 목록). 열릴 때마다 힌트 단계가 1로 초기화되고, **현재 보드의 카드 기준으로만** 워커에서 풀이를 탐색합니다. 현재 카드로 풀이가 없으면 초기 풀이로 대체하지 않고 '풀이 없음'과 되돌리기/리셋 안내를 표시합니다(초기 풀이는 이미 합쳐져 사라진 카드를 가리킬 수 있기 때문). 이미 목표에 도달한 보드에서는 달성 메시지를 보여줍니다.
- `SolutionModal`: 이 게임에서 가장 무거운 UI. "초기 카드 기준" / "현재 남은 카드 기준" 두 탭, 연산자 카테고리 필터(전체/최단/사칙연산/덧뺄셈전용/곱나눗셈전용/거듭제곱/특수연산), 여러 해법 중 선택, 해법 복사, "자동 실행" 기능을 제공합니다. 탐색은 열려 있을 때만 워커에서 수행되며(생성된 퍼즐은 `puzzle.allSolutions`가 있어 초기 탭 탐색 생략 — 커스텀/공유 퍼즐만 탐색), 탐색 중에는 로딩 표시가 나옵니다. 열 때마다 초기 탭/전체 필터로 돌아갑니다. 자동 실행은 선택한 탭의 기준(`'initial'`/`'current'`)을 `onApplyFullSolution(steps, source)`로 전달하며, 자동 실행으로 얻은 승리는 통계/스트릭/업적에 집계되지 않습니다(5.1절 `autoSolvedRef`). 막다른 길(dead-end)에 도달하면 되돌리기/리셋/새게임 빠른 액션을 안내합니다.

### StatsModal.tsx / RulesModal.tsx
통계(승률, 스트릭, 블리츠 최고점, 최근 35일 데일리 달력, 최근 15개 클리어 기록)와 5종 업적(`first_win`, `streak_3`, `blitz_5`, `expert_win`, `minimalist` — unlock 조건은 모두 `App.tsx`의 `verifyGameEnd`에 구현되어 있습니다), 게임 규칙과 키보드 단축키 목록을 각각 보여주는 단순 표시용 모달입니다. 두 모달 모두 패널이 `max-h-[90vh]`이고 내부 스크롤되므로 작은 화면에서도 하단 내용까지 볼 수 있습니다.

### CustomGameModal.tsx
목표 숫자와 카드 목록(2~8장)을 직접 입력하면 형식 오류는 즉시, 풀이 가능 여부는 입력이 350ms 멈춘 뒤(`VALIDATION_DEBOUNCE_MS`) 워커에서 검증합니다(모달이 열려 있을 때만). 결과를 URL 링크로 공유할 수 있습니다. 4개의 프리셋(클래식 24, 카운트다운, 황금비율, 거듭제곱 마스터)이 내장되어 있습니다.

### CardThemeModal.tsx / IntroSplash.tsx
- `CardThemeModal`: `utils/cardThemes.ts`의 5종 카드 스킨 중 하나를 선택. 순수 장식이며 게임 상태 색상(선택/계산 결과 등)에는 영향을 주지 않습니다.
- `IntroSplash`: 탭 세션당 1회(`sessionStorage`) "시작하기"를 누르면 인트로 영상을 재생하고 끝나면 게임으로 넘어가는 스플래시. 열려 있는 동안 전역 단축키는 무시됩니다.

### OnboardingModal.tsx (약 1,040줄, 가장 큰 컴포넌트)
4단계 마법사:
1. **플레이어 정체성 설정** — 닉네임 입력(프리셋 랜덤 추천 포함), 4종 플레이 성향(아키타입: 스피드러너/전략가/미니멀리스트/수식연금술사) 선택, 아바타 이모지는 아키타입에 따라 자동 결정.
2. **인터랙티브 튜토리얼** — 고정된 샌드박스 퍼즐(카드 `[8,3,5,4,2]`, 목표 `22`)로 실제 게임과 동일한 조작(카드 선택 + 사칙연산/일부 단항연산)을 미리 연습. 실제 게임 상태와는 완전히 분리된 로컬 state입니다.
3. **게임 환경 설정** — 기본 난이도, 사운드 팩(모던/8비트레트로/미니멀) 미리듣기 선택, 컨페티·마이크로 인터랙션 on/off 토글.
4. **플레이어 패스 발급** — 지금까지 설정한 프로필 요약과 함께 컨페티 축하 연출, "공식 마스터 패스" 요약 카드 표시.

`onSaveProfile(profile)` 호출로 `App.tsx`의 `profile` 상태와 `localStorage`에 저장됩니다.

---

## 8. 유틸리티 모듈

- **`utils/audio.ts`**: `SoundEngine` 클래스, `AudioContext`를 lazy 초기화(첫 유저 제스처 이후 생성 — 브라우저 자동재생 정책 대응). 오실레이터를 직접 조합해 카드선택/해제, 연산성공(머지), 되돌리기, 오류, 힌트, 승리, 콤보 사운드를 코드로 합성합니다. 외부 mp3/wav 파일이 전혀 없습니다. `soundFlavor`(modern/retro/minimal)에 따라 파형/주파수가 달라집니다.
- **`utils/storage.ts`**: `localStorage` 래퍼. 키 목록은 아래 표 참고. 모든 함수가 `try/catch`로 감싸져 있어 저장소 접근이 막힌 환경(시크릿 모드 등)에서도 기본값으로 안전하게 폴백합니다.
- **`utils/solverClient.ts` / `utils/solver.worker.ts`**: `solveInWorker(cards, target, max, seed?)`는 잡마다 전용 워커를 띄우고 `{ promise, cancel }`을 돌려줍니다. `cancel()`은 워커를 `terminate()`하므로 입력이 바뀌어 낡은 탐색은 즉시 중단됩니다. `useSolverSolutions(cards | null, target, max, enabled, seed?)`는 `enabled`(보통 `isOpen`)일 때만 탐색하고 `{ solutions, loading }`을 반환하며, 카드 배열 내용으로 키를 만들어 동일 입력의 재탐색을 피합니다. `Worker`가 없는 환경에서는 `setTimeout`으로 메인 스레드에서 비동기 실행합니다.
- **`hooks/useModalA11y.ts`**: 5장 참고.
- **`utils/dragState.ts`**: React state가 아닌 모듈 스코프 변수 + 리스너 Set으로 구현된 초경량 전역 상태. HTML5 드래그 이벤트의 `dataTransfer`만으로는 드래그 중인 항목의 타입을 여러 컴포넌트가 실시간으로 구독하기 번거로워 별도로 분리되었습니다.
- **`utils/i18n.ts`**: `Translations` 인터페이스(약 200개 키, 위 5장 참고)와 `ko`/`en` 두 개의 완전한 번역 객체, `getTranslation(lang)` 함수로 구성. 새 UI 텍스트를 추가할 때는 반드시 인터페이스 + 두 언어 객체 3곳을 모두 수정해야 타입 에러 없이 빌드됩니다.

### localStorage 키 목록 (`utils/storage.ts`)

| 키 | 내용 |
|---|---|
| `number_target_stats_v1` | `GameStats` (누적 전적, 업적 등) |
| `number_target_sound_v1` | 사운드 on/off |
| `number_target_theme_v1` | `'dark' \| 'light'` |
| `number_target_profile_v1` | `UserProfile` |
| `number_target_lang_v1` | `'ko' \| 'en'` |
| `number_target_card_theme_v1` | `CardTheme` (카드 스킨) |
| `number_target_puzzle_history_v1` | `PuzzleHistoryEntry[]` (최근 클리어 기록, 최대 200개) |

`sessionStorage`의 `number_target_intro_seen_v1`은 인트로 스플래시를 탭 세션당 1회만 보여주기 위한 플래그입니다.

스키마를 변경할 경우 `_v1` 접미사를 올려 마이그레이션 충돌을 피하는 것을 권장합니다.

---

## 9. 알려진 이슈 / 제한사항 / TODO

### 9.1 이번 인수인계 작업에서 정리 완료된 항목

아래 항목들은 애플리케이션 코드 어디에서도 참조되지 않는 것을 확인한 뒤 이번 작업에서 직접 정리했습니다.

- **AI Studio 템플릿 잔재 제거**: `package.json`에서 `express`, `dotenv`, `@google/genai`, `@types/express` 의존성을 제거했습니다(서버 진입점 `server.js`가 애초에 없었고, 소스코드 어디에서도 import되지 않았음을 확인). `clean` 스크립트도 존재하지 않는 `server.js` 참조를 제거해 `rm -rf dist`로 단순화했습니다. `.env.example`은 실제로 참조되는 환경변수가 없다는 안내로 내용을 교체했고, `metadata.json`의 `majorCapabilities`에서 실체가 없는 `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` 항목을 제거했습니다(빈 배열로 변경).
- **패키지 매니저 이중화 해소**: `bun.lock`을 삭제하고 `package-lock.json`(npm) 단일 체계로 통일했습니다. `npm run lint`(tsc --noEmit)와 `npm run build`(vite build) 모두 정상 통과를 확인했습니다.
- **`minimalist` 업적 로직 구현**: `App.tsx`의 `verifyGameEnd()`에 `currentMoves === CARD_COUNTS[difficulty] - 1`(카드가 1장으로 줄어드는 데 필요한 이론상 최소 이동 수, `VictoryModal`의 별 3개 판정 기준과 동일한 값)일 때 `'minimalist'`를 unlock하는 조건을 추가했습니다. 즉, 되돌리기 없이 단항 연산 우회 없이 정확히 최소 횟수로 클리어하면 해금됩니다.
- **Git 저장소 초기화**: 인수인계 시점에 `.git`이 없던 것을 초기화하고 초기 커밋을 생성했습니다.

#### 2026-10-13 수정

- **타입체크 복구**: `@types/react`, `@types/react-dom`을 devDependencies에 추가하고 남은 tsc 에러(CardDeck/OperatorPanel의 `onDragStart` → `dataTransfer` 타입, 7장 CardDeck 참고)를 수정. `npm run lint`/`npm run build` 통과. 이 과정에서 `package-lock.json`에 남아 있던, `package.json`에는 없는 템플릿 잔재 패키지(`@google/genai`, `express` 타입 등) 항목이 npm에 의해 정리되었습니다.
- **정답 탐색 메인 스레드 블로킹 해소**: SolutionModal(닫혀 있어도 현재 카드가 바뀔 때마다 탐색), CustomGameModal(닫혀 있어도 키 입력마다 탐색)을 열려 있을 때만 탐색하도록 바꾸고, 탐색 자체를 Web Worker로 이동(`utils/solverClient.ts`). CustomGameModal 입력은 350ms debounce.
- **HintModal**: 열 때 힌트 단계 초기화, 파생값 `useMemo`, 현재 카드로 풀이가 없으면 '풀이 없음' 표시(초기 풀이 폴백 제거), 탐색은 워커.
- **SolutionModal 자동 실행**: '현재 카드' 탭에서 실행하면 현재 카드 기준 스텝을 시작 카드에 적용해 보드가 꼬이던 버그 수정(`source` 인자 추가). 자동 실행 승리는 통계/스트릭/업적/기록에 집계하지 않음.
- **라이트 테마 가독성**: SolutionModal/HintModal에서 흰 배경 위 `text-white`(해법 제목, 수식, 막다른 길 제목, 다음 연산 칩)와 일부 연한 텍스트/탭 바를 테마 분기로 수정.
- **전역 단축키 충돌**: Space가 포커스된 버튼을 누르는 동시에 힌트를 열던 문제, 모달이 열린 상태에서 뒤의 보드에 단축키가 먹던 문제, `Ctrl+R`/`Ctrl+A` 등 브라우저 단축키를 가로채던 문제 수정(5.3절).
- **모달 접근성**: 전 모달 ESC 닫기·`role="dialog"`/`aria-modal`/`aria-labelledby`·아이콘 닫기 버튼 `aria-label`·포커스 이동/복원(`useModalA11y`). StatsModal은 높이 제한 + 내부 스크롤로 작은 화면에서 잘리던 문제 수정. CustomGameModal/VictoryModal도 높이 제한 + 스크롤.
- **기타**: `index.html` viewport에서 `maximum-scale=1.0, user-scalable=no` 제거(핀치 줌 허용). VictoryModal 컨페티가 `profile.enableConfetti` 설정을 따르도록 수정.

### 9.2 여전히 남아있는 이슈 / 제한사항 (다음 작업자 판단 필요)

- **퍼즐 생성 시 동기 탐색**: `generateSolvablePuzzle`은 목표 확정 후 `findAllDistinctSolutions(..., 12)`를 메인 스레드에서 동기로 한 번 실행합니다(새 게임/난이도 변경 시). 생성된 퍼즐은 항상 풀이가 있어 탐색이 조기 종료되므로 체감 지연은 작지만, 익스퍼트(7장)에서 문제가 되면 생성 자체를 워커로 옮기거나 `allSolutions`를 SolutionModal에서 지연 계산하도록 바꾸는 것을 고려하세요.
- **모달 포커스 트랩 미구현**: 모달이 열리면 포커스가 패널로 이동하지만 Tab으로 뒤쪽 요소까지 이동할 수 있습니다.
- **라이트 테마 잔여 대비 문제**: 해법 카테고리 배지 색(`gameLogic.ts`의 `badgeColor`, `text-*-300`)과 CustomGameModal 검증 메시지 색은 다크 테마 기준이라 라이트 테마에서 대비가 낮습니다(흰 글씨 수준은 아님).

- **배경 사진 하드코딩**: `WorldBackdrop.tsx`의 `WORLD_PHOTOS` 13장은 특정 시점에 수동으로 검증한 Unsplash CDN 직링크입니다. Unsplash 측 URL 포맷은 `photo-<13자리 타임스탬프>-<해시>` 형태이며, 사람이 보는 페이지 URL의 짧은 슬러그 ID(`unsplash.com/photos/설명-XXXXXXXXXXX`)와는 다른 체계이므로 절대 서로 치환할 수 없습니다(과거 이 착오로 사진이 전부 깨진 적이 있습니다). 사진을 추가/교체할 때는 반드시 실제 Unsplash 사진 페이지를 열어 `og:image` 메타 태그 또는 `img src`에서 진짜 CDN URL을 확인한 뒤 등록하세요. 장기적으로는 자체 CDN에 이미지를 호스팅하거나 Unsplash API(키 발급) 연동으로 교체하는 것이 안정적입니다.
- **데일리 챌린지 무결성**: 클라이언트에서만 시드 기반 생성/검증이 이루어지므로, 유저가 개발자 도구로 `localStorage`나 상태를 조작해 부정하게 스트릭을 올릴 수 있습니다. 서버 검증이 없다는 점을 감안하고 랭킹/리더보드 등 신뢰가 중요한 기능을 얹을 계획이라면 백엔드가 필요합니다.
- **z-index/스태킹 컨텍스트**: 7장 "WorldBackdrop" 항목 참고 — 배경 레이어 구조를 건드릴 때 반드시 실제 브라우저로 시각 확인이 필요합니다(자동화 스크린샷만으로는 외부 이미지 로드 여부를 확인할 수 없는 네트워크 제약 환경도 있었습니다).
- **연속 애니메이션과 상호작용 요소**: 클릭/드래그 가능한 요소 자체에 무한 반복 애니메이션(예: 계속 위아래로 움직이는 효과)을 걸면 일부 자동화 테스트 도구에서 "요소가 안정적이지 않음" 오류가 발생하며, 실사용자 관점에서도 정밀한 클릭/드래그를 방해할 수 있습니다. CardDeck.tsx의 사례(7장 참고)를 참고해 상호작용 요소는 정적으로 유지하세요.
- **ESLint 미설정**: `npm run lint`는 `tsc --noEmit`만 수행합니다. 별도 ESLint/Prettier 설정이 없으므로 코드 스타일 일관성 도구 도입을 고려해볼 수 있습니다.
- **테스트 코드 없음**: 단위/통합/E2E 테스트가 전혀 없습니다. `utils/gameLogic.ts`의 퍼즐 생성/탐색 알고리즘은 로직이 복잡한 편이라 우선적으로 테스트를 붙이기 좋은 대상입니다.

---

## 10. 스타일 / 디자인 시스템 메모

- Tailwind v4를 `tailwind.config.js` 없이 CSS 진입점(`src/index.css`)의 `@import "tailwindcss"`만으로 사용합니다(v4의 새로운 방식). 커스텀 폰트(`Outfit`, `JetBrains Mono`, `Plus Jakarta Sans`)는 `index.html`에서 Google Fonts로 로드하고, `index.css`의 `@layer base`에서 `font-display`/`font-mono-num` 유틸리티 클래스로 매핑합니다.
- 색상 팔레트는 teal(주 브랜드색) + fuchsia/pink(포인트) 조합이 기본이며, `profile.aura` 설정에 따라 mint/rose/violet/amber 4종 대체 팔레트가 존재합니다(`Navbar.tsx`의 `getAuraColorClass`, `OperatorPanel.tsx`의 `getAuraColor` 참고).
- 다크/라이트 테마는 각 컴포넌트 내부에서 `theme === 'dark'` 삼항 분기로 클래스를 스위칭하는 방식입니다(Tailwind의 `dark:` variant는 사용하지 않음). 새 컴포넌트를 추가할 때도 이 컨벤션을 따르는 것이 일관성 있습니다. 특히 모달 내부의 `text-white`/`text-*-300` 같은 다크 전용 색을 분기 없이 쓰면 라이트 테마의 흰 배경 위에서 보이지 않게 되니 주의하세요.
- 전체 UI는 "글래스모피즘 위젯"으로 감싸여 있습니다(`backdrop-blur-xl` + 반투명 배경 + `rounded-[1.75rem~2.25rem]` + `shadow-2xl`). 최근 사용자 요청으로 패널 크기가 `max-w-3xl max-h-[92vh]`로 제한되고 화면 중앙에 고정되어, 뒤의 배경 사진이 여백으로 넉넉히 보이도록 조정되었습니다.

---

## 11. 다음 작업자가 참고하면 좋은 것

- 새 UI 텍스트 추가 시: `i18n.ts`의 `Translations` 인터페이스 → `ko` 객체 → `en` 객체 순서로 3곳 모두 수정.
- 새 연산자 추가 시: `types.ts`의 `BinaryOp`/`UnaryOp` → `gameLogic.ts`의 `BINARY_OPS`/`UNARY_OPS` 배열에 `fn` 구현 → `findAllDistinctSolutions`의 탐색 로직(현재 사칙연산은 DFS, 그 외는 BFS로 분리되어 있음에 유의)까지 함께 반영해야 정답 탐색기에 새 연산자가 반영됩니다.
- 새 업적 추가 시: `types.ts`의 `GameStats.achievements`는 `string[]`이므로 타입 제약이 없습니다. `StatsModal.tsx`의 `getAchievements()` 목록에 항목을 추가하고, `App.tsx`의 `verifyGameEnd` 혹은 별도 지점에서 `stats.achievements`에 push하는 로직을 반드시 함께 작성하세요(위 9장 `minimalist` 업적처럼 UI만 있고 로직이 빠지기 쉽습니다).
- 배경/장식 레이어를 수정할 때는 반드시 9장의 z-index 주의사항을 먼저 읽어보세요.
- 새 모달 추가 시: `useModalA11y(isOpen, onClose)` + dialog 속성(5장), App의 `anyModalOpen`에 열림 상태 추가, 무거운 계산은 `isOpen`일 때만(가능하면 `useSolverSolutions`).
- 정답 탐색을 새로 호출할 때: 렌더 중 `findAllDistinctSolutions`를 직접 부르지 말고 `useSolverSolutions`를 사용하세요.

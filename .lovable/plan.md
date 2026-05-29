# 습관 트래커 - 페이지 구현 플랜

3개 라우트(`/login`, `/habits`, `/stats`)의 실제 기능과 UI를 구현합니다. 대시보드는 이번 범위에서 제외합니다.

## 1. `/login` — 인증

**기능**
- 이메일 + 비밀번호 회원가입 / 로그인 (탭 전환)
- Google 소셜 로그인 버튼
- 이미 로그인된 경우 `/habits`로 자동 리다이렉트

**구현**
- `supabase--configure_social_auth`로 Google 활성화 (`providers: ["google"]`)
- 이메일: `supabase.auth.signUp` / `signInWithPassword`
  - 회원가입 시 `emailRedirectTo: window.location.origin`
- Google: `lovable.auth.signInWithOAuth("google", { redirect_uri: origin })`
- 에러는 토스트(sonner)로 표시

## 2. `/habits` — 습관 관리 (인증 필요)

**기능**
- 내 습관 목록 (이름, 설명, 색상 점)
- 습관 추가 다이얼로그 (이름, 설명, 색상)
- 습관 수정 / 삭제
- 각 습관에 **오늘 체크 / 해제** 토글 버튼 (`habit_logs`의 오늘 날짜 row 토글)

**구현 (서버 함수)**
- `src/lib/habits.functions.ts`
  - `listHabitsWithToday` — habits + 오늘 로그 여부 조인 조회
  - `createHabit`, `updateHabit`, `deleteHabit`
  - `toggleTodayLog(habitId)` — 오늘 로그 있으면 delete, 없으면 insert
- 모두 `requireSupabaseAuth` 미들웨어 사용 → RLS가 user_id 스코프 보장
- 컴포넌트에서 `useServerFn` + `useQuery` / `useMutation`로 호출, mutation 성공 시 `invalidateQueries`

**UI**
- shadcn `Card`, `Button`, `Dialog`, `Input`, `Textarea`, `Checkbox` 사용
- 색상은 미리 정의된 6~8개 프리셋 중 선택

## 3. `/stats` — 기본 통계 (인증 필요)

**기능 (텍스트 지표만)**
- 전체 습관 수
- 이번 달 총 체크 횟수
- 이번 달 평균 완료율 (체크 수 / (습관 수 × 경과일))
- 최장 연속 기록(streak) — 모든 습관 통합 기준 (어제까지 연속으로 1개 이상 체크한 일수)

**구현**
- `src/lib/stats.functions.ts` → `getBasicStats`
  - `requireSupabaseAuth` 사용
  - habits 카운트 + 이번 달 habit_logs 집계 + streak 계산을 한 번에 반환
- 카드 4개 그리드로 표시

## 4. 공유 인프라

- **`__root.tsx`**: `onAuthStateChange` 리스너 추가 → `router.invalidate()` + `queryClient.invalidateQueries()`
- **`_authenticated/habits.tsx`, `stats.tsx`**: 자식 단계 `beforeLoad`에 `supabase.auth.getUser()` 게이트 추가 (로더가 protected serverFn 호출하기 전 세션 하이드레이션 보장)
- **간단한 상단 네비 컴포넌트** (`src/components/AppNav.tsx`): `/habits`, `/stats`, 로그아웃 버튼 — `_authenticated` 레이아웃에서 렌더
- 토스트용 `<Toaster />`를 `__root.tsx`에 마운트

## 5. 라우팅 정리

- `/dashboard` 라우트는 이번 범위에 없으므로 **삭제** (`src/routes/_authenticated/dashboard.tsx`)
- 인증 후 기본 진입점은 `/habits`
- 루트 `/` (`index.tsx`)는 로그인 상태면 `/habits`, 아니면 `/login`로 리다이렉트

## 작업 범위 외

- 월간 달력 뷰, 차트
- 리마인더/알림
- 프로필 편집 페이지

진행해도 될까요?

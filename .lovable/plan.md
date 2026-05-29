# 습관 트래커 - 프로젝트 셋업 플랜

페이지 내용이나 기능 로직은 작성하지 않고, 프로젝트 기반 인프라만 구성합니다.

## 1. Lovable Cloud 활성화
- 인증과 데이터 저장을 위해 Cloud 연결
- 자동으로 Supabase 클라이언트 파일 생성됨

## 2. 데이터베이스 스키마 (마이그레이션)
- `profiles` — 사용자 프로필 (id, display_name, created_at)
- `habits` — 습관 정의 (id, user_id, name, description, color, created_at)
- `habit_logs` — 일일 체크 기록 (id, habit_id, user_id, logged_date, created_at)
- 모든 테이블에 RLS 활성화 + `auth.uid()` 기반 정책
- `public` 스키마 GRANT 명시
- 신규 가입 시 profile 자동 생성 트리거

## 3. 인증 인프라
- `_authenticated` 레이아웃 라우트 (가드만, UI 없음)
- `attachSupabaseAuth` 미들웨어를 `src/start.ts`에 등록
- 루트에 `onAuthStateChange` 리스너 (캐시 무효화용)

## 4. 라우트 구조 (빈 컴포넌트)
```
src/routes/
  __root.tsx                       (기존 유지 + auth listener)
  index.tsx                        (랜딩 — 빈 placeholder)
  login.tsx                        (빈 placeholder)
  _authenticated.tsx               (가드 레이아웃)
  _authenticated/dashboard.tsx     (빈)
  _authenticated/habits.tsx        (빈)
  _authenticated/stats.tsx         (빈)
```
각 페이지는 "준비 중" 수준의 최소 마크업만, 실제 기능/UI 컴포넌트 없음.

## 5. 디자인 토큰
- `src/styles.css`에 색상 팔레트 / 타이포 토큰 추가
- 팔레트는 이전 질문에서 선택 안 했으므로 **Midnight Indigo** 기본 적용 (추후 변경 가능)

## 작성하지 않는 것
- 습관 추가/체크/삭제 로직
- 통계 차트
- 실제 폼/버튼/리스트 UI
- 리마인더

진행해도 될까요?
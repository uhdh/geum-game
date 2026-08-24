# Loop Configuration — 그믐 (GEUM) 게임 개발

## Active Loops

| Pattern | Cadence | Level | Status | Command |
|---------|---------|-------|--------|---------|
| Dev Triage (빌드→검증→배포 상태 점검) | 세션 시작 시 | L1 report-only | active | `opencode run "Run loop-triage. Read STATE.md first." --agent loop-triage` |
| Smoke Test Gate | 커밋 전 | L2 verify | active | `node smoke_test.js` (실패 시 커밋 금지) |
| Screenshot Review | UI 변경 시 | L2 assisted | active | headless Chrome 9-상태 캡처 → 사람 눈 검수 |
| Deploy Verify | 배포 후 | L1 report | active | Pages URL HTTP 200 + 라이브 스크린샷 |

## Human Gates

- 엔딩 분기·스토리 텍스트 변경은 반드시 사람 검수 (denylist: DESIGN.md 서사)
- 난이도 수치(패턴 길이, 판정 허용오차, 별 임계값) 변경은 플레이 테스트 없이 push 금지
- 자동 수정 루프(L3)는 smoke_test.js + 스크린샷 검수가 모두 그린일 때만 허용

## Worktrees

- 대규모 리팩토링은 `git worktree` 분리 후 opencode `--dir`로 실행
- 검증 REJECT된 worktree는 폐기

## Budget

- Max sub-agent spawns per run: 1 (감사용 general agent)
- 스크린샷 루프는 3회 초과 시 중단하고 사람에게 에스컬레이션
- Token spend 80% 도달 시 report-only 전환

## Run Log

- 매 세션 종료 시 loop-run-log.md에 기록
- STATE.md의 High Priority는 플레이 테스트 피드백으로 갱신

## Links

- DESIGN.md — 게임 디자인 문서 (스토리/퍼즐 스펙의 단일 진실원)
- smoke_test.js — 헤드리스 회귀 테스트 (16 항목)
- 배포: https://uhdh.github.io/geum-game/ (git push → Pages 자동)

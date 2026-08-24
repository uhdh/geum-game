# Loop State — 그믐 (GEUM)

Last run: 2026-08-25

## High Priority (loop is acting or waiting on human)

- [ ] 플레이 테스트: 1장 자물쇠 개선(ㄷ·ㅏ·ㄹ 힌트) 후 실제 유저가 막힘 없이 1~2장 통과하는지 확인
- [ ] 리듬 퍼즐 3라운드 난이도 밸런스 (SLOT_MS 420ms가 모바일에서 널널한지 빡센지 피드백 대기)
- [ ] 엔딩 A/B/C 도달률 기록 수집 (히든 엔딩 조건 hints==0이 실제 가능한지)

## Watch List

- iOS Safari에서 DungGeunMo 웹폰트 로딩 실패 시 폴백 폰트 렌더링 확인
- 서비스워커 캐시 v3 갱신: 이전 v2 사용자가 신규 배포를 받는지 (강제 갱신 로직 없음 — 클라이언트 리로드 2회 필요할 수 있음)
- 오행 캔버스가 좌측 정렬 — 중앙 정렬 폴리시 여지
- 달 위상 UI(좌상단)가 5조각 이후 보름달 표시가 정확한지

## Recent Noise (ignored this run)

- headless 스크린샷에서 --window-size 플래그가 간혹 무시됨 (로컬 도구 이슈, 게임과 무관)
- GitHub Pages 첫 배포 후 40~90초 빌드 지연 (정상)

---
Run log: loop-run-log.md

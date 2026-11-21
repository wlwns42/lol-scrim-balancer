# 푸시 알림 배포 설정 (Vercel)

이 저장소에는 이미 PWA 푸시 기능이 있었고, 이 수정본은 알림 원클릭 투표 토큰 검증과 발송 API 인증, iOS 알림 본문 탭의 일정 이동을 보완합니다.

## 필수 Vercel 환경변수

- `SUPABASE_URL`: 기존 값 유지
- `SUPABASE_SERVICE_ROLE_KEY`: 기존 값 유지 (브라우저에 노출 금지)
- `VAPID_PUBLIC_KEY`: 기존 Web Push 공개키
- `VAPID_PRIVATE_KEY`: 기존 Web Push 비밀키
- `VOTE_TOKEN_SECRET`: 최소 32자 이상의 무작위 비밀 문자열. 투표 토큰 서명에 사용
- `PUSH_ADMIN_TOKEN`: 최소 32자 이상의 무작위 비밀 문자열. 관리자 수동 푸시 발송에 사용
- `CRON_SECRET`: Vercel Cron 인증에 사용할 비밀 문자열. Vercel 크론 요청의 Authorization Bearer 값과 일치해야 함

`VOTE_TOKEN_SECRET` 또는 `PUSH_ADMIN_TOKEN`을 HTML/JS 파일에 하드코딩하지 마세요. 환경변수 설정 후 Vercel을 재배포해야 합니다.

## 동작

- 안드로이드 등 알림 액션을 지원하는 브라우저: 알림의 참가/불참 버튼으로 투표
- iOS 홈 화면 PWA: 알림 본문을 누르면 해당 날짜의 일정과 참가/보류/불참 버튼으로 이동
- 보류: 앱 화면에서 선택
- 푸시 토큰은 24시간 후 만료됩니다.

## 반드시 알아둘 한계

이 앱은 현재 소환사 계정을 브라우저 로컬 저장값으로 기억합니다. 이 변경은 토큰 위조를 막지만, 가입/로그인 기반의 강한 본인 인증을 새로 만든 것은 아닙니다. 계정 사칭을 완전히 막으려면 카카오 로그인 등 서버에서 검증 가능한 사용자 인증과 구독 계정 연결 검증이 추가로 필요합니다. 또한 Supabase JSON 한 행을 읽고 다시 쓰는 현재 구조는 동시 투표가 정확히 동시에 발생하면 경합할 수 있습니다. 완전한 동시성 보장은 DB 트랜잭션/RPC로 처리하는 것이 좋습니다.

## 테스트

1. Vercel 환경변수 설정 및 재배포
2. 휴대폰에서 내 소환사 계정 고정 후 `알림 켜기`
3. 관리자 로그인 후 `모집 푸시 발송`을 눌러 `PUSH_ADMIN_TOKEN` 입력
4. Android 알림 액션의 참가/불참 결과 확인
5. iOS 홈 화면 PWA에서 알림 본문을 눌렀을 때 해당 날짜의 투표 버튼으로 이동하는지 확인
6. 토큰 없이 `/api/push?action=send` 또는 `/api/push?action=quick-vote`를 호출하면 거부되는지 확인

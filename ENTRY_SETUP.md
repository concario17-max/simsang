# 입장코드 설정 및 배포

이 브랜치는 Cloudflare Pages 비밀 변수와 KV 바인딩을 설정한 후 main에 병합합니다. 설정 전에는 인증 함수가 503을 반환하며 자료를 공개하지 않습니다. 실제 입장코드와 서명 비밀키는 저장소에 넣지 않습니다.

## Cloudflare Pages → simsang → Settings

Production 및 Preview에 아래 설정을 적용합니다.

- Secret `ACCESS_CODE`: 소유자가 정한 입장코드. 앞자리 0을 포함한 문자열 그대로 입력.
- Secret `ACCESS_SECRET`: 무작위 32바이트 이상의 긴 비밀키. 로컬에서 `openssl rand -hex 32`로 생성 가능. 저장소나 채팅에 게시하지 않음.
- KV namespace 생성 후 binding 이름 `ACCESS_ATTEMPTS`로 연결. 실패 횟수를 IP의 HMAC 값으로 저장하며 15분 후 만료. 원본 IP는 KV에 저장하지 않음.
- Functions의 요청 한도 초과 동작은 **Fail closed**로 설정. Fail open이면 함수 한도 초과 시 정적 파일이 인증 없이 제공될 수 있음.

설정 저장 후 해당 브랜치를 재배포하고 아래 검증을 완료한 뒤 main에 병합합니다. `_routes.json`은 모든 경로를 포함하며 인증을 건너뛰는 경로가 없습니다.

## 검증

- 시크릿 창에서 홈·본문 JSON·검색 색인·이미지 직접 주소가 입장 화면으로 이동하는지 확인.
- 틀린 코드 거부, 올바른 코드 입장, 새로고침 후 유지 확인.
- 5회 실패 후 15분 제한 확인. KV는 eventual consistency이므로 전 세계 동시 공격에 대한 엄격한 제한은 아님. 더 강한 방어는 Cloudflare WAF의 `/__entry` POST 속도 제한 추가.
- 1년 만료 및 코드/서명 비밀키 변경 후 기존 쿠키 무효화 확인.
- Production, Preview 모두 검증. 이전 배포 URL과 원본 공개 GitHub 저장소에는 소급 적용되지 않음. 자료 자체의 비공개가 필요하면 원본 저장소·이전 배포도 별도 관리해야 함.

`npm test`는 인증, 데이터 접근, 만료/변조, 코드 변경, 외부 리다이렉트, 실패 제한을 검사합니다.

기존 30일 쿠키도 유효기간 안에 방문하면 재입력 없이 1년 쿠키로 갱신됩니다. 인증된 요청마다 만료일이 현재 시각에서 365일 뒤로 연장됩니다. 쿠키 삭제·브라우저의 저장 정책·1년 미방문 시 재입력이 필요합니다.

입장 쿠키는 Secure, HttpOnly, SameSite=Lax이며 도메인별로 발급합니다. 응답은 private/no-store로 공유 캐시에 저장되지 않습니다. 기존 localStorage 읽기 기록·책갈피는 변경하지 않습니다.

# Legacy external diagnostic

지원 범위의 정본은 [계약 가이드의 지원 범위](../../references/contracts.md#지원-범위-2026-11-05)다.

이 디렉터리는 소스 체크아웃에서 과거 외부 연동을 수동 조사할 때만 사용한다. `npm test`, npm 패키지, 플러그인 payload에 포함되지 않는다. 이 진단이 통과해도 현재 지원이나 향후 호환성을 보장하지 않는다.

원본 외부 저장소 네 개를 확보했을 때 실행한다. 자동 경로 탐색이나 누락 허용 옵션은 없으며, 하나라도 설정하지 않았거나 필요한 파일이 없으면 실패한다. 과거의 `MPW_ALLOW_MISSING_EXTERNAL_INTEGRATION` 환경변수는 실패를 억제하지 않는다.

```sh
IMAGE_REFERENCE_ADAPTER_ROOT=<path> \
DESIGN_REFERENCE_ADAPTER_ROOT=<path> \
HIGGSFIELD_BRIDGE_ROOT=<path> \
PROMPT_KNOWLEDGE_ADAPTER_ROOT=<path> \
  python3 tools/legacy/test_adapter_master_integration.py
```

외부 구현 없이 경로 누락 시 실패하는 동작만 확인하려면 다음을 실행한다. 이 검사는 외부 연동의 호환성 검증이 아니다.

```sh
python3 tools/legacy/test_adapter_master_integration.py ExternalDependencyPolicyTests
```

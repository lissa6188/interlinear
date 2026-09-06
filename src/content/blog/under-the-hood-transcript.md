---
title: '후드를 열다: Copilot Studio 대화 기록(Transcript) 기술 레퍼런스'
description: 'Copilot Studio 대화 기록의 데이터 구조부터 여섯 가지 조회 방법, MCS Agent Analyser까지 실무자가 알아야 할 핵심을 정리했어요.'
date: 2026-09-07
tags: ["Copilot Studio", "Transcript", "Dataverse", "Application Insights", "MCS Agent Analyser"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/under-the-hood-transcript/card-01.png
  - /cards/under-the-hood-transcript/card-02.png
  - /cards/under-the-hood-transcript/card-03.png
  - /cards/under-the-hood-transcript/card-04.png
  - /cards/under-the-hood-transcript/card-05.png
  - /cards/under-the-hood-transcript/card-06.png
  - /cards/under-the-hood-transcript/card-07.png
---

> **원문:** [Open the Hood: Technical Reference for Copilot Studio Transcripts](https://microsoft.github.io/mcscatblog/posts/open-the-hood-technical-reference/)
> **게시일:** 2026-03-19 · **저자:** Roel Schenk

**이 글은 [후드를 열다: 당신의 Copilot Studio 에이전트는 실제로 무엇을 하고 있는가](https://microsoft.github.io/mcscatblog/posts/open-the-hood-copilot-studio-transcripts/)의 기술 편이에요. 그 글은 여러분이 어떤 시나리오에 해당하고 어디서 시작해야 하는지를 알려 주고, 이 글은 전체 레퍼런스를 제공해요.**

**이 글에서 다루는 내용:**

1. [데이터 모델 이해하기](#데이터-모델-이해하기) - 레코드, 세션, 대화, 그리고 그 경계가 중요한 이유
2. [대화 경계 관리하기](#대화-경계-관리하기) - Teams 같은 지속형 채널을 위한 기법
3. [Dataverse vs Application Insights](#dataverse-vs-application-insights) - 전체 비교 표, 역할, 주의 사항
4. [대화 기록을 얻는 여섯 가지 방법](#대화-기록을-얻는-여섯-가지-방법) - 상세한 안내와 코드가 포함된 여섯 가지 방법 전부
5. [MCS Agent Analyser](#mcs-agent-analyser) - 결정론적<sup>1</sup> 구조 수준 분석 도구

---

## 데이터 모델 이해하기

### 레코드, 세션, 대화

서로 다른 네 가지 개념이 있는데, "대화(conversation)"라는 말을 이 모두를 한꺼번에 가리키는 데 쓰다 보니 혼란이 생겨요.

**ConversationId**는 스레드 식별자예요. 사용자가 에이전트와 대화를 시작할 때 할당되며, 그 사용자의 채널 세션이 존재하는 동안 동일하게 유지돼요. 트랜스크립트 테이블에서는 `Name` 열에 `{ConversationId}_{BotId}` 형태로 포함되어 있어요. 오류 메시지나 디버그 패널에서 보게 되는 ID가 바로 이거예요. "이 사용자의 상호작용에 관한 모든 것을 찾기" 위한 기본 키(primary key)예요.

> **팁:** 오류 메시지나 테스트 창의 디버그 정보에서 얻은 대화 ID는 트랜스크립트의 `Name` 필드에 그대로 매핑돼요. `Name`이 해당 대화 ID로 시작하는 레코드를 필터링하면 일치하는 레코드를 찾을 수 있어요.

**레코드(Record)**: `ConversationTranscript` 테이블의 한 행이에요. 레코드 하나 = 비활성 구간(inactivity window) 하나 = `ConversationStartTime` 하나예요. 사용자가 30분 동안 자리를 비웠다가 돌아오면 새 레코드가 기록돼요. `Name`은 같지만(같은 ConversationId) `ConversationStartTime`이 새로 생겨요. 하나의 비활성 구간에서 1MB가 넘는 콘텐츠가 생성되면, 그 구간은 여러 레코드로 분할돼요. 이 레코드들은 같은 `Name`과 같은 `ConversationStartTime`을 공유하며, `BatchId`로 정렬해서 다시 합칠 수 있어요.

**세션(Session)**: Copilot Studio의 분석 단위이지 대화 초기화가 아니에요. 첫 사용자 메시지로 시작해 **30분의 비활성** 후에 끝나요. 각 세션은 자체 `SessionInfo` 액티비티를 가지며 그 결과(outcome)는 Resolved(해결), Escalated(에스컬레이션), Abandoned(이탈) 중 하나예요. 새 세션이 시작된다고 상태가 초기화되지는 **않아요**. 무엇이 이어지고 무엇이 이어지지 않는지는 [대화 경계 관리하기](#대화-경계-관리하기)를 참고하세요. 세션 하나 = 비활성 구간 하나 = 데이터의 `ConversationStartTime` 하나예요.

**대화(Conversation)**: 사람 관점의 개념이에요. 사용자가 경험한 모든 것이에요. 사용자가 자리를 비웠다 돌아오면 여러 세션에 걸칠 수 있어요. 트랜스크립트 테이블에는 네이티브한 "대화" 엔터티가 없어요. 같은 `Name`을 가진 모든 레코드를 그룹화해서 재구성해야 해요.

### 이 개념들의 관계

_Dataverse 레코드가 사용자 대화에 매핑되는 방식: 하나의 ConversationId가 여러 세션에 걸치고, 각 세션은 BatchId로 분할된 여러 레코드를 포함할 수 있어요._

**예시 시나리오:** 사용자가 9시에 질문하고 답을 받은 뒤 9시 5분에 후속 질문을 하고 자리를 떠요. 9시 40분에 돌아와 또 다른 질문을 해요. 사용자 입장에서는 하나의 대화지만, 데이터에서는 별도의 `SessionInfo` 액티비티와 잠재적으로 서로 다른 결과를 가진 **두 개의 세션**이에요. 첫 번째 세션이 해결되고 두 번째 세션이 이탈로 끝났다면, 분석에는 "혼합된 결과를 가진 하나의 대화"가 아니라 해결 1건과 이탈 1건으로 표시돼요.

**특정 트랜스크립트를 조회하려면** 테스트 창이나 오류 메시지에서 얻은 대화 ID로 `Name`이 그 대화 ID로 시작하는 레코드를 필터링하세요. 하나 이상의 레코드가 나와요. `ConversationStartTime`으로 그룹화하면 세션별로 볼 수 있어요. 각 그룹 안에서는 `BatchId`로 정렬해 순서대로 내용을 읽어요.

### 분석에서 이것이 중요한 이유

이 경계들을 이해하지 못하면 "대화 지속 시간"이나 "사용자당 대화 수"를 신뢰성 있게 측정할 수 없어요. 하나의 사용자 상호작용이 유휴 간격에 따라 세션 1개로 보일 수도, 3개로 보일 수도 있어요. 레코드나 "대화"가 아니라 **세션**을 기본 측정 단위로 세세요.

---

## 대화 경계 관리하기

30분 후에 시작되는 새 세션은 **분석 경계일 뿐**이에요. 새 `SessionInfo` 액티비티와 새 트랜스크립트 레코드를 생성하지만, 대화 이력, 세션 변수, LLM 컨텍스트를 초기화하지는 **않아요**. Teams나 Microsoft 365 Copilot 같은 채널에서는 대화 스레드가 무기한 지속돼요. 세션 경계를 넘어 이력이 누적되고, LLM 컨텍스트가 오래된 턴들로 채워지며, 에이전트가 혼란스러운 답변을 내놓기 시작해요. 테스트 창과 달리 자동 "초기화(Reset)" 버튼도 없어요.

더 깔끔한 경계를 위해 명시적인 대화 종료 신호("완료" 버튼, 종료 토픽, 만족도 설문)를 추가할 수 있어요. 하지만 능동적으로 개입하지 않는 한, 세션 카운터가 올라가도 대화 상태는 그대로 이어져요.

이를 관리하는 두 가지 기법이 있어요.

1. **비활성 초기화 토픽.**<br>
   **"사용자가 한동안 비활성 상태입니다(The user is inactive for a while)"** 트리거(예: 15분)를 사용해 세션 변수와 대화 이력을 지우고, 대화를 종료하고, 해결됨으로 표시하세요. Teams에서 `ConversationStart`는 [최초 설치 시 한 번만 실행](https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/deploy-agent-teams)되고 실제 초기화 역할은 인사(Greeting) 토픽이 하므로, 사용자에게 "hello"라고 말해 다시 시작하도록 안내하세요. 다른 채널은 다르게 동작할 수 있으니, 대상 채널에서 `ConversationStart` 동작을 테스트하세요.
2. **`/debug clearstate`.**<br>
   이 명령은 Teams에서 대화를 완전히 초기화해요. 상태를 지우고, 캐시된 커넥터 정보를 제거하고, 커넥터를 다시 인증하고, 최신 게시 버전을 로드해요. 에이전트의 도움말 메시지에 이를 문서화하고 지원 팀과 공유하세요.

> **팁:** Teams 관련 배포 패턴이 더 궁금하다면 [Microsoft Teams에서 Copilot Studio 에이전트를 배포하는 모범 사례](https://microsoft.github.io/mcscatblog/posts/copilot-studio-teams-deployment-ux/)와 [Microsoft 공식 가이드](https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/deploy-agent-teams)를 참고하세요.

---

## Dataverse vs Application Insights

에이전트의 데이터가 존재하는 곳은 이 두 군데예요. 서로 다른 목적을 수행하며, 대부분의 프로덕션 환경에서는 둘 다 필요해요.

| 항목 | Dataverse | Application Insights |
|---|---|---|
| 데이터 전달 | 풀(Pull, 필요할 때 쿼리) | 푸시(Push, 텔레메트리 스트리밍) |
| 설정 | 자동 | 직접 활성화 필요 |
| 지연 시간 | 약 30분 지연 | 거의 실시간 |
| 전체 트랜스크립트 JSON | 있음 | 없음 |
| 세션 결과 | 있음 | 없음 |
| CSAT 응답 | 있음 | 없음 |
| 오류 상세 / 스택 트레이스 | 제한적 | 있음 |
| 응답 지연 시간 | 타임스탬프만 | 전체 타이밍 데이터 |
| 의존성 호출 상태 | 없음 | 있음 |
| 알림(Alerting) | 없음 (Power Automate 필요) | 기본 제공 |
| 보존 기간 | 30일 (구성 가능) | 최대 730일 (구성 가능) |
| 쿼리 언어 | OData / FetchXML<sup>2</sup> | [KQL (Kusto Query Language)](https://learn.microsoft.com/en-us/kusto/query/) |

대화 내용과 결과에는 Dataverse를, 운영 상태 확인에는 Application Insights를 사용하세요.

### 각 데이터 소스에 접근하는 데 필요한 역할

| 하려는 일 | 필요한 역할 |
|---|---|
| Copilot Studio 테스트 창에서 트랜스크립트 보기 | 에이전트 메이커 또는 편집자 권한 |
| Copilot Studio 분석(Analytics)에서 트랜스크립트 보기 및 다운로드 | **Bot Transcript Viewer** 보안 역할 (Dataverse 환경 역할) |
| Power Apps에서 트랜스크립트 보기 및 다운로드 | **Bot Transcript Viewer** 보안 역할 (Dataverse 환경 역할) |
| Web API로 Dataverse 트랜스크립트 쿼리 | Dataverse 사용자에 대한 **Bot Transcript Viewer** 보안 역할 |
| Application Insights 텔레메트리 쿼리 | App Insights 리소스에 대한 **Reader** 또는 **Log Analytics Reader** (Azure RBAC<sup>3</sup>) |
| 환경의 트랜스크립트 설정 구성 | **환경 관리자(Environment administrator)** 또는 **시스템 관리자(System administrator)** 역할 |

> **주의:** **세션 결과는 Application Insights에 없어요.** 이것이 가장 흔한 혼란의 원인이에요. App Insights는 운영 텔레메트리(오류, 지연 시간, 의존성 상태)를 제공해요. 세션 결과(Resolved, Escalated, Abandoned)는 Dataverse에만 있어요. 운영 대시보드에 오류율과 해결률이 모두 필요하다면, 두 데이터 소스가 모두 필요해요.

> **주의:** **개발자 환경에서는 트랜스크립트가 기록되지 않아요.** 개발자 환경은 설정과 무관하게 트랜스크립트 레코드를 생성하지 않아요. 샌드박스나 프로덕션 환경을 사용하세요. 자세한 내용은 [대화 기록이 보이지 않는 이유](https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-transcripts-powerapps#why-cant-i-see-my-conversation-transcripts-in-the-conversationtranscript-power-apps-table)를 참고하세요.

> **주의:** **트랜스크립트에는 PII<sup>4</sup>가 포함돼요.** 대화 데이터에는 개인적인 사용자 상호작용, 잠재적으로 민감한 비즈니스 데이터, 개인 식별 정보가 포함돼요. **Bot Transcript Viewer** 역할은 아껴서 부여하고, 실제 대화 접근에는 4-eyes 원칙(두 사람의 승인)을 적용하세요. 자세한 내용은 [트랜스크립트 접근 제어](https://learn.microsoft.com/en-us/microsoft-copilot-studio/admin-transcript-controls)를 참고하세요.

---

## 대화 기록을 얻는 여섯 가지 방법

| 방법 | 최적 용도 | 시나리오 | 코드 필요 여부 |
|---|---|---|---|
| **테스트 창** | 개발 중 빠른 디버깅 | 메이커 | 아니요 |
| **분석 UI** | 세션 결과 내보내기 및 CSV 다운로드 | 메이커, 분석가 | 아니요 |
| **Power Apps 테이블** | 원시 트랜스크립트 JSON 탐색 | 메이커, 분석가 | 아니요 |
| **Dataverse Web API** | 스크립트 기반 분석과 파이프라인 | 메이커, 분석가 | 예 |
| **Application Insights** | 실시간에 가까운 운영 모니터링과 알림 | 트리아지, 운영 | 아니요 (KQL 쿼리) |
| **Copilot Studio Kit** | 사전 구축된 대시보드, KPI, 자동화된 분석 | 분석가, 운영 | 아니요 (솔루션 설치) |

### 1. 테스트 창
**개발 중 빠른 실시간 디버깅**

무슨 일이 일어나고 있는지 확인하는 가장 빠른 방법이에요. 작성 캔버스에서 에이전트를 테스트하면 테스트 창이 어떤 토픽이 실행되었고 에이전트가 어떻게 라우팅했는지를 포함해 대화 흐름을 실시간으로 보여 줘요. 개발과 빠른 디버깅에는 훌륭하지만, 현재 테스트 중인 대화만 보여 줘요.

> **팁:** 테스트 창에서 "Test your agent" 옆의 **...**(점 세 개)를 클릭하고 **스냅샷 저장(Save snapshot)**을 선택하세요. 대화 트랜스크립트와 해당 에이전트의 전체 빌드 구성이 모두 담긴 `botcontent`라는 zip 파일이 다운로드돼요. 오프라인 분석이나 동료와의 공유에 매우 유용해요.

### 2. 분석 UI
**세션 결과와 트랜스크립트가 포함된 노코드 CSV 내보내기**

코드가 필요 없어요.

1. Copilot Studio에서 에이전트를 열어요
2. **분석(Analytics)**으로 이동해요
3. 날짜 범위를 선택해요
4. **개요(Overview)** 카드 위에서 **세션 다운로드(Download Sessions)**를 선택해요
5. Download Sessions 창에서 행을 선택해 지정된 기간의 세션 트랜스크립트를 다운로드해요

**얻을 수 있는 것:** 세션 결과, 턴 수, "User says / Bot says" 형식의 채팅 트랜스크립트, 그리고 `SessionOutcome`(Resolved, Escalated, Abandoned)과 최초 사용자 메시지 같은 기본 메타데이터가 담긴 CSV.

**얻을 수 없는 것:** 지식 소스 상세 정보, 인텐트 점수, 도구 호출, 노드 트레이스가 담긴 풍부한 JSON. 그런 데이터가 필요하면 Dataverse나 Application Insights를 사용해야 해요.

> **주의:** CSV의 `ChatTranscript` 필드에는 **봇 응답당 512자 제한**이 있어요. 더 긴 응답은 잘려요. 세션당이 아니라 응답당 제한이에요. CSV에서 답변이 잘려 보인다면 그 이유가 이거예요. 전체 내용이 필요하면 Power Apps 테이블 보기나 Dataverse API를 사용하세요.

**제한 사항:** 최근 29일 데이터만 제공해요. 자세한 내용은 [Copilot Studio에서 대화 기록 다운로드](https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-transcripts-studio)를 참고하세요.

### 3. Power Apps 테이블
**코드나 다운로드 없이 원시 트랜스크립트 JSON 탐색**

Power Apps 메이커 포털에서 원시 트랜스크립트 데이터를 바로 볼 수 있어요. 코드도, 다운로드도 필요 없어요.

1. [make.powerapps.com](https://make.powerapps.com)에 로그인해요
2. 사이드 창에서 **테이블(Tables)**, 그다음 **모두(All)**를 선택해요
3. "ConversationTranscript"를 검색해요
4. **ConversationTranscript** 테이블을 선택해요
5. 레코드를 직접 탐색하거나, **내보내기(Export) > 데이터 내보내기(Export data)**를 선택해 CSV로 다운로드해요

이렇게 하면 모든 원시 JSON이 담긴 전체 `Content` 열, `Metadata` 열, 대화 시작 시간, 봇 식별자에 접근할 수 있어요. UI에서 바로 필터링하고 정렬할 수 있어요.

특정 에이전트나 날짜 범위로 필터링하는 **뷰(views)**를 설정해 두면 특정 에이전트를 시간에 걸쳐 쉽게 모니터링할 수 있어요.

> **팁:** 대규모 리포팅에는 [Dataverse의 Microsoft Fabric 링크](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/azure-synapse-link-view-in-fabric)를 사용해 `ConversationTranscript` 테이블을 Fabric 레이크하우스에 동기화하세요. 거기서 데이터플로나 자동화된 노트북으로 원시 트랜스크립트 JSON을 구조화된 시맨틱 모델로 파싱한 뒤, Power BI에서 그 모델을 쿼리하면 돼요. Dataverse API 한도에 걸리지 않으면서 데이터 형태와 새로 고침 주기를 완전히 제어할 수 있어요.

### 4. Dataverse Web API
**스크립트 기반 분석과 파이프라인을 위한 프로그래밍 방식 접근**

프로그래밍 방식의 경로예요. 트랜스크립트를 스크립트로 가져오거나, 파이프라인에 공급하거나, 자체 분석 도구를 만들 때 사용하세요. 클라이언트 시크릿은 필요 없어요. 브라우저로 로그인하면 토큰이 여러분의 자격 증명을 사용해요. Dataverse 계정에 **Bot Transcript Viewer** 역할이 있어야 하고, 앱 등록에서 Microsoft Entra ID의 **"공용 클라이언트 흐름 허용(Allow public client flows)"**이 Yes로 설정되어 있어야 해요. 예제는 대화형 브라우저 인증을 위해 [MSAL (Microsoft Authentication Library)](https://learn.microsoft.com/en-us/entra/msal/overview)을 사용해요.

```python
import msal, requests, json  # json needed to parse the Content column

# --- Configuration ---
client_id = "your-app-registration-client-id"  # Must allow public client flows
tenant_id = "your-entra-id-tenant-id"
org = "your-dataverse-org-name"          # e.g. "contoso" (from contoso.crm.dynamics.com)
bot_guid = "your-copilot-studio-bot-id"  # Find in Copilot Studio > Settings > Session details > Copilot ID

# Interactive browser login (delegated permissions, no secret)
app = msal.PublicClientApplication(
    client_id,
    authority=f"https://login.microsoftonline.com/{tenant_id}"
)
token = app.acquire_token_interactive(
    scopes=[f"https://{org}.crm.dynamics.com/user_impersonation"]
)

# Query recent transcripts for a specific agent
response = requests.get(
    f"https://{org}.crm.dynamics.com/api/data/v9.2/conversationtranscripts",
    headers={
        "Authorization": f"Bearer {token['access_token']}",
        "OData-Version": "4.0",
        "Accept": "application/json"
    },
    params={
        "$filter": (
            f"_bot_conversationtranscriptid_value eq '{bot_guid}'"
            " and conversationstarttime ge 2026-02-01T00:00:00Z"
        ),
        "$select": "name,content,metadata,conversationstarttime",
        "$orderby": "conversationstarttime desc",
        "$top": "100"
    }
)

transcripts = response.json().get("value", [])
```

> **참고:** `_bot_conversationtranscriptid_value` 조회 속성이 에이전트별로 트랜스크립트를 필터링하는 올바른 방법이에요. [ConversationTranscript 엔터티 레퍼런스](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/reference/conversationtranscript?view=dataverse-latest)에서 확인할 수 있어요. `bot_guid`는 Copilot Studio의 **설정(Settings) > 세션 상세 정보(Session details)**에 있는 Copilot ID예요.

**알아 둘 것:**

- 트랜스크립트는 실시간이 아니라 **대화 비활성 후 30분**이 지나야 기록돼요. 자세한 내용은 [트랜스크립트 보존 방식](https://learn.microsoft.com/en-us/microsoft-copilot-studio/admin-transcript-controls)을 참고하세요.
- 기본 보존 기간은 **30일**이에요. Power Apps의 대량 삭제 작업이 더 오래된 레코드를 자동으로 제거해요. 기존 대량 삭제 작업을 취소하고 다른 보존 기간의 새 작업을 만들어 [이 일정을 변경](https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-transcripts-powerapps)할 수 있어요. 장기 저장에는 [Dataverse의 Microsoft Fabric 링크](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/azure-synapse-link-view-in-fabric)로 Fabric 레이크하우스에 동기화하거나(권장), [Azure Synapse Link for Dataverse](https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/custom-analytics-strategy)로 Azure Data Lake Storage Gen2에 내보내세요.
- 각 레코드의 `Content` 열에는 **1MB 제한**이 있어요. 더 긴 대화는 같은 `Name`과 `ConversationStartTime`을 공유하고 `Metadata.BatchId`로 구분되는 여러 레코드에 분할돼요. `BatchId`로 정렬해서 병합하세요.

### 5. Application Insights
**알림 기능을 갖춘 거의 실시간의 운영 텔레메트리**

Copilot Studio 에이전트가 **Azure Application Insights**에 연결되어 있으면, Dataverse 트랜스크립트를 보완하는(경우에 따라 그 이상의) 텔레메트리 데이터를 얻을 수 있어요.

Application Insights가 캡처하는 것:

- 각 대화 턴의 요청 및 응답 타이밍
- 의존성 호출(지식 소스 조회, 도구 호출, 커넥터 호출)
- 오류 및 예외 상세 정보
- 에이전트 실행 과정의 커스텀 이벤트와 트레이스

핵심 장점은 30분 지연이 있는 Dataverse 트랜스크립트와 달리 **Application Insights 데이터는 거의 실시간으로 제공**된다는 점이에요. 에이전트 성능을 실시간으로 모니터링하거나 오류율이 급증할 때 알림을 설정해야 한다면, 이 방법이 정답이에요.

미리 만들어진 출발점으로는 Application Insights용 [Copilot Studio Analytics Template Workbook](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-bot-framework-composer-capture-telemetry#analytics-template-workbook)을 확인하세요. 오류율, 지연 시간, 가용성에 대한 운영 대시보드를 즉시 제공해요.

Application Insights 데이터는 Azure 포털에서 **KQL (Kusto Query Language)**로 쿼리할 수 있고, [Azure Monitor 데이터 소스](https://learn.microsoft.com/en-us/power-bi/connect-data/service-connect-to-services)를 통해 Power BI에 연결하거나, 장기 보존을 위해 Log Analytics로 내보낼 수 있어요.

에이전트를 연결하려면 Copilot Studio에서 **설정(Settings) > 고급(Advanced) > Application Insights**로 이동해 연결 문자열을 구성하세요. 그곳에 세 가지 로깅 토글이 있어요. **Log activities**(수신/발신 메시지 및 이벤트), **Log sensitive Activity properties**(사용자 ID, 이름, 메시지 텍스트), **Log node tools**(각 토픽 노드 실행에 대한 이벤트)예요. 전체 안내는 [Application Insights에 에이전트 연결하기](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-bot-framework-composer-capture-telemetry)를 참고하세요.

> **팁:** **테스트 창 트래픽을 필터링하세요.** Copilot Studio는 모든 텔레메트리에 `DesignMode` 커스텀 디멘션을 태그해요. KQL 쿼리에서 `where customDimensions['DesignMode'] == "False"`를 사용해 테스트 창 대화를 제외하고 프로덕션 트래픽만 분석하세요.

> **주의:** **`user_Id`가 항상 실제 사용자를 뜻하지는 않아요.** 웹챗 같은 익명 채널에서 Application Insights의 `user_Id`는 대화마다 바뀌는 세션 기반 식별자예요. 그런 시나리오에서 "고유 사용자 수" 같은 지표는 실제로는 "고유 대화 수"를 의미해요. 인증된 채널만 안정적인 사용자 자격 증명을 제공해요.

#### 전체 대화 트레이스 쿼리

위의 간단한 쿼리들은 빠른 조회에 좋아요. 대화에서 정확히 무슨 일이 있었는지 이해하고, 응답 지연 시간을 측정하고, 모든 토픽과 액션을 순서대로 확인하는 더 깊은 조사에는 아래의 확장 분석 쿼리를 사용하세요. 원시 `customEvents` 데이터를 사람이 읽을 수 있는 레이블로 보강하고, 이벤트 간 타이밍을 계산하며, 전환 가능한 다섯 가지 출력 모드를 제공해요. 사용자가 신고한 문제를 트리아지하고 있다면, 이 쿼리를 언제 써야 하는지에 대해 [트리아지 워크플로](https://microsoft.github.io/mcscatblog/posts/open-the-hood-copilot-studio-transcripts/#supportops-triage-a-user-reports-a-problem)를 참고하세요.

`targetConversation`을 특정 대화 ID로 설정하거나, 비워 두어 모든 대화를 트레이스하세요. 출력 모드 A(시간순 트레이스)가 기본으로 활성화되어 있으며, 다른 블록 중 하나의 주석을 해제하면 전환돼요.

> **참고:** 아래 코드는 **KQL (Kusto Query Language)**이지만, 이 사이트가 KQL 구문 강조를 지원하지 않아 SQL 강조로 렌더링돼요.

<details markdown="1">
<summary><strong>전체 대화 트레이스 쿼리</strong> — 다섯 가지 출력 모드를 가진 약 200줄의 KQL <em style="color: #3b82f6; font-weight: normal;">(클릭하여 펼치기)</em></summary>

```sql
// ============================================================================
// MCS Full Conversation Trace — Extensive Analysis Query
// ============================================================================
// Replace the conversationId below, or remove the filter to trace all conversations.
// Works in the classic App Insights scope (customEvents table).
// ============================================================================

let targetConversation = "your-conversation-id";  // set to "" for all conversations

// ── Step 1: Extract and enrich every field we have ──────────────────────────
let enriched = customEvents
| where cloud_RoleName == "Microsoft Copilot Studio"
| extend conversationId = tostring(customDimensions["conversationId"])
| where isempty(targetConversation) or conversationId == targetConversation
| extend
    // Identity
    agent           = cloud_RoleInstance,
    channelId       = tostring(customDimensions["channelId"]),
    isDesignMode    = tostring(customDimensions["DesignMode"]),
    // Message fields
    messageText     = tostring(customDimensions["text"]),
    speakText       = tostring(customDimensions["speak"]),
    fromId          = tostring(customDimensions["fromId"]),
    recipientId     = tostring(customDimensions["recipientId"]),
    recipientName   = tostring(customDimensions["recipientName"]),
    activityType    = tostring(customDimensions["type"]),
    replyActivityId = tostring(customDimensions["replyActivityId"]),
    locale          = tostring(customDimensions["locale"]),
    // Topic fields
    topicName       = tostring(customDimensions["TopicName"]),
    topicId         = tostring(customDimensions["TopicId"]),
    trigger         = tostring(customDimensions["Trigger"]),
    action          = tostring(customDimensions["Action"]),
    // Action fields
    actionId        = tostring(customDimensions["ActionId"]),
    actionKind      = tostring(customDimensions["Kind"]);

// ── Step 2: Build the chronological trace with timing + classification ──────
let trace = enriched
| order by conversationId asc, timestamp asc
| extend
    prevConv      = prev(conversationId),
    prevTimestamp  = prev(timestamp),
    prevEventName  = prev(name)
| extend
    deltaMs = iff(conversationId == prevConv, (timestamp - prevTimestamp) / 1ms, 0.0)
// Classify each event into a human readable category
| extend eventCategory = case(
    // Messages
    name == "BotMessageReceived" and activityType == "message",  "USER MESSAGE",
    name == "BotMessageReceived" and activityType == "event",    "TRIGGER EVENT",
    name == "BotMessageReceived",                                "INCOMING",
    name == "BotMessageSend",                                    "BOT RESPONSE",
    // Topic lifecycle
    name == "TopicStart" and isnotempty(trigger),                "TOPIC START (triggered)",
    name == "TopicStart",                                        "TOPIC START",
    name == "TopicEnd",                                          "TOPIC END",
    // Actions by Kind
    name == "TopicAction" and actionKind == "SetVariable",             "ACTION: SetVariable",
    name == "TopicAction" and actionKind == "SendActivity",            "ACTION: SendActivity",
    name == "TopicAction" and actionKind == "SearchAndSummarizeContent","ACTION: SearchAndSummarize",
    name == "TopicAction" and actionKind == "Question",                "ACTION: Question",
    name == "TopicAction" and actionKind == "Condition",               "ACTION: Condition",
    name == "TopicAction" and actionKind == "HttpRequest",             "ACTION: HttpRequest",
    name == "TopicAction" and actionKind == "RedirectToTopic",         "ACTION: Redirect",
    name == "TopicAction",                                             strcat("ACTION: ", actionKind),
    name
  )
// Build a display label for the trace line
| extend traceLabel = case(
    name == "BotMessageReceived",
        strcat(eventCategory, " | ",
            iff(strlen(messageText) > 120, strcat(substring(messageText, 0, 120), "..."), messageText)),
    name == "BotMessageSend",
        strcat(eventCategory, " | ",
            iff(strlen(messageText) > 120, strcat(substring(messageText, 0, 120), "..."), messageText)),
    name == "TopicStart",
        strcat(eventCategory, " | ", topicName,
            iff(isnotempty(trigger), strcat(" [trigger: ", trigger, "]"), ""),
            iff(isnotempty(action), strcat(" [action: ", action, "]"), "")),
    name == "TopicEnd",
        strcat(eventCategory, " | ", topicName),
    name == "TopicAction",
        strcat(eventCategory, " | ", topicName,
            iff(isnotempty(actionId), strcat(" (", actionId, ")"), "")),
    strcat(eventCategory, " | ", name)
  );

// ── Step 3: Conversation level summary ──────────────────────────────────────
let convSummary = trace
| summarize
    startTime           = min(timestamp),
    endTime             = max(timestamp),
    totalEvents         = count(),
    userMessages        = countif(name == "BotMessageReceived"),
    botResponses        = countif(name == "BotMessageSend"),
    topicsTriggered     = countif(name == "TopicStart"),
    topicsCompleted     = countif(name == "TopicEnd"),
    actionsExecuted     = countif(name == "TopicAction"),
    uniqueTopics        = dcount(iff(name == "TopicStart", topicName, "")),
    uniqueActionKinds   = dcount(iff(name == "TopicAction", actionKind, "")),
    topicList           = make_set(iff(name == "TopicStart", topicName, ""), 50),
    actionKindList      = make_set(iff(name == "TopicAction", actionKind, ""), 50),
    channelId           = take_any(channelId),
    agent               = take_any(agent),
    isDesignMode        = take_any(isDesignMode)
    by conversationId
| extend
    durationSec         = (endTime - startTime) / 1s,
    topicsDropped       = topicsTriggered - topicsCompleted,
    // Remove empty strings from sets
    topicList           = set_difference(topicList, dynamic([""])),
    actionKindList      = set_difference(actionKindList, dynamic([""]));

// ── Step 4: Topic execution timing ──────────────────────────────────────────
let topicTiming = trace
| where name in ("TopicStart", "TopicEnd")
| extend topicEvent = iff(name == "TopicStart", "start", "end")
| summarize
    topicStartTime = minif(timestamp, name == "TopicStart"),
    topicEndTime   = maxif(timestamp, name == "TopicEnd")
    by conversationId, topicName
| extend topicDurationMs = (topicEndTime - topicStartTime) / 1ms
| where isnotnull(topicStartTime) and isnotnull(topicEndTime)
| order by conversationId asc, topicStartTime asc;

// ── Step 5: Response latency (time from last user message to bot response) ──
let responseTiming = trace
| where name in ("BotMessageReceived", "BotMessageSend")
| order by conversationId asc, timestamp asc
| extend prevEvent = prev(name), prevTs = prev(timestamp), prevConvId = prev(conversationId)
| where name == "BotMessageSend" and prevEvent == "BotMessageReceived" and conversationId == prevConvId
| extend responseLatencyMs = (timestamp - prevTs) / 1ms
| project conversationId, timestamp, responseLatencyMs;

// ── Step 6: Action breakdown per topic ──────────────────────────────────────
let actionBreakdown = trace
| where name == "TopicAction"
| summarize
    actionCount     = count(),
    actionKinds     = make_set(actionKind),
    actionIds       = make_set(actionId)
    by conversationId, topicName
| order by conversationId asc;

// ============================================================================
// OUTPUT: Choose which result set to render by uncommenting one block below.
// ============================================================================

// ── A. Full chronological trace (default) ───────────────────────────────────
trace
| project
    timestamp,
    conversationId,
    agent,
    channelId,
    traceLabel,
    deltaMs,
    // Raw fields for drill down
    name,
    topicName,
    actionKind,
    actionId,
    messageText,
    trigger,
    action,
    isDesignMode,
    session_Id
| order by conversationId asc, timestamp asc

// ── B. Conversation summary (uncomment to use) ─────────────────────────────
// convSummary
// | project
//     conversationId, agent, channelId, isDesignMode,
//     startTime, endTime, durationSec,
//     userMessages, botResponses,
//     topicsTriggered, topicsCompleted, topicsDropped,
//     actionsExecuted,
//     uniqueTopics, topicList,
//     uniqueActionKinds, actionKindList
// | order by startTime desc

// ── C. Topic execution timing (uncomment to use) ───────────────────────────
// topicTiming
// | project conversationId, topicName, topicStartTime, topicEndTime, topicDurationMs
// | order by conversationId asc, topicStartTime asc

// ── D. Response latency (uncomment to use) ─────────────────────────────────
// responseTiming
// | project conversationId, timestamp, responseLatencyMs
// | order by conversationId asc, timestamp asc

// ── E. Action breakdown per topic (uncomment to use) ───────────────────────
// actionBreakdown
// | project conversationId, topicName, actionCount, actionKinds, actionIds
// | order by conversationId asc
```

</details>

**출력 모드:**

| 모드 | 보여 주는 것 |
|------|---------------|
| **A. 시간순 트레이스** (기본) | 사람이 읽을 수 있는 레이블, 타이밍 델타, 드릴다운용 원시 필드와 함께 모든 이벤트를 순서대로 표시 |
| **B. 대화 요약** | 대화당 한 행: 지속 시간, 메시지 수, 토픽 목록, 액션 분류 |
| **C. 토픽 실행 타이밍** | 토픽별 시작/종료 타임스탬프와 지속 시간 |
| **D. 응답 지연 시간** | 각 사용자 메시지와 다음 봇 응답 사이의 시간 |
| **E. 액션 분류** | 각 토픽에서 실행된 액션과 그 개수 및 종류 |

### 6. Copilot Studio Kit
**사전 구축된 트랜스크립트 분석, KPI, 대시보드**

자체 도구를 만들고 싶지 않다면, 이미 누군가가 만들어 두었어요. [Copilot Studio Kit](https://github.com/microsoft/Power-CAT-Copilot-Studio-Kit)은 Microsoft Power CAT 팀이 만든 무료 오픈 소스 Power Platform 솔루션이에요. 환경에 설치하면 트랜스크립트 분석(그리고 훨씬 더 많은 것)을 즉시 사용할 수 있어요.

트랜스크립트와 관련해 제공하는 것:

- **[Conversation KPIs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/kit-conversation-kpi)**는 트랜스크립트를 자동으로 파싱해 세션, 턴, 결과(해결, 에스컬레이션, 이탈) 등 집계된 결과 데이터를 Dataverse에 생성하며, 선택적으로 전체 트랜스크립트 저장과 내장 트랜스크립트 시각화 도구도 제공해요. KPI는 하루 두 번 자동으로, 또는 필요할 때 즉시 생성돼요.
- **[Conversation Analyzer](https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/kit-conversation-analyzer)**는 트랜스크립트에 커스텀 AI 프롬프트를 실행해 감정 분석, 개인 데이터 감지 등 여러분이 정의하는 어떤 패턴이든 인사이트로 끌어낼 수 있게 해요. 두 가지 내장 프롬프트가 제공되며, 직접 만들어 재사용하는 커스텀 프롬프트도 지원해요.

하지만 Kit은 트랜스크립트를 훨씬 넘어서요. AI 채점 루브릭을 사용한 테스트 자동화, 테넌트 전체 가시성을 위한 에이전트 인벤토리, 거버넌스 정책을 위한 컴플라이언스 허브, 채팅 외관을 커스터마이징하는 웹챗 플레이그라운드 등이 포함되어 있어요. 프로덕션에서 에이전트를 운영하고 있다면 설치할 가치가 있어요. 전체 기능 목록은 [Copilot Studio Kit 개요](https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/kit-overview)를 참고하세요.

---

## MCS Agent Analyser

트랜스크립트만 분석하면 무슨 일이 일어났는지는 알 수 있지만, 왜 그런지는 알 수 없어요. 그러려면 에이전트가 어떻게 만들어졌는지 이해해야 해요. [MCS Agent Analyser](https://github.com/Roelzz/mcs-agent-analyser)는 두 가지 관점, 즉 에이전트 구조와 런타임 동작을 나란히 보여 주는 오픈 소스 Python 도구예요. 결정론적 분석을 사용하므로 LLM이 필요 없어요.

**주요 기능:**

- 연결 맵을 포함한 토픽, 스킬, 엔터티 시각화
- 트리거 중복 감지를 포함한 라우팅 결정 트리
- 18개의 내장 모범 사례 검증 규칙과 커스텀 YAML 규칙
- 결정론적 인스트럭션 감사
- 배치 대화 분석
- 버전 간 나란히 비교
- 실행 타임라인 간트 차트<sup>5</sup>

**파싱 대상:**

- 봇 내보내기 파일(`botContent.yml`, `dialog.json`)
- 대화 트랜스크립트(JSON)
- 라이브 Dataverse 연결
- Power Platform 솔루션 내보내기

이 도구는 추측을 없애 줘요. 무엇이 잘못됐는지 이해하려고 트랜스크립트 JSON과 Copilot Studio UI를 오가는 대신, 구조와 동작을 나란히 볼 수 있어요. 로컬에서 실행되므로 에이전트 구성과 트랜스크립트가 여러분 환경을 벗어나지 않아요. 특히 [메이커 디버깅](https://microsoft.github.io/mcscatblog/posts/open-the-hood-copilot-studio-transcripts/#maker-debugging-youre-building-and-somethings-not-working)과 [지원/운영 트러블슈팅](https://microsoft.github.io/mcscatblog/posts/open-the-hood-copilot-studio-transcripts/#supportops-triage-a-user-reports-a-problem)에 유용해요.

### **[여기서 확인하세요](https://github.com/Roelzz/mcs-agent-analyser)**

---

여기까지 데이터 모델, 여섯 가지 접근 방법 전부, 그리고 그 모든 것을 이해하기 위한 도구를 다뤘어요. 이제 적용해 볼 차례예요. [메인 포스트](https://microsoft.github.io/mcscatblog/posts/open-the-hood-copilot-studio-transcripts/)로 돌아가 여러분 시나리오에 맞는 접근법을 찾거나, 곧바로 [MCS Agent Analyser](https://github.com/Roelzz/mcs-agent-analyser)로 이동해 에이전트 분석을 시작하세요.

---

## 어휘 주석

1. **결정론적(deterministic):** 같은 입력을 넣으면 언제나 같은 결과가 나오는 방식. 여기서는 LLM의 판단을 거치지 않고, 정해진 규칙만으로 구조를 분석한다는 뜻이에요.
2. **OData / FetchXML:** Dataverse 데이터를 조회할 때 쓰는 두 가지 쿼리 언어. OData는 REST API 표준 형식이고, FetchXML은 Dataverse 전용 XML 기반 쿼리 언어예요.
3. **RBAC(Role-Based Access Control):** 사용자의 역할에 따라 시스템 접근 권한을 나눠 부여하는 권한 관리 방식.
4. **PII(Personally Identifiable Information):** 이름, 연락처처럼 특정 개인을 식별할 수 있는 정보.
5. **간트 차트(Gantt chart):** 작업이나 이벤트를 시간 축을 따라 막대로 표시해, 시작·종료 시점과 소요 시간을 한눈에 보여 주는 차트.

---
title: '"Hello"보다 먼저 문을 닫는 관리자 제어'
description: 'Copilot Studio의 새 옵션 Require Microsoft authentication이 직원용 에이전트의 로그인 전 화면을 어떻게 막는지, 적용 전 확인할 점까지 정리했어요.'
date: 2026-09-04
tags: ["Copilot Studio", "에이전트 인증", "관리자 제어", "Direct Line", "Power Platform"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/agent-auth-admin-controls/card-01.png
  - /cards/agent-auth-admin-controls/card-02.png
  - /cards/agent-auth-admin-controls/card-03.png
  - /cards/agent-auth-admin-controls/card-04.png
  - /cards/agent-auth-admin-controls/card-05.png
  - /cards/agent-auth-admin-controls/card-06.png
  - /cards/agent-auth-admin-controls/card-07.png
---
> **원문:** [The Admin Control That Closes the Door Before "Hello"](https://microsoft.github.io/mcscatblog/posts/agent-authentication-controls/)
> **게시일:** 2026-06-14 · **저자:** Adi Leibowitz

더 많은 주목을 받아야 마땅한, 비교적 조용히 공개된 기능이 있어요. Copilot Studio의 [**에이전트 인증(Authentication for agents)**](https://learn.microsoft.com/en-us/power-platform/admin/security/configure-authentication-controls-for-agents) 관리자 제어에 새 옵션인 **Microsoft 인증 필수(Require Microsoft authentication)**가 추가됐어요. 조직에서 메이커가 만든 에이전트에 사용자들이 *어떻게* 로그인하는지를 중요하게 생각한다면, 특히 내부 직원 대상 에이전트라면, 이 글을 꼭 읽어보시길 바라요.

이 기능은 처음 보기보다 미묘한 거버넌스 질문을 다뤄요. 인증을 필수로 만드는 것은 쉬운 부분이에요. 에이전트를 `manual auth with Entra ID`로 전환하면 사용자는 로그인해야만 사용할 수 있어요. 하지만 그것이 문을 닫는 것과 같지는 않아요. `manual auth`를 사용하면 채팅을 여는 누구든 Direct Line 대화를 수립하고, 메이커가 편집할 수 있는 로그인 메시지를 보게 되는데, 이 모든 게 인증 *전에* 일어나요. 진짜 질문은 내부 에이전트가 인증되지 않은 방문자, 혹은 애초에 이 에이전트와 대화할 권한이 없는 방문자에게 인사말조차 포함해 **아무것도** 노출하지 않도록 보장하는 방법이에요. 이게 왜 어색한 문제였는지, 그리고 새 옵션이 어떻게 마침내 답을 주는지 보려면, 데이터 손실 방지(DLP)의 한 가지 특이점부터 시작해야 해요.

## 하나의 레버, 완전히 다른 두 개의 API

DLP와 프리뷰 중인 새 에이전트 설정은 관리자에게 채널을 차단하는 방법을 줘요. 쉬운 첫수는 [DLP 커넥터](https://learn.microsoft.com/en-us/microsoft-copilot-studio/admin-data-loss-prevention?tabs=webapp#block-publishing-to-specific-channels) **Chat without Microsoft Entra ID authentication**을 차단하는 것으로, 익명 에이전트를 막아줘요. 많은 조직이 이렇게 하고 거기서 멈춰요.

하지만 조직들은 대개 **Direct Line 채널(Direct Line channels)**은 활성화된 상태로 두는데, 여기엔 그럴 만한 이유가 있어요. 직원 대상 커스텀 UI에 저희가 권장하는 경로는 **M365 Agents SDK Copilot Studio 클라이언트**예요. 이 결정에 대해서는 [Copilot Studio 에이전트를 통합하는 모든 경로](https://microsoft.github.io/mcscatblog/posts/copilot-studio-api-decision-guide/)에서, 인증 패턴은 [수동 인증은 아마 필요 없습니다](https://microsoft.github.io/mcscatblog/posts/you-dont-need-manual-auth/)에서 다룬 바 있어요. 그런데 문제는 SDK 클라이언트의 위임 인증(delegated-auth) 경로가 바로 그 **Direct Line 채널** 레버로 제어된다는 점이에요. 그 레버를 끄면 **SDK 클라이언트도 함께 망가져요**.

동시에, 직원 대상 에이전트에서 순수 `Direct Line`을 비활성화하고 싶은 타당한 이유도 있어요. `Direct Line`에는 인증 전 콘텐츠 표면이 조금 있어요. 사용자가 `Direct Line` / WebChat 경험을 열면 연결이 성공하는 즉시, 로그인 전에 대화가 수립돼요. 에이전트가 인증을 요구하면 사용자에게 로그인 프롬프트가 표시되는데, 그 메시지 텍스트는 메이커가 편집할 수 있어요.

_On Sign In 토픽. 이 인사말은 메이커가 작성한 것으로, 사용자가 인증하기 전에 표시될 수 있어요._

이 표면은 이미 공개 콘텐츠가 있는 고객 대상 에이전트에는 문제가 되지 않아요. 공개 은행 웹사이트는 모두에게 인사한 다음, 로그인 후에만 계좌 정보를 보여줄 수 있으니까요. 직원 대상 경험은 달라요. 처음부터 끝까지 인증돼야 하고, 자격 증명 경계 앞에 어떤 공개 콘텐츠도 없어야 해요.

**M365 Agents SDK Copilot Studio 클라이언트**는 다르게 동작해요. 인증 전에는 Copilot Studio로부터 응답을 받을 수 없으므로, 인증 전 대화도 없고 유출될 메이커 작성 콘텐츠도 없어요. 그래서 직원 대상 앱에 잘 맞는 거예요.

따라서 실제 요구 사항은 구체적이에요. SDK 클라이언트는 유지하되, 순수 `Direct Line`의 인증 전 표면은 닫아야 해요. 오늘날의 공유된 **Direct Line 채널** 레버는 두 연결 방식을 한꺼번에 제어하기 때문에 이런 요구를 표현할 수 없어요.

## 새 제어가 답하는 방식

[Power Platform 관리 센터](https://admin.powerplatform.microsoft.com/)의 **보안(Security) > ID 및 액세스(Identity and access)** 아래에 있는 [**에이전트 인증(Authentication for agents)** (프리뷰)](https://learn.microsoft.com/en-us/power-platform/admin/security/configure-authentication-controls-for-agents) 창은 메이커가 Copilot Studio에서 *선택할 수 있는* 인증 방법에 대한 환경 수준 정책을 설정해요. 최근 여기에 새 옵션이 추가됐어요.

> **주의:** 이 글을 쓰는 시점(2026년 6월)에 이 기능은 프리뷰이며 변경될 수 있어요.

네 가지 옵션 중 하나를 선택하면 메이커의 선택지가 그에 맞게 축소돼요.

_Security > Identity and access 아래에 있어요. "Require Microsoft authentication"이 사용자 대면 측면에서 가장 엄격한 새 옵션이에요._

| 관리자 정책 | 메이커가 구성할 수 있는 것 | 차단되는 것 |
| --- | --- | --- |
| **No authentication** | 익명 포함 모든 것 | 없음 |
| **Require Microsoft authentication** | `Authenticate with Microsoft`만 | `manual auth`와 익명 액세스 |
| **Require Entra authentication** | `Authenticate with Microsoft` 또는 `manual auth with Entra ID` | 익명 액세스와 `manual Generic OAuth 2` |
| **Allow all supported methods** | Microsoft, `manual Entra ID`, 또는 `manual Generic OAuth 2` | 익명 액세스 |

여기서 중요한 차이가 있어요. 관리자는 이미 **Require Entra authentication**을 강제할 수 있었지만, 그래도 메이커는 여전히 `manual auth with Entra ID`를 선택할 수 있었고, `manual auth`야말로 인증 전 로그인 표면을 열어두는 바로 그 방식이에요. 새로운 **Require Microsoft authentication** 옵션은 더 엄격해요. 통합된 `Authenticate with Microsoft` 모드만 강제하고 다른 것은 허용하지 않아요. 메이커의 선택지는 애초에 인증 전 콘텐츠 표면이 없는 단 하나의 모드로 축소되고, 어떤 커넥터가 어떤 채널 뒤에 숨어 있는지 아무도 고민할 필요가 없어져요.

이게 앞서 언급한 Direct Line 딜레마를 조용히 해결해 주는 지점이기도 해요. 순수 `Direct Line`은 `Authenticate with Microsoft`를 지원하지 않아요. 이를 강제하면 엔드포인트는 여전히 접근 가능하지만, `Direct Line` 클라이언트는 이제 메이커가 편집할 수 있는 그 로그인 메시지를 포함해 어떤 콘텐츠도 공유되기 전에 오류를 받아요. SDK 클라이언트는 같은 채널 위에서 계속 동작하고, 인증 전 표면은 다른 모두에게 닫혀요. **Direct Line 채널** 레버는 손댈 필요조차 없었어요.

강제 적용은 실질적인 효력이 있어요. 정책을 강화하면 더 이상 정책을 준수하지 않는 이미 게시된 에이전트는 메이커가 다시 맞출 때까지 **게시가 차단되고 응답을 멈춰요**.

## 왜 (지금은) 더 세밀한 DLP 설정이 아니라 인증 제어인가

Direct Line 커넥터와 SDK 클라이언트를 분리하는, 더 세밀한 DLP를 요구하고 싶은 것이 본능적인 반응이에요. 나중에 나올 수도 있지만(약속은 아니에요), 이 문제를 해결하는 데 실제로 그게 필요하지는 않아요. 개발자들이 직원용 커스텀 웹 또는 네이티브 앱을 만든다면, SDK 클라이언트가 계속 동작하도록 **Direct Line 채널**을 허용된 상태로 두고, 인증 전 노출을 닫기 위해 **Require Microsoft authentication**을 강제하세요. 채널은 켜져 있고, 허점은 닫혀요.

이게 이 제어가 채널이 아니라 인증 방법을 중심으로 설계된 이유이기도 해요. 관리자는 사실 Direct Line 대 SDK라는 프로토콜에는 관심이 없어요. 그건 *개발자*의 개념이니까요. 관리자가 원하는 건 **자격 증명에 대한 태세(identity posture)**, 즉 "여기의 에이전트는 진짜 Microsoft 로그인을 요구해야 한다"는 거예요. 결정을 인증 방법 쪽에 두면 API는 개발자의 관심사로, 자격 증명 요구 사항은 관리자의 관심사로 남아요.

## 이 설정을 어떻게 활용할 것인가

새로 만드는 모든 직원 대상 환경에서는 처음부터 이 설정을 **Require Microsoft authentication**으로 유지하세요. 어떤 환경의 모든 에이전트가 이 설정을 버텨낼 자신이 없다면, 그건 대개 환경 전략에 손질이 필요하다는 신호예요. 직원 대상 시나리오와 고객 대상 시나리오는 애초에 같은 환경을 공유해서는 안 되기 때문이에요.

## 그런데 기존 에이전트는? 영향 범위를 평가하세요

이미 에이전트를 호스팅하는 환경에는 함정이 있어요. 강제 적용이 소급된다는 거예요. **Require Microsoft authentication**을 켜는 순간, 이미 `Authenticate with Microsoft`를 사용하지 않는 모든 게시된 에이전트는 메이커가 업데이트할 때까지 게시가 차단되고 응답을 멈춰요. 따라서 스위치를 켜기 전에, 얼마나 많은 에이전트를 망가뜨리게 될지 알아야 해요.

오늘날 이를 알아내는 가장 실용적인 방법은 [Copilot Studio Kit](https://marketplace.microsoft.com/en-us/product/dynamics-365/microsoftpowercatarch.copilotstudiokit2?tab=overview)예요. Kit의 인벤토리 모듈은 환경을 스캔해서 각 에이전트의 인증 구성을 포함한 세부 정보를 Dataverse에 기록해요. **Agent Details** 테이블을 열고 **End User Authentication Type** 열을 확인하세요.

_Copilot Studio Kit 인벤토리는 각 에이전트의 인증 유형을 기록해요. `Integrated`가 아닌 모든 것은 Authenticate with Microsoft를 강제하는 순간 차단될 에이전트예요._

규칙은 간단해요. `Integrated` 이외의 어떤 값이든, 빈 값을 포함해, `Authenticate with Microsoft`를 강제하는 순간 차단될 에이전트예요. `Integrated`는 인벤토리에서 `Authenticate with Microsoft`를 나타내는 레이블이고, 그 외의 것들(`Custom Entra ID`, `Generic OAuth 2`, 인증 없음을 뜻하는 빈 값 등)은 새 정책 밖에 있어요. 이 열을 필터링해서 `Integrated`가 아닌 행을 세면, 영향 범위와 함께 정책을 저장하기 전에 미리 알려야 할 에이전트 메이커들의 목록도 얻을 수 있어요.

Kit의 인벤토리와 거버넌스 모듈이 할 수 있는 일을 더 자세히 보려면 [Copilot Studio Kit: 테스트 자동화를 넘어서](https://microsoft.github.io/mcscatblog/posts/copilot-studio-kit/)를 참고하세요.

## 핵심 요점

- **새 제어:** **Require Microsoft authentication**(Security > Identity and access 아래)은 메이커에게 `Authenticate with Microsoft`만 강제해서, 수동 Entra 인증조차 열어두는 인증 전 콘텐츠 표면을 닫아요.
- **존재 이유:** **Direct Line 채널**을 차단하면 SDK 클라이언트의 위임 인증 경로도 함께 무너지므로, DLP로는 실제로 권장하는 통합 방식을 망가뜨리지 않고 인증 전 표면을 닫을 수 없어요. 인증 방법 제어는 가능해요.
- **기본 태세:** 직원 대상 에이전트만 호스팅하는 환경(시나리오를 섞지 마세요)에서는 **Require Microsoft authentication**을 기본값으로 삼으세요. 커스텀 웹 UI는 M365 Agents SDK 클라이언트를 통해 여전히 완전히 지원돼요.
- **강제하기 전에:** 강제 적용은 소급되므로, Copilot Studio Kit 인벤토리로 **End User Authentication Type**이 `Integrated`가 아닌 에이전트를 세어보세요. 그게 영향 범위예요.

Direct Line 대 SDK 클라이언트를 둘러싼 더 세밀한 DLP는 고객 피드백에 따라 나중에 나올 수도 있어요(어느 쪽으로도 약속은 없어요). 그때까지, 직원 대상 에이전트에 누가 접근할 수 있는지 통제하고 싶다면, 채널 토글보다 인증 요구 사항이 더 깔끔한 출발점이에요.

여러분의 조직은 오늘날 직원 대상 에이전트와 고객 대상 에이전트 사이의 경계를 어떻게 긋고 있나요? 댓글로 의견을 들려주세요.

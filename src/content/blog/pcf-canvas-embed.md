---
title: 'PCF 컨트롤로 캔버스 앱에 Copilot Studio 에이전트 임베드하기'
description: '캔버스 앱 기본 Copilot 컨트롤이 사용 중단된 지금, ChatControl PCF로 Copilot Studio 에이전트를 임베드하는 방법과 준비물을 정리했어요.'
date: 2026-09-07
tags: ["PCF", "ChatControl", "Copilot Studio", "캔버스 앱", "SSO"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/pcf-canvas-embed/card-01.png
  - /cards/pcf-canvas-embed/card-02.png
  - /cards/pcf-canvas-embed/card-03.png
  - /cards/pcf-canvas-embed/card-04.png
  - /cards/pcf-canvas-embed/card-05.png
  - /cards/pcf-canvas-embed/card-06.png
  - /cards/pcf-canvas-embed/card-07.png
  - /cards/pcf-canvas-embed/card-08.png
---

> **원문:** [Embed Copilot Studio Agents in Canvas Apps with a PCF Control](https://microsoft.github.io/mcscatblog/posts/embed-copilot-studio-agents-canvas-apps/)
> **게시일:** 2026-04-17 · **저자:** Dieter De Cock

Power Apps에서 캔버스 앱을 만들면서 AI 기반 채팅 경험을 추가하고 싶었다면, 아마 기본 제공 **Copilot 컨트롤**을 써 보셨을 거예요. 몇 번의 클릭만으로 앱에 AI 어시스턴트를 바로 넣을 수 있었죠. 편리했잖아요?

그런데 문제가 있어요. [이 컨트롤은 이제 사용 중단(deprecated)됐어요](https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/add-ai-copilot). 2026년 2월 2일부터 새 캔버스 앱에는 더 이상 추가할 수 없어요. 이미 쓰고 있던 기존 앱은 당분간 계속 동작하지만, 결말은 이미 정해져 있어요. Microsoft는 **캔버스 앱의 Microsoft 365 Copilot**으로 마이그레이션할 것을 권장하지만, 아직 모든 곳에서 쓸 수 있는 건 아니에요.

그렇다면 *지금 당장* 캔버스 앱에 Copilot Studio 에이전트를 임베드해야 한다면 어떻게 해야 할까요?

## ChatControl PCF 컴포넌트의 등장

GitHub의 Copilot Studio Samples 리포지토리에는 바로 이 시나리오를 위해 만들어진 [ChatControl PCF 컴포넌트](https://github.com/microsoft/CopilotStudioSamples/tree/main/ui/embed/pcf-canvas-app)가 있어요. 내부적으로 [Fluent UI](https://developer.microsoft.com/en-us/fluentui#/) 테마가 적용된 [Bot Framework WebChat](https://github.com/microsoft/botframework-webchat)을 써서, Copilot Studio 에이전트를 캔버스 앱에 직접 임베드할 수 있게 해주는 Power Apps Component Framework(PCF) 컨트롤이에요.

캔버스 앱이나 PCF 컨트롤이 처음이라면 두 가지를 간단히 짚고 넘어갈게요.

### 캔버스 앱이란?

캔버스 앱은 Power Apps에서 만들 수 있는 앱 유형 중 하나예요. 픽셀 수준까지 레이아웃을 제어할 수 있는 시각적 드래그 앤 드롭 앱 빌더라고 생각하면 돼요. 캔버스 위에 컨트롤을 배치하고(그래서 캔버스라는 이름이 붙었어요), 데이터 원본을 연결하고, [Power Fx](https://learn.microsoft.com/en-us/power-platform/power-fx/overview)로 수식을 작성해 동작을 정의해요. 필드 서비스 도구, 고객 조회 화면, 승인 대시보드처럼 특정 작업에 특화된 앱을 코드 없이 만들 때 인기가 많아요.

### PCF 컨트롤이란?

PCF는 [Power Apps Component Framework](https://learn.microsoft.com/en-us/power-apps/developer/component-framework/overview)의 약자예요. 개발자가 TypeScript, HTML, CSS 같은 표준 웹 기술로 사용자 지정 재사용 가능 컨트롤을 만들고, 이를 기본 제공 컨트롤처럼 Power Apps 안에서 쓸 수 있게 해주는 프레임워크예요. 기본 컨트롤로는 요구 사항을 채울 수 없을 때, PCF가 플랫폼을 확장하는 방법이에요. 컨트롤은 Power Platform 솔루션으로 패키징되므로 환경 간에 가져오고 공유할 수 있어요. 여기서 다루는 ChatControl이 바로 그런 것으로, Bot Framework WebChat과 M365 Agents SDK를 감싸서 캔버스 앱에 바로 넣을 수 있는 컴포넌트로 만든 PCF 컨트롤이에요.

> **참고:** 캔버스 앱에서 PCF 컨트롤을 쓰려면 먼저 [환경에서 PCF 컨트롤을 활성화](https://learn.microsoft.com/en-us/power-apps/developer/component-framework/component-framework-for-canvas-apps)해야 해요.

## 그냥 대체 기능을 기다리면 안 될까요?

타당한 질문이에요. Microsoft는 [캔버스 앱의 Microsoft 365 Copilot](https://releaseplans.microsoft.com/?app=Power+Apps&planID=d8f2152f-1e0e-f111-8407-7ced8d183a37)이 권장되는 방향이라고 발표했어요. 하지만 환경과 롤아웃 일정에 따라 아직 쓸 수 없을 수도 있어요. 지금 당장 임베드된 에이전트가 필요한 프로덕션 앱이 있다면, 이 PCF 컨트롤이 그 간극을 메워줘요.

그리고 솔직히 말하면 단순히 간극을 메우는 것 이상이에요. 예전 기본 제공 컨트롤에는 없던 추가 기능들도 함께 딸려 와요.

## 이 컨트롤이 흥미로운 이유

### 기본 제공 SSO 인증

이 컨트롤은 TypeScript용 [Microsoft 365 Agents SDK](https://learn.microsoft.com/en-us/microsoft-cloud/dev/dev-environment/microsoft-365-agents-sdk)를 써서 Copilot Studio 에이전트에 보안 연결을 설정해요. Single Sign-On(SSO)<sup>1</sup>을 기본으로 지원하므로, 사용자는 추가 로그인 프롬프트 없이 매끄럽게 인증돼요.

> **참고:** SSO를 설정하려면 Azure 앱 등록과 Azure, Copilot Studio 양쪽에서의 몇 가지 구성이 필요해요. [설정 가이드](https://github.com/microsoft/CopilotStudioSamples/blob/main/ui/embed/pcf-canvas-app/README.md)에서 단계를 자세히 안내해요.

### 사용자 지정 스타일링

추가 이점 중 하나로, 채팅 인터페이스를 앱의 룩앤필에 맞게 스타일링할 수 있어요. 이 컨트롤은 [Bot Framework WebChat](https://github.com/microsoft/botframework-webchat) 기반으로 만들어졌기 때문에 WebChat이 제공하는 것과 같은 스타일 옵션을 지원해요. 회사 브랜드 색상에 맞추거나, 글꼴 크기를 조정하거나, 채팅 말풍선 레이아웃을 손보고 싶으신가요? 모두 가능해요. WebChat 스타일링으로 무엇이 가능한지 궁금하다면 [JavaScript 없이 WebChat 임베드하기](https://microsoft.github.io/mcscatblog/posts/webchat-embed-zero-javascript/) 글에서 몇 가지 옵션을 다루고, [ServiceNow 임베딩 현장 리포트](https://microsoft.github.io/mcscatblog/posts/servicenow-copilot-studio-widget/)에서 사용자 지정 스타일이 적용된 WebChat의 실제 사례를 볼 수 있어요.

### 에이전트로 메시지와 이벤트 보내기

여기서부터 정말 유용해져요. 이 컨트롤을 쓰면 캔버스 앱이 Copilot Studio 에이전트로 메시지, 심지어 사용자 지정 이벤트까지 보낼 수 있어요. 이게 왜 중요할까요?

고객 레코드를 보여주는 캔버스 앱이 있다고 상상해 보세요. 사용자가 고객을 선택하고 채팅을 열어요. 사용자가 "지금 Contoso 고객을 보고 있어요"라고 직접 입력하게 하는 대신, 대화가 시작될 때 앱이 그 컨텍스트를 에이전트에 자동으로 보낼 수 있어요. 에이전트는 이를 받아 추가 프롬프트 없이 곧바로 해당 고객과 관련된 정보를 가져올 수 있고요.

이런 종류의 컨텍스트 전달은 에이전트를 평범한 채팅 어시스턴트에서 앱과 깊이 통합된 존재로 바꿔놔요. 사용자가 한마디 하기도 전에 에이전트가 무엇을 보고 있는지 아는 거예요.

### 에이전트 응답을 앱에서 받기

통신은 양방향으로 이뤄져요. 캔버스 앱도 에이전트로부터 응답을 받아서 그에 따라 동작할 수 있어요. 이게 가능하게 하는 일들을 생각해 보세요.

- 에이전트가 고객의 최근 지원 티켓을 조회하고 요약을 반환해요. 앱은 채팅 밖의 전용 패널에 이를 표시해요.
- 에이전트가 연락처의 업데이트된 주소를 추천해요. 앱은 그 응답을 받아 업데이트 폼에 미리 채워 넣고, 사용자는 클릭 한 번으로 확인하고 저장해요.
- 에이전트가 들어온 요청을 분류해요. 앱은 그 분류를 사용해 워크플로를 라우팅해요.

이런 양방향 통신이 단순한 임베드 채팅과 진짜로 통합된 경험을 가르는 지점이에요. 앱과 에이전트가 같은 화면에 나란히 있는 이웃이 아니라, 협력자가 되는 거죠.

_양방향 통신이 적용된 샘플 캔버스 앱: 왼쪽 텍스트 상자가 에이전트의 응답을 담고, 오른쪽에는 임베드된 에이전트 채팅이 있어요._

## 사전 요구 사항 및 설정

이걸 실행하려면 몇 가지가 필요해요.

1. Microsoft 인증으로 구성된 **게시된 Copilot Studio 에이전트**
2. SSO에 필요한 권한을 갖춘 **Azure 앱 등록**
3. Power Platform 환경의 **시스템 관리자 권한**
4. 대상 환경에서 **PCF 컴포넌트 활성화**

이 컨트롤은 Power Platform 솔루션 파일로 배포돼요. 환경에 가져온 다음, 다른 컨트롤과 마찬가지로 캔버스 앱에 컴포넌트를 추가하면 돼요. 구성 속성에는 Azure 앱의 클라이언트 ID, 테넌트 ID, 환경 ID, 에이전트 식별자가 포함돼요.

> **팁:** GitHub의 [전체 설정 가이드](https://github.com/microsoft/CopilotStudioSamples/blob/main/ui/embed/pcf-canvas-app/README.md)에서 Azure 앱 등록, 솔루션 가져오기를 위한 파일 크기 제한 늘리기, 캔버스 앱에서 속성 연결하기 등 각 단계를 자세히 다뤄요.

## 언제 사용해야 할까요?

| 시나리오 | 권장 사항 |
|----------|---------------|
| 지금 당장 캔버스 앱에 임베드된 에이전트가 필요함 | 이 PCF 컨트롤 사용 |
| 회사 브랜딩에 맞는 사용자 지정 스타일링이 필요함 | 이 PCF 컨트롤 사용 |
| 앱과 에이전트 간 양방향 통신이 필요함 | 이 PCF 컨트롤 사용 |
| 환경에서 PCF 컨트롤 사용이 허용되지 않음 | 캔버스 앱용 새 네이티브 Microsoft 365 Copilot 컨트롤을 기다리기 |
| 캔버스 앱이 아닌 모델 기반 앱을 사용함 | 새 [모델 기반 앱의 Microsoft 365 Copilot](https://learn.microsoft.com/en-us/power-apps/user/use-microsoft-365-copilot-model-driven-apps) 사용 |
| Power Apps 외부에서 웹 앱을 구축함 | [WebChat 임베딩](https://microsoft.github.io/mcscatblog/posts/webchat-embed-zero-javascript/) 또는 [통합 결정 가이드](https://microsoft.github.io/mcscatblog/posts/copilot-studio-api-decision-guide/) 참고 |

## 핵심 요약

- 캔버스 앱의 기본 제공 Copilot 컨트롤은 2026년 2월부로 **사용 중단**됐어요. 새 앱에는 더 이상 추가할 수 없어요.
- Copilot Studio Samples 리포지토리의 **ChatControl PCF 컴포넌트**는 지금 바로 쓸 수 있는 대안이에요.
- 단순한 대체품을 넘어, 예전 컨트롤에 없던 기능을 더해줘요. **사용자 지정 스타일링**, **앱에서 에이전트로 컨텍스트 전달**, **앱에서 에이전트 응답 수신**이 그것이에요.
- WebChat과 M365 Agents SDK 기반으로 만들어져 같은 생태계와 확장성의 이점을 누려요.
- **캔버스 앱 전용**으로 설계됐고, PCF 프레임워크를 써서 Power Apps 런타임과 네이티브로 통합돼요.

캔버스 앱에 Copilot Studio 에이전트를 임베드해 보셨나요? 이미 이 PCF 컨트롤을 쓰고 계신가요, 아니면 M365 Copilot 대체 기능을 기다리고 계신가요? 댓글로 알려 주세요.

---

## 어휘 주석

1. **SSO(Single Sign-On, 단일 로그인):** 한 번 로그인하면 여러 시스템·앱을 별도 로그인 없이 그대로 이용할 수 있게 해주는 인증 방식.

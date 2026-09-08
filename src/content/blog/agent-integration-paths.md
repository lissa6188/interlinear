---
title: 'Copilot Studio 에이전트를 통합하는 모든 경로'
description: 'Copilot Studio 에이전트를 Teams, 웹, 고객용 채팅, 모바일 앱에 연결하는 여러 방법과 상황별 선택 기준, 인증 방식 차이까지 정리했어요.'
date: 2026-09-08
tags: ["Copilot Studio", "WebChat", "Direct Line", "M365 Agents SDK", "통합가이드"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/agent-integration-paths/card-01.png
  - /cards/agent-integration-paths/card-02.png
  - /cards/agent-integration-paths/card-03.png
  - /cards/agent-integration-paths/card-04.png
  - /cards/agent-integration-paths/card-05.png
  - /cards/agent-integration-paths/card-06.png
  - /cards/agent-integration-paths/card-07.png
  - /cards/agent-integration-paths/card-08.png
---

> **원문:** [Every Path to Integrating Your Copilot Studio Agent](https://microsoft.github.io/mcscatblog/posts/copilot-studio-api-decision-guide/)
> **게시일:** 2026-03-02 · **저자:** Adi Leibowitz

어린 시절 저는 [*Choose Your Own Adventure*](https://en.wikipedia.org/wiki/Choose_Your_Own_Adventure)나 [*Fighting Fantasy*](https://en.wikipedia.org/wiki/Fighting_Fantasy) 같은 게임북이 세상에서 제일 멋진 것이라고 생각했어요. *[The Warlock of Firetop Mountain](https://en.wikipedia.org/wiki/The_Warlock_of_Firetop_Mountain)*, *[Citadel of Chaos](https://en.wikipedia.org/wiki/The_Citadel_of_Chaos)* 같은 작품들, 그 세계 전체 말이죠. 한 페이지를 읽고, 선택을 하고, 새로운 섹션으로 넘어가면 이야기가 완전히 다른 방향으로 갈라졌어요. 난이도도 무자비하게 어려워서, 자고르(Zagor)의 드래곤에게 그대로 걸어 들어가는 일을 피하려고 몇 번이나 몰래 뒷장을 훔쳐봤다는 것도 고백해요.

누군가 저에게 "Copilot Studio 에이전트를 우리 웹사이트나 앱에 어떻게 넣을 수 있나요?"라고 물을 때면 가끔 그 책들이 떠올라요. 선택지의 지형이 보기보다 훨씬 넓기 때문이에요.

- 노코드 임베드
- Teams 게시
- 두 가지 서로 다른 API(Direct Line과 M365 Agents SDK) 중 하나를 기반으로 하는 자체 호스팅 WebChat
- 서버 사이드 클라이언트
- WebChat을 아예 건너뛰고 자신만의 UI 프레임워크를 쓰는 옵션

각 경로마다 강점이 다르고, 인증 모델이 다르고, 필요한 노력의 수준도 달라요. Fighting Fantasy와 달리, 여러분이 통합 전략을 잘못 골라 세 번의 스프린트가 지난 뒤 체력이 바닥나고 엉뚱한 열쇠만 손에 쥔 채 [자고르의 미로](https://en.wikipedia.org/wiki/The_Warlock_of_Firetop_Mountain)에서 길을 잃는 일은 없었으면 해요.

다행인 것은, 그 분기 구조가 여기서는 실제로 잘 통한다는 점이에요. 서너 개의 질문에 답하면 올바른 답이 자연스럽게 도출돼요. 그래서 여러분이 대충 훑고 잊어버릴 또 하나의 비교 표를 쓰는 대신, 작은 인터랙티브 마법사(wizard)를 만들었어요. 질문에 답하고, 추천 결과에 도달하고, 곧바로 동작하는 코드 샘플로 이동하세요. 뒷장을 훔쳐볼 필요가 없어요.

---

## 마법사

<div id="api-wizard">
  <div id="wizard-card">
    <div id="wizard-progress"></div>
    <div id="wizard-content"></div>
    <div id="wizard-nav"></div>
  </div>
</div>

<style>
  #api-wizard {
    margin: 1.5rem 0 2.5rem;
  }

  #wizard-card {
    background: var(--card-bg);
    border: 1px solid var(--main-border-color, rgba(128, 128, 128, 0.2));
    border-radius: 0.75rem;
    padding: 1.75rem 1.5rem 1.25rem;
    box-shadow: var(--card-shadow);
    max-width: 100%;
  }

  #wizard-progress {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    margin-bottom: 1.25rem;
  }

  .wizard-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--main-border-color, rgba(128, 128, 128, 0.3));
    transition: background 0.2s;
  }

  .wizard-dot.active {
    background: var(--link-color);
  }

  .wizard-dot.done {
    background: var(--link-color);
    opacity: 0.5;
  }

  #wizard-content h3 {
    margin: 0 0 1rem;
    font-size: 1.1rem;
    color: var(--heading-color);
  }

  .wizard-options {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .wizard-btn {
    position: relative;
    display: block;
    width: 100%;
    padding: 0.85rem 1.15rem;
    background: var(--main-bg);
    color: var(--text-color);
    border: 1px solid var(--main-border-color, rgba(128, 128, 128, 0.2));
    border-radius: 0.5rem;
    cursor: pointer;
    font-size: 1.05rem;
    font-weight: 500;
    text-align: left;
    transition: background 0.15s, transform 0.1s;
    font-family: inherit;
    line-height: 1.4;
  }

  .wizard-btn::before {
    content: "";
    position: absolute;
    inset: 0;
    padding: 2px;
    border-radius: inherit;
    background: var(--post-frame-gradient, linear-gradient(90deg, #0078D4 0%, #5B8DEF 18%, #7F39FB 36%, #C26CF3 54%, #D83B73 72%, #FF8C00 100%));
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    z-index: 1;
  }

  .wizard-btn:hover::before {
    opacity: 1;
  }

  .wizard-btn:hover {
    border-color: transparent;
    transform: translateX(4px);
  }

  .wizard-result {
    text-align: center;
    padding: 0.5rem 0;
  }

  .wizard-result .result-label {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--label-color);
    margin-bottom: 0.25rem;
  }

  .wizard-result .result-name {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--heading-color);
    margin-bottom: 0.5rem;
  }

  .wizard-result .result-summary {
    color: var(--text-color);
    margin-bottom: 1.25rem;
    font-size: 0.95rem;
  }

  .wizard-jump-btn {
    display: inline-block;
    padding: 0.6rem 1.5rem;
    background: var(--link-color);
    color: #fff;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    font-size: 0.95rem;
    font-family: inherit;
    transition: opacity 0.15s;
    text-decoration: none;
  }

  .wizard-jump-btn:hover {
    opacity: 0.85;
  }

  #wizard-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.75rem;
    min-height: 2rem;
  }

  .wizard-back-btn {
    background: none;
    border: none;
    color: var(--link-color);
    cursor: pointer;
    font-size: 0.9rem;
    font-family: inherit;
    padding: 0.25rem 0;
  }

  .wizard-back-btn:hover {
    text-decoration: underline;
  }

  .wizard-restart-btn {
    background: none;
    border: none;
    color: var(--label-color);
    cursor: pointer;
    font-size: 0.85rem;
    font-family: inherit;
    padding: 0.25rem 0;
  }

  .wizard-restart-btn:hover {
    color: var(--link-color);
  }

  .wizard-back-link {
    display: inline-block;
    margin-top: 0.75rem;
    font-size: 0.9rem;
  }
</style>

<script>
(function() {
  var tree = {
    q1: {
      question: "Who is your agent for?",
      options: [
        { label: "For your employees (internal)", next: "q2-emp" },
        { label: "For your customers (external)", next: "q2-cust" }
      ]
    },
    "q2-emp": {
      question: "Where do you need to expose it?",
      options: [
        { label: "Microsoft 365 / Teams only", next: "teams" },
        { label: "On the web (website or web app)", next: "q3-emp" }
      ]
    },
    "q3-emp": {
      question: "What kind of chat experience do you want?",
      options: [
        { label: "No code — just embed what Microsoft provides", next: "nocode-embed" },
        { label: "Some code — self-host Microsoft’s WebChat library", next: "webchat-emp" },
        { label: "Full control — bring my own UI framework", next: "byo-ui" }
      ]
    },
    "q2-cust": {
      question: "Where do you need to expose it?",
      options: [
        { label: "On the web (website or web app)", next: "q3-cust" },
        { label: "Native mobile app (Android, iOS, Windows)", next: "native-mobile" },
        { label: "Server-side connector (backend)", next: "sdk-server" }
      ]
    },
    "q3-cust": {
      question: "What kind of chat experience do you want?",
      options: [
        { label: "No code — just embed what Microsoft provides", next: "nocode-embed" },
        { label: "Some code — self-host Microsoft’s WebChat library", next: "webchat-dl-cust" },
        { label: "Full control — bring your own UI (search box, inline answer, etc.)", next: "byo-ui-cust" }
      ]
    },
    teams: {
      leaf: true,
      name: "No API Needed (Publish to Teams/M365)",
      summary: "Your agent runs in Teams out of the box. No code, no API, no token management.",
      section: "no-api-needed-publish-to-teams"
    },
    "nocode-embed": {
      leaf: true,
      name: "Microsoft-Hosted WebChat (No-Code)",
      summary: "Copy an embed snippet from the portal. Zero JavaScript, zero build step.",
      section: "microsoft-hosted-webchat-no-code"
    },
    "webchat-emp": {
      leaf: true,
      name: "Self-Hosted WebChat (Employee-Facing)",
      summary: "Host WebChat yourself for full styling control and authentication flexibility.",
      section: "self-hosted-webchat-employee-facing"
    },
    "byo-ui": {
      leaf: true,
      name: "Bring Your Own UI (Employee-Facing)",
      summary: "Use the M365 Agents SDK with your own UI framework — Assistant UI, Vercel AI SDK, or custom.",
      section: "bring-your-own-ui-employee-facing"
    },
    "webchat-dl-cust": {
      leaf: true,
      name: "WebChat + Direct Line (Customer-Facing)",
      summary: "The same Direct Line pattern, framed and branded for external customers.",
      section: "webchat--direct-line-customer-facing"
    },
    "byo-ui-cust": {
      leaf: true,
      name: "Bring Your Own UI (Customer-Facing)",
      summary: "Call Copilot Studio via Direct Line from your own components — a search box, inline answer, or any non-chat interface.",
      section: "bring-your-own-ui-customer-facing"
    },
    "native-mobile": {
      leaf: true,
      name: "Native Mobile SDK (Preview)",
      summary: "Embed your agent in an Android, iOS, or Windows app using the Agents Client SDK. No-auth only for now.",
      section: "native-mobile-sdk"
    },
    "sdk-server": {
      leaf: true,
      name: "Server-Side Connector",
      summary: "Your backend talks to the agent, your frontend talks to your backend.",
      section: "server-side-connector"
    }
  };

  var history = [];
  var currentNode = "q1";
  var questionKeys = ["q1", "q2-emp", "q3-emp", "q2-cust"];

  function getMaxDepth(nodeId) {
    var node = tree[nodeId];
    if (!node || node.leaf) return 0;
    var max = 0;
    for (var i = 0; i < node.options.length; i++) {
      var d = getMaxDepth(node.options[i].next);
      if (d > max) max = d;
    }
    return 1 + max;
  }

  var totalSteps = getMaxDepth("q1") + 1;

  function render() {
    var node = tree[currentNode];
    var progressEl = document.getElementById("wizard-progress");
    var contentEl = document.getElementById("wizard-content");
    var navEl = document.getElementById("wizard-nav");

    var stepIndex = history.length;
    var dots = "";
    for (var i = 0; i < totalSteps; i++) {
      var cls = "wizard-dot";
      if (i < stepIndex) cls += " done";
      else if (i === stepIndex) cls += " active";
      dots += '<span class="' + cls + '"></span>';
    }
    progressEl.innerHTML = dots;

    if (node.leaf) {
      contentEl.innerHTML =
        '<div class="wizard-result">' +
          '<div class="result-label">Recommended</div>' +
          '<div class="result-name">' + node.name + '</div>' +
          '<div class="result-summary">' + node.summary + '</div>' +
          '<button class="wizard-jump-btn" onclick="document.getElementById(\'' + node.section + '\').scrollIntoView({behavior:\'smooth\',block:\'start\'})">Jump to details ↓</button>' +
        '</div>';
      navEl.innerHTML =
        '<button class="wizard-back-btn" onclick="wizardBack()">← Back</button>' +
        '<button class="wizard-restart-btn" onclick="wizardRestart()">Start over</button>';
    } else {
      var html = '<h3>' + node.question + '</h3><div class="wizard-options">';
      for (var j = 0; j < node.options.length; j++) {
        html += '<button class="wizard-btn" onclick="wizardChoose(\'' + node.options[j].next + '\')">' + node.options[j].label + '</button>';
      }
      html += '</div>';
      contentEl.innerHTML = html;

      if (history.length > 0) {
        navEl.innerHTML = '<button class="wizard-back-btn" onclick="wizardBack()">← Back</button><span></span>';
      } else {
        navEl.innerHTML = '';
      }
    }
  }

  window.wizardChoose = function(nextId) {
    history.push(currentNode);
    currentNode = nextId;
    render();
  };

  window.wizardBack = function() {
    if (history.length > 0) {
      currentNode = history.pop();
      render();
    }
  };

  window.wizardRestart = function() {
    history = [];
    currentNode = "q1";
    render();
  };

  render();
})();
</script>

---

## API가 필요 없는 경우 (Teams/M365에 게시)

직원들이 이미 Teams에서 하루를 보내고 있다면, 이 선택은 고민할 필요조차 없어요. Copilot Studio는 [Teams에 바로 게시](https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-add-bot-to-microsoft-teams)할 수 있으며, Teams는 일급(first-class) 채널이에요. 토큰 엔드포인트도, JavaScript도, 유지 관리할 인프라도 없어요. 그리고 지금 Teams를 선택한다고 해서 거기에 묶이는 것도 아니에요. 아래의 어떤 패턴으로든 나중에 웹 기반 경험을 언제든지 추가할 수 있어요. 배포 팁은 [Microsoft Teams에서 Copilot Studio 에이전트를 배포하는 모범 사례](https://microsoft.github.io/mcscatblog/posts/copilot-studio-teams-deployment-ux/)를, Teams와 M365에 게시해도 나중에 제약이 되지 않는 이유는 [Copilot Studio에서 수동 인증은 아마 필요 없을 겁니다](https://microsoft.github.io/mcscatblog/posts/you-dont-need-manual-auth/)를 참고하세요.

**이런 경우에 사용하세요:** 내부 지식 베이스, IT 헬프 데스크, HR FAQ 에이전트 등 사용자가 이미 Teams/M365에서 하루를 보내는 모든 시나리오.

[마법사로 돌아가기 &uarr;](#api-wizard)

---

## Microsoft 호스팅 WebChat (노코드)

웹 기반 채팅 경험이 필요하지만 코드를 작성하고 싶지 않다면, Copilot Studio가 WebChat을 대신 호스팅해 줄 수 있어요. 직원용 인트라넷과 고객용 웹사이트 모두에서 동작해요. 포털에서 **채널(Channels) > 웹 앱(Web app)**으로 이동하면 HTML에 바로 붙여 넣을 수 있는 iframe 임베드 스니펫을 찾을 수 있어요.

```html
<iframe
  src="https://copilotstudio.microsoft.com/environments/YOUR-ENV/bots/YOUR-AGENT-ID/webchat?__version__=2"
  frameborder="0"
  style="width: 100%; height: 500px;">
</iframe>
```

이게 전부예요. Microsoft가 WebChat 인스턴스를 호스팅하고, 토큰 수명 주기를 처리하고, 채팅 UI를 제공해요. 빌드 단계 없이 여러분 사이트에서 동작하는 에이전트를 얻게 돼요. 같은 페이지에는 M365 Agents SDK 연결 문자열도 표시돼요([문서](https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-integrate-web-or-native-app-m365-agents-sdk?tabs=dotnet#use-the-default-web-chat-embed-code-without-developmentcode) 참고).

트레이드오프는 무엇일까요? 인증이 구성되어 있는 경우, Microsoft 호스팅 임베드는 **수동 인증(manual authentication)**을 사용해요. 이 구현에서는 사용자가 브라우저 탭에서 매직 검증 코드를 복사해 붙여 넣어야 한다는 뜻이에요. 수동 인증 자체가 매직 코드를 강제하는 것은 아니고(호스팅 WebChat이 그렇게 구현했을 뿐이에요), 결과는 동일해요. 임베드를 통해서는 SSO를 사용할 방법이 없어요. 사용자가 이미 여러분 사이트에 로그인해 있고 매끄러운 인증을 원한다면, 대신 WebChat을 직접 호스팅해야 해요.

> **참고 (2026년 3월):** [공식 문서](https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-integrate-web-or-native-app-m365-agents-sdk?tabs=dotnet#use-the-default-web-chat-embed-code-without-developmentcode)에는 현재 임베드 코드가 인증이 "인증 없음(No authentication)"으로 설정된 경우에만 제공된다고 되어 있어요. 이는 정확하지 않아요. 임베드 코드는 "인증 없음"과 "수동 인증(Manual authentication)" 모두에서 제공되지만, "Microsoft로 인증(Authenticate with Microsoft)"으로 구성된 에이전트에서는 제공되지 않아요. 문서 업데이트를 진행 중이에요.

**SSO가 가능한 임베드 경험을 보고 싶으신가요?** 매끄러운 Entra ID 로그인이 되는 노코드 임베드가 여러분 시나리오에 유용할 것 같다면, 댓글로 알려 주세요.

**이런 경우에 사용하세요:** 내부 포털, 인트라넷 사이트, 고객용 웹사이트, 개념 증명(PoC) 등 SSO보다 "그냥 동작하는 것"이 더 중요한 모든 곳.

[마법사로 돌아가기 &uarr;](#api-wizard)

---

## 자체 호스팅 WebChat (직원용)

커스텀 브랜딩이 적용된 에이전트 경험에서 가장 흔한 패턴이에요. `botframework-webchat` 라이브러리를 직접 호스팅하여 스타일링, 동작, 인증에 대한 완전한 제어권을 가져요. 독립형 웹 앱에만 국한되지도 않아요. 같은 WebChat 컴포넌트를 [SharePoint](https://microsoft.github.io/CopilotStudioSamples/ui/embed/sharepoint-customizer/SharePointSSOAppCustomizer), [ServiceNow](https://microsoft.github.io/CopilotStudioSamples/ui/embed/servicenow-widget)([필드 리포트](https://microsoft.github.io/mcscatblog/posts/servicenow-copilot-studio-widget/) 참고), 또는 JavaScript를 호스팅할 수 있는 어떤 플랫폼에든 네이티브하게 임베드할 수 있어요.

핵심 패턴은 거의 항상 동일해요. WebChat 라이브러리를 임포트하고, 에이전트에 대한 연결을 생성한 뒤(옵션은 아래에서 자세히 다뤄요), 이를 WebChat에 전달해요.

```html
<script src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
<script>
// 1. Create a connection to your Copilot Studio agent.
//    This can use Direct Line or the M365 Agents SDK — see below.
var directLine = /* your connection */;

// 2. Render WebChat — this part is the same regardless of connection method.
window.WebChat.renderWebChat(
  {
    directLine: directLine,
    styleOptions: {
      hideUploadButton: true,
      bubbleBackground: '#e8f0fe',
      primaryFont: "'Segoe UI', sans-serif"
    }
  },
  document.getElementById('webchat')
);
</script>
```

`styleOptions` 객체를 사용하면 CSS를 전혀 작성하지 않고도 색상, 폰트, 말풍선 모양, 아바타 이미지 등을 제어할 수 있어요.

### 어떤 어댑터를 쓸까: Direct Line vs M365 Agents SDK

Copilot Studio는 WebChat을 에이전트에 연결하는 두 가지 API를 제공해요. **Direct Line**(공개 API)과 **M365 Agents SDK Copilot Studio 클라이언트**(SDK를 통해서만 접근할 수 있는 비공개 API를 감싼 것)예요. WebChat에는 두 API 모두를 위한 어댑터가 있으므로, 위의 렌더링 코드는 어느 쪽이든 동일하게 유지돼요.

직원용 시나리오에는 **M365 Agents SDK 클라이언트**를 권장해요. 이유는 다음과 같아요.

- **"Microsoft로 인증".**<br>
  SDK 클라이언트는 이 인증 모드를 필수로 요구하는데, 이는 B2E<sup>1</sup>에 딱 맞는 방식이에요. 매끄러운 Entra ID SSO(매직 코드 없음), 더 간단한 구성(앱 등록 하나), 그리고 SharePoint와 Graph 커넥터에 기반한 더 높은 품질의 응답을 제공하는 [Tenant Graph Grounding](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio#tenant-graph-grounding)이 활성화돼요. 거의 모든 직원용 시나리오에서 이 방식이 수동 인증보다 나은 이유는 [Copilot Studio에서 수동 인증은 아마 필요 없을 겁니다](https://microsoft.github.io/mcscatblog/posts/you-dont-need-manual-auth/)를 읽어 보세요.
- **스트리밍.**<br>
  SDK 클라이언트는 스트리밍 응답을 지원해요. Direct Line도 M365 Agents SDK로 만든 코드 우선(code-first) 에이전트에서는 스트리밍을 지원하지만, Copilot Studio 에이전트에서는 지원하지 않아요. 네, 저희도 이 아이러니를 알고 있어요.

수동 인증이 특별히 필요한 경우(예: Entra가 아닌 OAuth 공급자)라면 Direct Line도 여전히 유효한 선택이에요. 하지만 내부 에이전트에서는 드문 요구 사항이에요.

**공식 샘플과 문서:**

- **WebChat 커스터마이징:** [채팅 캔버스 커스터마이징](https://learn.microsoft.com/en-us/microsoft-copilot-studio/customize-default-canvas) (Direct Line을 사용하지만, 스타일링과 커스터마이징 패턴은 두 API 모두에 적용돼요)
- **M365 Agents SDK (권장):** [React Web Chat](https://github.com/microsoft/Agents/tree/main/samples/nodejs/copilotstudio-webchat-react), [Web Client](https://github.com/microsoft/Agents/tree/main/samples/nodejs/copilotstudio-webclient), [SharePoint SSO](https://microsoft.github.io/CopilotStudioSamples/ui/embed/sharepoint-customizer/SharePointSSOAppCustomizer), [ServiceNow Widget](https://microsoft.github.io/CopilotStudioSamples/ui/embed/servicenow-widget)
- **Entra SSO를 사용하는 Direct Line:** [웹 앱용 SSO 구성](https://learn.microsoft.com/en-us/microsoft-copilot-studio/configure-sso?tabs=webApp)

**이런 경우에 사용하세요:** 내부 웹 앱, SharePoint 사이트, ServiceNow 포털 등 스타일링 제어와 에이전트에 대한 인증된 접근이 필요한 모든 직원용 플랫폼.

[마법사로 돌아가기 &uarr;](#api-wizard)

---

## 자체 UI 사용 (직원용)

WebChat이 취향에 맞지 않을 수도 있어요. 팀에 이미 React 디자인 시스템이 있거나, [Assistant UI](https://www.assistant-ui.com/)나 [Vercel AI SDK](https://sdk.vercel.ai/) 같은 프레임워크에 깊이 투자하고 있어서, Microsoft 채팅 컴포넌트를 감싸는 방식이 아키텍처에 맞지 않을 수 있어요. 충분히 타당한 입장이고, Copilot Studio도 이를 지원해요.

연결 계층은 [위에서 설명한](#자체-호스팅-webchat-직원용) 것과 동일한 M365 Agents SDK 클라이언트이며, 인증과 스트리밍의 이점도 같아요. 차이점은 연결을 WebChat에 넘기는 대신, 여러분 자신의 컴포넌트에 연결한다는 것이에요. [Assistant UI + Copilot Studio 샘플](https://microsoft.github.io/CopilotStudioSamples/ui/custom-ui/assistant-ui/assistant-ui-mcs)이 그 모습을 보여 줘요. SDK를 통해 Copilot Studio 에이전트에 연결된 Assistant UI 컴포넌트 기반의 React 앱이에요.

트레이드오프: WebChat은 어댑티브 카드, 추천 액션, 파일 첨부, 입력 중 표시기, 그리고 수십 가지 Bot Framework 액티비티 타입을 기본으로 처리해요. 자체 UI를 사용하면 그 모든 것을 여러분이 책임져야 해요. 에이전트가 어댑티브 카드를 보냈는데 커스텀 UI가 이를 렌더링하지 못하면, 사용자는 아무것도 보지 못해요(더 나쁘게는 원시 JSON을 보게 돼요). 그리고 WebChat 자체도 [매우 폭넓게 커스터마이징](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/06.recomposing-ui)할 수 있어요. 이 비교는 곧 나올 WebChat 시리즈에서 더 깊이 다룰 예정이에요.

> **팁:** "BYO(자체 UI)가 필요하다"와 "WebChat이 그것도 할 수 있는 줄 몰랐다" 사이의 간극은 생각보다 훨씬 얇은 경우가 많아요.

**이런 경우에 사용하세요:** 특정 에이전틱 UX 프레임워크(Assistant UI, Vercel AI SDK 등)에 이미 투자하고 있고, Copilot Studio 에이전트를 거기에 네이티브하게 연결하고 싶을 때.

[마법사로 돌아가기 &uarr;](#api-wizard)

---

## WebChat + Direct Line (고객용)

고객용 웹사이트나 웹 앱에 채팅 경험을 임베드하는 가장 직관적인 방법이에요. 코드는 직원용 버전과 거의 동일해요. 달라지는 것은 맥락이에요. 고객은 아예 인증을 하지 않을 수도 있고, Entra가 아닌 공급자로 인증할 수도 있어요. Direct Line은 둘 다 지원해요. 인증된 고객을 위해서는 Google, Okta, Auth0 같은 [자격 증명 공급자와의 SSO](https://learn.microsoft.com/en-us/microsoft-copilot-studio/configure-sso-3p)를 구성할 수 있어요.

```html
<div id="webchat"></div>

<script
  src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js">
</script>
<script>
  fetch('https://YOUR-TOKEN-ENDPOINT/api/token')
    .then(function(response) { return response.json(); })
    .then(function(data) {
      window.WebChat.renderWebChat(
        {
          directLine: window.WebChat.createDirectLine({ token: data.token }),
          styleOptions: {
            botAvatarImage: 'https://your-site.com/bot-avatar.png',
            bubbleBackground: '#f0f0f0',
            bubbleFromUserBackground: '#0078d4',
            bubbleFromUserTextColor: '#ffffff',
            primaryFont: "'Your Brand Font', sans-serif",
            hideUploadButton: true
          }
        },
        document.getElementById('webchat')
      );
    });
</script>
```

> **팁:** **더 간단하게 하고 싶으신가요?** [JavaScript 한 줄 없이 WebChat 임베드하기](https://microsoft.github.io/mcscatblog/posts/webchat-embed-zero-javascript/)에서는 이미 간단한 이 설정을 선언적 HTML 스니펫으로 바꿔 주는 오픈 소스 라이브러리를 다뤄요.

> **팁:** 더 깊은 커스터마이징(커스텀 액티비티 렌더러, 미들웨어, 텔레메트리)이 필요하다면 [WebChat 미들웨어](https://microsoft.github.io/mcscatblog/posts/webchat-middlewares/) 포스트에서 전체 패턴을 다뤄요.

**이런 경우에 사용하세요:** 고객용 채팅 위젯, 지원 포털, 마케팅 사이트 등 외부 사용자가 브라우저를 통해 에이전트와 상호작용하는 모든 시나리오.

[마법사로 돌아가기 &uarr;](#api-wizard)

---

## 자체 UI 사용 (고객용)

모든 에이전트 경험이 채팅 창인 것은 아니에요. Copilot Studio 에이전트에 쿼리를 보내고 답변을 인라인으로 표시하는 검색 상자를 원할 수도 있고, 눈에 보이는 채팅 UI 없이 추천을 가져오는 제품 페이지를 원할 수도 있어요. 이런 시나리오에서는 여러분 자신의 컴포넌트에서 Direct Line을 직접 호출할 수 있어요.

[Direct Line JS 샘플](https://microsoft.github.io/CopilotStudioSamples/ui/custom-ui/directline-js)이 이 패턴을 보여 줘요. WebChat 의존성 없이 Direct Line과 통신하는 경량 JavaScript 클라이언트예요. 액티비티를 보내고, 응답을 받아, 원하는 방식으로 렌더링하면 돼요.

> **팁:** 이 길을 택하기 전에, WebChat이 [매우 폭넓게 커스터마이징](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/06.recomposing-ui) 가능하다는 점을 기억하세요. 걷어내고, 컴포넌트를 교체하고, 완전히 다시 스타일링할 수 있어요. 하지만 여러분이 만들려는 것이 채팅 인터페이스와 전혀 닮지 않았다면, WebChat 없이 Direct Line을 쓰는 것이 올바른 선택이에요.

**이런 경우에 사용하세요:** 검색 경험, 인라인 답변, 제품 추천 등 채팅 UI 없이 에이전트 응답이 필요한 모든 고객용 시나리오.

[마법사로 돌아가기 &uarr;](#api-wizard)

---

## 네이티브 모바일 SDK (프리뷰)

네이티브 모바일 앱을 만들고 있다면, Microsoft는 [Android](https://github.com/microsoft/AgentsClientSDK.Android), [iOS](https://github.com/microsoft/AgentsClientSDK.iOS), [Windows](https://github.com/microsoft/AgentsClientSDK.Windows)용 [Agents Client SDK](https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-communicate-with-agent-from-native-app)를 제공해요. SDK가 내부적으로 에이전트와의 연결을 처리해요. `sendMessage()`를 호출하고, 플랫폼 네이티브 패턴(Kotlin `StateFlow`, SwiftUI `@ObservedObject`, C# 이벤트)으로 응답을 관찰하면, 어댑티브 카드 렌더링과 선택적 음성 지원이 기본으로 제공돼요. iOS에서는 테마가 적용된 채팅 UI를 바로 쓸 수 있는 드롭인 `PluggableChatComponent`까지 있어요.

> **주의:** **프리뷰 (2026년 3월).** 현재 SDK는 에이전트가 "인증 없음(No Authentication)"으로 구성되어 있어야 해요. 구성 스키마에 Entra ID 인증 필드가 있긴 하지만 아직 동작하지 않아요. 이 점을 감안해 계획을 세우세요.

**이런 경우에 사용하세요:** 웹 기반 채팅 위젯이 적합하지 않고 인증된 사용자가 필요 없는 고객용 네이티브 앱(Android, iOS, Windows).

[마법사로 돌아가기 &uarr;](#api-wizard)

---

## 서버 사이드 커넥터

일부 조직, 특히 규제 산업에서는 사용자와 에이전트 사이에 서버 사이드 계층이 필요해요. 민감한 정보가 에이전트에 도달하기 전에(또는 응답이 사용자에게 도달하기 전에) 정제해야 하거나, 규정 준수 규칙을 강제해야 하거나, 어댑티브 카드를 자체 UI 컴포넌트 라이브러리로 변환해야 할 수 있어요. 패턴은 동일해요. 백엔드가 Copilot Studio와 통신하고, 프런트엔드는 백엔드와 통신해요.

백엔드에서 에이전트로의 연결에는 두 가지 옵션이 있어요. **M365 Agents SDK 클라이언트** 또는 **HTTP를 통한 Direct Line**이에요.

### M365 Agents SDK 클라이언트

SDK는 에이전트의 응답만을 순서대로 내어 주는 비동기 액티비티 이터레이터를 갖춘 개발자 친화적 클라이언트(.NET, Node.js, Python 지원)를 제공해요. 이를 서버에 임베드하고, 필요한 내용을 정제하거나 변환한 뒤, 프런트엔드에는 간단한 HTTP 엔드포인트만 노출하면 돼요. 클라이언트도, 서버 코드도 기저 프로토콜을 알 필요가 없어요. [Node.js 콘솔 샘플](https://github.com/microsoft/Agents/tree/main/samples/nodejs/copilotstudio-client)이 전체 패턴을 엔드투엔드로 보여 줘요.

```typescript
import { Activity, ActivityTypes } from '@microsoft/agents-activity';
import {
  CopilotStudioClient,
  loadCopilotStudioConnectionSettingsFromEnv
} from '@microsoft/agents-copilotstudio-client';

const settings = loadCopilotStudioConnectionSettingsFromEnv();
const token = await acquireToken(settings); // your MSAL token acquisition
const client = new CopilotStudioClient(settings, token);

// Send a message and stream the response
const activity = new Activity('message');
activity.text = 'What is the return policy?';

for await (const reply of client.sendActivityStreaming(activity)) {
  if (reply.type === ActivityTypes.Message) {
    console.log(reply.text);
  }
}
```

> **주의:** **하지만 아직 갈 길이 남았어요.** SDK 클라이언트는 현재 Entra ID를 통한 위임된(사용자)<sup>2</sup> 인증을 필수로 요구해요. 서비스 주체(service principal) 인증도, 앱 전용 토큰도, 보안 익명 접근도 지원하지 않아요. 고객이 Entra로 인증하지 않는 B2C 시나리오에서는 시작조차 할 수 없다는 뜻이에요. 앱 전용 인증 지원은 로드맵에 있으며, 저희도 여러분만큼 간절히 원하고 있어요. 현재로서는 위임된 인증을 수용할 수 있는 직원용 백엔드에서 이 패턴이 유효해요.

### HTTP를 통한 Direct Line

인증되지 않은 고객을 지원해야 하거나 SDK 클라이언트를 사용할 수 없다면, HTTP로 Direct Line과 직접 통신할 수 있어요. 이 접근법의 워크스루는 [HTTP 호출로 Copilot Studio 에이전트 트리거하기](https://microsoft.github.io/mcscatblog/posts/triggering-copilot-studio-http/)를 참고하세요. 두 가지를 유의해야 해요.

1. **스트림을 가로채는 일은 고통스러워요.** Direct Line은 WebSocket(실시간 푸시) 또는 HTTP 폴링(사이클당 1~10초의 지연)으로 응답을 전달해요. PII를 정제하거나 콘텐츠를 변환해서 사용자에게 전달하는 것이 목표라면, 지속적 WebSocket 연결 위에 실시간 메시지 라우터를 구축하는 셈이 돼요(피하고 싶은 일이죠). 폴링을 쓰면 아키텍처는 단순해지지만 지연이 빠르게 누적돼요.
2. **"마지막 메시지"라는 개념이 없어요.** Direct Line은 어느 쪽이든 언제든 메시지를 보낼 수 있는 대화를 모델링해요. "에이전트가 응답을 마쳤다"는 내장 신호가 없어요. 일부 고객은 `channelData`에 "마지막 메시지" 신호를 임베드하는 방식으로 우회하지만, 이는 여러분이 직접 만들고 유지해야 하는 관례(convention)예요.

**이런 경우에 사용하세요:** 정제, 규정 준수, 커스텀 렌더링을 위해 사용자와 에이전트 사이에 서버 사이드 계층이 필요할 때. 사용자가 Entra ID로 인증한다면 SDK 클라이언트를, 익명 및 비 Entra 시나리오에는 HTTP를 통한 Direct Line을 사용하세요.

[마법사로 돌아가기 &uarr;](#api-wizard)

---

## 다음 단계

위의 각 섹션은 시작하기에 충분한 내용을 담고 있지만, 파고들 것은 언제나 더 있어요. 토큰 갱신 전략, 오류 처리 패턴, 프로덕션 배포 고려 사항 등이 그래요. 특정 경로에 대해 더 깊이 다뤘으면 하는 내용이 있다면 댓글로 알려 주세요.

**여러분은 무엇을 만들고 계신가요? 마법사가 올바른 방향을 알려 주었나요, 아니면 여러분의 시나리오가 트리에서 빠져 있나요?**

## 더 읽어 보기

- [Copilot Studio에서 수동 인증은 아마 필요 없을 겁니다](https://microsoft.github.io/mcscatblog/posts/you-dont-need-manual-auth/)
- [Microsoft Teams에서 Copilot Studio 에이전트를 배포하는 모범 사례](https://microsoft.github.io/mcscatblog/posts/copilot-studio-teams-deployment-ux/)
- [HTTP 호출로 Copilot Studio 에이전트 트리거하기](https://microsoft.github.io/mcscatblog/posts/triggering-copilot-studio-http/)
- [JavaScript 한 줄 없이 WebChat 임베드하기](https://microsoft.github.io/mcscatblog/posts/webchat-embed-zero-javascript/)
- [Copilot Studio의 WebChat 미들웨어](https://microsoft.github.io/mcscatblog/posts/webchat-middlewares/)

---

## 어휘 주석

1. **B2E / B2C:** B2E(Business-to-Employee)는 조직 내부 직원을 대상으로 하는 시나리오를, B2C(Business-to-Customer)는 외부 일반 고객을 대상으로 하는 시나리오를 가리켜요.
2. **위임된(사용자) 인증(delegated authentication):** 앱이 자기 자신의 자격으로가 아니라, 로그인한 특정 사용자를 대신해 그 사용자의 권한 범위 안에서 API를 호출하는 인증 방식.

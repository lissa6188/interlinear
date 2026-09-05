---
title: 'WebChat을 사용하여 Copilot Studio 에이전트에 컨텍스트 변수 설정하는 방법'
description: 'Copilot Studio 에이전트를 웹사이트에 임베드할 때, WebChat 미들웨어로 컨텍스트 변수를 언제 어떻게 안전하게 보내야 하는지 정리했어요.'
date: 2026-09-05
tags: ["WebChat", "Copilot Studio", "컨텍스트 변수", "미들웨어", "Agents SDK"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/webchat-context-variables/card-01.png
  - /cards/webchat-context-variables/card-02.png
  - /cards/webchat-context-variables/card-03.png
  - /cards/webchat-context-variables/card-04.png
  - /cards/webchat-context-variables/card-05.png
  - /cards/webchat-context-variables/card-06.png
  - /cards/webchat-context-variables/card-07.png
  - /cards/webchat-context-variables/card-08.png
---

> **원문:** [How to Set Context Variables to Copilot Studio Agents Using WebChat](https://microsoft.github.io/mcscatblog/posts/webchat-context-variables/)
> **게시일:** 2026-04-28 · **저자:** Giorgio Ughini

Copilot Studio 에이전트를 자체 웹사이트에 임베드할 때는 보통 대화가 시작되기도 전에 사용자에 대해 이미 알고 있는 게 있어요. 사용자의 역할, 어느 페이지에서 왔는지, 사용 언어, 소속 테넌트 같은 것들이요. 에이전트도 그걸 알았으면 좋겠고, 이상적으로는 사용자가 첫 메시지에서 일일이 설명하지 않아도 됐으면 하고요.

이게 고전적인 "컨텍스트 변수" 문제예요. 이론적으로는 아주 간단해 보여요. 대화가 시작될 때 값을 에이전트에 보내면 되니까요. 하지만 실제로는 어디에, 그리고 *언제* 보내느냐가 제대로 동작하는 통합과, 데이터의 절반을 조용히 흘려버리는 통합의 차이를 만들어요.

구체적으로, 에이전트에 사용자 역할에 따라 다르게 동작하는 토픽이 있다고 해 봐요. `Topic.userrole`을 정의했고, 사용자가 첫 메시지를 보내기 *전에* 값이 채워져서 초기 토픽에서 바로 분기할 수 있길 원해요.

이 글은 **Bot Framework WebChat**을 사용해 이를 안정적으로 수행하는 방법에 초점을 맞춰요.

## WebChat 빠른 복습

저희의 [WebChat](https://microsoft.github.io/mcscatblog/posts/webchat-middlewares/) 글들을 계속 읽어 오셨다면 이 섹션은 건너뛰어도 돼요. 그 외 분들을 위해 설명하면, Copilot Studio 에이전트를 자체 웹사이트에 임베드해야 할 때는 [Bot Framework WebChat](https://github.com/microsoft/BotFramework-WebChat)이 기본 선택지가 돼야 해요. Copilot Studio 자체의 테스트 캔버스를 구동하는 것과 같은, 실전에서 검증된 채팅 컴포넌트이고, 어댑티브 카드, 입력 표시기, 접근성, 첨부 파일 등 직접 다시 만들고 싶지 않은 수십 가지를 처리해 줘요.

WebChat을 강력하게 만드는 또 다른 요소는 Redux 위에 구축돼 있다는 점이에요. 채팅에서 일어나는 모든 액션 — 나가는 메시지, 들어오는 액티비티, 연결 이벤트 — 이 Redux<sup>1</sup> 스토어를 통해 흘러요. 즉, 자체 [미들웨어](https://microsoft.github.io/mcscatblog/posts/webchat-middlewares/)를 연결해서 메시지 파이프라인에서 일어나는 모든 일을 가로채거나, 수정하거나, 반응할 수 있어요. 바로 여기서 우리가 할 일이에요.

## 접근법 1: `channelData`로 보내기 (Direct Line에서는 동작, Agents SDK에서는 실패)

대부분의 샘플에서 처음 만나는 접근법은 `channelData`를 사용해 첫 액티비티에 컨텍스트를 붙이는 거예요. Direct Line에서는 채널 데이터의 일부로 컨텍스트를 담은 `conversationStart` 이벤트(또는 다른 숨겨진 `event` 액티비티)를 게시할 수 있고, Conversation Start 토픽이 `System.Activity.ChannelData`를 통해 읽을 수 있어요. 다음과 같은 모습이에요.

```typescript
export const connectionMiddleware = ({ dispatch }: any) => (next: any) => (action: any) => {
  if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
    // Send startConversation event when connection is established
    dispatch({
      type: 'DIRECT_LINE/POST_ACTIVITY',
      payload: {
        activity: {
          channelData: { myVariable: "myValue" },
          name: 'startConversation',
          type: 'event'
        }
      }
    })
  }
  return next(action)
}
```

WebChat이 **Direct Line**으로 연결되어 있을 때는 잘 동작해요. 하지만 Direct Line이 더 이상 유일한 전송 계층이 아니에요. [M365 Agents SDK](https://microsoft.github.io/mcscatblog/posts/webchat-conversation-history-m365-sdk/)(`@microsoft/agents-copilotstudio-client` 패키지, 스트리밍과 "Authenticate with Microsoft" SSO 등을 제공하는 그것)로 옮겨갔다면, 채널 데이터가 기대하는 곳에 나타난다는 보장이 더 이상 없어요. 액티비티는 에이전트에 도달하지만, `System.Activity.ChannelData`는 비어 있게 돼요.

> **주의:** 최신 스트리밍 경험과 테넌트 Graph 그라운딩을 위해 [M365 Agents SDK](https://microsoft.github.io/mcscatblog/posts/webchat-conversation-history-m365-sdk/)를 사용 중이라면, 첫 액티비티의 `channelData`는 컨텍스트 변수를 전달하는 **신뢰할 수 없는** 채널이에요. 다른 접근법이 필요해요.

그러니 기반 전송 계층에 상관없이 동작하는 게 필요해요. 커스텀 이벤트의 등장이에요.

## 접근법 2: 미들웨어에서 커스텀 이벤트 디스패치하기

Copilot Studio 토픽은 커스텀 이벤트로 트리거될 수 있어요. 특정 `eventName`을 가진 `OnEventActivity` 트리거를 정의하면, 그 이벤트 이름을 가진 액티비티가 에이전트에 도달할 때마다 토픽이 실행되고 `System.Activity.Value`에서 값을 읽을 수 있어요.

WebChat 쪽에서는 이렇게 생각할 수 있어요. "좋아, `WEB_CHAT/SEND_EVENT` 액션을 사용해 Redux 미들웨어에서 이벤트 액티비티를 디스패치하자." 첫 번째 직감은 연결이 수립되자마자 발사하는 거예요.

```typescript
export const setContextMiddleware = ({ dispatch }: any) => (next: any) => (action: any) => {
  if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
    // Send setContext event when connection is established
    dispatch({
      type: 'WEB_CHAT/SEND_EVENT',
      payload: {
        name: 'customEventSetContext',
        value: {
          myvariablename: 'variableDefinition1'
        }
      }
    })
  }
  return next(action)
}
```

이를 `customEventSetContext`를 수신하는 토픽과 결합해요.

_`customEventSetContext` 이벤트를 수신하는 토픽의 Copilot Studio 스크린샷_

토픽은 이벤트 트리거와 `SetTextVariable` 액션을 사용해 들어오는 값을 토픽(또는 전역) 변수에 복사해요.

```yaml
beginDialog:
  kind: OnEventActivity
  id: main
  eventName: customEventSetContext
  actions:
    - kind: SetTextVariable
      id: 3Tmwer
      variable: Topic.userrole
      value: "{System.Activity.Value.userrole}"
```

깔끔해 *보여요*. `DIRECT_LINE/CONNECT_FULFILLED`에 훅을 걸고, 이벤트를 디스패치하고, 반대편의 토픽이 이를 받아 변수를 할당해요. 끝, 맞죠?

그렇지 않아요.

## `CONNECT_FULFILLED`에서 발사하면 안 되는 이유

함정은 이거예요. `DIRECT_LINE/CONNECT_FULFILLED`는 기반 연결이 수립되는 순간에 발생해요. 그 시점에 대화는 존재하지만(대화 ID가 있음), 반대편의 에이전트 런타임은 대화 맨 처음에 수행하는 작업 — 대화 상태 프로비저닝, Conversation Start 토픽 실행, 시스템 변수 초기화 — 을 아직 끝내지 않았을 수 있어요.

이 경우 변수는 설정되지 않은 채로 남아요. 하지만 타이밍이 네트워크 지연, 런타임 웜업, 사용 중인 전송 계층에 따라 달라지기 때문에 버그는 간헐적일 수 있어요. 개발 장비에서는 잘 동작하다가 프로덕션의 사용자에게서 깨져요. 최악의 종류의 버그죠.

> **참고:** Direct Line 대화는 연결이 수립되는 즉시 대화 ID를 갖지만, 그게 에이전트 런타임이 변수를 안정적으로 저장할 준비가 됐다는 뜻은 아니에요. `CONNECT_FULFILLED`는 "소켓이 열렸다"이지 "에이전트가 컨텍스트를 받을 준비가 됐다"가 아니라고 생각하세요.

우리에게 필요한 건 *에이전트가 실제로 말을 시작했다*는 신호예요. 그 시점이면 런타임이 완전히 가동돼 우리가 설정하는 어떤 변수든 유지되기 때문이에요. 그 신호가 바로 에이전트로부터 오는 첫 번째 수신 액티비티예요.

## 해결책: 첫 번째 수신 메시지 기다리기

연결 시점에 발사하는 대신, 에이전트로*부터* 오는 첫 액티비티를 기다렸다가 거기서 이벤트를 디스패치해요. 한 번만 수행하도록 미들웨어 클로저에 플래그를 유지해요.

```typescript
export const setContextMiddleware = ({ dispatch }: any) => {
  let contextSent = false
  return (next: any) => (action: any) => {
    if (
      !contextSent &&
      action.type === 'DIRECT_LINE/INCOMING_ACTIVITY' &&
      action.payload?.activity?.type === 'message'
    ) {
      // Send setContext event once, on the first incoming message from the agent
      contextSent = true
      dispatch({
        type: 'WEB_CHAT/SEND_EVENT',
        payload: {
          name: 'customEventSetContext',
          value: {
            myvariablename: 'variableDefinition1'
          }
        }
      })
    }
    return next(action)
  }
}
```

주목할 점 몇 가지가 있어요.

- `CONNECT_FULFILLED`가 아니라 `DIRECT_LINE/INCOMING_ACTIVITY`([대화 기록을 위해 액티비티를 저장](https://microsoft.github.io/mcscatblog/posts/webchat-conversation-history-m365-sdk/)할 때 쓰는 것과 같은 액션)를 감시해요.
- `activity.type === 'message'`로 필터링해서 입력 표시기나 다른 시스템 액티비티에서는 발사하지 않도록 해요. 이런 것들은 더 일찍 도착해서 같은 경쟁 조건(race condition)으로 되돌아가게 만들 수 있어요. 즉, 변수를 설정하려면 에이전트가 실제로 사용자에게 메시지를 먼저 보내야 해요. 예를 들어 Conversation Start에서요.
- `contextSent` 플래그는 미들웨어 클로저에 있으므로 단일 WebChat 인스턴스로 범위가 제한돼요. 사용자가 페이지를 새로고침하면 플래그가 초기화되고 다음 첫 메시지에서 컨텍스트가 다시 전송되는데, 이게 정확히 우리가 원하는 동작이에요.

Copilot Studio 쪽은 그대로예요. `customEventSetContext`를 수신하는 같은 `OnEventActivity` 토픽, `System.Activity.Value.userrole`을 `Topic.userrole`에 할당하는 같은 `SetTextVariable` 액션이에요. 이제 이벤트가 도착할 때쯤이면 에이전트 런타임이 이미 첫 메시지를 만들었고, 대화 상태가 완전히 초기화되어 변수 할당이 유지돼요.

## 연결하기

미들웨어를 WebChat에 연결하는 건 다른 Redux 미들웨어와 같은 패턴이에요.

```typescript
import { applyMiddleware, createStore as createReduxStore } from 'redux'

const store = window.WebChat.createStore(
  {},
  setContextMiddleware
)

window.WebChat.renderWebChat(
  {
    directLine,
    store,
  },
  document.getElementById('webchat')
)
```

이미 미들웨어를 사용 중이라면([기록 유지](https://microsoft.github.io/mcscatblog/posts/webchat-conversation-history-m365-sdk/), [모의 환영 메시지](https://microsoft.github.io/mcscatblog/posts/mocked-webchat-welcome-message/), 일반적인 [메시지 가로채기](https://microsoft.github.io/mcscatblog/posts/webchat-middlewares/) 등), 그것들을 함께 조합하고 이 미들웨어를 체인에 추가하면 돼요.

## 이 접근법에 대한 고려 사항

미들웨어 접근법의 솔직한 트레이드오프는 변수가 첫 에이전트 메시지 *이후*에 설정되지, 그 전이 아니라는 점이에요. 그래서 Conversation Start 토픽 자체가 사용자 역할로 분기해야 한다면(예: 관리자와 일반 사용자에게 서로 다른 인사말 보내기) 이 방법은 도움이 안 돼요. 인사말이 이벤트가 도착하기 전에 실행되니까요. 그런 경우엔 Conversation Start 토픽을 일반적인 "안녕하세요, 환영해요!"로 유지하고, 후속 로직을 커스텀 이벤트 자체로 트리거하는 걸 권해요.

그 외 모든 것, 즉 에이전트가 실제로 첫 메시지를 보낸 *이후*에 실행되는 모든 토픽에 대해서는, 이 미들웨어 패턴이 Direct Line과 Agents SDK 모두에서 살아남는, 제가 찾은 가장 신뢰할 수 있는 옵션이에요.

## 핵심 요약

- 컨텍스트를 위한 `channelData`는 Direct Line에서는 동작하지만 M365 Agents SDK에서는 신뢰할 수 없어요.
- WebChat Redux 미들웨어에서 디스패치하는 커스텀 이벤트는 두 전송 계층 모두에서 동작해요.
- `DIRECT_LINE/CONNECT_FULFILLED`에서 디스패치하지 마세요. 에이전트 런타임이 준비되지 않았을 수 있고 변수 할당이 유실될 수 있어요.
- 타입이 `message`인 첫 번째 `DIRECT_LINE/INCOMING_ACTIVITY`에서 디스패치하고, 플래그를 사용해 세션당 한 번만 발사되도록 하세요.
- Copilot Studio 쪽에서는 `OnEventActivity` 트리거로 이벤트를 수신하고 `System.Activity.Value.*`를 변수에 복사하세요.

이 글이 유용했기를, 그리고 변수가 계속 비어 있는 이유를 알아내느라 저희가 쓴 몇 시간을 여러분은 아낄 수 있기를 바라요.

---

## 어휘 주석

1. **Redux:** 앱의 상태(현재 값들)를 한곳에서 관리하고, 상태가 바뀔 때마다 그 변화를 "액션"으로 기록해 예측 가능하게 흐르도록 만드는 자바스크립트 상태 관리 라이브러리.

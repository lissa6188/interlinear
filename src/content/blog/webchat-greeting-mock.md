---
title: '있었던 적 없는 환영 메시지: WebChat에서 에이전트 인사말 모킹하기'
description: '공개 웹사이트에 심은 Copilot Studio 에이전트, 방문자마다 과금되는 WebChat 환영 메시지를 에이전트에 보내지 않고 화면에만 보여주는 모킹 기법과 이때의 트레이드오프를 정리했어요.'
date: 2026-09-08
tags: ["Copilot Studio", "WebChat", "미들웨어", "모킹"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/webchat-greeting-mock/card-01.png
  - /cards/webchat-greeting-mock/card-02.png
  - /cards/webchat-greeting-mock/card-03.png
  - /cards/webchat-greeting-mock/card-04.png
  - /cards/webchat-greeting-mock/card-05.png
  - /cards/webchat-greeting-mock/card-06.png
  - /cards/webchat-greeting-mock/card-07.png
---

> **원문:** [The Welcome Message That Never Was: Mocking Agent Greetings in WebChat](https://microsoft.github.io/mcscatblog/posts/mocked-webchat-welcome-message/)
> **게시일:** 2026-01-11 · **저자:** Adi Leibowitz

익숙하게 들릴 만한 시나리오가 하나 있어요. 회사의 공개 웹사이트를 위해 멋진 Copilot Studio 에이전트를 만들었어요. 이 에이전트는 방문자에게 친근한 환영 메시지로 인사하고, 제품이나 서비스, 그리고 아무도 읽지 않는 그 FAQ에 대한 질문에 답할 준비가 되어 있어요.

문제는요? 페이지를 로드하는 모든 방문자가 그 환영 메시지를 트리거한다는 거예요. 그리고 환영 메시지 하나하나가 모두 과금 대상으로 집계돼요. 그게 쌓이기 시작하면… 결국 누군가는 알아차리게 된다고만 말해 둘게요.

## 인사말의 경제학

공개 웹사이트에 Copilot Studio 에이전트를 임베드하면, 일반적인 흐름은 다음과 같아요.

1. 방문자가 페이지에 도착해요
2. WebChat이 Direct Line에 연결돼요
3. 에이전트가 환영 메시지를 보내요(Conversation Start 토픽이 실행됨)
4. 방문자가 "안녕하세요! 무엇을 도와드릴까요?"를 읽어요
5. 방문자는 아무것도 입력하지 않은 채 탭을 닫는 경우가 많아요
6. 그 환영 메시지에 대한 비용이 청구돼요

비용 절감이나 Copilot 크레딧에 대해 거창한 약속을 하려는 건 아니에요. 트래픽 패턴, 라이선스 모델, 그리고 마케팅 팀이 "채팅으로 문의하세요!" 버튼을 얼마나 적극적으로 홍보하는지에 따라 결과는 달라질 거예요. 하지만 한 번도 대화에 참여하지 않는 방문자에게 수천 개의 환영 메시지가 나가는 걸 보고 있다면, 이런 궁금증이 생길 수 있어요. *에이전트를 실제로 건드리지 않고 인사말만 표시할 방법은 없을까?*

알고 보니, 있어요.

## 트릭: 사용자가 입력할 때까지 흉내 내기

아이디어는 간단해요. 에이전트가 환영 메시지를 보내게 하는 대신, 가짜 메시지를 WebChat UI에 직접 주입하는 거예요. 방문자는 평소와 똑같은 화면, 즉 에이전트의 친근한 인사말을 보지만 실제 액티비티는 에이전트에 전혀 도달하지 않아요. 토픽도 실행되지 않아요. 대화도 시작되지 않아요. 메시지도 소비되지 않아요.

진짜 대화는 사용자가 무언가를 입력할 때 비로소 시작돼요.

> **참고:** 이 접근 방식은 WebChat의 Redux 스토어 미들웨어<sup>1</sup>를 사용해 연결 이벤트를 가로채고 합성(synthetic) 메시지를 주입해요. 전적으로 클라이언트 사이드에서 이루어지고, 에이전트로 향하는 트래픽은 없어요.

## 동작 원리

WebChat은 내부적으로 Redux를 사용해 상태를 관리해요. Direct Line 연결이 수립되면 `DIRECT_LINE/CONNECT_FULFILLED` 액션이 디스패치돼요. 이 순간에 훅을 걸어 우리만의 가짜 "수신" 액티비티를 디스패치할 수 있어요.

```javascript
const store = window.WebChat.createStore({}, ({ dispatch }) => next => action => {
  if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
    // Inject a mocked welcome message
    dispatch({
      type: 'DIRECT_LINE/INCOMING_ACTIVITY',
      payload: {
        activity: {
          type: 'message',
          id: 'welcome-' + Date.now(),
          timestamp: new Date().toISOString(),
          from: { id: 'bot', role: 'bot' },
          text: 'Welcome! How can I help you today?'
        }
      }
    });
  }
  return next(action);
});
```

여기서 핵심은 Conversation Start 토픽을 트리거할 만한 어떤 것도 에이전트에 *보내지 않는다*는 점이에요. 대신 Direct Line 연결이 수립될 때까지(`CONNECT_FULFILLED`) 기다린 다음, 우리가 만든 `INCOMING_ACTIVITY`를 WebChat의 메시지 스트림에 직접 디스패치해요. 대화 자체는 존재하지만(Direct Line이 대화 ID를 발급했으므로) 아직 어떤 토픽도 트리거하지 않은 상태예요. UI는 마치 에이전트가 말한 것처럼 인사말을 표시하지만, 에이전트는 아무 작업도 하지 않았어요. 아무도 없는 숲에서 나무가 쓰러지는 것과 같아요. 다만 그 나무가 AI 에이전트이고, 숲이 여러분의 메시지 사용량 보고서일 뿐이죠.

## 완전한 동작 예제

이 기법을 보여주는 전체 HTML 페이지예요. 토큰 엔드포인트는 여러분 것으로 교체해야 해요.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WebChat with Mocked Welcome</title>
  <script crossorigin="anonymous"
    src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js">
  </script>
  <style>
    html, body { height: 100%; margin: 0; padding: 0; }
    #webchat { height: 100%; width: 100%; }
  </style>
</head>
<body>
  <div id="webchat" role="main"></div>

  <script>
    // Replace with your Copilot Studio token endpoint
    const TOKEN_ENDPOINT = 'https://YOUR_ENVIRONMENT.api.powerplatform.com/powervirtualagents/botsbyschema/YOUR_BOT/directline/token?api-version=2022-03-01-preview';

    async function main() {
      // Fetch DirectLine token
      const response = await fetch(TOKEN_ENDPOINT);
      const { token } = await response.json();

      // Create store with middleware to inject welcome message
      const store = window.WebChat.createStore({}, ({ dispatch }) => next => action => {
        if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
          console.log('Connection fulfilled, injecting welcome message...');

          // Inject a mocked welcome message
          dispatch({
            type: 'DIRECT_LINE/INCOMING_ACTIVITY',
            payload: {
              activity: {
                type: 'message',
                id: 'welcome-' + Date.now(),
                timestamp: new Date().toISOString(),
                from: { id: 'bot', role: 'bot' },
                text: 'Welcome! How can I help you today?'
              }
            }
          });
        }
        return next(action);
      });

      // Create DirectLine connection
      const directLine = window.WebChat.createDirectLine({ token });

      // Render WebChat
      window.WebChat.renderWebChat(
        {
          directLine,
          store,
          styleOptions: {
            botAvatarInitials: 'Bot',
            userAvatarInitials: 'You'
          }
        },
        document.getElementById('webchat')
      );
    }

    main().catch(err => console.error('Error:', err));
  </script>
</body>
</html>
```

## 트레이드오프와 고려 사항

서둘러 구현에 나서기 전에, 무엇을 포기하게 되는지 솔직하게 짚어볼게요.

**잃는 것:**
- **환영 메시지에 대한 대화 분석을 잃어요.**<br>
  실제 액티비티가 발생하지 않아서 Copilot Studio 분석에서 환영 메시지 지표를 볼 수 없어요.
- **동적 환영 콘텐츠를 잃어요.**<br>
  에이전트의 Conversation Start 토픽이 개인화, A/B 테스트 등 영리한 작업을 수행할 수도 있어요. JavaScript로 모킹된 메시지를 동적으로 만들 *수는* 있지만, 그러면 로우코드의 취지가 무색해져요.
- **인사말 속 Adaptive Card<sup>2</sup>를 잃어요.**<br>
  주입 자체는 가능하지만(액티비티 페이로드가 attachments를 지원해요), JSON을 직접 구성해야 해요.

**유지되는 것:**
- **정상적인 대화 흐름은 유지돼요.**<br>
  사용자가 메시지를 보내는 순간부터 모든 게 이전과 똑같이 동작해요.
- **모든 에이전트 기능이 유지돼요.**<br>
  토픽, 지식, 플러그인, 오케스트레이션 등 아무것도 바뀌지 않아요.
- **사용자 경험은 그대로예요.**<br>
  방문자는 친근한 인사말을 보고 원할 때 채팅을 시작할 수 있어요.

> **주의:** Conversation Start 토픽이 중요한 작업(컨텍스트 설정, 사용자 상태 확인, 개인화 등)을 수행한다면 이 접근 방식은 적합하지 않을 수 있어요.

## 핵심 요약

- **모킹된 환영 메시지는 클라이언트 사이드에서 WebChat의 Redux 스토어에 주입돼요.**<br>
  에이전트로 나가는 메시지는 없어요.
- **`DIRECT_LINE/INCOMING_ACTIVITY`는 에이전트로부터 메시지가 도착한 것처럼 시뮬레이션해요.**<br>
  아웃바운드로 보내는 게 아니라 수신 스트림에 주입하는 거예요.
- **실제 대화는 정상적으로 시작돼요.**<br>
  사용자가 입력하는 순간부터 모든 게 기대대로 동작해요.
- **트레이드오프도 고려하세요.**<br>
  인사말 분석과 동적 콘텐츠 기능을 잃게 돼요.

---

*공개용 에이전트에서 이 접근 방식을 시도해 보셨나요? 아니면 "환영 메시지 문제"에 대한 더 우아한 해결책을 찾으셨나요? 아래에 댓글을 남겨 주세요. 환영 메시지는 트리거되지 않을 것을 약속드려요.*

---

## 어휘 주석

1. **미들웨어(middleware):** 어떤 요청이나 액션이 최종 처리되기 전에 가로채서 검사하거나 수정할 수 있게 해주는 중간 계층 코드.
2. **Adaptive Card:** 이미지, 버튼, 입력 필드 등을 카드 형태로 표현할 수 있는 Microsoft의 UI 카드 포맷.

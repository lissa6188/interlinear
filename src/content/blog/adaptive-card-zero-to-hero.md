---
title: '{중괄호는 이제 그만} - Copilot에게 맡기세요! 어댑티브 카드 제로백(0-100)'
description: 'Copilot Studio로 JSON 한 줄 쓰지 않고 어댑티브 카드 만드는 법을 정리했어요. 테스트 창 활용부터 국가별 맞춤 카드, 제출 응답으로 일정까지 만드는 흐름을 다뤄요.'
date: 2026-09-08
tags: ["Copilot Studio", "어댑티브 카드", "생성형 AI", "로우코드", "자동화"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/adaptive-card-zero-to-hero/card-01.png
  - /cards/adaptive-card-zero-to-hero/card-02.png
  - /cards/adaptive-card-zero-to-hero/card-03.png
  - /cards/adaptive-card-zero-to-hero/card-04.png
  - /cards/adaptive-card-zero-to-hero/card-05.png
  - /cards/adaptive-card-zero-to-hero/card-06.png
  - /cards/adaptive-card-zero-to-hero/card-07.png
---

> **원문:** [{Brace Yourself} - or Let Copilot Do It! Zero-100 with Adaptive Cards](https://microsoft.github.io/mcscatblog/posts/adaptive-card-generation/)
> **게시일:** 2026-01-02 · **저자:** Dave Burman

최근 어댑티브 카드(Adaptive Card)와 관련해 꽤 긴 여정을 겪었어요. 기본적인 양식 몇 개를 만들고 기존 카드를 여기저기 조금씩 손보는 것 외에는 어댑티브 카드를 깊이 파고들 일이 별로 없었어요. 그런데 사용자들에게는 확실히 인기가 좋은 것 같아요. 저희 [부트캠프 이벤트](https://microsoft.github.io/powercat/programs/architecture-bootcamp.html)에 참석해 본 분이라면 첫날 환경을 프로비저닝할 때 사용하는 등록 양식을 보셨을 텐데, 그 경험에 대해 대체로 긍정적인 평이 많아요.

일단 뛰어들고 나니, 저는 순식간에 다음과 같은 단계를 거쳤어요.
- WYSIWYG<sup>1</sup> 편집기로 카드 만들기에서,
- JSON을 손으로 직접 작성하기로,
- JSON을 대신 작성하게 하기로,
- JSON을 즉석에서 작성해 사용자에게 자동으로 표시하기로,
- 그리고 중괄호 하나 쓰지 않고 JSON을 즉석에서 작성해 사용자에게 자동으로 표시하고 응답까지 의미 있게 해석하기로

관심이 생기셨나요? JSON을 (작성하지 않고) 놀라운 일들을 해볼게요!

## 잠깐, 요즘은 다들 대화형 경험을 추구하지 않나요?

대화형 인터페이스는 훌륭하지만, 때로는 전통적인 양식(form)을 이길 수 없어요. 여러 정보를 동시에 수집하고 검증해야 한다면, 사용자 앞에 어댑티브 카드를 내놓는 것이 여러모로 유리해요.

하지만 여러분이 저와 비슷하다면, 그 시점에 입 밖으로 나오는 말들은 대부분 여기 옮길 수 없는 것들일 거예요. 어댑티브 카드에 필요한 JSON을 손으로 작성하는 일은 성가시고 종종 좌절스러워요. 저는 Copilot Studio의 어댑티브 카드 디자이너의 로우코드 WYSIWYG 접근 방식을 좋아하지만, 더 복잡한 양식에서는 다루기가 상당히 불편하다는 것도 알게 되었어요. 분명 다른 대안이 있지 않을까요?

## 더 나은 방법

제 JSON 고민의 해답은 말 그대로 처음부터 눈앞에 있었어요. 바로 테스트 창(Test Pane)이에요. 어쩌면 제가 조금 늦게 합류한 것일 수도 있지만, 최근에 Copilot Studio 자체가 출발점을 만들어 주는 데 얼마나 뛰어난지 깨달았어요.

예를 들어, 테스트 창이 다음 지시문을 어떻게 처리하는지 봐요.

```plaintext
Write JSON for an Adaptive Card which prompts the user to enter dietary preferences.

Place each section in containers.

In the first section, introduce the card with a header and introductory message stating why this information is being collected (which is to ensure a good selection of food and drink is provided at an event). 

In the second section, ask for a single selection of popular dietary types (e.g. vegan, vegetarian, etc - provide a comprehensive set of options for this in an expanded list), as well as similar questions for favourite food and favourite beverage, with popular options for both (both in compact lists). 

In the last section, include a hyperlink to a privacy policy document with a placeholder URL, and a submission button. 

Ensure all fields on the form are mandatory, all have an appropriate label and an appropriate error message. Use a food related white repeating image for the background in each of the sections. 

Heavily decorate the text throughout the card with food related emojis.
```

꽤 그럴듯해 보여요!

간단히 복사/붙여넣기하면 어댑티브 카드 디자이너에서 렌더링돼요.

토픽 내에서 사용할 출력 변수까지 자동으로 구성되어 있으며, 대화 속에서도 멋지게 보여요.

## 방금 복사/붙여넣기라고 하셨나요?!

이미 이렇게 하고 계신 분들도 꽤 있을 거예요. 새롭게 떠오르는 이 세계에서는 무엇이 놀라운 것이고 무엇이 상식인지 구분하기 어려울 때가 있어요. 그런 점을 염두에 두고, 저는 더 잘할 수 있다고 확신했어요. LLM이 생성한 JSON은 결국 그냥 문자열이잖아요? 문자열은 여기저기 전달할 수 있으니, 분명 즉석에서도 이걸 할 수 있지 않을까요? 그런데 그게 그냥 멋진 과시일까요, 아니면 실제로 필요한 걸까요? 일단은 멋진 과시라고 해 둬요.

## 예쁘게 보여주기

도구(tool)에서 가져온 정보를 표시하는 것에 대해 생각해 봐요. Copilot Studio는 [도구 결과를 어댑티브 카드로](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-plugin-actions#completion) 표시하는 기능을 제공하지만, 여러 도구의 정보를 결합하고 싶다면 어떨까요? 심지어 그 도구들의 출력에 따라 완전히 다른 양식을 보여주고 싶다면요?

예를 들어, 여정 계획을 도와주는 에이전트가 있다고 해요. 에이전트에는 경로 정보를 찾는 도구가 있는데, 이동 수단에 따라 정보가 크게 달라질 수 있어요.
- 장거리 자동차 여정이라면 경로상의 휴게소 정보를 알고 싶어요
- 기차 여정이라면 어디서 환승해야 하는지, 각 구간이 얼마나 걸리는지, 각 기차가 어디에 정차하는지 알아야 해요
- 비행기 여정이라면 어떤 항공편 시간이 있는지 알고 싶어요

에이전트에는 특정 위치의 날씨 정보를 가져오는 도구도 있어서, 위 정보와 결합해 보기 좋은 요약 화면으로 만들고 싶어요.

여정 정보와 날씨 정보가 하나의 소화하기 쉬운 카드로 결합되어, 보기 좋으면서도 모든 관련 정보를 표시하고 있는 것을 확인할 수 있어요.

하지만 다른 경로를 요청하면 다른 정보가 표시돼요. 이번에는 경로 정보 도구가 기차 여정이 더 적합하다고 판단했고, 그에 따라 에이전트가 환승과 정차역을 포함한 전체 기차 여정의 여러 구간을 표시했어요.

그렇다면 이건 어떻게 동작할까요? 이 예제에서는 도구 호출과 응답 생성이라는 무거운 작업을 최대한 생성형 오케스트레이션<sup>2</sup>에만 맡기고 싶었어요. 그래서 사용자에게 전송되는 응답을 가로채서 (필요한 경우) 가공하는 단일 토픽을 구현하기로 했어요. 이 토픽은 OnGeneratedResponse에서 발동하며, 사용자에게 전송되기 직전의 메시지인 System.Response.FormattedText에 접근해 메시지를 가로채고 변경할지 결정할 수 있게 해 줘요.

핵심은 그 토픽 안에 있는 [커스텀 프롬프트(Custom Prompt)](https://learn.microsoft.com/en-us/microsoft-copilot-studio/create-custom-prompt)로, 두 가지 입력을 받아요.
- 사용자에게 전송되기 직전의 메시지
- 시나리오/양식 설명 쌍의 컬렉션을 나타내는 객체(대화 시작(Conversation Start)에서 전역 변수로 초기화했어요). 예를 들면 다음과 같아요.

```json
  [
    {
      "scenario":"best suited for long journeys by car", 
      "formdescription":"Search https://www.pexels.com/search/{insert destination here} for a picture related to the destination (if one can't be found, don't output a picture). Open the form with the picture. Display the origin and destination as text fields, a summary of the weather at the destination, estimated driving time and a list of suggested stops.  Within each stop, display a list of shops along side an an appropriate emoji related to the business. Decorate heavily with other appropriate emojis"
    },
    {
      "scenario":"best suited for planning a journey by plane",
      "formdescription":"Open the form with a picture of a plane. Display the origin and destination, the estimated journey time and a list of landmarks"
    },
    {
      "scenario":"best suited for train travel", 
      "formdescription":"Open the form with a picture of a busy train platform. Display the origin at the start of the form, each separate train journey as a section, including stops, and then close the form with the name of the destination, a picture of the destination, and weather information about the destination"
    }
  ]
```

프롬프트는 다음과 같이 생겼어요. 본질적으로 "전송될 메시지에 맞는 JSON 시나리오가 있는지 판단하고, 있다면 그것을 사용해 JSON을 생성하라"고 말할 뿐이에요.

사용자가 에이전트에게 두 장소 사이의 경로를 찾아 달라고 요청하면 다음 단계가 진행돼요.
1. 오케스트레이터가 경로 정보 검색 도구와 날씨 정보 도구를 호출해야 한다는 것을 인식하고 둘 다 실행해요
2. 원본 응답이 만들어지는 시점에 OnGeneratedResponse 이벤트가 발생하고 제 토픽이 트리거돼요
3. 제 토픽이 그 원본 응답과 시나리오/양식 설명 객체를 커스텀 프롬프트에 전달해요
4. 커스텀 프롬프트가 응답에 맞는 시나리오가 있는지 판단하고, 있다면 적절한 어댑티브 카드 JSON을 생성해요
5. 출력이 토픽으로 다시 전달되고, 토픽은 카드가 생성되었는지 확인한 뒤 생성되었다면 JSON을 어댑티브 카드 노드에 넣어요

아래에서는 프롬프트가 양식을 생성했는지 여부에 따라 토픽을 분기하고 있어요...

...그런 다음 출력 JSON을 어댑티브 카드를 표시하는 메시지(Message) 노드에 넣어요("어댑티브 카드로 질문(Ask with Adaptive Card)"이 아니라 메시지를 쓰는 이유는, 응답을 요청하는 것이 아니고 토픽 실행을 차단하고 싶지 않기 때문이에요).

> **주의:** 여기서 꽤 큰 면책 조항을 하나 말씀드려야겠어요. 이 접근 방식은 스크린샷으로는 잘 동작하는 것처럼 보이지만, 실제로는 에이전트가 어떻게 소비되느냐에 따라 사용자 경험이 이상적이지 않을 수 있어요. 응답 스트리밍이 지원되는 상황(테스트 창 등)에서는 토픽이 재구성을 시작하기 전에 원본 형식의 응답이 부분적으로 사용자에게 전송돼요. 이는 더 통제된 흐름을 구현하면 피할 수 있어요. 즉, 토픽이 도구 호출을 직접 시작하고 오케스트레이터에 그만큼 의존하지 않는 것이에요. 다음 예제에서 그 방법을 보여드릴게요.

## 어댑티브 카드 제출은 어떻게 할까요?

지금까지 어댑티브 카드 JSON을 즉석에서 동적으로 생성하는 단계에 도달했어요. 전역 변수에 정의한 양식의 자연어 설명에 따라 근본적으로 다른 양식 내용이 표시돼요. 이는 꽤 유용하며, 손으로 쓴 JSON에서 어디에 쉼표나 중괄호를 빠뜨렸는지 찾아내는 것보다는 확실히 나아요.

하지만 아직 더 할 수 있는 일이 남아 있다고 느꼈어요. 어댑티브 카드에 대한 사용자의 응답을 즉석에서 이해해 보는 것은 어떨까요? 실제 가치를 위해 여러 지능적인 단계를 멋진 인터랙티브 프로세스로 감싸 보는 것은요?

데이터 표시에 대한 결정을 내리는 것과, 사람이 작성하기에 최적화된 양식을 설계하는 것은 다른 차원의 고민이 필요해요. 정확히 무엇이 표시될지 알 수 있도록 개발자에게 정적이고 통제된 양식을 작성해 달라고 하는 것이 더 안전하지 않을까요? 그럴 수도 있어요...

## 생각하게 하지 마세요...

디지털 양식을 다뤄 본 사람이라면 동적 양식이 거의 항상 요구 사항이라는 것을 알아요. 많은 디지털 전환 프로젝트가 기존 종이 양식의 디지털화에서 시작해, 더 똑똑해질 수 있다는 것을 깨달아요.
  - "청구지 주소와 배송지 주소가 같은데 왜 둘 다 입력해야 하죠?"
  - "이미 남성이라고 말했는데 왜 여성 건강 섹션을 작성해야 하죠?"
  - "어느 나라에 있는지 이미 말했는데 왜 이렇게 많은 시/도 옵션이 나오죠?"

현실은, 사용자들은 자신의 필요에 맞춘 똑똑한 솔루션을 ~~원하는~~ **기대하는** 것이며, 정보를 수집하기 위해 사용자 앞에 양식을 내놓는다면 반드시 지능적인 방식으로 **해야 해요**.

그럼 이게 어댑티브 카드와 무슨 상관일까요? 사용자로부터 여러 정보를 수집하고 검증하는 상황에서는 그 과정이 목적에 맞아야 해요. 사용자에게 이해되어야 하고, 마찰이 없어야 하며, 이는 곧 지능적으로 맞춤화되어야 한다는 뜻이에요. 카드는 필요한 모든 정보를 담아내되, 작성하기 번거로워지면 안 돼요. 물론 변수를 사용해 필드를 숨기거나 표시하고 선택지를 채우는 방식으로 어느 정도의 동적 제어가 가능하지만, 변수의 수가 늘어날수록 복잡도는 기하급수적으로 증가해요.

변수가 무한한 상황에서, 사용자의 의도에 기반해 사용자에게 이해되는 양식을 생성하고, 그들의 입력을 사용해 의미 있는 응답을 만들어 봐요.

## 컨텍스트에 맞춘 어댑티브 카드

다음 섹션에서는 구체적인 예를 살펴볼게요. 특정 국가로의 여행 일정 설계를 도와주는 것이 목적인 디지털 여행사 에이전트예요.

사용자는 이 경험에서 무엇을 원할까요? 관광객으로서 자신이 즐기는 것들과 관련된 제안을 원해요. 에이전트가 자신의 의도를 이해하고, 단순히 "이 나라에서 할 만한 멋진 것들"이라는 검색 엔진 결과 이상의 일정을 제공하기를 원해요. 예정된 여행 날짜 범위 안에서 실행 가능한 아이디어, 방문할 국가에 맞는 의미 있는 제안, 그리고 무엇보다 자신의 개별 관심사에 기반해 즐길 수 있는 것들을 원해요.

이것을 대화로 해결할 수도 있겠지만, 에이전트가 필요한 것을 파악하도록 하기 위한 주고받는 대화는 금세 번거로워질 수 있어요. 사용자의 의도를 파악하도록 설계된, 몇 가지 목적에 맞는 제안이 담긴 양식이야말로 맞춤형 관광 프로필을 생성하는 데 딱 맞는 해법일 수 있으며, 그 프로필은 다시 의미 있고 구체적인 일정을 생성하는 데 사용될 수 있어요.

스페인 여행을 계획하려는 사용자의 요청에 대한 제 여행사 에이전트의 응답을 봐요.

산마리노에 대한 비슷한 요청의 양식과 비교하기 전까지는 꽤 평범한 양식처럼 보여요.

> **팁:** 산마리노에는 해변이 없고(스페인에는 있죠), 양식 내용이 그에 맞게 조정되어 있어요.

그뿐만 아니라 각 질문의 선택지도 국가에 맞춰져 있어요.

여행 시작일과 종료일 필드도 있어서, 이 모든 정보를 통해 사용자가 어떤 유형의 여행자인지 판단하는 데 필요한 모든 것을 갖추게 되고, 이를 바탕으로 맞춤형 추천을 할 수 있어요.

그 정보를 사용해 사용자의 선호도에 기반한 맞춤형 일정을 생성할 수 있어요.

멋지지 않나요?! 하지만 가장 중요한 것은...

여기 있는 모든 것이 즉석에서 이루어졌다는 점이에요. 양식 생성과 사용자 응답 해석 모두 말이죠.

## 모두 하나로 합치기

이번에는 어댑티브 카드 JSON 생성을 담당하는 커스텀 프롬프트에 더 포괄적인 지시문을 넣었고, 이 프롬프트는 국가만 입력으로 받아요.

그런 다음 관광객 프로필을 만드는 또 다른 프롬프트를 만들었어요. 이 프롬프트는 국가, 원본 어댑티브 카드, 그리고 제출에 대한 사용자의 응답을 입력으로 받아요. 원본 카드 JSON을 전달한 이유는 프롬프트가 사용자가 좋아하는 것뿐만 아니라 싫어하는 것도 추론할 수 있게 하기 위해서였고, 국가를 전달한 이유는 프롬프트가 사용자의 필요에 대한 판단을 내릴 때 가능한 한 많은 정보를 활용할 수 있게 하기 위해서였어요.

전체 여정을 하나의 토픽 안에 넣었고, 사용자가 특정 국가로의 여행을 계획하고 싶어 할 때 트리거되도록 했어요.

토픽에는 약간의 조정이 필요했어요. 기본적인 흐름은 다음과 같았어요.
  - 카드 생성 흐름 호출
  - 그 출력을 어댑티브 카드 노드에 전달
  - 어댑티브 카드 노드의 출력을 프로필 생성 흐름에 전달
  - 프로필을 사용자에게 출력
  - 생성형 답변(Generative Answers) 노드를 사용해 일정을 생성하고 출력

어댑티브 카드의 동적인 특성을 제외하면 모두 꽤 단순해요. 저는 약간의 편법을 써서 질문 개수를 고정해 두었고(카드 생성 프롬프트를 다시 보세요), 덕분에 카드에서 고정된 개수의 출력을 기대할 수 있었어요. 토픽 YAML을 조금 손보면...

...전체 응답을 나타내는 단일 변수를 설정해 관광객 프로필을 생성하는 프롬프트에 전달할 수 있었어요(프롬프트의 출력은 그냥 메시지로 사용자에게 바로 되돌려 주었어요)...

...그다음에는 프로필을 (공개 웹사이트에 그라운딩된) 생성형 답변 노드에 전달해 최종 일정을 생성하기만 하면 됐어요.

## 요약

자, 이렇게 해서 JSON 한 줄 없이 대화형 인텔리전스를 이끄는 동적 양식이 완성되었어요. 어댑티브 카드는 특정 상황에서 훌륭하며, Copilot이 무거운 작업을 대신해 주면 카드를 만드는 일도 매우 간단해질 수 있어요!

---
*여러분은 어댑티브 카드로 무엇을 하고 계신가요? 어댑티브 카드로 무엇을 할 수 있을까요? 아래에 알려주세요!*

---

## 어휘 주석

1. **WYSIWYG(What You See Is What You Get):** 편집 화면에 보이는 그대로 결과물이 만들어지는 편집 방식.
2. **생성형 오케스트레이션(Generative Orchestration):** 어떤 도구를 언제 호출하고 응답을 어떻게 구성할지를 에이전트가 스스로 판단해 처리하도록 맡기는 방식.

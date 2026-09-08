---
title: '[1] 없애기: Copilot Studio 답변에서 인용을 제거하는 방법'
description: '업로드 파일 인용이나 접근 제한 상황에서 Copilot Studio 답변 속 인용 표시를 YAML과 Power Fx로 깔끔하게 지우는 방법을 정리했어요.'
date: 2026-09-08
tags: ["Copilot Studio", "인용 제거", "YAML", "Power Fx", "생성형 오케스트레이션"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/remove-citations/card-01.png
  - /cards/remove-citations/card-02.png
  - /cards/remove-citations/card-03.png
  - /cards/remove-citations/card-04.png
  - /cards/remove-citations/card-05.png
  - /cards/remove-citations/card-06.png
  - /cards/remove-citations/card-07.png
---

> **원문:** [Kill the [1]: How to Remove Citations from Copilot Studio Answers](https://microsoft.github.io/mcscatblog/posts/remove-citations-in-copilot-studio-answer/)
> **게시일:** 2025-12-15 · **저자:** Henry Jammes

인용(citation)은 투명성과 신뢰 측면에서 가치가 있어요. 사용자가 정보를 검증하고 출처를 탐색할 수 있게 해주기 때문이에요. 많은 채널에서 인용은 깔끔하게 표시되며 사용자 경험을 향상시켜요.

하지만 인용을 숨기고 싶은 상황도 있어요. 예를 들어, 지식 소스가 에이전트에 직접 업로드된 내부 파일이거나 사용자가 원본 문서에 접근할 수 없는 경우, 인용은 혼란을 주거나 인터페이스를 어지럽힐 수 있어요.

## 언제 인용을 숨겨야 할까요?

인용을 숨기는 것이 사용자 경험을 개선하는 구체적인 사용 사례가 있어요.

1. **업로드된 파일의 인용.**<br>
   파일이 에이전트의 지식 소스로 직접 업로드된 경우, 인용이 깔끔한 링크가 아니라 원본 데이터의 인덱싱된 원시 청크(chunk)로 표시돼요. 이는 가독성을 떨어뜨리는 텍스트 덩어리를 만들어 인터페이스를 어지럽혀요.
2. **접근 제한.**<br>
   사용자에게 원본 문서에 직접 접근할 권한이 없어 인용 링크가 무용지물이 될 수 있어요.

이런 상황이 여러분의 사용 사례에 해당한다면, 이 가이드에서 YAML<sup>1</sup> 구성을 사용해 에이전트 응답에서 인용을 제거하는 방법을 보여드릴게요.

에이전트가 어떻게 설정되어 있느냐에 따라 두 가지 방법이 있어요.

---

## 시나리오 1: 생성형 오케스트레이션(Generative Orchestration)을 사용하는 경우 (기본값)

최신 **생성형(Generative)** 오케스트레이션 모드를 사용하고 있다면, 에이전트가 언제 답변을 트리거할지 결정해요. 응답이 사용자에게 도달하기 전에 가로챌 수 있어요.

> **팁:** **노코드 대안**
> 생성형 오케스트레이션에서는 지침(instructions)을 사용해 인용 표시 여부에 영향을 줄 수도 있어요.
> 예: `Never include any citation in your knowledge answers. These should be removed before an answer is sent.`
>
> **참고:** 이 방법은 대체로 잘 동작하지만, 지침은 *확률적*(AI가 처리)인 반면 아래의 코드 방식은 *결정론적*(수학이 처리)이에요. 100% 보장이 필요하다면 아래 코드를 사용하세요.

### 해결 방법

1. 빈 상태에서 **새 토픽**을 만들어요.
2. 캔버스 오른쪽 상단의 **... 더 보기(More)**(점 세 개)를 클릭해요.
3. **코드 편집기 열기(Open code editor)**를 선택해요.
4. 거기에 있는 내용을 **모두 삭제**하고 다음 YAML 마법을 붙여넣어요.

```yaml
kind: AdaptiveDialog
beginDialog:
  kind: OnGeneratedResponse
  id: main
  actions:
    - kind: SetVariable
      id: setVariable_IndFsH
      variable: System.ContinueResponse
      value: =false

    - kind: SetVariable
      id: setVariable_InhmTQ
      variable: Topic.answerNoCitations
      value: |-
        =Trim(
            With(
                { 
                    // 1. Cut off the text at the start of the citation block "[1]:"
                    // If no citations exist, this keeps the whole text.
                    CleanedFooter: First(Split(System.Response.FormattedText, "[1]:")).Value 
                },
                // 2. Remove inline markers [1] through [6]
                Substitute(
                    Substitute(
                        Substitute(
                            Substitute(
                                Substitute(
                                    Substitute(
                                        CleanedFooter,
                                        "[1]", ""
                                    ),
                                    "[2]", ""
                                ),
                                "[3]", ""
                            ),
                            "[4]", ""
                        ),
                        "[5]", ""
                    ),
                    "[6]", ""
                )
            )
        )

    - kind: SendActivity
      id: sendActivity_9USOB6
      activity: |
        {Topic.answerNoCitations}
```

### 실제로 무슨 일이 일어나는 걸까요?

우리는 `OnGeneratedResponse` 이벤트를 사용하고 있어요. 이것은 오케스트레이터가 답변을 생성한 후, 사용자에게 표시되기 전에 발동하는 특별한 트리거예요.

**System.ContinueResponse = false**: "인쇄 중지!" 명령이에요. Copilot Studio에게 방금 생성한 메시지를 보내지 말라고 지시해요.

**Power Fx<sup>2</sup> 처리**: 원본 텍스트(`System.Response.FormattedText`)는 Power Fx 함수를 통해 처리돼요.

- **푸터 제거**: `Split(..., "[1]:")`이 메시지 끝의 인용 블록을 찾아 제거해요.
- **인라인 마커 제거**: 일련의 `Substitute` 호출이 인라인 인용 마커 `[1]`, `[2]` 등을 제거해요. (이 예제는 최대 6개의 인용을 처리해요.)

**SendActivity**: 정리된 텍스트가 사용자에게 전송돼요.

---

## 시나리오 2: "클래식" 또는 명시적 토픽을 사용하는 경우

**Conversational Boosting** 시스템 토픽이나 수동 **생성형 답변 만들기(Create generative answers)** 노드를 사용하고 있다면, `OnGeneratedResponse` 이벤트 대신 노드에서 직접 출력을 처리해야 해요.

### 해결 방법

**Conversational Boosting** 토픽으로 이동해 **코드 편집기(Code editor)**를 열고 이 패턴을 살펴보세요. 기본적으로 표준 흐름을 다음 로직으로 교체하면 돼요.

```yaml
kind: AdaptiveDialog
beginDialog:
  kind: OnUnknownIntent
  id: main
  priority: -1
  actions:
    - kind: SearchAndSummarizeContent
      id: search-content
      autoSend: false
      variable: Topic.Answer
      userInput: =System.Activity.Text
      responseCaptureType: FullResponse

    - kind: ConditionGroup
      id: has-answer-conditions
      conditions:
        - id: has-answer
          condition: =!IsBlank(Topic.Answer)
          actions:
            - kind: SetVariable
              id: setVariable_BPFogc
              variable: Topic.answerNoCitations
              value: |-
                =Trim(
                    Substitute(
                        Substitute(
                            Substitute(
                                Substitute(
                                    Substitute(
                                        Substitute(
                                            Topic.Answer.Text.Content,
                                            "[1]", ""
                                        ),
                                        "[2]", ""
                                    ),
                                    "[3]", ""
                                ),
                                "[4]", ""
                            ),
                            "[5]", ""
                        ),
                        "[6]", ""
                    )
                )

            - kind: SendActivity
              id: sendActivity_bqHVcB
              activity: "{Topic.answerNoCitations}"

            - kind: EndDialog
              id: end-topic
              clearTopicQueue: true
```

### 구현 세부 사항

이 접근 방식에서는 **생성형 답변 만들기(Create generative answers)** 노드(YAML에서는 `SearchAndSummarizeContent`로 표시)를 수정해요.

**autoSend: false**: 노드가 응답을 자동으로 전송하지 못하게 막아, 먼저 처리할 수 있도록 해요.

**responseCaptureType: FullResponse**: 전체 응답 객체를 캡처해 텍스트 내용에 접근하고 조작할 수 있게 해요.

**인용 제거**: 동일한 Power Fx 치환 패턴이 `Topic.Answer.Text.Content`에 적용돼요.

**전송 및 종료**: 정리된 텍스트가 전송되고 다이얼로그가 명시적으로 종료돼요.

---

## 요약

이 가이드에서는 인용이 사용 사례에 맞지 않을 때 Copilot Studio 응답에서 인용을 제거하는 방법을 살펴보았어요. 사용 중인 오케스트레이션 모드에 맞는 접근 방식을 선택하고, 일반적으로 마주치는 인용 개수에 맞게 Power Fx 표현식을 커스터마이징하세요.

인용은 많은 시나리오에서 투명성과 신뢰를 제공한다는 점을 기억하고, 제거하기 전에 구체적인 요구 사항을 충분히 검토하시기 바라요.

---

## 어휘 주석

1. **YAML:** 들여쓰기로 구조를 표현하는 사람이 읽기 쉬운 데이터 형식으로, Copilot Studio는 토픽의 로직을 이 형식의 코드로도 편집할 수 있게 해 줘요.
2. **Power Fx:** Microsoft Power Platform에서 수식과 로직을 표현할 때 쓰는 프로그래밍 언어로, 엑셀 수식과 비슷한 문법을 써요.

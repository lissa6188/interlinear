---
title: 'Teams용 Copilot Studio 에이전트 설계하기 (테스트 채팅은 너무 쉬웠으니까)'
description: '테스트 채팅에서는 문제없던 Copilot Studio 에이전트가 Teams에 배포될 때 마주치는 재설치·컨텍스트·오류 처리 문제와 해결 패턴을 정리했어요.'
date: 2026-09-07
tags: ["Copilot Studio", "Teams", "에이전트 설계", "프로덕션 배포"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/teams-agent-design/card-01.png
  - /cards/teams-agent-design/card-02.png
  - /cards/teams-agent-design/card-03.png
  - /cards/teams-agent-design/card-04.png
  - /cards/teams-agent-design/card-05.png
  - /cards/teams-agent-design/card-06.png
  - /cards/teams-agent-design/card-07.png
  - /cards/teams-agent-design/card-08.png
---

> **원문:** [Design Copilot Studio Agents for Teams (Because Test Chat Was Too Easy)](https://microsoft.github.io/mcscatblog/posts/copilot-studio-teams-agent-patterns/)
> **게시일:** 2026-04-07 · **저자:** Henry Jammes

여러분의 에이전트는 테스트 채팅에서는 훌륭하게 동작해요. 그런데 Teams에 배포하는 순간, 사용자들은 앱을 재설치했더니 채팅이 왜 비어 있는지, 에이전트가 왜 지난달 컨텍스트를 기억하는지, 오류는 왜 다음에 뭘 해야 할지 힌트 하나 없이 "문제가 발생했어요"라고만 하는지 혼란스러워해요.

프로덕션의 세계에 오신 걸 환영해요. 통제된 환경에서 완벽하게 동작하던 모든 것이 실제 사용자 행동의 혼돈과 만나는 곳이죠.

이 가이드는 Remi Dyon의 [Teams에 에이전트를 배포하기 위한 모범 사례](https://microsoft.github.io/mcscatblog/posts/copilot-studio-teams-deployment-ux/)를 바탕으로, 바로 가져오기(import)할 수 있는 YAML을 곁들여 더 실용적으로 만들고 몇 가지 패턴을 한 단계 더 발전시킨 거예요. 매주 앱을 재설치하는 사용자, 몇 달씩 유지되는 대화, 오래되어 상한 컨텍스트, 분산 시스템 박사 학위 없이도 디버깅할 수 있어야 하는 오류 등, 현실 세계의 난장판을 다루는 여덟 가지 패턴이에요.

> **팁:** 복사-붙여넣기를 건너뛰고 싶으신가요? [완성된 솔루션 파일을 다운로드](https://microsoft.github.io/mcscatblog/assets/posts/copilot-studio-teams-agent-patterns/B2EAgent_1_0_0_0.zip)해서 Copilot Studio에 바로 가져오세요. 진행 방법이 필요하면 [가져오기/내보내기 문서](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-solutions-import-export#import-the-solution-with-your-agent)를 확인하세요.

## 패턴 바로 가기

- [재설치와 Conversation Start 처리하기](#재설치와-conversation-start-처리하기)
- [비활성 기간 후 대화 기록 지우기](#비활성-기간-후-대화-기록-지우기)
- [비활성 후 사용자에게 알리기](#비활성-후-새-대화가-시작됨을-사용자에게-알리기)
- [전역 컨텍스트 변수 설정하기](#전역-컨텍스트-변수-설정하기)
- [Reset Conversation 토픽 업데이트](#reset-conversation-토픽을-업데이트해-기록과-세션-변수를-지우고-conversation-start로-리디렉션하기)
- [Start Over 토픽 업데이트](#start-over-토픽을-업데이트해-더-많은-문제-해결-옵션-제공하기)
- [On Error 토픽 업데이트](#on-error-토픽을-업데이트해-셀프서비스-문제-해결-지원하기)
- [추천 프롬프트 구성](#추천-프롬프트-구성하기)

> **참고:** 처음 네 개의 패턴은 **새 토픽**이에요. Copilot Studio에서 처음부터 새로 만드세요. 다음 세 개(제목이 "업데이트"로 시작)는 **기존 시스템 토픽을 수정**해요. 새 토픽용 YAML을 기존 토픽에 붙여넣지 마세요.

---

## 재설치와 Conversation Start 처리하기

사용자는 예상보다 자주 Teams 앱을 재설치해요. IT가 업데이트를 배포하거나, 캐시가 지워지거나, 사용자가 문제를 해결하려고 재설치하죠. 그런 일이 생기면, [Conversation Start](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-system-topics?tabs=webApp#conversation-start)가 재설치 시에는 트리거되지 않기 때문에 사용자는 종종 빈 채팅 화면을 마주하게 돼요.

해결책은 에이전트가 [설치 업데이트 이벤트](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-triggers#:~:text=a%20specific%20event.-,An%20activity%20occurs,-Fires%20when%20an)를 감지하면 **Conversation Start**로 리디렉션하는 거예요.

```yaml
kind: AdaptiveDialog
startBehavior: UseLatestPublishedContentAndCancelOtherTopics
beginDialog:
  kind: OnActivity
  id: main
  type: InstallationUpdate
  actions:
    - kind: BeginDialog
      id: Bqmh4L
      dialog: cat_B2EAgent.topic.ConversationStart
```

> **참고:** `startBehavior: UseLatestPublishedContentAndCancelOtherTopics`는 진행 중인 토픽을 모두 취소하고 에이전트가 즉시 최신 게시 버전을 쓰도록 강제해요. 이 설정이 없으면 Copilot Studio는 게시 후에도 기존 세션을 유지하고, 다이얼로그 스택이 비워진 뒤에야 에이전트가 새 버전을 적용해요. Teams 대화는 다른 채널보다 오래 유지되니까, 사용자가 이전 버전에 갇혀 있을 가능성이 더 커요. 이 속성은 이 글의 여러 토픽에서 계속 등장해요.

---

## 비활성 기간 후 대화 기록 지우기

Teams의 에이전트 대화는 영속적이에요. 사용자가 일주일 만에 돌아와도 에이전트는 여전히 화요일의 예산 보고서 질문에서 온 오래된 컨텍스트를 갖고 있는데, 이제 사용자는 완전히 다른 도움이 필요해요. 에이전트는 상한 정보로 작업하고, 사용자는 에이전트가 왜 혼란스러워하는지 전혀 몰라요.

[비활성 트리거](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-triggers#:~:text=The%20user%20is%20inactive%20for%20a%20while)(초 단위)로 새 토픽을 만들어서, 일정 시간 침묵 후 토픽을 종료하고 [기록과 변수](https://learn.microsoft.com/microsoft-copilot-studio/authoring-variables)를 지우세요. 모두 지운 다음, 후속 대화를 매끄럽게 처리하려고 플래그(`Global.InactiveConversation`)를 설정해요.

<details markdown="1">
<summary>전체 YAML — 클릭해서 펼치기</summary>

```yaml
kind: AdaptiveDialog
beginDialog:
  kind: OnInactivity
  id: main
  condition: =System.Activity.ChannelId = "msteams"
  durationInSeconds: 43200
  actions:
    - kind: ClearAllVariables
      id: mXHosp
      variables: ConversationHistory
    - kind: ClearAllVariables
      id: Vsemgr
    - kind: SetVariable
      id: setVariable_6CUITr
      variable: Global.InactiveConversation
      value: true
    - kind: CancelAllDialogs
      id: webE3j
inputType: {}
outputType: {}
```

</details>

참고: `durationInSeconds: 43200`은 12시간이에요. 사용 사례에 맞게 조정하세요.

> **팁:** 대화 기록을 주기적으로 지우면 토큰 한도 오류를 줄이는 데도 도움이 돼요. 오래 지속되는 대화는 시간이 지나면서 토큰이 쌓이거든요.

---

## 비활성 후 새 대화가 시작됨을 사용자에게 알리기

컨텍스트가 지워진 뒤 사용자가 후속 질문을 하면, 그 사실을 알려줘야 해요. 그렇지 않으면 에이전트가 방금까지 나눈 대화를 기억하지 못할 때 사용자는 혼란스러워할 거예요.

[기본 카드(Basic Card)](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-send-message#add-a-basic-card)로 알림을 보내세요. "Start over" 버튼은 계속 유지되어 사용자가 언제든 새로 시작할 수 있어요.

```yaml
kind: AdaptiveDialog
beginDialog:
  kind: OnActivity
  id: main
  condition: =Global.InactiveConversation = true
  type: Message
  actions:
    - kind: SetVariable
      id: setVariable_G6aAbW
      variable: Global.InactiveConversation
      value: false
    - kind: SendActivity
      id: sendActivity_pgGjvA
      activity:
        attachments:
          - kind: HeroCardTemplate
            title: Session expired
            subtitle: New conversation started
            text: ℹ️ Just so you know – Your previous session ended due to inactivity. Your query is now being treated as a new conversation. If you want to start fresh, you can restart at any time.
            buttons:
              - kind: MessageBack
                title: Start over
                text: Start over
inputType: {}
outputType: {}
```

---

## 전역 컨텍스트 변수 설정하기

컨텍스트 변수(사용자 언어, 국가, 부서 등)는 보통 **Conversation Start**에서 설정해요. 하지만 그것만으로는 모든 시나리오를 커버하지 못해요.

- **Microsoft 365 Copilot은 Conversation Start를 트리거하지 않아요**
- **앞선 패턴에서 봤듯이 "Start Over" 이후, 심지어 비활성 이후에도 변수가 지워져요**

더 나은 접근법은 컨텍스트 값을 모를 때 트리거되는 토픽을 만드는 거예요. 이렇게 하면 채널에 상관없이 사용자의 첫 메시지에서 변수가 설정되고, 어떤 리셋 이후에도 다시 설정될 수 있어요.

```yaml
kind: AdaptiveDialog
beginDialog:
  kind: OnActivity
  id: main
  priority: -2
  condition: =IsBlank(Global.UserContext)
  type: Message
  actions:
    - kind: SetVariable
      id: setVariable_kRbCMi
      variable: Global.UserContext
      value: |-
        ={
            Country: "USA",
            Language: "English"
        }
inputType: {}
outputType: {}
```

값이 없을 때 이 토픽이 트리거되도록 에이전트 지침도 업데이트할 수 있어요.

```markdown
**Context**
The current user country is: "{Global.UserContext.Country}", and language is "{Global.UserContext.Language}".

If you don't know the user country (e.g., ""), use this tool to get the current values: {System.Bot.Components.Topics.'cat_B2EAgent.topic.SetContextVariables'.DisplayName}.
```

이 값들이 Conversation Start 토픽에서도 설정되길 원한다면, 해당 토픽으로 리디렉션하기만 하면 돼요.

```yaml
kind: AdaptiveDialog
beginDialog:
  kind: OnConversationStart
  id: main
  actions:
    - kind: BeginDialog
      id: TzNx
      dialog: cat_B2EAgent.topic.SetContextVariables
    - kind: SendActivity
      id: sendMessage_MLuhV
      activity:
        text:
          - Hello, I'm {System.Bot.Name}. How can I help?
        speak:
          - Hello and thank you for calling {System.Bot.Name}. Please note that some responses are generated by AI and may require verification for accuracy. How may I help you today?
```

---

## Reset Conversation 토픽을 업데이트해 기록과 세션 변수를 지우고 Conversation Start로 리디렉션하기

사용자는 언제든지 **Start Over** 토픽으로 처음부터 다시 시작할 수 있고, 이 토픽은 [Reset Conversation 시스템 토픽](https://learn.microsoft.com/microsoft-copilot-studio/authoring-system-topics#reset-conversation)으로 리디렉션돼요. 기본적으로 이 토픽은 대화 기록을 지우지도, **Conversation Start**로 리디렉션하지도 않아요. 이걸 고쳐볼게요.

```yaml
kind: AdaptiveDialog
startBehavior: UseLatestPublishedContentAndCancelOtherTopics
beginDialog:
  kind: OnSystemRedirect
  id: main
  actions:
    - kind: ClearAllVariables
      id: clearAllVariables_73bTFR
      variables: ConversationScopedVariables
    - kind: ClearAllVariables
      id: SLgE7u
      variables: ConversationHistory
    - kind: BeginDialog
      id: U14iCH
      dialog: cat_B2EAgent.topic.ConversationStart
    - kind: CancelAllDialogs
      id: cancelAllDialogs_12Gt21
```

---

## Start Over 토픽을 업데이트해 더 많은 문제 해결 옵션 제공하기

기본 [Start Over 시스템 토픽](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-system-topics?tabs=webApp#reset-conversation)은 "처음부터 다시 시작하시겠어요?"라고 묻는 게 전부예요. 좀 더 쓸모 있게 만들어볼게요.

[어댑티브 카드(Adaptive Card)](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-send-message#add-an-adaptive-card)로 문제 해결 옵션을 주는 확인 다이얼로그로 업데이트해요.

- 어댑티브 카드로 확인 절차 제공(실수로 인한 리셋 방지)
- 고급 문제 해결 옵션 제공(상태 지우기, 기록 지우기, 대화 ID)
- 진단 정보 표시(환경 ID, 에이전트 ID, 테넌트 ID, 대화 ID, 타임스탬프)

기본 'Boolean' 옵션을 쓰지 않으니("예/아니요" 빠른 응답 대신 어댑티브 카드 액션 버튼을 원하니까), 질문 노드에 Yes/No용 닫힌 목록 엔터티(closed list entity)를 설정해요.

그런 다음 조건 분기가 해당 엔터티를 쓰도록 수정해요.

<details markdown="1">
<summary><strong>Start Over 토픽의 전체 YAML 보기</strong></summary>

```yaml
kind: AdaptiveDialog
beginDialog:
  kind: OnRecognizedIntent
  id: main
  intent:
    displayName: Start Over
    includeInOnSelectIntent: false
    triggerQueries:
      - let's begin again
      - start over
      - start again
      - restart
  actions:
    - kind: Question
      id: i47Svk
      interruptionPolicy:
        allowInterruption: false
      repeatCount: 0
      alwaysPrompt: true
      variable: Topic.Confirm
      prompt:
        attachments:
          - kind: AdaptiveCardTemplate
            cardContent: |-
              ={
                '$schema': "https://adaptivecards.io/schemas/adaptive-card.json",
                type: "AdaptiveCard",
                version: "1.5",
                body: [
                  {
                    type: "TextBlock",
                    text: "Are you sure you want to restart the conversation?",
                    wrap: true,
                    weight: "Bolder",
                    size: "Medium"
                  },
                  {
                    type: "TextBlock",
                    text: "This will reset the current conversation context.",
                    wrap: true,
                    isSubtle: true,
                    spacing: "Small"
                  },
                  {
                    type: "ActionSet",
                    spacing: "Medium",
                    actions: [
                      { type: "Action.Submit", title: "Yes", data: "Yes" },
                      { type: "Action.Submit", title: "No", data: "No" }
                    ]
                  },
                  {
                    type: "Container",
                    spacing: "Small",
                    style: "emphasis",
                    bleed: true,
                    items: [
                      {
                        type: "TextBlock",
                        text: "Advanced options",
                        size: "Small",
                        weight: "Bolder",
                        wrap: true
                      }
                    ],
                    selectAction: {
                      type: "Action.ToggleVisibility",
                      targetElements: ["advancedOptions"]
                    }
                  },
                  {
                    type: "Container",
                    id: "advancedOptions",
                    isVisible: false,
                    spacing: "Small",
                    items: [
                      {
                        type: "TextBlock",
                        text: "Troubleshooting actions",
                        size: "Small",
                        weight: "Bolder",
                        spacing: "Small"
                      },
                      {
                        type: "ActionSet",
                        spacing: "Small",
                        actions: [
                          { type: "Action.Submit", title: "Clear state", data: "/debug clearstate" },
                          { type: "Action.Submit", title: "Clear history", data: "/debug clearhistory" },
                          { type: "Action.Submit", title: "Conversation ID", data: "/debug conversationid" }
                        ]
                      },
                      {
                        type: "TextBlock",
                        text: "Troubleshooting information",
                        weight: "Bolder",
                        size: "Small",
                        spacing: "Small",
                        separator: true
                      },
                      {
                        type: "TextBlock",
                        text: "Environment details",
                        weight: "Bolder",
                        size: "Small",
                        spacing: "Small"
                      },
                      {
                        type: "ColumnSet",
                        spacing: "None",
                        columns: [
                          {
                            type: "Column",
                            width: "90px",
                            items: [
                              { type: "TextBlock", text: "Environment ID", weight: "Bolder", size: "Small", wrap: true, spacing: "None" }
                            ]
                          },
                          {
                            type: "Column",
                            width: "stretch",
                            items: [
                              { type: "TextBlock", text: Text(System.Bot.EnvironmentId), size: "Small", wrap: true, spacing: "None", isSubtle: true }
                            ]
                          }
                        ]
                      },
                      {
                        type: "ColumnSet",
                        spacing: "None",
                        columns: [
                          {
                            type: "Column",
                            width: "90px",
                            items: [
                              { type: "TextBlock", text: "Tenant ID", weight: "Bolder", size: "Small", wrap: true, spacing: "None" }
                            ]
                          },
                          {
                            type: "Column",
                            width: "stretch",
                            items: [
                              { type: "TextBlock", text: Text(System.Bot.TenantId), size: "Small", wrap: true, spacing: "None", isSubtle: true }
                            ]
                          }
                        ]
                      },
                      {
                        type: "TextBlock",
                        text: "Agent details",
                        weight: "Bolder",
                        size: "Small",
                        spacing: "Small",
                        separator: true
                      },
                      {
                        type: "ColumnSet",
                        spacing: "None",
                        columns: [
                          {
                            type: "Column",
                            width: "90px",
                            items: [
                              { type: "TextBlock", text: "Name", weight: "Bolder", size: "Small", wrap: true, spacing: "None" }
                            ]
                          },
                          {
                            type: "Column",
                            width: "stretch",
                            items: [
                              { type: "TextBlock", text: Text(System.Bot.Name), size: "Small", wrap: true, spacing: "None", isSubtle: true }
                            ]
                          }
                        ]
                      },
                      {
                        type: "ColumnSet",
                        spacing: "None",
                        columns: [
                          {
                            type: "Column",
                            width: "90px",
                            items: [
                              { type: "TextBlock", text: "Agent ID", weight: "Bolder", size: "Small", wrap: true, spacing: "None" }
                            ]
                          },
                          {
                            type: "Column",
                            width: "stretch",
                            items: [
                              { type: "TextBlock", text: Text(System.Bot.Id), size: "Small", wrap: true, spacing: "None", isSubtle: true }
                            ]
                          }
                        ]
                      },
                      {
                        type: "ColumnSet",
                        spacing: "None",
                        columns: [
                          {
                            type: "Column",
                            width: "90px",
                            items: [
                              { type: "TextBlock", text: "Schema name", weight: "Bolder", size: "Small", wrap: true, spacing: "None" }
                            ]
                          },
                          {
                            type: "Column",
                            width: "stretch",
                            items: [
                              { type: "TextBlock", text: Text(System.Bot.SchemaName), size: "Small", wrap: true, spacing: "None", isSubtle: true }
                            ]
                          }
                        ]
                      },
                      {
                        type: "TextBlock",
                        text: "User details",
                        weight: "Bolder",
                        size: "Small",
                        spacing: "Small",
                        separator: true
                      },
                      {
                        type: "ColumnSet",
                        spacing: "None",
                        columns: [
                          {
                            type: "Column",
                            width: "90px",
                            items: [
                              { type: "TextBlock", text: "Language", weight: "Bolder", size: "Small", wrap: true, spacing: "None" }
                            ]
                          },
                          {
                            type: "Column",
                            width: "stretch",
                            items: [
                              { type: "TextBlock", text: Text(System.User.Language), size: "Small", wrap: true, spacing: "None", isSubtle: true }
                            ]
                          }
                        ]
                      },
                      {
                        type: "ColumnSet",
                        spacing: "None",
                        columns: [
                          {
                            type: "Column",
                            width: "90px",
                            items: [
                              { type: "TextBlock", text: "Object ID", weight: "Bolder", size: "Small", wrap: true, spacing: "None" }
                            ]
                          },
                          {
                            type: "Column",
                            width: "stretch",
                            items: [
                              { type: "TextBlock", text: Text(System.User.Id), size: "Small", wrap: true, spacing: "None", isSubtle: true }
                            ]
                          }
                        ]
                      },
                      {
                        type: "TextBlock",
                        text: "Conversation details",
                        weight: "Bolder",
                        size: "Small",
                        spacing: "Small",
                        separator: true
                      },
                      {
                        type: "ColumnSet",
                        spacing: "None",
                        columns: [
                          {
                            type: "Column",
                            width: "90px",
                            items: [
                              { type: "TextBlock", text: "Channel", weight: "Bolder", size: "Small", wrap: true, spacing: "None" }
                            ]
                          },
                          {
                            type: "Column",
                            width: "stretch",
                            items: [
                              { type: "TextBlock", text: Text(System.Activity.ChannelId), size: "Small", wrap: true, spacing: "None", isSubtle: true }
                            ]
                          }
                        ]
                      },
                      {
                        type: "ColumnSet",
                        spacing: "None",
                        columns: [
                          {
                            type: "Column",
                            width: "90px",
                            items: [
                              { type: "TextBlock", text: "Conversation ID", weight: "Bolder", size: "Small", wrap: true, spacing: "None" }
                            ]
                          },
                          {
                            type: "Column",
                            width: "stretch",
                            items: [
                              { type: "TextBlock", text: Text(System.Conversation.Id), size: "Small", wrap: true, spacing: "None", isSubtle: true }
                            ]
                          }
                        ]
                      },
                      {
                        type: "ColumnSet",
                        spacing: "None",
                        columns: [
                          {
                            type: "Column",
                            width: "90px",
                            items: [
                              { type: "TextBlock", text: "Time (UTC)", weight: "Bolder", size: "Small", wrap: true, spacing: "None" }
                            ]
                          },
                          {
                            type: "Column",
                            width: "stretch",
                            items: [
                              {
                                type: "TextBlock",
                                text: Text(Now(), DateTimeFormat.UTC),
                                size: "Small",
                                wrap: true,
                                spacing: "None",
                                isSubtle: true
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
      defaultValue: =Blank()
      entity:
        kind: ClosedListEntityReference
        entityId: cat_B2EAgent.entity.YesNo
    - kind: ConditionGroup
      id: conditionGroup_lvx2zV
      conditions:
        - id: conditionItem_sVQtHa
          condition: =Topic.Confirm = 'cat_B2EAgent.entity.YesNo'.Wspx0O
          actions:
            - kind: BeginDialog
              id: 0YKYsy
              dialog: cat_B2EAgent.topic.ResetConversation
        - id: conditionItem_drBn6v
          condition: =Topic.Confirm = 'cat_B2EAgent.entity.YesNo'.PlYKYb
          actions:
            - kind: SendActivity
              id: 5iVukz
              activity: Ok. Let's carry on.
      elseActions:
        - kind: RecognizeIntent
          id: AcwpXt
          userInput: =System.Activity.Text
```

</details>

사용자는 **Advanced options**를 펼쳐 문제 해결 명령과 관리자에게 공유할 진단 데이터를 확인할 수 있어요.

---

## On Error 토픽을 업데이트해 셀프서비스 문제 해결 지원하기

[On Error 시스템 토픽](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-system-topics?tabs=webApp#on-error)을 업데이트하면, 예기치 않은 오류가 났을 때 문제 해결 명령과 관리자에게 공유할 진단 데이터를 곁들인 더 사용자 친화적인 경험을 줄 수 있어요.

<details markdown="1">
<summary><strong>On Error 토픽의 전체 YAML 보기</strong></summary>

```yaml
kind: AdaptiveDialog
startBehavior: UseLatestPublishedContentAndCancelOtherTopics
beginDialog:
  kind: OnError
  id: main
  actions:
    - kind: SendActivity
      id: sendActivity_idc9Fl
      activity:
        attachments:
          - kind: AdaptiveCardTemplate
            cardContent: |-
              ={
                '$schema': "https://adaptivecards.io/schemas/adaptive-card.json",
                type: "AdaptiveCard",
                version: "1.5",
                body: [
                  {
                    type: "TextBlock",
                    text: "⚠️ Something went wrong",
                    wrap: true,
                    weight: "Bolder",
                    size: "Medium"
                  },
                  {
                    type: "TextBlock",
                    text: "We couldn't complete your request. You can review the details below or use the advanced troubleshooting options if needed.",
                    wrap: true,
                    isSubtle: true,
                    spacing: "Small"
                  },
                  {
                    type: "Container",
                    spacing: "Medium",
                    style: "attention",
                    bleed: true,
                    items: [
                      {
                        type: "ColumnSet",
                        spacing: "None",
                        columns: [
                          {
                            type: "Column",
                            width: "110px",
                            items: [
                              { type: "TextBlock", text: "Error message", weight: "Bolder", size: "Small", wrap: true, spacing: "None" }
                            ]
                          },
                          {
                            type: "Column",
                            width: "stretch",
                            items: [
                              { type: "TextBlock", text: Text(System.Error.Message), size: "Small", wrap: true, spacing: "None", isSubtle: true }
                            ]
                          }
                        ]
                      },
                      {
                        type: "ColumnSet",
                        spacing: "None",
                        columns: [
                          {
                            type: "Column",
                            width: "110px",
                            items: [
                              { type: "TextBlock", text: "Error code", weight: "Bolder", size: "Small", wrap: true, spacing: "None" }
                            ]
                          },
                          {
                            type: "Column",
                            width: "stretch",
                            items: [
                              { type: "TextBlock", text: Text(System.Error.Code), size: "Small", wrap: true, spacing: "None", isSubtle: true }
                            ]
                          }
                        ]
                      },
                      {
                        type: "ColumnSet",
                        spacing: "None",
                        columns: [
                          {
                            type: "Column",
                            width: "110px",
                            items: [
                              { type: "TextBlock", text: "Conversation ID", weight: "Bolder", size: "Small", wrap: true, spacing: "None" }
                            ]
                          },
                          {
                            type: "Column",
                            width: "stretch",
                            items: [
                              { type: "TextBlock", text: Text(System.Conversation.Id), size: "Small", wrap: true, spacing: "None", isSubtle: true }
                            ]
                          }
                        ]
                      },
                      {
                        type: "ColumnSet",
                        spacing: "None",
                        columns: [
                          {
                            type: "Column",
                            width: "110px",
                            items: [
                              { type: "TextBlock", text: "Time (UTC)", weight: "Bolder", size: "Small", wrap: true, spacing: "None" }
                            ]
                          },
                          {
                            type: "Column",
                            width: "stretch",
                            items: [
                              {
                                type: "TextBlock",
                                text: Text(Now(), DateTimeFormat.UTC),
                                size: "Small",
                                wrap: true,
                                spacing: "None",
                                isSubtle: true
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    type: "Container",
                    spacing: "Small",
                    style: "emphasis",
                    bleed: true,
                    items: [
                      {
                        type: "TextBlock",
                        text: "Advanced options",
                        size: "Small",
                        weight: "Bolder",
                        wrap: true
                      }
                    ],
                    selectAction: {
                      type: "Action.ToggleVisibility",
                      targetElements: ["advancedOptions"]
                    }
                  },
                  {
                    type: "Container",
                    id: "advancedOptions",
                    isVisible: false,
                    spacing: "Small",
                    items: [
                      {
                        type: "TextBlock",
                        text: "Troubleshooting actions",
                        size: "Small",
                        weight: "Bolder",
                        spacing: "Small"
                      },
                      {
                        type: "ActionSet",
                        spacing: "Small",
                        actions: [
                          { type: "Action.Submit", title: "Start over", data: "Start over" },
                          { type: "Action.Submit", title: "Clear state", data: "/debug clearstate" },
                          { type: "Action.Submit", title: "Clear history", data: "/debug clearhistory" },
                          { type: "Action.Submit", title: "Conversation ID", data: "/debug conversationid" }
                        ]
                      },
                      {
                        type: "TextBlock",
                        text: "Troubleshooting information",
                        weight: "Bolder",
                        size: "Small",
                        spacing: "Small",
                        separator: true
                      },
                      {
                        type: "TextBlock",
                        text: "Environment details",
                        weight: "Bolder",
                        size: "Small",
                        spacing: "Small"
                      },
                      {
                        type: "ColumnSet",
                        spacing: "None",
                        columns: [
                          {
                            type: "Column",
                            width: "90px",
                            items: [
                              { type: "TextBlock", text: "Environment ID", weight: "Bolder", size: "Small", wrap: true, spacing: "None" }
                            ]
                          },
                          {
                            type: "Column",
                            width: "stretch",
                            items: [
                              { type: "TextBlock", text: Text(System.Bot.EnvironmentId), size: "Small", wrap: true, spacing: "None", isSubtle: true }
                            ]
                          }
                        ]
                      },
                      {
                        type: "ColumnSet",
                        spacing: "None",
                        columns: [
                          {
                            type: "Column",
                            width: "90px",
                            items: [
                              { type: "TextBlock", text: "Tenant ID", weight: "Bolder", size: "Small", wrap: true, spacing: "None" }
                            ]
                          },
                          {
                            type: "Column",
                            width: "stretch",
                            items: [
                              { type: "TextBlock", text: Text(System.Bot.TenantId), size: "Small", wrap: true, spacing: "None", isSubtle: true }
                            ]
                          }
                        ]
                      },
                      {
                        type: "TextBlock",
                        text: "Agent details",
                        weight: "Bolder",
                        size: "Small",
                        spacing: "Small",
                        separator: true
                      },
                      {
                        type: "ColumnSet",
                        spacing: "None",
                        columns: [
                          {
                            type: "Column",
                            width: "90px",
                            items: [
                              { type: "TextBlock", text: "Name", weight: "Bolder", size: "Small", wrap: true, spacing: "None" }
                            ]
                          },
                          {
                            type: "Column",
                            width: "stretch",
                            items: [
                              { type: "TextBlock", text: Text(System.Bot.Name), size: "Small", wrap: true, spacing: "None", isSubtle: true }
                            ]
                          }
                        ]
                      },
                      {
                        type: "ColumnSet",
                        spacing: "None",
                        columns: [
                          {
                            type: "Column",
                            width: "90px",
                            items: [
                              { type: "TextBlock", text: "Agent ID", weight: "Bolder", size: "Small", wrap: true, spacing: "None" }
                            ]
                          },
                          {
                            type: "Column",
                            width: "stretch",
                            items: [
                              { type: "TextBlock", text: Text(System.Bot.Id), size: "Small", wrap: true, spacing: "None", isSubtle: true }
                            ]
                          }
                        ]
                      },
                      {
                        type: "ColumnSet",
                        spacing: "None",
                        columns: [
                          {
                            type: "Column",
                            width: "90px",
                            items: [
                              { type: "TextBlock", text: "Schema name", weight: "Bolder", size: "Small", wrap: true, spacing: "None" }
                            ]
                          },
                          {
                            type: "Column",
                            width: "stretch",
                            items: [
                              { type: "TextBlock", text: Text(System.Bot.SchemaName), size: "Small", wrap: true, spacing: "None", isSubtle: true }
                            ]
                          }
                        ]
                      },
                      {
                        type: "TextBlock",
                        text: "User details",
                        weight: "Bolder",
                        size: "Small",
                        spacing: "Small",
                        separator: true
                      },
                      {
                        type: "ColumnSet",
                        spacing: "None",
                        columns: [
                          {
                            type: "Column",
                            width: "90px",
                            items: [
                              { type: "TextBlock", text: "Language", weight: "Bolder", size: "Small", wrap: true, spacing: "None" }
                            ]
                          },
                          {
                            type: "Column",
                            width: "stretch",
                            items: [
                              { type: "TextBlock", text: Text(System.User.Language), size: "Small", wrap: true, spacing: "None", isSubtle: true }
                            ]
                          }
                        ]
                      },
                      {
                        type: "ColumnSet",
                        spacing: "None",
                        columns: [
                          {
                            type: "Column",
                            width: "90px",
                            items: [
                              { type: "TextBlock", text: "Object ID", weight: "Bolder", size: "Small", wrap: true, spacing: "None" }
                            ]
                          },
                          {
                            type: "Column",
                            width: "stretch",
                            items: [
                              { type: "TextBlock", text: Text(System.User.Id), size: "Small", wrap: true, spacing: "None", isSubtle: true }
                            ]
                          }
                        ]
                      },
                      {
                        type: "TextBlock",
                        text: "Conversation details",
                        weight: "Bolder",
                        size: "Small",
                        spacing: "Small",
                        separator: true
                      },
                      {
                        type: "ColumnSet",
                        spacing: "None",
                        columns: [
                          {
                            type: "Column",
                            width: "90px",
                            items: [
                              { type: "TextBlock", text: "Channel", weight: "Bolder", size: "Small", wrap: true, spacing: "None" }
                            ]
                          },
                          {
                            type: "Column",
                            width: "stretch",
                            items: [
                              { type: "TextBlock", text: Text(System.Activity.ChannelId), size: "Small", wrap: true, spacing: "None", isSubtle: true }
                            ]
                          }
                        ]
                      },
                      {
                        type: "ColumnSet",
                        spacing: "None",
                        columns: [
                          {
                            type: "Column",
                            width: "90px",
                            items: [
                              { type: "TextBlock", text: "Conversation ID", weight: "Bolder", size: "Small", wrap: true, spacing: "None" }
                            ]
                          },
                          {
                            type: "Column",
                            width: "stretch",
                            items: [
                              { type: "TextBlock", text: Text(System.Conversation.Id), size: "Small", wrap: true, spacing: "None", isSubtle: true }
                            ]
                          }
                        ]
                      },
                      {
                        type: "ColumnSet",
                        spacing: "None",
                        columns: [
                          {
                            type: "Column",
                            width: "90px",
                            items: [
                              { type: "TextBlock", text: "Time (UTC)", weight: "Bolder", size: "Small", wrap: true, spacing: "None" }
                            ]
                          },
                          {
                            type: "Column",
                            width: "stretch",
                            items: [
                              {
                                type: "TextBlock",
                                text: Text(Now(), DateTimeFormat.UTC),
                                size: "Small",
                                wrap: true,
                                spacing: "None",
                                isSubtle: true
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
    - kind: LogCustomTelemetryEvent
      id: 9KwEAn
      eventName: OnErrorLog
      properties: "={ErrorMessage: System.Error.Message, ErrorCode: System.Error.Code, TimeUTC: Text(Now(), DateTimeFormat.UTC), ConversationId: System.Conversation.Id}"
    - kind: CancelAllDialogs
      id: NW7NyY
```

</details>

**Advanced options**를 펼치면 관리자가 조사할 수 있도록 문제 해결 명령과 진단 세부 정보가 나와요.

---

## 추천 프롬프트 구성하기

에이전트 수준에서 구성된 [추천 프롬프트(Suggested prompts)](https://learn.microsoft.com/en-us/microsoft-copilot-studio/configure-starter-prompts)는 Teams와 Microsoft 365 Copilot 모두에서 동작해요.

**설정(Settings) → 생성형 AI(Generative AI) → 추천 프롬프트(Suggested prompts)**에서 구성하면 채널 전반에서 일관된 탐색성을 얻을 수 있어요.

---

## 결과

이제 다음을 커버하는 여덟 가지 프로덕션 패턴을 갖췄어요.
- 사용자를 낙동강 오리알로 만들지 않는 재설치 처리
- 자동으로 지워지는 오래된 컨텍스트
- 컨텍스트가 리셋되는 시점을 아는 사용자
- 어디서나(M365 Copilot 포함) 동작하는 컨텍스트 변수
- 실제로 모든 걸 리셋하는 "Start Over"
- 진단 정보를 갖춘 셀프서비스 문제 해결
- 막다른 골목 대신 도구를 주는 오류 처리
- 처음부터 사용자를 안내하는 추천 프롬프트

이 패턴들은 사용자가 예상치 못한 행동을 하고 대화가 누구의 계획보다도 오래 지속되는, 실제 프로덕션 배포의 혼돈을 다뤄요.

에이전트가 준비됐다면, 환경 기반 배포 전략, 매니페스트 커스터마이징, 설정 정책(Setup Policies)을 통한 자동 설치와 고정을 다룬 [DEV에서 PROD로: Copilot Studio 에이전트의 자동 설치와 고정](https://microsoft.github.io/mcscatblog/posts/copilot-studio-teams-deployment/)을 확인하세요.

진단 정보 이야기가 나온 김에, 패턴 6과 패턴 7에서 표시되는 대화 ID는 지원 팀에 딱 필요한 정보예요. [에이전트와 채팅할 때 대화 ID를 얻는 방법](https://microsoft.github.io/mcscatblog/posts/conversationid-users/)은 최종 사용자가 어떤 채널에서든 그 ID를 확인하는 과정을 안내하니, 진단 카드를 셀프서비스 가이드와 짝지을 수 있어요. 더 깊은 조사가 필요하면 [후드 열기: Copilot Studio 에이전트가 실제로 하는 일](https://microsoft.github.io/mcscatblog/posts/open-the-hood-copilot-studio-transcripts/)에서 Dataverse에서 직접 대화 기록을 읽는 방법을 다뤄요. 대화 ID를 손에 넣은 뒤의 다음 단계예요.

## 관련 리소스

- [시스템 트리거](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-triggers)
- [시스템 토픽](https://learn.microsoft.com/microsoft-copilot-studio/authoring-system-topics)
- [변수와 범위](https://learn.microsoft.com/microsoft-copilot-studio/authoring-variables)
- [Copilot Studio용 어댑티브 카드](https://learn.microsoft.com/en-us/microsoft-copilot-studio/adaptive-cards-overview)
- [Power Fx 함수](https://learn.microsoft.com/en-us/power-platform/power-fx/formula-reference-copilot-studio)

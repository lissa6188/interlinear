---
title: 'AI 에이전트의 과잉 요약 물리치기: 지식 소스의 원문을 그대로 전달하는 방법'
description: 'AI 에이전트가 지식 소스를 요약하다 원문을 바꾸는 문제를 막고, Copilot Studio에서 커스텀 검색·지시문·AI 프롬프트로 원문 그대로 답변받는 세 가지 방법을 소개해요.'
date: 2026-09-08
tags: ["Copilot Studio", "RAG", "AI 에이전트", "지식 소스", "과잉 요약"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/verbatim-knowledge-passthrough/card-01.png
  - /cards/verbatim-knowledge-passthrough/card-02.png
  - /cards/verbatim-knowledge-passthrough/card-03.png
  - /cards/verbatim-knowledge-passthrough/card-04.png
  - /cards/verbatim-knowledge-passthrough/card-05.png
  - /cards/verbatim-knowledge-passthrough/card-06.png
  - /cards/verbatim-knowledge-passthrough/card-07.png
---

> **원문:** [Defeating Oversummarization in AI Agents: How to Deliver Exact Content from Knowledge Sources](https://microsoft.github.io/mcscatblog/posts/copilot-studio-defeating-oversummarization/)
> **게시일:** 2026-01-23 · **저자:** Doug Bellingeri

GenAI 에이전트는 복잡한 정보를 단순화하는 데 뛰어나지만, 때로는 지나치게 단순화해요! 고객에게 제공되는 보험 혜택 세부 정보나 직원 대상 HR 정책처럼, 요약이 신중하게 검토되고 법적으로 승인된 콘텐츠를 훼손할 수 있는 상황이 많아요. 사용자가 정확하고 변경되지 않은 정보를 필요로 할 때, 가장 원치 않는 일은 AI 시스템이 원본 자료를 다시 쓰거나 압축해 버리는 거예요.

다행히 Copilot Studio는 지식 소스에서 정확한 발췌문을 그대로 반환하는 방법을 제공해서, 사용자가 원래 승인된 형태 그대로 정확하고 축약되지 않은 정보를 받을 수 있게 해줘요.

에이전트 지식에서 요약되지 않은 정확한 발췌문을 얻는 방법을 살펴보기 전에, 먼저 Copilot Studio 안에서 RAG<sup>1</sup>가 어떻게 동작하는지부터 알아볼게요.

_Copilot Studio의 RAG 파이프라인_

정보 검색(Information Retrieval) 단계(3단계)에서는 사용자의 최적화된 쿼리로 에이전트가 쓸 수 있는 지식(Knowledge)에서 일치하는 정보를 찾아요. 이 정보는 요약(Summarization) 단계(4단계)에서 처리돼서, 여러 지식 소스에 걸친 정보를 사용자의 쿼리에 대한 간결하고 읽기 쉬운 답변으로 합쳐요. 여기에는 응답 형식, 어조, 이모지 등에 관한 지시문을 포함해 응답이 에이전트 지시문을 지키도록 하는 과정도 들어가요.

Copilot Studio의 RAG 패턴에서 요약 단계(4단계)를 그냥 없앨 수는 없어요. 그래서 [Adi Leibowitz](https://microsoft.github.io/mcscatblog/authors/#adilei) 님이 친절하게 공유해 주신 특정 지시문·프롬프트 문구를 활용해, Copilot Studio 지식에서 원문 그대로의(verbatim) 세부 내용을 얻는 세 가지 방법을 소개할게요.

## 과잉 요약을 물리치는 세 가지 방법

1. 토픽 안에서 지식에 대한 커스텀 검색(Custom Search)과 AI 프롬프트 사용하기
2. 순수하게 에이전트 지시문만 사용하기
3. 에이전트 지시문 + AI 프롬프트 사용하기

세 방법 모두 생성형 모드(Generative Mode)를 쓰고, 에이전트 모델로 Claude Sonnet 4.5를 쓰며, 웹 검색과 일반 지식은 꺼져 있어요. 세 에이전트 모두 SharePoint의 동일한 세 가지 복리후생 정책 지식 소스를, 비정형 데이터(Dataverse Sync) SharePoint Knowledge 방식으로 로드했어요.

## 방법 1: 토픽 안에서 커스텀 검색과 AI 프롬프트 사용하기

이 방법은 세 단계 흐름을 따라요.

1. 커스텀 검색(Perform a Custom Search)으로 지식을 검색해요.
2. 대화 컨텍스트를 반영해 사용자의 쿼리를 다시 작성해요(Generate a Search Query).
3. 그 결과를 AI 프롬프트에 전달해 검색 결과를 처리하고, 요약되지 않은 응답을 돌려줘요.

AI 프롬프트에 전달하는 입력은 최종 사용자의 질문을 컨텍스트에 맞게 인식한 쿼리와, 커스텀 검색에서 반환된 세부 내용이에요.

### 에이전트 설정

_토픽 내 프롬프트 접근 방식 개요_

이 방법을 구축하는 첫 단계는 커스텀 토픽을 만드는 거예요. 트리거는 그대로 두고, 에이전트가 언제 이 토픽을 호출해야 하는지 이해하도록 돕는 명확한 설명을 추가했어요. 에이전트 지시문에서 토픽을 직접 호출하고 있더라도 이 설명은 여전히 유용해요.

다음으로, Activity.Text 변수를 "커스텀 검색 수행(Perform a Custom Search)" 액션 노드에 전달해 특정 지식 소스를 검색해요. 커스텀 검색은 지식 검색을 하기 전에 대화 컨텍스트를 자동으로 더해줘요. 자세한 내용은 [커스텀 검색 설명서](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-custom-search)를 참조하세요.

_커스텀 검색 토픽 설정하기_

_커스텀 검색 속성 구성하기_

그다음, 커스텀 검색 출력(원시 지식 검색 결과가 담겨 있어요)을 가져와 "변수 값 설정(Set variable value)" 노드로 텍스트 출력을 테이블로 바꿔요. 이렇게 하면 AI 프롬프트에 필요한 구조화된 입력이 만들어져요.

대화 기록의 정보를 AI 프롬프트로 보내는 쿼리에 반영하고 싶어서, "검색 쿼리 생성(Generate a Search Query)" 노드를 쓸게요. 이건 토픽 전용 도구로, 관련 대화 컨텍스트를 반영해 사용자의 쿼리를 더 구체적으로 다시 써줘요.

예를 들어 사용자가 에이전트와 육아 휴직에 대해 이야기하다가 "휴직 대상자는 누구인가요?"라고 후속 질문을 하면, Generate a Search Query 노드는 RAG 패턴으로 전송되기 전에 쿼리에 "육아(parental)"를 포함하도록 다시 써요. 에이전트에는 이전 대화 컨텍스트가 있으니 사용자가 어떤 종류의 휴직을 의미하는지 추론할 수 있어요. 그 컨텍스트가 없으면 에이전트는 여러 종류의 휴직에 대한 정보로 응답할 수 있고, 그러면 관련성이 떨어질 수 있어요.

참고로 커스텀 검색 노드는 Activity.Text를 전달하면 대화 컨텍스트를 자동으로 반영하지만, AI 프롬프트는 자체적으로 대화를 인식하지 못해요. 그래서 Generate a Search Query 노드로 컨텍스트가 보강된 쿼리를 만들어 AI 프롬프트에 전달하는 거예요. AI 프롬프트에 대화 컨텍스트가 필요 없다면 Activity.Text를 직접 전달해도 돼요.

_Generate a Search Query 노드 추가하기_

자세한 내용은 [Generate a Search Query 설명서](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-search-query)를 참조하세요.

이 두 단계를 마치면 AI 프롬프트에 전달할 입력 두 가지가 준비돼요.

_검색 결과를 처리하도록 구성된 AI 프롬프트_

AI 프롬프트는 "Generate a Search Query" 노드의 출력을 사용자 쿼리로, 커스텀 지식 검색 결과의 텍스트 버전을 또 다른 입력으로 쓰도록 구성해요. LLM에게 요약하지 말라고 지시하고, 커스텀 검색 출력의 정확한 내용을 Markdown 블록으로 포함하라고 지시하는 프롬프트 지시문이 원하는 동작을 얻는 데 결정적이에요.

**AI 프롬프트 지시문:**

```
respond to the user's [query] based on [search results], make sure to quote search results verbatim, don't summarize or omit. When quoting from search results, clearly indicate quoted text using a markdown code block

#user query:
##search results:
#Do not include too much surrounding text outside of where the answer was found in the original text. Include citations with links to the knowledge source where the information was found and call out the page and section the user should look to find the details. Do not summarize anything in your response.
```

완성된 토픽 흐름은 아래 이미지와 같아요. 토픽의 마지막 노드는 AI 프롬프트의 출력 변수를 써서 사용자에게 직접 메시지를 보내요. 오케스트레이터가 아무것도 요약하지 못하게 한 채로요.

_완성된 토픽 흐름_

아래 YAML 코드로 여러분의 환경에서 토픽을 재현할 수 있어요. 지식 소스, 변수, AI 프롬프트 등은 각자 환경에 맞게 업데이트해야 해요.

```yaml
kind: AdaptiveDialog
modelDescription: Use this topic to respond to policy related questions.
beginDialog:
  kind: OnRecognizedIntent
  id: main
  intent: {}
  actions:
    - kind: SearchKnowledgeSources
      id: searchKnowledgeSources_6OjHDa
      fileSearchDataSource:
        searchFilesMode:
          kind: DoNotSearchFiles

      knowledgeSources:
        kind: SearchSpecificKnowledgeSources
        knowledgeSources:
          - copilots_header_catdab_CustomSummarization.topic.HR_Leave_Policiesdocx_BC5vo6ZvRpToLvp39eERs
          - copilots_header_catdab_CustomSummarization.topic.ContosoBenefitsdocx_B2trrvYgmHXRy33bvECmH
          - copilots_header_catdab_CustomSummarization.topic.ContosoHRpoliciesdocx_bnliFX_ntlqYReELDdHO_

      result: Topic.searchResults
      userInput: =System.Activity.Text

    - kind: SetTextVariable
      id: myNode
      variable: Topic.txtSearchResults
      value: "{Topic.searchResults}"

    - kind: CreateSearchQuery
      id: createSearchQuery_yPikXR
      userInput: =System.Activity.Text
      result: Topic.SearchQuery

    - kind: InvokeAIBuilderModelAction
      id: invokeAIBuilderModelAction_Q0KiHA
      input:
        binding:
          query: =Topic.SearchQuery.SearchQuery
          search_20results: =Topic.txtSearchResults

      output:
        binding:
          predictionOutput: Topic.PromptOutput

      aIModelId: c8e2722a-9720-4820-8c34-56b99367b309

    - kind: SendActivity
      id: sendActivity_hE5Ik6
      activity: "{Topic.PromptOutput.text}"

inputType: {}
outputType: {}
```

### 결과

성공이에요! 에이전트가 요약 없이 지식 소스의 정확한 문구를 일관되게 뽑아내요. 정보가 문서의 어느 위치에 나오는지도 짚어주고, 기대했던 인용 링크도 포함해요.

_원문 콘텐츠 추출을 보여주는 테스트 결과_

## 방법 2: 지시문만 사용하기

이 방법은 Copilot Studio의 [생성형 오케스트레이션(Generative Orchestration)](https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/generative-orchestration) 기능에 의존해서, 요약 없이 원문 콘텐츠를 반환해요. 이 방법에 필요한 설정은 딱 두 가지예요. 지식 소스를 추가하고, 방법 1의 핵심 프롬프트 지시문을 전체 에이전트 지시문으로 추가하는 거예요.

### 에이전트 설정

_커스텀 토픽 없이 에이전트 지시문만 사용_

### 결과

성공이에요! (대체로요.) 이 방법은 다른 두 방법보다 일관성이 떨어졌고, 에이전트 모델 설정에 따라 결과가 달라질 수 있어요. 아래처럼 아주 좋은 결과도 있었지만, 요청받은 대로 대부분 수행하면서도 지식의 원문 아래에 육아 휴직 정책 요약을 함께 넣어버린 경우도 있었어요.

_지시문만 사용한 테스트 결과_

## 방법 3: 지시문과 AI 프롬프트 도구 함께 사용하기

이 방법은 앞의 두 방법을 결합한 거예요. 지시문과 AI 프롬프트를 함께 쓰되(토픽 없이) 같은 목표를 이뤄요. 에이전트 지시문에서 AI 프롬프트의 입력으로 무엇을 쓸지 에이전트에게 알려줘요.

### 에이전트 설정

_지시문에서 호출되도록 AI 프롬프트 구성하기_

AI 프롬프트 자체는 방법 1과 같아요. 다만 이번에는 오케스트레이터가 도구로 직접 호출하기 때문에, 완료(Completion)/실행 후(After running) 설정에서 AI 프롬프트가 끝나면 사용자에게 특정 메시지를 보내도록 구성했어요. 이건 오케스트레이터가 아무것도 요약하지 못하게 하고 AI 프롬프트의 출력을 사용자에게 그대로 보내는, 토픽의 마지막 단계와 본질적으로 같아요.

_AI 프롬프트 구성_

### 결과

또 성공이에요! 에이전트가 요약 없이 지식 소스의 정확한 문구를 일관되게 뽑아내요. 정보가 문서의 어느 위치에 나오는지도 짚어주고, 기대했던 인용 링크도 포함해요.

_일관된 원문 콘텐츠 추출을 보여주는 테스트 결과_

## 어떤 방법이 가장 좋을까요?

"가장 좋다"의 정의는 무엇을 가장 중요하게 여기는지에 달려 있어요. 저에게는 답변 품질과 일관성이 기준이에요.

- **최고의 일관성과 세밀한 제어가 필요하다면 → 방법 1**이 가장 일관적이었어요. 설정이 가장 복잡한 방법이지만, 커스텀 검색 패턴, 쿼리 생성, AI 프롬프트를 완전히 제어할 수 있어요. 더 복잡한 에이전트 안에서 특히 빛을 발해요.
- **방법 2**는 이 테스트 케이스가 지시문의 유일한 내용이었는데도 다소 일관성이 부족했어요. 지시문이 더 늘어나면 일관성이 더 떨어질 수 있어요.
- **방법 3**은 방법 1과 비슷한 품질과 일관성을 보였지만, 지금은 지시문에서 변수를 설정할 수 없어서 프롬프트 입력을 무엇으로 쓸지 오케스트레이터에게 알려주는 방식에 의존해야 해요. 제한된 테스트에서는 잘 동작했지만 일관성 문제가 생길 여지가 있어 보이고, 방법 1에 비해 쿼리와 검색 출력에 대한 세밀한 제어도 부족해요.

응답과 지시문 준수 정도는 모델에 따라 달라지므로, 다른 모델을 쓰면 다른 결과를 경험할 수 있어요. 또한 무엇이 최선인지 판단할 때는 응답 속도와 에이전트 비용도 함께 고려해야 해요.

여러분도 에이전트에서 과잉 요약을 물리쳐야 하는 비슷한 요구를 겪어 보셨나요? 어떤 접근 방식이 효과적이었나요?

---

## 어휘 주석

1. **RAG(Retrieval-Augmented Generation):** 모델이 답을 생성하기 전에 외부 지식 소스에서 관련 정보를 먼저 검색해 오고, 그 검색 결과를 바탕으로 응답을 만드는 방식.

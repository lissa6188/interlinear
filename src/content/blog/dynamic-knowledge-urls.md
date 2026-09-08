---
title: '노이즈는 제로, 관련성은 최대: Copilot Studio의 동적 지식 URL'
description: 'Copilot Studio의 동적 지식 URL 변수 기능으로 지역, 제품, 환경별 지식 원본을 자동으로 좁히고, SharePoint 지식 원본까지 지원하는 방법을 정리해요.'
date: 2026-09-08
tags: ["Copilot Studio", "동적 지식 URL", "SharePoint", "지식 관리"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/dynamic-knowledge-urls/card-01.png
  - /cards/dynamic-knowledge-urls/card-02.png
  - /cards/dynamic-knowledge-urls/card-03.png
  - /cards/dynamic-knowledge-urls/card-04.png
  - /cards/dynamic-knowledge-urls/card-05.png
  - /cards/dynamic-knowledge-urls/card-06.png
  - /cards/dynamic-knowledge-urls/card-07.png
  - /cards/dynamic-knowledge-urls/card-08.png
---

> **원문:** [Zero Noise, Maximum Relevance: Dynamic Knowledge URLs in Copilot Studio](https://microsoft.github.io/mcscatblog/posts/dynamic-knowledge-urls-copilot-studio/)
> **게시일:** 2026-02-11 · **저자:** Doug Bellingeri

Microsoft가 작지만 강력한 개선 사항을 방금 선보였어요. 지식(Knowledge) 웹사이트나 SharePoint 사이트의 URL을 변수로 매개변수화할 수 있게 된 거예요. 이제 하나의 지식 원본이 사용자가 누구인지, 대화 주제가 무엇인지, 에이전트가 실행 중인 환경이 어디인지에 따라 자동으로 바뀔 수 있어요.

이 기능은 고객들이 꾸준히 요청해 온 것으로, 여러 개의 지식 원본을 따로 관리하는 부담 없이 지식 접근을 맞춤화할 수 있게 해 줘요.

## 이 기능이 해결하는 문제

이 기능이 나오기 전에는:

- 지역이나 언어에 따라 다른 지식 원본을 원하면, 별도의 지식 원본을 각각 추가해야 했어요:
  - microsoft.com/en-us
  - microsoft.com/it-it
  - microsoft.com/ja-jp
- 제품 라인별로 다르게 하고 싶으면, 더 많은 원본이 필요했어요:
  - https://support.microsoft.com/en-us/surface
  - https://support.microsoft.com/en-us/microsoft-copilot
  - https://support.microsoft.com/en-us/outlook
- 환경(Dev-Test-Stage-Prod)별로 다른 버전의 지식 원본을 원하면, 배포 후에 사이트의 올바른 버전을 가리키도록 수정해야 했어요.

그 결과 다음과 같은 문제가 생겼어요.

- 비대해진 지식 구성
- 과도하게 넓은 그라운딩 범위 — 단지 같은 도메인 루트 아래에 있다는 이유만으로 에이전트가 불필요한 페이지를 가져옴
- 복잡한 ALM<sup>1</sup> — URL에 묶인 수많은 원본을 Dev → Test → Prod로 옮기고, 대상 환경에서 URL을 일일이 수정해야 하는 것으로, 바람직한 관행이 아니에요
- 지연 시간 문제 — 관련 없는 원본을 너무 많이 검색하면 모든 것이 느려짐

## 돌파구: 지식의 URL 변수

이제 Copilot Studio에서는 지식 원본에 변수를 포함하도록 정의할 수 있어요. 이를 통해 지식 사이트를 특정 경로로 범위를 좁히거나, 런타임에 URL 전체를 변수로 대체할 수 있어요.

## 내부 동작 방식

1. **변수를 정의해요.** 변수는 다음과 같은 방법으로 설정할 수 있어요.
   - 토픽 입력 / 사용자에게 질문 / 다중 선택 옵션
   - 사용자 프로필 / 언어 감지
   - Agent Flows나 커넥터 같은 도구
   - [환경 변수](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/environmentvariables)
2. **공개 웹사이트 링크에 변수를 삽입해요.** 변수를 하위 경로로 사용해 URL의 범위를 좁히거나(www.site.com/{variable}), 지식 URL 전체를 변수로 대체할 수 있어요({variable}).

이를 위해 지식 추가(Add knowledge)로 이동하여 공개 웹사이트(Public Websites) 또는 SharePoint(Work IQ 기반)를 선택한 다음, Public Website/SharePoint 링크 필드에서 {x}를 클릭해 변수를 추가해요.

3. **사용자가 에이전트에게 질문을 하고** 지식이 호출되면, 에이전트는 런타임에 변수를 사용해 지식 원본을 결정해요.

4. **변수가 변경되거나 대화가 초기화될 때까지** 그라운딩은 해당 범위의 URL 안에 머물러요.

## 알아 두어야 할 제한 사항

1. **공개 웹사이트 지식의 "2단계 하위 수준" 제한은 여전히 존재해요.**

   공개 사이트 지식은 Bing의 인덱스를 사용해요. Bing은 2단계 깊이까지만 인덱싱을 보장해요. 변수를 통한 지식 범위 지정은 어떤 URL을 대상으로 할지를 바꾸는 것이지, Bing이 크롤링하는 깊이를 바꾸는 것이 아니에요.

2. ~~**이 기능은 현재 공개 웹사이트에서만 사용할 수 있어요.** SharePoint 지식에서 동일한 기능을 제공하는 것은 제품 로드맵에 있어요.~~

   2026년 3월 10일부터 이 기능은 Work IQ 기반 커넥터(Connector Powered by Work IQ) SharePoint 지식 방식을 사용하는 SharePoint 지식 원본에서도 사용할 수 있어요. SharePoint 지식의 파일 업로드 / Dataverse 동기화 방식은 변수를 지원하지 않아요.

   ![SharePoint 지식 변수](https://microsoft.github.io/mcscatblog/assets/posts/dynamic-knowledge-urls/SPOknowledgevariable.png)

## 실제 예제: Microsoft.com의 제품별 범위 지정

이 예제에서는 공개 웹사이트 지식 변수를 사용하여, 사용자가 질문하는 제품에 따라 Microsoft.com/en-us 웹사이트의 범위를 지정해 볼게요.

이를 위해 먼저 지식 범위 지정에 사용할 전역(Global) 변수를 만들고 설정해야 해요.

아래 튜토리얼에서는 이 변수를 토픽으로 관리해요. 지식에 사용할 변수는 여러 방법으로 설정할 수 있다는 점을 기억하세요. 핵심은 전역으로 설정된 문자열 타입 변수를 사용하는 거예요.

그다음 토픽 안에서 훌륭하지만 상대적으로 덜 알려진 몇 가지 기능을 활용해 GlobalProductURL 변수를 설정할게요. 순서는 이래요.

- 먼저 토픽 입력(Topic Inputs)으로 사용자의 질의에서 Microsoft 제품 이름을 추출해요.
- 그런데 웹사이트에서 제품 페이지의 URL 경로가 항상 친숙한 이름은 아니에요(예: Copilot은 /microsoft-365-copilot 경로에 있음). 그래서 토픽 입력 변수로는 사용자가 말한 "친숙한" 제품 이름만 캡처해요.
- 그 친숙한 이름에 해당하는 올바른 URL 경로를 찾기 위해, 친숙한 제품 이름과 URL 경로 간의 매핑을 담은 테이블 변수를 정의하고 여기서 값을 조회해 GlobalProductURL 변수를 설정해요.

1. 토픽 만들기

   에이전트가 이 토픽을 어떻게 사용해야 하는지 잘 설명하는 설명(description)을 반드시 추가하세요.

   ![Product Identifier 토픽 구성](https://microsoft.github.io/mcscatblog/assets/posts/dynamic-knowledge-urls/product-identifier-topicsetup.png)
   _제품 선택을 캡처하기 위한 토픽 구성_

2. 토픽 입력 구성하기

   토픽 입력은 사용자에게 따로 묻지 않고도 발화나 질의에서 세부 정보를 추출하는 훌륭한 방법이에요. 기본 제공되는 여러 엔터티<sup>2</sup>를 자동으로 식별하거나, 직접 엔터티를 정의하거나, 설명과 예시에 의존해 사용자 입력에서 세부 정보를 뽑아낼 수 있어요. 여기서는 Microsoft 제품에 대한 언급을 식별하려는 것이므로, 에이전트가 이 입력을 채우는 방식으로 "Dynamically fill with best option" 설정을 사용해요. 토픽 입력이 채워져야만 토픽이 다음 단계로 진행되며, 사용자가 메시지에서 제품을 언급하지 않으면 에이전트가 자동으로 어떤 제품에 관심이 있는지 물어봐요.

   이렇게 하면 불필요한 왕복 대화가 줄고 상호작용이 훨씬 자연스러워져요. 저는 "X에 문제가 있어요"라고 말했는데 에이전트가 "안녕하세요, 질문, 주문, 문제 관련 도움을 드릴 수 있어요. 무엇을 도와드릴까요?"라고 답하는 식의 상호작용을 보면 바로 흥미를 잃어요. 여기서는 사용자가 메시지에서 제품을 언급하지 않았을 때만 에이전트가 어떤 제품 정보를 원하는지 물어봐요.

   ![Product Identifier 입력 변수 구성](https://microsoft.github.io/mcscatblog/assets/posts/dynamic-knowledge-urls/product-identifier-inputvar.png)
   _제품 이름을 캡처하기 위한 토픽 입력 구성_

3. 제품 매핑 테이블 구성하기

   토픽 트리거 뒤에 변수 값 설정(Set Variable Value) 노드를 추가해요. ProductTable이라는 새 변수를 만들어요. To Value 상자에서 PowerFX<sup>3</sup> 편집기를 열고 매핑 테이블을 정의해요. 이 예제에서는 product와 path 열을 사용하는데, product는 제품의 친숙한 이름이고 path는 지식 원본 URL의 범위를 지정하는 데 사용할 URL 경로예요.

   제가 사용한 테이블의 PowerFX는 다음과 같아요.

   ```javascript
   Table(
       { product: "Copilot",    Path: "microsoft-365-copilot" },
       { product: "Excel",      Path: "microsoft-365" },
       { product: "PowerPoint", Path: "microsoft-365" },
       { product: "Word",       Path: "microsoft-365" },
       { product: "Teams",      Path: "microsoft-teams" },
       { product: "Surface",    Path: "surface" }
   )
   ```

   ![제품-경로 테이블 매핑](https://microsoft.github.io/mcscatblog/assets/posts/dynamic-knowledge-urls/product-path-mapping-table.png)
   _PowerFX로 제품-경로 매핑 정의하기_

4. 토픽 입력에서 식별된 제품을 기반으로 일치하는 경로 조회하기

   변수 값 설정 노드를 하나 더 추가하고 GlobalProductURL이라는 새 변수를 만들어요. 문자열 타입으로 설정하고 사용 범위 설정을 전역(Global)으로 지정해요. 이렇게 하면 토픽 범위 밖에서도 변수를 사용할 수 있어요. To value에서 PowerFX 편집기를 열고, 다음 PowerFX 함수를 사용해 제품 입력 변수 "Topic.Product"의 값을 기준으로 테이블을 조회해요.

   ```javascript
   LookUp(Topic.ProductTable, product = Topic.Product, Path)
   ```

   ![제품-경로 조회](https://microsoft.github.io/mcscatblog/assets/posts/dynamic-knowledge-urls/product-path-lookup.png)
   _PowerFX로 제품 기반 URL 경로 조회하기_

   구성이 완료되면 전체 토픽은 다음과 같은 모습이 돼요.

   ![Product Identifier 토픽](https://microsoft.github.io/mcscatblog/assets/posts/dynamic-knowledge-urls/product-identifier-topic.png)
   _구성이 완료된 Product Identifier 토픽의 전체 모습_

5. GlobalProductURL 변수를 사용하도록 웹사이트 지식 원본 구성하기

   이 토픽을 구성하고 GlobalProductURL 변수를 만들었다면, 이제 지식 원본을 만들어야 해요. 지식(Knowledge)에서 공개 웹사이트를 선택하고, 지식 URL을 입력한 다음 "{X}"를 클릭해 토픽에서 만든 GlobalProductURL 변수를 추가해요.

   ![변수를 사용한 지식 원본 만들기](https://microsoft.github.io/mcscatblog/assets/posts/dynamic-knowledge-urls/knowledge-source-setup.png)
   _변수와 함께 지식 원본 설정하기_

이것으로 끝이에요! 토픽 기반의 멋진 트릭 몇 가지를 활용해 지식 범위를 동적으로 지정하는 방법을 갖추게 되었어요.

*참고: 시연을 위해 "A plan completes" 트리거를 사용하는 토픽을 하나 더 추가했어요. 이 토픽은 에이전트의 응답 후에 GlobalProductURL 변수의 내용을 담은 메시지를 보내요. 지식 URL이 어떤 범위로 지정되었는지 보여 주므로, 모든 것이 올바르게 동작하는지 확인할 수 있어요.*

### 결과

첫 번째 예제에서는 Copilot의 WorkIQ에 대해 질문해요. 'A plan completes' 토픽이 에이전트가 지식 URL의 범위를 지정하는 데 사용한 값을 출력해요. 에이전트가 반환한 두 개의 인용 모두 www.microsoft.com/en-us/microsoft-365-copilot 으로 적절히 범위가 지정되었어요.

_Copilot 범위의 지식으로 응답하는 에이전트_

다음 예제에서는 제품 이름을 언급하지 않고 질문해요. 에이전트는 어떤 제품을 말하는지 파악하기 위해 스스로 질문을 생성해요. 제 응답으로 토픽 입력이 채워지면, 그에 따라 범위가 지정된 지식을 쿼리해요.

_Teams 범위의 지식으로 응답하는 에이전트_

## 사용 사례 2: 국가 또는 지역 필터링

글로벌 조직에서는 지역별 페이지를 통해 사용자에게 지역 특화 정보를 제공해요.

- 가격 페이지
- 제품 가용성
- 지역별로 다른 규제 관련 콘텐츠

런타임에 Copilot Studio는 사용자의 브라우저 설정을 사용해 User.Language 변수를 채워요. 첫 번째 예제에서 했던 것과 비슷하게, 대화 시작(Conversation Start) 토픽을 사용해 사용자 언어와 지식 URL 변수 간의 매핑을 만들 수 있어요. 이렇게 하면 Copilot Studio의 사용자 언어 설정을 지역/언어별 URL에 매핑하고, 그에 따라 에이전트의 지식 범위를 지정해요. Microsoft 웹사이트를 예로 들면 다음과 같아요.

- 미국 영어 사용자 --> User.Language = US English, 지식 변수 = en-us
- 이탈리아어 사용자 --> User.Language = Italian, 지식 변수 = it-it

## 사용 사례 3: 환경 기반 변수 설정

개발 목적으로 사용하는 비프로덕션 버전의 웹사이트 지식이 있을 수 있어요. 이 기능을 사용하면 환경 변수로 사용할 URL을 설정할 수 있어요.

이를 위해 먼저 환경 변수를 만들어야 해요. 환경 변수는 Copilot Studio의 솔루션(Solutions) 영역에서 만들 수 있어요.

1. Copilot Studio의 왼쪽 탐색 메뉴에서 줄임표(...)를 클릭해요
2. 솔루션(Solutions)을 선택해요

   ![솔루션 메뉴](https://microsoft.github.io/mcscatblog/assets/posts/dynamic-knowledge-urls/solutions-menu.png)
   _Copilot Studio에서 솔루션에 접근하기_

3. 에이전트가 속한 솔루션을 열어요. 에이전트에는 기본(default) 솔루션 사용을 가급적 피해 주세요.
4. 솔루션 개체 선택기에서 환경 변수 개체를 열어요. 여기서 솔루션에 연결된 모든 환경 변수를 볼 수 있어요.
5. 새로 추가하려면 새로 만들기(New)를 선택한 다음 환경 변수(Environment Variable)를 선택해요.

_새 환경 변수 만들기_

6. 새 환경 변수 플라이아웃에서 여러분의 웹사이트에 맞게 구성해요. 데이터 형식은 텍스트(Text)를 사용해요. 저는 대체값(fallback)으로 기본값을 Microsoft 미국 웹사이트로 설정했어요. 솔루션이 대상 환경에 배포되면, 해당 환경에 맞는 올바른 값으로 업데이트할 수 있어요.

_환경 변수 만들기_

7. 이제 공개 웹사이트 지식 원본을 추가할 때 이 변수를 사용할 수 있어요.

_공개 웹사이트 지식에 환경 변수 추가_

## 결론

동적 지식 URL 변수 기능은 미묘하지만 판을 바꾸는 기능으로, 많은 조직의 에이전트 구축 경험을 개선할 잠재력을 갖고 있어요. 이제 변수 하나로 다음을 할 수 있어요.

- 멀티 제품 에이전트 구축
- 멀티 지역 에이전트 구축
- 지식 원본 규모 축소
- 정확도 향상과 지연 시간 감소
- 에이전트의 ALM 프로세스 개선
- 고객에게 고도로 개인화된 경험 제공

엔터프라이즈급 에이전트를 만들고 있다면, 이 기능은 앞으로 기본 아키텍처의 일부가 되어야 해요.

---

*이제 변수 하나로 지식 범위를 제어할 수 있게 되었으니, 관련성은 극대화하고 유지 관리 부담은 최소화하기 위해 에이전트 설계 패턴을 어떻게 다시 생각해 보시겠어요?*

---
**업데이트 (2026년 3월 10일):** 동적 지식 URL 변수가 이제 Work IQ 기반 커넥터 방식을 사용하는 SharePoint 지식 원본에서도 지원돼요.

---

## 어휘 주석

1. **ALM(Application Lifecycle Management, 애플리케이션 수명 주기 관리):** 지식 원본이나 코드를 개발(Dev) → 테스트(Test) → 운영(Prod) 환경으로 옮기고 버전을 관리하는 전체 과정.
2. **엔터티(entity):** 문장에서 뽑아낼 특정 종류의 정보 단위(제품명, 날짜, 지역명 등)를 가리키는 개념으로, 에이전트가 사용자 발화에서 필요한 값을 자동으로 골라내는 데 써요.
3. **PowerFX:** Power Platform 전반(Power Apps, Copilot Studio 등)에서 수식과 로직을 작성할 때 쓰는 Excel 함수와 비슷한 형태의 저코드 언어.

---
title: '새로운 Copilot Studio 에이전트 샌드박스'
description: 'Copilot Studio 에이전트가 계산과 파일 생성을 코드로 처리하는 샌드박스 구조와 활용법, 보안 경계, 임시 저장 특성을 정리했어요.'
date: 2026-09-04
tags: ["Copilot Studio", "에이전트 샌드박스", "스킬", "보안", "Python"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/agent-sandbox/card-01.png
  - /cards/agent-sandbox/card-02.png
  - /cards/agent-sandbox/card-03.png
  - /cards/agent-sandbox/card-04.png
  - /cards/agent-sandbox/card-05.png
  - /cards/agent-sandbox/card-06.png
  - /cards/agent-sandbox/card-07.png
  - /cards/agent-sandbox/card-08.png
---
> **원문:** [The New Copilot Studio Agent Sandbox](https://microsoft.github.io/mcscatblog/posts/copilot-studio-agent-sandbox/)
> **게시일:** 2026-07-20 · **저자:** Chris Garty

대규모 언어 모델이 직접 하지 않는 게 나은 일이 두 가지 있어요. 계산을 하는 것, 그리고 크고 정확해야 하는 결과물<sup>1</sup>(채워진 스프레드시트, 유효한 `.docx`, 긴 JSON 문서)을 만드는 것이에요. 모델은 그럴듯한 답을 *예측*할 뿐, 계산하지는 않거든요. 모델이 내놓는 숫자가 정확한 합계라는 보장도 없고, 모델이 출력하는 파일이 유효하다는 보장도 없어요.

언어 모델이 진짜 잘하는 일은 따로 있어요. 바로 그 일을 해내는 코드를 짜는 것이죠. Python 몇 줄이면 열의 합계를 정확히 구하거나, 실행할 때마다 바이트 단위까지 똑같은 파일을 만들어낼 수 있어요. 하지만 코드는 실행할 곳이 있어야 쓸모가 있고, 그러려면 실행 환경이 필요해요.

[GitHub Copilot 하네스](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/overview)로 구동되는 Copilot Studio 에이전트에서는, 그 실행 환경이 바로 에이전트 샌드박스예요.

## 에이전트에 샌드박스를 주는 이유

자기 컴퓨터에서 GitHub Copilot CLI 같은 코딩 에이전트를 써본 적이 있다면 기본 아이디어가 낯설지 않을 거예요. 에이전트가 터미널에서 작업할 수 있거든요. 파일을 살펴보고, 코드를 쓰고, 실행하고, 출력을 읽고, 고치고, 다시 시도해요.

Copilot Studio 샌드박스는 여러분이 머신을 직접 마련하고 관리하지 않아도 에이전트에게 그런 작업 환경을 내줘요. Python 런타임, 로컬 파일, 미리 설치된 라이브러리, 셸 도구를 갖춘 컨테이너인데, 전부 Copilot Studio가 관리해요.

샌드박스는 더 넓은 에이전트 하네스의 한 조각이에요. 지침(Instructions), [지식(Knowledge)](https://learn.microsoft.com/microsoft-copilot-studio/agents-experience/knowledge-copilot-studio), [스킬(Skills)](https://learn.microsoft.com/microsoft-copilot-studio/agents-experience/skills-overview), [도구(Tools)](https://learn.microsoft.com/microsoft-copilot-studio/agents-experience/tools-overview)가 모델이 작업을 이해하고 해내도록 도와줘요. [이제 최신 에이전트에게는 스킬이 있습니다](https://microsoft.github.io/mcscatblog/posts/modern-mcs-agent-skills/)에서 설명했듯, 스킬은 필요한 순간에 작업별 지침과 스크립트를 불러올 수 있어요. 샌드박스는 그 스크립트들이 실제로 실행될 자리를 마련해줘요.

지식(Knowledge)을 예로 들어볼게요. Copilot Studio는 자체 검색 파이프라인에서도 샌드박스를 활용해요. 에이전트가 지식에서 파일을 가져오면 그 파일은 샌드박스에 놓이고, 에이전트는 그걸 열어 Python으로 분석하고 결과를 차트로 그릴 수 있어요. 샌드박스가 없다면 에이전트는 검색이 돌려주는 스니펫<sup>2</sup>에만 갇혔을 거예요. 파일 전체가 거기 있으니 모든 행을 대상으로 작업할 수 있는 거예요.

### Copilot Studio 에이전트 샌드박스의 힘을 보여주는 데모

직접 돌려볼 수 있는 간단한 데모를 하나 준비했어요. 일부러 매출(revenue) 열을 빼서, 합계를 조회가 아니라 계산으로 구해야 하는 가상의 주문 데이터, [샘플 판매 데이터](https://microsoft.github.io/mcscatblog/assets/posts/copilot-studio-agent-sandbox/blastbox-omega-sales-2026.csv)를 받아보세요. 에이전트를 만들고, CSV를 지식 파일로 추가한 다음, "Generate a chart for the sales data showing revenue growth per region per quarter"라고 요청해보세요.

_커스텀 스킬 없이 새로운 Copilot Studio 에이전트가 538개 행에서 매출을 계산하고, 지역·분기별로 합산하고, 차트로 그렸어요._

### 스킬로 에이전트 동작을 더 쉽게 반복 가능하게 만들기

위 데모에서는 에이전트가 코드를 직접 짰어요. 스킬을 쓰면 그 코드를 미리 준비해둘 수 있어요. 검토를 마친 스크립트와 사용 지침을 제공하면, 특정 작업이 매번 똑같은 방식으로 실행돼요. [문서 레드라이닝 예제](https://microsoft.github.io/mcscatblog/posts/redlining-documents-new-copilot-studio-experience/)가 그 모습을 보여줘요. 샌드박스가 제공된 문서들에 스크립트를 돌려 완성된 Word 파일을 만들어내는 거예요.

_진짜 Word 변경 내용 추적이 적용된, 샌드박스에서 생성된 `.docx` 파일._

에이전트는 이 파일을 사용자에게 돌려줄 수 있고, 추가로 손볼 게 있으면 샌드박스에서 바로 수정할 수 있어요.

## 즉석 코드인가, 직접 패키징한 스크립트인가?

코드가 샌드박스까지 오는 경로는 크게 두 가지예요.

- **작업을 위해 생성된 코드.**<br>
  모델이 Python을 쓰고, 실행하고, 결과를 살펴본 다음 고칠 수 있어요. 낯선 내보내기 파일을 이해하거나 새로 올라온 파일을 어떻게 차트로 그릴지 찾아내는 것 같은, 처음 보는 작업에 잘 맞아요. 다만 코드를 짜고 다듬는 데 시간이 걸리고, 구현이 실행마다 조금씩 달라질 수 있다는 트레이드오프가 있어요.
- **스킬에 패키징된 스크립트.**<br>
  미리 작성해둔 스크립트는 바로 실행할 수 있어요. 반복적인 작업에는 대개 더 빠르고 일관되고, 팀이 다른 코드 자산처럼 테스트하고 버전 관리할 수 있어요.

메이커가 대화마다 이 둘 중 하나를 직접 고르는 게 아니에요. 설명이 명확한 스킬을 포함해서 좋은 선택지를 모델에게 쥐여주면, 실행 시점에 무엇을 쓸지는 모델이 알아서 판단해요.

실용적인 규칙은 이래요. 새로운 작업에는 모델이 코드를 직접 생성할 여지를 주세요. 반복적인 작업에는 검토를 마친 스크립트와 설명이 잘 된 스킬을 제공해서 에이전트가 즉시, 일관되게 실행하게 하세요. 그런 다음 [평가(evals)](https://learn.microsoft.com/microsoft-copilot-studio/agents-experience/analytics-agent-evaluation-intro)로 완성된 에이전트가 여전히 의도대로 동작하는지 검증하세요. [품질 게이트 패턴](https://microsoft.github.io/mcscatblog/posts/copilot-studio-eval-gate-azure-devops/)이 그 검증을 자동화하는 방법 하나를 보여줘요. 패키징된 스킬은 에이전트와 함께 이동하고, 일반적인 [애플리케이션 수명 주기 관리(ALM)](https://learn.microsoft.com/microsoft-copilot-studio/guidance/alm) 프로세스를 따라요.

## 샌드박스가 열어주는 가능성

샌드박스에는 문서, 스프레드시트, PDF, 데이터, 차트, 이미지를 다루는 라이브러리가 이미 실려 있어요. 정확한 패키지 이름보다 중요한 건 그것들이 가능하게 하는 반복 작업 루프<sup>3</sup>예요. 에이전트는 파일을 만들고, 명령을 실행하고, 결과를 살펴보고, 방법을 조정하고, 새 명령을 다시 실행하는 과정을 계속 반복할 수 있어요.

즉, 에이전트는 다음과 같은 일을 할 수 있어요.

- 처리할 계산된 보너스를 산출하고, 일련의 숫자로 what-if 분석을 돌리고, 수식을 검증해요. 이 계산이 모델 머릿속이 아니라 코드에서 실행되니까요.
- 업로드된 스프레드시트를 정리된 워크북, 계산된 요약, 차트로 바꿔줘요.
- 문서를 비교하고 레드라이닝된 Word 파일을 돌려줘요.
- PDF에서 내용을 뽑아내고, 일련의 검사를 적용하고, 발견 사항 보고서를 만들어요.
- 제공된 데이터를 프레젠테이션이나 다른 형식의 산출물로 바꿔줘요.

메이커 입장에서는 계산이나 파일 변환을 할 때마다 별도 서비스를 따로 만들 필요가 없어지는 거예요.

## 샌드박스에서 외부로 나가는 네트워크는 없어요

샌드박스에는 밖으로 나가는 네트워크 경로가 아예 없어요. 거기서 실행되는 코드는 무엇을 import하든 API를 호출하거나, 이메일을 보내거나, SharePoint에 파일을 쓸 수 없어요.

예를 들어 `requests` Python 패키지는 설치되어 있지만, 그걸로 뭘 만들든 샌드박스 밖으로는 나갈 수 없어요. 외부와의 연결은 오직 여러분이 구성한 경로로만 이뤄져요. 근거 있는 정보를 위한 지식(Knowledge) 소스, 그리고 실시간 데이터와 외부 작업을 위한 커넥터·MCP 서버<sup>4</sup> 같은 도구(Tools)죠.

관리자 입장에서는 바로 이 경계가 안심할 수 있는 근거예요. 실행은 Copilot Studio가 관리하고, 외부로 나가는 길은 그것뿐이니 에이전트가 밖에서 하는 모든 일은 여러분의 거버넌스 통제와 [데이터 정책](https://learn.microsoft.com/microsoft-copilot-studio/admin-data-loss-prevention) 안에 머무는 거예요.

## 샌드박스는 일시적이에요

샌드박스는 작업 공간이지 영구 저장소가 아니에요. 레드라이닝 에이전트가 `contract-redlined.docx`를 만들었다면, 그 파일을 사용자에게 돌려주거나 구성된 도구로 어딘가 지속성 있는 곳에 저장해야 해요. 다음 대화에서 그 파일을 샌드박스에서 다시 찾을 수 있을 거라고 가정하고 설계하지 마세요.

[에이전트 메모리(Agent Memory)](https://learn.microsoft.com/microsoft-copilot-studio/agents-experience/memory-overview)는 켜두면 사실과 맥락을 대화 사이에 이어줘요. 하지만 파일은 저장하지 않으니, 샌드박스 출력물을 보관하는 수단으로는 쓸 수 없어요.

## 샌드박스에 무엇이 있는지 어떻게 알 수 있나?

에이전트를 만들 때, 에이전트가 코드를 직접 작성하고 실행하길 원할 수도 있고, 스킬로 패키징할 스크립트를 여러분이 직접 짜고 있을 수도 있어요. 어느 쪽이든 샌드박스에 이미 뭐가 깔려 있는지 알아야 해요. 가장 간단한 방법은 에이전트에게 접근 가능한 런타임, 라이브러리, 도구, 스킬이 뭔지 물어보는 거예요.

반복 가능하고 상세한 목록이 필요하다면 [agent-harness-explorer](https://microsoft.github.io/cat-agent-skills/skills/agent-harness-explorer/) 스킬이 그 점검을 자동화하고, 그 자체로 완결된 HTML 보고서를 만들어줘요. 2026년 7월 21일에 아무것도 추가하지 않은 Copilot Studio 에이전트에서 뽑은 보고서를 보면 **컨테이너**에서 **Python 3.12.9**가 돌고, **99개의 Python 라이브러리**, **11개의 기본 제공 도구**, **8개의 스킬**이 있었고, 해당 에이전트에 구성된 **MCP 서버는 없었어요**.

_agent-harness-explorer 스킬이 생성한 보고서 예시._

에이전트를 만들고 에이전트 하네스 탐색기 보고서를 생성하려면:
1. [cat-agent-skills](https://microsoft.github.io/cat-agent-skills/) 스킬 라이브러리에서 [agent-harness-explorer](https://microsoft.github.io/cat-agent-skills/skills/agent-harness-explorer/) 번들(zip)을 다운로드하세요.
2. Copilot Studio에서 [GitHub Copilot 하네스](https://learn.microsoft.com/microsoft-copilot-studio/agents-experience/overview)를 사용하는 에이전트를 만들거나 여세요.
3. 빌드(Build) 탭의 오른쪽 패널에서 "Skills +"를 클릭해 [기존 스킬을 추가](https://learn.microsoft.com/microsoft-copilot-studio/agents-experience/skills-add-existing)하세요.
4. zip 파일을 업로드하고 스킬이 로드될 때까지 기다리세요.
5. [미리 보기(Preview)](https://learn.microsoft.com/microsoft-copilot-studio/agents-experience/preview-overview) 탭을 여세요.
6. 에이전트 채팅에 "Please inspect the harness"(harness/sandbox/environment)라고 입력하세요.
7. [활동 추적(activity trace)](https://learn.microsoft.com/microsoft-copilot-studio/agents-experience/authoring-activity-trace)을 살펴보고 보고서 생성에 쓰인 도구와 스크립트를 확인하세요.
8. "harness-inspection-report" HTML 보고서를 열어 확인하세요.

[에이전트 메모리](https://learn.microsoft.com/microsoft-copilot-studio/agents-experience/memory-overview)가 켜져 있다면, 에이전트에게 "Capture a snapshot"이라고 요청해서 나중에 비교할 스냅숏을 저장해둘 수 있어요. 이렇게 비교해보면 시간이 지나면서 뭐가 추가됐는지 확인할 수 있어요.

## 실전 준비 완료

샌드박스는 Copilot Studio 에이전트가 설명에서 멈추지 않고, 실제로 살펴보고, 계산하고, 만들어내고, 반복할 수 있게 해주는 요소예요. 계산은 모델 머릿속이 아니라 코드에서 실행되고, 파일은 실제 환경에서 만들어지고 검증되고, 경계도 뚜렷해요. 외부로 나가는 유일한 길은 여러분이 구성한 지식과 도구뿐이고, 대화가 끝나면 아무것도 남지 않아요.

Copilot Studio 에이전트가 이렇게 훨씬 유능해진 지금, 여러분의 다음 Copilot Studio 에이전트는 어떤 비즈니스 문제를 풀게 될까요?

---

## 어휘 주석

1. **결과물(payload):** 시스템이 실제로 만들어내야 하는 데이터 산출물 자체를 가리키는 말이에요.
2. **스니펫(snippet):** 전체 문서에서 검색 결과로 잘려 나온 일부 텍스트 조각.
3. **반복 작업 루프(agentic loop):** 에이전트가 실행하고, 결과를 살펴보고, 접근 방식을 고쳐가며 다시 시도하는 실행→관찰→수정의 반복 과정.
4. **MCP 서버:** 에이전트가 외부 데이터나 도구에 표준화된 방식으로 접속할 때 쓰는 연결 지점(Model Context Protocol 서버).

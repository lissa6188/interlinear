---
title: 'Skills for Copilot Studio: YAML<sup>1</sup> 코드로 최대 20배 빠르게 에이전트 만들기'
description: 'Skills for Copilot Studio 플러그인으로 자연어 입력만으로 Copilot Studio 에이전트를 최대 20배 빠르게 만들고 테스트하는 방법을 소개해요.'
date: 2026-09-07
tags: ["Copilot Studio", "Claude Code", "YAML", "에이전트 개발", "플러그인"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/skills-20x-faster/card-01.png
  - /cards/skills-20x-faster/card-02.png
  - /cards/skills-20x-faster/card-03.png
  - /cards/skills-20x-faster/card-04.png
  - /cards/skills-20x-faster/card-05.png
  - /cards/skills-20x-faster/card-06.png
  - /cards/skills-20x-faster/card-07.png
---

> **원문:** [Skills for Copilot Studio: Build agents from YAML code, up to 20x Faster](https://microsoft.github.io/mcscatblog/posts/skills-for-copilot-studio/)
> **게시일:** 2026-03-10 · **저자:** Giorgio Ughini

Copilot Studio 에이전트 개발은 지금까지 늘 UI 중심의 작업이었어요. 포털을 열고, 메뉴를 클릭하고, 노드를 드래그하고, 트리거를 구성하고, 캔버스에서 테스트하고, 이를 반복해요. 잘 동작하긴 하지만 느려요. 특히 만들고 싶은 것이 이미 머릿속에 명확할 때는 더욱 그래요.

필요한 것을 그냥 설명하기만 하면 동작하는 에이전트를 얻을 수 있다면 어떨까요?

그것이 바로 오늘 공개하는 오픈 소스 플러그인 **Skills for Copilot Studio**의 아이디어예요. [Claude Code](https://docs.anthropic.com/en/docs/claude-code)와 [GitHub Copilot CLI](https://docs.github.com/en/copilot)에 연결되어, 자연어를 사용해 터미널에서 바로 Copilot Studio 에이전트를 작성하고, 테스트하고, 트러블슈팅할 수 있게 해 줘요.

> **팁:** TL;DR: 이 플러그인을 즐겨 쓰는 AI 코딩 어시스턴트에 설치하고, 에이전트를 로컬로 클론한 다음, 에이전트 요구 사항을 자연어로 설명하세요. 플러그인이 전체 아키텍처를 YAML 파일로 생성해 주고, 이를 그대로 Copilot Studio에 푸시할 수 있어요.

---

## 왜 에이전트 개발을 터미널로 옮길까요?

전 세계 메이커들에게 속도는 필수예요. 하지만 그보다 더 중요한 것은 새로 출시된 기능을 활용하고 안티패턴<sup>2</sup>을 피하면서 훌륭하고 안정적인 아키텍처를 만드는 일이에요. 게다가 프로덕션 에이전트를 만드는 팀에게는 피드백 루프가 중요해요. 요구 사항 정의, 구현, 테스트, 수정, 반복.

우리는 프로덕션급 Copilot Studio 에이전트를 만드는 데 드는 시간을 줄이면서 이 모든 문제를 해결하고 싶었어요. 이 플러그인을 사용하면 그 루프가 극적으로 빨라져요. 그 이유는 다음과 같아요.

- **자연어를 넣으면 에이전트가 나와요.**<br>
  필요한 것을 설명하면, 플러그인이 토픽, 액션, 지식 소스, 변수 등 최적의 아키텍처를 알아서 판단하고 YAML을 생성해 줘요.
- **베스트 프랙티스가 내장돼 있어요.**<br>
  CAT 팀의 일원으로서 우리는 우리의 설계 패턴과 최적화 기법을 스킬에 직접 녹여 넣었어요. 트리거 구조화나 지식 소스 연결의 노하우를 여러분이 몰라도 플러그인은 알고 있어요.
- **터미널을 떠나지 않고 테스트하고 트러블슈팅해요.**<br>
  YAML을 푸시하고, Copilot Studio에서 게시한 다음, 테스트 발화(utterance)를 실행하고 라우팅 문제를 디버그하는 작업을 모두 같은 커맨드 라인에서 처리해요.

---

## 시작하기

### 사전 요구 사항

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) 또는 [GitHub Copilot CLI](https://docs.github.com/en/copilot)
- [VS Code](https://code.visualstudio.com/)와 [Copilot Studio Extension](https://github.com/microsoft/vscode-copilotstudio)

### 설치

> **주의:** 아래에 안내하는 단계는 Claude Code 기준이에요. GitHub Copilot에서는 약간의 변경만 필요해요.

권장 방법은 마켓플레이스를 통한 설치예요.

```bash
/plugin marketplace add microsoft/skills-for-copilot-studio
/plugin install copilot-studio@skills-for-copilot-studio
```

**매우 중요해요!** 설치 후에는 플러그인/마켓플레이스 설정에서 반드시 플러그인 자동 업데이트를 활성화하세요. 그래야 새로운 Copilot Studio 기능 지원과 최신 개선 사항을 출시되는 대로 받을 수 있어요.

Claude Code에서는 `/plugin`을 입력한 뒤 화살표 키로 플러그인 목록을 탐색해 "Skills for Copilot Studio"를 찾으면 돼요. 찾은 뒤 선택하고 자동 업데이트를 꼭 활성화하세요.
_Claude Code에서 자동 업데이트를 설정하는 방법_

---

## 어떻게 동작하나요?

### 1단계: 빈 에이전트 만들기
이 플러그인의 첫 버전은 빈 디렉터리에서 에이전트를 새로 만드는 데는 적합하지 않아요. 따라서 Copilot Studio 인터페이스에서 에이전트를 먼저 만드는 것을 권장해요. 빈 에이전트("New Agent"를 클릭하고 아무것도 하지 않은 상태)를 만들어도 돼요. 중요한 것은 기본 구성 요소가 모두 갖춰져 있다는 점뿐이에요.

### 2단계: 에이전트를 로컬로 클론하기
에이전트를 만들었다면, Copilot Studio용 VS Code Extension을 사용해 로컬 폴더로 클론해요.

_MCS용 VS Code Extension 스크린샷_

VS Code를 열고 왼쪽 메뉴에서 확장을 찾아 원하는 폴더에 에이전트를 클론하세요.

### 3단계: 코딩 준비 완료!

준비가 끝났어요! 위 명령대로 플러그인을 이미 설치했다면, 이제 Claude Code나 GitHub Copilot으로 에이전트를 개선하고, 트러블슈팅하고, 테스트할 수 있어요. 현재 시점 기준으로 플러그인은 개발 라이프사이클의 각 단계에 맞게 설계된 세 가지 전문 에이전트를 제공해요.

| 명령 | 하는 일 |
|---|---|
| `/copilot-studio:author` | YAML 생성 및 편집 — 토픽, 액션, 지식 소스, 트리거, 변수 |
| `/copilot-studio:test` | 게시된 에이전트 테스트 — 단일 테스트, 배치 스위트, 평가 분석 |
| `/copilot-studio:troubleshoot` | 문제 디버깅 — 잘못된 토픽 라우팅, 유효성 검사 오류, 예기치 않은 동작 |

> **참고:** 이 명령들은 Claude Code와 GitHub Copilot CLI 모두에서 동작해요. 기반이 되는 스킬은 동일해요.

채팅에서 요청과 함께 에이전트를 태그하기만 하면 돼요. 예를 들면 다음과 같아요.
```
@copilot-studio:author I am building an agent used by the customers of Zava Bank. This agent will [...].
```

### 4단계: 변경 사항을 Copilot Studio에 푸시하기
YAML 변경 사항이 만족스러우면, VS Code Extension을 통해 변경 사항을 Copilot Studio에 푸시할 수 있어요.

_MCS용 VS Code Extension 스크린샷_

VS Code를 열고 왼쪽 메뉴에서 확장을 찾아 에이전트에 변경 사항을 푸시하세요.

---

## 실제 사례로 살펴보기

이 플러그인에 얽힌 실제 이야기를 하나 들려드릴게요. 몇 주 전, 저는 대형 다국적 기업의 복잡한 B2C 구축 프로젝트를 진행하던 시스템 통합업체(SI)에 자문을 하고 있었어요. 고객사는 그들에게 아래와 같은 파일을 전달했어요(개인정보 보호를 위해 파일은 편집·익명화되었고 업종도 바꾸었지만, 템플릿과 요구 사항의 분량은 실제 그대로예요).

_Zava Bank의 Copilot Studio 에이전트에 대한 "요구 사항 비슷한" 문서_

이 SI는 처음부터 요구 사항이 명확하지 않아 어려움을 겪고 있었고, 초기에 배포한 아키텍처는 새로 들어온 요구 사항을 감당하지 못해 오류, 잘못된 중의성 해소(disambiguation), 전반적인 품질 저하로 이어지고 있었어요.

저는 그들에게 베타 테스터로서 이 스킬을 제공했어요. 그들은 에이전트를 로컬로 클론한 뒤 이렇게 요청했어요.

```bash
@copilot-studio:author I received the attached excel file with more than 30 different use-cases. My current architecture is giving a lot of disambiguation errors, as well as triggering wrong tools for the given questions. Help me refactor this agent so that it scales.
```

플러그인은 요청과 첨부 파일을 모두 분석해 적절한 토픽 구조(모델 설명, 질문 노드, 조건, 변수)를 결정하고 YAML을 생성했어요. 수정 사항 중 상당수는 매우 영리했어요. 사용된 AI 코딩 어시스턴트는 유사한 토픽들을 찾아내 에이전트 지침(agent instruction)을 활용한 중의성 해소를 구현했는데, 이는 해당 에이전트 메이커들도 몰랐던 기법이었어요. 우리 CAT 팀이 플러그인에 넣어 둔 지식 덕분이었어요.

마지막으로 에이전트가 푸시되었고, UI에서 검토하고 약간의 조정을 거친 뒤 품질 보증(QA) 단계로 배포되었어요.

## 내부적으로는 어떻게 동작하나요?

내부적으로 이 플러그인은 Copilot Studio YAML 스키마, 베스트 프랙티스, 일반적인 패턴에 대한 깊은 지식을 담은 전문 프롬프트인 **스킬(skills)** 모음을 번들로 제공해요. 명령을 호출하면 AI 코딩 어시스턴트(Claude 또는 Copilot)가 이 스킬을 사용해 여러분의 의도를 파악하고, Copilot Studio 스키마를 준수하는 유효한 YAML을 생성하고, 결과물을 검증해요.

스킬은 마켓플레이스로 추가된 GitHub 리포지토리를 통해 유지 관리·업데이트되므로, 우리가 패턴을 다듬고 새로운 Copilot Studio 기능 지원을 추가하는 대로 개선 사항을 자동으로 받게 돼요.

> **참고:** 이는 저희에게 새로운 접근이에요. 사람들이 읽을 수도, 읽지 않을 수도 있는 문서를 쓰는 데 그치지 않고, 베스트 프랙티스를 도구 자체에 직접 인코딩하고 있어요. 플러그인을 쓰는 모든 사람이 저희가 내부에서 쓰는 것과 동일한 패턴의 혜택을 받아요.

---

## 그냥 AI 어시스턴트를 쓰는 것과 무엇이 다른가요?

플러그인이 없어도 GitHub Copilot이나 Claude Code를 열고 Copilot Studio YAML을 생성해 달라고 할 수는 있어요. 하지만 여기에는 간극이 있어요. 범용 모델은 Copilot Studio 스키마를 깊이 알지 못해요. 그럴듯해 보이지만 유효성 검사를 통과하지 못하는 결과물을 내놓거나, 다음과 같은 미묘한 부분을 놓쳐요.

- 트리거가 오케스트레이터와 상호작용하는 방식
- 변수 스코프를 올바르게 지정하는 방법
- 생성형 답변 노드 뒤에 `ConditionGroup`을 언제 써야 하는지

이 플러그인의 스킬은 그 간극을 메워요. 스킬에는 다음이 담겨 있어요.

- 전체 YAML 스키마 레퍼런스
- 일반적인 시나리오(지식 검색, 어댑티브 카드, 하위 에이전트, 커넥터)에 대해 검증된 패턴
- 포털에 도달하기 전에 문제를 잡아내는 유효성 검사 로직

---

## 현재의 제약 사항

> **주의:** 중요: 이것은 Copilot Acceleration Team(CAT)의 v-team<sup>3</sup>이 관리하는 실험적 프로젝트이며, 공식적으로 지원되는 Microsoft 제품이 아니에요.

이 도구는 아직 베타 단계예요. 베스트 프랙티스 준수를 위해 최적화하고 있지만, 사용 중에 원치 않는 패턴, 오류, 혹은 단순히 좋지 않은 아키텍처를 경험할 수도 있어요. [프로젝트 리포지토리에 GitHub 이슈](https://github.com/microsoft/skills-for-copilot-studio/issues)를 등록해 주시면 이 도구를 개선하는 데 큰 도움이 되고, 어쩌면 Copilot Studio에 공식적으로 탑재되는 데도 기여하실 수 있어요.

이 도구를 사용해 보셨거나, 이슈를 열어 주셨거나, 그저 이 플러그인에 시간을 들여 보셨고 피드백이 있으시다면 LinkedIn으로 연락 주시거나 제가 다음에 참석하는 콘퍼런스에서 직접 만나 주세요. 모두 시간이 부족하다는 것을 잘 알기에, 시간을 내어 주신 것에 감사드려요.

추가로 기억해 두시면 좋을 몇 가지가 있어요.

- Copilot Studio YAML 스키마는 예고 없이 변경될 수 있어요. 생성된 YAML은 환경에 푸시하기 전에 항상 검토하세요.
- AI가 생성한 결과물에는 오류나 지원되지 않는 패턴이 포함될 수 있어요. 플러그인은 범용 모델 대비 이를 크게 줄여 주지만, 사람의 검토는 여전히 중요해요.
- 이 도구는 빠르게 진화하고 있어요. 피드백을 바탕으로 활발히 개선 중이에요.

---

## 직접 사용해 보세요

1. 위에서 설명한 대로 플러그인을 설치하거나 [GitHub 리포지토리](https://github.com/microsoft/skills-for-copilot-studio)를 방문하세요.
2. VS Code 확장으로 Copilot Studio 에이전트를 클론하세요.
3. 터미널에서 토픽을 작성하기 시작하고, 속도의 차이를 직접 느껴 보세요.

다시 말씀드리지만, 이 프로젝트는 아직 초기 단계이며 빠르게 개선되고 있어요. 문제를 만나거나 아이디어가 있다면 [GitHub 이슈](https://github.com/microsoft/skills-for-copilot-studio/issues)를 열어 주세요. 저희가 귀 기울여 듣고 있어요.

---

## 어휘 주석

1. **YAML:** 들여쓰기로 구조를 표현하는, 사람이 읽고 쓰기 쉬운 설정·데이터 파일 형식. Copilot Studio는 에이전트 구성을 이 형식으로 저장해요.
2. **안티패턴(anti-pattern):** 겉보기에는 그럴듯하지만 장기적으로는 유지보수와 확장을 어렵게 만드는, 피해야 할 설계·구현 방식.
3. **v-team(virtual team):** 정규 조직도와 별개로, 특정 프로젝트를 위해 여러 팀에서 모인 사람들이 임시로 꾸리는 가상 팀.

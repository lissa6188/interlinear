---
title: '라이브 데모: Claude Code 플러그인으로 Copilot Studio 에이전트 만들기'
description: 'Claude Code 플러그인이 서브 에이전트 4개를 병렬로 움직여 대화 한 번으로 피자 가게 Copilot Studio 에이전트를 완성하는 라이브 데모를 소개해요.'
date: 2026-09-07
tags: ["Claude Code", "Copilot Studio", "서브 에이전트", "플러그인", "라이브 데모"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/claude-code-plugin-demo/card-01.png
  - /cards/claude-code-plugin-demo/card-02.png
  - /cards/claude-code-plugin-demo/card-03.png
  - /cards/claude-code-plugin-demo/card-04.png
  - /cards/claude-code-plugin-demo/card-05.png
  - /cards/claude-code-plugin-demo/card-06.png
---

> **원문:** [Live Demo: Using the Claude Code Plugin to Author a Copilot Studio Agent](https://microsoft.github.io/mcscatblog/posts/claude-copilot-skills-copilot-studio-plugin-demo/)
> **게시일:** 2026-03-26 · **저자:** Giorgio Ughini

> **참고:** 이 글은 **비디오 중심** 튜토리얼이에요. 본문에서는 시나리오의 배경만 설명하고, 진짜 핵심은 아래 녹화 영상에 담겨 있어요.

저희 플러그인이 **3,000번째 클론**을 달성한 날, 실제 에이전트 작성 세션이 어떤 모습인지 보여주는 짧은 영상을 찍어야겠다고 생각했어요. 빈 에이전트에서 시작해서, 완전히 구성된 다기능 봇을 Copilot Studio에 라이브로 푸시하는 것으로 끝나는 과정이에요.

이 영상은 플러그인 **버전 1.0.4**로 녹화했지만(이미 v1.0.5로 넘어갔으니 업데이트하거나 자동 업데이트를 켜 두는 걸 잊지 마세요!), 기본 로직과 워크플로는 똑같아요.

## 무엇을 만드나

이 데모에서는 빈 에이전트에서 시작해, Claude Code와 단 한 번의 대화를 거쳐 여러 기능이 함께 동작하는 **피자 가게 관리 에이전트**를 만들어요.

1. **에이전트 정체성과 성격.**<br>
   에이전트에 새 이름을 붙이고, 다른 언어 모델로 바꾸고, 항상 이모지를 쓰도록 지시해요. 피자 가게는 즐거운 곳이니까요.
2. **테이블 예약.**<br>
   인원수와 날짜를 물어본 뒤, 외부 예약 API로 HTTP POST 호출을 보내 데이터를 전송하는 완전한 예약 플로우예요.
3. **결제 정보.**<br>
   에이전트가 어떤 신용카드를 쓸 수 있는지 알고, 이를 고객에게 명확히 안내해요.
4. **지식 기반 답변.**<br>
   피자와 아이스크림 레시피에 대한 질문은 지식 소스로 등록된 SharePoint 문서를 활용해 답해요.
5. **자식 에이전트 - 이탈리아 여행 전문가.**<br>
   고객이 이탈리아 여행을 물으면, 에이전트가 전용 여행 어드바이저 모드로 바뀌어요. 이모지를 쓰지 않고, 답하기 전에 확인 질문을 하며, 자체 여행 가이드 문서를 근거로 답해요.

흥미로운 건 이 작업이 **어떻게** 이루어지느냐예요. Claude Code는 **서브 에이전트<sup>1</sup> 4개를 병렬로** 오케스트레이션해요. 하나는 에이전트 설정을 맡고, 하나는 HTTP 액션이 포함된 예약 토픽을 만들고, 하나는 지식 소스를 추가하고, 하나는 자식 여행 어드바이저 에이전트를 만들어요. 네 개가 모두 끝나면, 다섯 번째 단계가 순차적으로 모든 걸 Copilot Studio로 푸시해요.

---

## 데모 영상 보기

[데모 영상 보기 (MP4)](https://github.com/GiorgioUghini/WebVideos/releases/download/video-4-1.0.0/Quick.video.tutorial.for.the.claude.code.and.github.copilot.plugin.for.MCS.mp4)

> **팁:** Claude Code가 여러 서브 에이전트에 작업을 나눠 병렬로 처리하는 방식을 눈여겨보세요. 복잡한 다기능 요청에서도 플러그인이 빠른 속도를 유지하는 핵심 비결이에요.

---

## 왜 중요한가

커스텀 토픽, HTTP 통합, 지식 소스, 자식 에이전트까지 갖춘 이 정도 복잡도의 Copilot Studio 에이전트를 만들려면, 보통 포털을 이리저리 오가며 각 요소를 하나씩 구성하고 그때그때 테스트하느라 시간이 꽤 걸려요.

플러그인을 쓰면 원하는 **무엇(What)**을 자연어로 설명하기만 하면 되고, Claude Code가 **어떻게(How)**를 알아서 풀어줘요. 어떤 YAML 파일을 만들지, 토픽을 어떻게 구성할지, 지식 소스를 어디에 연결할지, 자식 에이전트를 어떻게 설정할지 같은 것들이에요. 독립적인 작업은 병렬로 처리하고, 준비가 다 끝나면 환경으로의 푸시까지 알아서 해줘요.

참고로 저희는 UI 포털을 대체하려는 게 아니에요. 여러분이 선호하는 AI 어시스턴트로 같은 일을 할 수 있는 또 하나의 방법을 더하는 것뿐이에요.

---

최근에 Copilot Studio로 무언가를 만들고 계신가요? 댓글로 알려주세요. 저는 모든 댓글을 읽어요!

---

## 어휘 주석

1. **서브 에이전트(sub-agent):** 하나의 상위 작업을 여러 개로 나눠 각자 맡은 부분을 처리하는 보조 AI 에이전트. 여러 개를 동시에 돌리면 병렬로 작업을 끝낼 수 있어요.

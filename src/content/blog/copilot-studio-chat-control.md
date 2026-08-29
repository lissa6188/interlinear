---
title: 캔버스앱에 Copilot Agent 컨트롤 추가
description: '"Copilot Studio 에이전트를 웹사이트나 앱에 어떻게 통합하나요?" Power Apps로 회사 내에서 사용하는 앱을 만들고 특정 화면 내 AI 채팅 컨트롤을 추가해서 해당 앱과 상호작용하는 앱 전용 Copilot을 만듭니다.'
date: 2026-08-27
tags: [copilot, AI chat control, power apps, canvas app]
category: Copilot Studio & Power Platform
# video: https://youtu.be/BOMxu33ECa0
---

보안이 중요한 대기업에서는 이미 보유하고 있는 Microsoft 365, Power Platform 환경에서 Copilot Studio로 에이전트를 사용자가 직접 만들어 사용하도록 권장을 하는 추세가 급속도로 퍼지고 있다. <br>
Copilot Studio로 RAG Agent를 구성해 준 고객사로부터 기획하고 있는 Power Apps 캔버스 앱에 AI 채팅 컨트롤을 추가하는 방법에 대한 문의를 받아 구현해 보려고 한다. 

## 무엇을 해 주나

Power Apps의 캔버스 앱은 빈 화면에 UI/UX 모두 원하는 대로 클라우드 앱을 개발할 수 있는 앱 빌더이다. 기본적인 컨트롤은 Low-code기반의 Drag-and-Drop 방식으로 제공된다. (물론 완전한 Low-code는 아니고 전용 함수와 구성방식을 이해해야 한다.)

캔버스 앱으로 사내 특수 요구사항에 맞는 클라우드 네이티브 앱을 만들고 이 앱에 특화된 AI 채팅 + 에이전트 컨트롤을 추가해서 앱을 사용할 때 AI 에이전트를 자연스럽게 활용해 본다. 

- 앱 내 데이터 탐색 및 질문/요약
- 자연어로 레코드 생성 (에이전트가 자동으로 입력)

## 시행 착오 1
PCF Gallery 사이트에 올라온 리포지토리는 Copilot이 예전 Power Virtual Agent일 때 버전으로 이 방식으로는 토큰 교환이 되지 않는다.
[ChatControl PCF 샘플 (Microsoft CopilotStudioSamples)](https://github.com/microsoft/CopilotStudioSamples/tree/main/ui/embed/pcf-canvas-app)

## 시행 착오 2 
캔버스 앱에 M365 Copilot 추가 기능을 사용해 보려고 했는데 현재 리미 보기 상태라서 Asia Region에서는 해당 설정이 안보인다. 
https://learn.microsoft.com/ko-kr/power-apps/maker/canvas-apps/microsoft-365-copilot-canvas-app

Copilot 컨트롤 추가도 설정이 아직 안보인다. 
https://learn.microsoft.com/ko-kr/power-apps/maker/canvas-apps/add-ai-copilot

사용자 지정 Copilot 추가도 동일하게 설정에서 안보인다. 
https://learn.microsoft.com/ko-kr/power-apps/maker/canvas-apps/add-custom-copilot

## 사전 요구 사항
1. Microsoft 인증으로 구성된 게시된 Copilot Studio 에이전트
2. SSO에 필요한 권한이 있는 Azure 앱 등록
3. Power Platform 환경에서 시스템 관리자 권한
4. 대상 환경에서 PCF 구성 요소 활성화


## 알아두면 좋은 것
- Copilot 하네스

## 확인하지 못한 것


---


참고 자료
https://microsoft.github.io/mcscatblog/posts/copilot-studio-api-decision-guide/

https://microsoft.github.io/mcscatblog/posts/embed-copilot-studio-agents-canvas-apps/

https://github.com/microsoft/CopilotStudioSamples/tree/main/ui/embed/pcf-canvas-app

https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-connect-bot-to-custom-application

https://learn.microsoft.com/en-us/microsoft-copilot-studio/configure-web-security

https://learn.microsoft.com/en-us/microsoft-copilot-studio/customize-default-canvas

https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-integrate-web-or-native-app-m365-agents-sdk

https://learn.microsoft.com/en-us/answers/questions/2265412/unable-to-retrieve-direct-line-token-from-copilot

https://github.com/microsoft/Agents/issues/421

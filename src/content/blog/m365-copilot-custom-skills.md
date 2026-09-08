---
title: 'M365 Copilot 선언적 에이전트에 커스텀 스킬 추가하기 (preview)'
description: 'Microsoft 365 Copilot 선언적 에이전트에 커스텀 스킬(프리뷰)을 추가하는 두 가지 방법과 용량·개수 한도, 샌드박스 네트워크·설치 제약을 정리했어요.'
date: 2026-09-08
tags: ["Microsoft 365 Copilot", "커스텀 스킬", "선언적 에이전트", "Agents Toolkit", "Frontier Preview"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/m365-copilot-custom-skills/card-01.png
  - /cards/m365-copilot-custom-skills/card-02.png
  - /cards/m365-copilot-custom-skills/card-03.png
  - /cards/m365-copilot-custom-skills/card-04.png
  - /cards/m365-copilot-custom-skills/card-05.png
  - /cards/m365-copilot-custom-skills/card-06.png
  - /cards/m365-copilot-custom-skills/card-07.png
  - /cards/m365-copilot-custom-skills/card-08.png
---

> **원문:** [Custom skills in declarative agents (preview)](https://learn.microsoft.com/microsoft-365/copilot/extensibility/declarative-agent-skills) · Microsoft Learn 공식 문서를 짧게 정리한 글이에요.
> 관련 문서: [Agent Builder에서 스킬 추가](https://learn.microsoft.com/microsoft-365/copilot/extensibility/agent-builder-add-skills), [Agents Toolkit으로 스킬 추가](https://learn.microsoft.com/microsoft-365/copilot/extensibility/build-declarative-agents-add-custom-skills)

## 무엇이 새로 생겼나요

Microsoft 365 Copilot의 선언적 에이전트(declarative agent)에 **커스텀 스킬**을 붙일 수 있게 됐어요. 아직 프리뷰이고, Microsoft Frontier Preview에 참여한 조직만 쓸 수 있어요.

예전에는 "스킬"이 지침(instructions) 안에 적어 두는 작업 설명을 뜻했어요. 이제는 지침과 분리된 **별도 구성 요소**예요. 작업 세부 내용을 지침에 길게 적는 대신, 스킬로 묶어 두고 에이전트가 필요할 때 참조해요.

## 스킬이란

스킬은 폴더 하나예요. 안에 이런 것이 들어가요.

- 필수 파일 `SKILL.md`: 맨 위 YAML에 이름과 설명, 그 아래에 지침. 지침은 2만 자 미만이어야 해요.
- 선택 파일: 템플릿, 참고 데이터, 정의서 같은 리소스.
- 선택 스크립트와 하위 폴더.

예를 들어 재무팀이 "분기 사업 리뷰" 스킬을 만든다면, 리뷰 작성 지침과 데이터 변환·차트 생성 스크립트, 재무 모델과 KPI 정의, 브랜드 슬라이드 템플릿을 한 폴더에 묶을 수 있어요. 사용자가 그 작업을 요청하면 에이전트가 이 스킬을 꺼내 써요.

## 왜 스킬로 나누나요

- **컨텍스트를 아껴요.** 스킬은 필요할 때만 로드돼요(점진적 공개). 스킬이 늘어나도 에이전트의 컨텍스트는 가벼워요. 모델이 즉석에서 코드를 짜는 대신 준비된 스크립트를 쓰니 결과가 매번 비슷하게 나와요.
- **지침 한도를 넘어요.** 선언적 에이전트 지침은 8,000자 제한이 있어요. 복잡한 절차를 스킬로 쪼개면 품질을 잃지 않고 더 길고 구체적인 안내를 줄 수 있어요.
- **자산을 묶어요.** 지침·리소스·스크립트를 하나로 패키징해 에이전트에 붙여요.
- **기업용 준비가 돼 있어요.** 스크립트는 격리된 샌드박스에서 돌고, 파일의 민감도 레이블이 유지되며, 관리자 거버넌스가 있어요.

## 어디서 추가하나요

두 가지 경로가 있어요.

- **Agent Builder**(Copilot 채팅 안): `.zip` 패키지를 업로드해요. 자연어로 설명하면 Agent Builder가 스킬을 만들어 주기도 해요. 패키지는 최대 50MB, 파일 하나는 25MB까지예요.
- **Microsoft 365 Agents Toolkit**(CLI 또는 VS Code): 스킬 폴더를 추가해요. `.zip`은 안 되고, 앱 패키지 전체가 10MB 이내여야 해요. 에이전트 매니페스트 버전 1.9가 필요하고, `TEAMSFX_AGENT_SKILLS` 환경 변수를 켜야 해요.

두 경로 모두 에이전트당 스킬 8개, 전체 350파일, 폴더 깊이 3단계까지예요. 프리뷰 단계라 스킬을 여러 에이전트에서 재사용하는 건 아직 안 돼요.

## 쓸 수 있는 파일

- 지침·리소스: json, xml, yaml, ini, config, docx, pdf, txt, md, pptx, xlsx, csv, html, png, jpg 등 문서·이미지 대부분.
- 스크립트: Python(.py), JavaScript(.js/.mjs/.cjs), TypeScript(.ts/.mts), 셸(.sh/.bash).

## 스크립트 샌드박스의 한계

스크립트는 안전한 샌드박스에서 실행돼요. 그래서 이런 건 못 해요.

- 인터넷·네트워크 접근 없음. 인증이 필요한 외부 호출도 안 돼요.
- 패키지를 실행 중에 설치할 수 없어요. 샌드박스에 이미 있는 패키지만 쓰고, 있는지 확인되지 않은 패키지에 의존하면 안 돼요.
- 커넥터·API 플러그인·MCP 서버는 에이전트(오케스트레이터)가 쓰는 것이지, 스크립트가 직접 부를 수는 없어요.

## 보안과 저장

- 민감도 레이블은 샌드박스에서도 유지되고 정책이 적용돼요. 다만 사용자 정의 권한과 이중 키 암호화(DKE)는 지원하지 않아요.
- 업로드한 스킬 파일은 테넌트 범위의 SharePoint Embedded 컨테이너에 저장돼요.

## 알려진 문제

- 프리뷰 동안 스킬과 임베디드 파일(embedded files)을 한 에이전트에 같이 쓸 수 없어요. 지원 예정이에요.

## 정리

지침에 다 적지 말고, 반복되는 작업은 스킬 폴더로 묶어 에이전트에 붙이세요. 필요할 때만 로드되니 가볍고, 스크립트 덕에 결과가 일정해요. 다만 프리뷰이고 Frontier 프로그램 참여 조직만 쓸 수 있으니, 시작 전에 자격과 샌드박스 한계(네트워크 없음, 패키지 설치 없음)를 먼저 확인하세요.

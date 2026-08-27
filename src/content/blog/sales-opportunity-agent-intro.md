---
title: Dynamics 365 Sales Opportunity Agent — 영업기회 조사를 대신해 주는 AI 에이전트
description: 미팅 전에 CRM과 메일을 뒤지며 영업기회 상황을 파악하던 시간을 줄여 준다. Sales Opportunity Agent가 무엇을 해 주고, 핵심 설정을 알아보자.
date: 2026-08-23
tags: [d365, sales, ai-agent]
category: Dynamics 365 CRM
video: https://youtu.be/BOMxu33ECa0
---

영업 담당자의 하루에서 은근히 큰 비중을 차지하는 일이 있다. 고객 미팅 전에 영업기회 상황을 다시 파악하는 일이다. CRM 열어서 기회 레코드 보고, 메일함 뒤져서 마지막 회신이 언제였는지 확인하고, 고객사 뉴스도 한 번 검색해 보고. 이걸 딜마다 반복한다. Dynamics 365 Sales에 들어온 Sales Opportunity Agent는 이 조사 업무를 대신해 주는 AI 에이전트다.

## 무엇을 해 주나

흩어져 있는 영업기회 정보를 알아서 모아서, 기회 레코드 안에 요약해 준다.
웹 리서치도 대신 해준다.

에이전트가 모으는 소스는 네 갈래다.

- CRM 데이터 — 예상 매출, 마감일, 예측 점수 같은 기회 레코드 정보
- 이메일 — 고객과 주고받은 메일의 흐름
- 미팅 — 회의 인텔리전스에서 뽑은 내용
- 웹 — 고객사 뉴스, 업계 동향 같은 공개 정보

## 실제 화면에서는 어떻게 보이나

셀러 입장에서는 따로 배울 게 거의 없다. Sales Hub의 기회 목록에서 **My top opportunities from AI agent** 뷰를 선택하면 에이전트가 조사한 기회들이 중요도·리스크와 함께 나온다. 기회를 열면 상단에 요약(Summary)이 뜨고, **See full research**를 누르면 전체 리서치 페이지로 들어간다. 기존 워크플로를 바꿀 필요가 없다는 게 이 에이전트의 설계 방향이다.

## 켜려면 뭐가 필요한가

관리자가 할 일은 Sales Hub의 **App Settings > Dynamics 365 AI hub > Agent manager**에서 시작한다. 대략의 흐름은 이렇다.

1. 에이전트 프로필(이름, 언어) 설정
2. 회사 정보 입력 — 우리 회사의 가치 제안을 알려 줘야 리서치가 우리 관점으로 나온다
3. 대상 기회 선정 기준 설정 — 예: "예상 매출 1억 이상인 진행 중 기회만"
4. 중요도·리스크 평가 기준과 새로 고침 주기 설정
5. 지식 소스(공개 웹, SharePoint 문서 등) 연결 후 시작

사전 요건이 있어서 사용하려면 미리 체크하자. 
 - Copilot Studio 라이선스
 - Sales Hub 모던 UI 활성화
 - Bing 검색과 Dataverse 검색
 - 데이터 커넥터 허용

(리스크 평가에 예측 기회 점수 모델을 쓰는데, 미리 구성해 두지 않았다면 에이전트 시작 시 자동으로 구성된다.)

## 알아두면 좋은 것

- 에이전트는 조사만 한다. 고객에게 직접 메일을 보내거나 연락하는 일은 없다.
- 에이전트 인스턴스는 환경당 최대 10개까지 만들 수 있다. 제품 라인별, 기회 세그먼트별로 따로 굴릴 수 있다는 뜻이다.
- 이메일 인사이트를 쓰려면 셀러 본인이 Microsoft 365 메일 접근에 동의해야 한다. 동의하면 최근 30일치 메일을 분석하는데, 이 동의는 철회할 수 없다는 점은 미리 안내하는 게 좋다.

## 확인하지 못한 것

- Copilot Studio 라이선스 과금이 실제 사용량에서 어느 정도 나오는지는 테넌트에서 돌려 봐야 안다.
- 리스크 감지가 얼마나 민감한지(오탐이 많은지, 놓치는 게 많은지 등)는 운영 데이터로 확인할 문제다.

---

참고: [Sales Opportunity Agent 공식 문서](https://learn.microsoft.com/dynamics365/sales/sales-opportunity-agent) · [설정 가이드](https://learn.microsoft.com/dynamics365/sales/configure-opportunity-research-agent) · [Microsoft Mechanics 데모 영상](https://www.youtube.com/watch?v=wGBHAclqhG8)

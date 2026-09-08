---
title: '영상 데모: Microsoft Copilot Studio에서 Computer Use용 Cloud PC 풀 구현하기'
description: 'Copilot Studio의 Computer Use를 어디서 실행할지 고민된다면, Cloud PC 풀이 왜 안전하고 확장 가능한 선택인지 정리했어요. 런타임 3가지 비교와 관리 기능까지 함께 확인해보세요.'
date: 2026-09-08
tags: ["Copilot Studio", "Computer Use", "Cloud PC", "Entra ID", "Intune"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/computer-use-cloud-pc-pool/card-01.png
  - /cards/computer-use-cloud-pc-pool/card-02.png
  - /cards/computer-use-cloud-pc-pool/card-03.png
  - /cards/computer-use-cloud-pc-pool/card-04.png
  - /cards/computer-use-cloud-pc-pool/card-05.png
  - /cards/computer-use-cloud-pc-pool/card-06.png
  - /cards/computer-use-cloud-pc-pool/card-07.png
---

> **원문:** [Video Demo: Implement Cloud PC Pool for Computer Use in Microsoft Copilot Studio](https://microsoft.github.io/mcscatblog/posts/cua-cloudpcpool-in-copilotstudio/)
> **게시일:** 2026-01-09 · **저자:** Jay Padimiti

> **참고:** 이 글에서는 Copilot Studio의 Computer Use 도구 런타임으로 Cloud PC 풀을 구현하는 방법을 소개해요. Cloud PC 풀에 대한 개요와 구현 과정을 함께 보여 주는 영상 데모도 포함되어 있어요.

## Microsoft Copilot Studio의 Computer Use용 Cloud PC 풀

### 개요

**Microsoft Copilot Studio**를 사용하면 여러 애플리케이션과 웹사이트에 걸쳐 작업을 수행할 수 있는 AI 기반 에이전트를 구축할 수 있어요. 그중에서도 강력한 기능 하나가 바로 **Computer Use**예요. Computer Use는 자연어 지시만으로 버튼을 클릭하고, 폼을 채우고, 화면을 탐색하면서 Windows 앱과 웹 페이지와 상호작용하는 AI 기반 UI 자동화 도구예요. 덕분에 API가 전혀 제공되지 않는 상황에서도 에이전트가 작업을 완료할 수 있어요. 사람이 UI를 통해 할 수 있는 일이라면 Computer Use도 할 수 있으므로, 데이터 입력, 송장 처리, 정보 추출 같은 시나리오에 이상적이에요.

이러한 자동화를 실행하려면 Computer Use 도구에 Windows 런타임이 필요한데, Copilot Studio에서는 이 런타임을 어디에서 실행할지 선택할 수 있어요.

- **호스티드 브라우저(Hosted browser).**<br>
  Microsoft가 관리하는 브라우저 전용 환경으로, 별도 설정이 전혀 필요 없어요. 빠른 웹 자동화와 실험에는 훌륭하지만, Entra ID<sup>1</sup>에 조인되어 있지 않고 Intune<sup>2</sup>으로 관리되지도 않으므로 내부 시스템 접근이나 프로덕션 워크로드에는 적합하지 않아요.
- **Cloud PC 풀(Cloud PC pool).**<br>
  Microsoft가 호스팅하는 Windows 11 Cloud PC로, Entra ID에 조인되고 Intune에 등록되어 있어요. 이 옵션은 관리형 서비스의 간편함과 완전한 자격 증명(ID), 규정 준수, 거버넌스 제어를 결합하여 확장 가능하고 안전한 엔터프라이즈급 자동화를 제공해요.
- **자체 머신 사용(Bring your own machine, BYOM).**<br>
  Computer Use용으로 등록한 여러분 소유의 Windows 물리 머신 또는 VM이에요. 최대한의 제어와 커스터마이징이 가능하지만, 인프라의 프로비저닝·보안·유지 관리를 직접 책임져야 해요.

이 글에서는 **Cloud PC 풀**에 초점을 맞추어, Microsoft Copilot Studio에서 Computer Use용 Cloud PC 풀을 구현하는 방법을 실습 데모로 살펴봐요.

## 왜 Cloud PC 풀인가?

Cloud PC 풀을 사용하면 인프라를 직접 관리하지 않고도 Microsoft Copilot Studio에서 엔터프라이즈급 에이전트를 손쉽게 구축할 수 있어요. 이 서비스는 조직의 자격 증명, 보안, 규정 준수 경계 안에서 동작하면서, 필요할 때 Windows Cloud PC를 온디맨드로 기동해요.

Cloud PC는 Entra ID에 조인되고 Intune에 등록되어 있기 때문에 SharePoint나 사내 업무(LOB) 앱 같은 내부 시스템에 대한 SSO(Single Sign-On)<sup>3</sup>를 지원하며, IT 부서가 정책, 보안 구성, 규정 준수 제어를 강제할 수 있어요. 내부 리소스에 접근할 수 없고 중앙에서 관리할 수도 없는 호스티드 브라우저와 달리, Cloud PC 풀은 엔터프라이즈 자동화를 위한 프로덕션 준비가 완료된 환경이에요.

Cloud PC 풀은 에이전트를 위한 Windows 365라고 생각하면 돼요. Power Platform 지리적 위치(geography)에 프로비저닝되고, Microsoft의 호스티드 네트워크에서 실행되며, 기존 IT 도구로 완전히 관리되는 Windows 11 Enterprise Cloud PC예요.

_Copilot Studio에서 Computer Use의 런타임 옵션인 Cloud PC 풀 개요_

## 데모 개요: Copilot Studio의 Computer Use(CUA)용 Cloud PC 풀

이 데모에서는 Copilot Studio의 Computer Use 도구 런타임으로 Cloud PC 풀을 구현하는 방법을 살펴봐요.

- Copilot Studio의 CUA 개요
- CUA 런타임 옵션
- Cloud PC 풀 - 사전 요구 사항과 설정
- 구현 개요
  - Cloud PC 풀 관리
  - Cloud PC 인스턴스 모니터링, 실행 상태 확인, 성능을 위한 대기 중 세션 추적
  - 관리자 제어 및 감사 로그

## 데모 영상 보기

<iframe width="760" height="515" 
        src="https://www.youtube.com/embed/XKctbmyUb7Q" 
        title="Video: Implement Cloud PC pool for Computer Use in Copilot Studio"
        frameborder="0"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
</iframe>

## 핵심 요약

이 엔드투엔드 워크스루는 Copilot Studio에서 Computer Use용 Cloud PC 풀을 활성화하는 방법을 보여 줘요.

Computer Use와 Cloud PC 풀에 대한 핵심 요약은 다음과 같아요.

- **✔ AI 기반 UI 자동화.**<br>
  Computer Use 도구는 API 의존성 없이 자연어 명령으로 작업을 수행하는 AI 기반 UI 자동화 에이전트예요.
- **✔ Cloud PC 풀 개요.**<br>
  Cloud PC 풀은 Microsoft가 관리하는 Windows 365 가상 머신으로, 자동화를 위한 확장 가능하고 안전한 런타임 환경을 제공해요.
- **✔ 엔터프라이즈 통합 및 규정 준수.**<br>
  Cloud PC는 여러분의 Azure AD에 조인되고 Intune으로 관리되므로, 정책 적용과 조직 리소스에 대한 안전한 접근이 가능해요.
- **✔ IT 및 개발자를 위한 이점.**<br>
  Cloud PC 풀은 IT 팀과 개발 팀에게 매끄러운 확장성, 기업 거버넌스, 유지 보수 부담 감소를 제공해요.

이것이 바로 조직이 진정한 에이전틱 시스템을 실현하는 방법이에요. Microsoft Copilot Studio의 Computer Use를 기반으로, 여러 애플리케이션에 걸쳐 데이터, 액션, 추론, 도메인 전문성을 하나로 결합하는 것이에요.

즐거운 자동화 되시길 바라요!

---

*AI 기반 UI 자동화는 여러분 조직의 엔터프라이즈 워크플로와 규정 준수 접근 방식을 어떻게 바꾸게 될까요?*

---

## 어휘 주석

1. **Microsoft Entra ID:** 사용자와 디바이스의 신원을 관리하고 로그인·권한을 확인해 주는 Microsoft의 클라우드 인증 서비스(옛 Azure AD).
2. **Intune:** 조직 소유 디바이스의 보안 정책, 앱 배포, 규정 준수 상태를 원격으로 관리하는 Microsoft의 디바이스 관리 서비스.
3. **SSO(Single Sign-On):** 한 번 로그인하면 여러 시스템과 애플리케이션에 다시 로그인하지 않고 접근할 수 있게 해 주는 인증 방식.

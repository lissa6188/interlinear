---
title: 'E3 사용자가 갑자기 Copilot Studio에서 에이전트를 만들 수 있는 이유 — 그리고 끄는 방법'
description: 'E3 같은 기본 라이선스에도 Copilot Studio 에이전트 생성 권한이 포함돼 있어요. 끄는 서비스 계획과 이후 거버넌스 절차를 정리했어요.'
date: 2026-09-04
tags: ["Copilot Studio", "E3", "Power Virtual Agents", "Dataverse for Teams", "거버넌스"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/e3-users-build-agents/card-01.png
  - /cards/e3-users-build-agents/card-02.png
  - /cards/e3-users-build-agents/card-03.png
  - /cards/e3-users-build-agents/card-04.png
  - /cards/e3-users-build-agents/card-05.png
  - /cards/e3-users-build-agents/card-06.png
  - /cards/e3-users-build-agents/card-07.png
  - /cards/e3-users-build-agents/card-08.png
---
> **원문:** [Why Your E3 Users Can Suddenly Build Agents in Copilot Studio — and How to Turn It Off](https://microsoft.github.io/mcscatblog/posts/e3-users-build-agents-turn-it-off/)
> **게시일:** 2026-07-09 · **저자:** Em D'Arcy

헬프 데스크에 사용자가 직접 만든 에이전트에 대한 문의가 들어오기 시작했거나, **E3** 같은 기본 Microsoft 365 라이선스만 보유한 사용자에게 **Copilot Studio 웹 앱**에서 *Teams용 에이전트 만들기* 화면이 나타나는 걸 발견하셨다면, 착각이 아니에요. 그리고 실수로 무언가를 구매하신 것도 아니고요.

이 글에서는 *왜* 이런 일이 생겼는지, 최근 무엇이 바뀌어 이렇게 눈에 띄게 됐는지, 그리고 에이전트 만들기 접근을 없애기 위해 비활성화할 수 있는 단 하나의 라이선스 **서비스 계획(service plan)**을 설명할게요.

## 그래서 무엇이 바뀌었나요?

기본 라이선스 사용자가 **클래식 에이전트**를 만들 수 있는 기능은 E3, E5를 포함한 일부 Microsoft 365 구독에 번들로 포함된 **Copilot Studio for Microsoft Teams 플랜**의 일부로 제공돼요.

바뀐 건 그 기능이 이제 *어디에* 나타나느냐예요.

> **주의:** 2026년 6월 말부터 독립형 **Copilot Studio for Teams** 앱에서는 더 이상 클래식 챗봇을 만들 수 없어요. 이제 이 앱은 사용자를 **Copilot Studio 웹 앱으로 리디렉션**해요.

대부분의 관리자가 우려하는 지점이 바로 이거예요. 이전에는 구석에 있는 Teams 앱에서 에이전트를 만들던 사용자들이 이제 Copilot Studio 웹 앱에 곧바로 도착하게 됐고, 그 결과 이 기능이 훨씬 더 발견되기 쉬워졌어요.

## 기본 라이선스 사용자가 애초에 이것을 할 수 있는 이유

Microsoft 365 엔터프라이즈 라이선스에는 [Copilot Studio for Microsoft Teams 플랜](https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-licensing-subscriptions#copilot-studio-for-microsoft-teams-plan)이 포함돼 있고, 이 플랜은 Copilot Studio의 **일부 기능**, 즉 **클래식 오케스트레이션**을 사용하는 에이전트를 만들고 Teams에 게시하는 기능을 줘요.

이게 눈에 잘 띄지 않았던 이유는 이래요. 이 권한은 **`Power Virtual Agents for Office 365`**라는 라이선스를 통해 제공돼요. 사용자가 이런 에이전트를 만들면 Copilot Studio가 선택한 팀에 대해 자동으로 [**Dataverse for Teams** 환경을 프로비저닝](https://learn.microsoft.com/en-us/microsoft-copilot-studio/fundamentals-get-started-teams)해요.

당황해서 전부 꺼 버리기 전에 다음 사항을 기억하는 게 중요해요.

> **참고:** 이 권한은 **클래식 에이전트만** 다루며, **Dataverse for Teams** 환경과 **Teams 게시**로 제한돼요. 생성형 오케스트레이션, 프리미엄 커넥터, 임의의 게시 채널은 부여하지 **않아요**. 그런 기능들은 여전히 독립형 Copilot Studio 구독이 필요해요.

또한 이 Teams 플랜 에이전트는 Teams에서 사용될 때 **Copilot Credits를 소모하지 않는다**는 점도 주목할 만해요. 따라서 이 사안은 과금 문제라기보다 **거버넌스와 환경 난립(environment sprawl)** 문제로 다뤄야 해요. 기본 Microsoft 365 라이선스가 많은 관리자의 생각보다 이미 더 많은 Copilot 기능을 사용자에게 주고 있다는 걸 상기시켜 주는 좋은 사례이기도 해요. [Microsoft 365 Copilot에 에이전트를 배포하는 데 사실 Copilot 라이선스가 필요 없다](https://microsoft.github.io/mcscatblog/posts/no-copilot-license-m365-channel/)는 것과 마찬가지죠.

## 제어 수단: `Power Virtual Agents for Office 365` 서비스 계획 비활성화

해당 사용자가 **Copilot Studio 웹 앱과 Teams 앱 양쪽 모두**에서 클래식 에이전트를 **만들고 편집**하는 걸 막으려면, 사용자의 라이선스에서 **`Power Virtual Agents for Office 365`** 서비스 계획을 비활성화하세요. 사용자별로 할 수도 있고, 더 좋게는 대규모로 할 수도 있어요.

### 옵션 1 — 사용자별

1. **Microsoft 365 관리 센터** → **사용자(Users)** → **활성 사용자(Active users)**로 이동하세요.
2. 사용자 선택 → **라이선스 및 앱(Licenses and apps)**.
3. 사용자의 Microsoft 365 라이선스(예: E3)를 펼치세요.
4. **Power Virtual Agents for Office 365** 체크를 해제하세요.
5. **변경 내용 저장(Save changes)**.

_사용자 라이선스에서 Power Virtual Agents for Office 365 서비스 계획을 비활성화해요._

### 옵션 2 — 그룹 기반 라이선싱

소수의 사용자를 넘어서는 규모라면 [Microsoft Entra ID의 그룹 기반 라이선싱](https://learn.microsoft.com/en-us/entra/identity/users/licensing-groups-assign)으로 관리하세요.

1. Entra ID에서 라이선스 할당에 사용하는 그룹을 여세요.
2. 할당된 Microsoft 365 라이선스를 편집하세요.
3. 그룹에 대해 **Power Virtual Agents for Office 365** 서비스 계획을 끄세요.
4. 할당 프로세스가 구성원에게 적용되도록 기다리세요.

> **팁:** 그룹 기반 라이선싱은 사람들이 그룹에 들어오고 나가도 정책을 일관되게 유지해요. 한 번 설정하고 잊어버리세요.

## 이렇게 하면 얻게 되는 것

- 해당 사용자에 대해 Copilot Studio 웹 앱과 Teams 앱에서 클래식 에이전트 생성 및 편집이 차단돼요.
- 사용자가 이미 만든 에이전트를 소급해서 삭제하거나, 이미 프로비저닝된 **Dataverse for Teams** 환경을 정리하지는 **않아요**.
- **독립형 Copilot Studio** 또는 **Microsoft 365 Copilot** 라이선스를 보유한 사용자에게는 영향을 주지 **않아요**. 그 권한들은 별개예요.

## 다음 단계는 무엇인가요?

서비스 계획 토글은 빠른 응급 조치예요. 그다음에는 지속 가능한 환경 수준의 거버넌스 계획이 필요해요.

- 단속을 시작하기 전에 **기존 Dataverse for Teams 환경을 감사**해 현재의 난립 상황을 파악하세요. 사용자에게 가치를 주고 있는 것을 실수로 꺼 버리지 않도록 해야 해요.
- Power Platform 관리 센터의 **Managed Environments**로 누가, 어디에서 만들 수 있는지 관리하세요. 가능한 곳에서는 개발자 환경을 활용하세요.
- **DLP 정책**을 겹겹이 적용해 허가받은 메이커도 가드레일 안에서 작업하게 하세요.

## 요약

E3와 E5에는 **클래식** Teams 에이전트를 만들 수 있는 권한이 조용히 포함돼 있고, 2026년 6월 말의 리디렉션 변경은 그 기능을 웹 앱에서 더 많은 사용자에게 드러냈을 뿐이에요. 이게 원하는 상황이 아니라면, 제어 수단은 단 하나의 서비스 계획, 즉 **`Power Virtual Agents for Office 365`**이며, 사용자별로 또는 더 좋게는 그룹 기반 라이선싱으로 비활성화할 수 있어요. 여기에 Power Platform 거버넌스를 결합하면, 애초에 문제가 있었다는 걸 아무도 모르게 신속하고 손쉽게 상황을 통제할 수 있어요!

### 참고 자료

- FAQ: [Why can Microsoft 365 users create agents in Copilot Studio, and how can I control this access?](https://learn.microsoft.com/en-us/microsoft-copilot-studio/faq-billing-licensing#why-can-microsoft-365-users-create-agents-in-copilot-studio-and-how-can-i-control-this-access)
- [Copilot Studio licensing and subscriptions](https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-licensing-subscriptions)
- [Quickstart: Create classic agents for Teams](https://learn.microsoft.com/en-us/microsoft-copilot-studio/fundamentals-get-started-teams)
- [Assign licenses and manage access to Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-licensing)
- [Group-based licensing in Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity/users/licensing-groups-assign)

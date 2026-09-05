---
title: 'Power Automate와 커스텀 커넥터로 구현하는 실시간 PAYG 초과 지출 방지'
description: 'Azure Cost Management API와 Power Automate로 4시간마다 지출을 확인하고, 임계값을 넘으면 환경 연결을 자동으로 끊어 PAYG 초과 지출을 막는 방법을 소개해요.'
date: 2026-09-05
tags: ["PAYG", "Power Automate", "커스텀 커넥터", "Cost Management", "Power Platform"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/payg-overspend-prevention/card-01.png
  - /cards/payg-overspend-prevention/card-02.png
  - /cards/payg-overspend-prevention/card-03.png
  - /cards/payg-overspend-prevention/card-04.png
  - /cards/payg-overspend-prevention/card-05.png
  - /cards/payg-overspend-prevention/card-06.png
  - /cards/payg-overspend-prevention/card-07.png
---

> **원문:** [Real-Time PAYG Overage Protection with Power Automate, Custom Connectors](https://microsoft.github.io/mcscatblog/posts/managing-azure-consumption-power-platform/)
> **게시일:** 2026-05-07 · **저자:** Rahul Ranjit Kannathusseril

*부제: Power Platform이 스스로 문지기가 되도록 가르치기... 그런데 4시간마다 한 번이면 실시간이라고 할 수 있을까요 🤔*

---

[지난 포스트](https://microsoft.github.io/mcscatblog/posts/managing-spend-pay-as-you-go/)에서는 Azure Budgets, Automation Account<sup>1</sup>, Power Automate를 활용해 탄탄한 PAYG<sup>2</sup> 거버넌스 파이프라인을 구축했어요. 그리고 한계도 솔직하게 짚었어요. 가장 뼈아픈 한계는 다음과 같았어요.

> *어떤 개발자가 실수로 대용량 PDF를 무한 루프로 처리하는 플로우를 만들었다고 상상해 보세요. 그 플로우는 AI Builder 크레딧을 빠른 속도로 소진하기 시작하고, 이 솔루션은 심각한 피해가 발생하기 전에 이를 잡아내지 못해요. 예산 알림이 발동될 즈음에는 이미 초과 지출이 발생한 뒤예요.*

Azure Cost Management 데이터에는 8~24시간의 지연이 있고, 예산 알림도 주기적으로만 평가돼요. 비프로덕션 샌드박스에서 AI 엔드포인트를 마구 호출하는 폭주 플로우에게는 이 지연이 문제의 전부예요.

그러니 이 문제를 해결해 봐요. 그것도 Power Platform을 벗어나지 않고 말이에요.

이번 포스트에서는 실시간 PAYG 초과 지출 방지를 위한 **완전한 Power Platform 네이티브 솔루션**을 만들어요. Azure Automation Account도, 런북(runbook)도, Action Group<sup>3</sup>도 필요 없고, Azure 포털은 아예 열 필요가 없어요. 필요한 건 세 가지뿐이에요.

- 예약된 클라우드 플로우 하나
- Azure Cost Management API와 통신하는 커스텀 커넥터
- 연결 해제를 담당하는 Power Platform Admin V2 커넥터

작동 방식은 다음과 같아요.

---

## 핵심 아이디어

이전 포스트의 한계는 예산 알림이 느리다는 것 자체가 아니라, *왜* 느린가에 있었어요. Azure Budget 알림은 대략 **24시간에 한 번** 평가돼요. 비용 데이터가 이미 수집되고 몇 시간 전에 임계값을 넘어섰어도, 다음 평가 주기가 끝나기 전까지 알림은 뜨지 않아요. 이 24시간 주기가 이전 솔루션의 대응 속도를 가로막는 한계였어요.

Cost Management Query API는 이 한계를 없애요. Azure가 평가 주기를 돌리길 기다리는 대신, 우리가 원하는 일정에 맞춰 API를 직접 조회하면 돼요. 적절한 조회 주기는 Azure가 실제로 비용 데이터를 갱신하는 빈도, 즉 **4시간마다**로 정하면 돼요. 더 자주 폴링해도 같은 숫자만 읽을 뿐이고, 4시간마다 폴링하면 새 데이터가 생기는 순간마다 바로 대응할 수 있어요.

그 결과 탐지 시간이 최대 24시간에서 4시간으로 줄어들어요. 기반 데이터가 더 빨리 도착해서가 아니라, Azure의 평가 주기를 우리 자신의 평가 주기로 대체했기 때문이에요.

이 솔루션은 이를 4시간마다 도는 예약 클라우드 플로우로 감싸요. 플로우가 하는 일은 이래요.

- Cost Management Query API를 호출해 이번 달 누적 지출을 조회
- 결과를 사용자가 정한 임계값과 비교
- 임계값을 넘으면 청구 정책(billing policy)에서 모든 환경의 연결을 해제

범위(scope), 임계값, 실행 간격은 모두 플로우 변수라서, 가져오기(import) 후 코드를 건드리지 않고도 구성할 수 있어요.

> API 속도 제한, QPU<sup>4</sup> 할당량, 스로틀링 동작에 대한 자세한 내용은 [Azure Cost Management 자동화 제한 문서](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/manage-automation)를 참고하세요.

---

## 아키텍처 개요

| 구성 요소 | 역할 |
|---|---|
| **예약 클라우드 플로우** | 심장 박동 역할. 선택한 간격으로 실행되며 나머지 모든 것을 오케스트레이션해요. |
| **커스텀 커넥터 (Cost Management)** | Azure Cost Management Query API를 래핑해요. 지정된 범위의 이번 달 누적 지출을 반환해요. |
| **Power Platform Admin V2 커넥터** | 청구 정책을 나열하고, 연결된 환경을 조회하며, 임계값 초과 시 연결을 해제해요. |
| **플로우 변수** | 구독 ID, 리소스 그룹, 청구 정책 이름, 지출 임계값, 감사 로그를 보관해요. 외부 구성 저장소가 필요 없어요. |

전체가 하나의 Power Platform 솔루션으로 가져올 수 있어요. 환경 하나, 연결 설정 한 번이면 끝이에요.

---

## 사전 준비 사항

솔루션을 가져와 구성하기 전에 다음 항목들을 준비해야 해요.

### 1. Entra ID의 앱 등록(서비스 주체)

커스텀 커넥터는 Azure Resource Manager API(`https://management.azure.com/`)에 대해 인증해야 해요. 다음을 갖춘 앱 등록(App Registration)이 필요해요.

- **클라이언트 시크릿**(또는 인증서)
- 대상 구독 또는 리소스 그룹에 할당된 **Cost Management Reader** 역할

> **Admin V2 인증에 대한 참고:** Power Platform Admin V2 커넥터는 청구 정책 작업에 대해 서비스 주체 인증을 지원하지 *않으며*, **OAuth(위임된) 연결**이 필요해요. 즉 Admin V2 연결은 **Power Platform Admin**, **Global Admin**, 또는 **Dynamics 365 Admin** 역할을 가진 명명된 사용자 계정으로 실행돼요. 연결 자격 증명 계획을 이에 맞게 세우세요.

### 2. Power Automate 프리미엄 라이선스

커스텀 커넥터와 Power Platform Admin V2 커넥터 모두 프리미엄이라서, 플로우 소유자 계정에 프리미엄 라이선스가 필요해요. 플로우를 실행하는 계정에 적절한 라이선스가 있는지 확인하세요.

### 3. 구독 ID와 리소스 그룹

청구 정책과 연결된 Azure 구독 ID와 리소스 그룹 이름이 필요해요. 청구 정책을 설정할 때 사용했던 값과 동일하며, Cost Management API가 비용 쿼리의 범위를 지정할 때 사용하는 값이기도 해요.

### 4. 지출 임계값

어느 수준의 지출에서 연결을 끊을지 정하세요. 공식 Azure Budget과 똑같을 필요는 없고, 오히려 더 낮게 잡아야 해요. 이 솔루션은 배치 알림을 기다리지 않고 자주 확인하니까, 빠르게 잡아낼 거라는 확신을 갖고 임계값을 더 빠듯하게 설정해도 돼요.

---

## 구성 요소 1: Azure Cost Management용 커스텀 커넥터

Azure Cost Management Query API는 기본 제공 Power Automate 커넥터로 제공되지 않으므로 커스텀 커넥터로 래핑해요. 이 커넥터는 액션 하나짜리 단순한 커넥터예요. 비용 쿼리를 POST하고 결과를 돌려주는 게 전부예요.

### API 호출

```
POST https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.CostManagement/query?api-version=2025-03-01
```

### 요청 본문

```json
{
  "type": "ActualCost",
  "timeframe": "MonthToDate",
  "dataset": {
    "granularity": "Monthly",
    "aggregation": {
      "totalCost": {
        "name": "PreTaxCost",
        "function": "Sum"
      }
    }
  }
}
```

몇 가지 설명할 부분이 있어요.

- **`type: ActualCost`**<br>
  상각된 예약 비용이 아니라 실제로 청구된 금액을 반환해요. PAYG에서 중요한 숫자가 바로 이것이에요.
- **`timeframe: MonthToDate`**<br>
  이번 달 초부터 지금까지의 지출을 알려줘요. 청구 기간이 달력 월과 다르다면 `TheLastBillingMonth`를 쓰세요. 다만 동작에 편차가 있는 걸 본 적이 있으니 참고하세요. 옵션 목록은 [TimeFrame Type](https://learn.microsoft.com/en-us/rest/api/cost-management/query/usage?view=rest-cost-management-2025-03-01&tabs=HTTP#timeframetype)에서 확인할 수 있어요.
- **`granularity: Monthly`**<br>
  일별 세부 내역이 아니라 해당 기간의 단일 집계 값을 원한다는 뜻이에요. 응답이 단순해져요.
- **`aggregation`**<br>
  `PreTaxCost`의 합계를 요청하고, 이게 총 지출 금액으로 돌아와요.

### 응답

```json
{
  "properties": {
    "columns": [
      { "name": "PreTaxCost", "type": "Number" },
      { "name": "Currency", "type": "String" }
    ],
    "rows": [
      [ 4.72, "USD" ]
    ]
  }
}
```

비용 값은 `rows[0][0]`에 있어요. 플로우가 임계값과 비교하는 숫자가 바로 이것이에요.

### 인증

커스텀 커넥터는 Azure Active Directory에 대해 **OAuth 2.0**을 사용해요.

- **Authorization URL:** `https://login.microsoftonline.com/{tenantId}/oauth2/authorize`
- **Token URL:** `https://login.microsoftonline.com/{tenantId}/oauth2/token`
- **Resource / Audience:** `https://management.azure.com/`
- **Client ID와 Secret:** 앱 등록에서 가져와요

커넥터 연결은 한 번 생성하면 플로우에서 재사용돼요. 앱 등록에는 대상 구독 또는 리소스 그룹에 대해 최소한 **Cost Management Reader** 역할이 필요해요.

---

## 구성 요소 2: Power Platform Admin V2 커넥터와 청구 정책 목록 커스텀 커넥터

[Power Platform for Admins V2 커넥터](https://learn.microsoft.com/en-us/connectors/powerplatformadminv2/)는 환경을 식별하고 연결을 해제하는 데 필요한 액션을 제공해요. 여기서는 세 가지 액션이 사용돼요.

| 액션 | 하는 일 |
|---|---|
| **List Billing Policies** | 테넌트의 모든 청구 정책을 ID, 이름, 상태와 함께 반환해요 |
| **List Billing Policy Environments** | 청구 정책 ID를 받아 현재 연결된 모든 환경을 반환해요 |
| **Remove Billing Policy Environment** | 특정 환경을 청구 정책에서 연결 해제해요 |

이 커넥터는 **OAuth(위임된) 연결**을 사용하며, 명명된 사용자로 실행돼요. 해당 사용자는 Power Platform Admin, Global Admin, 또는 Dynamics 365 Admin 역할을 가지고 있어야 해요. 솔루션 환경에서 연결을 한 번 생성하면 이후 플로우 실행마다 재사용돼요.

커스텀 커넥터 Power Platform Billing Policy를 쓰면 테넌트 안의 모든 청구 정책을 나열할 수 있어서, [Power Platform for Admins V2 커넥터](https://learn.microsoft.com/en-us/connectors/powerplatformadminv2/)가 요구하는 청구 정책 ID를 쉽게 찾을 수 있어요.
이 커넥터가 포함된 솔루션은 여기서 받을 수 있어요: [Billing Policy Management](https://github.com/rranjit83/AgentDemoSamples/blob/main/CustomEngineBlogPosts/manage-paygo/solution/BillingPolicyManagement_1_0_0_3.zip)

---

## 플로우: `MonitorAndUnlinkOnOverage`

예약 플로우를 단계별로 살펴볼게요.

### 트리거: Recurrence

원하는 간격으로 실행되도록 트리거를 구성해요. 폭주 플로우가 발생할 가능성이 가장 높은 비프로덕션 샌드박스 환경이라면 1시간마다가 합리적인 시작점이에요. 더 세밀하게 제어하려면 15분 또는 30분마다 실행하세요.

```
Recurrence trigger
  Interval: 1
  Frequency: Hour
```

### 1단계: 변수 초기화

```
Initialize Variable — SubscriptionId     (String) → your subscription GUID
Initialize Variable — ResourceGroupName  (String) → your resource group name
Initialize Variable — BillingPolicyName  (String) → the policy name to protect
Initialize Variable — SpendThreshold     (Float)  → e.g. 5.00
Initialize Variable — OperationLog       (String) → ""
```

이 값들을 플로우 상단의 변수로 유지하면 가져오기 후 솔루션을 구성하기가 쉬워져요. 임계값 하나 바꾸려고 중첩된 액션을 뒤질 필요가 없어요.

### 2단계: 현재 지출 조회

변수에 저장해둔 구독 ID와 리소스 그룹 이름으로 커스텀 커넥터 액션을 호출하면, 커넥터가 Cost Management API에 POST 요청을 보내고 응답을 돌려줘요.

JSON 응답을 파싱해 지출 값을 추출해요.

```
Parse JSON — Body: [Cost Management connector output]
```

비용 추출: `first(body('Query_Cost')?['properties']?['rows'])?[0]`

이 식은 결과 집합의 첫 번째 행으로 이동해 첫 번째 열, 즉 `PreTaxCost` 합계를 가져와요.

### 3단계: 임계값과 비교

```
Condition: [Current Spend] is greater than [SpendThreshold]
```

false인 경우: OperationLog에 `"Spend check passed: $X of $Y threshold."`를 추가하고, 할 일이 없으니 플로우가 깔끔하게 종료돼요.

true인 경우: 연결 해제 단계로 진행해요.

### 4단계: 청구 정책 찾기

Admin V2 커넥터의 **List Billing Policies**를 호출하면 테넌트의 전체 정책 목록이 반환되는데, 여기서 `BillingPolicyName` 변수와 일치하는 정책을 필터로 찾아요.

```
Filter Array
  From: [List Billing Policies output] → value
  Condition: item()?['properties']?['displayName'] is equal to [BillingPolicyName]
```

첫 번째 일치 항목에서 정책 ID를 추출해요.

```
Set Variable — PolicyId = first(body('Filter_Policy'))?['name']
```

### 5단계: 모든 환경 나열 및 연결 해제

확인한 정책 ID로 **List Billing Policy Environments**를 호출하면, 그 정책에 현재 연결된 모든 환경이 반환돼요.

그런 다음 반복해요.

```
Apply to Each — [List Billing Policy Environments output] → value
  │
  ├─ Remove Billing Policy Environment
  │    Policy ID:      [PolicyId variable]
  │    Environment ID: items('Apply_to_each')?['environmentId']
  │
  └─ Append to OperationLog
       "Unlinked: [environmentId] from [BillingPolicyName]"
```

### 6단계: 감사 로그 반환

루프가 끝나면 플로우에는 수행한 모든 작업의 완전한 기록이 남아요. 조직에 맞는 곳으로 이 기록을 전달할 수 있어요.

- **Teams 채널에 게시** — 관리자 팀의 즉각적인 가시성 확보
- **이메일 발송** — 관리자 팀이 받은 편지함 알림을 선호하는 경우
- **SharePoint 목록에 기록** — 영구적이고 조회 가능한 감사 추적
- **세 가지 모두 수행** — 이것은 거버넌스가 적용된 프로덕션 시스템이에요. 증빙은 많을수록 좋아요

---

## 전체 흐름 한눈에 보기

```
Scheduled trigger fires (every hour)
        │
        ▼
Custom Connector: POST to Cost Management Query API
        │  subscriptionId + resourceGroupName + MonthToDate + ActualCost
        ▼
Parse response → extract PreTaxCost from rows[0][0]
        │
        ▼
Condition: Current spend > threshold?
        │
   No ──┘  (log "passed", flow ends)
        │
   Yes ──▶ Admin V2: List Billing Policies → filter by name → get policy ID
              │
              ▼
           Admin V2: List Billing Policy Environments → get all linked envs
              │
              ▼
           For each environment:
             Admin V2: Remove Billing Policy Environment
             Append to audit log
              │
              ▼
           Notify (Teams / Email / SharePoint)
              │
              ▼
Environments unlinked — overage stopped
```

## 이 방식이 Azure 접근법으로는 해결하지 못한 문제를 해결하는 이유

무한 루프 PDF 시나리오를 다시 떠올려 보세요. 폭주 플로우가 오전 9시 15분에 AI Builder 크레딧을 소진하기 시작해요. Azure Budget 방식이라면 가장 빨라야 Azure가 다음번에 예산 알림을 평가할 때, 즉 8~24시간 뒤에나 알 수 있어요.

이 솔루션에서는 다음 예약 실행(오전 10시)이 Cost Management를 조회해 급증을 감지하고 환경 연결을 해제해요. 최대 노출 시간은 폴링 간격 하나예요. 15분마다 실행되는 플로우라면 제동이 걸리기 전까지의 초과 지출은 15분어치에 불과해요.

이는 근본적으로 다른 위험 구조예요.

---

## 네이티브 접근법의 장단점

### 장점

| | |
|---|---|
| **Azure 인프라 불필요** | Automation Account도, 런북도, Action Group도 없어요. 솔루션 전체가 Power Platform 안에서 동작해요. |
| **폴링 주기 구성 가능** | 실행 간격을 직접 설정해요. 1시간마다, 30분마다, 15분마다 중에서 감수할 수 있는 위험 수준에 맞게 고르세요. |
| **가져오기 한 번, 환경 하나** | 솔루션 패키지 하나. 가져오고, 연결을 구성하고, 변수를 설정하면 끝이에요. |
| **Azure 전문 지식 불필요** | Power Platform 관리자가 Azure 포털을 열지 않고도 처음부터 끝까지 만들고 고치고 문제를 해결할 수 있어요. |
| **자체 문서화되는 감사 추적** | 모든 실행이 정상 통과 기록이나 전체 연결 해제 기록을 남겨요. 플로우 실행 기록이 곧 감사 추적이에요. |
| **급격한 지출 급증 감지** | Azure Budget 알림이 놓치는 폭주 플로우를 잡아내도록 설계됐어요. |

### 단점

| | |
|---|---|
| **Cost Management 데이터에는 여전히 지연이 있음** | API가 반환하는 데이터는 일반적으로 실시간보다 4~8시간 뒤처져요. 8~24시간의 예산 알림 지연보다는 낫지만 즉각적이지는 않아요. 2시간 안에 크레딧을 소진하는 플로우는 다음 폴링이 감지하기 전에 이미 완료될 수도 있어요. |
| **프리미엄 라이선스 필요** | 커스텀 커넥터와 Admin V2 커넥터 모두 플로우 소유자 계정에 Power Automate 프리미엄 라이선스가 필요해요. |
| **Admin V2용 OAuth 연결** | 청구 정책 연결 해제는 서비스 주체가 아니라 관리자 권한을 가진 명명된 사용자로 실행되어야 해요. 이 연결 자격 증명은 관리(비밀번호 교체, 계정 수명 주기)가 필요해요. |
| **폴링 비용** | 모든 예약 실행이 Cost Management API를 호출해요. 1시간 주기라면 모니터링 대상 정책당 월 720회 호출이에요. 일반적인 Azure API 제한 안에 충분히 들어가지만 알아둘 가치는 있어요. |
| **푸시가 아닌 풀 방식** | 이것은 이벤트 기반이 아닌 폴링 아키텍처예요. 폴링 간격만큼의 최대 지연을 감수해야 해요. 재앙적인 폭주 시나리오에 대비해 수동 긴급 연결 해제 옵션을 함께 두는 것이 좋을 수 있어요. |

---

## 두 포스트를 통해 얻은 것

한 걸음 물러서서 보면, 이제 상호 보완적인 두 가지 도구를 갖게 되었어요.

- **이전 포스트의 Azure 기반 파이프라인.**<br>
  검증됐고, 이벤트 기반이며, 엔터프라이즈급이에요. Azure Cost Management 자산과 통합된 공식 예산 거버넌스를 원하는 프로덕션 환경에 가장 잘 맞아요.
- **이번 포스트의 Power Platform 네이티브 솔루션.**<br>
  빠르고, 자체 완결적이고, 오버헤드가 낮아요. 폭주 개발 플로우의 위험이 가장 크고, Azure 관리자가 아니라 Power Platform 관리자가 가드레일을 쥐길 원하는 비프로덕션·샌드박스 환경에 가장 잘 맞아요.

이 둘은 상호 배타적이지 않아서, 많은 조직이 둘 다 함께 운영할 거예요. Azure Budget 알림을 공식 거버넌스 계층으로, 예약 플로우를 가장 필요한 환경을 위한 신속 대응 안전망으로 활용하는 것이에요.

---

> **참고:** 이 블로그는 Cost Management API를 활용하는 여러 방법 중 하나를 보여줘요. "이를 위한 293단계"식 설명이 아니라 개념 수준에서 이야기하려고 최선을 다했어요. 마지막 힌트 하나: QueryDataSet의 매개변수를 변경하면 ResourceID별 실제 비용을 조회할 수 있고, 청구 정책별 실제 내역도 가져올 수 있어요!!!

이게 전부예요. 보조 바퀴는 이제 뗐어요! 행운을 빌어요, 스파이더맨!

---
*이 글에서 참조한 커스텀 커넥터 정의, 솔루션 패키지, 변수 구성 가이드는 함께 제공되는 리포지토리에서 확인할 수 있어요. 언제나 그렇듯 먼저 비프로덕션 환경에서 테스트하세요. 공교롭게도 이 솔루션이 보호하도록 설계된 환경이 바로 그런 환경이에요.*

---

## 어휘 주석

1. **Automation Account:** Azure에서 스크립트(런북)를 예약하거나 이벤트에 반응해 자동으로 실행시키는 Azure 리소스.
2. **PAYG(Pay-As-You-Go):** 정액 약정 없이 실제 사용한 만큼만 요금을 내는 종량제 방식.
3. **Action Group:** Azure Monitor 알림이 발동됐을 때 이메일·Webhook 등 특정 동작을 실행하도록 묶어둔 설정.
4. **QPU(Query Processing Unit):** Cost Management API 호출량을 세는 단위. 정해진 할당량을 넘으면 요청이 제한(스로틀링)돼요.

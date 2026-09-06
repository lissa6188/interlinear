---
title: 'DEV에서 PROD까지: Copilot Studio 에이전트를 Teams와 Microsoft 365 Copilot에 배포하기'
description: 'Copilot Studio 에이전트를 Teams와 Microsoft 365 Copilot에 배포하는 세 가지 경로와 환경 구분, 자동 설치·고정 설정 방법을 정리했어요.'
date: 2026-09-07
tags: ["Copilot Studio", "Teams", "M365 Copilot", "배포", "ALM"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/teams-dev-to-prod/card-01.png
  - /cards/teams-dev-to-prod/card-02.png
  - /cards/teams-dev-to-prod/card-03.png
  - /cards/teams-dev-to-prod/card-04.png
  - /cards/teams-dev-to-prod/card-05.png
  - /cards/teams-dev-to-prod/card-06.png
  - /cards/teams-dev-to-prod/card-07.png
  - /cards/teams-dev-to-prod/card-08.png
---

> **원문:** [From DEV to PROD: Deploying Copilot Studio Agents to Teams and Microsoft 365 Copilot](https://microsoft.github.io/mcscatblog/posts/copilot-studio-teams-deployment/)
> **게시일:** 2026-04-07 · **저자:** Henry Jammes

## 정체성의 위기

Copilot Studio 에이전트를 만들고 솔루션 내보내기/가져오기로 [환경 간 승격](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-solutions-import-export)을 마쳤어요. DEV, TEST, PROD까지요. 그리고 각각을 Teams에 배포했어요. 개발자와 테스터가 Microsoft Teams를 열어보니, 모두 "Support Agent"라는 이름의 똑같은 파란색 아이콘이 세 개나 보여요.

어느 게 프로덕션일까요? 테스트해야 할 DEV 인스턴스는 어느 걸까요?

아무도 몰라요.

이건 검색성(discoverability) 문제가 아니라 ALM(Application Lifecycle Management, 애플리케이션 수명 주기 관리) 문제예요. Copilot Studio의 원클릭 Teams 배포는 에이전트가 어느 환경에 있든 이름도, 아이콘도, 설명도, 매니페스트<sup>1</sup>도 똑같이 만들어요.

해결책은 뭘까요? 에이전트를 서로 구분하고, Teams 사이드바에서의 배포, 자동 설치, 고정(pinning)을 정밀하게 제어할 수 있는 환경 기반 배포 전략이에요.

> **팁:** **업데이트(2026년 4월):** 이제 Copilot Studio에는 이 정체성 위기에 대한 기본 제공 해답이 있어요. [채널 표시 이름 접미사(Channel display name suffix)](https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-agent-display-name-suffix) 기능(프리뷰)을 쓰면 Teams와 M365 Copilot에서 에이전트 표시 이름에 환경 변수를 추가할 수 있어서, "Support Agent"가 환경에 따라 자동으로 "Support Agent (DEV)"나 "Support Agent (TEST)"가 돼요. 매니페스트 편집이 전혀 필요 없어요. 환경 구분만 필요하다면 여기서 시작하세요. 이 글에서 다루는 매니페스트 커스터마이징 방식은 추가 브랜딩(커스텀 아이콘, 강조 색상)이 필요하거나 Teams 앱 패키지를 완전히 제어해야 하는 시나리오에서 여전히 쓸모 있어요.

> **참고:** 아직 에이전트를 Teams에 최적화하지 않았다면, 재설치, 비활성 처리, 오류 처리, 진단 카드 등 프로덕션 패턴을 다루는 [Teams를 위한 Copilot Studio 에이전트 설계 (테스트 채팅은 너무 쉬웠으니까)](https://microsoft.github.io/mcscatblog/posts/copilot-studio-teams-agent-patterns/)부터 시작하세요.

## 표준 배포가 부족한 이유

Copilot Studio의 [원클릭 Teams 배포](https://learn.microsoft.com/microsoft-copilot-studio/publication-add-bot-to-microsoft-teams)는 단일 환경 시나리오에서는 훌륭하게 동작해요. "Add to Teams"를 클릭하고 게시하면 끝이에요. 하지만 다음은 고려하지 못해요.

- **환경 구분.**<br>
  DEV, TEST, PROD 에이전트가 똑같이 보여요 (새로운 [표시 이름 접미사 기능](https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-agent-display-name-suffix)이 바로 이 문제를 풀어줘요 — 위의 참고 사항을 확인하세요)
- **Teams 앱 배포.**<br>
  [Copilot Studio에서의 공유](https://learn.microsoft.com/microsoft-copilot-studio/admin-share-bots)는 누가 에이전트와 채팅할 수 있는지는 제어하지만, Teams 앱 자체는 제어하지 못해요. 누가 앱을 보는지, 어디에 고정되는지, 자동 설치되는지 여부요
- **전문적인 롤아웃.**<br>
  자동 설치나 고정 기능이 없어요

근본 원인은 뭘까요? Copilot Studio가 만드는 [Teams 앱 매니페스트](https://learn.microsoft.com/microsoftteams/platform/resources/schema/manifest-schema)가 환경에 무관(environment-agnostic)하다는 점이에요. DEV, TEST, PROD를 구분하지 못해요.

## 세 가지 배포 경로 이해하기

Copilot Studio 에이전트를 Teams에 배포하는 데는 **세 가지 서로 다른 배포 경로**가 있고, 누가 작업하는지(메이커 vs 관리자)와 요구되는 거버넌스 수준에 따라 달라져요.

### 배포 경로 비교

| 항목 | 옵션 1: 직접 설치 | 옵션 2: 메이커 제출 | 옵션 3: 관리자 주도 |
|--------|-------------------------|---------------------------|---------------------|
| **적합한 용도** | 개발, 테스트 | 통제된 롤아웃, QA | 프로덕션, 최대 제어 |
| **거버넌스** | 낮음 | 중간 | 높음 |
| **속도** | 가장 빠름 | 보통 | 느림 |
| **승인** | 없음 | 관리자 필요 | 관리자 제어 |
| **시작 주체** | 사용자 또는 메이커 | 메이커 | 관리자 |
| **자동 설치** | 불가 | **가능** (관리자 승인 후) | **가능** |
| **고정** | 불가 | **가능** (관리자 승인 후) | **가능** |
| **매니페스트 제어** | 전체 (사이드로딩) | 제한적 | 전체 |

각 경로를 자세히 볼게요.

### 옵션 1: 직접 설치 (사용자 수준)

> **참고:** **적합한 용도:** 개발, 테스트, 제한된 배포
> **거버넌스 수준:** 낮음 • **속도:** 가장 빠름 • **승인:** 없음

아래 두 가지 방법 모두 [사이드로딩(sideloading)](https://learn.microsoft.com/microsoftteams/platform/concepts/deploy-and-publish/apps-upload)이라서, 테넌트에서 [사용자 지정 앱 정책이 켜져 있어야](https://learn.microsoft.com/en-us/microsoftteams/teams-custom-app-policies-and-settings) 해요.

> **주의:** 사이드로딩이 꺼져 있으면 사용자에게 "Upload a custom app" 옵션이 안 보이고, 조직의 앱 권한 정책에 따라 "See agent in Teams" 흐름도 막힐 수 있어요.

**방법 A: Copilot Studio에서 ("See agent in Teams")**
- Copilot Studio에서 "See agent in Teams" 클릭
- Teams에서 사이드로딩 환경이 바로 열림
- 에이전트는 Copilot Studio 설정의 기본 이름과 아이콘을 사용
- 이 방법에서는 매니페스트 커스터마이징 불가

**방법 B: 수동 업로드**
- Copilot Studio에서 매니페스트 .zip 다운로드
- 매니페스트 커스터마이징 (이름, 아이콘, 색상)
- Teams → 앱(Apps) → "Upload a custom app"으로 업로드
- 커스텀 브랜딩이 필요한 **DEV 환경에 권장**

두 경우 모두, 에이전트를 다른 사람과 공유하려면 앱 링크를 보내야 해요. 이 경로에서는 조직 전체 배포가 불가능해요.

### 옵션 2: 메이커 제출 (승인 워크플로)

> **참고:** **적합한 용도:** 통제된 롤아웃, QA 검증, TEST 환경
> **거버넌스 수준:** 중간 • **속도:** 보통 • **승인:** 관리자 필요

메이커가 Copilot Studio에서 **"Submit to your org"**로 에이전트를 게시하는 방식이에요.

**작동 방식:**
1. Copilot Studio → 채널(Channels) → Microsoft Teams
2. **"Submit to your org"** 클릭
3. Teams 관리자에게 요청 생성 (즉시 배포되지 않음)
4. 앱이 사용 가능해지기 전에 관리자가 검토 및 승인
5. 승인되면 조직 앱 카탈로그에 표시

**특징:**
- 공식적인 승인 워크플로
- 앱 속성(이름, 아이콘, 색상)은 Copilot Studio에서 구성
- 메이커가 시작하고 관리자가 승인
- 이 흐름에서는 .zip 매니페스트 직접 편집 불가
- 승인 후에는 관리자가 설정 정책(Setup Policies)으로 자동 설치와 고정을 구성 가능 (옵션 3과 동일)

메이커 주도 배포의 표준적인 거버넌스 경로예요. 메이커의 자율성과 관리 감독 사이의 균형을 줘요. 그리고 옵션 1과 달리, 앱이 조직 카탈로그에 등록되면 관리자는 옵션 3과 똑같은 자동 설치와 고정 기능을 쓸 수 있어요.

**문서:** [Teams 앱 스토어에 에이전트 표시](https://learn.microsoft.com/microsoft-copilot-studio/publication-add-bot-to-microsoft-teams#show-an-agent-in-the-teams-app-store-or-in-the-microsoft-365-agent-store)

### 옵션 3: 관리자 주도 배포 (수동 업로드)

> **팁:** **적합한 용도:** 프로덕션 롤아웃, 최대 제어, 자동 설치 + 고정

> **거버넌스 수준:** 높음 • **속도:** 느림 • **승인:** 관리자 제어

프로덕션 환경을 위한 핵심 배포 경로예요. Teams 관리자가 [Teams 관리 센터(Teams Admin Center)](https://admin.teams.microsoft.com)로 앱을 직접 업로드하고 배포하면서, 강력한 배포 기능을 활용할 수 있어요.

**작동 방식:**
1. 메이커가 Copilot Studio에서 Teams 앱 매니페스트(.zip) 다운로드
2. **선택 사항:** 업로드 전 매니페스트 수정 (이름, 아이콘, 색상, 버전)
3. 관리자가 Teams 관리 센터 → 앱 관리(Manage apps)에 업로드

**관리자 기능:**
- 조직 전체 또는 특정 보안 그룹 대상으로 배포
- 설정 정책으로 **앱 고정** (사이드바에 자동으로 표시)
- 대상 사용자 그룹에 **자동 설치** (수동 작업 불필요)
- 가용성과 배포 시점을 완전히 제어

*Teams 관리 센터 - 사용자 지정 앱 업로드 대화 상자*

프로덕션 롤아웃을 위한 가장 통제되고 확장 가능한 옵션이에요. 자동 설치와 고정 기능은 사용자 경험을 완전히 바꿔놔요. 사용자에게 에이전트를 검색해서 설치하라고 안내하는 대신, 에이전트가 Teams 사이드바에 이미 있어서 바로 쓸 수 있어요.

**문서:**
- [Teams에 에이전트 설치](https://learn.microsoft.com/microsoft-copilot-studio/publication-add-bot-to-microsoft-teams#install-an-agent-in-teams-and-microsoft-365-copilot)
- [Teams 사용자 지정 앱 정책](https://learn.microsoft.com/microsoftteams/teams-custom-app-policies-and-settings)

## DEV 및 TEST를 위한 매니페스트 커스터마이징

> **참고:** **기본 제공 방식을 먼저 고려하세요.** Copilot Studio의 [채널 표시 이름 접미사](https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-agent-display-name-suffix)(프리뷰)는 환경 구분을 기본으로 처리해줘요. 문자열 환경 변수를 접미사로 구성하면 Teams와 M365 Copilot에서 에이전트 표시 이름이 환경별로 자동 업데이트돼요. 매니페스트 편집도, 재패키징도 필요 없어요. 아래의 수동 매니페스트 커스터마이징은 접미사 기능이 다루지 않는 커스텀 아이콘, 강조 색상 등 더 많은 것이 필요할 때 여전히 쓸모 있어요.

DEV와 TEST 환경에서는 Teams 앱 매니페스트를 커스터마이징해서 프로덕션과 구분할 수도 있어요. 이렇게 하면 혼란을 막고, 사용자가 어느 환경에서 작업 중인지 바로 알 수 있어요.

### 1단계: 매니페스트 다운로드

1. Copilot Studio에서 **설정(Settings) → 채널(Channels)**로 이동
2. **Microsoft Teams** 선택
3. 아직 추가하지 않았다면 "Add channel"을 클릭하고 게시
4. **설정 → 채널 → Microsoft Teams → 가용성 옵션(Availability options)**으로 이동
5. **"Download manifest"** 클릭 (.zip 파일 다운로드)

> **참고:** 매니페스트 .zip 파일이 곧 배포 패키지예요. DEV/TEST라면 업로드 전에 커스터마이징하세요. 자동 설치/고정이 필요한 PROD라면 옵션 3(관리자 주도 배포)을 쓰세요.

### 2단계: 압축 해제 및 검토

.zip 파일을 풀면 파일이 세 개 있어요.

```
manifest.zip/
├── manifest.json      # App configuration
├── color.png          # Full-color icon (192x192 px)
└── outline.png        # Outline icon (32x32 px)
```

### 3단계: 환경에 맞게 커스터마이징

manifest.json 파일에는 Teams가 에이전트를 표시할 때 쓰는 모든 메타데이터가 들어 있어요. 커스터마이징할 항목은 다음과 같아요.

*"(DEV)" 접미사와 커스텀 강조 색상이 적용된 manifest.json*

```json
{
  "name": {
    "short": "B2E Agent (DEV)",
    "full": "B2E Agent - Development Environment"
  },
  "description": {
    "short": "Sample agent optimized for Teams",
    "full": "Agent instructions and topics are optimized for both Microsoft Teams and Microsoft 365 Copilot channels."
  },
  "accentColor": "#FFD700",
  "version": "1.0.2"
}
```

**주요 변경 사항:**
- short name에 `(DEV)` 접미사 추가
- 커스텀 강조 색상 (DEV는 노란색/골드)
- 버전 번호 증가

커스터마이징할 수 있는 매니페스트 속성 전체 목록(개발자 정보, 아이콘, 권한 등)은 [Microsoft 365 앱 매니페스트 스키마 참조](https://learn.microsoft.com/en-us/microsoft-365/extensibility/schema/)를 확인하세요.

### 4단계: 재패키징

1. 세 파일(manifest.json, color.png, outline.png)을 모두 선택
2. 새 .zip 파일로 압축
3. **중요:** 파일이 하위 폴더가 아니라 루트 레벨에 있어야 해요

> **주의:** 파일은 하위 폴더에 중첩되지 않고 .zip의 루트 레벨에 있어야 해요. Teams는 잘못된 구조의 패키지를 거부해요.

**구조 확인:**
```
manifest_dev.zip/
├── manifest.json
├── color.png
└── outline.png
```

## Copilot Studio에서의 공유 구성

배포 전에 Copilot Studio에서 에이전트가 올바른 사용자와 공유되어 있는지 확인하세요.

*Copilot Studio - 보안 그룹과 에이전트 공유*

### 권장: 보안 그룹 사용

환경별로 [Entra ID 보안 그룹](https://learn.microsoft.com/entra/fundamentals/how-to-manage-groups)을 만드세요.
- `B2E Agent Security Group (DEV)` - 메이커, 개발자
- `B2E Agent Security Group (TEST)` - QA 팀, 이해관계자
- `B2E Agent Security Group (PROD)` - 모든 최종 사용자

### Copilot Studio에서 구성

1. 설정 → 보안(Security) → 공유(Share)
2. **Specific people or groups** 선택
3. 해당 보안 그룹 추가
4. 권한 수준 설정 (최종 사용자는 "Viewer")

> **팁:** 조직 앱 카탈로그에 게시할 때는 관리자가 앱을 보고 승인할 수 있도록 공유를 **"Everyone in my organization"**으로 설정해야 해요. 관리자는 여전히 Teams 관리 센터와 M365 관리 센터 정책으로 노출 범위를 제한할 수 있어요.

## 프로덕션의 마법: 자동 설치와 고정

여기가 옵션 3(관리자 주도 배포)이 진짜 빛나는 지점이에요. Teams 관리 센터의 설정 정책(Setup Policies)은 **자동 설치**와 **고정**을 가능하게 해서, 에이전트를 "사용자가 찾아야 하는 것"에서 "이미 거기에 있는 것"으로 바꿔놔요.

자동 설치와 고정을 쓰면 정책을 한 번만 구성해도 대상 사용자에게 에이전트가 자동으로 나타나요. 설치 안내도, 지원 티켓도 필요 없어요.

### 1단계: 가용성 구성

관리자가 Teams 관리 센터로 이동해요.

*Teams 관리 센터 - 보안 그룹을 대상으로 가용성 편집*

**가용성 구성:**
1. Teams 관리 센터 → Teams 앱 → 앱 관리(Manage apps)
2. 업로드된 앱을 찾아 클릭
3. **"Users and groups"** 탭 또는 **"Edit availability"** 클릭
4. **"Specific users or groups"** 선택
5. 대상 보안 그룹 추가 (예: "B2E Agent Security Group (PROD)")
6. **적용(Apply)**

이 설정은 누가 앱을 보고 설치할 수 있는지를 제어해요.

### 2단계: 자동 설치와 고정을 위한 설정 정책 생성

자동화된 배포를 가능하게 하는 핵심 단계예요.

*자동 설치(Installed apps)와 고정(Pinned apps) 구성을 보여주는 설정 정책*

**설정 정책 생성:**
1. **Teams 앱 → 설정 정책(Setup policies)**으로 이동
2. **"Add"**를 클릭해 새 정책 생성
3. **정책 이름:** "B2E Agent Auto-Install"
4. **Installed apps 섹션:**
   - **"Add apps"** 클릭
   - "B2E Agent" 검색
   - 선택 → **Add** 클릭
   - 이렇게 하면 **자동 설치**가 켜져요 (사용자 작업 불필요)
5. **Pinned apps 섹션:**
   - **"Add apps"** 클릭
   - "B2E Agent" 검색
   - 선택하고 위치 설정 (예: 5번 위치)
   - **Add** 클릭
   - 이렇게 하면 **앱이 사이드바에 고정**돼요
6. 정책 **저장(Save)**

> **팁:** "Installed apps" 섹션은 에이전트를 자동 설치해요. "Pinned apps" 섹션은 지정한 위치의 사이드바에 앱을 놓아요.

### 3단계: 대상 사용자 그룹에 정책 할당

*B2E Agent Security Group (DEV)에 설정 정책 할당*

**정책 할당:**
1. **Setup policies**에서 해당 정책 선택
2. **"Group policy assignment"** 클릭 (개별 할당보다 권장)
3. 대상 보안 그룹 선택 (예: "B2E Agent Security Group (PROD)")
4. 순위 설정 (여러 정책이 있는 경우)
5. **적용(Apply)**

**전파:** 전체 롤아웃까지 최대 24시간이 걸릴 수 있어요. 사용자는 Teams에서 로그아웃 후 다시 로그인해서 설치를 앞당길 수 있어요.

### 사용자 경험

사용자 입장에서는 이렇게 흘러가요.
1. 사용자가 "B2E Agent Security Group (PROD)"에 속함
2. 정책이 전파됨 (또는 로그아웃/로그인)
3. Teams 클라이언트 새로 고침
4. 구성된 위치의 사이드바에 에이전트가 고정되어 나타남
5. **사용자 작업 전혀 불필요**

이게 바로 전문적이고 엔터프라이즈급인 배포예요. 교육도, 지원 티켓도, 혼란도 필요 없어요.

## Microsoft 365 Copilot에 배포하기

에이전트는 Teams와 함께 [Microsoft 365 Copilot](https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-add-bot-to-microsoft-teams)에서도 쓸 수 있어요. 그리고 사용자에게 Microsoft 365 Copilot 라이선스가 필요 없어요 — [Copilot Chat이면 충분해요](https://microsoft.github.io/mcscatblog/posts/no-copilot-license-m365-channel/).

*M365 관리 센터 - 특정 사용자/그룹 옵션이 있는 에이전트 가용성*

**M365 Copilot 배포:**

1. **M365 관리 센터 접근**
   - Microsoft 365 관리자와 협업
   - **Settings → Integrated apps → Agents**로 이동

2. **에이전트 가용성 구성**
   - 에이전트 레지스트리에서 에이전트 찾기
   - 클릭해서 에이전트 세부 정보 열기
   - **"Available to"** 탭으로 이동
   - **Specific users/groups** 선택 (권장)
   - 대상 보안 그룹 추가
   - **Update**

3. **배포 및 고정 (선택 사항)**
   - **Deploy** 옵션: 대상 사용자에게 자동 배포
   - **Pin for users** 옵션: M365 Copilot의 에이전트 선택기에 에이전트 표시

M365 관리 센터는 Teams와 비슷한 배포 제어를 줘서 두 채널 모두에서 일관된 거버넌스를 보장해요.

> **주의:** Teams와 Microsoft 365 Copilot은 런타임 동작이 다른, 본질적으로 서로 다른 채널이에요. 한 채널에서 에이전트가 잘 평가된다고 해서 다른 채널에서도 똑같이 동작할 거라고 넘겨짚지 마세요. 두 채널에서 각각 테스트하고 검증하세요.

**문서:** [M365 관리 센터의 에이전트 레지스트리](https://learn.microsoft.com/microsoft-365/admin/manage/manage-plugins-for-copilot-in-integrated-apps)

## 에이전트 업데이트: 런타임 변경 vs 매니페스트 변경

효율적으로 운영하려면 업데이트 유형을 구분해서 알아둬야 해요.

### 런타임 업데이트 (매니페스트 변경 없음)

**대상:** 에이전트 동작 변경 (오케스트레이션, 지침, 지식, 작업, 토픽)

**절차:**
1. Copilot Studio에서 변경
2. **Publish** 클릭
3. 배포된 모든 채널에 변경 사항 자동 반영
4. **재배포 불필요**

**소요 시간:** 몇 분 내에 업데이트 반영

이게 Copilot Studio 아키텍처의 아름다운 점이에요. 동작 변경은 매니페스트나 관리 센터를 건드리지 않고도 모든 환경에 바로 배포돼요.

### 매니페스트 업데이트 (이름, 아이콘, 설명, 버전)

**대상:** 앱이 Teams에 표시되는 방식 변경

**절차:**
1. `manifest.json`을 업데이트하고 **버전 번호 증가**
2. 필요하면 아이콘 업데이트
3. .zip으로 재패키징
4. Teams 관리 센터에 새 버전으로 업로드
5. Teams가 더 높은 버전 번호를 업그레이드로 인식

> **주의:** Teams가 업그레이드로 인식하려면 버전 번호가 더 높아야 해요. 시맨틱 버저닝을 쓰세요: 1.0.0 → 1.0.1 (패치), 1.1.0 (마이너), 2.0.0 (메이저).

## 프로덕션 배포 체크리스트

모든 프로덕션 배포에 이 체크리스트를 활용하세요.

**배포 전:**
- [ ] Copilot Studio(PROD 환경)에서 에이전트 게시 완료
- [ ] DEV 및 TEST 환경에서 에이전트 테스트 완료
- [ ] Copilot Studio에서 대상 보안 그룹과 에이전트 공유 완료
- [ ] Copilot Studio에서 매니페스트 다운로드 완료
- [ ] 매니페스트 검토 완료 (이름, 설명, 아이콘, 버전)

**Teams 관리 센터:**
- [ ] Teams 관리 센터에 매니페스트 업로드 완료
- [ ] 앱 상태를 "Allowed"로 설정
- [ ] 대상 보안 그룹에 대한 앱 가용성 구성 완료
- [ ] 설명적인 이름으로 설정 정책 생성 완료
- [ ] 정책에서 자동 설치 활성화 (Installed apps 섹션)
- [ ] 정책에서 고정 구성 완료 (Pinned apps 섹션, 위치 설정)
- [ ] 대상 보안 그룹에 정책 할당 완료

**검증:**
- [ ] 테스트 사용자로 확인 (로그아웃/로그인 후 앱이 고정되어 나타남)
- [ ] Teams에서 에이전트가 올바르게 응답하는지 확인
- [ ] Microsoft 365 Copilot에서 에이전트가 올바르게 응답하는지 확인 (해당하는 경우 — Teams와 M365 Copilot은 다르게 동작함)
- [ ] [충돌하는 설정 정책](https://learn.microsoft.com/en-us/microsoftteams/policy-assignment-overview)이 없는지 확인 — 정책은 누적되지 않으며, 가장 높은 순위의 그룹 할당이 우선함

**커뮤니케이션:**
- [ ] 최종 사용자에게 새 에이전트 가용성 안내 완료
- [ ] 지원 팀에 에이전트 기능 교육 완료
- [ ] 에이전트 세부 정보로 문서 업데이트 완료

## 마무리

Copilot Studio는 누구나 대화형 에이전트를 만들 수 있게 해주지만, 프로덕션 배포에는 전략이 필요해요. 세 가지 배포 경로 — 직접 설치, 메이커 제출, 관리자 주도 — 는 각각 서로 다른 거버넌스 요구를 채워줘요.

- **옵션 1**은 메이커에게 개발을 위한 속도와 유연성을 줘요
- **옵션 2**는 통제된 릴리스를 위한 승인 워크플로를 더해요
- **옵션 3**은 자동 설치와 고정을 갖춘 전문적이고 엔터프라이즈급인 배포를 가능하게 해요

진짜 차별화 요소는 옵션 3의 설정 정책이에요. 에이전트를 사용자 사이드바에 자동 설치하고 고정할 수 있으면, 도입 과정이 "이 도구를 찾아서 설치하세요"에서 "이미 설치되어 있는 도구예요"로 바뀌어요.

그리고 새로운 [채널 표시 이름 접미사](https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-agent-display-name-suffix) 기능(프리뷰) 덕분에 환경 구분은 더 쉬워졌어요. 환경 변수를 한 번만 구성하면 DEV, TEST, PROD 전반에서 에이전트 표시 이름이 자동으로 업데이트되고, 매니페스트 편집이 필요 없어요. 추가 브랜딩(커스텀 아이콘, 강조 색상)이 필요하다면 매니페스트 커스터마이징 방식이 여전히 유효해요.

**Copilot Studio 에이전트에서 어떤 배포 과제를 겪으셨나요?** 아래에 댓글을 남겨 주세요. 여러분의 조직에서 환경 전략과 배포를 어떻게 다루고 있는지 듣고 싶어요.

프로덕션에 배포하기 전에, 여기서 다룬 ALM 전략을 보완하는 대화 설계 관련 UX 수준 가이드인 Remi Dyon의 [Teams에서 에이전트 배포 모범 사례](https://microsoft.github.io/mcscatblog/posts/copilot-studio-teams-deployment-ux/)를 읽어볼 가치가 있어요. 에이전트가 라이브 상태가 되고 사용자가 문제를 겪기 시작하면, [에이전트와 채팅할 때 대화 ID를 얻는 방법](https://microsoft.github.io/mcscatblog/posts/conversationid-users/)에 대한 명확한 절차가 지원 티켓에서 많은 왕복 커뮤니케이션을 줄여줘요. 그리고 PROD로 승격하기 전에 여러 환경에서 에이전트 동작을 체계적으로 검증하는 방법이 필요하다면, ALM 파이프라인을 하나로 묶는 테스트와 거버넌스 도구를 다루는 [Copilot Studio Kit: 테스트 자동화를 넘어서](https://microsoft.github.io/mcscatblog/posts/copilot-studio-kit/)를 참고하세요.

## 관련 리소스

**배포 문서:**
- [Teams 및 M365 Copilot에 에이전트 설치](https://learn.microsoft.com/microsoft-copilot-studio/publication-add-bot-to-microsoft-teams#install-an-agent-in-teams-and-microsoft-365-copilot)
- [사용자 지정 앱 업로드](https://learn.microsoft.com/microsoftteams/platform/concepts/deploy-and-publish/apps-upload)
- [Teams 앱 스토어에 에이전트 표시](https://learn.microsoft.com/microsoft-copilot-studio/publication-add-bot-to-microsoft-teams#show-an-agent-in-the-teams-app-store-or-in-the-microsoft-365-agent-store)
- [Teams 사용자 지정 앱 정책](https://learn.microsoft.com/microsoftteams/teams-custom-app-policies-and-settings)
- [앱 설정 정책 관리](https://learn.microsoft.com/microsoftteams/teams-app-setup-policies)

**매니페스트 문서:**
- [Teams 앱 매니페스트 스키마](https://learn.microsoft.com/microsoftteams/platform/resources/schema/manifest-schema)
- [환경 간 에이전트 식별을 위한 표시 이름 접미사 추가 (프리뷰)](https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-agent-display-name-suffix)

**관리자 문서:**
- [그룹에 정책 할당](https://learn.microsoft.com/microsoftteams/assign-policies-users-and-groups)
- [M365 관리 센터의 에이전트 레지스트리](https://learn.microsoft.com/microsoft-365/admin/manage/manage-plugins-for-copilot-in-integrated-apps)

---

## 어휘 주석

1. **매니페스트(manifest):** 앱의 이름, 아이콘, 설명, 권한 등 Teams가 앱을 인식하고 표시하는 데 필요한 정보를 담은 설정 파일.

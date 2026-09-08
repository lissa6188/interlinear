---
title: 'Snowflake를 Copilot Studio에 연결하기: 단계별 가이드'
description: 'Snowflake를 Copilot Studio 지식 소스로 연결해 실시간 데이터로 답하는 에이전트를 만드는 방법을 소개해요. Azure 설정부터 흔한 실수까지 정리했어요.'
date: 2026-09-08
tags: ["Snowflake", "Copilot Studio", "지식 소스", "Azure 앱 등록", "OAuth"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/snowflake-connect-guide/card-01.png
  - /cards/snowflake-connect-guide/card-02.png
  - /cards/snowflake-connect-guide/card-03.png
  - /cards/snowflake-connect-guide/card-04.png
  - /cards/snowflake-connect-guide/card-05.png
  - /cards/snowflake-connect-guide/card-06.png
  - /cards/snowflake-connect-guide/card-07.png
---

> **원문:** [Connecting Snowflake to Copilot Studio: Step-by-Step Guide](https://microsoft.github.io/mcscatblog/posts/connecting-snfl-to-mcs/)
> **게시일:** 2025-12-15 · **저자:** Hazim SharafelDin

## 개요

Snowflake를 Copilot Studio의 지식 소스로 연결하면, 데이터를 복제하거나 별도의 ETL<sup>1</sup>을 구축하지 않고도 자연어 에이전트를 통해 데이터를 실시간으로 조회할 수 있어요. Copilot은 Snowflake 테이블을 일급 데이터 소스로 취급할 수 있으며, 에이전트가 실시간 데이터를 기반으로 질문에 답하고, 분석을 실행하고, 워크플로를 구동할 수 있게 돼요.

## 연결 방법

에이전트를 Snowflake에 연결하는 방법은 여러 가지가 있어요.

- **도구(Tool)로 연결.**<br>
  에이전트 호출을 오케스트레이터에 위임하거나, 토픽에서 명시적으로 호출할 수 있는 유연성을 줘요.
- **지식 소스(Knowledge Source)로 연결.**<br>
  에이전트의 지식을 Snowflake의 선택된 특정 테이블에 자연스럽게 그라운딩해요.

어느 쪽을 선택할지는 에이전트의 목표와 설계에 따라 크게 달라져요.

### 이 블로그의 초점

이 블로그 글은 **Snowflake를 지식 소스로 사용하는 것**에 초점을 맞춰 설정 가이드를 제공해요. 다루는 내용은 다음과 같아요.

- Snowflake 구성
- Azure에서 앱 등록
- Copilot Studio 커넥터 활성화

여기서 구축한 연결 설정은 Snowflake를 도구로 사용할 때도 그대로 활용할 수 있어요.

> **참고:** Snowflake Cortex 에이전트를 활용하려는 경우, 해당 주제는 이번 글에서 다루지 않아요. 충분한 관심이 있다면 Copilot Studio와 Cortex 에이전트 연결을 구성하는 데 필요한 단계를 자세히 설명하는 후속 글의 게시를 검토할게요.

---

## 사전 요구 사항

Snowflake와 Copilot Studio를 올바르게 구성하려면 다음 접근 권한이 필요해요.

- ✅ 관리자 권한이 있는 **Snowflake 계정**
- ✅ 커넥터 활성화를 위한 **Power Platform 관리 센터(Power Platform Admin Center)** 접근 권한
- ✅ OAuth 클라이언트 및 리소스 역할을 위한 **Azure 앱 등록(App Registration)**
- ✅ **Microsoft Copilot Studio** 환경 (예: 샌드박스, 프로덕션)

---

## 구성 단계

### 초기 확인: Power Platform 관리 센터(PPAC)

먼저 PPAC에서 조직의 데이터 정책이 사용 중인 환경에서 Snowflake 커넥터를 차단하지 않는지 확인하세요.

새 Copilot Studio 에이전트를 만들거나 기존 에이전트에 접근한 후 다음으로 이동해요.
**지식(Knowledge) 탭 → 고급(Advanced) → 지식 소스로 'Snowflake' 선택**

처음 접근하면 연결 세부 정보를 입력하라는 메시지가 표시돼요.

**인증 방법**: 이 가이드에서는 **"서비스 주체(Service Principal, Microsoft Entra ID 애플리케이션)"**<sup>2</sup>를 사용해요.

---

## 1단계: Microsoft Azure 리소스 구성

다음 세 가지 주요 단계를 완료하려면 [Azure 관리 포털](https://portal.azure.com)에 접근할 수 있어야 해요.

1. Azure에 새 Snowflake OAuth<sup>3</sup> **리소스(Resource)** 등록 (Application ID URI, 앱 스코프)
2. Azure에 새 Snowflake OAuth **클라이언트(Client)** 등록 (Client ID, Secret, 권한, 리디렉션 URI)
3. Azure 메타데이터 수집: 토큰 엔드포인트, jwks URI

완료하면 다음 값을 갖게 돼요.

- **Tenant ID** `<TENANT_ID>` __(A)__
- **OAuth Client ID** __(B)__
- **Client Secret** __(C)__
- **OAuth Resource URL** __(D)__

### 1.1 Azure/Entra ID에 "Snowflake OAuth Resource" 등록

1. **Azure Portal → 앱 등록(App registrations) → 새 등록(New registration)**으로 이동해요
2. 이름을 **'Snowflake OAuth Resource'**와 같이 지정해요

   - **"단일 테넌트(Single-tenant)"**를 사용해요 (또는 상황에 맞게 선택)
3. **"등록(Register)"**을 클릭한 후, **API 노출(Expose an API)**로 이동해요
4. **Application ID URI** 옆의 **"추가(Add)"**를 클릭해요

   - Application ID URI가 자동으로 생성돼요 (예: `api://<GUID>`)
   - **저장(Save)**을 클릭하고 이 URI를 복사해요
   - 이것이 **"Resource URL"** `<SNOWFLAKE_APPLICATION_ID_URI>` **(D)**가 돼요
5. 왼쪽 탐색 메뉴에서 **"앱 역할(App Roles)"** 섹션으로 이동해요

   - 다음 섹션에서 Snowflake에 만들 **"ANALYST"** 역할에 대응하는 애플리케이션 역할을 정의해요. 이미 존재하는 Snowflake 역할이 있다면 그것을 선택해도 돼요.
   - 사용자가 로그인하면 액세스 토큰에 할당된 역할이 포함돼요
   - Snowflake는 이 역할을 확인해 데이터 접근 권한을 결정해요 (예: 스코프 `session:role:ANALYST`)
   - 아래 스크린샷의 정보를 참고해 역할 세부 정보를 입력하거나, 사용 중인 역할에 맞는 값을 선택하세요.

**앱 역할 구성:**

6. **"개요(Overview)" → 엔드포인트(Endpoints)** 탭으로 이동해요
7. **"OAuth 2.0 토큰 엔드포인트 (v2)"** 값을 복사해 저장해요

---

### 1.2 Azure/Entra ID에 "Snowflake OAuth Client" 등록

1. **Azure 앱 등록 → 새 등록(New registration)**으로 이동해요

   - 이름: 예를 들어 **'Snowflake OAuth Client'**
2. **Client ID를 복사해요**

   - 이것이 **Client ID** `<OAUTH_CLIENT_ID>` **(B)**예요
3. **인증서 및 비밀(Certificates & secrets) → 클라이언트 비밀 만들기(Create a Client secret)**로 이동해요

   - 이 값을 **Client secret** `<OAUTH_CLIENT_SECRET>` **(C)**으로 저장해요
4. **API 권한(API permissions) → 권한 추가(Add permission) → "내 조직에서 사용하는 API(APIs my organization uses)"**로 이동해요

   - 앞서 만든 **"Snowflake OAuth Resource"**를 입력/선택해요
   - 권한을 선택해요
   - 서비스 주체(앱 전용) 흐름의 경우 **애플리케이션 권한(Application permissions)**으로 설정해요
   - 그런 다음 **관리자 동의(admin consent)를 부여**해요
5. 앱 등록의 **개요(Overview)** 페이지로 이동해요

   - **"디렉터리(테넌트) ID"**를 복사해요
   - 이것이 **Tenant ID** `<TENANT_ID>` **(A)**예요

---
**⚠️ 거의 다 왔어요!**
가장 어려운 부분이 거의 끝났어요. Microsoft Azure 구성을 완료하기까지 한 단계만 남았어요.

### 1.3 Azure에서 필요한 메타데이터 수집

Azure의 OAuth 클라이언트가 생성한 **"Sub"** 또는 **"Subject ID"**를 수집해야 해요. 이 `<AZURE_Sub>` 값은 새로운 Snowflake 사용자 인증의 사용자 이름으로 사용돼요.

**"Sub" ID를 얻으려면**, 플레이스홀더 **`<Place_Holder>`**를 실제 값으로 바꾼 뒤 PowerShell에서 다음을 실행해요.

```powershell
# ---- Inputs ----
$TenantId = "<TENANT_ID>"
$ClientId = "<OAUTH_CLIENT_ID>"
$ClientSecret = "<OAUTH_CLIENT_SECRET>"  # Ensure NO leading/trailing space
$Scope = "api://$ClientId/.default"  # Use /.default for client_credentials
```

```powershell
# ---- Request ----
$TokenUrl = "https://login.microsoftonline.com/$TenantId/oauth2/v2.0/token"
$Body = @{
    client_id     = $ClientId
    client_secret = $ClientSecret
    grant_type    = "client_credentials"
    scope         = $Scope
}

$TokenResponse = Invoke-RestMethod -Method Post -Uri $TokenUrl -Body $Body -ContentType "application/x-www-form-urlencoded"

# ---- Result ----
$TokenResponse | Format-List
```

성공하면 명령 셸 창에 긴 토큰이 나타나요.

eyJ0eXAiOiJKV3QiLCJhbGciOiJSUzI1NiIsIng1dCI6...

**토큰 디코딩:**

1. 토큰을 복사해요
2. [https://jwt.ms](https://jwt.ms)에 접속해요
3. 붙여넣고 **"Decode Token"**을 클릭해요
4. **"Sub"** 값을 찾아 복사해요
5. `<AZURE_Sub>`로 저장해요

---

### Azure 구성 요약

지금까지 수집했어야 하는 ID들의 템플릿이에요.

| 키 이름                           | 설명                     | Snowflake에서의 사용처                                                      | 실제 값 |
| ---------------------------------- | ------------------------------- | ---------------------------------------------------------------------------- | ------------ |
| `<TENANT_ID>`                    | Azure 테넌트 ID                 | Snowflake의 다양한 구성 매개변수에서 참조됨              |              |
| `<AZURE_Sub>`                    | JWT<sup>4</sup> 토큰에서 추출한 Sub ID | 새 Snowflake Copilot 사용자의 로그인 이름                                |              |
| `<SNOWFLAKE_APPLICATION_ID_URI>` | Azure 리소스 ID               | Snowflake External OAuth Audience List의 항목 중 하나로 제공됨 |              |

---

## 2단계: Snowflake 구성

관리자 계정 또는 관리자 권한이 있는 사용자로 Snowflake에 로그인해요.

### Snowflake 구성 매개변수 확인

1. **Snowflake SaaS URL**

   - 왼쪽 제어 창에서 **"Account Admin"** 아이콘을 선택해요
   - 왼쪽 하단의 사용자 이름을 클릭해요
   - **"Connect a tool to Snowflake"**를 선택해요
   - **"Account/Server URL"**을 선택해요
   - Account/Server URL을 복사해요
2. **데이터베이스 이름**

   - 왼쪽 창 → **"Catalog" → "Databases"**로 이동해요
   - 원하는 데이터베이스의 이름을 복사해요
3. **웨어하우스 이름**

   - 왼쪽 창 → **"Compute" → "Warehouses"**로 이동해요
   - 해당하는 웨어하우스<sup>5</sup> 이름을 복사해요
4. **스키마 이름**

   - 왼쪽 창 → **Catalog** → 사용할 데이터베이스를 선택해요
   - 테이블이 위치한 필요한 스키마 이름을 확인하고 복사해요
5. **역할(Role)**

   - 기존 역할을 할당하거나 새 역할을 만들어야 해요
   - 역할에는 웨어하우스, 데이터베이스, 스키마에 대한 필요한 접근 권한이 있어야 해요
   - 이 가이드에서는 **"ANALYST"**라는 새 역할을 만들어요

---

### Snowflake — 사용자 / 역할 / 보안 통합 구성

#### Copilot/OAuth용 Snowflake 사용자 생성

**"Projects" → "Workspaces"**로 이동해 새 SQL 창을 만들어요.

`<AZURE_Sub>`를 실제 Sub ID로 바꾼 뒤 아래 SQL을 복사해 붙여넣어요.

```sql
CREATE USER COPILOT_OAUTH_USER 
    LOGIN_NAME = '<AZURE_Sub>'  -- Sub ID from JWT token
    DISPLAY_NAME = 'Snowflake OAuth User'
    COMMENT = 'Copilot OAuth user';
```

이렇게 하면 외부 OAuth 주체(subject)에 대응하는 Snowflake ID가 만들어져요.

---

#### ANALYST 역할 생성

Snowflake에서 다음 SQL을 실행해요.

```sql
CREATE ROLE ANALYST;

GRANT ROLE ANALYST TO USER COPILOT_OAUTH_USER;

ALTER USER COPILOT_OAUTH_USER SET DEFAULT_ROLE = ANALYST;

GRANT USAGE ON WAREHOUSE COMPUTE_WH TO ROLE ANALYST;

GRANT IMPORTED PRIVILEGES ON DATABASE SNOWFLAKE_SAMPLE_DATA TO ROLE ANALYST;
```

ANALYST 역할에 원하는 웨어하우스, 데이터베이스, 테이블에 대한 접근 권한을 부여할 수 있어요.

---

#### 보안 통합(Security Integration) 생성

외부 OAuth 통합을 활성화해 Copilot Studio와의 보안 통합을 설정해요.

**모든 플레이스홀더 `<Place_Holder>`를 실제 값으로 교체한 뒤** 실행해요.

```sql
CREATE OR REPLACE SECURITY INTEGRATION COPILOT_EXTERNAL_OAUTH_AZURE 
    TYPE = EXTERNAL_OAUTH 
    ENABLED = TRUE
  
    -- IdP / Azure AD specifics 
    EXTERNAL_OAUTH_TYPE = AZURE 
    EXTERNAL_OAUTH_ISSUER = 'https://sts.windows.net/<TENANT_ID>/'
    EXTERNAL_OAUTH_JWS_KEYS_URL = 'https://login.microsoftonline.com/<TENANT_ID>/discovery/v2.0/keys'
  
    -- Audience (the "api://" application ID URI that tokens are issued for) 
    EXTERNAL_OAUTH_AUDIENCE_LIST = ('api://<SNOWFLAKE_APPLICATION_ID_URI>')
  
    -- How Snowflake finds the user in the token
    EXTERNAL_OAUTH_TOKEN_USER_MAPPING_CLAIM = 'sub' 
    EXTERNAL_OAUTH_SNOWFLAKE_USER_MAPPING_ATTRIBUTE = 'LOGIN_NAME'
  
    -- Role behavior: allow any role requested in the token
    -- (you can tighten this later if needed)
    EXTERNAL_OAUTH_ANY_ROLE_MODE = 'ENABLE';
```

---

## 3단계: Copilot Studio에서 Snowflake를 지식 소스로 추가

Snowflake와 Azure 쪽 구성 및 테스트가 완료되면 Copilot Studio와 통합할 수 있어요.

### 구성 단계:

1. **Copilot Studio를 열고** 로그인한 뒤 에이전트를 만들거나 편집해요
2. 에이전트 설정에서 **"지식 소스/연결 추가(Add knowledge source / connection)"**를 선택해요

   - **Snowflake**를 선택해요
3. 메시지가 표시되면 미리 준비한 모든 연결 세부 정보를 입력해요.

   - **Tenant ID** (A)
   - **Client ID** (B)
   - **Client Secret** (C)
   - **Resource URL** (D)
   - Snowflake SaaS URL
   - 데이터베이스 이름
   - 웨어하우스 이름
   - 스키마 이름
   - 역할(Role)
4. **연결을 저장해요**

   - Copilot Studio는 이 연결을 사용해 Snowflake 테이블을 실시간으로 조회해요
   - 지식 소스로 추가할 데이터셋과 테이블 이름을 선택할 수 있어요

### 사용자 권한

Snowflake를 지식 소스로 처음 사용할 때, 사용자에게 연결 생성 권한을 부여하라는 메시지가 표시돼요.

### 연결 사용하기

이 시점부터 에이전트가 Snowflake에서 데이터를 읽을 수 있도록 도구나 지식 기반 프롬프트를 추가할 수 있어요. 예를 들면 다음과 같아요.

- 자연어 쿼리에 답변
- 보고서 생성
- 다른 소스와 데이터 결합

---

## 문제 해결 및 흔한 함정

### 1. 웨어하우스 상태

엄밀히 필수는 아니지만, 처음 연결을 만들 때 Snowflake 데이터 웨어하우스 인스턴스가 **일시 중단(suspended)** 상태라면 자동으로 재시작되지 않을 수 있어요.

**해결책**: 최초 연결을 만들기 전에 구성한 웨어하우스 인스턴스가 **실행 중(running)**인지 확인하세요.

### 2. 사용자 로그인 이름 불일치

(`login_name`을 통해) 매핑하는 Snowflake 사용자가 JWT의 **Sub 클레임**과 정확히 일치하는지 확인하세요.

**예시**: Snowflake 사용자는 `LOGIN_NAME = <sub value>`여야 해요.

### 3. 역할 권한

사용자에게 할당된 Snowflake 역할에는 적절한 권한이 있어야 해요.

- 웨어하우스 접근 권한
- 데이터베이스 접근 권한
- 스키마 접근 권한
- SELECT 등 필요한 권한
- 기본 역할/웨어하우스/데이터베이스/스키마가 설정되어 있어야 함

**이것들이 없으면 유효한 연결이라도 실패할 수 있어요.**

### 4. 검증 쿼리

**"Connect a tool to Snowflake"**를 선택하면 **"SQL Commands"** 탭에서 다양한 유용한 Snowflake 쿼리를 확인할 수 있어요. 이 쿼리들로 다음을 검증할 수 있어요.

- 생성된/기존 사용자
- 역할
- 보안 통합 연결

예시 쿼리 접근 경로: **Home → Connect a tool to Snowflake → SQL Commands**

---

## 마무리

이 가이드를 따라 Snowflake를 Copilot Studio에 연결했고, 에이전트가 자연어로 실시간 데이터를 조회할 수 있게 되었어요. 이 통합을 통해 다음이 가능해요.

- ✅ ETL 파이프라인 없이 실시간 데이터 접근
- ✅ 에이전트 지식을 Snowflake 테이블에 그라운딩
- ✅ 데이터에 대한 자연어 쿼리 지원
- ✅ 대화형 AI를 통한 보고서 및 분석 생성

이 연결은 **지식 소스**(자연스러운 그라운딩용)와 **도구**(명시적인 오케스트레이션용) 두 가지 방식 모두로 사용할 수 있어요.

---

## 어휘 주석

1. **ETL(Extract, Transform, Load):** 여러 시스템의 데이터를 추출·변환해 다른 저장소로 옮겨 적재하는 데이터 파이프라인 작업.
2. **서비스 주체(Service Principal):** 사람이 아니라 애플리케이션이 시스템에 로그인하고 리소스에 접근할 때 쓰는 신원(계정).
3. **OAuth:** 비밀번호를 직접 주고받지 않고도 애플리케이션이 다른 서비스의 리소스에 접근할 수 있도록 권한을 위임하는 인증·인가 표준.
4. **JWT(JSON Web Token):** 사용자나 애플리케이션의 신원 정보를 담아 서명한, 위변조를 검증할 수 있는 토큰 형식.
5. **웨어하우스(Warehouse):** Snowflake에서 쿼리를 실제로 실행하는 컴퓨팅 자원 단위. 필요할 때 켜고 쓰지 않을 때 꺼서 비용을 조절해요.

---
title: 'Copilot Studio에서 Snowflake 관리형 MCP 서버 연결하기'
description: 'Copilot Studio에 Snowflake 관리형 MCP 서버를 연결할 때 자주 놓치는 Cortex Agent, 수동 OAuth, 리디렉션 URI 순서 같은 함정을 정리했어요.'
date: 2026-09-05
tags: ["Copilot Studio", "Snowflake", "MCP", "OAuth", "Entra ID"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/snowflake-managed-mcp/card-01.png
  - /cards/snowflake-managed-mcp/card-02.png
  - /cards/snowflake-managed-mcp/card-03.png
  - /cards/snowflake-managed-mcp/card-04.png
  - /cards/snowflake-managed-mcp/card-05.png
  - /cards/snowflake-managed-mcp/card-06.png
  - /cards/snowflake-managed-mcp/card-07.png
  - /cards/snowflake-managed-mcp/card-08.png
---

> **원문:** [Wiring up a Snowflake-managed MCP server in Copilot Studio](https://microsoft.github.io/mcscatblog/posts/snowflake-mcp-copilot-studio/)
> **게시일:** 2026-05-22 · **저자:** Hazim SharafelDin, Betty Le

최근 저희는 Snowflake 관리형 MCP 서버를 Copilot Studio 에이전트에 처음부터 끝까지 연결해 봤어요. 공식 문서가 각 구성 요소는 잘 다루지만, 실제로 조각을 이어 붙여봐야만 드러나는 세부 사항이 여럿 있었어요.

- 수동(Manual) OAuth가 필수예요.
- 리디렉션 URI 설정 순서에 함정이 있어요.
- 테스트 창에는 별도의 최종 사용자 연결이 필요해요.
- Cortex Agent<sup>1</sup>가 평가판 계정을 조용히 무력화시키는 숨은 전제 조건이에요.

이 글은 저희가 첫날에 있었으면 좋았을 워크스루예요.

> 아래 모든 샘플 ID, 시크릿, 호스트 이름, 테넌트, 이메일 주소는 자리 표시자예요. `<PLACEHOLDER>`를 전부 여러분의 값으로 바꿔 주세요.

## 무엇을 만들 것인가

Snowflake 관리형 MCP 서버를 통해 Snowflake와 대화하는 Copilot Studio 에이전트를 만들어요. 토큰은 위임된 사용자 OAuth<sup>2</sup>를 통해 Entra ID를 거쳐 흐르므로, 모든 쿼리는 서비스 주체가 아니라 로그인한 사용자로 실행돼요.

## TL;DR

이 글에서 다섯 가지만 기억한다면, 다음을 기억하세요.

1. Snowflake 관리형 MCP는 런타임에 항상 Cortex Agent를 거쳐요. 계정에서 Cortex가 차단돼 있으면(평가판에서 흔해요) 도구 검색은 되지만 모든 호출이 실패해요.
2. Snowflake는 OAuth 동적 클라이언트 등록<sup>3</sup>을 지원하지 않아요. Copilot Studio에서 처음부터 **수동(Manual)** OAuth를 사용하세요.
3. 커넥터 리디렉션 URI는 MCP 도구를 만든 뒤에야 생겨요. Copilot Studio가 만든 *후에* Azure에 추가하는 것이지, 그 전이 아니에요.
4. 메이커 연결과 테스트 창(최종 사용자) 연결은 서로 달라요. 둘 다 성공해야 해요.
5. `ALTER USER ... SET DEFAULT_SECONDARY_ROLES = ('ALL')`은 대부분의 블로그 글이 빠뜨리는 한 줄이에요. 이게 없으면 `session:role-any` 스코프가 런타임에 역할에 바인딩되지 못해요.

## Cortex Agent: 숨은 전제 조건

Snowflake 관리형 MCP 서버는 하위 도구가 `CORTEX_SEARCH_SERVICE_QUERY`든, `GENERIC` 저장 프로시저든, `SYSTEM_EXECUTE_SQL`이든 상관없이 런타임에 항상 Cortex Agent를 거쳐 도구를 호출해요. Cortex Agent는 모든 MCP 호출의 런타임 오케스트레이터인 셈이에요.

Snowflake 계정에서 다음 두 가지가 충족돼야 해요.

- Cortex Agent가 해당 Snowflake 리전에서 활성화돼 있어야 해요.
- 계정이 Cortex Agent를 호출할 수 있도록 허용돼 있어야 해요. 표준 30일 평가판 계정은 조직 수준에서 Cortex가 차단돼 있어서, 검색은 성공하지만 모든 호출이 `MCP Server tool error: No tool result received calling Cortex Agent` 오류로 실패해요.

평가판을 쓰고 있다면 계속 진행하기 전에 Snowflake 지원팀에 Cortex 활성화를 요청하거나 유료 계정으로 전환하세요. 이 글의 나머지 내용은 그대로 동작하지만, 에이전트가 실제로 답변하는 일은 결코 없을 거예요.

## 자리 표시자 치트 시트

이 워크스루 전체에서 아래 자리 표시자를 써요. 진행하면서 미리 확보해 두면 나중에 되돌아갈 필요가 없어요.

| 자리 표시자 | 찾을 수 있는 곳 |
| --- | --- |
| `<TENANT_ID>` | Entra > 개요(Overview) > 테넌트 ID |
| `<TENANT_NAME>` | Entra > 개요(Overview) > 기본 도메인 |
| `<RESOURCE_APP_CLIENT_ID>` | 리소스 앱 등록 > 개요 > 애플리케이션(클라이언트) ID |
| `<CLIENT_APP_CLIENT_ID>` | 클라이언트 앱 등록 > 개요 > 애플리케이션(클라이언트) ID |
| `<CLIENT_SECRET_VALUE>` | 클라이언트 앱 > 인증서 및 비밀(Certificates & secrets) (생성 시에만 표시됨) |
| `<SNOWFLAKE_ACCOUNT_HOST>` | Snowsight > Admin > Accounts (`<accountid>.snowflakecomputing.com` 형태) |
| `<USER_UPN@yourtenant.onmicrosoft.com>` | 최종 사용자의 Entra UPN |

## 1단계: Snowflake에 샘플 데이터 만들기

에이전트가 실제로 쿼리할 대상이 필요해요. Snowsight를 열고 **Projects > Workspaces > New SQL file**로 이동한 뒤 다음을 실행하세요.

```sql
CREATE DATABASE IF NOT EXISTS PRODUCT_CUSTOMER_DB;
CREATE SCHEMA IF NOT EXISTS PRODUCT_CUSTOMER_DB.STORE_SCHEMA;

CREATE TABLE IF NOT EXISTS PRODUCT_CUSTOMER_DB.STORE_SCHEMA.PRODUCTS (
    PRODUCT_ID INT AUTOINCREMENT PRIMARY KEY,
    PRODUCT_NAME VARCHAR(255) NOT NULL,
    DESCRIPTION VARCHAR(1000),
    CATEGORY VARCHAR(100),
    PRICE DECIMAL(10,2) NOT NULL,
    STOCK_QUANTITY INT DEFAULT 0,
    CREATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    UPDATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE IF NOT EXISTS PRODUCT_CUSTOMER_DB.STORE_SCHEMA.CUSTOMERS (
    CUSTOMER_ID INT AUTOINCREMENT PRIMARY KEY,
    FIRST_NAME VARCHAR(100) NOT NULL,
    LAST_NAME VARCHAR(100) NOT NULL,
    EMAIL VARCHAR(255) UNIQUE NOT NULL,
    PHONE VARCHAR(20),
    ADDRESS VARCHAR(500),
    CITY VARCHAR(100),
    STATE VARCHAR(100),
    ZIP_CODE VARCHAR(20),
    CREATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    UPDATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- Insert a couple dozen rows into each table here.
```

한 가지 짚어둘 Snowsight의 특이점이 있어요. **Run** 버튼이 가끔 커서가 위치한 문장만 실행해요. 모든 문장이 실행되도록 **Cmd/Ctrl+Enter**를 누르기 전에 스크립트 전체를 선택하세요.

빠른 확인용 쿼리예요.

```sql
SELECT COUNT(*) AS PRODUCTS FROM PRODUCT_CUSTOMER_DB.STORE_SCHEMA.PRODUCTS;
SELECT COUNT(*) AS CUSTOMERS FROM PRODUCT_CUSTOMER_DB.STORE_SCHEMA.CUSTOMERS;
```

*Cortex Search를 켜기 전에 필요한 건 데이터가 채워진 두 개의 테이블뿐이에요.*

## 2단계: Cortex Search 서비스와 MCP 서버 구성하기

여기서부터는 Snowflake가 무거운 일을 대신해 줘요. 검색 가능한 테이블마다 Cortex Search Service를 하나씩 만든 다음, 두 서비스를 LLM이 읽게 될 도구 사양(spec)과 함께 하나의 MCP 서버로 감싸요.

```sql
CREATE OR REPLACE CORTEX SEARCH SERVICE PRODUCT_CUSTOMER_DB.STORE_SCHEMA.CUSTOMER_SEARCH
  ON customer_info
  ATTRIBUTES CITY, STATE
  WAREHOUSE = COMPUTE_WH
  TARGET_LAG = '1 hour'
AS (
  SELECT
    CUSTOMER_ID,
    FIRST_NAME || ' ' || LAST_NAME || ' - ' || EMAIL || ' - ' || CITY || ', ' || STATE AS customer_info,
    FIRST_NAME, LAST_NAME, EMAIL, CITY, STATE
  FROM PRODUCT_CUSTOMER_DB.STORE_SCHEMA.CUSTOMERS
);

CREATE OR REPLACE CORTEX SEARCH SERVICE PRODUCT_CUSTOMER_DB.STORE_SCHEMA.PRODUCT_SEARCH
  ON product_info
  ATTRIBUTES CATEGORY
  WAREHOUSE = COMPUTE_WH
  TARGET_LAG = '1 hour'
AS (
  SELECT
    PRODUCT_ID,
    PRODUCT_NAME || ' - ' || CATEGORY AS product_info,
    PRODUCT_NAME, CATEGORY, PRICE, STOCK_QUANTITY
  FROM PRODUCT_CUSTOMER_DB.STORE_SCHEMA.PRODUCTS
);

CREATE OR REPLACE MCP SERVER PRODUCT_CUSTOMER_DB.STORE_SCHEMA.MY_MCP_SERVER
FROM SPECIFICATION $$
  tools:
    - name: "customer_search"
      type: "CORTEX_SEARCH_SERVICE_QUERY"
      identifier: "PRODUCT_CUSTOMER_DB.STORE_SCHEMA.CUSTOMER_SEARCH"
      title: "Customer Search"
      description: "Search customers by name, email, city, or state."
    - name: "product_search"
      type: "CORTEX_SEARCH_SERVICE_QUERY"
      identifier: "PRODUCT_CUSTOMER_DB.STORE_SCHEMA.PRODUCT_SEARCH"
      title: "Product Search"
      description: "Search products by name or category."
$$;

DESCRIBE MCP SERVER PRODUCT_CUSTOMER_DB.STORE_SCHEMA.MY_MCP_SERVER;
```

*`DESCRIBE` 출력은 LLM과의 계약서예요. `name`과 `description` 필드는 에이전트의 모델이 도구 호출 여부를 판단할 때 보게 되는 바로 그 내용이니, snake_case를 유지하고 설명을 정확하게 작성하세요.*

## 3단계: Snowflake 사용자를 Entra 자격 증명에 매핑하기

적절한 권한을 가진 역할과, `LOGIN_NAME`이 Entra UPN과 일치하는 Snowflake 사용자가 필요해요. 나중에 설정할 `EXTERNAL_OAUTH` 통합이 수신되는 `upn` 클레임을 해당 `LOGIN_NAME`에 매핑하므로, 두 값이 정확히 일치해야 해요(대소문자 구분 없음).

```sql
CREATE ROLE IF NOT EXISTS SALESPROFESSIONAL;
GRANT USAGE ON DATABASE PRODUCT_CUSTOMER_DB TO ROLE SALESPROFESSIONAL;
GRANT USAGE ON SCHEMA PRODUCT_CUSTOMER_DB.STORE_SCHEMA TO ROLE SALESPROFESSIONAL;
GRANT USAGE ON CORTEX SEARCH SERVICE PRODUCT_CUSTOMER_DB.STORE_SCHEMA.CUSTOMER_SEARCH TO ROLE SALESPROFESSIONAL;
GRANT USAGE ON CORTEX SEARCH SERVICE PRODUCT_CUSTOMER_DB.STORE_SCHEMA.PRODUCT_SEARCH TO ROLE SALESPROFESSIONAL;
GRANT USAGE ON MCP SERVER PRODUCT_CUSTOMER_DB.STORE_SCHEMA.MY_MCP_SERVER TO ROLE SALESPROFESSIONAL;
GRANT USAGE ON WAREHOUSE COMPUTE_WH TO ROLE SALESPROFESSIONAL;
```

*읽기 전용 에이전트 사용 사례라면 여섯 줄의 `GRANT USAGE`와 웨어하우스 권한이면 충분해요.*

이제 위임 사용자를 만들어요.

```sql
CREATE USER IF NOT EXISTS SNOWSQL_DELEGATE_USER
  LOGIN_NAME = '<USER_UPN@yourtenant.onmicrosoft.com>'
  DISPLAY_NAME = 'SnowSQL Delegated User'
  COMMENT = 'Delegate user for SnowSQL/MCP OAuth-based connectivity';

GRANT ROLE SALESPROFESSIONAL TO USER SNOWSQL_DELEGATE_USER;

-- Optional when the OAuth scope is session:role-any (any-role mode resolves the role via secondary roles below)
ALTER USER SNOWSQL_DELEGATE_USER SET DEFAULT_ROLE       = SALESPROFESSIONAL;
ALTER USER SNOWSQL_DELEGATE_USER SET DEFAULT_WAREHOUSE  = COMPUTE_WH;

-- Required when the OAuth scope is session:role-any
ALTER USER SNOWSQL_DELEGATE_USER SET DEFAULT_SECONDARY_ROLES = ('ALL');

SHOW GRANTS TO USER SNOWSQL_DELEGATE_USER;
SHOW GRANTS TO ROLE SALESPROFESSIONAL;
```

*하나의 Snowsight 워크시트에서 위임 사용자를 만들고 역할을 바인딩하는 모습이에요.*

마지막 `ALTER USER` 줄이 바로 저희가 계속 놓치던 부분이에요. `session:role-any` 스코프를 쓰면 Snowflake는 세션 시작 시 보조 역할(secondary role) 확인으로 역할을 활성화하는데, 이 확인은 `DEFAULT_SECONDARY_ROLES`가 `('ALL')`로 설정돼 있을 때만 동작해요.

*이 목록에 역할이 없으면 OAuth 핸드셰이크는 성공해도 도구 호출은 "insufficient privileges" 오류로 실패해요.*

*계속 진행하기 전에 역할 자체가 데이터베이스, 스키마, Cortex Search 서비스, 웨어하우스를 볼 수 있는지 확인하세요.*

## 4단계: 두 개의 Entra 앱 등록 만들기

Entra 테넌트에 **두 개**의 앱 등록이 필요해요. Snowflake 공식 워크스루를 처음부터 끝까지 따라 하세요.

- [Snowflake 문서: Microsoft Entra ID에서 OAuth 클라이언트 만들기](https://docs.snowflake.com/en/user-guide/oauth-azure#create-an-oauth-client-in-microsoft-entra-id)
- [Snowflake 문서: Snowflake용 Azure AD 정보 수집](https://docs.snowflake.com/en/user-guide/oauth-azure#collect-azure-ad-information-for-snowflake)

### 리소스 앱: `Snowflake OAuth Resource`

- **API 노출(Expose an API)**에서 애플리케이션 ID URI를 `api://<RESOURCE_APP_CLIENT_ID>`로 설정하세요.
- `session:role-any`라는 위임된 스코프를 추가하세요. 에이전트를 하나의 Snowflake 역할로 고정하고 싶다면 더 좁은 스코프를 대신 쓰세요.

*이것이 액세스 토큰이 담게 될 대상(audience)이에요. Snowflake 통합의 `EXTERNAL_OAUTH_AUDIENCE_LIST`와 정확히 일치해야 해요.*

### 클라이언트 앱: `Snowflake OAuth Client`

- **인증서 및 비밀(Certificates & secrets)**에서 클라이언트 시크릿을 만들고 값을 즉시 복사하세요. 한 번만 표시돼요.
- **API 권한(API permissions)**에서 권한을 추가하고, **내 API(My APIs)**를 선택한 뒤 리소스 앱을 고르고, `session:role-any` 위임된 권한을 선택하세요.
- **`<TENANT_NAME>`에 대해 관리자 동의 허용(Grant admin consent)**을 클릭하세요.

*이 개요 탭에서 **애플리케이션(클라이언트) ID**와 **디렉터리(테넌트) ID**를 복사해두세요. 6단계에서 Copilot Studio MCP 양식에 둘 다 붙여넣게 돼요.*

*관리자 동의가 없으면 첫 사용자 로그인이 흔한 "관리자 승인 필요" 페이지와 함께 실패해요.*

7단계에서 Copilot Studio가 리디렉션 URI를 생성한 후에 같은 클라이언트 앱에 이를 추가하게 돼요. 지금은 건너뛰세요.

## 5단계: Snowflake가 Entra 발급 토큰을 신뢰하도록 설정하기

`EXTERNAL_OAUTH` 보안 통합은 Snowflake에 액세스 토큰을 검증하는 방법과, 토큰의 `upn` 클레임을 Snowflake 사용자에 매핑하는 방법을 알려줘요.

```sql
USE ROLE ACCOUNTADMIN;

CREATE OR REPLACE SECURITY INTEGRATION external_oauth_azure_1
  TYPE = EXTERNAL_OAUTH
  ENABLED = TRUE
  EXTERNAL_OAUTH_TYPE = AZURE
  EXTERNAL_OAUTH_ISSUER = 'https://sts.windows.net/<TENANT_ID>/'
  EXTERNAL_OAUTH_JWS_KEYS_URL = 'https://login.microsoftonline.com/<TENANT_ID>/discovery/v2.0/keys'
  EXTERNAL_OAUTH_AUDIENCE_LIST = ('api://<RESOURCE_APP_CLIENT_ID>')
  EXTERNAL_OAUTH_TOKEN_USER_MAPPING_CLAIM = 'upn'
  EXTERNAL_OAUTH_SNOWFLAKE_USER_MAPPING_ATTRIBUTE = 'LOGIN_NAME'
  EXTERNAL_OAUTH_ANY_ROLE_MODE = ENABLE;     -- required when scope is session:role-any

DESCRIBE INTEGRATION external_oauth_azure_1;
```

*`ENABLED = true`와 일치하는 대상(audience), 이 두 필드만 확인하고 넘어가면 돼요.*

## 6단계: Copilot Studio에서 에이전트와 MCP 도구 만들기

1. **Copilot Studio**로 이동해 **에이전트(Agents) > 에이전트 만들기(Create agent)**를 선택하세요. *Snowflake Sales Helper* 같은 이름과 짧은 설명을 입력하세요.
2. 에이전트를 열고 **도구(Tools)** 탭으로 이동한 뒤 **도구 추가(Add tool) > MCP > 새 MCP 추가(Add new MCP)**를 선택하세요.
3. MCP 양식을 채우세요.
   - **이름(Name)**: *Snowflake MCP* 같은 이름.
   - **설명(Description)**: 최종 사용자가 이해하기 쉬운 짧은 한 문장.
   - **서버 URL(Server URL)**:
     ```
     https://<SNOWFLAKE_ACCOUNT_HOST>/api/v2/databases/PRODUCT_CUSTOMER_DB/schemas/STORE_SCHEMA/mcp-servers/MY_MCP_SERVER
     ```
     여기서 `<SNOWFLAKE_ACCOUNT_HOST>`는 `<accountid>.snowflakecomputing.com` 형태예요. 끝에 슬래시나 `/sse`, `/mcp`를 붙이지 마세요.
   - **인증(Authentication)**: OAuth 2.0.
   - **동적 검색(Dynamic Discovery)**에서 **수동(Manual)**으로 전환하세요. Snowflake는 OAuth 동적 클라이언트 등록을 지원하지 않으므로, 동적 검색은 아무 알림 없이 실패해요.

4. 수동 OAuth 필드를 채우세요.

   | 필드 | 값 |
   | --- | --- |
   | Client ID | `<CLIENT_APP_CLIENT_ID>` |
   | Client Secret | `<CLIENT_SECRET_VALUE>` |
   | Authorization URL | `https://login.microsoftonline.com/<TENANT_ID>/oauth2/v2.0/authorize` |
   | Token URL | `https://login.microsoftonline.com/<TENANT_ID>/oauth2/v2.0/token` |
   | Refresh URL | `https://login.microsoftonline.com/<TENANT_ID>/oauth2/v2.0/token` |
   | Scopes | `api://<RESOURCE_APP_CLIENT_ID>/session:role-any offline_access` |

5. **만들기(Create)**를 클릭하세요.

*서버 URL은 대부분의 사람들이 유일하게 잘못 입력하는 필드예요. `/api/v2/databases/.../mcp-servers/<MCP_SERVER_NAME>` 접미사를 포함해 위 표의 패턴을 정확히 쓰세요.*

한 가지 특이점을 짚고 넘어갈게요. 서버 URL 필드가 URL이 올바른데도 *"Enter the complete server path to continue"*를 계속 표시하는 경우가 있고, **Create** 버튼이 비활성화된 것처럼 보일 수 있어요. 실제로는 대개 활성화돼 있어요. 일반적인 클릭에 반응하지 않는다면 필드가 오래된 유효성 검사 상태에서 포커스를 잃은 거예요. 필드 바깥을 클릭한 다음 **Create**를 다시 클릭하세요.

**Create**를 클릭하면 Copilot Studio가 Power Platform 환경에 MCP 도구와 같은 이름의 커스텀 커넥터를 자동 생성해요. 생성된 리디렉션 URL을 찾으려면 다음과 같이 하세요.

1. [Power Apps](https://make.powerapps.com)를 열고 환경 전환기(오른쪽 상단)로 Copilot Studio에서 쓴 **동일한 환경**으로 전환하세요.
2. 왼쪽 탐색 창에서 **더 보기(More) > 사용자 지정 커넥터(Custom connectors)**로 이동하세요.
3. 목록에서 Snowflake MCP 커넥터를 찾아 여세요(연필/편집 아이콘).
4. **2. 보안(Security)** 탭으로 건너뛰세요.
5. OAuth 2.0 섹션 맨 아래로 스크롤해서 **리디렉션 URL(Redirect URL)**을 복사하세요. 다음과 같은 형태예요.

```
https://global.consent.azure-apim.net/redirect/<connector-slug>
```

*커넥터는 에이전트와 같은 환경의 Power Apps에서 **More > Custom connectors** 아래에 나타나요.*

***Redirect URL** 필드는 **Security** 탭 맨 아래에 있어요. 복사해 두세요 — 다음 단계에서 클라이언트 앱의 인증 블레이드에 붙여넣게 돼요.*

## 7단계: Azure에서 OAuth 루프 닫기

리디렉션 URL은 Power Platform이 커스텀 커넥터를 만든 후에야 존재해서, 앞서 Azure 앱에 미리 추가해둘 수 없었던 거예요. 이것 없이 연결을 시도하면 OAuth 왕복이 `AADSTS50011: redirect URI mismatch` 오류로 실패해요.

**클라이언트 앱** 등록을 열고 **인증(Authentication)**으로 이동해 **플랫폼 추가(Add a platform) > 웹(Web)**을 선택한 뒤, 이전 단계의 리디렉션 URL을 붙여넣고 **구성(Configure)**을 클릭하세요. *"Successfully updated <클라이언트 앱 이름>"* 메시지가 표시돼야 해요.

*리디렉션 URI는 SPA나 퍼블릭 클라이언트가 아니라 **Web** 플랫폼 아래에 추가하세요. 다른 플랫폼을 선택하면 토큰 교환 시점에 아무 알림 없이 실패해요.*

## 8단계: 연결하고, 도구를 검색하고, (별도로) 다시 연결하기

메이커 연결과 테스트 창 연결은 서로 달라요. 둘 다 성공해야 해요.

### 메이커 측 연결

에이전트의 MCP 도구 세부 정보로 돌아가서.

1. **연결되지 않음(Not connected)** 아래에서 **새 연결 만들기(Create new connection)**를 선택한 뒤 **만들기(Create)**를 클릭하세요.
2. 같은 테넌트에 이미 로그인돼 있으면 OAuth 팝업이 나타나지 않을 수 있어요. 정상이에요. 연결 레이블이 여러분의 UPN으로 바뀌는지 지켜보세요.
3. **추가 및 구성(Add and configure)**을 클릭하세요.
4. Copilot Studio가 MCP 서버를 호출해 도구(`customer_search`, `product_search`)를 자동으로 검색해요. YAML 사양의 설명과 함께 도구 블레이드에 나타나요.

*새로 만든 MCP 도구를 빨리 찾으려면 도구 선택기를 **Model Context Protocol**로 필터링하세요.*

*여기서 도구 목록이 비어 있다면 검색이 실패한 거예요. 더 진행하기 전에 서버 URL과 연결 상태를 다시 확인하세요.*

*도구가 여기에 나타나면 Snowflake 쪽 연결이 올바르게 된 거예요.*

### 최종 사용자(테스트 창) 연결

Copilot Studio 테스트 창은 메이커가 아니라 최종 사용자로 실행돼요. MCP 도구를 트리거하는 질문을 에이전트에게 처음 하면 다음 메시지가 표시돼요.

> *Let's get you connected first. **Open connection manager** to verify your credentials.*

1. **Open connection manager**를 클릭하세요. 브라우저에 로그인된 사용자가 에이전트의 테넌트와 다르면 잠시 *"TenantId mismatched"*가 표시될 수 있어요.
2. 잘못된 계정에서 로그아웃한 다음, Snowflake `LOGIN_NAME`과 UPN이 일치하는 사용자로 다시 로그인하세요.
3. MCP 항목 옆의 **연결(Connect)**을 클릭하세요. 같은 테넌트 SSO라면 대개 조용히 완료돼요.
4. 테스트 창으로 돌아가 이전 메시지에서 **다시 시도(Retry)**를 클릭하세요.

## 9단계: 에이전트 테스트하기

도구에 깔끔하게 매핑되는 프롬프트 두어 개를 시도해 보세요.

- *"Find customers in California"*는 `query=California`로 `customer_search`를 호출해야 해요.
- *"What electronics products do we have?"*는 `query=electronics`로 `product_search`를 호출해야 해요.

*근거 있는(grounded) 답변과 도구 호출을 보여주는 **활동 맵(Activity map)**이 저희가 보고 싶은 결과예요. 도구 활동 없이 일반 LLM 답변만 나온다면 에이전트가 실제로 Snowflake에 접근하지 않은 거예요.*

에이전트가 도구를 호출하는 대신 일반 지식으로 답한다면, **개요(Overview)** 탭을 열고 다음과 같은 지침을 추가하세요.

> When the user asks about customers or products, use the Snowflake MCP tools. Do not answer from general knowledge.

*지침에 명시적인 한 문장을 넣는 것만으로도 모델이 일반 지식으로 답하는 걸 대개 막을 수 있어요.*

더 엄격하게 하고 싶다면 에이전트의 생성형 설정에서 **웹 검색(Web search)**과 **일반 지식 사용(Use general knowledge)**도 비활성화할 수 있어요.

*이중 안전장치예요. 이 옵션들을 끄면 에이전트가 모든 답변을 도구에 근거하도록 강제돼요.*

### Snowflake에서 실제로 실행되었는지 확인하기

작동을 증명하기 위해 딱 두 개의 쿼리만 실행한다면 다음을 실행하세요.

```sql
-- Was the OAuth handshake successful?
SELECT EVENT_TIMESTAMP, USER_NAME, IS_SUCCESS, ERROR_MESSAGE
FROM SNOWFLAKE.ACCOUNT_USAGE.LOGIN_HISTORY
WHERE USER_NAME = 'SNOWSQL_DELEGATE_USER'
  AND EVENT_TIMESTAMP > DATEADD(hour, -1, CURRENT_TIMESTAMP())
ORDER BY EVENT_TIMESTAMP DESC;

-- Did SQL actually run under the delegate user?
SELECT QUERY_ID, USER_NAME, ROLE_NAME, EXECUTION_STATUS, ERROR_MESSAGE,
       LEFT(QUERY_TEXT, 200) AS QT, START_TIME
FROM SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY
WHERE USER_NAME = 'SNOWSQL_DELEGATE_USER'
  AND START_TIME > DATEADD(hour, -1, CURRENT_TIMESTAMP())
ORDER BY START_TIME DESC;
```

`ACCOUNT_USAGE` 뷰에는 약 45분의 지연이 있어요. 실시간 확인이 필요하면 `ACCOUNTADMIN` 워크시트에서 `INFORMATION_SCHEMA.QUERY_HISTORY`와 `INFORMATION_SCHEMA.LOGIN_HISTORY`를 대신 쓰세요.

## 문제 해결

### 항상 Activity 탭부터 시작하세요

가장 유용한 진단 도구는 에이전트의 **활동(Activity)** 탭이에요. 테스트 대화를 클릭한 다음 도구 노드(예: `customer_search`)를 클릭하세요. 오른쪽 창에 다음이 표시돼요.

- **입력(Inputs)**: LLM이 도구에 보낸 내용(예: `query: California`).
- **출력(Outputs)**: `isError: true`와 MCP 서버가 반환한 오류 문자열 원문.
- **추론(Reasoning)**: LLM의 도구 선택 근거.

십중팔구 오류 문자열 원문이 어느 단계를 잘못했는지 정확히 알려줘요.

### 흔한 오류들

| 증상 | 유력한 원인 | 해결 방법 |
| --- | --- | --- |
| `MCP Server tool error: No tool result received calling Cortex Agent` | 해당 Snowflake 계정에서 Cortex Agent가 비활성화됨(평가판에서 흔함). | Cortex를 활성화하거나 유료 계정을 사용하세요. 전제 조건 섹션 참조. |
| 연결 중 `AADSTS50011: redirect URI mismatch` | 커넥터 리디렉션 URI가 Azure 클라이언트 앱에 추가되지 않음. | 7단계. |
| 커스텀 커넥터에서 **Test operation** 실행 시 `Schema validation` 경고(`Property "" type mismatch, Expected: "object", Actual: "string"`)와 함께 `Operation failed (405)` | MCP 커넥터에서는 정상이에요. 커넥터 테스트 창이 일반 GET을 보내는데 MCP 엔드포인트가 405로 거부하며, 응답 본문이 커넥터 스키마가 기대하는 JSON 객체가 아니에요. 에이전트에서의 실제 호출에는 영향이 없어요. | 무시하고 대신 Copilot Studio 테스트 창에서 엔드투엔드로 검증하세요. |
| Snowflake의 `Insufficient privileges` | 역할이나 권한이 누락되었거나, 기본 역할이 부여된 역할이 아님. | 3단계의 `GRANT` 문을 다시 실행하고 `DEFAULT_ROLE`과 `DEFAULT_SECONDARY_ROLES = ('ALL')` 둘 다 확인하세요. |
| OAuth 팝업이 나타나지 않고 상태가 "Not connected"로 유지됨 | 브라우저가 팝업을 차단했거나, 이미 조용히 로그인되어 있음. | 버튼 레이블을 지켜보세요. 자동 SSO는 팝업을 완전히 건너뛰는 경우가 많아요. 새로 고침 후 상태를 확인하세요. |
| **Add and configure** 후에도 MCP 도구 목록이 채워지지 않음 | 서버 URL 오류, OAuth 스코프 오류, 또는 계정에 Cortex Agent 없음. | 6단계의 URL 패턴을 다시 확인한 다음 `DESCRIBE INTEGRATION external_oauth_azure_1`을 실행하세요. |
| `LOGIN_HISTORY`에는 성공 기록이 있지만 `QUERY_HISTORY`에는 위임 사용자의 행이 없음 | SQL이 실행되기 전에 Cortex Agent 내부에서 도구 호출이 죽음. | 첫 번째 행과 같은 근본 원인. |

### 커스텀 커넥터 다시 확인하기

에이전트가 도구조차 검색하지 못한다면 커넥터 수준으로 내려가 보세요.

1. **Power Apps**를 열고 올바른 환경으로 전환한 다음 **More > Custom connectors**로 이동하세요.
2. Snowflake MCP 커넥터를 열고 **테스트(Test)** 탭으로 이동해 연결을 선택하고 작업을 실행하세요.
3. IP 관련 오류가 나오면 Snowflake의 네트워크 정책이 해당 Power Platform 리전의 이그레스(egress) IP를 허용하는지 확인하세요.
4. 역할이나 ACL 오류가 나오면 스코프가 `session:role-any`이고 `EXTERNAL_OAUTH_ANY_ROLE_MODE = ENABLE`인지 확인하세요.

MCP 기반 커넥터에서 **Test operation**을 처음 실행하면 `Schema validation` 경고와 함께 빨간색 `Operation failed (405)` 배너가 나타날 거예요. 정상이에요. 테스트 창이 MCP 엔드포인트가 거부하는 일반 GET을 보내다 보니, 응답 본문이 커넥터가 기대하는 스키마와 일치하지 않는 것뿐이에요. OAuth 핸드셰이크가 완료되고 연결이 연결됨으로 표시되는 한 커넥터는 올바르게 구성된 거예요. 실제 도구 호출은 여기가 아니라 Copilot Studio 테스트 창에서 검증하세요.

아래 스크린샷은 기반이 되는 커스텀 커넥터 페이지들이에요. 에이전트 UI 밖에서 OAuth 왕복을 점검하거나 다시 테스트해야 할 때 유용해요.

*자동 생성된 커넥터는 `HTTPS`와 Snowflake 계정 호스트를 써요. 스킴은 그대로 두고 호스트만 확인하면 돼요.*

*호스트가 `<orgname>-<accountname>.snowflakecomputing.com`과 정확히 일치하는지 확인하세요 — 끝에 경로나 프로토콜이 없어야 해요.*

*Resource URL은 `api://<RESOURCE_APP_CLIENT_ID>`와 일치해야 하고 스코프는 `session:role-any`여야 해요. 여기서 잘못된 대상(audience)이 토큰 거부의 가장 흔한 원인이에요.*

*녹색 "Invoke server" 응답은 OAuth 핸드셰이크가 완료되고 베어러 토큰이 MCP 엔드포인트에 도달했다는 뜻이에요.*

*405 + 스키마 유효성 검사 경고는 MCP 기반 커넥터에서 예상되는 동작이에요. 연결 자체가 연결됨으로 표시되는 한 무시하세요.*

### OAuth 왕복 다시 확인하기

모든 것이 올바른데도 토큰이 계속 거부된다면, Power Platform이 Snowflake에 보내는 JWT<sup>4</sup>를 디코딩(네트워크 추적 또는 커넥터 진단)해서 다음을 확인하세요.

- `aud`가 `api://<RESOURCE_APP_CLIENT_ID>`와 같은지.
- `iss`가 `https://sts.windows.net/<TENANT_ID>/`와 같은지.
- `upn`이 `SNOWSQL_DELEGATE_USER.LOGIN_NAME`과 일치하는지.

이 세 가지 중 하나라도 통합 설정과 다르면 Snowflake는 일반적인(generic) 오류와 함께 토큰을 거부해요.

## 배운 점

진행 과정에서 저희를 놀라게 한 몇 가지 요점이에요.

- **Snowflake 관리형 MCP는 단순한 패스스루가 아니에요.**<br>
  모든 호출이 Cortex Agent를 거치므로, 계정 수준의 Cortex 제한은 에이전트를 조용히 무력화해요.
- **Snowflake에는 항상 Copilot Studio에서 수동(Manual) OAuth를 선택하세요.**<br>
  동적 검색은 될 것처럼 보이지만 실패해도 알려주지 않아요.
- **리디렉션 URI는 설계상 닭이 먼저냐 달걀이 먼저냐의 문제예요.**<br>
  Azure를 두 번 거칠 걸 계획하세요. 한 번은 리소스 앱과 클라이언트 앱을 위해, 커넥터가 생성된 후 짧게 한 번 더.
- **메이커 연결과 최종 사용자 연결은 별도로 추적돼요.**<br>
  테스트 창 실패는 거의 항상 두 번째 연결이 수립되지 않은 것으로 귀결돼요.
- **`DEFAULT_SECONDARY_ROLES = ('ALL')`은 `session:role-any`가 실제로 동작할지를 결정하는 단 한 줄이에요.**<br>
  체크리스트에 고정해 둘 가치가 있어요.

## 마무리

이렇게 구성하면, 자연어를 받아 올바른 Cortex Search 도구를 고르고, 로그인한 사용자로 실행되며, 하나의 Snowflake 역할에 부여한 테이블만 볼 수 있는 에이전트가 완성돼요. 여기서부터는 Copilot Studio나 Entra를 전혀 건드리지 않고도 같은 MCP 서버에 도구를 더 추가하기 쉬워요(Cortex Analyst, 일반 저장 프로시저, `SYSTEM_EXECUTE_SQL`). 다음 연결 시 검색이 자동으로 반영해 주기 때문이에요.

같은 서버에 다른 MCP 도구(Cortex Analyst, 일반 저장 프로시저, `SYSTEM_EXECUTE_SQL`)를 연결하고 계신가요? 어떤 조합을 실행해 보셨고 무엇이 놀라웠는지 댓글로 남겨 주세요.

---

## 어휘 주석

1. **Cortex Agent:** Snowflake 관리형 MCP 서버의 모든 도구 호출을 실제로 실행하는 런타임 오케스트레이터. 계정에서 이 기능이 막혀 있으면 도구 검색은 성공해도 실제 호출은 전부 실패해요.
2. **위임된 사용자 OAuth(delegated user OAuth):** 애플리케이션이 자체 자격 증명이 아니라, 로그인한 사용자의 신원을 위임받아 API를 호출하는 OAuth 방식. 모든 쿼리가 서비스 계정이 아닌 실제 사용자 권한으로 실행돼요.
3. **OAuth 동적 클라이언트 등록(Dynamic Client Registration):** 클라이언트 앱이 사전 등록 없이 인증 서버에 스스로를 자동 등록하는 OAuth 확장 기능. Snowflake는 이를 지원하지 않으므로 수동으로 클라이언트를 등록해야 해요.
4. **JWT(JSON Web Token):** 클레임(주장) 정보를 JSON 형태로 담아 서명한 토큰. OAuth 인증에서 액세스 토큰으로 흔히 쓰이며, 발급자(`iss`)·대상(`aud`)·사용자 식별자(`upn`) 같은 정보를 담아요.

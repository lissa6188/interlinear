---
title: 'Copilot Studio에서 페이지 수준 PDF 인용 구현하기'
description: 'Copilot Studio에서 PDF 인용에 페이지 번호를 붙여 사용자가 정확한 페이지로 바로 이동하게 만드는 방법을 SharePoint와 업로드 파일 두 시나리오로 정리했어요.'
date: 2026-09-05
tags: ["Copilot Studio", "PDF 인용", "페이지 수준 인용", "SharePoint", "지식 소스"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/pdf-page-citations/card-01.png
  - /cards/pdf-page-citations/card-02.png
  - /cards/pdf-page-citations/card-03.png
  - /cards/pdf-page-citations/card-04.png
  - /cards/pdf-page-citations/card-05.png
  - /cards/pdf-page-citations/card-06.png
  - /cards/pdf-page-citations/card-07.png
---

> **원문:** [Page-Level PDF Citations in Copilot Studio](https://microsoft.github.io/mcscatblog/posts/pdf-page-level-citations/)
> **게시일:** 2026-05-19 · **저자:** Lewis Baybutt, Remi Dyon

Copilot Studio는 긴 PDF 파일을 기반으로 답변할 수 있지만, 기본 인용(citation)은 사용자를 문서의 맨 앞으로 돌려보내요. 정비 절차를 확인하는 현장 엔지니어, 정책 조항을 검증하는 컴플라이언스 검토자, 투약 지침을 확인하는 의료진에게 그것은 답변을 신뢰하는 것과 출처를 10분 동안 뒤지는 것의 차이예요.

페이지 수준 인용이 그 해답이에요. 문서 루트로 링크하는 대신, 특정 페이지 번호를 포함해 답변의 근거가 된 콘텐츠로 사용자를 곧바로 데려가는 인용 URL이 필요해요.

이 포스트에서는 Copilot Studio에서 PDF에 대한 페이지 수준 인용을 출력하는 방법을 보여드려요. 사용 중인 지식 소스에 따른 두 가지 시나리오, 페이지 마커가 반환되는 방식의 차이, 그리고 서로 다른 모델로 테스트할 때 주의할 점을 다뤄요.

## 패턴

이 포스트의 두 접근법 모두 Copilot Studio에서 동일한 가로채기(interception) 메커니즘을 사용해요. 생성형 오케스트레이션이 지식에 근거한 응답을 생성하면 `OnGeneratedResponse` 트리거가 발동돼요. 토픽으로 이에 반응하면 다음에 접근할 수 있어요.

- **`System.Response.FormattedText`** — 인용 푸터를 포함한 전체 응답 텍스트
- **`System.Response.Citations`** — `Name`, `Url`, `Text` 열을 가진 인용 테이블

기본 인용 푸터는 대략 이런 모습이에요.

```text
Here is the relevant information from the manual...

[1]: https://contoso.sharepoint.com/docs/manual.pdf "manual.pdf"
```

우리가 원하는 것은 이것이에요.

```text
Here is the relevant information from the manual...

[1]: https://contoso.sharepoint.com/docs/manual.pdf#page=37 "manual.pdf"
```

접근 방식은 두 시나리오 모두 같아요.

1. 생성된 응답을 가로채요
2. 인용 텍스트에서 페이지 마커를 파싱해요
3. PDF URL에 `#page=N`을 붙여 인용 푸터를 다시 만들어요
4. `System.ContinueResponse = false`로 기본 응답을 억제해요

두 접근법이 다른 지점은 **페이지 마커 형식**과 **URL 처리**예요. SharePoint와 업로드된 파일 지식 소스가 인용을 서로 다르게 반환하기 때문이에요.

| | SharePoint 지식 소스 | 업로드된 파일 (비정형 데이터<sup>1</sup>) |
|---|---|---|
| **페이지 마커 형식** | `<page_X>` | `<page value=X>` |
| **인용 URL** | 이미 SharePoint를 가리킴 | 외부 URL로 교체 필요 |
| **주요 샘플 사용 사례** | 기존 SharePoint 인용 개선 | 내부 인용을 URL을 가리키도록 교체 |

## 지식 소스로서의 SharePoint

에이전트가 [SharePoint를 지식 소스](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-add-sharepoint)로 사용한다면, 인용은 이미 올바른 SharePoint 문서를 가리키고 있어요. 여기서의 목표는 사용자가 클릭했을 때 올바른 페이지에 도착하도록 페이지 번호를 덧붙이는 것뿐이에요.

### 모델 동작과 인용 출력

생성형 답변이 SharePoint의 PDF에 근거할 때, `System.Response.Citations` 테이블의 인용 텍스트에는 `<page_X>` 형식(`X`는 페이지 번호)의 페이지 마커가 포함될 수 있어요.

> **참고:** 페이지 마커가 모든 인용에 보장되는 것은 아니에요. 이 샘플의 토픽 로직은 마커가 **있을 때** 감지하고, 없을 때는 문서 루트로 폴백해요. 즉 데이터가 있으면 페이지 수준의 정밀함을 얻고, 없으면 매끄럽게 폴백해요.

인용을 커스터마이징할 때 알아두어야 할 점은 모델마다 인용을 처리하는 방식이 다르다는 것이에요. 2026년 5월 기준, GPT-5 Chat은 같은 PDF의 여러 청크<sup>2</sup>가 응답의 근거로 사용되었더라도 소스 파일당 하나의 인용을 반환하는 경향이 있어요. 반면 Claude Sonnet 4.6은 여러 청크가 사용되면 같은 파일에 대해 여러 인용을 반환하므로, 근거로 사용된 페이지들에 대해 파일당 여러 인용을 출력할 수 있어요.

> **주의:** 인용 동작이 어떻게 달라지는지 이해하기 위해 다양한 모델로 에이전트를 평가하세요. 인용의 형태는 페이지 수준 경험에 직접적인 영향을 미치므로, 프로덕션용 모델을 선택할 때 고려해야 할 요소 중 하나예요. 모델 동작은 시간이 지나며 변할 수 있으니 지속적인 평가를 유지하세요.

### 토픽이 하는 일

토픽은 생성된 응답을 가로채고 각 인용에 대해 다음을 수행해요.

1. 인용된 파일이 PDF인지 확인해요(파일 확장자 기준)
2. 인용 텍스트에서 `<page_X>` 마커를 찾아요
3. 페이지 번호를 추출해 URL에 `#page=N`을 붙여요
4. Office 파일의 경우, 토픽 내 해당 변수에 따라 브라우저에서 열리도록 선택적으로 `?web=1`을 붙여요

SharePoint를 지식 소스로 사용할 때 PDF의 페이지 추출을 처리하는 PowerFx는 다음과 같아요.

```javascript
resolvedUrl: If(
    EndsWith(citation.Name, ".pdf"),
    citation.Url & "#page=" &
    If(
        Find("<page_", citation.Text) > 0,
        Mid(
            citation.Text,
            Find("<page_", citation.Text) + Len("<page_"),
            Find(">", citation.Text, Find("<page_", citation.Text))
                - Find("<page_", citation.Text) - Len("<page_")
        ),
        "1"
    ),
    // ... Office file handling
)
```

`Mid` 함수가 `<page_`와 `>` 사이에서 페이지 번호를 추출하며, 마커가 없으면 기본값으로 1페이지를 사용해요.

 _파일당 여러 참조와 함께 페이지별 인용을 표시하는 Copilot Studio_

### Office 파일: 브라우저에서 열까, 데스크톱에서 열까?

샘플에는 구성 가능한 변수 `OpenOfficeFilesInWeb`도 포함되어 있어요. `true`로 설정하면 Office 파일 URL(Word, Excel, PowerPoint)에 `?web=1`을 붙여 데스크톱 앱 대신 브라우저에서 강제로 열리게 해요.

### 전체 토픽 YAML

전체 토픽 YAML은 [CopilotStudioSamples 리포지토리](https://github.com/microsoft/CopilotStudioSamples/blob/main/authoring/snippets/topics/sharepoint-pdf-page-citations/sharepoint-pdf-citations.yml)에서 확인할 수 있어요.

<details>
<summary>전체 토픽 YAML 펼치기</summary>
<pre><code class="language-yaml">kind: AdaptiveDialog
beginDialog:
  kind: OnGeneratedResponse
  id: main
  priority: -1
  actions:
    - kind: SetVariable
      id: setVariable_HJ0sml
      displayName: Control whether Office Files should open in the web
      variable: Topic.OpenOfficeFilesInWeb
      value: =true

    - kind: SetVariable
      id: rZYmg1
      displayName: Store citations table
      variable: Topic.SystemCitations
      value: =System.Response.Citations

    - kind: SetVariable
      id: MHFmGu
      displayName: Store orchestrators response
      variable: Topic.SystemResponseText
      value: =System.Response.FormattedText

    - kind: ConditionGroup
      id: has-answer-conditions
      conditions:
        - id: has-answer
          condition: =CountRows(System.Response.Citations)&gt;0
          displayName: Only customise when citations are present
          actions:
            - kind: SetVariable
              id: setVariable_responseBody
              displayName: Response with citations table removed
              variable: Topic.ResponseBodyWithoutCitations
              value: |-
                =If(
                    Find(Char(10) &amp; Char(10) &amp; "[1]:", System.Response.FormattedText) &gt; 0,
                    Left(
                        System.Response.FormattedText,
                        Find(Char(10) &amp; Char(10) &amp; "[1]:", System.Response.FormattedText) - 1
                    ),
                    If(
                        Find(Char(10) &amp; "[1]:", System.Response.FormattedText) &gt; 0,
                        Left(
                            System.Response.FormattedText,
                            Find(Char(10) &amp; "[1]:", System.Response.FormattedText) - 1
                        ),
                        System.Response.FormattedText
                    )
                )

            - kind: SetVariable
              id: setVariable_EjZ42D
              displayName: Customise citations with PDF page references
              variable: Topic.CitationsSnip
              value: |-
                =Concat(
                    Sequence(CountRows(System.Response.Citations)),
                    With(
                        {
                            citation: Last(FirstN(System.Response.Citations, Value)),
                            citationIndex: Text(Value)
                        },
                        With(
                            {
                                resolvedUrl: If(
                                    EndsWith(citation.Name, ".pdf"),
                                    citation.Url &amp; "#page=" &amp;
                                    If(
                                        Find("&lt;page_", citation.Text) &gt; 0,
                                        Mid(
                                            citation.Text,
                                            Find("&lt;page_", citation.Text) + Len("&lt;page_"),
                                            Find("&gt;", citation.Text, Find("&lt;page_", citation.Text)) - Find("&lt;page_", citation.Text) - Len("&lt;page_")
                                        ),
                                        "1"
                                    ),
                                      If(
                                        Topic.OpenOfficeFilesInWeb And
                                        Or(
                                          EndsWith(Lower(citation.Name), ".doc"),
                                          EndsWith(Lower(citation.Name), ".docx"),
                                          EndsWith(Lower(citation.Name), ".ppt"),
                                          EndsWith(Lower(citation.Name), ".pptx"),
                                          EndsWith(Lower(citation.Name), ".xls"),
                                          EndsWith(Lower(citation.Name), ".xlsx")
                                        ),
                                        If(
                                          Find("web=1", Lower(citation.Url)) &gt; 0,
                                          citation.Url,
                                          citation.Url &amp; If(Find("?", citation.Url) &gt; 0, "&amp;web=1", "?web=1")
                                        ),
                                        citation.Url
                                      )
                                )
                            },
                            "[" &amp; citationIndex &amp; "]: " &amp; resolvedUrl &amp; " """ &amp; citation.Name &amp; """"
                        )
                    ),
                    Char(10)
                )

            - kind: SendActivity
              id: sendActivity_FplCvD
              displayName: Respond with formatted response + new citations table
              activity: |-
                {
                  Topic.ResponseBodyWithoutCitations &amp; Char(10) &amp; Char(10) &amp; Text(Topic.CitationsSnip)
                }

            - kind: SetVariable
              id: setVariable_jrTAIw
              displayName: Prevent orchestrator from responding directly
              variable: System.ContinueResponse
              value: =false

            - kind: EndDialog
              id: end-topic
              clearTopicQueue: true
</code></pre>
</details>

### 사전 요구 사항

- **생성형 오케스트레이션(Generative Orchestration)**이 활성화된 Copilot Studio 에이전트
- PDF 문서를 포함하는 하나 이상의 **SharePoint** 지식 소스 구성

### 설정 단계

1. 에이전트에 PDF가 포함된 SharePoint 지식 소스가 구성되어 있는지 확인해요. 참고로 모범 사례 ALM을 위해서는 [Copilot Studio의 동적 지식 URL](https://microsoft.github.io/mcscatblog/posts/dynamic-knowledge-urls-copilot-studio/)을 활용할 수 있어요.
2. 새 토픽을 만들고 **코드 편집기(Code editor)** 보기로 전환한 뒤 [YAML 파일](https://github.com/microsoft/CopilotStudioSamples/blob/main/authoring/snippets/topics/sharepoint-pdf-page-citations/sharepoint-pdf-citations.yml)의 내용을 붙여넣어요.
3. `OpenOfficeFilesInWeb` 변수를 검토해요. Office 파일을 데스크톱 앱 대신 브라우저에서 열고 싶다면 `true`로 설정하세요.
4. 토픽을 저장하고 PDF 문서를 인용하게 될 질문을 던져 테스트해요.

## 지식 소스로서의 업로드된 파일 (비정형 데이터)

에이전트가 [업로드된 파일을 지식 소스](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-add-file-upload)(비정형 데이터)로 사용한다면, 기본 인용은 원본 문서가 아니라 Dataverse에 호스팅된 청크를 가리켜요. 여기서 Remi의 [citation-swap 샘플](https://github.com/microsoft/CopilotStudioSamples/blob/main/authoring/snippets/topics/citation-swap/swap-citations.yml)이 더 유용한 해법을 제공해요.

### 이 접근법을 사용할 때

업로드된 파일 접근법은 특정 시나리오를 위해 설계되었어요. 문서를 Copilot Studio에 직접 업로드하는 방식을 지식 소스로 선택했지만, 인용이 미리 보기를 보여주는 대신 최종 사용자가 실제로 전체 문서에 접근할 수 있는 위치 — 예를 들어 공개 웹사이트 — 를 가리키기를 원하는 경우예요. PDF라면 페이지 수준의 정밀함까지 원할 거예요.

> **주의:** 업로드된 파일에는 역할 기반 접근 제어<sup>3</sup>가 없어요. 에이전트 사용자는 업로드된 모든 콘텐츠에서 생성된 답변에 접근할 수 있어요. 콘텐츠에 접근 제한이 필요하다면 SharePoint를 지식 소스로 사용하는 것을 고려하세요.

### 다른 마커 형식

업로드된 파일 지식 소스는 SharePoint가 사용하는 `<page_X>` 형식 대신 `<page value=X>`라는 다른 페이지 마커 형식을 사용해요. 파싱 로직이 이 차이를 반영해요.

업로드된 파일을 지식 소스로 사용할 때 PDF의 페이지 추출을 처리하는 PowerFx는 다음과 같아요.

```javascript
If(
    And(
        EndsWith(currentRecord.Name, ".pdf"),
        StartsWith(currentRecord.Text, "<page value=")
    ),
    "#page=" & Mid(
        currentRecord.Text,
        Find("<page value=", currentRecord.Text)
            + Len("<page value=") + 1,
        Find(">", currentRecord.Text)
            - Len("<page value=") - 3
    )
)
```

### 토픽이 하는 일

각 인용에 대해 토픽은 다음을 수행해요.

1. 인용 URL이 비어 있는지 확인해요(웹 소스가 아닌 업로드된 파일임을 의미)
2. 빈 URL을 외부 웹사이트 URL과 파일 이름을 결합한 것으로 교체해요
3. `<page value=X>` 마커가 있는 PDF에 대해 구성된 URL에 `#page=N`을 붙여요
4. 공백이 포함된 파일 이름의 URL 인코딩을 처리해요

토픽에서 구성해야 할 변수는 `externalWebsiteURL` 하나예요. 문서가 호스팅된 웹사이트의 기본 URL을 디렉터리 경로까지 포함해 설정하세요. 예: `https://www.contoso.com/documents/policies/`.

> **참고:** 웹사이트 디렉터리의 파일 이름은 Copilot Studio에 업로드된 파일 이름과 정확히 일치해야 해요. 토픽은 기본 URL과 파일 이름을 이어 붙여 URL을 구성해요.

### 전체 토픽 YAML

전체 토픽 YAML은 [CopilotStudioSamples 리포지토리](https://github.com/microsoft/CopilotStudioSamples/blob/main/authoring/snippets/topics/citation-swap/swap-citations.yml)에서 확인할 수 있어요.

<details>
<summary>전체 토픽 YAML 펼치기</summary>
<pre><code class="language-yaml">kind: AdaptiveDialog
beginDialog:
  kind: OnGeneratedResponse
  id: main
  condition: =CountRows(System.Response.Citations)&gt;0
  actions:
    - kind: SetVariable
      id: setVariable_xHJ4lf
      variable: Topic.Var1
      value: =System.Response.FormattedText

    - kind: SetVariable
      id: setVariable_wtNwaw
      variable: Topic.externalWebsiteURL
      value: https://yourwebsite.com/citations/

    - kind: SetVariable
      id: setVariable_9IFwdP
      variable: Topic.CitationsSnip
      value: |-
        =With(
            {CitationsTable: System.Response.Citations},
            Concat(
                ForAll(
                    Sequence(CountRows(CitationsTable)),
                    Value
                ),
                With(
                    {
                        currentRecord: Index(
                            CitationsTable,
                            Value
                        )
                    },
                //begin logic
                    "[" &amp; Text(Value) &amp; "]: " &amp; If(
                        IsBlank(currentRecord.Url),
                        If(
                            Left(
                                currentRecord.Name,
                                8
                            ) = "https://",
                            Substitute(
                                currentRecord.Name,
                                " ",
                                "%20"
                            ),
                            Substitute((Topic.externalWebsiteURL &amp; currentRecord.Name), " ", "%20") &amp;
                            If(
                                // check if cited source is a PDF and we have page data available
                                And(
                                    EndsWith(currentRecord.Name, ".pdf"),
                                    StartsWith(currentRecord.Text, "&lt;page value=")
                                ),
                                // add page for PDFs
                                "#page=" &amp; Mid(
                                    currentRecord.Text,
                                    Find("&lt;page value=", currentRecord.Text
                                    ) + Len("&lt;page value=") + 1,
                                    Find(
                                        "&gt;",
                                        currentRecord.Text
                                    ) - Len("&lt;page value=")-3
                                )
                            )
                        ),
                        currentRecord.Url
                    ) &amp; " " &amp; """" &amp;
                    Substitute(
                        If(
                            Find(
                                "?",
                                Last(
                                    Split(
                                        currentRecord.Name,
                                        "/"
                                    )
                                ).Value
                            ) &gt; 0,
                            Left(
                                Last(
                                    Split(
                                        currentRecord.Name,
                                        "/"
                                    )
                                ).Value,
                                Find(
                                    "?",
                                    Last(
                                        Split(
                                            currentRecord.Name,
                                            "/"
                                        )
                                    ).Value
                                )
                            ),
                            Last(
                                Split(
                                    currentRecord.Name,
   
                                    "/"
                                )
                            ).Value
                        ),
                        "%20",
                        " "
                    ) &amp; """"
                //end logic
                ),
                Char(10) &amp; Char(10)
            )
        )

    - kind: SendActivity
      id: sendActivity_i4mW3G
      activity: |-
        {If(
            System.Activity.ChannelId = "msteams",
            System.Response.FormattedText &amp; Char(10) &amp; Char(10) &amp; Text(Topic.CitationsSnip),
            Left(System.Response.FormattedText, Find("[1]:", System.Response.FormattedText) + -1) &amp; Char(10) &amp; Char(10) &amp; Text(Topic.CitationsSnip)
        )}

    - kind: SetVariable
      id: setVariable_jVzQGX
      variable: System.ContinueResponse
      value: false

inputType: {}
outputType: {}
</code></pre>
</details>

### 사전 요구 사항

- **생성형 오케스트레이션**이 활성화된 Copilot Studio 에이전트
- PDF 문서를 포함하는 [업로드된 파일 지식 소스](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-add-file-upload)
- 동일한 문서를 호스팅하는 링크 가능한 사이트

### 설정 단계

1. PDF 파일을 지식 소스로 에이전트에 업로드해요.
2. 동일한 파일이 일치하는 파일 이름으로 공개 URL에서 제공되는지 확인해요.
3. 새 토픽을 만들고 **코드 편집기** 보기로 전환한 뒤 [YAML 파일](https://github.com/microsoft/CopilotStudioSamples/blob/main/authoring/snippets/topics/citation-swap/swap-citations.yml)의 내용을 붙여넣어요.
4. `externalWebsiteURL` 변수를 디렉터리 경로를 포함한 웹사이트의 기본 URL로 업데이트해요.
5. 토픽을 저장하고 PDF 문서를 인용하게 될 질문을 던져 테스트해요.

## 올바른 접근법 선택하기

어떤 샘플을 사용할지 확신이 서지 않는다면, 결국 지식 소스가 무엇이냐로 귀결돼요.

- **SharePoint 지식 소스.**<br>
  [SharePoint PDF 페이지 인용 샘플](https://github.com/microsoft/CopilotStudioSamples/blob/main/authoring/snippets/topics/sharepoint-pdf-page-citations/sharepoint-pdf-citations.yml)을 사용하세요. 인용에 이미 SharePoint를 가리키는 URL이 있으므로, 토픽은 페이지 정보만 추가하면 돼요.
- **업로드된 파일.**<br>
  [citation-swap 샘플](https://github.com/microsoft/CopilotStudioSamples/blob/main/authoring/snippets/topics/citation-swap/swap-citations.yml)을 사용하세요. 인용 URL을 통째로 교체해야 하며, 그 과정에서 페이지 정밀도도 함께 추가할 수 있어요.

더 나아가고 싶다면 — 예를 들어 커스텀 플랫폼을 위한 지식과 커스터마이징된 인용 처리 — 인덱스 수준에서 인용 URL을 매핑할 수 있는 [Azure AI Search 지식 소스](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-azure-ai-search) 사용을 고려해 보세요.

인용을 아예 제거하고 싶다면 Henry가 [\[1\] 없애기: Copilot Studio 답변에서 인용을 제거하는 방법](https://microsoft.github.io/mcscatblog/posts/remove-citations-in-copilot-studio-answer/)에서 다뤘어요.

## 요약

이 샘플들과 이 글의 안내를 활용하면 인용 데이터를 커스터마이징된 방식으로 처리해, 사용자가 항상 PDF의 1페이지에 도착하는 기본 동작 대신 페이지별 인용을 출력할 수 있어요. 사용자가 올바른 부분을 찾으려고 파일을 10분씩 스크롤할 여유가 없는 시나리오라면, 페이지 마커 데이터가 있을 때 이를 처리하는 페이지별 인용을 구현해 사용자가 필요한 콘텐츠에 도달하는 시간을 절약해 주세요.

기억해 둘 핵심 사항 몇 가지예요.

- **페이지 수준 PDF 인용은 이렇게 구현돼요.**<br>
  `System.Response.Citations` 테이블에서 페이지 마커를 파싱해 인용 URL에 `#page=N`을 붙여요.
- **SharePoint와 업로드된 파일은 서로 다른 마커 형식을 사용해요.**<br>
  SharePoint는 `<page_X>`, 업로드된 파일은 `<page value=X>`를 써요.
- **페이지 마커가 항상 반환되는 것은 아니에요.**<br>
  토픽 로직은 문서 루트로 폴백하며 이를 매끄럽게 처리해요.
- **모델 선택이 인용 동작에 영향을 줘요.**<br>
  2026년 5월 기준, Claude Sonnet 4.6은 파일당 여러 인용을 반환해 여러 페이지 참조가 가능하고, GPT-5 Chat은 단일 인용으로 통합하는 경향이 있어요. 다양한 모델로 평가하고 인용 동작을 모델 선택의 고려 요소에 포함하세요.
- **PDF가 아닌 파일도 인용을 받아요.**<br>
  두 샘플 모두 PDF뿐 아니라 모든 파일 유형에 대해 인용을 출력해요. SharePoint 샘플에는 `?web=1` 매개변수를 통해 Office 파일(Word, Excel, PowerPoint)이 브라우저에서 열리도록 하는 방법도 포함되어 있어요.
- **두 샘플 모두 같은 기본 패턴을 사용해요.**<br>
  `OnGeneratedResponse`로 가로채고, 인용 푸터를 다시 만들고, `System.ContinueResponse = false`로 기본 응답을 억제해요.

에이전트에서 인용을 커스터마이징해 보셨나요? 시도해 본 다른 인용 커스터마이징 시나리오를 댓글로 공유해 주세요.

---

## 어휘 주석

1. **비정형 데이터(unstructured data):** 표나 필드처럼 정해진 구조가 없는 데이터. PDF, 문서 파일처럼 형식이 자유로운 텍스트·파일이 여기에 해당해요.
2. **청크(chunk):** 긴 문서를 검색과 처리에 알맞게 잘라 놓은 작은 조각. 에이전트는 문서 전체가 아니라 이 조각 단위로 내용을 찾아 답변의 근거로 써요.
3. **역할 기반 접근 제어(RBAC, Role-Based Access Control):** 사용자의 역할(직책, 권한 그룹 등)에 따라 어떤 데이터를 볼 수 있는지 다르게 제한하는 방식.

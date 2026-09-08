---
title: '하나의 카드: 한 번 만들어 모든 언어로 말하기'
description: 'Copilot Studio 어댑티브 카드의 정적 텍스트가 이제 지역화 파일에 자동으로 나타나서 다운로드·번역·업로드만으로 끝나고, 혼합 콘텐츠는 Set text variable로 처리하는 법을 정리했어요.'
date: 2026-09-08
tags: ["Copilot Studio", "어댑티브 카드", "지역화", "다국어 에이전트", "Set text variable"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/adaptive-card-localization/card-01.png
  - /cards/adaptive-card-localization/card-02.png
  - /cards/adaptive-card-localization/card-03.png
  - /cards/adaptive-card-localization/card-04.png
  - /cards/adaptive-card-localization/card-05.png
  - /cards/adaptive-card-localization/card-06.png
  - /cards/adaptive-card-localization/card-07.png
---

> **원문:** [The One Card: Build Once, Speak All Languages](https://microsoft.github.io/mcscatblog/posts/localize-adaptive-cards/)
> **게시일:** 2026-01-08 · **저자:** Adi Leibowitz

Copilot Studio에서 다국어 에이전트를 만들어 보셨다면 익숙한 절차가 있을 거예요. 토픽 메시지를 번역하고, 지역화(localization) 파일을 관리하고, 이를 반복하는 것이죠. 그런데 어댑티브 카드(Adaptive Card) 안의 정적 텍스트는 어떨까요?

최근까지는 그것이 전혀 다른 이야기였고, 그다지 유쾌한 이야기도 아니었어요.

## 과거의 현실: 두 개의 지역화 워크플로

예전에는 이렇게 동작했어요.

- **일반 토픽 콘텐츠의 경우.**<br>
  JSON/ResX<sup>1</sup> 지역화 파일을 다운로드하고, 문자열을 번역하고, 업로드해요. 끝. 아름다워요. 이 과정은 [문서화되어 있고 간단해요](https://learn.microsoft.com/en-us/microsoft-copilot-studio/multilingual).
- **어댑티브 카드의 경우.**<br>
  언어별로 별도의 카드 정의를 수동으로 유지하거나, 로캘<sup>2</sup>에 따라 텍스트를 바꾸는 복잡한 Power Fx 표현식을 만들거나, 아니면... 글쎄요, 좋은 선택지가 많지 않았어요.

어댑티브 카드는 풍부한 정보를 전달하고 사용자로부터 구조화된 데이터를 수집하는 데 완벽한 도구예요. [Dave가 보여준 것처럼](https://microsoft.github.io/mcscatblog/posts/adaptive-card-generation/) 동적으로 생성해 놀라운 사용자 경험을 제공할 수도 있어요. 하지만 진정한 글로벌 에이전트를 만들고 있다면, 그 카드들이 사용자가 쓰는 모든 언어에서 동작해야 해요.

## 새로운 현실: 모두를 지배할 단 하나의 카드

**큰 소식이 있어요**: 이제 어댑티브 카드의 정적 텍스트가 지역화 파일에 나타나요.

그게 전부예요. 그게 바로 돌파구예요.

모든 `TextBlock` 값, 버튼 제목, 플레이스홀더 텍스트, 오류 메시지가 에이전트의 나머지 부분에 이미 사용하고 있는 것과 동일한 JSON/ResX 파일에 표시돼요. 한 번 다운로드하고, 한 번 번역하고, 한 번 업로드하면 돼요. 카드를 한 번 만들면, 에이전트가 지원하는 모든 언어로 말해요.

## 실제로 이것이 의미하는 것

실제 예제를 살펴봐요. 도서 추천 에이전트를 만들고 있다고 해봐요(안 될 이유가 없죠). 추천 결과를 아름다운 어댑티브 카드로 보여주고 싶어요.

_지역화 가능한 텍스트가 곳곳에 있는 도서 추천용 어댑티브 카드_

<details markdown="1">
<summary>전체 어댑티브 카드 JSON을 펼치려면 클릭</summary>

````json
{
    "$schema": "https://adaptivecards.io/schemas/adaptive-card.json",
    "type": "AdaptiveCard",
    "version": "1.5",
    "fallbackText": "Book recommendation: The Fellowship of the Ring by J. R. R. Tolkien",
    "body": [
        {
            "type": "Container",
            "bleed": true,
            "style": "emphasis",
            "items": [
                {
                    "type": "TextBlock",
                    "text": "✨ Book Recommendation",
                    "weight": "Bolder",
                    "size": "Small",
                    "wrap": true
                }
            ]
        },
        {
            "type": "Container",
            "spacing": "Medium",
            "items": [
                {
                    "type": "ColumnSet",
                    "columns": [
                        {
                            "type": "Column",
                            "width": "auto",
                            "items": [
                                {
                                    "type": "Image",
                                    "url": "https://covers.openlibrary.org/b/isbn/9780261102354-M.jpg",
                                    "altText": "The Fellowship of the Ring cover",
                                    "size": "Medium"
                                }
                            ]
                        },
                        {
                            "type": "Column",
                            "width": "stretch",
                            "items": [
                                {
                                    "type": "TextBlock",
                                    "text": "The Fellowship of the Ring",
                                    "weight": "Bolder",
                                    "size": "Large",
                                    "wrap": true
                                },
                                {
                                    "type": "TextBlock",
                                    "text": "J. R. R. Tolkien",
                                    "isSubtle": true,
                                    "spacing": "None",
                                    "wrap": true
                                },
                                {
                                    "type": "TextBlock",
                                    "text": "★★★★★  •  Epic fantasy classic •  ~400–500 pages (edition varies)",
                                    "spacing": "Small",
                                    "wrap": true
                                },
                                {
                                    "type": "TextBlock",
                                    "text": "A quiet hobbit inherits a dangerous ring—and sets out from the Shire into a widening war, with a fellowship of allies and an impossible task: destroy the One Ring.",
                                    "wrap": true,
                                    "spacing": "Medium"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "Container",
                    "spacing": "Medium",
                    "items": [
                        {
                            "type": "TextBlock",
                            "text": "Why you might like it",
                            "weight": "Bolder",
                            "wrap": true
                        },
                        {
                            "type": "FactSet",
                            "facts": [
                                {
                                    "title": "Vibe",
                                    "value": "Mythic, cozy-to-cataclysmic, wondrous"
                                },
                                {
                                    "title": "If you liked",
                                    "value": "deep lore + quest stories + rich worldbuilding"
                                },
                                {
                                    "title": "Best for",
                                    "value": "classic adventure with heart (and real danger)"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "Container",
                    "spacing": "Medium",
                    "items": [
                        {
                            "type": "TextBlock",
                            "text": "Mood palette",
                            "weight": "Bolder",
                            "wrap": true
                        },
                        {
                            "type": "ColumnSet",
                            "columns": [
                                {
                                    "type": "Column",
                                    "width": "stretch",
                                    "items": [
                                        {
                                            "type": "Container",
                                            "style": "emphasis",
                                            "items": [
                                                {
                                                    "type": "TextBlock",
                                                    "text": "🍃 Cozy",
                                                    "wrap": true,
                                                    "spacing": "None"
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "type": "Column",
                                    "width": "stretch",
                                    "items": [
                                        {
                                            "type": "Container",
                                            "style": "emphasis",
                                            "items": [
                                                {
                                                    "type": "TextBlock",
                                                    "text": "🧙 Wonder",
                                                    "wrap": true,
                                                    "spacing": "None"
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "type": "Column",
                                    "width": "stretch",
                                    "items": [
                                        {
                                            "type": "Container",
                                            "style": "emphasis",
                                            "items": [
                                                {
                                                    "type": "TextBlock",
                                                    "text": "⚔️ Doom",
                                                    "wrap": true,
                                                    "spacing": "None"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    "actions": [
        {
            "type": "Action.OpenUrl",
            "title": "View on Open Library",
            "url": "https://openlibrary.org/search?q=The+Fellowship+of+the+Ring+Tolkien"
        },
        {
            "type": "Action.OpenUrl",
            "title": "Get a sample",
            "url": "https://www.google.com/search?q=The+Fellowship+of+the+Ring+preview"
        },
        {
            "type": "Action.Submit",
            "title": "Add to reading list",
            "data": {
                "action": "add_to_reading_list",
                "book": {
                    "title": "The Fellowship of the Ring",
                    "author": "J. R. R. Tolkien"
                }
            }
        }
    ]
}
```
</details><br/>

이 많은 텍스트를 보세요! *Book Recommendation*, *Why you might like it*, *Mood palette*, 버튼 제목, 이미지 대체 텍스트까지—에이전트가 여러 언어를 지원한다면 이 모든 것이 번역되어야 해요.

### 번역 워크플로

카드를 이탈리아어로 번역하고 싶다고 해봐요. (재미있는 사실: 이탈리아어판에서 성큼걸이(Strider)가 "Grampasso"로 불린다는 것을 아셨나요? 정말 멋지죠. 그리고 "Aragorn"은 이탈리아에서 흔한 허브 이름이기도 해요... 네, 마지막 건 제가 지어냈어요. 하지만 사실이었어야 *마땅한* 이야기죠.)

어쨌든 이탈리아어 번역으로 돌아가요. 이탈리아어(또는 어떤 보조 언어든)의 지역화 파일을 다운로드하면, 어댑티브 카드의 모든 정적 텍스트가 일반 토픽 콘텐츠와 나란히 나타나요. 다음과 같은 내용이 보여요.

```json
{
  "'dialog(copilots_header_392e9.topic.recommendbooks)'.'trigger(main)'.'action(sendActivity_a7aWmy)'.Activity.Attachments[0].CardContent.actions[0].title": "View on Open Library",
  "'dialog(copilots_header_392e9.topic.recommendbooks)'.'trigger(main)'.'action(sendActivity_a7aWmy)'.Activity.Attachments[0].CardContent.actions[1].title": "Get a sample",
  "'dialog(copilots_header_392e9.topic.recommendbooks)'.'trigger(main)'.'action(sendActivity_a7aWmy)'.Activity.Attachments[0].CardContent.actions[2].title": "Add to reading list",
  "'dialog(copilots_header_392e9.topic.recommendbooks)'.'trigger(main)'.'action(sendActivity_a7aWmy)'.Activity.Attachments[0].CardContent.body[0].items[0].text": "✨ Book Recommendation",
  "'dialog(copilots_header_392e9.topic.recommendbooks)'.'trigger(main)'.'action(sendActivity_a7aWmy)'.Activity.Attachments[0].CardContent.body[1].items[0].columns[0].items[0].altText": "The Fellowship of the Ring cover",
  "'dialog(copilots_header_392e9.topic.recommendbooks)'.'trigger(main)'.'action(sendActivity_a7aWmy)'.Activity.Attachments[0].CardContent.body[1].items[1].items[0].text": "Why you might like it",
  "'dialog(copilots_header_392e9.topic.recommendbooks)'.'trigger(main)'.'action(sendActivity_a7aWmy)'.Activity.Attachments[0].CardContent.body[1].items[1].items[1].facts[0].title": "Vibe",
  "'dialog(copilots_header_392e9.topic.recommendbooks)'.'trigger(main)'.'action(sendActivity_a7aWmy)'.Activity.Attachments[0].CardContent.body[1].items[1].items[1].facts[0].value": "Mythic, cozy-to-cataclysmic, wondrous",
  "'dialog(copilots_header_392e9.topic.recommendbooks)'.'trigger(main)'.'action(sendActivity_a7aWmy)'.Activity.Attachments[0].CardContent.body[1].items[2].items[0].text": "Mood palette",
  "'dialog(copilots_header_392e9.topic.recommendbooks)'.'trigger(main)'.'action(sendActivity_a7aWmy)'.Activity.Attachments[0].CardContent.body[1].items[2].items[1].columns[0].items[0].items[0].text": "🍃 Cozy",
  "'dialog(copilots_header_392e9.topic.recommendbooks)'.'trigger(main)'.'action(sendActivity_a7aWmy)'.Activity.Attachments[0].CardContent.body[1].items[2].items[1].columns[1].items[0].items[0].text": "🧙 Wonder",
  "'dialog(copilots_header_392e9.topic.recommendbooks)'.'trigger(main)'.'action(sendActivity_a7aWmy)'.Activity.Attachments[0].CardContent.body[1].items[2].items[1].columns[2].items[0].items[0].text": "⚔️ Doom",
  "'dialog(copilots_header_392e9.topic.recommendbooks)'.'trigger(main)'.'action(sendActivity_a7aWmy)'.Activity.Attachments[0].CardContent.fallbackText": "Book recommendation: The Fellowship of the Ring by J. R. R. Tolkien"
}
```

어댑티브 카드의 모든 정적 텍스트가 고유한 경로를 가진 항목으로 생성돼요. 키는 장황하지만(다이얼로그, 토픽, 액션, 카드 구조상의 정확한 위치가 포함돼요), 여러분은 값을 번역하는 데만 집중하면 돼요.

이탈리아어로 번역하고 나면 지역화 파일은 다음과 같이 돼요.

```json
{
  "'dialog(copilots_header_392e9.topic.recommendbooks)'.'trigger(main)'.'action(sendActivity_a7aWmy)'.Activity.Attachments[0].CardContent.actions[0].title": "Vedi su Open Library",
  "'dialog(copilots_header_392e9.topic.recommendbooks)'.'trigger(main)'.'action(sendActivity_a7aWmy)'.Activity.Attachments[0].CardContent.actions[1].title": "Leggi un estratto",
  "'dialog(copilots_header_392e9.topic.recommendbooks)'.'trigger(main)'.'action(sendActivity_a7aWmy)'.Activity.Attachments[0].CardContent.actions[2].title": "Aggiungi alla lista di lettura",
  "'dialog(copilots_header_392e9.topic.recommendbooks)'.'trigger(main)'.'action(sendActivity_a7aWmy)'.Activity.Attachments[0].CardContent.body[0].items[0].text": "✨ Consiglio di lettura",
  "'dialog(copilots_header_392e9.topic.recommendbooks)'.'trigger(main)'.'action(sendActivity_a7aWmy)'.Activity.Attachments[0].CardContent.body[1].items[0].columns[0].items[0].altText": "Copertina del libro La compagnia dell'anello",
  "'dialog(copilots_header_392e9.topic.recommendbooks)'.'trigger(main)'.'action(sendActivity_a7aWmy)'.Activity.Attachments[0].CardContent.body[1].items[1].items[0].text": "Perché potrebbe piacerti",
  "'dialog(copilots_header_392e9.topic.recommendbooks)'.'trigger(main)'.'action(sendActivity_a7aWmy)'.Activity.Attachments[0].CardContent.body[1].items[1].items[1].facts[0].title": "Atmosfera",
  "'dialog(copilots_header_392e9.topic.recommendbooks)'.'trigger(main)'.'action(sendActivity_a7aWmy)'.Activity.Attachments[0].CardContent.body[1].items[1].items[1].facts[0].value": "Mitica, dal confortevole al catastrofico, meravigliosa",
  "'dialog(copilots_header_392e9.topic.recommendbooks)'.'trigger(main)'.'action(sendActivity_a7aWmy)'.Activity.Attachments[0].CardContent.body[1].items[2].items[0].text": "Palette dell'atmosfera",
  "'dialog(copilots_header_392e9.topic.recommendbooks)'.'trigger(main)'.'action(sendActivity_a7aWmy)'.Activity.Attachments[0].CardContent.body[1].items[2].items[1].columns[0].items[0].items[0].text": "🍃 Accogliente",
  "'dialog(copilots_header_392e9.topic.recommendbooks)'.'trigger(main)'.'action(sendActivity_a7aWmy)'.Activity.Attachments[0].CardContent.body[1].items[2].items[1].columns[1].items[0].items[0].text": "🧙 Meraviglia",
  "'dialog(copilots_header_392e9.topic.recommendbooks)'.'trigger(main)'.'action(sendActivity_a7aWmy)'.Activity.Attachments[0].CardContent.body[1].items[2].items[1].columns[2].items[0].items[0].text": "⚔️ Tenebra",
  "'dialog(copilots_header_392e9.topic.recommendbooks)'.'trigger(main)'.'action(sendActivity_a7aWmy)'.Activity.Attachments[0].CardContent.fallbackText": "Consiglio di lettura: La compagnia dell'anello di J. R. R. Tolkien"
}
```

이 파일을 업로드하면, 이탈리아 사용자가 에이전트와 상호 작용할 때 완전히 지역화된 카드를 보게 돼요.

_같은 카드가 이탈리아 사용자를 위해 자동으로 지역화된 모습_

## 혼합 콘텐츠

여기서부터는 조금 더 복잡해져요. 어댑티브 카드에 정적 텍스트와 동적 값이 섞여 있다면 어떨까요? 예를 들어 카드에 다음과 같은 메시지가 있다고 상상해 봐요.

**"You've read 12 of 547 pages in The Fellowship of the Ring"**

숫자(`12`와 `547`)는 변수에서 오는 값으로 사용자마다 달라요. 하지만 주변 텍스트("You've read", "of", "pages in")는 번역이 필요해요.

안타깝게도 이런 혼합 콘텐츠 문자열은 지역화 파일에 자동으로 나타나지 않아요. 플랫폼 혼자서는 정적 텍스트와 동적 값을 분리할 수 없기 때문이에요.

### 우회 방법: Set text variable

Copilot Studio에는 **Set text variable**이라는 숨겨진 노드가 있어요. 간달프의 진짜 이름(궁금하셨다면, 마이아 올로린이에요)처럼 그늘 속에 존재해서, 작성 캔버스에서 직접 만들 수는 없고 코드 편집기를 통해서만 만들 수 있어요. 그리고 간달프 본인처럼(비유를 밀어붙여 볼게요, 여러분!) 처음 보이는 것보다 훨씬 강력해요. 무엇이든(테이블, 레코드 등) 텍스트로 변환할 수 있고, 우리 목적에 더 중요한 것은, 정적 텍스트와 변수 참조를 결합한 문자열을 만들면서 *동시에* 그것을 지역화 가능하게 만들어 준다는 점이에요.

혼합 콘텐츠를 처리하는 전체 과정은 [공식 Copilot Studio 지역화 가이드](https://learn.microsoft.com/en-us/microsoft-copilot-studio/multilingual#make-dynamic-content-from-adaptive-cards-available-for-localization)에 문서화되어 있지만, 간단히 요약하면 다음과 같아요.

1. 어댑티브 카드 액션 앞에 변수 값 설정(Set variable value) 노드를 추가해요
2. 코드 편집기를 열고 `kind: SetVariable`을 `kind: SetTextVariable`로 변경해요
3. 변수 플레이스홀더가 포함된 혼합 콘텐츠를 입력해요
4. 어댑티브 카드에서 이 중간 변수를 참조해요

반지의 제왕 예제에서 YAML은 다음과 같이 생겼어요.

```yaml
actions:
  - kind: SetTextVariable
    id: readingProgress
    variable: Topic.progressMessage
    value: "You've read {Topic.currentPage} of {Topic.totalPages} pages in {Topic.bookTitle}"
```

그런 다음 어댑티브 카드에서는 문자열을 인라인으로 조립하는 대신 `Topic.progressMessage`를 참조해요.

지역화 파일을 다운로드하면 변수 플레이스홀더가 포함된 전체 문자열이 번역 준비 상태로 표시돼요.

```json
{
  "'dialog(copilots_header_392e9.topic.recommendbooks)'.'trigger(main)'.'action(readingProgress)'.Value": "You've read {Topic.currentPage} of {Topic.totalPages} pages in {Topic.bookTitle}"
}
```

변수 플레이스홀더를 유지하면서 이탈리아어로 번역해요.

```json
{
  "'dialog(copilots_header_392e9.topic.recommendbooks)'.'trigger(main)'.'action(readingProgress)'.Value": "Hai letto {Topic.currentPage} di {Topic.totalPages} pagine in {Topic.bookTitle}"
}
```

> **팁:** Set text variable 노드는 지역화 외에도 엄청나게 유용해요. 테이블, 레코드, 복잡한 객체를 텍스트로 변환할 수 있어요.

## 핵심 요점

- **정적 어댑티브 카드 텍스트가 이제 지역화 파일에 나타나요.**<br>
  한 번 만들고, 다른 모든 것과 똑같이 번역하세요.
- **복잡한 카드 관리 워크플로가 필요 없어요.**<br>
  모든 콘텐츠에 동일한 다운로드/번역/업로드 프로세스를 사용해요.
- **혼합 콘텐츠는 Set text variable로 지역화할 수 있어요.**<br>
  정적 텍스트와 동적 값을 번역 가능한 문자열로 결합하세요.

---

*어댑티브 카드로 다국어 에이전트를 만들고 계신가요? 이 기능이 워크플로를 어떻게 바꾸었나요? 그리고 가장 중요한 질문, 카드를 모르도르 암흑어로도 번역하셨나요? 댓글로 알려주세요!*

![랄프 박시의 반지의 제왕](https://imgix.bustle.com/uploads/image/2023/11/5/a3e9854d-2adc-4b87-a157-2e71a5e68319-screen-shot-2023-11-04-at-62827-pm-copy.jpg?w=1440&h=720&fit=crop&crop=faces&dpr=2)
_랄프 박시(Ralph Bakshi)의 '반지의 제왕'._

---

## 어휘 주석

1. **ResX:** .NET 애플리케이션에서 언어별 문자열을 담아 관리하는 XML 기반 리소스 파일 형식.
2. **로캘(Locale):** 언어와 지역(예: 한국어-대한민국)을 함께 지정해 텍스트·날짜·통화 표기 방식 등을 결정하는 설정값.

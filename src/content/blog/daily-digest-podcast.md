---
title: '매일 아침 다이제스트를 진짜 듣게 되는 팟캐스트로 바꾸기'
description: '매일 안 읽는 다이제스트 이메일을 Copilot Studio 스킬과 Azure Speech 커넥터로 Nova와 Miles가 대화하는 팟캐스트 대본·오디오로 바꾸는 방법을 정리했어요.'
date: 2026-09-04
tags: ["Copilot Studio", "Azure Speech", "SSML", "팟캐스트", "AI 에이전트"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/daily-digest-podcast/card-01.png
  - /cards/daily-digest-podcast/card-02.png
  - /cards/daily-digest-podcast/card-03.png
  - /cards/daily-digest-podcast/card-04.png
  - /cards/daily-digest-podcast/card-05.png
  - /cards/daily-digest-podcast/card-06.png
  - /cards/daily-digest-podcast/card-07.png
  - /cards/daily-digest-podcast/card-08.png
---
> **원문:** [Turn Your Daily Digest Into a Podcast You'll Actually Listen To](https://microsoft.github.io/mcscatblog/posts/podcast-script-skill/)
> **게시일:** 2026-07-28 · **저자:** Remi Dyon

매일 아침 7시 12분, 언론 리뷰(press review)가 제 받은 편지함에 도착해요. 열다섯 개의 헤드라인, 각각 세 단락, 누가 봐도 정성 들여 큐레이션한 거예요. 그리고 매일 아침 저는 그걸 열고, 4초 만에 맨 아래까지 스크롤한 다음, 나중에 제대로 읽겠다고 다짐해요.

나중에 제대로 읽은 적은 한 번도 없어요.

답답한 건, 눈은 바쁘지만 귀는 한가한 완벽한 40분이 매일 있다는 거예요. 바로 출퇴근길이죠. 러닝머신 위에서도 마찬가지고, 요리할 때도 마찬가지예요. 그 이메일 내용을 다 흡수하기에 충분하고도 남는 시간이지만, 그중 어느 시간도 글을 읽는 데는 쓸 수 없어요.

그래서 이메일을 받아 팟캐스트 에피소드로 바꿔주는 에이전트를 만들었어요. 두 명의 진행자, 진짜 대화, 대략 6분 분량으로요. 기차 안에서 제 헤드폰으로 재생돼요.

오늘 다룰 내용은 이래요.

1. **제가 실제로 원했던 것** — 그리고 요약본이 왜 그것이 아닌지
2. **Azure Speech 엔드포인트** — 만들고 에이전트에 연결하기
3. **스킬** — 무엇을 하는지, 그리고 왜 이것이 스킬이어야 했는지
4. **Teams와 M365 Copilot에 게시**해서 휴대폰에 도착하게 하기
5. **팟캐스트처럼 들릴지 열차 안내방송처럼 들릴지를 결정하는 SSML<sup>1</sup> 디테일**

> **주의:** 이 글은 **GitHub Copilot 하네스**가 필요해요. 스킬은 Standard 하네스가 아니라 거기에 있고, 이 글의 내용 전부가 스킬에 달려 있거든요. 아직 [그걸로 빌드하고 있지 않다면](https://techcommunity.microsoft.com/blog/copilot-studio-blog/meet-the-new-copilot-studio-rebuilt-for-more-complex-multi-step-work/4526488), 이 글은 빌드 가이드라기보다는 미리 보기로 봐주세요.

---

## 제가 실제로 원했던 것

목표부터 정확히 짚고 갈게요. "내 이메일 요약해줘"가 목표는 아니에요. 그 언론 리뷰를 에이전트에게 요약시켜본 적은 이미 있거든요. 돌아오는 건 불릿 리스트인데, 읽기에는 나무랄 데 없지만 듣기에는 끔찍한 산출물이에요. 불릿을 소리 내어 읽으면 꼭 화재 대피 훈련 안내처럼 들려요.

무언가를 들을 만하게 만드는 건 두 사람 사이의 마찰이에요. 한 사람이 숫자를 말하면, 다른 사람이 "잠깐, 기준이 뭔데?"라고 되물어요. 그 주고받음이 사실을 기억에 남게 해요. NotebookLM의 오디오 오버뷰 형식이 그렇게 빨리 유행한 이유이고, 제가 제 받은 편지함에 원했던 형식이에요.

그래서 에이전트는 세 가지를 만들어내요.

| 산출물 | 용도 |
| --- | --- |
| `<slug>_Podcast_Script.txt` | 사람이 읽을 수 있는 대본이에요. `NOVA:` / `MILES:` 라벨이 붙어 있어서 들을 내용을 미리 훑어볼 수 있어요 |
| `<slug>_Podcast.ssml` | 기계용 산출물이에요. 멀티보이스 SSML만 담겨 있고, 텍스트 음성 변환 서비스에 바로 넘길 수 있어요 |
| `<slug>_Podcast.wav` | 요청하면 만들어지는 내레이션 에피소드예요 |

소스는 거의 뭐든 될 수 있어요. 뉴스레터, 언론 리뷰, 채팅에 붙여넣은 기사 모음, PDF, 문서까지요. 특정 주제에 대한 에피소드를 원한다면 소스가 아예 없어도 돼요. 회의 전에 검토했어야 할 12페이지짜리 아키텍처 문서에도 써봤는데, 대충 훑어보는 것보다 진짜 더 제대로 준비가 됐어요.

뭘 만들 건지 감이 오도록, 빌드하기 전에 완성된 모습부터 보여드릴게요.

_다이제스트를 붙여넣고, 세그먼트 구성을 받고, 오디오에 예스라고 답하면 `.wav`가 나와요. 이 루프 전체가 하나의 대화예요._

## 1부: Azure Speech 엔드포인트

에이전트에게는 실제로 오디오를 합성할 곳이 필요해요. 그게 Azure AI Speech 리소스이고, 만드는 데 3분쯤 걸려요.

### Speech 리소스 만들기

[Azure Portal](https://portal.azure.com/#create/Microsoft.CognitiveServicesSpeechServices)에서 **Speech service** 리소스를 만드세요. 중요한 선택지는 이래요.

- **지역(Region).**<br>
  가까운 곳을 고르고 적어두세요. 커넥터는 표시 이름이 아니라 짧은 코드(`westeurope`, `eastus` 등)로 지역을 요구해요.
- **가격 책정 계층(Pricing tier).**<br>
  무료 계층에도 매월 일정량의 신경망 텍스트 음성 변환 문자 할당량이 포함돼 있어서, 뭔가에 확실히 투자하기 전에 전체가 잘 동작하는지 증명하기엔 충분해요. 6분짜리 에피소드는 발화 텍스트 기준으로 약 5,000자예요.

_여기서 실제 결정 사항은 지역과 가격 책정 계층 둘뿐이에요. 지역 문자열을 적어두세요. 잠시 후에 필요해요._

### 키와 지역 가져오기

배포가 끝나면 리소스를 열고 **리소스 관리(Resource Management)** → **키 및 엔드포인트(Keys and Endpoint)** 로 이동하세요. **KEY 1**과 **위치/지역(Location/Region)** 값만 있으면 돼요. [커넥터는 엔드포인트 URL을 요구하지 않아요](https://learn.microsoft.com/connectors/azuretexttospeech/).

_Key 1과 지역 문자열. 둘 다 Power Platform 연결로 곧장 들어가고, 다른 어디에도 들어가지 않아요._

> **주의:** 키는 다른 자격 증명과 똑같이 다루세요. Power Platform 연결에 넣는 것이지, 스킬 파일이나 지침, 변수에 넣는 게 아니에요. 키를 아예 다루고 싶지 않다면, 커넥터는 리소스 ID에 대한 Microsoft Entra ID 인증도 지원해요. 개인 데모를 넘어서는 용도라면 이쪽이 더 나은 답이에요.

### 음성이 존재하는지 확인하기

기본 캐스팅은 `en-US-AvaMultilingualNeural`과 `en-US-AndrewMultilingualNeural`을 써요. 둘 다 표준 신경망 음성이지만 지역마다 가용성이 다르니, 더 진행하기 전에 선택한 지역의 [지원되는 음성 목록](https://learn.microsoft.com/azure/ai-services/speech-service/language-support?tabs=tts)을 한번 확인해볼 만해요.

## 2부: 커넥터를 에이전트에 연결하기

이제 Copilot Studio로 넘어갈게요. 에이전트에서 **도구(Tools)** → **도구 추가(Add a tool)** → **커넥터(Connector)** 로 이동해 **Azure Text to speech**를 검색하세요.

_커넥터는 세 가지 작업을 제공해요. 그중 하나만 필요해요._

**Convert text to speech with SSML** 작업을 추가하세요. 이게 중요한 작업이에요. 형제 작업인 *Convert text to speech*는 일반 문자열과 단일 음성 이름만 받는데, 이건 진행자 한 명이 단조로운 톤으로 읽어준다는 뜻이에요. 두 명의 화자, 라인별 프로소디<sup>2</sup>, 제어된 일시 정지를 가능하게 해주는 건 SSML 작업이에요.

메시지가 뜨면 연결을 만드세요. **API Key** 인증을 선택하고 Azure Portal에서 가져온 두 값을 입력하세요.

| 필드 | 값 |
| --- | --- |
| Account Key | Speech 리소스의 Key 1 |
| Region | 지역 짧은 코드, 예: `westeurope` |

_필드는 두 개뿐이에요. 사람들이 틀리는 건 지역이에요. 친숙한 이름이 아니라 짧은 코드예요._

이 커넥터를 습관의 기반으로 삼기 전에 알아둘 게 두 가지 있어요.

- **프리미엄 커넥터예요.**<br>
  그래서 일반적인 Power Platform 라이선스 규칙이 그대로 적용돼요.
- **연결당 60초에 100회 호출로 스로틀링돼요.**<br>
  하루 한 편의 에피소드에는 상관없지만, 문서 배치를 대상으로 돌리기 시작하면 꽤 중요해져요.

도구를 추가한 다음에는, 에이전트의 도구 목록에서 그 설명이 여전히 말이 되는지 확인하세요. 에이전트는 이 설명을 보고 도구를 고르고, 스킬은 이 도구를 이름으로 콕 집어 쓰라고 지시하기 때문에, 설명이 크게 바뀌면 이 연결 고리가 깨져요.

_스킬이 기대하는 형태로 존재하는 도구._

## 3부: 스킬 추가하기

배관 작업은 끝났으니, 이제 흥미로운 부분인 지침 차례예요.

### 왜 프롬프트가 아니라 스킬인가

이 모든 걸 에이전트에 하나의 거대한 지침 블록으로 써넣을 수도 있어요. 저도 해봤어요. 두 가지 이유로 나쁜 생각이에요.

첫째, 지침이 길어요. 소스 자료 파싱, 항목의 편집적 순위 매기기, 대화체 대사 작성, 합성 엔진을 위한 숫자 풀어쓰기, 유효한 멀티보이스 SSML 출력까지 합치면 매우 구체적인 절차가 수천 단어에 달해요. 이게 에이전트의 지침에 들어 있으면, 누가 그냥 "안녕"이라고만 말하는 턴까지 포함해서 모든 턴의 컨텍스트에 올라가요.

둘째, 상황에 따라 달라요. 제 에이전트가 하는 일 대부분은 팟캐스트와 아무 관련이 없거든요. Roel이 쓴 [Copilot Studio에서 스킬이 동작하는 방식](https://microsoft.github.io/mcscatblog/posts/modern-mcs-agent-skills/)이 이 규칙을 저보다 잘 정리해뒀어요. 모든 대화에서 참인 지침은 instructions에 속하고, 특정 시나리오에만 적용되는 지침은 스킬에 속한다는 거예요. 이 경우는 그야말로 시나리오 특화의 극단이고요.

### 다운로드하고 업로드하기

이 스킬을 처음부터 만들 필요는 없어요. CAT 스킬 라이브러리에 이미 올라와 있거든요. [Podcast Script Generator](https://microsoft.github.io/cat-agent-skills/skills/generating-podcast-script/)에서 받으면 아래에 설명한 그대로를 얻을 수 있어요.

스킬은 파일 세 개가 든 폴더예요.

```text
generating-podcast-script/
├── SKILL.md        # front matter + the eleven-step procedure
├── README.md       # human-facing explanation
└── metadata.json   # name, description, tags, version
```

폴더를 zip으로 압축하고 에이전트의 **스킬(Skills)** 탭에서 **Add a Skill** → **Upload**로 업로드하세요. `SKILL.md` 파일 하나만 올려도 동작하지만, zip을 쓰면 README와 메타데이터가 함께 딸려가요.

_zip을 업로드하면 스킬은 에이전트의 일부가 되어, 그 에이전트에 스코프되고 솔루션을 통해 함께 이동해요._

라우팅 신호는 front matter의 `description`이고, 후속 요청까지 다루도록 일부러 명시적으로 적어뒀어요.

```yaml
name: generating-podcast-script
description: >
  Use this skill whenever the user asks to write, generate, or create a
  podcast script or podcast episode, from a topic, or from source material
  such as a news digest, newsletter, email review, or set of articles, and
  optionally convert it to audio with Azure Text-to-Speech. Handles the
  initial request and every follow-up refinement (source, topic, length,
  cast, narration) in the same task.
```

마지막 문장은 제가 시간을 너무 많이 쏟은 버그 때문에 있는 거예요. 그 문장이 없으면 스킬은 "이거 팟캐스트로 만들어줘"에는 깔끔하게 발동했지만, 제가 "그런데 좀 더 짧게 해줘"라고 말하면 조용히 컨텍스트에서 빠져나갔고, 에이전트는 아무 규칙도 적용되지 않은 대본을 즉흥으로 만들어냈어요. 스킬이 후속 요청까지 담당한다고 명시적으로 적어주니 해결됐어요.

_이름과 설명이 라우팅 메타데이터예요. 나머지는 팟캐스트 요청이 나타날 때만 로드돼요._

## 스킬이 실제로 하는 일

흥미로운 부분은 "팟캐스트 생성"이 아니라 순서예요. 스킬은 에이전트를 열한 단계로 안내하는데, 그 순서 덕분에 출력물이 엉망이 되지 않아요.

- **쓰기 전에 파싱해요.**<br>
  소스 자료가 주어지면 첫 번째 패스에서 개별 항목을 전부 뽑아내요. 헤드라인, 매체, 날짜, 핵심 사실 주장, 수치나 인용, 그리고 "그래서 뭐가 중요한데(so what)"까지요. 같은 사건을 다루는 중복 항목은 합치고, 푸터·면책 조항·구독 취소 문구·이미지 캡션은 버려요. 실제 뉴스레터는 약 30퍼센트가 상용구라서, 이 단계 하나만으로도 출력물이 훨씬 쓸 만해져요.
- **편집적 결정을 내려요.**<br>
  남은 항목들은 뉴스 가치와 영향력으로 순위가 매겨져요. 상위 4~6개는 완전한 세그먼트를 받고, 나머지는 하나의 속보식(rapid-fire) 라운드로 몰아넣어요. 이게 에피소드와 단순한 목록의 차이이고, 원샷 프롬프트로 이걸 시도할 때 대부분 사람들이 건너뛰는 단계예요.
- **눈이 아니라 입을 위해 써요.**<br>
  축약형을 어디에나 써요. 대부분의 대사는 30단어 미만이고, 긴 설명은 다른 진행자가 끼어들 수 있게 두세 턴으로 나눠요. 복잡한 아이디어 하나당 구체적인 비유 하나. 한 진행자가 정기적으로 순진한 질문을 던지면 다른 진행자가 풀어서 설명해요.

  여기엔 가드레일도 있어요. 사실에 대한 반응은 괜찮아요. "그 숫자 미쳤네요"는 괜찮아요. 하지만 사람, 기업, 정치에 대해 지어낸 의견은 안 돼요. 확인되지 않은 주장은 소리 내어 표시해요. "보고서는 이걸 신중하게 미확인이라고 부르고 있네요." 헤드라인은 절대 그대로 읽지 않고 말로 바꿔 표현해요. 출처는 이름으로 밝혀요.
- **분량을 실제 목표로 예산화해요.**<br>
  모든 건 분당 발화 약 150단어로 계산해요. 짧은 에피소드는 약 450단어, 중간은 약 900단어, 긴 건 약 1,800단어이고, 에이전트는 10퍼센트 이내로 맞추는 걸 목표로 해요. 6분은 6분이어야 하니까요. 고정된 출퇴근 시간을 중심으로 습관을 만들 때는 이게 특히 중요해요.

### 캐스팅

두 명의 고정 진행자, 늘 같은 성격이에요.

- **Nova는 리드예요.**<br>
  따뜻하고, 호기심 많고, 빠르죠. 어젠다를 이끌고, 청취자가 궁금해할 질문을 던지고, 전문 용어를 쉬운 말로 바꿔줘요.
- **Miles는 분석가예요.**<br>
  차분하고, 건조하고, 정확해요. 맥락, 숫자, 단서 조항, 2차 함의를 짚어주고, 가끔 Nova에게 반론을 제기해요.

둘 다 내레이터가 아니에요. 마이크가 아니라 서로에게 이야기해요. "팟캐스트에 오신 걸 환영합니다"도, 채널 브랜딩도, 음악 큐도 없어요. 에피소드는 자료에서 가장 인상적인 단 하나의 사실로 콜드 오픈<sup>3</sup>하는데, 뭐든 시작하는 데는 그게 정답이에요.

이 전부를 바꿀 수도 있어요. 다른 이름, 다른 음성, 단일 진행자, 다른 언어로요. Nova와 Miles는 여러분이 일일이 결정하지 않아도 되게끔 마련된 기본값일 뿐이에요.

### 실행하기

다이제스트를 에이전트에 붙여넣고 이렇게 요청하세요.

```text
Here's this morning's press review. Make it a six-minute episode
and give me the audio.
```

에이전트는 파싱하고, 순위를 매기고, 두 파일을 작성한 다음, 오디오를 원하는지 묻기 *전에* 대략적인 길이와 함께 세그먼트 표를 보여줘요. 이 검토 단계는 없애지 마세요. 진행 순서를 고치는 건 합성 이후보다 텍스트 단계에서 훨씬 저렴하니까요.

_여섯 개의 세그먼트, 속보식 라운드, 예상 길이. 예스라고 답하면 커넥터를 호출해요._

예스라고 답하면 에이전트는 SSML을 `ConvertTextToSpeechWithSSML`에 `outputFormat: riff-24khz-16bit-mono-pcm`으로 넘기고, base64 응답을 디코딩해서 다운로드 가능한 `.wav` 파일로 저장해요.

## 4부: 휴대폰으로 가져오기

이 부분이 데모를 습관으로 바꿔주는 지점이고, 어딘가에서 일회성 프롬프트나 돌리는 대신 이 전체를 만들 가치가 있는 이유예요.

에이전트를 게시한 다음, **채널(Channels)** 아래에서 **Microsoft 365 Copilot**과 **Microsoft Teams** 채널을 활성화하세요. 둘 다 Henry의 [Teams와 M365 Copilot 배포](https://microsoft.github.io/mcscatblog/posts/copilot-studio-teams-deployment/) 글에서 제대로 다루고 있어서, 관리자 승인 흐름은 여기서 다시 짚지 않을게요.

_하나의 에이전트, 두 개의 표면. 모바일 클라이언트는 덤으로 따라와요._

이렇게 해서 얻는 게 제가 진짜 원했던 부분이에요. Teams 모바일은 돌아온 `.wav`를 재생 가능한 첨부 파일로 보여주기 때문에, 평일 아침은 이렇게 흘러가요.

1. 휴대폰의 Teams에서 언론 리뷰를 에이전트에게 전달하거나 붙여넣어요.
2. 휴대폰을 주머니에 넣고 코트를 입어요.
3. 문 앞에 도착할 때쯤이면 오디오가 채팅에 놓여 있어요.
4. 재생 버튼을 누르고, 헤드폰을 끼고, 걸어요.

_이 모든 작업의 목적이 휴대폰의 채팅 스레드에 놓여 있어요._

> **참고:** 오디오 재생 동작은 채널마다 달라요. Teams 모바일은 첨부 파일을 잘 처리하지만, 다른 표면에서는 플레이어 대신 다운로드가 제공될 수 있어요. 아침 루틴을 만들기 전에 실제로 쓸 채널에서 먼저 테스트해보세요.

## 소리가 좋을지 나쁠지를 결정하는 부분

위에서 다룬 건 전부 배관과 편집이었어요. 이 부분은 기계적인데, 첫 열두 번의 시도가 무너진 지점이기도 해요.

### 신시사이저가 망칠 만한 것은 전부 풀어쓰기

텍스트 음성 변환 엔진은 기호 앞에서 자신만만하게 틀려요. 그래서 숫자나 약어는 어떤 것도 발화 텍스트에 그대로 살아남지 못해요.

- `2026`이 아니라 "twenty twenty-six"
- `$3.2B`가 아니라 "three point two billion dollars"
- `~15%`가 아니라 "about fifteen percent"
- 두문자어는 처음 언급할 때 풀어쓰고, 이후에는 줄여 써요
- 한 글자씩 읽는 두문자어는 `<say-as interpret-as="characters">API</say-as>`
- 특이한 고유 명사는 `<sub alias="phonetic spelling">Name</sub>`
- 영어 문장 속 프랑스어 구절은 `<lang xml:lang="fr-FR">`로 감싸요

스마트 따옴표, 엠 대시, 별표, 언더스코어, URL도 마찬가지예요. 전부 반갑지 않은 방식으로 소리 내어 읽히거나, 조용히 XML을 깨뜨려요.

### 턴당 voice 요소 하나

이게 제 시간을 가장 많이 잡아먹은 규칙이라, 직설적으로 말할게요.

멀티보이스 SSML 문서에서 두 `<voice>` 요소 사이에 곧바로 `<break>` 요소를 놓으면 유효하지 않아서 합성이 실패해요. "이상하게 들리는" 정도가 아니라 아예 실패해요. 턴 *사이*에 원하는 일시 정지는 **앞 턴** 텍스트 끝, 그 턴의 `<prosody>` 안에 있어야 해요. 두 `<voice>` 요소는 사이에 아무것도 없이 딱 붙어 있어야 하고요.

```xml
<speak version="1.0"
       xmlns="http://www.w3.org/2001/10/synthesis"
       xmlns:mstts="http://www.w3.org/2001/mstts"
       xml:lang="en-US">
  <voice name="en-US-AvaMultilingualNeural">
    <mstts:express-as style="excited">
      <prosody rate="+8%" pitch="+3%">Okay, so the number that stopped me cold
      this morning was forty percent. <break time="300ms"/> Forty percent, in one
      quarter. <break time="250ms"/></prosody>
    </mstts:express-as>
  </voice>
  <voice name="en-US-AndrewMultilingualNeural">
    <mstts:express-as style="chat">
      <prosody rate="-2%" pitch="-4%">Right, and the part everyone's skipping is
      that it's off a very small base. <break time="250ms"/> Context matters
      here. <break time="700ms"/></prosody>
    </mstts:express-as>
  </voice>
</speak>
```

끝부분의 break를 눈여겨보세요. 250ms는 다음 턴 전의 간격이고, 700ms는 다음 세그먼트 전의 더 긴 간격이에요. 두 `<voice>` 요소 사이에는 아무것도 없어요.

### 전달 방식에 변화를 주지 않으면 밋밋해져요

문서 전체에 `rate`와 `pitch`를 하나로만 적용하면 꼭 공항 안내방송처럼 들려요. 스킬은 진행자별 기준선을 정해두는데, Nova는 `rate="+6%" pitch="+2%"`, Miles는 `rate="-2%" pitch="-4%"`이고, 그다음 문장 감정에 맞게 라인별로 미세 조정해요.

나머지는 `<mstts:express-as>`가 맡아요. 잡담에는 `chat`, 설명에는 `friendly`, 스토리의 사실적 핵심에는 `narration-professional`, 콜드 오픈에는 아껴서 `excited`를 써요. 스타일 지정은 일부러 빡빡하게 정해두지 않았어요. 지원되지 않는 스타일은 서비스가 조용히 무시하기 때문이에요. `excited`를 지원하지 않는 음성으로 바꾸면 색채를 조금 잃을 뿐, 에피소드 전체를 잃지는 않아요.

`<emphasis level="moderate">`는 세그먼트당 핵심 용어 한두 개에만 써요. 그보다 많이 쓰면 강조가 아무 의미도 없어져요.

> **팁:** Copilot Studio에서 뭔가를 디버깅하기 전에, 생성된 SSML을 Speech Studio의 [Audio Content Creation](https://speech.microsoft.com/audiocontentcreation)에 붙여넣어 보세요. 커넥터는 알려주지 않는, 정확히 어느 라인이 잘못됐는지를 짚어줘요.

## 트레이드오프, 솔직하게

- **즉각적이지 않아요.**<br>
  6분짜리 에피소드를 파싱하고, 순위 매기고, 작성하고, 합성하는 건 진짜 작업이에요. "돌려놓고 신발 신으러 가는" 작업이지, 채팅 응답이 아니에요.
- **긴 에피소드는 분할이 필요해요.**<br>
  SSML은 40,000자 미만으로 유지해야 해요. 에피소드가 한 번의 합성 호출로 처리할 수 있는 크기를 넘으면, 에이전트는 세그먼트 경계에서 나누고, 각 부분을 합성한 다음, 디코딩된 오디오를 순서대로 이어 붙여요. 동작은 하지만, 움직이는 부품이 더 많아져요.
- **편집적 판단은 여전히 판단이에요.**<br>
  순위는 여러분의 소스 자료에서 뭐가 중요한지에 대한 에이전트의 의견이에요. 대개는 합리적이고 가끔 틀리는데, 그래서 스킬이 내레이션 전에 세그먼트 표를 보여주는 거예요. 동의하지 않으면 순서를 바꾸면 돼요.
- **쓰레기가 들어가면, 자신감 넘치는 쓰레기가 나와요.**<br>
  소스 자료가 빈약하면 두 사람이 별것 아닌 것에 열광하는 6분을 얻게 돼요. 스킬은 시간을 채우려고 사실을 지어내지는 않지만, 여러분의 뉴스레터가 지루했다고 말해주지도 않아요.

## 다음 단계

가장 뻔한 다음 확장은 루프에서 저 자신을 아예 빼버리는 거예요. 받은 편지함에 자율 트리거를 걸어두고, 언론 리뷰가 도착하면 스킬이 발동하고, `.wav`가 제 휴대폰이 이미 동기화하는 OneDrive 폴더에 떨어지게요. Giorgio의 [회의 녹취록 분석기](https://microsoft.github.io/mcscatblog/posts/meeting-transcript-analyzer/)가 다른 문제를 겨냥했을 뿐, 기본 구조는 이미 그 모습이에요. 아직 연결하지 않은 건, 자동화하기 전에 출력물이 커밋할 만큼 좋은지 확신하고 싶었기 때문이에요. 이제 확신이 섰으니, 그게 다음 주말 프로젝트예요.

다른 방향은 뉴스가 아닌 소스 자료예요. 자세히 팔로우하지 않는 제품의 릴리스 노트. 가끔 기여하는 리포지토리의 체인지로그. 아무도 읽지 않은 그 아키텍처 문서. 정보는 진짜 유용한데 형식은 진짜 매력 없는 모든 것, 그러니까 업무용 받은 편지함에 도착하는 것들 중 우울할 만큼 많은 부분이 여기 해당돼요.

스킬의 지침을 어디까지 밀어붙여야 안 따르게 되는지 궁금하다면, 이 스킬이 꽤 괜찮은 스트레스 테스트예요. 에이전트에게 편집 작업, 창의적 글쓰기, 엄격한 XML 생성을 한꺼번에 요구하다 보니, 각 요건의 제약이 서로 조금씩 충돌하거든요. 어디서 무리가 오는지 지켜보는 게, 얌전히 잘 돌아가는 스킬 어느 것보다도 스킬 지침 작성에 대해 더 많이 가르쳐줬어요. 참고로 애초에 SSML 실패를 찾아낸 방법은 에이전트가 자기 단계를 스스로 설명하게 만드는 거였는데, 이건 [토픽에 관한 제 글](https://microsoft.github.io/mcscatblog/posts/power-of-topics-copilot-studio/)의 첫 번째 트릭이에요.

자, 여러분의 받은 편지함에서 계속 읽어야지 하면서 결코 읽지 않는 건 뭔가요? 바로 그게 이 스킬을 처음 겨눠볼 대상이에요.

---

## 어휘 주석

1. **SSML(Speech Synthesis Markup Language):** 음성 합성 엔진에게 억양, 목소리, 쉬는 지점까지 지시할 수 있는 XML 기반 마크업 언어.
2. **프로소디(prosody):** 말할 때 리듬, 억양, 강세가 오르내리는 정도.
3. **콜드 오픈(cold open):** 인사말이나 도입부 없이 곧바로 본론으로 들어가는 시작 방식.

---
title: '영상: Copilot Studio에서 회의 녹취록 가져오기 & 집중 시간 확보하기'
description: 'Copilot Studio 자율 에이전트가 Teams 회의 녹취록을 분석해 액션 아이템을 찾고, Outlook 캘린더에 집중 시간을 자동으로 확보해주는 과정을 정리했어요.'
date: 2026-09-08
tags: ["Copilot Studio", "자율 에이전트", "Teams", "Outlook", "집중 시간"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/meeting-transcript-focus-time/card-01.png
  - /cards/meeting-transcript-focus-time/card-02.png
  - /cards/meeting-transcript-focus-time/card-03.png
  - /cards/meeting-transcript-focus-time/card-04.png
  - /cards/meeting-transcript-focus-time/card-05.png
  - /cards/meeting-transcript-focus-time/card-06.png
  - /cards/meeting-transcript-focus-time/card-07.png
---

> **원문:** [VIDEO: Retrieve Meeting Transcripts in Copilot Studio & Block Focus Time](https://microsoft.github.io/mcscatblog/posts/meeting-transcript-analyzer/)
> **게시일:** 2026-01-26 · **저자:** Giorgio Ughini

> **참고:** 이 글은 **영상 중심** 튜토리얼이에요. 게시물은 시나리오 배경만 다루고, 진짜 볼거리는 아래 녹화 영상에 있어요.

우리 모두 같은 어려움을 겪어요. 연이은 회의가 끝나면 액션 아이템은 산더미처럼 쌓여 있는데 처리할 시간이 없어요. 하루가 끝날 무렵이면 우리가 하기로 약속한 것의 절반을 잊어버리기 일쑤예요.

이 영상은 **Copilot Studio의 자율(autonomous) 에이전트**를 활용한 강력한 해결책을 보여줘요.

녹화나 메모를 손으로 검토하는 대신, 회의 이후의 업무 부담을 대신 처리하도록 설계된 에이전트를 소개할게요.

## 시나리오

이 영상에서는 매 근무일이 끝날 때 자동으로 실행되는 자율 에이전트를 배포해요. 워크플로는 단순하지만 효과는 커요.

1. **녹취록 가져오기**: 에이전트가 해당 날짜의 모든 Microsoft Teams 회의 녹취록을 가져와요.
2. **내용 분석**: 각 녹취록을 검토해서 미해결 사항, 액션 아이템, 명확한 시사점을 찾아내요.
3. **작업량 산정**: 에이전트가 지능적으로 각 작업을 완료하는 데 필요한 노력을 추정해요.
4. **행동 실행**: 딥 워크가 필요한 중요한 미해결 사항이 있으면, 에이전트가 **Outlook 커넥터**를 써서 가용 시간대를 찾아 해당 항목을 처리할 시간을 사용자의 캘린더에 확보해요.

영상을 즐겨 주세요!

---

## 시연 영상 보기

[영상: 회의 분석 및 캘린더 관리를 위한 자율 에이전트](https://github.com/GiorgioUghini/WebVideos/releases/download/video-2-1.0.0/Meeting.Transcript.Analyzer.mp4)

> **팁:** 3월 13일 업데이트: MCP 서버의 이름이 약간 바뀌어서 이제 "Work IQ"+도구 형태예요. 예를 들어 영상에서 쓰인 서버는 이제 Work IQ Copilot이라고 불려요.

---

## 이것이 중요한 이유

이 예시는 단순한 챗봇에서, 여러분을 대신해 복잡한 다단계 워크플로를 수행할 수 있는 **자율 에이전트**로의 전환을 보여줘요. Microsoft 365 데이터(Teams 및 Outlook)와 직접 통합함으로써, Copilot Studio는 질문에 답하는 걸 넘어 여러분의 하루 업무를 능동적으로 관리하는 도구를 만들 수 있게 해줘요.

자율 에이전트에 대한 이 실용적인 소개가 마음에 드셨다면, 저에게 직접 알려주시거나 댓글로 남겨 주세요!

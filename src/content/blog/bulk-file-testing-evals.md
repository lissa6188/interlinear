---
title: 'Copilot Studio를 위한 대량 파일 기반 테스트: 표준 Evals를 넘어서'
description: 'Copilot Studio 에이전트가 평가는 통과해도 실전 대량 파일에서 실패하는 이유와, 그걸 잡아내는 대량 파일 테스트 아키텍처를 소개해요.'
date: 2026-09-05
tags: ["Copilot Studio", "Power Automate", "Dataverse", "SharePoint", "Power BI"]
category: 'Copilot Studio & Power Platform'
cards:
  - /cards/bulk-file-testing-evals/card-01.png
  - /cards/bulk-file-testing-evals/card-02.png
  - /cards/bulk-file-testing-evals/card-03.png
  - /cards/bulk-file-testing-evals/card-04.png
  - /cards/bulk-file-testing-evals/card-05.png
  - /cards/bulk-file-testing-evals/card-06.png
  - /cards/bulk-file-testing-evals/card-07.png
---

> **원문:** [Bulk File-Based Testing for Copilot Studio: Beyond Standard Evals](https://microsoft.github.io/mcscatblog/posts/bulk-file-testing-copilot-evals/)
> **게시일:** 2026-05-12 · **저자:** Ashwin Raju Krishnamurthi

저희는 [Copilot Studio 평가(eval) 도구](https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-agent-evaluation-intro)에서 훌륭한 점수를 받은 인보이스 처리 에이전트를 배포했어요. 그런데 대량의 실제 공급업체 인보이스가 도착하기 시작했어요. 서로 다른 템플릿, 서로 다른 스캔 품질, 서로 다른 언어. 그중 상당한 비율이 조용히 실패했어요. 평가 지표는 그대로였지만, 에이전트는 프로덕션에 쓸 준비가 되어 있지 않았어요.

엔터프라이즈 문서(PDF, 계약서, 스프레드시트, 양식)를 처리하는 에이전트를 만들어 봤다면 아마 같은 벽에 부딪혔을 것이에요. 표준 평가는 엄선된 샘플에 대한 프롬프트-응답 품질을 측정해요. 에이전트가 비즈니스에서 요구하는 일관성으로 *수천 개*의 실제 파일을 안정적으로 처리할 수 있는지는 알려주지 않아요.

이 포스트에서는 아마 이미 보유하고 있을 구성 요소들, 즉 [Dataverse](https://learn.microsoft.com/power-apps/maker/data-platform/data-platform-intro), [SharePoint](https://learn.microsoft.com/sharepoint/introduction), [Power Automate](https://learn.microsoft.com/power-automate/getting-started), Copilot Studio, [Power BI](https://learn.microsoft.com/power-bi/fundamentals/power-bi-overview)를 활용한 대량 파일 기반 테스트의 실용적인 아키텍처를 살펴봐요.

> **참고:** 이 접근법은 표준 평가를 보완하는 것이지 대체하는 것이 아니에요. 프롬프트 품질과 응답 동작에는 평가를 사용하고, 파일 처리와 구조화된 출력 검증에는 대량 테스트를 사용하세요.

## 표준 Evals가 부족한 지점

[Copilot Studio 평가](https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-agent-evaluation-intro)는 프롬프트-응답 테스트, 회귀 테스트, 품질 점수화, 멀티턴 대화 시뮬레이션에 탁월해요. 이미 CI/CD 파이프라인에서 사용하고 있다면([Copilot Studio를 위한 품질 게이트](https://microsoft.github.io/mcscatblog/posts/copilot-studio-eval-gate-azure-devops/) 참고) 훌륭해요. 계속 그렇게 하세요.

하지만 에이전트가 운영 워크플로우의 일부로 엔터프라이즈 문서를 처리한다면, 다른 질문들에 대한 답이 필요해요.

- 서로 다른 레이아웃을 가진 다양한 공급업체의 인보이스 수천 개를 처리할 수 있나요?
- 스캔 품질과 언어가 달라도 올바른 필드를 일관되게 추출하나요?
- 규모가 커질 때 어떤 구체적인 실패 패턴이 나타나나요(누락된 ID, 잘못된 합계, 형식 불일치)?
- 프롬프트 버전이나 모델 업데이트에 따라 정확도가 어떻게 변하나요?

견고한 대량 테스트 접근법은 다음을 갖추어야 해요.

- 정의된 테스트 매트릭스에 대해 대량의 파일 기반 테스트 케이스 실행
- 추출된 모든 필드를 골드 스탠더드<sup>1</sup> 기대 결과와 비교
- 시나리오별 프롬프트와 비즈니스 규칙 지원
- 완전한 추적성과 함께 시간에 따른 회귀 추적

## 아키텍처

실용적인 솔루션은 테넌트에 이미 있을 법한 구성 요소들을 사용해요.

| 구성 요소 | 역할 |
|-----------|------|
| **Dataverse** | 컨트롤 플레인<sup>2</sup> — 테스트 정의, 실행 이력, 통과/실패 결과 |
| **SharePoint** | 구성 계층 — 입력 파일, 골드 스탠더드 출력, 프롬프트 자산 |
| **Power Automate** | 오케스트레이션 — 테스트 조회, 에이전트 호출, 결과 비교 |
| **Copilot Studio** | 실행 — 파일을 처리하고 구조화된 출력 반환 |
| **Power BI** | 리포팅 — 통과율, 오류 패턴, 회귀 추세 |

*테스트 정의, 오케스트레이션, 코파일럿 실행, 결과 비교가 함께 작동하는 엔드투엔드 대량 파일 기반 테스트 아키텍처.*

## 컨트롤 플레인으로서의 Dataverse

각 테스트 케이스는 시나리오 정의, 입력 파일 참조, 기대 출력, 프롬프트 버전, 메타데이터(상태, 카테고리, 소유권)를 담은 [Dataverse 행](https://learn.microsoft.com/power-apps/maker/data-platform/data-platform-intro)이에요. 실행 이력에는 타임스탬프, 출력 위치, 비교 결과, 통과/실패 결과가 기록돼요.

이를 통해 버전 간 비교, 회귀 감지, 입력에서 결과까지의 엔드투엔드 추적성을 확보할 수 있어요. [Dataverse 검색 패턴](https://microsoft.github.io/mcscatblog/posts/dataverse-retrieval-patterns-copilot-studio/) 포스트에서 얻는 것과 유사하지만, 테스트 관리에 적용한 셈이에요.

*Dataverse 컨트롤 플레인 뷰: 중앙 집중식 기록 시스템에 담긴 구조화된 테스트 케이스, 실행 이력, 메타데이터, 통과/실패 결과.*

## 구성 계층으로서의 SharePoint

[SharePoint](https://learn.microsoft.com/sharepoint/introduction)는 테스트 입력, 골드 스탠더드 기대 출력, 프롬프트 자산, 시나리오별 참조 콘텐츠 등 파일 기반 자산을 저장해요. 이 자산들을 오케스트레이션과 분리함으로써 프롬프트, 데이터셋, 기대 결과를 독립적으로 업데이트할 수 있고, 비개발자와 비즈니스 사용자도 이미 익숙하고 편안한 플랫폼인 SharePoint를 통해 변경 사항을 쉽게 관리할 수 있어요.

*SharePoint 구성 계층: 재사용 가능한 대량 테스트 실행을 위해 정리된 입력 파일, 기대 출력, 프롬프트 자산.*

## Power Automate로 오케스트레이션하기

여기서 모든 것이 하나로 합쳐져요. [Power Automate](https://learn.microsoft.com/power-automate/getting-started)가 Dataverse, SharePoint, 코파일럿을 폐쇄 루프<sup>3</sup> 테스트 시스템으로 연결해요.

1. **읽기** — Dataverse에서 다음 실행 대상 테스트 케이스를 읽어요
2. **가져오기** — SharePoint에서 입력 파일, 기대 출력, 프롬프트를 가져와요
3. **호출** — 조합된 페이로드로 코파일럿 에이전트를 호출해요
4. **비교** — 응답을 골드 스탠더드 출력과 필드 수준에서 비교해요
5. **기록** — 실행 기록(통과/실패, 불일치, 타임스탬프)을 Dataverse에 다시 써요

*Power Automate 오케스트레이션 플로우: 테스트 조회 → 파일 로딩 → 코파일럿 실행 → 결과 비교 → 결과 기록.*

규모가 커지면 플로우는 다음을 지원해요.

- 배칭
- ([서비스 제한](https://learn.microsoft.com/power-automate/limits-and-config) 내에서) 제어된 동시성의 병렬 실행
- 재시도 로직
- 예외 처리

모든 것이 구성 기반이므로 서로 다른 프롬프트 버전이나 모델 변형에 대해 시나리오를 재실행하고 시간에 따라 결과를 비교할 수 있어요.

> **팁:** 이미 Power Automate로 에이전트를 오케스트레이션하고 있다면 [워크플로우와 에이전트 결합하기](https://microsoft.github.io/mcscatblog/posts/combining-agent-flows-and-agents-gotchas-errors-and-patterns/)의 패턴들, 특히 오류 처리와 동시성 관리가 여기에도 그대로 적용돼요.

## Power BI 리포팅 계층

[Power BI](https://learn.microsoft.com/power-bi/fundamentals/power-bi-overview)는 실행 데이터를 의사 결정에 바로 쓸 수 있는 대시보드로 바꿔줘요. 통과/실패율, 공급업체 템플릿별 오류 집중도, 프롬프트 버전에 따른 불일치 추세, 시간에 따른 회귀 감지 등이에요.

*상세 실행 통계가 담긴 자동화 리포트.*

## 이 아키텍처가 가능하게 하는 것

이 아키텍처를 갖추면 팀은 다음을 얻어요.

- **규모** — 수천 개의 실제 파일 시나리오에 걸친 검증
- **정밀도** — 기대 결과와의 결정론적<sup>4</sup> 필드 수준 비교
- **추적성** — 모든 실행이 시나리오, 버전, 결과 이력과 연결
- **회귀 감지** — 버전 간 품질 저하의 자동 식별
- **운영 가시성** — 이해관계자 신뢰를 위한 Power BI 대시보드

## 종합하기

표준 평가와 대량 파일 테스트는 경쟁하는 접근법이 아니에요. 상호 보완적인 계층이에요.

| 계층 | 검증 대상 | 도구 |
|-------|-----------|------|
| 프롬프트 품질 | 응답 정확도, 안전성, 관련성 | [Copilot Studio Evals](https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-agent-evaluation-intro) |
| 통합 품질 | CI/CD 게이트, 회귀 차단 | [파이프라인의 Eval API](https://microsoft.github.io/mcscatblog/posts/copilot-studio-eval-gate-azure-devops/) |
| 파일 처리 품질 | 대규모 대량 문서 처리 | 이 아키텍처 |

이 아키텍처를 구현한 다운로드 가능한 샘플 솔루션이 곧 공개될 예정이에요. 여러분만의 엔터프라이즈급 대량 파일 검증 프레임워크를 구축하는 데 실질적인 출발점이 되어줄 것이에요.

---

문서 중심 에이전트를 테스트하면서 비슷한 어려움을 겪어보셨나요? 여러분의 환경에서 효과가 있었던(또는 화려하게 실패한) 접근법은 무엇이었나요? 댓글로 알려주세요.

---

## 어휘 주석

1. **골드 스탠더드(gold standard):** 결과가 맞는지 비교하는 기준이 되는, 사람이 미리 검증해 둔 정답 데이터.
2. **컨트롤 플레인(control plane):** 실제 작업(데이터 처리)은 하지 않고, 무엇을 어떻게 실행할지 정의하고 기록만 관리하는 중심 계층.
3. **폐쇄 루프(closed loop):** 실행 결과가 다시 시스템으로 피드백되어, 사람 손을 거치지 않고 스스로 확인·기록까지 끝내는 순환 구조.
4. **결정론적(deterministic):** 같은 입력을 주면 언제나 같은 결과가 나오는, 우연이나 확률에 좌우되지 않는 방식.

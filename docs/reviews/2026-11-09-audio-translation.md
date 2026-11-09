# 음원 및 잠정 번역 검수 — 2026-11-09

검수 기준: GitHub main 커밋 `84d46f1b18897db76053a06cc7491315fa6d9974`.

## 음원 결과

| 자료 | 검사 파일 | HTTP 및 MP3 프레임 검사 |
|---|---:|---|
| 바가바드 기타 | 640 | 모두 통과 |
| 티베트 사자의 서 독송 앨범 | 106 | 모두 통과 |
| 요가수트라 | 195 | 모두 통과 |
| 합계 | 941 | 모두 통과 |

- 각 파일에 읽기 전용 HTTP 구간 요청을 보내 응답과 연속 MPEG Layer III 프레임을 검사했습니다. 일반 파일은 시작 256KiB, 큰 ID3 태그가 있는 파일은 태그 끝 이후 256KiB를 검사했습니다.
- 첫 구간에 프레임이 없던 사자의 서 26개는 ID3 메타데이터가 약 445KB~1.40MB였으며, 태그 다음 위치를 재검사하니 모두 정상 오디오 프레임이 있었습니다. 파일 손상으로 분류하지 않았습니다.
- 요가수트라 195개는 배포 기준 커밋에 고정한 공개 원본 파일로 검사했고, 대표 1.1 음원은 인증 후 실제 운영 사이트에서도 재생했습니다.
- 운영 브라우저에서 기타 1.1(37.419초)·요가 1.1(8.411초)의 끝 도달을 확인했습니다. 사자의 서 첫 곡은 약 63.5초, 둘째 곡은 약 35.1초까지 진행했으며 브라우저 media error 없이 readyState 4를 확인했습니다. 둘째 곡을 시작하자 첫 곡은 자동 정지했습니다. 검수 후 재생을 정지했습니다.
- 이 검사는 전체 941개를 끝까지 청취하거나 전 파일의 모든 프레임을 디코딩한 검사가 아닙니다. 트랙 제목과 실제 낭송 내용의 일치도는 별도 검토 대상입니다.

## 잠정 번역 결과

- 화 검토 기록 13건: 부록의 영어 인용 및 현재 채택한 번역이 각각 수록 본문에 존재하는지 확인했습니다. 공백을 정규화한 검사에서 13건 모두 일치했습니다.
- 풍 검토 기록 29건: 부록의 현재 채택한 번역이 수록 본문과 29건 모두 일치했습니다.
- 본문과 부록의 어긋남은 확인되지 않았으므로 한국어 본문을 임의 수정하지 않았습니다. 이 결과는 의미 정확성이나 원본 PDF 일치 판정이 아닙니다.
- 해당 작업 폴더와 저장소에는 대조에 사용한 PDF·DOCX 원본이 없습니다. 원본 경로 또는 링크를 확인하기 전까지 인쇄본 재대조는 미완료입니다.
- 지 긍정편 30번의 Until 조건처럼 기존 부록에도 모호함이 명시된 구절은 현재 번역을 유지합니다. 단어풀이 확장도 원문 범위 검증 전에는 적용하지 않습니다.

## 원본 대조 대기 목록

### 화 13건

| 검토 | 본문 | 인쇄 쪽수 | 원본에서 확인할 점 |
|---:|---|---|---|
| 1 | [화 · 긍정편 2. 믿음, 신뢰, 확신](https://simsang.org/reader/?book=introspection&verse=fire.positive.002&view=text) | 44쪽 | 해당 판본의 용어 해설 또는 대응 원어를 확인해야 합니다. |
| 2 | [화 · 긍정편 4. 자기 자신과 자신의 모든 특성에 대한 통제](https://simsang.org/reader/?book=introspection&verse=fire.positive.004&view=text) | 46쪽 | 행위와 잘못의 대비가 불명확합니다. 타 판본의 동일 문장 대조가 필요합니다. |
| 3 | [화 · 긍정편 13. 타협하지 않음](https://simsang.org/reader/?book=introspection&verse=fire.positive.013&view=text) | 58쪽 | 원문의 주차 누락인지 의도적 생략인지는 확인되지 않았습니다. |
| 4 | [화 · 긍정편 19. 자립](https://simsang.org/reader/?book=introspection&verse=fire.positive.019&view=text) | 68쪽 | 자립 부족만으로 주권 상실을 설명했을 가능성도 있어 오류라고 단정할 수 없습니다. |
| 5 | [화 · 긍정편 34. 되풀이하지 않는 말의 큰 효과](https://simsang.org/reader/?book=introspection&verse=fire.positive.034&view=text) | 86–87쪽 | 쉼표와 부사구의 연결이 모호합니다. 강조·반복을 피하라는 문맥은 있으나 원문 구문을 확정하지 못했습니다. |
| 6 | [화 · 부정편 5. 관능성](https://simsang.org/reader/?book=introspection&verse=fire.negative.005&view=text) | 298쪽 | 관능성과 동물적 수준을 설명하는 문맥과의 연결이 약합니다. 오자 여부를 확인해야 합니다. |
| 7 | [화 · 부정편 6. 이기심](https://simsang.org/reader/?book=introspection&verse=fire.negative.006&view=text) | 299–300쪽 | 이기적인 이유로 평화를 바란다는 앞뒤 문맥과 충돌하지만 의도적인 역설인지 오자인지 미확정입니다. |
| 8 | [화 · 부정편 9. 질투](https://simsang.org/reader/?book=introspection&verse=fire.negative.009&view=text) | 305쪽 | 누가 대가를 지불하거나 되갚는지 명료하지 않습니다. 번역의 문법적 개선을 원문의 해소로 보아서는 안 됩니다. |
| 9 | [화 · 부정편 11. 복수심](https://simsang.org/reader/?book=introspection&verse=fire.negative.011&view=text) | 308–309쪽 | 병기가 의도적 동격인지 편집상의 혼동인지 별도 판본 확인이 필요합니다. |
| 10 | [화 · 부정편 11. 복수심](https://simsang.org/reader/?book=introspection&verse=fire.negative.011&view=text) | 309쪽 | 분노하는 사람이 밟은 쪽인지 밟힌 쪽인지 영어 문장이 명료하지 않습니다. |
| 11 | [화 · 부정편 14. 부정직, 위선, 거짓됨, 기만](https://simsang.org/reader/?book=introspection&verse=fire.negative.014&view=text) | 313–314쪽 | 부정직을 알아보는 교육일 수도 있으나, 뒤의 진실함과 겸양이라는 대조와 충돌하여 대조가 필요합니다. |
| 12 | [화 · 부정편 15. 의존성](https://simsang.org/reader/?book=introspection&verse=fire.negative.015&view=text) | 315쪽 | 독립적으로 판단하는 직업을 의도했을 가능성은 있으나 이를 본문에 확정해 넣을 근거는 부족합니다. |
| 13 | [화 · 부정편 53. 지나친 탐닉](https://simsang.org/reader/?book=introspection&verse=fire.negative.053&view=text) | 360쪽 | 무절제한·억제되지 않은 등의 의미로 단정하지 않았습니다. 대응 원어 확인이 필요합니다. |

### 풍 29건

| 검토 | 본문 | 인쇄 쪽수 | 원본에서 확인할 점 |
|---:|---|---|---|
| 1 | [풍 · 긍정편 1. 삶의 기쁨과 기쁨 일반](https://simsang.org/reader/?book=introspection&verse=air.positive.001&view=text) | 책 95–96쪽. | To understand로 시작하는 구절이 완결되지 않아, 이해하지 못한다는 부정은 문맥을 반영한 해석입니다. |
| 2 | [풍 · 긍정편 4. 타인의 성공에서 느끼는 참된 기쁨](https://simsang.org/reader/?book=introspection&verse=air.positive.004&view=text) | 책 98–99쪽. | that are the result가 어느 성품까지 수식하는지, 성공 자체를 뜻하려 했는지 명확하지 않습니다. |
| 3 | [풍 · 긍정편 7. 칭찬과 자화자찬 없이 진실하게 일하려는 열망과 노력](https://simsang.org/reader/?book=introspection&verse=air.positive.007&view=text) | 책 104쪽. | That he receives로 시작하는 불완전한 문장이 앞 문장과 어떤 관계인지 확정하기 어렵습니다. |
| 4 | [풍 · 긍정편 14. 균형과 합리성](https://simsang.org/reader/?book=introspection&verse=air.positive.014&view=text) | 책 113쪽. | which will never leave us가 진보를 가리키는지, 균형과 합리성 또는 그 표시를 가리키는지 모호합니다. |
| 5 | [풍 · 긍정편 28. 타인의 의견을 살핌](https://simsang.org/reader/?book=introspection&verse=air.positive.028&view=text) | 책 130쪽. | 앞 문장의 다른 사람들과 뒤 문장의 영적 인도자가 같은 존재인지, 배후에서 작용하는 별개 존재인지 명확하지 않습니다. |
| 6 | [풍 · 긍정편 32. 올바른 표현](https://simsang.org/reader/?book=introspection&verse=air.positive.032&view=text) | 책 135–136쪽. | 원문은 anything that fundamentally rejects라고 되어 있어 거부하는 주체와 이중 부정의 구조가 어긋납니다. 현재 번역에는 문맥에 따른 구문 해석이 들어 있습니다. |
| 7 | [풍 · 긍정편 36. 올바른 논리](https://simsang.org/reader/?book=introspection&verse=air.positive.036&view=text) | 책 140쪽. | then our temporary task is the obstacles라는 구문이 불완전합니다. 현재 번역의 자신에게 주어진다는 표현은 문맥을 이어 주는 해석입니다. |
| 8 | [풍 · 긍정편 42. 발달 수준에 따라 감당할 만큼 성숙한 문제만 탐구함](https://simsang.org/reader/?book=introspection&verse=air.positive.042&view=text) | 책 147쪽. | grandeur와 hunger의 결합이 부자연스러워, 과대욕과 갈망이라는 의미 범위를 저자의 의도로 확정할 수는 없습니다. |
| 9 | [풍 · 긍정편 55. 영원한 젊음](https://simsang.org/reader/?book=introspection&verse=air.positive.055&view=text) | 책 162쪽. | must not interfere with는 통상 방해해서는 안 된다는 방향으로도 읽힙니다. 현재의 뒤얽힘은 뒤 문맥을 고려한 선택입니다. |
| 10 | [풍 · 긍정편 57. 자유](https://simsang.org/reader/?book=introspection&verse=air.positive.057&view=text) | 책 164–165쪽. | 부정적 성품과 반대로 행동하는 것이 예속의 원인을 만든다는 서술은 주변 문맥과 충돌합니다. 번역에서 인과를 뒤집어 고치지 않았습니다. |
| 11 | [풍 · 긍정편 58. 다양성과 개별성](https://simsang.org/reader/?book=introspection&verse=air.positive.058&view=text) | 책 166쪽. | 대명사와 관계절의 문법이 불완전합니다. 앞에 놓였다는 의미는 문맥상 추정입니다. |
| 12 | [풍 · 부정편 2. 과거와 미래에서 오는 생각](https://simsang.org/reader/?book=introspection&verse=air.negative.002&view=text) | 책 375쪽. | 이 문법적 연결은 직전의 유익한 기억에 대한 설명과 어색하게 이어집니다. 원문이 대비 대상을 잘못 적었는지는 확인되지 않았습니다. |
| 13 | [풍 · 부정편 4. 죽음에 대한 두려움과 그와 유사한 두려움](https://simsang.org/reader/?book=introspection&verse=air.negative.004&view=text) | 책 377–378쪽. | he, this person, they가 번갈아 쓰여 누구에게 상처를 입혔거나 누가 상처받았는지 확정하기 어렵습니다. |
| 14 | [풍 · 부정편 12. 사소한 것에 얽매임](https://simsang.org/reader/?book=introspection&verse=air.negative.012&view=text) | 책 388쪽. | 원문에는 전치사나 완전한 절이 없습니다. 한가한 시간인지 나태함 자체를 말하는지 단정하기 어렵습니다. |
| 15 | [풍 · 부정편 19. 순진함](https://simsang.org/reader/?book=introspection&verse=air.negative.019&view=text) | 책 397쪽. | that we’re only capable as its children는 문법적으로 완결되지 않았습니다. 신뢰를 품을 능력이라는 연결은 문맥 해석입니다. |
| 16 | [풍 · 부정편 24. 경솔함](https://simsang.org/reader/?book=introspection&verse=air.negative.024&view=text) | 책 402쪽. | 앞 문단은 생명을 위태롭게 할 수 있다고 말합니다. 두 설명 사이의 관계가 분명하지 않아 부정을 임의로 삭제하지 않았습니다. |
| 17 | [풍 · 부정편 28. 악의](https://simsang.org/reader/?book=introspection&verse=air.negative.028&view=text) | 책 407쪽. | 문장 끝 yourself의 역할과 뒤의 역지사지 예시가 매끄럽게 이어지지 않습니다. 통상적인 황금률 문구로 대체하지 않았습니다. |
| 18 | [풍 · 부정편 29. 부실함](https://simsang.org/reader/?book=introspection&verse=air.negative.029&view=text) | 책 407쪽. | their sloppy work가 그 사람의 일인지 동료들의 일인지 불분명하므로, 번역에서는 부실한 일의 소유 주체를 특정하지 않았습니다. |
| 19 | [풍 · 부정편 29. 부실함](https://simsang.org/reader/?book=introspection&verse=air.negative.029&view=text) | 책 407–408쪽. | of가 경고의 대상인지 출처인지, astral이 구체적으로 무엇을 가리키는지 명확하지 않습니다. |
| 20 | [풍 · 부정편 32. 타인 도발](https://simsang.org/reader/?book=introspection&verse=air.negative.032&view=text) | 책 410쪽. | 숙주, 다른 사람, 희생자의 관계와 he, it, which의 지칭이 불명확합니다. 제삼자가 따로 있는지도 확정하기 어렵습니다. |
| 21 | [풍 · 부정편 42. 터무니없는 상태](https://simsang.org/reader/?book=introspection&verse=air.negative.042&view=text) | 책 422쪽. | i.e. 뒤의 열거가 앞의 진실에 대한 앎과 문법적으로 잘 연결되지 않아, 무엇인지 안다는 설명은 문맥을 반영한 보완입니다. |
| 22 | [풍 · 부정편 46. 기억력 부족](https://simsang.org/reader/?book=introspection&verse=air.negative.046&view=text) | 책 426쪽. | generations의 일반적인 뜻은 세대입니다. 현재 번역은 문맥상 선택이며 체코어 원문의 어휘를 확인한 것은 아닙니다. 관련된 부정편 문단 848의 이후의 생들 역시 같은 선택입니다. |
| 23 | [풍 · 부정편 49. 자신보다 똑똑한 사람에 대한 두려움(크라바트 증후군)과 무시당하지 않으려는 공명심](https://simsang.org/reader/?book=introspection&verse=air.negative.049&view=text) | 책 429쪽. | 상대에게 평판을 잃을 수 있다는 두려움이 공명심을 깨운다는 뜻인지, 실제로 그 결과가 생긴다는 뜻인지 문맥이 명료하지 않습니다. |
| 24 | [풍 · 부정편 51. 하고 있는 일에서 생각을 다른 곳으로 돌림](https://simsang.org/reader/?book=introspection&verse=air.negative.051&view=text) | 책 431쪽. | turn objects into thoughts와 along with other objects가 집중 훈련의 설명에서 어떤 의미인지 명확하지 않습니다. |
| 25 | [풍 · 부정편 59. 선행에 대한 보상을 요구함](https://simsang.org/reader/?book=introspection&verse=air.negative.059&view=text) | 책 441쪽. | 누가 누구에게 혜택을 요구하는지와 higher states의 의미가 명확하지 않습니다. 세금 감면·급여 등의 예시도 주체 해석을 어렵게 합니다. |
| 26 | [풍 · 부정편 60. 무의미함과 광기](https://simsang.org/reader/?book=introspection&verse=air.negative.060&view=text) | 책 442쪽. | 일관성 없음과 무의미함이 생각·감정·행위를 꾸미려던 표현인지, 각각 독립된 항목인지 불분명합니다. |
| 27 | [풍 · 부정편 65. 정당하지 않은 변명](https://simsang.org/reader/?book=introspection&verse=air.negative.065&view=text) | 책 447쪽. | 자신의 잘못을 정당화하는 예시라는 문맥과 어색하게 연결됩니다. 동료 탓을 한다는 의미로 원문의 전치사 관계를 바꾸지 않았습니다. |
| 28 | [풍 · 부정편 66. 이기적인 이유로 진실을 인정하지 않음](https://simsang.org/reader/?book=introspection&verse=air.negative.066&view=text) | 책 448쪽. | benefit에는 이익을 얻는다는 뜻이 있어 원문 문맥과 긴장됩니다. 현재 번역은 그 긍정적 의미를 중립적인 되돌아옴으로 완화한 선택입니다. |
| 29 | [풍 · 부정편 68. 다른 사람을 탓하면서 자신에 대한 비난은 결코 허용하지 않음](https://simsang.org/reader/?book=introspection&verse=air.negative.068&view=text) | 책 452쪽. | 분노한 상대가 위협하는 문맥과 회한의 연결이 어색합니다. 다른 영어 단어의 오기라고 단정하여 바꾸지는 않았습니다. |

## 추가 대조 범위

수·지 부록의 개별 잠정 해석은 이번 화·풍 42건 검사에 포함되지 않습니다. 원본을 확보하면 항목별 원문 쪽수·번역·부록을 함께 대조해야 합니다.

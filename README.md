# AI_Drone_Game

Drone Pilot: Systems Thinker Trial
단순한 드론 게임을 넘어, 시스템 사고를 증명하는 인터랙티브 포트폴리오 프로젝트입니다.

🔗 Live Demo 바로가기 / Play the Live Demo
https://jaewoo4200.github.io/AI_Drone_Game/

## 🇰🇷 Korean

### 🎯 프로젝트 의도

이 프로젝트는 '부품이 아닌 시스템을 설계하는 사람'이라는 개발자의 정체성을 게임적 상호작용으로 증명하고자 기획되었습니다. 플레이어는 단순히 드론을 조종하는 것을 넘어, 다음과 같은 시스템적 트레이드오프와 문제 해결 과정을 직접 체험하게 됩니다.

  - **성능과 안정성의 트레이드오프:** 속도를 중시하는 `Rapid Prototyper`와 안정성을 중시하는 `System Optimizer` 페르소나 선택을 통해, 시스템 설계의 상충 관계를 체감합니다.
  - **압박 속에서의 실시간 디버깅:** 미션 2에서는 불안정한 시스템(센서 노이즈)을 안정시키기 위해 실시간으로 파라미터를 튜닝하며, 문제의 원인을 파악하고 해결하는 엔지니어의 역할을 경험합니다.
  - **외부 환경 변수 극복:** 미션 3에서는 예측 불가능한 외부 변수(강풍)에 대응하며 목표를 달성하는 과정을 통해 시스템의 강건설계를 고민하게 합니다.

### ✨ 주요 기능

  - **2가지 페르소나 선택:** 각기 다른 비행 특성을 가진 `System Optimizer`와 `Rapid Prototyper` 중 하나를 선택하여 플레이합니다.
  - **3가지 단계별 미션:** 기초 비행, 압박 속 디버깅, 전술 기동의 테마를 가진 미션을 순차적으로 수행합니다.
  - **실시간 파라미터 튜닝:** 게임 플레이 중 드론의 제동력(Drag)과 반응성(Tilt Gain)을 직접 조절하며 비행 특성의 변화를 즉각적으로 체감할 수 있습니다.
  - **영화적 연출:** 미션 시작 시 나타나는 미션 카드와 상황에 맞는 내레이션을 통해 몰입감을 높였습니다.

### 🎮 조작법

> [\!WARNING]
> **키보드를 반드시 영문 입력 상태로 전환해주세요\!** (한글 입력 상태에서는 조작키가 인식되지 않습니다.)

| Key               | Action             |
| ----------------- | ------------------ |
| `W` `A` `S` `D`   | 전후좌우 이동      |
| `Space` / `Shift` | 상승 / 하강        |
| `Q` / `E`         | 좌우 회전 (Yaw)    |
| `R`               | 현재 미션 재시작   |
| `Mouse`           | 카메라 시점 조작   |

### 📖 개발 노트

> 본 프로젝트는 한양대학교의 'AI, 내편만들기' 교양 수업의 일환으로 제작되었습니다.
>
> 프로젝트의 기획 구체화, Three.js를 활용한 3D 환경 및 물리 로직 구현, 코드 디버깅 및 기능 개선 등 개발 전반에 걸쳐 생성형 AI 모델 **Google Gemini 2.5 Pro**의 적극적인 도움을 받아 개발되었습니다.

-----

## 🇬🇧 English

### 🎯 Project Intent

This project was conceived to prove the developer's identity as "one who designs systems, not just components" through interactive gameplay. Players do more than simply pilot a drone; they directly experience systemic trade-offs and problem-solving processes, such as:

  - **Performance vs. Stability Trade-off:** By choosing between the speed-focused `Rapid Prototyper` and the stability-focused `System Optimizer` personas, players feel the conflicting nature of system design choices.
  - **Real-time Debugging Under Pressure:** In Mission 2, players take on the role of an engineer, tuning parameters in real-time to stabilize an erratic system (sensor noise), experiencing the process of identifying and resolving issues.
  - **Overcoming External Variables:** In Mission 3, players must achieve their objective while countering unpredictable external variables (strong winds), prompting them to consider robust system design.

### ✨ Key Features

  - **Two Selectable Personas:** Choose between the `System Optimizer` and `Rapid Prototyper`, each with distinct flight characteristics.
  - **Three Themed Missions:** Progress through missions themed around basic flight, debugging under pressure, and tactical maneuvers.
  - **Real-time Parameter Tuning:** Instantly feel the impact of your decisions by adjusting the drone's Drag and Tilt Gain during gameplay.
  - **Cinematic Presentation:** Enhanced immersion through mission cards at the start of each stage and contextual narrations.

### 🎮 How to Play

> [\!WARNING]
> **Please switch your keyboard to English input mode\!** The controls will not register if your keyboard is in a non-English input mode.

| Key               | Action                       |
| ----------------- | ---------------------------- |
| `W` `A` `S` `D`   | Move Forward/Left/Back/Right |
| `Space` / `Shift` | Ascend / Descend             |
| `Q` / `E`         | Rotate (Yaw) Left/Right      |
| `R`               | Restart Current Mission      |
| `Mouse`           | Control Camera View          |

### 📖 Development Note

> This project was created as part of the 'AI, Making it My Ally' general elective course at Hanyang University.
>
> The generative AI model **Google Gemini 2.5 Pro** was actively utilized throughout the development process, from refining the initial concept and implementing the 3D environment and physics with Three.js, to debugging code and enhancing features.

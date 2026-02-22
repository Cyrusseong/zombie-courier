# Zombie Courier — 개발 계획서

> **작성일:** 2026-02-21
> **기준:** `game-design-document.md` v1.0 MVP 범위
> **배포:** Vercel (정적 사이트 + Serverless Functions)

---

## 1. 기술 스택

| 구분 | 기술 | 버전 |
|---|---|---|
| **게임 엔진** | Phaser 3 | 3.85+ |
| **언어** | TypeScript | 5.x |
| **빌드 도구** | Vite | 6.x |
| **패키지 매니저** | npm | |
| **배포** | Vercel | Static Export |
| **코드 품질** | ESLint + Prettier | |

---

## 2. 프로젝트 구조

```
zombie-courier/
├── public/
│   ├── assets/
│   │   ├── sprites/          # 스프라이트시트
│   │   ├── backgrounds/      # 패럴렉스 배경
│   │   ├── audio/            # 효과음 + 음악
│   │   └── ui/               # UI 에셋
│   ├── favicon.ico
│   └── og-image.png          # Open Graph 이미지
├── src/
│   ├── main.ts               # 엔트리포인트
│   ├── config.ts             # 게임 설정 상수
│   ├── scenes/
│   │   ├── BootScene.ts      # 에셋 로딩
│   │   ├── MenuScene.ts      # 메인 메뉴
│   │   ├── GameScene.ts      # 메인 게임플레이
│   │   └── GameOverScene.ts  # 결과 화면
│   ├── objects/
│   │   ├── Player.ts         # 오토바이 플레이어
│   │   ├── Zombie.ts         # 좀비 기본 클래스
│   │   ├── Obstacle.ts       # 장애물
│   │   ├── Item.ts           # 수집 아이템
│   │   └── Weapon.ts         # 무기
│   ├── systems/
│   │   ├── SpawnManager.ts   # 절차적 스폰 관리
│   │   ├── ScoreManager.ts   # 점수/콤보 시스템
│   │   ├── DifficultyManager.ts # DDA 난이도 조절
│   │   └── InputManager.ts   # 입력 (키보드 + 터치)
│   ├── ui/
│   │   ├── HUD.ts            # 인게임 HUD
│   │   └── ShareButton.ts    # 소셜 공유
│   └── utils/
│       ├── constants.ts      # 게임 상수
│       └── helpers.ts        # 유틸리티 함수
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vercel.json
└── README.md (기존 문서)
```

---

## 3. MVP 개발 순서

### Step 1: 프로젝트 초기화
- Vite + TypeScript + Phaser 3 프로젝트 생성
- Vercel 배포 설정 (`vercel.json`)
- 기본 디렉토리 구조

### Step 2: 코어 엔진
- Phaser Game 인스턴스 설정 (반응형 캔버스)
- BootScene (로딩)
- GameScene 기본 구조 (배경, 물리 세계)
- 패럴렉스 스크롤링 배경 (4레이어)

### Step 3: 플레이어
- Player 클래스 (오토바이 + 라이더)
- 점프/슬라이드/공격 메카닉
- 키보드 + 터치 입력
- 스프라이트 애니메이션
- 체력 시스템

### Step 4: 장애물 & 적
- 장애물 스폰 시스템 (절차적 생성)
- Obstacle 클래스 (바리케이드, 파손 도로)
- Zombie 클래스 (일반 좀비, 러너 좀비)
- 충돌 감지

### Step 5: 아이템 & 점수
- 코인 아이템
- 점수/콤보 시스템
- 거리 측정
- 연료 시스템

### Step 6: UI & 화면 흐름
- 인게임 HUD (HP, 점수, 거리, 연료)
- 메인 메뉴 (MenuScene)
- 게임 오버 / 결과 화면 (GameOverScene)
- 최고 기록 (localStorage)

### Step 7: Game Feel & 폴리시
- 파티클 이펙트 (먼지, 충돌)
- 화면 흔들림
- 히트스톱
- 점수 팝업 애니메이션

### Step 8: 배포 & 최적화
- Vercel 배포 최종 확인
- Open Graph 메타 태그
- 성능 프로파일링
- 모바일 터치 최적화

---

## 4. Vercel 배포 설정

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": null
}
```

- **빌드:** `vite build` → `dist/` 디렉토리에 정적 파일 생성
- **CDN:** Vercel Edge Network를 통한 글로벌 배포
- **HTTPS:** 자동 적용
- **커스텀 도메인:** 추후 설정

---

*작성일: 2026-02-21*

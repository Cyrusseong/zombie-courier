interface SessionRecord {
  distance: number;   // 달린 거리(m)
  timestamp: number;
}

export class DifficultyManager {
  private static readonly KEY = 'zc_dda_sessions';
  private static readonly MAX_SESSIONS = 3;
  private sessions: SessionRecord[];

  constructor() {
    const saved = localStorage.getItem(DifficultyManager.KEY);
    this.sessions = saved ? JSON.parse(saved) : [];
  }

  saveSession(distanceMeters: number): void {
    this.sessions.push({ distance: distanceMeters, timestamp: Date.now() });
    if (this.sessions.length > DifficultyManager.MAX_SESSIONS) {
      this.sessions.shift();
    }
    localStorage.setItem(DifficultyManager.KEY, JSON.stringify(this.sessions));
  }

  // 스폰 배수 반환 (1.0 기준)
  // 평균 거리 < 300m → 0.7 (쉽게)
  // 평균 거리 300~500m → 0.85
  // 평균 거리 500~1500m → 1.0 (기본)
  // 평균 거리 1500~2000m → 1.15
  // 평균 거리 > 2000m → 1.3 (어렵게)
  getSpawnMultiplier(): number {
    if (this.sessions.length < 2) return 1.0;
    const avg = this.sessions.reduce((s, r) => s + r.distance, 0) / this.sessions.length;
    if (avg < 300) return 0.7;
    if (avg < 500) return 0.85;
    if (avg > 2000) return 1.3;
    if (avg > 1500) return 1.15;
    return 1.0;
  }

  // 아이템 드롭 배수 (못할수록 아이템 더 많이)
  getItemDropMultiplier(): number {
    return 2.0 - this.getSpawnMultiplier();
  }
}

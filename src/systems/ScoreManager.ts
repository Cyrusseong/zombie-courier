export class ScoreManager {
  score: number = 0;
  distance: number = 0;
  zombiesKilled: number = 0;
  coinsCollected: number = 0;
  combo: number = 0;
  maxCombo: number = 0;

  private comboTimer: number = 0;
  private readonly COMBO_TIMEOUT = 2000;

  get comboMultiplier(): number {
    if (this.combo < 3) return 1;
    if (this.combo < 5) return 1.5;
    if (this.combo < 10) return 2;
    if (this.combo < 20) return 3;
    return 4;
  }

  addDistance(delta: number): void {
    this.distance += delta;
    // 10 points per 10m
    this.score += Math.floor(delta);
  }

  addZombieKill(baseScore: number): number {
    this.zombiesKilled++;
    this.combo++;
    this.comboTimer = Date.now();
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;

    const points = Math.floor(baseScore * this.comboMultiplier);
    this.score += points;
    return points;
  }

  addCoin(value: number = 10): void {
    this.coinsCollected++;
    this.score += value;
  }

  addNearMiss(): number {
    const points = 30;
    this.score += points;
    return points;
  }

  addDeliveryBonus(): number {
    const bonus = 1000;
    this.score += bonus;
    return bonus;
  }

  update(): void {
    // Reset combo if timeout
    if (this.combo > 0 && Date.now() - this.comboTimer > this.COMBO_TIMEOUT) {
      this.combo = 0;
    }
  }

  get distanceMeters(): number {
    return Math.floor(this.distance / 10);
  }

  get highScore(): number {
    return parseInt(localStorage.getItem('zc_highscore') || '0', 10);
  }

  get isNewHighScore(): boolean {
    return this.score > this.highScore;
  }

  saveHighScore(): void {
    if (this.isNewHighScore) {
      localStorage.setItem('zc_highscore', this.score.toString());
    }
  }

  reset(): void {
    this.score = 0;
    this.distance = 0;
    this.zombiesKilled = 0;
    this.coinsCollected = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.comboTimer = 0;
  }
}

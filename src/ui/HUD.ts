import Phaser from 'phaser';
import { GAME_WIDTH, COLORS } from '../config';

export class HUD {
  private scene: Phaser.Scene;

  private hpText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private distanceText!: Phaser.GameObjects.Text;
  private fuelBar!: Phaser.GameObjects.Rectangle;
  private fuelBg!: Phaser.GameObjects.Rectangle;

  private container!: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.create();
  }

  private create(): void {
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(100);

    // Top bar background
    const topBg = this.scene.add.rectangle(GAME_WIDTH / 2, 18, GAME_WIDTH, 36, 0x000000, 0.5);
    this.container.add(topBg);

    // HP
    this.hpText = this.scene.add.text(16, 8, '', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ff3333',
    });
    this.container.add(this.hpText);

    // Score
    this.scoreText = this.scene.add.text(GAME_WIDTH / 2, 8, '', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffffff',
    });
    this.scoreText.setOrigin(0.5, 0);
    this.container.add(this.scoreText);

    // Combo
    this.comboText = this.scene.add.text(GAME_WIDTH - 16, 8, '', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffd700',
    });
    this.comboText.setOrigin(1, 0);
    this.container.add(this.comboText);

    // Bottom bar background
    const bottomBg = this.scene.add.rectangle(GAME_WIDTH / 2, 522, GAME_WIDTH, 36, 0x000000, 0.5);
    this.container.add(bottomBg);

    // Fuel bar background
    this.fuelBg = this.scene.add.rectangle(16, 516, 120, 12, 0x333333);
    this.fuelBg.setOrigin(0, 0);
    this.container.add(this.fuelBg);

    // Fuel bar
    this.fuelBar = this.scene.add.rectangle(17, 517, 118, 10, COLORS.NEON_GREEN);
    this.fuelBar.setOrigin(0, 0);
    this.container.add(this.fuelBar);

    // Fuel label
    const fuelLabel = this.scene.add.text(16, 530, 'FUEL', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#888888',
    });
    this.container.add(fuelLabel);

    // Distance
    this.distanceText = this.scene.add.text(GAME_WIDTH / 2, 514, '', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#aaaaaa',
    });
    this.distanceText.setOrigin(0.5, 0);
    this.container.add(this.distanceText);
  }

  update(hp: number, maxHp: number, score: number, combo: number, distance: number, fuel: number): void {
    // HP as hearts
    const hearts = '♥'.repeat(hp) + '♡'.repeat(maxHp - hp);
    this.hpText.setText(hearts);

    // Score
    this.scoreText.setText(`${score.toLocaleString()}`);

    // Combo
    if (combo >= 3) {
      this.comboText.setText(`COMBO ×${combo}`);
      this.comboText.setVisible(true);
    } else {
      this.comboText.setVisible(false);
    }

    // Distance
    this.distanceText.setText(`${distance}m`);

    // Fuel bar
    const fuelWidth = Math.max(0, (fuel / 100) * 118);
    this.fuelBar.width = fuelWidth;

    // Fuel color change
    if (fuel < 20) {
      this.fuelBar.setFillStyle(COLORS.DANGER_RED);
    } else if (fuel < 40) {
      this.fuelBar.setFillStyle(0xffaa00);
    } else {
      this.fuelBar.setFillStyle(COLORS.NEON_GREEN);
    }
  }

  showScorePopup(x: number, y: number, text: string, color: string = '#ffd700'): void {
    const popup = this.scene.add.text(x, y, text, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color,
      stroke: '#000000',
      strokeThickness: 3,
    });
    popup.setOrigin(0.5);
    popup.setDepth(99);

    this.scene.tweens.add({
      targets: popup,
      y: y - 50,
      alpha: 0,
      duration: 800,
      ease: 'Quad.easeOut',
      onComplete: () => popup.destroy(),
    });
  }

  showComboAlert(combo: number): void {
    if (combo < 5) return;

    const alert = this.scene.add.text(GAME_WIDTH / 2, 200, `${combo} COMBO!`, {
      fontFamily: 'monospace',
      fontSize: '36px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 4,
    });
    alert.setOrigin(0.5);
    alert.setDepth(99);

    this.scene.tweens.add({
      targets: alert,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0,
      duration: 600,
      ease: 'Quad.easeOut',
      onComplete: () => alert.destroy(),
    });
  }

  destroy(): void {
    this.container.destroy();
  }
}

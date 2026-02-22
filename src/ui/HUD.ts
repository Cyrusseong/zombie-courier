import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, RETRO_UI } from '../config';

export class HUD {
  private scene: Phaser.Scene;

  private hpText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private distanceText!: Phaser.GameObjects.Text;
  private fuelBar!: Phaser.GameObjects.Rectangle;
  private fuelBg!: Phaser.GameObjects.Rectangle;
  private fuelText!: Phaser.GameObjects.Text;

  private container!: Phaser.GameObjects.Container;
  private isMobile: boolean;

  // Mobile touch zone indicators
  private touchZones: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.isMobile = !scene.sys.game.device.os.desktop;
    this.create();
  }

  private create(): void {
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(100);

    this.createTopBar();
    this.createBottomBar();

    if (this.isMobile) {
      this.createMobileTouchUI();
    }
  }

  private createTopBar(): void {
    // Top bar background (retro terminal style)
    const topBg = this.scene.add.rectangle(GAME_WIDTH / 2, 18, GAME_WIDTH, 36, 0x000000, 0.65);
    this.container.add(topBg);

    // Top border line (CRT green)
    const topLine = this.scene.add.rectangle(GAME_WIDTH / 2, 36, GAME_WIDTH, 1, COLORS.CRT_GREEN, 0.25);
    this.container.add(topLine);

    // HP display (retro bracket style)
    this.hpText = this.scene.add.text(12, 6, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#ff2222',
    });
    this.container.add(this.hpText);

    // HP label
    const hpLabel = this.scene.add.text(12, 24, 'HP', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: '#552222',
    });
    this.container.add(hpLabel);

    // Score (center, retro counter with leading zeros)
    this.scoreText = this.scene.add.text(GAME_WIDTH / 2, 5, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#00ff41',
    });
    this.scoreText.setOrigin(0.5, 0);
    this.container.add(this.scoreText);

    // Score label
    const scoreLabel = this.scene.add.text(GAME_WIDTH / 2, 24, 'SCORE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: '#005500',
    });
    scoreLabel.setOrigin(0.5, 0);
    this.container.add(scoreLabel);

    // Combo (right side)
    this.comboText = this.scene.add.text(GAME_WIDTH - 12, 6, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#ffb000',
    });
    this.comboText.setOrigin(1, 0);
    this.container.add(this.comboText);
  }

  private createBottomBar(): void {
    // Bottom bar background
    const bottomBg = this.scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 18, GAME_WIDTH, 36, 0x000000, 0.65);
    this.container.add(bottomBg);

    // Bottom border line
    const bottomLine = this.scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 36, GAME_WIDTH, 1, COLORS.CRT_GREEN, 0.25);
    this.container.add(bottomLine);

    // Fuel label
    const fuelLabel = this.scene.add.text(12, GAME_HEIGHT - 28, 'FUEL', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#005500',
    });
    this.container.add(fuelLabel);

    // Fuel bar bracket style: [ ████████░░░░ ]
    // Background
    this.fuelBg = this.scene.add.rectangle(50, GAME_HEIGHT - 16, 120, 10, 0x111111);
    this.fuelBg.setOrigin(0, 0.5);
    this.fuelBg.setStrokeStyle(1, COLORS.CRT_GREEN, 0.3);
    this.container.add(this.fuelBg);

    // Fill bar
    this.fuelBar = this.scene.add.rectangle(51, GAME_HEIGHT - 16, 118, 8, COLORS.CRT_GREEN);
    this.fuelBar.setOrigin(0, 0.5);
    this.container.add(this.fuelBar);

    // Fuel percentage text
    this.fuelText = this.scene.add.text(180, GAME_HEIGHT - 16, '100%', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#00ff41',
    });
    this.fuelText.setOrigin(0, 0.5);
    this.container.add(this.fuelText);

    // Distance (center bottom)
    this.distanceText = this.scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 18, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#cccccc',
    });
    this.distanceText.setOrigin(0.5, 0.5);
    this.container.add(this.distanceText);

    // Distance label
    const distLabel = this.scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 8, 'DIST', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: '#444444',
    });
    distLabel.setOrigin(0.5, 0);
    this.container.add(distLabel);
  }

  private createMobileTouchUI(): void {
    // Semi-transparent touch zone indicators that appear briefly then fade
    this.touchZones = this.scene.add.graphics();
    this.touchZones.setDepth(99);
    this.touchZones.setAlpha(0.3);

    // Jump zone (top half) - subtle border
    this.touchZones.lineStyle(1, COLORS.CRT_GREEN, 0.4);
    this.touchZones.strokeRect(2, 38, GAME_WIDTH - 4, GAME_HEIGHT * 0.5 - 40);

    // Jump label
    const jumpLabel = this.scene.add.text(GAME_WIDTH / 2, 50, 'TAP: JUMP', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#00ff41',
    });
    jumpLabel.setOrigin(0.5).setDepth(99).setAlpha(0.4);

    // Slide zone (bottom left)
    this.touchZones.lineStyle(1, COLORS.AMBER, 0.3);
    this.touchZones.strokeRect(2, GAME_HEIGHT * 0.5, GAME_WIDTH * 0.6 - 2, GAME_HEIGHT * 0.5 - 38);

    const slideLabel = this.scene.add.text(GAME_WIDTH * 0.3, GAME_HEIGHT * 0.5 + 14, 'HOLD: SLIDE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#ffb000',
    });
    slideLabel.setOrigin(0.5).setDepth(99).setAlpha(0.4);

    // Attack zone (bottom right)
    this.touchZones.lineStyle(1, COLORS.DANGER_RED, 0.3);
    this.touchZones.strokeRect(GAME_WIDTH * 0.6, GAME_HEIGHT * 0.5, GAME_WIDTH * 0.4 - 2, GAME_HEIGHT * 0.5 - 38);

    const attackLabel = this.scene.add.text(GAME_WIDTH * 0.8, GAME_HEIGHT * 0.5 + 14, 'TAP: ATK', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#ff2222',
    });
    attackLabel.setOrigin(0.5).setDepth(99).setAlpha(0.4);

    // Fade out the touch hints after a few seconds
    this.scene.tweens.add({
      targets: [this.touchZones, jumpLabel, slideLabel, attackLabel],
      alpha: 0,
      delay: 3000,
      duration: 1000,
      onComplete: () => {
        this.touchZones?.destroy();
        this.touchZones = null;
        jumpLabel.destroy();
        slideLabel.destroy();
        attackLabel.destroy();
      },
    });
  }

  update(hp: number, maxHp: number, score: number, combo: number, distance: number, fuel: number): void {
    // HP as retro bar: [███░░]
    const filledBlocks = '█'.repeat(hp);
    const emptyBlocks = '░'.repeat(maxHp - hp);
    this.hpText.setText(`[${filledBlocks}${emptyBlocks}]`);

    // HP color based on health
    if (hp <= 1) {
      this.hpText.setColor('#ff2222');
    } else if (hp <= 2) {
      this.hpText.setColor('#ffaa00');
    } else {
      this.hpText.setColor('#00ff41');
    }

    // Score with leading zeros (retro arcade counter)
    const scoreStr = score.toString().padStart(RETRO_UI.SCORE_DIGITS, '0');
    this.scoreText.setText(scoreStr);

    // Combo display
    if (combo >= 3) {
      this.comboText.setText(`x${combo} COMBO`);
      this.comboText.setVisible(true);
      // Color intensity based on combo
      if (combo >= 20) {
        this.comboText.setColor('#ff2222');
      } else if (combo >= 10) {
        this.comboText.setColor('#ff4444');
      } else if (combo >= 5) {
        this.comboText.setColor('#ffb000');
      } else {
        this.comboText.setColor('#ffd700');
      }
    } else {
      this.comboText.setVisible(false);
    }

    // Distance with "m" suffix
    this.distanceText.setText(`${distance}m`);

    // Fuel bar
    const fuelWidth = Math.max(0, (fuel / 100) * 118);
    this.fuelBar.width = fuelWidth;

    // Fuel percentage text
    this.fuelText.setText(`${Math.floor(fuel)}%`);

    // Fuel color based on level
    if (fuel < 20) {
      this.fuelBar.setFillStyle(COLORS.DANGER_RED);
      this.fuelText.setColor('#ff2222');
      // Low fuel blink
      this.fuelText.setAlpha(Math.sin(Date.now() * 0.008) * 0.3 + 0.7);
    } else if (fuel < 40) {
      this.fuelBar.setFillStyle(COLORS.AMBER);
      this.fuelText.setColor('#ffb000');
      this.fuelText.setAlpha(1);
    } else {
      this.fuelBar.setFillStyle(COLORS.CRT_GREEN);
      this.fuelText.setColor('#00ff41');
      this.fuelText.setAlpha(1);
    }
  }

  showScorePopup(x: number, y: number, text: string, color: string = '#00ff41'): void {
    const popup = this.scene.add.text(x, y, text, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
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

    const alertColor = combo >= 20 ? '#ff2222' : combo >= 10 ? '#ff4444' : '#ffb000';

    const alert = this.scene.add.text(GAME_WIDTH / 2, 180, `${combo} COMBO!`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: alertColor,
      stroke: '#000000',
      strokeThickness: 4,
    });
    alert.setOrigin(0.5);
    alert.setDepth(99);

    // Glow behind
    const glow = this.scene.add.text(GAME_WIDTH / 2, 180, `${combo} COMBO!`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: alertColor,
    });
    glow.setOrigin(0.5);
    glow.setDepth(98);
    glow.setAlpha(0.3);
    glow.setScale(1.1);

    this.scene.tweens.add({
      targets: [alert, glow],
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0,
      duration: 700,
      ease: 'Quad.easeOut',
      onComplete: () => {
        alert.destroy();
        glow.destroy();
      },
    });
  }

  destroy(): void {
    this.container.destroy();
    this.touchZones?.destroy();
  }
}

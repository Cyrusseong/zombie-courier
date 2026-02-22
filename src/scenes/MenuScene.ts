import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    // Background
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg_sky');

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 120, 'ZOMBIE\nCOURIER', {
      fontFamily: 'monospace',
      fontSize: '64px',
      color: '#39ff14',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 6,
      lineSpacing: 8,
    });
    title.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(GAME_WIDTH / 2, 230, '좀비 택배', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    });
    subtitle.setOrigin(0.5);

    // Motorcycle icon
    const bike = this.add.image(GAME_WIDTH / 2, 310, 'player');
    bike.setScale(3);

    // Play button
    const playBtn = this.add.rectangle(GAME_WIDTH / 2, 400, 200, 56, COLORS.NEON_GREEN);
    playBtn.setInteractive({ useHandCursor: true });

    const playText = this.add.text(GAME_WIDTH / 2, 400, 'PLAY', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#000000',
      fontStyle: 'bold',
    });
    playText.setOrigin(0.5);

    // High score
    const highScore = localStorage.getItem('zc_highscore') || '0';
    this.add.text(GAME_WIDTH / 2, 470, `BEST: ${highScore}`, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    // Controls hint
    this.add.text(GAME_WIDTH / 2, 510, 'JUMP: ↑/W/Space  |  SLIDE: ↓/S  |  ATTACK: J/Click', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#666666',
    }).setOrigin(0.5);

    // Button interaction
    playBtn.on('pointerover', () => playBtn.setFillStyle(0x66ff66));
    playBtn.on('pointerout', () => playBtn.setFillStyle(COLORS.NEON_GREEN));
    playBtn.on('pointerdown', () => this.startGame());

    // Keyboard start
    this.input.keyboard?.on('keydown-SPACE', () => this.startGame());
    this.input.keyboard?.on('keydown-ENTER', () => this.startGame());

    // Title animation
    this.tweens.add({
      targets: title,
      y: 125,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Bike hover animation
    this.tweens.add({
      targets: bike,
      y: 315,
      angle: 2,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private startGame(): void {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.scene.start('GameScene');
    });
  }
}

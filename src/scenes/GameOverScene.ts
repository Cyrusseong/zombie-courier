import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config';

interface GameOverData {
  score: number;
  distance: number;
  zombies: number;
  coins: number;
  maxCombo: number;
  isNewHighScore: boolean;
}

export class GameOverScene extends Phaser.Scene {
  private gameData!: GameOverData;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: GameOverData): void {
    this.gameData = data;
  }

  create(): void {
    const d = this.gameData;

    // Dark overlay
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85);

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 60, d.isNewHighScore ? 'NEW RECORD!' : 'GAME OVER', {
      fontFamily: 'monospace',
      fontSize: '42px',
      color: d.isNewHighScore ? '#ffd700' : '#ff3333',
      stroke: '#000000',
      strokeThickness: 4,
    });
    title.setOrigin(0.5);

    if (d.isNewHighScore) {
      this.tweens.add({
        targets: title,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // Stats
    const statsX = GAME_WIDTH / 2;
    let statsY = 140;
    const lineHeight = 38;

    const stats = [
      { label: 'SCORE', value: d.score.toLocaleString(), color: '#ffffff' },
      { label: 'DISTANCE', value: `${d.distance.toLocaleString()}m`, color: '#aaaaaa' },
      { label: 'ZOMBIES', value: `${d.zombies}`, color: '#4caf50' },
      { label: 'COINS', value: `${d.coins}`, color: '#ffd700' },
      { label: 'MAX COMBO', value: `×${d.maxCombo}`, color: '#ff9900' },
    ];

    stats.forEach((stat, i) => {
      const y = statsY + i * lineHeight;

      this.add.text(statsX - 100, y, stat.label, {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#888888',
      }).setOrigin(1, 0.5);

      const valueText = this.add.text(statsX + 100, y, stat.value, {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: stat.color,
        fontStyle: 'bold',
      }).setOrigin(1, 0.5);

      // Animate values in
      valueText.setAlpha(0);
      valueText.x = statsX + 120;
      this.tweens.add({
        targets: valueText,
        alpha: 1,
        x: statsX + 100,
        delay: 200 + i * 100,
        duration: 300,
        ease: 'Quad.easeOut',
      });
    });

    // High score display
    const highScore = localStorage.getItem('zc_highscore') || '0';
    this.add.text(statsX, statsY + stats.length * lineHeight + 20, `BEST: ${parseInt(highScore).toLocaleString()}`, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#666666',
    }).setOrigin(0.5);

    // Buttons
    const btnY = 420;

    // Retry button
    const retryBtn = this.add.rectangle(GAME_WIDTH / 2 - 80, btnY, 140, 48, COLORS.NEON_GREEN);
    retryBtn.setInteractive({ useHandCursor: true });
    const retryText = this.add.text(GAME_WIDTH / 2 - 80, btnY, 'RETRY', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#000000',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    retryBtn.on('pointerover', () => retryBtn.setFillStyle(0x66ff66));
    retryBtn.on('pointerout', () => retryBtn.setFillStyle(COLORS.NEON_GREEN));
    retryBtn.on('pointerdown', () => this.retry());

    // Share button
    const shareBtn = this.add.rectangle(GAME_WIDTH / 2 + 80, btnY, 140, 48, 0x1da1f2);
    shareBtn.setInteractive({ useHandCursor: true });
    const shareText = this.add.text(GAME_WIDTH / 2 + 80, btnY, 'SHARE', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    shareBtn.on('pointerover', () => shareBtn.setFillStyle(0x4db8ff));
    shareBtn.on('pointerout', () => shareBtn.setFillStyle(0x1da1f2));
    shareBtn.on('pointerdown', () => this.share());

    // Menu button
    const menuBtn = this.add.rectangle(GAME_WIDTH / 2, btnY + 60, 140, 40, 0x555555);
    menuBtn.setInteractive({ useHandCursor: true });
    const menuText = this.add.text(GAME_WIDTH / 2, btnY + 60, 'MENU', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    menuBtn.on('pointerover', () => menuBtn.setFillStyle(0x777777));
    menuBtn.on('pointerout', () => menuBtn.setFillStyle(0x555555));
    menuBtn.on('pointerdown', () => this.goToMenu());

    // Keyboard shortcuts
    this.input.keyboard?.on('keydown-SPACE', () => this.retry());
    this.input.keyboard?.on('keydown-ENTER', () => this.retry());
    this.input.keyboard?.on('keydown-ESC', () => this.goToMenu());

    // Quick hint
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 20, 'Press SPACE to retry', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#444444',
    }).setOrigin(0.5);
  }

  private retry(): void {
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.time.delayedCall(200, () => {
      this.scene.start('GameScene');
    });
  }

  private goToMenu(): void {
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.time.delayedCall(200, () => {
      this.scene.start('MenuScene');
    });
  }

  private share(): void {
    const d = this.gameData;
    const text = `🧟 Zombie Courier 🏍️\nScore: ${d.score.toLocaleString()} | Distance: ${d.distance}m | Zombies: ${d.zombies}\nCan you beat my record?`;

    if (navigator.share) {
      navigator.share({
        title: 'Zombie Courier',
        text,
      }).catch(() => {
        // User cancelled or share failed
        this.copyToClipboard(text);
      });
    } else {
      this.copyToClipboard(text);
    }
  }

  private copyToClipboard(text: string): void {
    navigator.clipboard?.writeText(text).then(() => {
      this.showCopiedMessage();
    }).catch(() => {
      // Clipboard API not available
    });
  }

  private showCopiedMessage(): void {
    const msg = this.add.text(GAME_WIDTH / 2, 500, 'Copied to clipboard!', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#39ff14',
    });
    msg.setOrigin(0.5);
    this.tweens.add({
      targets: msg,
      alpha: 0,
      y: 490,
      delay: 1500,
      duration: 500,
      onComplete: () => msg.destroy(),
    });
  }
}

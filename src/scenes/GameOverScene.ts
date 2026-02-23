import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, RETRO_UI } from '../config';
import { SoundManager } from '../systems/SoundManager';

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
  private sound_: SoundManager;

  constructor() {
    super({ key: 'GameOverScene' });
    this.sound_ = SoundManager.getInstance();
  }

  init(data: GameOverData): void {
    this.gameData = data;
    this.submitScore(data.score);
  }

  private submitScore(score: number): void {
    try {
      const playerId = localStorage.getItem('3sec-player-id');
      if (!playerId) return;

      fetch('https://3sec.games/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: 'zombie-courier',
          score,
          playerId,
          name: 'Courier',
        }),
      }).catch(() => { /* network errors are silent */ });
    } catch {
      // localStorage not available
    }
  }

  create(): void {
    const d = this.gameData;

    // Dark overlay with scanlines
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.88);

    const scanlines = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'scanlines');
    scanlines.setAlpha(0.1);
    scanlines.setDepth(50);

    this.createRetroFrame();
    this.createTitle(d);
    this.createStatsTable(d);
    this.createButtons();
    this.createFooter();
  }

  private createRetroFrame(): void {
    const g = this.add.graphics();
    g.setDepth(1);

    // Double border frame
    g.lineStyle(2, COLORS.CRT_GREEN, 0.5);
    g.strokeRect(60, 20, GAME_WIDTH - 120, GAME_HEIGHT - 40);
    g.lineStyle(1, COLORS.CRT_GREEN, 0.2);
    g.strokeRect(64, 24, GAME_WIDTH - 128, GAME_HEIGHT - 48);

    // Corner decorations
    const corners = [
      [60, 20], [GAME_WIDTH - 60, 20],
      [60, GAME_HEIGHT - 20], [GAME_WIDTH - 60, GAME_HEIGHT - 20],
    ];
    corners.forEach(([cx, cy]) => {
      g.fillStyle(COLORS.CRT_GREEN, 0.7);
      g.fillRect(cx - 2, cy - 2, 4, 4);
    });

    // Separator lines
    g.lineStyle(1, COLORS.CRT_GREEN, 0.15);
    g.lineBetween(80, 95, GAME_WIDTH - 80, 95);
    g.lineBetween(80, 370, GAME_WIDTH - 80, 370);
  }

  private createTitle(d: GameOverData): void {
    if (d.isNewHighScore) {
      // New Record! - Amber flashing
      const newRecord = this.add.text(GAME_WIDTH / 2, 42, '*** NEW RECORD ***', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#ffb000',
      });
      newRecord.setOrigin(0.5).setDepth(2);

      this.tweens.add({
        targets: newRecord,
        alpha: { from: 0.5, to: 1 },
        duration: 400,
        yoyo: true,
        repeat: -1,
      });
    }

    const titleColor = d.isNewHighScore ? '#ffd700' : '#ff2222';
    const titleText = d.isNewHighScore ? 'MISSION COMPLETE' : 'GAME OVER';

    const title = this.add.text(GAME_WIDTH / 2, d.isNewHighScore ? 66 : 56, titleText, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '24px',
      color: titleColor,
      stroke: '#000000',
      strokeThickness: 3,
    });
    title.setOrigin(0.5).setDepth(2);

    // Title glow
    const titleGlow = this.add.text(GAME_WIDTH / 2, d.isNewHighScore ? 66 : 56, titleText, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '24px',
      color: titleColor,
    });
    titleGlow.setOrigin(0.5).setDepth(1);
    titleGlow.setAlpha(0.2);
    titleGlow.setScale(1.02);

    if (d.isNewHighScore) {
      this.tweens.add({
        targets: titleGlow,
        alpha: { from: 0.15, to: 0.35 },
        scaleX: { from: 1.01, to: 1.04 },
        scaleY: { from: 1.01, to: 1.04 },
        duration: 600,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private createStatsTable(d: GameOverData): void {
    const cx = GAME_WIDTH / 2;
    let y = 120;
    const lineHeight = 42;

    // Stats header
    this.add.text(cx, y - 10, '[ RESULTS ]', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#00aa2a',
    }).setOrigin(0.5).setDepth(2);

    y += 16;

    const stats = [
      { label: 'SCORE', value: d.score.toLocaleString().padStart(10, ' '), color: '#00ff41' },
      { label: 'DISTANCE', value: `${d.distance.toLocaleString()}m`.padStart(10, ' '), color: '#cccccc' },
      { label: 'KILLS', value: `${d.zombies}`.padStart(10, ' '), color: '#44bb44' },
      { label: 'COINS', value: `${d.coins}`.padStart(10, ' '), color: '#ffd700' },
      { label: 'MAX COMBO', value: `x${d.maxCombo}`.padStart(10, ' '), color: '#ffb000' },
    ];

    stats.forEach((stat, i) => {
      const sy = y + i * lineHeight;

      // Label
      const label = this.add.text(cx - 140, sy, `> ${stat.label}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#556666',
      });
      label.setDepth(2);

      // Value (animated slide-in with sound)
      const valueText = this.add.text(cx + 140, sy, stat.value, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '12px',
        color: stat.color,
      });
      valueText.setOrigin(1, 0).setDepth(2);
      valueText.setAlpha(0);
      valueText.x = cx + 160;

      this.tweens.add({
        targets: valueText,
        alpha: 1,
        x: cx + 140,
        delay: 200 + i * 120,
        duration: 300,
        ease: 'Quad.easeOut',
        onStart: () => {
          this.sound_.play('menuSelect');
        },
      });
    });

    // High score display
    const highScore = localStorage.getItem('zc_highscore') || '0';
    this.add.text(cx, y + stats.length * lineHeight + 14, `BEST: ${parseInt(highScore).toLocaleString().padStart(8, '0')}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#334444',
    }).setOrigin(0.5).setDepth(2);
  }

  private createButtons(): void {
    const btnY = 400;
    const btnSpacing = 170;

    // ─── RETRY BUTTON ───────────────────────────────
    const retryBtn = this.add.rectangle(GAME_WIDTH / 2 - btnSpacing / 2, btnY, 150, 44, 0x001a00, 0.9);
    retryBtn.setStrokeStyle(2, COLORS.CRT_GREEN);
    retryBtn.setInteractive({ useHandCursor: true });
    retryBtn.setDepth(2);

    const retryText = this.add.text(GAME_WIDTH / 2 - btnSpacing / 2, btnY, '> RETRY', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#00ff41',
    }).setOrigin(0.5).setDepth(3);

    retryBtn.on('pointerover', () => {
      retryBtn.setFillStyle(0x003300, 0.9);
      retryText.setColor('#33ff66');
      this.sound_.play('buttonHover');
    });
    retryBtn.on('pointerout', () => {
      retryBtn.setFillStyle(0x001a00, 0.9);
      retryText.setColor('#00ff41');
    });
    retryBtn.on('pointerdown', () => this.retry());

    // ─── SHARE BUTTON ───────────────────────────────
    const shareBtn = this.add.rectangle(GAME_WIDTH / 2 + btnSpacing / 2, btnY, 150, 44, 0x0a0a20, 0.9);
    shareBtn.setStrokeStyle(2, COLORS.ITEM_BLUE);
    shareBtn.setInteractive({ useHandCursor: true });
    shareBtn.setDepth(2);

    const shareText = this.add.text(GAME_WIDTH / 2 + btnSpacing / 2, btnY, '> SHARE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#00ccff',
    }).setOrigin(0.5).setDepth(3);

    shareBtn.on('pointerover', () => {
      shareBtn.setFillStyle(0x0a1a2a, 0.9);
      shareText.setColor('#44ddff');
      this.sound_.play('buttonHover');
    });
    shareBtn.on('pointerout', () => {
      shareBtn.setFillStyle(0x0a0a20, 0.9);
      shareText.setColor('#00ccff');
    });
    shareBtn.on('pointerdown', () => this.share());

    // ─── MENU BUTTON ────────────────────────────────
    const menuBtn = this.add.rectangle(GAME_WIDTH / 2, btnY + 56, 120, 36, 0x111111, 0.8);
    menuBtn.setStrokeStyle(1, COLORS.UI_DIM);
    menuBtn.setInteractive({ useHandCursor: true });
    menuBtn.setDepth(2);

    const menuText = this.add.text(GAME_WIDTH / 2, btnY + 56, 'MENU', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#556666',
    }).setOrigin(0.5).setDepth(3);

    menuBtn.on('pointerover', () => {
      menuBtn.setFillStyle(0x222222, 0.9);
      menuText.setColor('#888888');
      this.sound_.play('buttonHover');
    });
    menuBtn.on('pointerout', () => {
      menuBtn.setFillStyle(0x111111, 0.8);
      menuText.setColor('#556666');
    });
    menuBtn.on('pointerdown', () => this.goToMenu());

    // Keyboard shortcuts
    this.input.keyboard?.on('keydown-SPACE', () => this.retry());
    this.input.keyboard?.on('keydown-ENTER', () => this.retry());
    this.input.keyboard?.on('keydown-ESC', () => this.goToMenu());
  }

  private createFooter(): void {
    // Blinking hint
    const isMobile = !this.sys.game.device.os.desktop;
    const hintText = isMobile ? 'TAP RETRY TO CONTINUE' : 'PRESS SPACE TO CONTINUE';

    const hint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 28, hintText, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#334444',
    });
    hint.setOrigin(0.5).setDepth(2);

    this.time.addEvent({
      delay: RETRO_UI.BLINK_SPEED,
      callback: () => hint.setVisible(!hint.visible),
      loop: true,
    });

    // Fullscreen toggle button (bottom-right)
    if (document.fullscreenEnabled) {
      const fsBtn = this.add.text(GAME_WIDTH - 76, GAME_HEIGHT - 28, 'FULLSCREEN', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '6px',
        color: '#334444',
      });
      fsBtn.setOrigin(0.5, 0.5).setDepth(2);
      fsBtn.setInteractive({ useHandCursor: true });
      fsBtn.on('pointerover', () => fsBtn.setColor('#00ff41'));
      fsBtn.on('pointerout', () => fsBtn.setColor('#334444'));
      fsBtn.on('pointerdown', () => {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => { /* ignore */ });
        } else {
          document.documentElement.requestFullscreen().catch(() => { /* ignore */ });
        }
        this.sound_.play('menuSelect');
      });
    }
  }

  private retry(): void {
    this.sound_.play('menuStart');
    this.cameras.main.flash(80, 0, 255, 65, false);
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.scene.start('GameScene');
    });
  }

  private goToMenu(): void {
    this.sound_.play('menuSelect');
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.scene.start('MenuScene');
    });
  }

  private share(): void {
    this.sound_.play('menuSelect');
    const d = this.gameData;
    const text = `ZOMBIE COURIER\nScore: ${d.score.toLocaleString()} | Distance: ${d.distance}m | Kills: ${d.zombies}\nCan you beat my record?`;

    if (navigator.share) {
      navigator.share({
        title: 'Zombie Courier',
        text,
      }).catch(() => {
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
    const msgBg = this.add.rectangle(GAME_WIDTH / 2, 500, 200, 24, 0x001a00, 0.9);
    msgBg.setStrokeStyle(1, COLORS.CRT_GREEN, 0.5);
    msgBg.setDepth(60);

    const msg = this.add.text(GAME_WIDTH / 2, 500, 'COPIED!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#00ff41',
    });
    msg.setOrigin(0.5).setDepth(61);

    this.tweens.add({
      targets: [msg, msgBg],
      alpha: 0,
      y: '-=15',
      delay: 1500,
      duration: 500,
      onComplete: () => {
        msg.destroy();
        msgBg.destroy();
      },
    });
  }
}

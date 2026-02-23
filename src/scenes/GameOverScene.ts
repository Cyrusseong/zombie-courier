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
    g.strokeRect(20, 20, GAME_WIDTH - 40, GAME_HEIGHT - 40);
    g.lineStyle(1, COLORS.CRT_GREEN, 0.2);
    g.strokeRect(24, 24, GAME_WIDTH - 48, GAME_HEIGHT - 48);

    // Corner decorations
    const corners: [number, number][] = [
      [20, 20], [GAME_WIDTH - 20, 20],
      [20, GAME_HEIGHT - 20], [GAME_WIDTH - 20, GAME_HEIGHT - 20],
    ];
    corners.forEach(([cx, cy]) => {
      g.fillStyle(COLORS.CRT_GREEN, 0.7);
      g.fillRect(cx - 2, cy - 2, 4, 4);
    });

    // Separator lines
    g.lineStyle(1, COLORS.CRT_GREEN, 0.15);
    g.lineBetween(40, 130, GAME_WIDTH - 40, 130);
    g.lineBetween(40, 440, GAME_WIDTH - 40, 440);
  }

  private createTitle(d: GameOverData): void {
    // y=60
    if (d.isNewHighScore) {
      const newRecord = this.add.text(GAME_WIDTH / 2, 50, '*** NEW RECORD ***', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '9px',
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
    const titleText = d.isNewHighScore ? 'MISSION\nCOMPLETE' : 'GAME\nOVER';
    const titleY = d.isNewHighScore ? 90 : 80;

    const title = this.add.text(GAME_WIDTH / 2, titleY, titleText, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '28px',
      color: titleColor,
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
      lineSpacing: 6,
    });
    title.setOrigin(0.5).setDepth(2);

    const titleGlow = this.add.text(GAME_WIDTH / 2, titleY, titleText, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '28px',
      color: titleColor,
      align: 'center',
      lineSpacing: 6,
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
    let y = 160;
    const lineHeight = 40;

    // Stats header
    this.add.text(cx, y - 14, '── RESULTS ──', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#00aa2a',
    }).setOrigin(0.5).setDepth(2);

    const stats = [
      { label: 'SCORE', value: d.score.toString().padStart(8, '0'), color: '#00ff41' },
      { label: 'DISTANCE', value: `${d.distance}m`, color: '#cccccc' },
      { label: 'ZOMBIES', value: `${d.zombies}`, color: '#44bb44' },
      { label: 'COINS', value: `${d.coins}`, color: '#ffd700' },
      { label: 'MAX COMBO', value: `x${d.maxCombo}`, color: '#ffb000' },
    ];

    stats.forEach((stat, i) => {
      const sy = y + i * lineHeight;

      const label = this.add.text(cx - 130, sy, `> ${stat.label}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '9px',
        color: '#556666',
      });
      label.setDepth(2);

      const valueText = this.add.text(cx + 130, sy, stat.value, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '11px',
        color: stat.color,
      });
      valueText.setOrigin(1, 0).setDepth(2);
      valueText.setAlpha(0);
      valueText.x = cx + 150;

      this.tweens.add({
        targets: valueText,
        alpha: 1,
        x: cx + 130,
        delay: 200 + i * 120,
        duration: 300,
        ease: 'Quad.easeOut',
        onStart: () => {
          this.sound_.play('menuSelect');
        },
      });
    });

    // High score
    const highScore = localStorage.getItem('zc_highscore') || '0';
    const hsY = y + stats.length * lineHeight + 16;
    this.add.text(cx, hsY, '── HIGH SCORE ──', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#334444',
    }).setOrigin(0.5).setDepth(2);

    this.add.text(cx, hsY + 22, parseInt(highScore).toString().padStart(8, '0'), {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '13px',
      color: '#ffb000',
    }).setOrigin(0.5).setDepth(2);
  }

  private createButtons(): void {
    // y≈460: three buttons side by side
    const btnY = 468;
    const btnSpacing = 118;

    // RETRY button
    const retryBtn = this.add.rectangle(GAME_WIDTH / 2 - btnSpacing, btnY, 100, 44, 0x001a00, 0.9);
    retryBtn.setStrokeStyle(2, COLORS.CRT_GREEN);
    retryBtn.setInteractive({ useHandCursor: true });
    retryBtn.setDepth(2);

    const retryText = this.add.text(GAME_WIDTH / 2 - btnSpacing, btnY, 'RETRY', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
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

    // SHARE button
    const shareBtn = this.add.rectangle(GAME_WIDTH / 2, btnY, 100, 44, 0x0a0a20, 0.9);
    shareBtn.setStrokeStyle(2, COLORS.ITEM_BLUE);
    shareBtn.setInteractive({ useHandCursor: true });
    shareBtn.setDepth(2);

    const shareText = this.add.text(GAME_WIDTH / 2, btnY, 'SHARE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
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

    // MENU button
    const menuBtn = this.add.rectangle(GAME_WIDTH / 2 + btnSpacing, btnY, 100, 44, 0x111111, 0.8);
    menuBtn.setStrokeStyle(1, COLORS.UI_DIM);
    menuBtn.setInteractive({ useHandCursor: true });
    menuBtn.setDepth(2);

    const menuText = this.add.text(GAME_WIDTH / 2 + btnSpacing, btnY, 'MENU', {
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

    // Fullscreen toggle
    if (document.fullscreenEnabled) {
      const fsBtn = this.add.text(GAME_WIDTH - 30, GAME_HEIGHT - 28, 'FS', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '6px',
        color: '#334444',
      });
      fsBtn.setOrigin(1, 0.5).setDepth(2);
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
    const msgBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 80, 180, 24, 0x001a00, 0.9);
    msgBg.setStrokeStyle(1, COLORS.CRT_GREEN, 0.5);
    msgBg.setDepth(60);

    const msg = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 80, 'COPIED!', {
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

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, RETRO_UI } from '../config';
import { SoundManager } from '../systems/SoundManager';

export class MenuScene extends Phaser.Scene {
  private blinkTimer: Phaser.Time.TimerEvent | null = null;
  private sound_: SoundManager;
  private audioInitialized = false;

  constructor() {
    super({ key: 'MenuScene' });
    this.sound_ = SoundManager.getInstance();
  }

  create(): void {
    // Background
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg_sky');

    // CRT Scanline overlay
    const scanlines = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'scanlines');
    scanlines.setAlpha(0.15);
    scanlines.setDepth(50);

    // Dark overlay for menu
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.55);

    this.createRetroFrame();
    this.createTitle();
    this.createMenuContent();
    this.createControls();
    this.createSoundControls();

    // Init audio on first user interaction
    this.input.once('pointerdown', () => this.initAudio());
    this.input.keyboard?.once('keydown', () => this.initAudio());
  }

  private async initAudio(): Promise<void> {
    if (this.audioInitialized) return;
    this.audioInitialized = true;
    await this.sound_.init();
    this.sound_.startMenuBGM();
  }

  private createRetroFrame(): void {
    const g = this.add.graphics();
    g.setDepth(1);

    // Outer frame
    g.lineStyle(2, COLORS.CRT_GREEN, 0.6);
    g.strokeRect(16, 16, GAME_WIDTH - 32, GAME_HEIGHT - 32);
    g.lineStyle(1, COLORS.CRT_GREEN, 0.25);
    g.strokeRect(20, 20, GAME_WIDTH - 40, GAME_HEIGHT - 40);

    // Corner decorations
    const corners: [number, number][] = [
      [16, 16], [GAME_WIDTH - 16, 16],
      [16, GAME_HEIGHT - 16], [GAME_WIDTH - 16, GAME_HEIGHT - 16],
    ];
    corners.forEach(([cx, cy]) => {
      g.fillStyle(COLORS.CRT_GREEN, 0.8);
      g.fillRect(cx - 3, cy - 3, 6, 6);
      g.fillStyle(COLORS.CRT_GREEN, 0.3);
      g.fillRect(cx - 5, cy - 1, 10, 2);
      g.fillRect(cx - 1, cy - 5, 2, 10);
    });

    // Horizontal separator lines
    g.lineStyle(1, COLORS.CRT_GREEN, 0.15);
    g.lineBetween(36, 150, GAME_WIDTH - 36, 150);
    g.lineBetween(36, GAME_HEIGHT - 100, GAME_WIDTH - 36, GAME_HEIGHT - 100);
  }

  private createTitle(): void {
    // y=80: main title
    const titleMain = this.add.text(GAME_WIDTH / 2, 70, 'ZOMBIE\nCOURIER', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '26px',
      color: '#00ff41',
      stroke: '#003300',
      strokeThickness: 4,
      align: 'center',
      lineSpacing: 8,
    });
    titleMain.setOrigin(0.5);
    titleMain.setDepth(2);

    const titleGlow = this.add.text(GAME_WIDTH / 2, 70, 'ZOMBIE\nCOURIER', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '26px',
      color: '#00ff41',
      align: 'center',
      lineSpacing: 8,
    });
    titleGlow.setOrigin(0.5);
    titleGlow.setAlpha(0.3);
    titleGlow.setScale(1.02);
    titleGlow.setDepth(1);

    this.tweens.add({
      targets: [titleGlow],
      alpha: { from: 0.2, to: 0.4 },
      scaleX: { from: 1.01, to: 1.03 },
      scaleY: { from: 1.01, to: 1.03 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // y=160: subtitle
    const subtitle = this.add.text(GAME_WIDTH / 2, 158, '좀비 택배', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ffb000',
      stroke: '#332200',
      strokeThickness: 2,
    });
    subtitle.setOrigin(0.5);
    subtitle.setDepth(2);

    this.tweens.add({
      targets: subtitle,
      alpha: { from: 0.8, to: 1 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
    });
  }

  private createMenuContent(): void {
    // y=220: motorcycle icon + bob animation
    const bike = this.add.image(GAME_WIDTH / 2, 230, 'player');
    bike.setScale(3.5);
    bike.setDepth(2);

    this.tweens.add({
      targets: bike,
      y: 238,
      angle: { from: -1, to: 1 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Road line under bike
    const g = this.add.graphics();
    g.setDepth(1);
    g.lineStyle(2, COLORS.CRT_GREEN, 0.3);
    g.lineBetween(GAME_WIDTH / 2 - 120, 268, GAME_WIDTH / 2 + 120, 268);
    g.lineStyle(1, COLORS.AMBER, 0.4);
    for (let i = -5; i <= 5; i++) {
      g.lineBetween(
        GAME_WIDTH / 2 + i * 22 - 7, 268,
        GAME_WIDTH / 2 + i * 22 + 7, 268
      );
    }

    // y=300: mission brief
    const briefBg = this.add.rectangle(GAME_WIDTH / 2, 308, GAME_WIDTH - 48, 64, 0x000000, 0.7);
    briefBg.setStrokeStyle(1, COLORS.CRT_GREEN, 0.3);
    briefBg.setDepth(2);

    this.add.text(GAME_WIDTH / 2, 290, '[ MISSION BRIEF ]', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#00aa2a',
    }).setOrigin(0.5).setDepth(3);

    this.add.text(GAME_WIDTH / 2, 316, 'DELIVER PACKAGES\nTHROUGH THE WASTELAND', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#00ff41',
      align: 'center',
      lineSpacing: 6,
    }).setOrigin(0.5).setDepth(3);

    // y=380: high score
    const highScore = localStorage.getItem('zc_highscore') || '0';
    const scorePadded = parseInt(highScore).toString().padStart(8, '0');

    this.add.text(GAME_WIDTH / 2, 370, 'HIGH SCORE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#556666',
    }).setOrigin(0.5).setDepth(2);

    const hsText = this.add.text(GAME_WIDTH / 2, 390, scorePadded, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#ffb000',
    });
    hsText.setOrigin(0.5).setDepth(2);

    this.tweens.add({
      targets: hsText,
      alpha: { from: 0.8, to: 1 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });

    // y=440: START button (full width - margins)
    const btnY = 450;
    const playBtnBg = this.add.rectangle(GAME_WIDTH / 2, btnY, GAME_WIDTH - 60, 54, 0x001a00, 0.9);
    playBtnBg.setStrokeStyle(2, COLORS.CRT_GREEN);
    playBtnBg.setInteractive({ useHandCursor: true });
    playBtnBg.setDepth(2);

    const playText = this.add.text(GAME_WIDTH / 2, btnY, '> START GAME <', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#00ff41',
    });
    playText.setOrigin(0.5).setDepth(3);

    this.tweens.add({
      targets: playBtnBg,
      alpha: { from: 0.8, to: 1 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    playBtnBg.on('pointerover', () => {
      playBtnBg.setFillStyle(0x003300, 0.9);
      playText.setColor('#33ff66');
      this.sound_.play('buttonHover');
    });
    playBtnBg.on('pointerout', () => {
      playBtnBg.setFillStyle(0x001a00, 0.9);
      playText.setColor('#00ff41');
    });
    playBtnBg.on('pointerdown', () => this.startGame());

    // INSERT COIN blinking
    const insertCoin = this.add.text(GAME_WIDTH / 2, 514, 'INSERT COIN', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#ffb000',
    });
    insertCoin.setOrigin(0.5).setDepth(3);

    this.blinkTimer = this.time.addEvent({
      delay: RETRO_UI.BLINK_SPEED,
      callback: () => {
        insertCoin.setVisible(!insertCoin.visible);
      },
      loop: true,
    });
  }

  private createControls(): void {
    const isMobile = !this.sys.game.device.os.desktop;

    // y=540: control hint
    if (isMobile) {
      this.add.text(GAME_WIDTH / 2, 548, 'SLIDE | JUMP | ATTACK buttons below', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '6px',
        color: '#334444',
        align: 'center',
        wordWrap: { width: GAME_WIDTH - 60 },
      }).setOrigin(0.5).setDepth(2);
    } else {
      this.add.text(GAME_WIDTH / 2, 548, 'W/SPACE: JUMP   S: SLIDE   J: ATTACK', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '6px',
        color: '#334444',
        align: 'center',
        wordWrap: { width: GAME_WIDTH - 60 },
      }).setOrigin(0.5).setDepth(2);
    }

    // Version
    this.add.text(GAME_WIDTH - 30, GAME_HEIGHT - 22, 'v0.3', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: '#223322',
    }).setOrigin(1, 0.5).setDepth(2);

    // Keyboard start
    this.input.keyboard?.on('keydown-SPACE', () => this.startGame());
    this.input.keyboard?.on('keydown-ENTER', () => this.startGame());
  }

  private createSoundControls(): void {
    // Sound toggle (bottom-left)
    const soundIcon = this.add.text(36, GAME_HEIGHT - 22, this.sound_.muted ? 'SND:OFF' : 'SND:ON', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: this.sound_.muted ? '#552222' : '#005500',
    });
    soundIcon.setOrigin(0, 0.5).setDepth(2);
    soundIcon.setInteractive({ useHandCursor: true });
    soundIcon.on('pointerdown', async () => {
      if (!this.audioInitialized) await this.initAudio();
      const muted = this.sound_.toggleMute();
      soundIcon.setText(muted ? 'SND:OFF' : 'SND:ON');
      soundIcon.setColor(muted ? '#552222' : '#005500');
      if (!muted) {
        this.sound_.play('menuSelect');
        this.sound_.startMenuBGM();
      } else {
        this.sound_.stopMenuBGM();
      }
    });

    // Fullscreen (bottom-right)
    if (document.fullscreenEnabled) {
      const fsBtn = this.add.text(GAME_WIDTH - 60, GAME_HEIGHT - 22, 'FULLSCR', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '6px',
        color: '#005500',
      });
      fsBtn.setOrigin(1, 0.5).setDepth(2);
      fsBtn.setInteractive({ useHandCursor: true });
      fsBtn.on('pointerover', () => fsBtn.setColor('#00ff41'));
      fsBtn.on('pointerout', () => fsBtn.setColor('#005500'));
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

  private async startGame(): Promise<void> {
    if (this.blinkTimer) {
      this.blinkTimer.destroy();
    }

    if (!this.audioInitialized) await this.initAudio();

    this.sound_.stopMenuBGM();
    this.sound_.play('menuStart');

    this.cameras.main.flash(100, 0, 255, 65, false);
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.time.delayedCall(400, () => {
      this.scene.start('GameScene');
    });
  }
}

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, RETRO_UI } from '../config';
import { SoundManager } from '../systems/SoundManager';

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

  // Mobile touch zone guide elements
  private guideContainer: Phaser.GameObjects.Container | null = null;
  private guideVisible = false;

  // Touch feedback flash
  private touchFlash: Phaser.GameObjects.Rectangle | null = null;

  // Control buttons
  private muteIcon!: Phaser.GameObjects.Text;

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
      this.createMobileControls();
      this.showTouchGuide();
      this.createTouchFeedback();
    } else {
      this.createDesktopControls();
    }
  }

  private createTopBar(): void {
    const topBg = this.scene.add.rectangle(GAME_WIDTH / 2, 18, GAME_WIDTH, 36, 0x000000, 0.65);
    this.container.add(topBg);

    const topLine = this.scene.add.rectangle(GAME_WIDTH / 2, 36, GAME_WIDTH, 1, COLORS.CRT_GREEN, 0.25);
    this.container.add(topLine);

    // HP display
    this.hpText = this.scene.add.text(12, 6, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#ff2222',
    });
    this.container.add(this.hpText);

    const hpLabel = this.scene.add.text(12, 24, 'HP', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: '#552222',
    });
    this.container.add(hpLabel);

    // Score (center)
    this.scoreText = this.scene.add.text(GAME_WIDTH / 2, 5, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#00ff41',
    });
    this.scoreText.setOrigin(0.5, 0);
    this.container.add(this.scoreText);

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
    const bottomBg = this.scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 18, GAME_WIDTH, 36, 0x000000, 0.65);
    this.container.add(bottomBg);

    const bottomLine = this.scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 36, GAME_WIDTH, 1, COLORS.CRT_GREEN, 0.25);
    this.container.add(bottomLine);

    const fuelLabel = this.scene.add.text(12, GAME_HEIGHT - 28, 'FUEL', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#005500',
    });
    this.container.add(fuelLabel);

    this.fuelBg = this.scene.add.rectangle(50, GAME_HEIGHT - 16, 120, 10, 0x111111);
    this.fuelBg.setOrigin(0, 0.5);
    this.fuelBg.setStrokeStyle(1, COLORS.CRT_GREEN, 0.3);
    this.container.add(this.fuelBg);

    this.fuelBar = this.scene.add.rectangle(51, GAME_HEIGHT - 16, 118, 8, COLORS.CRT_GREEN);
    this.fuelBar.setOrigin(0, 0.5);
    this.container.add(this.fuelBar);

    this.fuelText = this.scene.add.text(180, GAME_HEIGHT - 16, '100%', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#00ff41',
    });
    this.fuelText.setOrigin(0, 0.5);
    this.container.add(this.fuelText);

    this.distanceText = this.scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 18, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#cccccc',
    });
    this.distanceText.setOrigin(0.5, 0.5);
    this.container.add(this.distanceText);

    const distLabel = this.scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 8, 'DIST', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: '#444444',
    });
    distLabel.setOrigin(0.5, 0);
    this.container.add(distLabel);
  }

  /**
   * Mobile controls in the bottom HUD bar (right side)
   * so they DON'T overlap the jump zone.
   */
  private createMobileControls(): void {
    const sound = SoundManager.getInstance();
    const btnY = GAME_HEIGHT - 16;

    // "?" button to re-show touch zone guide
    const helpBtn = this.scene.add.text(GAME_WIDTH - 14, btnY, '?', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#005500',
    });
    helpBtn.setOrigin(0.5, 0.5).setDepth(101);
    helpBtn.setInteractive({ useHandCursor: true });
    helpBtn.on('pointerdown', (p: Phaser.Input.Pointer) => {
      p.event.stopPropagation();
      this.showTouchGuide();
      sound.play('menuSelect');
    });
    this.container.add(helpBtn);

    // Sound mute toggle
    this.muteIcon = this.scene.add.text(GAME_WIDTH - 38, btnY, sound.muted ? 'X' : '#', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: sound.muted ? '#552222' : '#005500',
    });
    this.muteIcon.setOrigin(0.5, 0.5).setDepth(101);
    this.muteIcon.setInteractive({ useHandCursor: true });
    this.muteIcon.on('pointerdown', (p: Phaser.Input.Pointer) => {
      p.event.stopPropagation();
      const muted = sound.toggleMute();
      this.muteIcon.setText(muted ? 'X' : '#');
      this.muteIcon.setColor(muted ? '#552222' : '#005500');
      sound.play('menuSelect');
    });
    this.container.add(this.muteIcon);

    // Fullscreen button
    if (document.fullscreenEnabled) {
      const fsBtn = this.scene.add.text(GAME_WIDTH - 60, btnY, '[]', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '7px',
        color: '#005500',
      });
      fsBtn.setOrigin(0.5, 0.5).setDepth(101);
      fsBtn.setInteractive({ useHandCursor: true });
      fsBtn.on('pointerdown', (p: Phaser.Input.Pointer) => {
        p.event.stopPropagation();
        this.toggleFullscreen();
        sound.play('menuSelect');
      });
      this.container.add(fsBtn);
    }
  }

  private createDesktopControls(): void {
    const sound = SoundManager.getInstance();

    this.muteIcon = this.scene.add.text(GAME_WIDTH - 14, GAME_HEIGHT - 16, sound.muted ? 'X' : '#', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: sound.muted ? '#552222' : '#005500',
    });
    this.muteIcon.setOrigin(1, 0.5).setDepth(101);
    this.muteIcon.setInteractive({ useHandCursor: true });
    this.muteIcon.on('pointerdown', () => {
      const muted = sound.toggleMute();
      this.muteIcon.setText(muted ? 'X' : '#');
      this.muteIcon.setColor(muted ? '#552222' : '#005500');
      sound.play('menuSelect');
    });
    this.container.add(this.muteIcon);
  }

  private toggleFullscreen(): void {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => { /* ignore */ });
    } else {
      document.documentElement.requestFullscreen().catch(() => { /* ignore */ });
    }
  }

  /**
   * Show touch zone guide overlay.
   * Clear visual diagram of where to tap/hold.
   * Auto-fades after 5s, re-showable via "?" button.
   */
  private showTouchGuide(): void {
    if (this.guideContainer) {
      this.guideContainer.destroy();
      this.guideContainer = null;
    }

    this.guideVisible = true;
    this.guideContainer = this.scene.add.container(0, 0);
    this.guideContainer.setDepth(105);

    // Semi-transparent full overlay
    const overlay = this.scene.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT,
      0x000000, 0.5
    );
    this.guideContainer.add(overlay);

    const midY = GAME_HEIGHT * 0.5;
    const attackX = GAME_WIDTH * 0.6;
    const topBarH = 38;
    const bottomBarH = 38;

    // ─── JUMP ZONE (top half) ──────────────────────
    const jumpZone = this.scene.add.rectangle(
      GAME_WIDTH / 2, topBarH + (midY - topBarH) / 2,
      GAME_WIDTH - 8, midY - topBarH - 4,
      COLORS.CRT_GREEN, 0.06
    );
    jumpZone.setStrokeStyle(1, COLORS.CRT_GREEN, 0.5);
    this.guideContainer.add(jumpZone);

    const jumpIcon = this.scene.add.text(GAME_WIDTH / 2, midY / 2 + 10, 'TAP: JUMP', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#00ff41',
    });
    jumpIcon.setOrigin(0.5).setAlpha(0.7);
    this.guideContainer.add(jumpIcon);

    const jumpArrow = this.scene.add.text(GAME_WIDTH / 2, midY / 2 - 14, '^', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '18px',
      color: '#00ff41',
    });
    jumpArrow.setOrigin(0.5).setAlpha(0.5);
    this.guideContainer.add(jumpArrow);

    // ─── SLIDE ZONE (bottom-left) ──────────────────
    const slideW = attackX - 4;
    const slideH = GAME_HEIGHT - midY - bottomBarH - 4;
    const slideZone = this.scene.add.rectangle(
      slideW / 2 + 4, midY + slideH / 2 + 2,
      slideW, slideH,
      COLORS.AMBER, 0.06
    );
    slideZone.setStrokeStyle(1, COLORS.AMBER, 0.5);
    this.guideContainer.add(slideZone);

    const slideLabel = this.scene.add.text(
      slideW / 2 + 4, midY + slideH / 2 + 2,
      'HOLD: SLIDE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffb000',
    });
    slideLabel.setOrigin(0.5).setAlpha(0.7);
    this.guideContainer.add(slideLabel);

    const slideHint = this.scene.add.text(
      slideW / 2 + 4, midY + slideH / 2 - 18,
      'v HOLD v', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#ffb000',
    });
    slideHint.setOrigin(0.5).setAlpha(0.4);
    this.guideContainer.add(slideHint);

    // ─── ATTACK ZONE (bottom-right) ────────────────
    const atkW = GAME_WIDTH - attackX - 4;
    const atkZone = this.scene.add.rectangle(
      attackX + atkW / 2, midY + slideH / 2 + 2,
      atkW, slideH,
      COLORS.DANGER_RED, 0.06
    );
    atkZone.setStrokeStyle(1, COLORS.DANGER_RED, 0.5);
    this.guideContainer.add(atkZone);

    const atkLabel = this.scene.add.text(
      attackX + atkW / 2, midY + slideH / 2 + 2,
      'TAP: ATK', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ff2222',
    });
    atkLabel.setOrigin(0.5).setAlpha(0.7);
    this.guideContainer.add(atkLabel);

    // Divider lines
    const g = this.scene.add.graphics();
    g.lineStyle(1, 0xffffff, 0.15);
    g.lineBetween(attackX, midY + 2, attackX, GAME_HEIGHT - bottomBarH - 2);
    g.lineStyle(1, 0xffffff, 0.1);
    g.lineBetween(4, midY, GAME_WIDTH - 4, midY);
    this.guideContainer.add(g);

    // Bottom hint
    const hint = this.scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 46, 'TAP ANYWHERE TO DISMISS  |  ? TO RESHOW', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '5px',
      color: '#556666',
    });
    hint.setOrigin(0.5);
    this.guideContainer.add(hint);

    // Dismiss on tap (with delay to prevent immediate dismiss)
    this.scene.time.delayedCall(300, () => {
      const dismissHandler = () => {
        this.hideTouchGuide();
        this.scene.input.off('pointerdown', dismissHandler);
      };
      this.scene.input.on('pointerdown', dismissHandler);
    });

    // Auto-fade after 5 seconds
    this.scene.time.delayedCall(5000, () => {
      this.hideTouchGuide();
    });
  }

  private hideTouchGuide(): void {
    if (!this.guideVisible || !this.guideContainer) return;
    this.guideVisible = false;

    this.scene.tweens.add({
      targets: this.guideContainer,
      alpha: 0,
      duration: 400,
      onComplete: () => {
        this.guideContainer?.destroy();
        this.guideContainer = null;
      },
    });
  }

  private createTouchFeedback(): void {
    this.touchFlash = this.scene.add.rectangle(0, 0, 60, 60, COLORS.CRT_GREEN, 0);
    this.touchFlash.setDepth(98);

    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.guideVisible || !this.touchFlash) return;

      this.touchFlash.setPosition(pointer.x, pointer.y);
      this.touchFlash.setScale(1);

      const midY = GAME_HEIGHT * 0.5;
      const attackX = GAME_WIDTH * 0.6;
      if (pointer.y < midY) {
        this.touchFlash.setFillStyle(COLORS.CRT_GREEN, 0.15);
      } else if (pointer.x > attackX) {
        this.touchFlash.setFillStyle(COLORS.DANGER_RED, 0.15);
      } else {
        this.touchFlash.setFillStyle(COLORS.AMBER, 0.15);
      }

      this.scene.tweens.add({
        targets: this.touchFlash,
        alpha: { from: 0.15, to: 0 },
        scaleX: { from: 1, to: 2 },
        scaleY: { from: 1, to: 2 },
        duration: 200,
      });
    });
  }

  update(hp: number, maxHp: number, score: number, combo: number, distance: number, fuel: number): void {
    const filledBlocks = '█'.repeat(hp);
    const emptyBlocks = '░'.repeat(maxHp - hp);
    this.hpText.setText(`[${filledBlocks}${emptyBlocks}]`);

    if (hp <= 1) {
      this.hpText.setColor('#ff2222');
    } else if (hp <= 2) {
      this.hpText.setColor('#ffaa00');
    } else {
      this.hpText.setColor('#00ff41');
    }

    const scoreStr = score.toString().padStart(RETRO_UI.SCORE_DIGITS, '0');
    this.scoreText.setText(scoreStr);

    if (combo >= 3) {
      this.comboText.setText(`x${combo} COMBO`);
      this.comboText.setVisible(true);
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

    this.distanceText.setText(`${distance}m`);

    const fuelWidth = Math.max(0, (fuel / 100) * 118);
    this.fuelBar.width = fuelWidth;
    this.fuelText.setText(`${Math.floor(fuel)}%`);

    if (fuel < 20) {
      this.fuelBar.setFillStyle(COLORS.DANGER_RED);
      this.fuelText.setColor('#ff2222');
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
    this.guideContainer?.destroy();
    this.touchFlash?.destroy();
  }
}

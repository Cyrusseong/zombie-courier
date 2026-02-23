import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, COLORS, RETRO_UI,
  HUD_TOP, HUD_STATS, HUD_BUTTONS,
} from '../config';
import { SoundManager } from '../systems/SoundManager';

export class HUD {
  private scene: Phaser.Scene;

  private hpText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private distanceText!: Phaser.GameObjects.Text;
  private fuelBar!: Phaser.GameObjects.Rectangle;
  private fuelText!: Phaser.GameObjects.Text;

  private container!: Phaser.GameObjects.Container;

  // Control button visuals
  private slideBtn!: Phaser.GameObjects.Container;
  private jumpBtn!: Phaser.GameObjects.Container;
  private attackBtn!: Phaser.GameObjects.Container;

  // Mute icon
  private muteIcon!: Phaser.GameObjects.Text;

  // External input state (set by button callbacks)
  private _jumpPressed = false;
  private _slideHeld = false;
  private _attackPressed = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.create();
  }

  // ─── Public input accessors (called by InputManager) ──────
  get jumpPressed(): boolean {
    const v = this._jumpPressed;
    this._jumpPressed = false;
    return v;
  }

  get slideHeld(): boolean {
    return this._slideHeld;
  }

  get attackPressed(): boolean {
    const v = this._attackPressed;
    this._attackPressed = false;
    return v;
  }

  private create(): void {
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(100);

    this.createTopBar();
    this.createStatsBar();
    this.createButtonBar();
  }

  // ─── TOP BAR (y=0..HUD_TOP=44) ───────────────────
  private createTopBar(): void {
    const midY = HUD_TOP / 2;  // 22

    // Background
    const topBg = this.scene.add.rectangle(GAME_WIDTH / 2, midY, GAME_WIDTH, HUD_TOP, 0x000000, 0.72);
    this.container.add(topBg);

    const bottomLine = this.scene.add.rectangle(GAME_WIDTH / 2, HUD_TOP, GAME_WIDTH, 1, COLORS.CRT_GREEN, 0.25);
    this.container.add(bottomLine);

    // HP (left)
    this.hpText = this.scene.add.text(8, midY, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#ff2222',
    });
    this.hpText.setOrigin(0, 0.5);
    this.container.add(this.hpText);

    // Score (center)
    this.scoreText = this.scene.add.text(GAME_WIDTH / 2, midY, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#00ff41',
    });
    this.scoreText.setOrigin(0.5, 0.5);
    this.container.add(this.scoreText);

    // Combo (right)
    this.comboText = this.scene.add.text(GAME_WIDTH - 8, midY, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#ffb000',
    });
    this.comboText.setOrigin(1, 0.5);
    this.container.add(this.comboText);
  }

  // ─── STATS BAR (y=GAME_HEIGHT-HUD_STATS-HUD_BUTTONS..GAME_HEIGHT-HUD_BUTTONS)
  // = y=600..636
  private createStatsBar(): void {
    const statsY = GAME_HEIGHT - HUD_STATS - HUD_BUTTONS;  // 600
    const midY = statsY + HUD_STATS / 2;                   // 618

    const statsBg = this.scene.add.rectangle(GAME_WIDTH / 2, midY, GAME_WIDTH, HUD_STATS, 0x000000, 0.65);
    this.container.add(statsBg);

    const topLine = this.scene.add.rectangle(GAME_WIDTH / 2, statsY, GAME_WIDTH, 1, COLORS.CRT_GREEN, 0.2);
    this.container.add(topLine);
    const bottomLine = this.scene.add.rectangle(GAME_WIDTH / 2, statsY + HUD_STATS, GAME_WIDTH, 1, COLORS.CRT_GREEN, 0.2);
    this.container.add(bottomLine);

    // FUEL label
    const fuelLabel = this.scene.add.text(8, midY, 'FUEL', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: '#005500',
    });
    fuelLabel.setOrigin(0, 0.5);
    this.container.add(fuelLabel);

    // Fuel bar (after FUEL label)
    const fuelBarX = 42;
    const fuelBarW = 100;
    const fuelBg = this.scene.add.rectangle(fuelBarX, midY, fuelBarW, 10, 0x111111);
    fuelBg.setOrigin(0, 0.5);
    fuelBg.setStrokeStyle(1, COLORS.CRT_GREEN, 0.3);
    this.container.add(fuelBg);

    this.fuelBar = this.scene.add.rectangle(fuelBarX + 1, midY, fuelBarW - 2, 8, COLORS.CRT_GREEN);
    this.fuelBar.setOrigin(0, 0.5);
    this.container.add(this.fuelBar);

    // Fuel %
    this.fuelText = this.scene.add.text(fuelBarX + fuelBarW + 5, midY, '100%', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#00ff41',
    });
    this.fuelText.setOrigin(0, 0.5);
    this.container.add(this.fuelText);

    // Distance (center)
    this.distanceText = this.scene.add.text(GAME_WIDTH / 2, midY, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#cccccc',
    });
    this.distanceText.setOrigin(0.5, 0.5);
    this.container.add(this.distanceText);

    // Mute button (right)
    const sound = SoundManager.getInstance();
    this.muteIcon = this.scene.add.text(GAME_WIDTH - 8, midY, sound.muted ? '[X]' : '[♪]', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: sound.muted ? '#552222' : '#005500',
    });
    this.muteIcon.setOrigin(1, 0.5).setDepth(101);
    this.muteIcon.setInteractive({ useHandCursor: true });
    this.muteIcon.on('pointerdown', (p: Phaser.Input.Pointer) => {
      p.event.stopPropagation();
      const muted = sound.toggleMute();
      this.muteIcon.setText(muted ? '[X]' : '[♪]');
      this.muteIcon.setColor(muted ? '#552222' : '#005500');
      sound.play('menuSelect');
    });
    this.container.add(this.muteIcon);
  }

  // ─── BUTTON BAR (y=GAME_HEIGHT-HUD_BUTTONS..GAME_HEIGHT)
  // = y=636..720
  private createButtonBar(): void {
    const btnAreaY = GAME_HEIGHT - HUD_BUTTONS;  // 636
    const btnH = HUD_BUTTONS;                     // 84
    const btnW = GAME_WIDTH / 3;                  // 135

    // Background
    const btnBg = this.scene.add.rectangle(GAME_WIDTH / 2, btnAreaY + btnH / 2, GAME_WIDTH, btnH, 0x000000, 0.55);
    this.container.add(btnBg);

    const topLine = this.scene.add.rectangle(GAME_WIDTH / 2, btnAreaY, GAME_WIDTH, 1, COLORS.CRT_GREEN, 0.3);
    this.container.add(topLine);

    // Dividers
    const div1 = this.scene.add.rectangle(btnW, btnAreaY + btnH / 2, 1, btnH, COLORS.CRT_GREEN, 0.2);
    const div2 = this.scene.add.rectangle(btnW * 2, btnAreaY + btnH / 2, 1, btnH, COLORS.CRT_GREEN, 0.2);
    this.container.add([div1, div2]);

    // SLIDE button (left third: x=0..135)
    this.slideBtn = this.createControlButton(
      btnW / 2, btnAreaY + btnH / 2,
      '▼\nSLIDE',
      COLORS.AMBER,
      0
    );
    this.container.add(this.slideBtn);

    // JUMP button (center: x=135..270)
    this.jumpBtn = this.createControlButton(
      btnW + btnW / 2, btnAreaY + btnH / 2,
      '▲\nJUMP',
      COLORS.CRT_GREEN,
      1
    );
    this.container.add(this.jumpBtn);

    // ATTACK button (right: x=270..405)
    this.attackBtn = this.createControlButton(
      btnW * 2 + btnW / 2, btnAreaY + btnH / 2,
      '⚔\nATTACK',
      COLORS.DANGER_RED,
      2
    );
    this.container.add(this.attackBtn);

    // Wire up touch events
    this.setupButtonInputs(btnAreaY, btnW, btnH);
  }

  private createControlButton(
    cx: number, cy: number,
    label: string,
    color: number,
    _index: number
  ): Phaser.GameObjects.Container {
    const c = this.scene.add.container(cx, cy);

    const bg = this.scene.add.rectangle(0, 0, 128, 76, 0x000000, 0.4);
    bg.setStrokeStyle(1, color, 0.5);
    c.add(bg);

    const colorHex = '#' + color.toString(16).padStart(6, '0');
    const txt = this.scene.add.text(0, 0, label, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: colorHex,
      align: 'center',
      lineSpacing: 6,
    });
    txt.setOrigin(0.5, 0.5);
    c.add(txt);

    return c;
  }

  private setupButtonInputs(btnAreaY: number, btnW: number, btnH: number): void {
    // Use scene-level pointer events, filter by Y (button area only)
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const py = pointer.y;
      const px = pointer.x;

      // Only handle button area
      if (py < btnAreaY) return;

      if (px < btnW) {
        // SLIDE
        this._slideHeld = true;
        this.flashButton(this.slideBtn);
      } else if (px < btnW * 2) {
        // JUMP
        this._jumpPressed = true;
        this.flashButton(this.jumpBtn);
      } else {
        // ATTACK
        this._attackPressed = true;
        this.flashButton(this.attackBtn);
      }
    });

    // Track which pointer ID started the slide hold
    let slidePointerId = -1;

    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const py = pointer.y;
      const px = pointer.x;

      // Button area: update slide pointer tracking
      if (py >= btnAreaY && px < btnW) {
        slidePointerId = pointer.id;
      }

      // Game area tap (above HUD_TOP) → jump
      if (py < btnAreaY && py > 44) {
        this._jumpPressed = true;
      }
    });

    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      // Release slide when the slide pointer is lifted
      if (pointer.id === slidePointerId) {
        this._slideHeld = false;
        slidePointerId = -1;
      }
    });
  }

  private flashButton(btn: Phaser.GameObjects.Container): void {
    this.scene.tweens.add({
      targets: btn,
      scaleX: 0.92,
      scaleY: 0.92,
      duration: 60,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }

  update(hp: number, maxHp: number, score: number, combo: number, distance: number, fuel: number): void {
    // HP
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

    // Score
    const scoreStr = score.toString().padStart(RETRO_UI.SCORE_DIGITS, '0');
    this.scoreText.setText(scoreStr);

    // Combo
    if (combo >= 3) {
      this.comboText.setText(`x${combo}COMBO`);
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

    // Distance
    this.distanceText.setText(`${distance}m`);

    // Fuel bar
    const fuelWidth = Math.max(0, (fuel / 100) * 98);
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

  // Coin-to-score particle trail
  showCoinTrail(startX: number, startY: number): void {
    const endX = GAME_WIDTH / 2;
    const endY = 22;

    const ctrlX = (startX + endX) / 2 + (Math.random() - 0.5) * 60;
    const ctrlY = Math.min(startY, endY) - 50 - Math.random() * 40;

    const flyingCoin = this.scene.add.image(startX, startY, 'coin');
    flyingCoin.setScale(1.5);
    flyingCoin.setDepth(110);

    this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 450,
      ease: 'Quad.In',
      onUpdate: (tween) => {
        const t = tween.getValue() ?? 0;
        const inv = 1 - t;
        const x = inv * inv * startX + 2 * inv * t * ctrlX + t * t * endX;
        const y = inv * inv * startY + 2 * inv * t * ctrlY + t * t * endY;

        flyingCoin.setPosition(x, y);
        flyingCoin.setScale(1.5 * (1 - t * 0.5));
        flyingCoin.setAngle(flyingCoin.angle + 18);

        if (Math.random() < 0.6) {
          const sparkle = this.scene.add.rectangle(
            x + (Math.random() - 0.5) * 8,
            y + (Math.random() - 0.5) * 8,
            3, 3, 0xffd700, 0.8
          );
          sparkle.setDepth(109);
          this.scene.tweens.add({
            targets: sparkle,
            alpha: 0,
            scaleX: 0.2,
            scaleY: 0.2,
            duration: 250,
            onComplete: () => sparkle.destroy(),
          });
        }
      },
      onComplete: () => {
        flyingCoin.destroy();
        this.scoreImpact(endX, endY);
      },
    });
  }

  private scoreImpact(x: number, y: number): void {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const spark = this.scene.add.rectangle(x, y, 3, 3, 0xffd700, 1);
      spark.setDepth(110);
      this.scene.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * 28,
        y: y + Math.sin(angle) * 28,
        alpha: 0,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: 300,
        ease: 'Quad.easeOut',
        onComplete: () => spark.destroy(),
      });
    }

    const flash = this.scene.add.rectangle(x, y, 80, 22, 0xffd700, 0.35);
    flash.setDepth(99);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 1.6,
      scaleY: 1.6,
      duration: 250,
      onComplete: () => flash.destroy(),
    });

    this.scene.tweens.add({
      targets: this.scoreText,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 80,
      yoyo: true,
      ease: 'Quad.easeOut',
    });

    this.scoreText.setColor('#ffd700');
    this.scene.time.delayedCall(150, () => {
      this.scoreText.setColor('#00ff41');
    });
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
    const alertY = GAME_HEIGHT * 0.4;

    const alert = this.scene.add.text(GAME_WIDTH / 2, alertY, `${combo} COMBO!`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: alertColor,
      stroke: '#000000',
      strokeThickness: 4,
    });
    alert.setOrigin(0.5);
    alert.setDepth(99);

    const glow = this.scene.add.text(GAME_WIDTH / 2, alertY, `${combo} COMBO!`, {
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
  }
}

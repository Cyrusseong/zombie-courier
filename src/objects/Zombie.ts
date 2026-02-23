import Phaser from 'phaser';
import { ZOMBIE_TYPES, GAME_WIDTH } from '../config';

export type ZombieType = 'NORMAL' | 'RUNNER' | 'FAT' | 'CRAWLER';

export class Zombie extends Phaser.GameObjects.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  zombieType: ZombieType;
  hp: number;
  scoreValue: number;
  moveSpeed: number;

  constructor(scene: Phaser.Scene, x: number, y: number, type: ZombieType) {
    const config = ZOMBIE_TYPES[type];
    const textureKey = type === 'NORMAL' ? 'zombie_normal'
      : type === 'RUNNER' ? 'zombie_runner'
      : type === 'FAT' ? 'zombie_fat'
      : 'zombie_crawler';

    super(scene, x, y, textureKey);

    this.zombieType = type;
    this.hp = config.hp;
    this.scoreValue = config.score;
    this.moveSpeed = config.speed;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    if (type === 'FAT') {
      this.body.setSize(32, 40);
      this.body.setOffset(4, 4);
      this.setOrigin(0.5, 1);
      this.setScale(1.5);
    } else if (type === 'CRAWLER') {
      // Mid-height — player must slide under (standing body hits, slide body clears)
      this.body.setAllowGravity(false);
      this.body.setSize(36, 16);
      this.body.setOffset(2, 0);
      this.setOrigin(0.5, 1);
      this.setScale(1.0);
    } else {
      this.body.setSize(24, 36);
      this.body.setOffset(4, 6);
      this.setOrigin(0.5, 1);
      this.setScale(type === 'RUNNER' ? 1.2 : 1.3);
    }

    // Wobble animation — crawlers pulse instead of rotate
    if (type === 'CRAWLER') {
      scene.tweens.add({
        targets: this,
        scaleX: { from: 0.95, to: 1.05 },
        scaleY: { from: 0.92, to: 1.08 },
        duration: 220 + Math.random() * 160,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    } else {
      scene.tweens.add({
        targets: this,
        angle: { from: -3, to: 3 },
        duration: 200 + Math.random() * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount;

    // Hit flash
    this.setTint(0xffffff);
    this.scene.time.delayedCall(60, () => {
      if (this.active) this.clearTint();
    });

    if (this.hp <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  die(): void {
    const scene = this.scene;
    const x = this.x;
    const midY = this.y - 20;

    // Base blood splatter (always present)
    const blood = scene.add.particles(x, midY, 'blood', {
      speed: { min: 40, max: 120 },
      angle: { min: 0, max: 360 },
      lifespan: 400,
      quantity: 8,
      scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 },
      gravityY: 200,
    });
    scene.time.delayedCall(80, () => blood.stop());
    scene.time.delayedCall(500, () => blood.destroy());

    // Random death effect variation (1 of 3)
    const effect = Math.floor(Math.random() * 3);
    if (effect === 0) {
      this.fxPixelScatter(scene, x, midY);
    } else if (effect === 1) {
      this.fxSlimeSplash(scene, x, midY);
    } else {
      this.fxNeonZap(scene, x, midY);
    }

    // Screen hitstop
    scene.time.timeScale = 0.1;
    scene.time.delayedCall(30, () => {
      scene.time.timeScale = 1;
    });

    this.destroy();
  }

  /** Pixel Scatter — body breaks into colored pixel chunks */
  private fxPixelScatter(scene: Phaser.Scene, x: number, y: number): void {
    const colors = [0x44bb44, 0x227722, 0x338833, 0x882222, 0xdda577];
    for (let i = 0; i < 14; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 2 + Math.floor(Math.random() * 4);
      const chunk = scene.add.rectangle(
        x + (Math.random() - 0.5) * 20,
        y + (Math.random() - 0.5) * 30,
        size, size, color
      );
      chunk.setDepth(95);

      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 60;

      scene.tweens.add({
        targets: chunk,
        x: chunk.x + Math.cos(angle) * dist,
        y: chunk.y + Math.sin(angle) * dist * 0.6 + 40,
        alpha: 0,
        angle: Math.random() * 360,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: 350 + Math.random() * 250,
        ease: 'Quad.easeOut',
        onComplete: () => chunk.destroy(),
      });
    }
  }

  /** Slime Splash — green goo droplets arc upward then fall with gravity */
  private fxSlimeSplash(scene: Phaser.Scene, x: number, y: number): void {
    for (let i = 0; i < 10; i++) {
      const size = 3 + Math.floor(Math.random() * 4);
      const drop = scene.add.rectangle(
        x + (Math.random() - 0.5) * 14,
        y,
        size, size,
        Math.random() > 0.4 ? 0x44bb44 : 0x227722,
        0.9
      );
      drop.setDepth(95);

      const vx = (Math.random() - 0.3) * 100;
      const peakY = y - 40 - Math.random() * 60;

      // Rise phase
      scene.tweens.add({
        targets: drop,
        x: drop.x + vx * 0.4,
        y: peakY,
        duration: 180 + Math.random() * 80,
        ease: 'Quad.easeOut',
        onComplete: () => {
          // Fall phase — flatten on "landing"
          scene.tweens.add({
            targets: drop,
            y: y + 20,
            x: drop.x + vx * 0.3,
            scaleX: 1.4,
            scaleY: 0.3,
            alpha: 0.4,
            duration: 300,
            ease: 'Quad.easeIn',
            onComplete: () => {
              scene.time.delayedCall(150, () => drop.destroy());
            },
          });
        },
      });
    }
  }

  /** Neon Zap — CRT-style electric flash with spark lines */
  private fxNeonZap(scene: Phaser.Scene, x: number, y: number): void {
    // Green flash
    const flash = scene.add.rectangle(x, y, 36, 50, 0x00ff41, 0.5);
    flash.setDepth(95);
    scene.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 2.5,
      scaleY: 2.5,
      duration: 150,
      onComplete: () => flash.destroy(),
    });

    // Electric spark lines radiating outward
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const len = 10 + Math.random() * 20;
      const spark = scene.add.rectangle(
        x + Math.cos(angle) * 4, y + Math.sin(angle) * 4,
        len, 2,
        Math.random() > 0.3 ? 0x00ff41 : 0xffff00
      );
      spark.setAngle(Phaser.Math.RadToDeg(angle));
      spark.setDepth(96);

      scene.tweens.add({
        targets: spark,
        x: spark.x + Math.cos(angle) * 35,
        y: spark.y + Math.sin(angle) * 35,
        alpha: 0,
        scaleX: 0.3,
        duration: 180 + Math.random() * 120,
        ease: 'Quad.easeOut',
        onComplete: () => spark.destroy(),
      });
    }

    // Lingering pixel residue
    for (let i = 0; i < 5; i++) {
      const px = scene.add.rectangle(
        x + (Math.random() - 0.5) * 28,
        y + (Math.random() - 0.5) * 36,
        2, 2, 0x00ff41, 0.7
      );
      px.setDepth(94);
      scene.tweens.add({
        targets: px,
        alpha: 0,
        duration: 400 + Math.random() * 300,
        delay: 80 + Math.random() * 150,
        onComplete: () => px.destroy(),
      });
    }
  }

  update(gameSpeed: number): void {
    if (!this.active) return;

    // Move left (toward player)
    this.body.setVelocityX(-(this.moveSpeed + gameSpeed * 0.3));

    // Destroy if off screen
    if (this.x < -50) {
      this.destroy();
    }
  }
}

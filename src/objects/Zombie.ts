import Phaser from 'phaser';
import { ZOMBIE_TYPES, GAME_WIDTH } from '../config';

export type ZombieType = 'NORMAL' | 'RUNNER';

export class Zombie extends Phaser.GameObjects.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  zombieType: ZombieType;
  hp: number;
  scoreValue: number;
  moveSpeed: number;

  constructor(scene: Phaser.Scene, x: number, y: number, type: ZombieType) {
    const config = ZOMBIE_TYPES[type];
    const textureKey = type === 'NORMAL' ? 'zombie_normal' : 'zombie_runner';

    super(scene, x, y, textureKey);

    this.zombieType = type;
    this.hp = config.hp;
    this.scoreValue = config.score;
    this.moveSpeed = config.speed;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(24, 36);
    this.body.setOffset(4, 6);
    this.setOrigin(0.5, 1);
    this.setScale(1.3);

    if (type === 'RUNNER') {
      this.setScale(1.2);
    }

    // Wobble animation
    scene.tweens.add({
      targets: this,
      angle: { from: -3, to: 3 },
      duration: 200 + Math.random() * 200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
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
    // Capture scene reference BEFORE destroy() nullifies this.scene
    const scene = this.scene;

    // Blood particles
    const particles = scene.add.particles(this.x, this.y - 20, 'blood', {
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      lifespan: 500,
      quantity: 12,
      scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 },
      gravityY: 200,
    });
    scene.time.delayedCall(500, () => particles.destroy());

    // Screen hitstop (brief pause)
    scene.time.timeScale = 0.1;
    scene.time.delayedCall(30, () => {
      scene.time.timeScale = 1;
    });

    this.destroy();
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

import Phaser from 'phaser';
import { PLAYER, GAME_HEIGHT } from '../config';

export class Player extends Phaser.GameObjects.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  hp: number;
  maxHp: number;
  isSliding: boolean = false;
  isAttacking: boolean = false;
  isInvincible: boolean = false;
  private attackCooldown: number = 0;
  private slideTimer: Phaser.Time.TimerEvent | null = null;
  private invincibleTimer: Phaser.Time.TimerEvent | null = null;
  private swingSprite: Phaser.GameObjects.Sprite | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');

    this.maxHp = PLAYER.MAX_HP;
    this.hp = this.maxHp;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setCollideWorldBounds(true);
    this.body.setSize(48, 48);
    this.body.setOffset(8, 4);
    this.setOrigin(0.5, 1);
    this.setScale(1.5);
  }

  get isOnGround(): boolean {
    return this.body.blocked.down || this.body.touching.down;
  }

  jump(): void {
    if (this.isOnGround && !this.isSliding) {
      this.body.setVelocityY(PLAYER.JUMP_VELOCITY);
      // Squash and stretch
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.3,
        scaleY: 1.7,
        duration: 100,
        yoyo: true,
        ease: 'Quad.easeOut',
      });
      this.emitDust();
    }
  }

  slide(): void {
    if (this.isOnGround && !this.isSliding) {
      this.isSliding = true;
      this.setTexture('player_slide');
      this.body.setSize(48, 24);
      // player_slide texture is 40×24 so displayOriginY=24 (not 40).
      // offset.y=12: body.bottom = 564 + 1.5*(12-24) + 36 = 582 = zone.top ✓
      this.body.setOffset(8, 12);

      this.slideTimer?.destroy();
      this.slideTimer = this.scene.time.delayedCall(PLAYER.SLIDE_DURATION, () => {
        this.endSlide();
      });
    }
  }

  endSlide(): void {
    if (!this.isSliding) return;
    this.isSliding = false;
    this.setTexture('player');
    this.body.setSize(48, 48);
    this.body.setOffset(8, 4);
  }

  attack(): void {
    if (this.isAttacking || this.isSliding) return;

    const now = this.scene.time.now;
    if (now < this.attackCooldown) return;
    this.attackCooldown = now + PLAYER.ATTACK_COOLDOWN;

    this.isAttacking = true;

    // Show swing effect
    this.swingSprite = this.scene.add.sprite(this.x + 40, this.y - 20, 'attack_swing');
    this.swingSprite.setAlpha(0.8);
    this.scene.tweens.add({
      targets: this.swingSprite,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 200,
      onComplete: () => {
        this.swingSprite?.destroy();
        this.swingSprite = null;
      },
    });

    this.scene.time.delayedCall(200, () => {
      this.isAttacking = false;
    });
  }

  takeDamage(): boolean {
    if (this.isInvincible) return false;

    this.hp--;
    this.isInvincible = true;

    // Flash effect
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 80,
      yoyo: true,
      repeat: 5,
      onComplete: () => this.setAlpha(1),
    });

    // Screen shake
    this.scene.cameras.main.shake(200, 0.01);

    // Red flash
    this.scene.cameras.main.flash(100, 255, 0, 0, false);

    this.invincibleTimer?.destroy();
    this.invincibleTimer = this.scene.time.delayedCall(PLAYER.INVINCIBLE_DURATION, () => {
      this.isInvincible = false;
    });

    return this.hp <= 0;
  }

  heal(amount: number): void {
    this.hp = Math.min(this.hp + amount, this.maxHp);
  }

  getAttackBounds(): Phaser.Geom.Rectangle | null {
    if (!this.isAttacking) return null;
    return new Phaser.Geom.Rectangle(
      this.x + 20,
      this.y - 50,
      PLAYER.ATTACK_RANGE,
      50
    );
  }

  private emitDust(): void {
    const particles = this.scene.add.particles(this.x, this.y, 'dust', {
      speed: { min: 20, max: 60 },
      angle: { min: 200, max: 340 },
      lifespan: 400,
      quantity: 5,
      scale: { start: 1, end: 0 },
      alpha: { start: 0.8, end: 0 },
      gravityY: 100,
    });

    this.scene.time.delayedCall(100, () => particles.destroy());
  }

  update(): void {
    // Continuous dust while riding on ground
    if (this.isOnGround && Math.random() < 0.15) {
      const dust = this.scene.add.particles(this.x - 20, this.y, 'dust', {
        speed: { min: 10, max: 30 },
        angle: { min: 160, max: 200 },
        lifespan: 300,
        quantity: 1,
        scale: { start: 0.8, end: 0 },
        alpha: { start: 0.4, end: 0 },
      });
      this.scene.time.delayedCall(50, () => dust.destroy());
    }
  }
}

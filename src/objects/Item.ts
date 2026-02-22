import Phaser from 'phaser';

export type ItemType = 'coin' | 'fuel' | 'health';

export class Item extends Phaser.GameObjects.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  itemType: ItemType;

  constructor(scene: Phaser.Scene, x: number, y: number, type: ItemType) {
    super(scene, x, y, type);

    this.itemType = type;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.setOrigin(0.5, 1);
    this.setScale(1.5);

    // Coin float and spin
    if (type === 'coin') {
      scene.tweens.add({
        targets: this,
        y: y - 8,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      scene.tweens.add({
        targets: this,
        scaleX: 0.3,
        duration: 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // Fuel / health gentle bob
    if (type === 'fuel' || type === 'health') {
      scene.tweens.add({
        targets: this,
        y: y - 5,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  collect(): void {
    // Disable body immediately to prevent double-collection
    this.body.enable = false;

    // Pop animation
    this.scene.tweens.add({
      targets: this,
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 0,
      y: this.y - 30,
      duration: 200,
      ease: 'Quad.easeOut',
      onComplete: () => this.destroy(),
    });
  }

  update(gameSpeed: number): void {
    if (!this.active) return;
    this.body.setVelocityX(-gameSpeed);

    if (this.x < -30) {
      this.destroy();
    }
  }
}

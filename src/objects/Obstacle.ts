import Phaser from 'phaser';

export type ObstacleType = 'barricade' | 'road';

export class Obstacle extends Phaser.GameObjects.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  obstacleType: ObstacleType;

  constructor(scene: Phaser.Scene, x: number, y: number, type: ObstacleType) {
    const textureKey = type === 'barricade' ? 'obstacle_barricade' : 'obstacle_road';
    super(scene, x, y, textureKey);

    this.obstacleType = type;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setImmovable(true);
    this.body.setAllowGravity(false);
    this.setOrigin(0.5, 1);
    this.setScale(1.5);

    if (type === 'barricade') {
      this.body.setSize(36, 28);
      this.body.setOffset(2, 2);
    } else {
      this.body.setSize(36, 16);
      this.body.setOffset(2, 4);
    }
  }

  update(gameSpeed: number): void {
    if (!this.active) return;
    this.body.setVelocityX(-gameSpeed);

    if (this.x < -60) {
      this.destroy();
    }
  }
}

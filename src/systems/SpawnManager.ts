import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SPAWN, PLAYER } from '../config';
import { Zombie, ZombieType } from '../objects/Zombie';
import { Obstacle, ObstacleType } from '../objects/Obstacle';
import { Item, ItemType } from '../objects/Item';

export class SpawnManager {
  private scene: Phaser.Scene;
  private groundY: number;
  private currentMultiplier: number = 1;
  private currentItemMultiplier: number = 1;

  private zombieTimer: Phaser.Time.TimerEvent | null = null;
  private obstacleTimer: Phaser.Time.TimerEvent | null = null;
  private coinTimer: Phaser.Time.TimerEvent | null = null;
  private fuelTimer: Phaser.Time.TimerEvent | null = null;
  private healthTimer: Phaser.Time.TimerEvent | null = null;

  zombies: Phaser.GameObjects.Group;
  obstacles: Phaser.GameObjects.Group;
  items: Phaser.GameObjects.Group;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.groundY = PLAYER.GROUND_Y;

    this.zombies = scene.add.group({ runChildUpdate: false });
    this.obstacles = scene.add.group({ runChildUpdate: false });
    this.items = scene.add.group({ runChildUpdate: false });
  }

  start(difficultyMultiplier: number = 1, itemMultiplier: number = 1): void {
    this.currentMultiplier = difficultyMultiplier;
    this.currentItemMultiplier = itemMultiplier;
    this.scheduleZombie();
    this.scheduleObstacle();
    this.scheduleCoin();
    this.scheduleFuel();
    this.scheduleHealth();
  }

  stop(): void {
    this.zombieTimer?.destroy();
    this.obstacleTimer?.destroy();
    this.coinTimer?.destroy();
    this.fuelTimer?.destroy();
    this.healthTimer?.destroy();
  }

  updateDifficulty(multiplier: number, itemMultiplier: number = this.currentItemMultiplier): void {
    this.currentMultiplier = multiplier;
    this.currentItemMultiplier = itemMultiplier;
  }

  private scheduleZombie(): void {
    const interval = Math.max(SPAWN.MIN_INTERVAL, SPAWN.ZOMBIE_INTERVAL_BASE / this.currentMultiplier);
    const variance = interval * 0.4;

    this.zombieTimer = this.scene.time.delayedCall(
      interval + (Math.random() - 0.5) * variance,
      () => {
        this.spawnZombie(this.currentMultiplier);
        this.scheduleZombie();
      }
    );
  }

  private spawnZombie(multiplier: number): void {
    const x = GAME_WIDTH + 40 + Math.random() * 100;

    // Zombie type selection by difficulty tier
    let type: ZombieType = 'NORMAL';
    if (multiplier > 1.3) {
      const roll = Math.random();
      if (roll < 0.20) type = 'RUNNER';
      else if (roll < 0.30 && multiplier > 1.8) type = 'FAT';
      else if (roll < 0.45 && multiplier > 1.5) type = 'CRAWLER';
    }

    // Crawlers spawn at mid-height so players can slide under them
    const y = type === 'CRAWLER' ? this.groundY - 30 : this.groundY;

    const zombie = new Zombie(this.scene, x, y, type);
    this.zombies.add(zombie);
  }

  private scheduleObstacle(): void {
    const interval = Math.max(SPAWN.MIN_INTERVAL, SPAWN.OBSTACLE_INTERVAL_BASE / this.currentMultiplier);
    const variance = interval * 0.3;

    this.obstacleTimer = this.scene.time.delayedCall(
      interval + (Math.random() - 0.5) * variance,
      () => {
        this.spawnObstacle();
        this.scheduleObstacle();
      }
    );
  }

  private spawnObstacle(): void {
    const x = GAME_WIDTH + 40;
    const y = this.groundY;
    const type: ObstacleType = Math.random() < 0.5 ? 'barricade' : 'road';

    const obstacle = new Obstacle(this.scene, x, y, type);
    this.obstacles.add(obstacle);
  }

  private scheduleCoin(): void {
    this.coinTimer = this.scene.time.delayedCall(
      SPAWN.COIN_INTERVAL + Math.random() * 400,
      () => {
        this.spawnCoinGroup();
        this.scheduleCoin();
      }
    );
  }

  private spawnCoinGroup(): void {
    const count = 3 + Math.floor(Math.random() * 4);
    const baseX = GAME_WIDTH + 40;
    const patterns = ['line', 'arc', 'high'];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];

    for (let i = 0; i < count; i++) {
      let x = baseX + i * 30;
      let y = this.groundY - 30;

      if (pattern === 'arc') {
        const arcHeight = Math.sin((i / (count - 1)) * Math.PI) * 60;
        y = this.groundY - 30 - arcHeight;
      } else if (pattern === 'high') {
        y = this.groundY - 80 - Math.random() * 20;
      }

      const coin = new Item(this.scene, x, y, 'coin');
      this.items.add(coin);
    }
  }

  private scheduleFuel(): void {
    const interval = (SPAWN.FUEL_INTERVAL + Math.random() * 3000) / this.currentItemMultiplier;
    this.fuelTimer = this.scene.time.delayedCall(interval, () => {
      this.spawnItem('fuel');
      this.scheduleFuel();
    });
  }

  private scheduleHealth(): void {
    const interval = (SPAWN.HEALTH_INTERVAL + Math.random() * 5000) / this.currentItemMultiplier;
    this.healthTimer = this.scene.time.delayedCall(interval, () => {
      this.spawnItem('health');
      this.scheduleHealth();
    });
  }

  private spawnItem(type: ItemType): void {
    const x = GAME_WIDTH + 40;
    const y = this.groundY - 20 - Math.random() * 40;
    const item = new Item(this.scene, x, y, type);
    this.items.add(item);
  }

  updateAll(gameSpeed: number): void {
    this.zombies.getChildren().forEach((z) => {
      (z as Zombie).update(gameSpeed);
    });
    this.obstacles.getChildren().forEach((o) => {
      (o as Obstacle).update(gameSpeed);
    });
    this.items.getChildren().forEach((i) => {
      (i as Item).update(gameSpeed);
    });
  }
}

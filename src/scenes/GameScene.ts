import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER, DIFFICULTY, COLORS, CRT } from '../config';
import { Player } from '../objects/Player';
import { Zombie } from '../objects/Zombie';
import { Obstacle } from '../objects/Obstacle';
import { Item } from '../objects/Item';
import { SpawnManager } from '../systems/SpawnManager';
import { ScoreManager } from '../systems/ScoreManager';
import { InputManager } from '../systems/InputManager';
import { HUD } from '../ui/HUD';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private spawnManager!: SpawnManager;
  private scoreManager!: ScoreManager;
  private inputManager!: InputManager;
  private hud!: HUD;

  private gameSpeed: number = PLAYER.BASE_SPEED;
  private fuel: number = 100;
  private isGameOver: boolean = false;
  private difficultyMultiplier: number = 1;

  // Background layers
  private bgSky!: Phaser.GameObjects.TileSprite;
  private bgFar!: Phaser.GameObjects.TileSprite;
  private bgMid!: Phaser.GameObjects.TileSprite;
  private bgNear!: Phaser.GameObjects.TileSprite;
  private bgGround!: Phaser.GameObjects.TileSprite;
  private ground!: Phaser.Physics.Arcade.StaticBody;

  // CRT Effects
  private vignette!: Phaser.GameObjects.Rectangle;
  private scanlineOverlay!: Phaser.GameObjects.Image;
  private noiseOverlay!: Phaser.GameObjects.Image;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.isGameOver = false;
    this.gameSpeed = PLAYER.BASE_SPEED;
    this.fuel = 100;
    this.difficultyMultiplier = 1;

    this.cameras.main.fadeIn(300);

    this.createBackground();
    this.createGround();
    this.createPlayer();
    this.createSystems();
    this.createCollisions();
    this.createCRTEffects();

    this.spawnManager.start(this.difficultyMultiplier);
  }

  private createBackground(): void {
    this.bgSky = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg_sky');
    this.bgSky.setOrigin(0, 0);
    this.bgSky.setScrollFactor(0);

    this.bgFar = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg_far');
    this.bgFar.setOrigin(0, 0);
    this.bgFar.setScrollFactor(0);

    this.bgMid = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg_mid');
    this.bgMid.setOrigin(0, 0);
    this.bgMid.setScrollFactor(0);

    this.bgNear = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg_near');
    this.bgNear.setOrigin(0, 0);
    this.bgNear.setScrollFactor(0);

    this.bgGround = this.add.tileSprite(0, PLAYER.GROUND_Y, GAME_WIDTH, 120, 'bg_ground');
    this.bgGround.setOrigin(0, 0);
    this.bgGround.setScrollFactor(0);
  }

  private createGround(): void {
    // Invisible ground platform
    const groundZone = this.add.zone(GAME_WIDTH / 2, PLAYER.GROUND_Y, GAME_WIDTH * 2, 20);
    this.physics.add.existing(groundZone, true);
    this.ground = groundZone.body as Phaser.Physics.Arcade.StaticBody;
  }

  private createPlayer(): void {
    this.player = new Player(this, PLAYER.START_X, PLAYER.GROUND_Y);
  }

  private createSystems(): void {
    this.scoreManager = new ScoreManager();
    this.spawnManager = new SpawnManager(this);
    this.inputManager = new InputManager(this);
    this.hud = new HUD(this);
  }

  private createCollisions(): void {
    // Player vs Ground
    this.physics.add.collider(this.player, this.ground as unknown as Phaser.Physics.Arcade.StaticBody);

    // Player vs Obstacles
    this.physics.add.overlap(
      this.player,
      this.spawnManager.obstacles,
      (_player, obstacle) => this.handleObstacleHit(obstacle as Obstacle),
      undefined,
      this
    );

    // Player vs Zombies
    this.physics.add.overlap(
      this.player,
      this.spawnManager.zombies,
      (_player, zombie) => this.handleZombieContact(zombie as Zombie),
      undefined,
      this
    );

    // Player vs Items
    this.physics.add.overlap(
      this.player,
      this.spawnManager.items,
      (_player, item) => this.handleItemCollect(item as Item),
      undefined,
      this
    );

    // Zombies on ground
    this.physics.add.collider(this.spawnManager.zombies, this.ground as unknown as Phaser.Physics.Arcade.StaticBody);
  }

  private createCRTEffects(): void {
    // Damage vignette (red overlay for low HP)
    this.vignette = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xff0000, 0);
    this.vignette.setDepth(90);

    // Scanline overlay
    this.scanlineOverlay = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'scanlines');
    this.scanlineOverlay.setAlpha(0.06);
    this.scanlineOverlay.setDepth(91);

    // Noise overlay (subtle static)
    this.noiseOverlay = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'noise');
    this.noiseOverlay.setAlpha(CRT.NOISE_ALPHA);
    this.noiseOverlay.setDepth(92);
    this.noiseOverlay.setBlendMode(Phaser.BlendModes.ADD);
  }

  update(_time: number, delta: number): void {
    if (this.isGameOver) return;

    const dt = delta / 1000;

    // Input
    const input = this.inputManager.getState();
    if (input.jump) this.player.jump();
    if (input.slide) this.player.slide();
    else if (this.player.isSliding) this.player.endSlide();
    if (input.attack) this.player.attack();

    // Player update
    this.player.update();

    // Attack collision check
    this.checkAttackHits();

    // Scroll backgrounds (parallax)
    const scrollSpeed = this.gameSpeed * dt;
    this.bgSky.tilePositionX += scrollSpeed * 0.05;
    this.bgFar.tilePositionX += scrollSpeed * 0.15;
    this.bgMid.tilePositionX += scrollSpeed * 0.3;
    this.bgNear.tilePositionX += scrollSpeed * 0.6;
    this.bgGround.tilePositionX += scrollSpeed;

    // Update spawned objects
    this.spawnManager.updateAll(this.gameSpeed);

    // Score & distance
    this.scoreManager.addDistance(scrollSpeed * 0.1);
    this.scoreManager.update();

    // Fuel consumption
    this.fuel -= dt * 3;
    if (this.fuel <= 0) {
      this.fuel = 0;
      this.gameOver();
      return;
    }

    // Difficulty scaling
    this.updateDifficulty();

    // Update HUD
    this.hud.update(
      this.player.hp,
      this.player.maxHp,
      this.scoreManager.score,
      this.scoreManager.combo,
      this.scoreManager.distanceMeters,
      this.fuel
    );

    // CRT Effects update
    this.updateCRTEffects();
  }

  private updateCRTEffects(): void {
    // Vignette based on HP
    const hpRatio = this.player.hp / this.player.maxHp;
    if (hpRatio <= 0.34) {
      this.vignette.setAlpha(0.12 + Math.sin(Date.now() * 0.005) * 0.04);
    } else {
      this.vignette.setAlpha(0);
    }

    // Noise shimmer (subtle random offset for static feel)
    if (Math.random() < 0.1) {
      this.noiseOverlay.setPosition(
        GAME_WIDTH / 2 + (Math.random() - 0.5) * 4,
        GAME_HEIGHT / 2 + (Math.random() - 0.5) * 4
      );
    }

    // Scanline subtle movement
    this.scanlineOverlay.setAlpha(0.04 + Math.sin(Date.now() * 0.002) * 0.02);
  }

  private checkAttackHits(): void {
    const attackBounds = this.player.getAttackBounds();
    if (!attackBounds) return;

    this.spawnManager.zombies.getChildren().forEach((z) => {
      const zombie = z as Zombie;
      if (!zombie.active) return;

      const zombieBounds = zombie.getBounds();
      if (Phaser.Geom.Rectangle.Overlaps(attackBounds, zombieBounds)) {
        const killed = zombie.takeDamage(PLAYER.ATTACK_DAMAGE);
        if (killed) {
          const points = this.scoreManager.addZombieKill(zombie.scoreValue);
          this.hud.showScorePopup(zombie.x, zombie.y - 30, `+${points}`);

          if (this.scoreManager.combo >= 5) {
            this.hud.showComboAlert(this.scoreManager.combo);
          }

          // Camera shake on kill
          this.cameras.main.shake(80, 0.005);
        }
      }
    });
  }

  private handleObstacleHit(obstacle: Obstacle): void {
    if (this.player.isInvincible) return;

    const dead = this.player.takeDamage();
    obstacle.destroy();

    // CRT glitch effect on hit
    this.cameras.main.flash(60, 255, 0, 0, false);

    if (dead) {
      this.gameOver();
    }
  }

  private handleZombieContact(zombie: Zombie): void {
    if (this.player.isInvincible) return;
    if (this.player.isAttacking) return;

    const dead = this.player.takeDamage();

    // Push zombie back
    if (zombie.body) {
      zombie.body.setVelocityX(200);
    }

    // CRT glitch
    this.cameras.main.flash(40, 255, 0, 0, false);

    if (dead) {
      this.gameOver();
    }
  }

  private handleItemCollect(item: Item): void {
    switch (item.itemType) {
      case 'coin':
        this.scoreManager.addCoin(10);
        this.hud.showScorePopup(item.x, item.y - 10, '+10', '#ffd700');
        break;
      case 'fuel':
        this.fuel = Math.min(100, this.fuel + 30);
        this.hud.showScorePopup(item.x, item.y - 10, '+FUEL', '#00ff41');
        break;
      case 'health':
        this.player.heal(1);
        this.hud.showScorePopup(item.x, item.y - 10, '+HP', '#ff2222');
        break;
    }
    item.collect();
  }

  private updateDifficulty(): void {
    const dist = this.scoreManager.distanceMeters;

    // Speed increases with distance
    this.gameSpeed = Math.min(
      DIFFICULTY.SPEED_MAX,
      PLAYER.BASE_SPEED + dist * 0.1
    );

    // Difficulty multiplier for spawning
    if (dist > 3000) {
      this.difficultyMultiplier = 2.5;
    } else if (dist > 1500) {
      this.difficultyMultiplier = 2;
    } else if (dist > 500) {
      this.difficultyMultiplier = 1.5;
    } else {
      this.difficultyMultiplier = 1;
    }
  }

  private gameOver(): void {
    if (this.isGameOver) return;
    this.isGameOver = true;

    // Stop spawning
    this.spawnManager.stop();
    this.inputManager.destroy();

    // Slow motion death
    this.time.timeScale = 0.3;

    // Death effects - more dramatic retro style
    this.cameras.main.shake(500, 0.02);
    this.cameras.main.flash(200, 255, 50, 50);

    // Retro "DEAD" text instead of emoji
    const deadText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'WASTED', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '32px',
      color: '#ff2222',
      stroke: '#000000',
      strokeThickness: 4,
    });
    deadText.setOrigin(0.5);
    deadText.setDepth(101);
    deadText.setAlpha(0);

    // Glow behind dead text
    const deadGlow = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'WASTED', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '32px',
      color: '#ff2222',
    });
    deadGlow.setOrigin(0.5);
    deadGlow.setDepth(100);
    deadGlow.setAlpha(0);
    deadGlow.setScale(1.05);

    this.tweens.add({
      targets: [deadText, deadGlow],
      alpha: { value: 1, duration: 400 },
      scaleX: { from: 0.5, to: 1.1, duration: 300, ease: 'Back.easeOut' },
      scaleY: { from: 0.5, to: 1.1, duration: 300, ease: 'Back.easeOut' },
    });

    // Flash scanlines aggressively during death
    this.tweens.add({
      targets: this.scanlineOverlay,
      alpha: { from: 0.15, to: 0.3 },
      duration: 100,
      yoyo: true,
      repeat: 4,
    });

    this.time.delayedCall(1500, () => {
      this.time.timeScale = 1;
      this.scoreManager.saveHighScore();

      this.scene.start('GameOverScene', {
        score: this.scoreManager.score,
        distance: this.scoreManager.distanceMeters,
        zombies: this.scoreManager.zombiesKilled,
        coins: this.scoreManager.coinsCollected,
        maxCombo: this.scoreManager.maxCombo,
        isNewHighScore: this.scoreManager.isNewHighScore,
      });
    });
  }
}

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER, DIFFICULTY, COLORS, CRT, NEAR_MISS, MILESTONE, ZONE_NAMES, REVIVAL, HUD_TOP, PLAY_AREA_BOTTOM } from '../config';
import { Player } from '../objects/Player';
import { Zombie } from '../objects/Zombie';
import { Obstacle } from '../objects/Obstacle';
import { Item } from '../objects/Item';
import { SpawnManager } from '../systems/SpawnManager';
import { ScoreManager } from '../systems/ScoreManager';
import { DifficultyManager } from '../systems/DifficultyManager';
import { InputManager } from '../systems/InputManager';
import { SoundManager } from '../systems/SoundManager';
import { HUD } from '../ui/HUD';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private spawnManager!: SpawnManager;
  private scoreManager!: ScoreManager;
  private inputManager!: InputManager;
  private hud!: HUD;
  private sound_!: SoundManager;

  private difficultyManager!: DifficultyManager;

  private gameSpeed: number = PLAYER.BASE_SPEED;
  private fuel: number = 100;
  private isGameOver: boolean = false;
  private difficultyMultiplier: number = 1;
  private wasLowFuel: boolean = false;

  private nearMissedZombies = new Set<Zombie>();
  private milestoneIndex: number = 0;
  private currentZone: number = -1;

  // Background layers
  private bgSky!: Phaser.GameObjects.TileSprite;
  private bgFar!: Phaser.GameObjects.TileSprite;
  private bgMid!: Phaser.GameObjects.TileSprite;
  private bgNear!: Phaser.GameObjects.TileSprite;
  private bgGround!: Phaser.GameObjects.TileSprite;
  private groundZone!: Phaser.GameObjects.Zone;

  // CRT Effects
  private vignette!: Phaser.GameObjects.Rectangle;
  private scanlineOverlay!: Phaser.GameObjects.Image;
  private noiseOverlay!: Phaser.GameObjects.Image;
  private speedLinesGfx!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.isGameOver = false;
    this.gameSpeed = PLAYER.BASE_SPEED;
    this.fuel = 100;
    this.difficultyMultiplier = 1;
    this.wasLowFuel = false;
    this.nearMissedZombies = new Set();
    this.milestoneIndex = 0;
    this.currentZone = -1;

    this.difficultyManager = new DifficultyManager();
    this.sound_ = SoundManager.getInstance();

    this.cameras.main.fadeIn(300);

    this.createBackground();
    this.createGround();
    this.createPlayer();
    this.createSystems();
    this.createCollisions();
    this.createCRTEffects();

    this.spawnManager.start(this.difficultyMultiplier);

    // Start engine sound and BGM
    this.sound_.resume();
    this.sound_.startEngine();
    this.sound_.startBGM();
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
    // Invisible ground platform — store the Zone (game object), not the body.
    // Zone center at GROUND_Y+28 so zone.top=582 (where player body.bottom lands
    // when player.y = GROUND_Y, given scale=1.5, setSize(48,48), setOffset(8,4)).
    this.groundZone = this.add.zone(GAME_WIDTH / 2, PLAYER.GROUND_Y + 28, GAME_WIDTH * 2, 20);
    this.physics.add.existing(this.groundZone, true);
  }

  private createPlayer(): void {
    this.player = new Player(this, PLAYER.START_X, PLAYER.GROUND_Y);
  }

  private createSystems(): void {
    this.scoreManager = new ScoreManager();
    this.spawnManager = new SpawnManager(this);
    this.inputManager = new InputManager(this);
    this.hud = new HUD(this);
    this.inputManager.linkHUD(this.hud);
  }

  private createCollisions(): void {
    // Player vs Ground
    this.physics.add.collider(this.player, this.groundZone);

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
    this.physics.add.collider(this.spawnManager.zombies, this.groundZone);
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

    // Speed lines (drawn each frame in updateCRTEffects)
    this.speedLinesGfx = this.add.graphics();
    this.speedLinesGfx.setDepth(88);
  }

  update(_time: number, delta: number): void {
    if (this.isGameOver) return;

    const dt = delta / 1000;

    // Input
    const input = this.inputManager.getState();
    if (input.jump) {
      this.player.jump();
      if (this.player.isOnGround) this.sound_.play('jump');
    }
    if (input.slide) {
      if (!this.player.isSliding) this.sound_.play('slide');
      this.player.slide();
    }
    else if (this.player.isSliding) this.player.endSlide();
    if (input.attack) {
      this.player.attack();
      this.sound_.play('attack');
    }

    // Player update
    this.player.update();

    // Attack collision check
    this.checkAttackHits();

    // Near-miss detection
    this.checkNearMiss();

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

    // Low fuel warning sound
    const isLowFuel = this.fuel < 20;
    if (isLowFuel !== this.wasLowFuel) {
      this.sound_.setLowFuelWarning(isLowFuel);
      this.wasLowFuel = isLowFuel;
    }

    // Milestone check
    this.checkMilestone();

    // Zone transition check
    this.checkZoneTransition();

    // Difficulty scaling
    this.updateDifficulty();

    // Update engine sound pitch based on speed
    this.sound_.updateEngineSpeed(this.gameSpeed);

    // Update HUD
    this.hud.update(
      this.player.hp,
      this.player.maxHp,
      this.scoreManager.score,
      this.scoreManager.combo,
      this.scoreManager.distanceMeters,
      this.fuel,
      this.scoreManager.coinBalance
    );

    // CRT Effects update
    this.updateCRTEffects();
    this.updateSpeedLines();
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

  private updateSpeedLines(): void {
    this.speedLinesGfx.clear();
    const normalizedSpeed = Math.max(0,
      (this.gameSpeed - PLAYER.BASE_SPEED) / (DIFFICULTY.SPEED_MAX - PLAYER.BASE_SPEED)
    );
    if (normalizedSpeed < 0.08) return;

    const lineCount = Math.floor(3 + normalizedSpeed * 9);
    for (let i = 0; i < lineCount; i++) {
      const y = HUD_TOP + Math.random() * (PLAY_AREA_BOTTOM - HUD_TOP);
      const x = Math.random() * GAME_WIDTH;
      const len = 12 + normalizedSpeed * 70;
      const lineAlpha = normalizedSpeed * (0.12 + Math.random() * 0.12);
      this.speedLinesGfx.lineStyle(1, COLORS.NEON_BLUE, lineAlpha);
      this.speedLinesGfx.lineBetween(x, y, x - len, y);
    }
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
          this.sound_.play('zombieKill');
          const points = this.scoreManager.addZombieKill(zombie.scoreValue);
          this.hud.showScorePopup(zombie.x, zombie.y - 30, `+${points}`);

          if (this.scoreManager.combo >= 5) {
            this.hud.showComboAlert(this.scoreManager.combo);
            this.sound_.play('comboAlert');
          }

          // Camera shake on kill + hit-stop
          this.cameras.main.shake(80, 0.005);
          this.hitStop(30);
        } else {
          this.sound_.play('zombieHit');
          this.hitStop(20);
        }
      }
    });
  }

  private handleObstacleHit(obstacle: Obstacle): void {
    if (this.player.isInvincible) return;

    const dead = this.player.takeDamage();
    obstacle.destroy();
    this.sound_.play('playerHit');

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
    this.sound_.play('playerHit');

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
        this.hud.showCoinTrail(item.x, item.y);
        this.sound_.play('coinCollect');
        break;
      case 'fuel':
        this.fuel = Math.min(100, this.fuel + 30);
        this.hud.showScorePopup(item.x, item.y - 10, '+FUEL', '#00ff41');
        this.sound_.play('fuelCollect');
        // Turn off low fuel warning if above threshold
        if (this.fuel >= 20 && this.wasLowFuel) {
          this.sound_.setLowFuelWarning(false);
          this.wasLowFuel = false;
        }
        break;
      case 'health':
        this.player.heal(1);
        this.hud.showScorePopup(item.x, item.y - 10, '+HP', '#ff2222');
        this.sound_.play('healthCollect');
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

    // Base multiplier by distance
    const baseMultiplier = dist > 3000 ? 2.5 : dist > 1500 ? 2 : dist > 500 ? 1.5 : 1;

    // DDA adjustments
    const ddaMultiplier = this.difficultyManager.getSpawnMultiplier();
    const itemMultiplier = this.difficultyManager.getItemDropMultiplier();
    this.difficultyMultiplier = baseMultiplier * ddaMultiplier;
    this.spawnManager.updateDifficulty(this.difficultyMultiplier, itemMultiplier);
  }

  private gameOver(): void {
    if (this.isGameOver) return;
    this.isGameOver = true;

    // Stop sounds
    this.sound_.stopEngine();
    this.sound_.setLowFuelWarning(false);
    this.sound_.stopBGM();
    this.sound_.play('gameOver');

    // Stop spawning
    this.spawnManager.stop();
    this.inputManager.destroy();

    // Slow motion death
    this.time.timeScale = 0.3;

    // Death effects
    this.cameras.main.shake(500, 0.02);
    this.cameras.main.flash(200, 255, 50, 50);

    // Retro "WASTED" text
    const wastedY = GAME_HEIGHT * 0.4;
    const deadText = this.add.text(GAME_WIDTH / 2, wastedY, 'WASTED', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '32px',
      color: '#ff2222',
      stroke: '#000000',
      strokeThickness: 4,
    });
    deadText.setOrigin(0.5);
    deadText.setDepth(101);
    deadText.setAlpha(0);

    const deadGlow = this.add.text(GAME_WIDTH / 2, wastedY, 'WASTED', {
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

    this.tweens.add({
      targets: this.scanlineOverlay,
      alpha: { from: 0.15, to: 0.3 },
      duration: 100,
      yoyo: true,
      repeat: 4,
    });

    // After WASTED animation: offer revival or proceed to game over
    this.time.delayedCall(600, () => {
      if (this.scoreManager.coinBalance >= REVIVAL.COST) {
        this.showRevivalUI();
      } else {
        this.time.delayedCall(900, () => this.finishGameOver());
      }
    });
  }

  private showRevivalUI(): void {
    // Restore timeScale — death slow-mo already played out
    this.time.timeScale = 1;

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT * 0.5;

    // Dim overlay
    const overlay = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.55)
      .setDepth(109);

    // Panel (tall enough for all content: from cy-75 to cy+82)
    const panel = this.add.rectangle(cx, cy + 4, 290, 180, 0x000511, 0.97)
      .setStrokeStyle(2, 0xffd700).setDepth(110);

    // Corner accents
    const corners = this.add.graphics().setDepth(110);
    corners.fillStyle(0xffd700);
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx, sy]) => {
      corners.fillRect(cx + sx * 143 - (sx > 0 ? 4 : 0), cy + 4 + sy * 88 - (sy > 0 ? 4 : 0), 4, 4);
    });

    const titleTxt = this.add.text(cx, cy - 62, 'CONTINUE?', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px', color: '#ffd700',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(111);

    // Coin balance bar
    const balanceTxt = this.add.text(cx, cy - 34, `COINS: ${this.scoreManager.coinBalance}`, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '9px', color: '#ffdd44',
    }).setOrigin(0.5).setDepth(111);

    const costLabel = this.add.text(cx, cy - 14, `COST: ${REVIVAL.COST} COINS`, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#888888',
    }).setOrigin(0.5).setDepth(111);

    // Countdown number — big and centered
    let count = REVIVAL.COUNTDOWN;
    const countTxt = this.add.text(cx, cy + 18, `${count}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '40px', color: '#ff4444',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(111);

    // Use window.setInterval so countdown runs in real time (unaffected by timeScale)
    const intervalId = window.setInterval(() => {
      if (!countTxt.scene) { window.clearInterval(intervalId); return; }
      count--;
      countTxt.setText(`${count}`);
      if (count <= 0) {
        window.clearInterval(intervalId);
        cleanup();
        this.finishGameOver();
      }
    }, 1000);

    // YES button
    const yesBtn = this.add.rectangle(cx - 68, cy + 66, 116, 40, 0x001a00)
      .setStrokeStyle(2, 0x00ff41).setInteractive({ useHandCursor: true }).setDepth(110);
    const yesTxt = this.add.text(cx - 68, cy + 66, 'CONTINUE', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#00ff41',
    }).setOrigin(0.5).setDepth(111);
    yesBtn.on('pointerover', () => { yesBtn.setFillStyle(0x003300); yesTxt.setColor('#44ff77'); });
    yesBtn.on('pointerout', () => { yesBtn.setFillStyle(0x001a00); yesTxt.setColor('#00ff41'); });
    yesBtn.on('pointerdown', () => {
      if (!this.scoreManager.spendCoins(REVIVAL.COST)) return;
      window.clearInterval(intervalId);
      cleanup();
      this.revivePlayer();
    });

    // NO button
    const noBtn = this.add.rectangle(cx + 68, cy + 66, 116, 40, 0x1a0000)
      .setStrokeStyle(1, 0x556666).setInteractive({ useHandCursor: true }).setDepth(110);
    const noTxt = this.add.text(cx + 68, cy + 66, 'GIVE UP', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#556666',
    }).setOrigin(0.5).setDepth(111);
    noBtn.on('pointerover', () => { noBtn.setFillStyle(0x2a0000); noTxt.setColor('#888888'); });
    noBtn.on('pointerout', () => { noBtn.setFillStyle(0x1a0000); noTxt.setColor('#556666'); });
    noBtn.on('pointerdown', () => {
      window.clearInterval(intervalId);
      cleanup();
      this.finishGameOver();
    });

    const elements = [overlay, panel, corners, titleTxt, balanceTxt, costLabel, countTxt, yesBtn, yesTxt, noBtn, noTxt];
    const cleanup = () => { elements.forEach(e => e.destroy()); };
  }

  private revivePlayer(): void {
    this.isGameOver = false;
    this.time.timeScale = 1;
    this.player.heal(1);
    this.player.isInvincible = true;
    this.time.delayedCall(2000, () => { this.player.isInvincible = false; });
    this.spawnManager.start(this.difficultyMultiplier, this.difficultyManager.getItemDropMultiplier());
    this.inputManager = new InputManager(this);
    this.inputManager.linkHUD(this.hud);
    this.sound_.startEngine();
    this.cameras.main.flash(200, 0, 255, 65, false);
  }

  private finishGameOver(): void {
    this.difficultyManager.saveSession(this.scoreManager.distanceMeters);
    this.scoreManager.saveHighScore();
    this.time.delayedCall(800, () => {
      this.time.timeScale = 1;
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

  private hitStop(duration: number = 25): void {
    this.time.timeScale = 0.05;
    this.time.delayedCall(duration, () => {
      this.time.timeScale = 1;
    });
  }

  private checkNearMiss(): void {
    const px = this.player.x;
    const py = this.player.y;

    this.spawnManager.zombies.getChildren().forEach((z) => {
      const zombie = z as Zombie;
      if (!zombie.active) return;
      if (this.nearMissedZombies.has(zombie)) return;

      const dist = Phaser.Math.Distance.Between(px, py, zombie.x, zombie.y);

      // Zombie passed the player (moved to the left) within near-miss range
      if (zombie.x < px - 20 && dist < NEAR_MISS.MAX_DIST) {
        this.nearMissedZombies.add(zombie);
        const points = this.scoreManager.addNearMiss();
        this.hud.showScorePopup(zombie.x, zombie.y - 30, `NEAR! +${points}`, '#ffff00');
      }
    });
  }

  private checkMilestone(): void {
    if (this.milestoneIndex >= MILESTONE.DISTANCES.length) return;

    const nextMilestone = MILESTONE.DISTANCES[this.milestoneIndex];
    if (this.scoreManager.distanceMeters >= nextMilestone) {
      this.milestoneIndex++;
      this.triggerDelivery(nextMilestone);
    }
  }

  private triggerDelivery(distanceM: number): void {
    void distanceM;
    const points = this.scoreManager.addDeliveryBonus();
    this.fuel = Math.min(100, this.fuel + MILESTONE.FUEL_REFILL);
    this.sound_.play('comboAlert');
    this.cameras.main.flash(150, 0, 255, 65, false);

    const delivText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.35,
      `배송 완료! +${points}pt`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '14px', color: '#ffd700',
        stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(102);

    const nextIdx = this.milestoneIndex;
    const nextDist = nextIdx < MILESTONE.DISTANCES.length ? MILESTONE.DISTANCES[nextIdx] : null;
    const nextText = nextDist
      ? this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.35 + 28,
          `다음 배송: ${nextDist}m`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px', color: '#cccccc',
          }).setOrigin(0.5).setDepth(102)
      : null;

    this.tweens.add({
      targets: [delivText, nextText].filter(Boolean) as Phaser.GameObjects.Text[],
      y: '-=40', alpha: 0,
      delay: 1200, duration: 500,
      onComplete: () => { delivText.destroy(); nextText?.destroy(); },
    });
  }

  private checkZoneTransition(): void {
    const dist = this.scoreManager.distanceMeters;
    let newZone = 0;
    for (let i = DIFFICULTY.ZONE_DISTANCE.length - 1; i >= 0; i--) {
      if (dist >= DIFFICULTY.ZONE_DISTANCE[i]) {
        newZone = i;
        break;
      }
    }

    if (newZone !== this.currentZone) {
      this.currentZone = newZone;
      if (newZone > 0) this.showZoneAnnouncement(ZONE_NAMES[newZone]);
    }
  }

  private showZoneAnnouncement(zoneName: string): void {
    const zoneText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.28,
      `ZONE ${this.currentZone + 1} — ${zoneName}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '11px', color: '#00ccff',
        stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(102).setAlpha(0);

    this.tweens.add({
      targets: zoneText,
      alpha: { from: 0, to: 1 },
      duration: 300,
      hold: 1200,
      yoyo: true,
      onComplete: () => zoneText.destroy(),
    });
  }
}

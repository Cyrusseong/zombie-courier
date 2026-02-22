import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, CRT } from '../config';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    this.createRetroLoadingBar();
  }

  create(): void {
    this.generateAssets();

    // Hide HTML loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) loadingScreen.classList.add('hidden');

    this.scene.start('MenuScene');
  }

  private createRetroLoadingBar(): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Retro terminal-style loading
    const termBg = this.add.rectangle(cx, cy, 340, 120, 0x000000, 0.9);
    termBg.setStrokeStyle(2, COLORS.CRT_GREEN);

    // Terminal header
    this.add.text(cx, cy - 42, '[ SYSTEM BOOT ]', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#00ff41',
    }).setOrigin(0.5);

    // Loading bar border
    this.add.rectangle(cx, cy, 280, 20, 0x000000)
      .setStrokeStyle(1, COLORS.CRT_GREEN_DIM);

    // Loading bar fill
    const bar = this.add.rectangle(cx - 138, cy, 0, 16, COLORS.CRT_GREEN);
    bar.setOrigin(0, 0.5);

    this.load.on('progress', (value: number) => {
      bar.width = 276 * value;
    });

    // Loading percentage text
    const pctText = this.add.text(cx, cy + 24, 'INITIALIZING...', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#00aa2a',
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      pctText.setText(`${Math.floor(value * 100)}%`);
    });

    // Blinking cursor
    const cursor = this.add.text(cx + 30, cy + 24, '_', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#00ff41',
    }).setOrigin(0, 0.5);

    this.tweens.add({
      targets: cursor,
      alpha: 0,
      duration: 400,
      yoyo: true,
      repeat: -1,
    });
  }

  private gfx(): Phaser.GameObjects.Graphics {
    return this.add.graphics();
  }

  private tex(g: Phaser.GameObjects.Graphics, key: string, w: number, h: number): void {
    g.generateTexture(key, w, h);
    g.destroy();
  }

  private generateAssets(): void {
    this.generatePlayerAssets();
    this.generateZombieAssets();
    this.generateObstacleAssets();
    this.generateItemAssets();
    this.generateEffectAssets();
    this.generateBackgroundAssets();
    this.generateUIAssets();
  }

  // ─── PLAYER ASSETS ───────────────────────────────
  private generatePlayerAssets(): void {
    // --- Player (motorcycle + rider) - retro pixel style ---
    let g = this.gfx();
    // Wheels - darker with bright rim
    g.fillStyle(0x222222);
    g.fillCircle(10, 28, 10);
    g.fillCircle(50, 28, 10);
    g.lineStyle(1, 0x00ff41, 0.6);  // Green neon rim
    g.strokeCircle(10, 28, 10);
    g.strokeCircle(50, 28, 10);
    // Spokes
    g.lineStyle(1, 0x444444);
    g.lineBetween(10, 18, 10, 38);
    g.lineBetween(0, 28, 20, 28);
    g.lineBetween(50, 18, 50, 38);
    g.lineBetween(40, 28, 60, 28);
    // Body - dark with neon accents
    g.fillStyle(0xbb2222);
    g.fillRect(12, 14, 36, 10);
    // Engine block
    g.fillStyle(0x444444);
    g.fillRect(20, 18, 14, 10);
    g.fillStyle(0x333333);
    g.fillRect(22, 20, 10, 6);
    // Handlebar
    g.fillStyle(0x666666);
    g.fillRect(44, 6, 4, 12);
    // Headlight (neon green)
    g.fillStyle(0x00ff41);
    g.fillRect(46, 8, 4, 4);
    // Rider body
    g.fillStyle(0x6b3a1f);
    g.fillRect(28, 0, 12, 14);
    // Rider head
    g.fillStyle(0xdda577);
    g.fillCircle(34, -4, 6);
    // Helmet (dark with green visor)
    g.fillStyle(0x222222);
    g.fillRect(28, -10, 12, 6);
    g.fillStyle(0x00ff41, 0.8);
    g.fillRect(30, -8, 8, 3);
    // Package on back
    g.fillStyle(0x8b6914);
    g.fillRect(14, 2, 10, 10);
    g.fillStyle(0x00ff41, 0.5);
    g.fillRect(16, 4, 6, 1);
    g.fillRect(16, 7, 6, 1);
    // Exhaust glow
    g.fillStyle(0xff4400, 0.5);
    g.fillRect(0, 24, 4, 3);
    this.tex(g, 'player', 64, 40);

    // --- Player slide frame ---
    g = this.gfx();
    g.fillStyle(0x222222);
    g.fillCircle(10, 18, 10);
    g.fillCircle(50, 18, 10);
    g.lineStyle(1, 0x00ff41, 0.6);
    g.strokeCircle(10, 18, 10);
    g.strokeCircle(50, 18, 10);
    g.fillStyle(0xbb2222);
    g.fillRect(12, 8, 36, 8);
    g.fillStyle(0x444444);
    g.fillRect(20, 10, 14, 8);
    g.fillStyle(0x6b3a1f);
    g.fillRect(28, 2, 16, 8);
    g.fillStyle(0xdda577);
    g.fillCircle(46, 4, 5);
    g.fillStyle(0x222222);
    g.fillRect(42, 0, 8, 4);
    g.fillStyle(0x00ff41, 0.8);
    g.fillRect(43, 1, 6, 2);
    this.tex(g, 'player_slide', 64, 30);
  }

  // ─── ZOMBIE ASSETS ───────────────────────────────
  private generateZombieAssets(): void {
    // --- Normal Zombie (more detailed retro pixel art) ---
    let g = this.gfx();
    // Body
    g.fillStyle(0x44bb44);
    g.fillRect(8, 10, 16, 20);
    // Torn clothes
    g.fillStyle(0x334433);
    g.fillRect(8, 10, 16, 4);
    g.fillRect(10, 22, 4, 8);
    // Head
    g.fillCircle(16, 6, 8);
    // Exposed bone/wound
    g.fillStyle(0x882222);
    g.fillRect(12, 14, 4, 3);
    // Arms (reaching forward)
    g.fillStyle(0x338833);
    g.fillRect(4, 14, 6, 14);
    g.fillRect(22, 12, 10, 4);
    // Dangling hand
    g.fillStyle(0x44bb44);
    g.fillRect(30, 12, 4, 6);
    // Legs
    g.fillStyle(0x227722);
    g.fillRect(8, 30, 7, 10);
    g.fillRect(17, 30, 7, 10);
    // Glowing red eyes
    g.fillStyle(0xff0000);
    g.fillCircle(13, 4, 2);
    g.fillCircle(19, 4, 2);
    // Eye glow
    g.fillStyle(0xff4444, 0.5);
    g.fillCircle(13, 4, 3);
    g.fillCircle(19, 4, 3);
    this.tex(g, 'zombie_normal', 36, 42);

    // --- Runner Zombie ---
    g = this.gfx();
    g.fillStyle(0x88cc44);
    g.fillRect(8, 10, 14, 18);
    g.fillStyle(0x556633);
    g.fillRect(8, 10, 14, 3);
    g.fillCircle(15, 6, 7);
    g.fillStyle(0x668833);
    g.fillRect(3, 12, 6, 12);
    g.fillRect(21, 10, 12, 4);
    // Extended reach
    g.fillStyle(0x88cc44);
    g.fillRect(31, 10, 4, 5);
    g.fillStyle(0x556622);
    g.fillRect(8, 28, 6, 12);
    g.fillRect(16, 28, 6, 12);
    // Glowing eyes
    g.fillStyle(0xff0000);
    g.fillCircle(12, 4, 2);
    g.fillCircle(18, 4, 2);
    g.fillStyle(0xff4444, 0.5);
    g.fillCircle(12, 4, 3);
    g.fillCircle(18, 4, 3);
    // Speed lines
    g.lineStyle(1, 0x88cc44, 0.3);
    g.lineBetween(0, 14, 5, 14);
    g.lineBetween(0, 18, 3, 18);
    this.tex(g, 'zombie_runner', 36, 42);
  }

  // ─── OBSTACLE ASSETS ─────────────────────────────
  private generateObstacleAssets(): void {
    // --- Obstacle: barricade (retro hazard stripes) ---
    let g = this.gfx();
    g.fillStyle(0x6b3a1f);
    g.fillRect(0, 0, 40, 30);
    // Hazard stripes
    g.fillStyle(0xffaa00);
    g.fillRect(2, 4, 36, 6);
    g.fillRect(2, 16, 36, 6);
    // Warning triangles
    for (let i = 0; i < 5; i++) {
      g.fillStyle(0x222222);
      g.fillTriangle(4 + i * 8, 9, 8 + i * 8, 5, 12 + i * 8, 9);
    }
    // Support posts
    g.fillStyle(0x4a2a0f);
    g.fillRect(4, 0, 6, 30);
    g.fillRect(30, 0, 6, 30);
    // Neon warning strip
    g.fillStyle(0xff2222, 0.6);
    g.fillRect(0, 0, 40, 2);
    this.tex(g, 'obstacle_barricade', 40, 30);

    // --- Obstacle: broken road ---
    g = this.gfx();
    g.fillStyle(0x444444);
    g.fillTriangle(0, 20, 20, 0, 40, 20);
    g.fillStyle(0x333333);
    g.fillTriangle(5, 20, 20, 5, 35, 20);
    // Crack lines
    g.lineStyle(1, 0x222222);
    g.lineBetween(15, 8, 20, 16);
    g.lineBetween(22, 6, 28, 14);
    // Danger glow
    g.fillStyle(0xff4400, 0.2);
    g.fillRect(8, 16, 24, 4);
    this.tex(g, 'obstacle_road', 40, 20);
  }

  // ─── ITEM ASSETS ─────────────────────────────────
  private generateItemAssets(): void {
    // --- Coin (retro pixel gold) ---
    let g = this.gfx();
    g.fillStyle(0xffd700);
    g.fillCircle(8, 8, 8);
    g.fillStyle(0xcc9900);
    g.fillCircle(8, 8, 6);
    g.fillStyle(0xffd700);
    g.fillRect(6, 3, 4, 10);
    // $ symbol
    g.fillStyle(0xffee44);
    g.fillRect(7, 5, 2, 6);
    this.tex(g, 'coin', 16, 16);

    // --- Fuel can (retro neon) ---
    g = this.gfx();
    g.fillStyle(0xdd3333);
    g.fillRect(2, 4, 12, 14);
    g.fillStyle(0xaa0000);
    g.fillRect(4, 0, 8, 4);
    // F label (pixel)
    g.fillStyle(0xffffff);
    g.fillRect(5, 7, 6, 1);
    g.fillRect(5, 7, 1, 7);
    g.fillRect(5, 10, 4, 1);
    // Neon glow line
    g.fillStyle(0x00ff41, 0.4);
    g.fillRect(2, 17, 12, 1);
    this.tex(g, 'fuel', 16, 18);

    // --- Health kit (retro with green cross) ---
    g = this.gfx();
    g.fillStyle(0xeeeeee);
    g.fillRect(1, 1, 14, 14);
    g.fillStyle(0x00cc00);
    g.fillRect(6, 3, 4, 10);
    g.fillRect(3, 6, 10, 4);
    // Border
    g.lineStyle(1, 0x00ff41, 0.5);
    g.strokeRect(0, 0, 16, 16);
    this.tex(g, 'health', 16, 16);

    // --- Weapon pickup (bat) ---
    g = this.gfx();
    g.fillStyle(0x6b3a1f);
    g.fillRect(2, 2, 6, 20);
    g.fillStyle(0x8b5a3f);
    g.fillRect(0, 0, 10, 8);
    // Nail details
    g.fillStyle(0xaaaaaa);
    g.fillRect(2, 2, 2, 2);
    g.fillRect(6, 4, 2, 2);
    this.tex(g, 'weapon_bat', 10, 22);
  }

  // ─── EFFECT ASSETS ───────────────────────────────
  private generateEffectAssets(): void {
    // --- Attack swing effect (neon green arc) ---
    let g = this.gfx();
    g.lineStyle(3, 0x00ff41, 0.8);
    g.beginPath();
    g.arc(0, 20, 30, -1.2, -0.3, false);
    g.strokePath();
    g.lineStyle(2, 0xffff00, 0.5);
    g.beginPath();
    g.arc(0, 20, 24, -1.0, -0.4, false);
    g.strokePath();
    // Extra glow line
    g.lineStyle(1, 0x00ff41, 0.3);
    g.beginPath();
    g.arc(0, 20, 34, -1.1, -0.35, false);
    g.strokePath();
    this.tex(g, 'attack_swing', 40, 40);

    // --- Particle (neon square) ---
    g = this.gfx();
    g.fillStyle(0x00ff41);
    g.fillRect(0, 0, 4, 4);
    this.tex(g, 'particle', 4, 4);

    // --- Dust particle ---
    g = this.gfx();
    g.fillStyle(0x887755);
    g.fillCircle(3, 3, 3);
    this.tex(g, 'dust', 6, 6);

    // --- Blood particle (brighter for retro) ---
    g = this.gfx();
    g.fillStyle(0xcc0000);
    g.fillRect(0, 0, 4, 4);
    this.tex(g, 'blood', 4, 4);

    // --- CRT Scanline texture ---
    g = this.gfx();
    for (let y = 0; y < GAME_HEIGHT; y += CRT.SCANLINE_GAP) {
      g.fillStyle(0x000000, CRT.SCANLINE_ALPHA);
      g.fillRect(0, y, GAME_WIDTH, 1);
    }
    this.tex(g, 'scanlines', GAME_WIDTH, GAME_HEIGHT);

    // --- Static noise texture ---
    g = this.gfx();
    for (let i = 0; i < 300; i++) {
      const nx = Math.random() * GAME_WIDTH;
      const ny = Math.random() * GAME_HEIGHT;
      const brightness = Math.random() > 0.5 ? 0xffffff : 0x888888;
      g.fillStyle(brightness, Math.random() * 0.08);
      g.fillRect(nx, ny, 1, 1);
    }
    this.tex(g, 'noise', GAME_WIDTH, GAME_HEIGHT);
  }

  // ─── BACKGROUND ASSETS ───────────────────────────
  private generateBackgroundAssets(): void {
    let g: Phaser.GameObjects.Graphics;

    // --- Background: Sky (darker, more stars, eerie moon) ---
    g = this.gfx();
    // Gradient sky
    for (let y = 0; y < GAME_HEIGHT; y++) {
      const t = y / GAME_HEIGHT;
      const r = Math.floor(6 + t * 4);
      const gr = Math.floor(6 + t * 6);
      const b = Math.floor(16 + t * 8);
      g.fillStyle(Phaser.Display.Color.GetColor(r, gr, b));
      g.fillRect(0, y, GAME_WIDTH, 1);
    }
    // Moon (eerie green-tinted)
    g.fillStyle(0xccddaa, 0.7);
    g.fillCircle(760, 80, 32);
    g.fillStyle(COLORS.SKY_DARK);
    g.fillCircle(770, 74, 28);
    // Moon glow
    g.fillStyle(0x88aa66, 0.1);
    g.fillCircle(760, 80, 50);
    // Stars (more and varied)
    for (let i = 0; i < 80; i++) {
      const brightness = Math.random();
      const alpha = 0.3 + brightness * 0.7;
      const size = brightness > 0.8 ? 2 : 1;
      g.fillStyle(0xffffff, alpha);
      g.fillRect(
        Math.random() * GAME_WIDTH,
        Math.random() * GAME_HEIGHT * 0.45,
        size, size
      );
    }
    // Shooting star trail
    g.lineStyle(1, 0x00ff41, 0.15);
    g.lineBetween(200, 40, 260, 70);
    this.tex(g, 'bg_sky', GAME_WIDTH, GAME_HEIGHT);

    // --- Background: Far buildings (ruined silhouettes) ---
    g = this.gfx();
    g.fillStyle(0x060610, 0);
    g.fillRect(0, 0, GAME_WIDTH * 2, GAME_HEIGHT);
    for (let i = 0; i < 20; i++) {
      const bx = i * 100 + Math.random() * 40;
      const bh = 80 + Math.random() * 160;
      const bw = 30 + Math.random() * 50;
      // Building
      g.fillStyle(0x151525);
      g.fillRect(bx, GAME_HEIGHT - bh - 120, bw, bh);
      // Damage chunks
      g.fillStyle(0x060610);
      g.fillRect(bx + Math.random() * bw * 0.5, GAME_HEIGHT - bh - 120,
        4 + Math.random() * 10, 10 + Math.random() * 20);
      // Dim windows (some lit with green/amber)
      for (let wy = GAME_HEIGHT - bh - 110; wy < GAME_HEIGHT - 130; wy += 14) {
        for (let wx = bx + 4; wx < bx + bw - 4; wx += 10) {
          if (Math.random() > 0.75) {
            const windowColor = Math.random() > 0.7 ? 0x00ff41 : 0xffb000;
            g.fillStyle(windowColor, 0.15 + Math.random() * 0.15);
            g.fillRect(wx, wy, 4, 6);
          }
        }
      }
    }
    // Radio tower with blinking light
    g.fillStyle(0x222233);
    g.fillRect(1500, GAME_HEIGHT - 320, 3, 200);
    g.fillStyle(0xff0000, 0.8);
    g.fillCircle(1501, GAME_HEIGHT - 320, 3);
    this.tex(g, 'bg_far', GAME_WIDTH * 2, GAME_HEIGHT);

    // --- Background: Mid buildings (more detail) ---
    g = this.gfx();
    g.fillStyle(0x060610, 0);
    g.fillRect(0, 0, GAME_WIDTH * 2, GAME_HEIGHT);
    for (let i = 0; i < 16; i++) {
      const bx = i * 130 + Math.random() * 30;
      const bh = 100 + Math.random() * 140;
      const bw = 40 + Math.random() * 60;
      // Building
      g.fillStyle(0x1a1a2a);
      g.fillRect(bx, GAME_HEIGHT - bh - 120, bw, bh);
      // Damage holes
      g.fillStyle(0x0a0a15);
      for (let d = 0; d < 4; d++) {
        g.fillRect(
          bx + Math.random() * (bw - 8),
          GAME_HEIGHT - bh - 120 + Math.random() * bh,
          4 + Math.random() * 10,
          4 + Math.random() * 12
        );
      }
      // Rooftop antenna
      if (Math.random() > 0.6) {
        g.fillStyle(0x333344);
        g.fillRect(bx + bw / 2, GAME_HEIGHT - bh - 130, 2, 10);
      }
    }
    // Smoke/fog
    g.fillStyle(0x334455, 0.15);
    for (let i = 0; i < 10; i++) {
      g.fillCircle(
        Math.random() * GAME_WIDTH * 2,
        200 + Math.random() * 120,
        20 + Math.random() * 40
      );
    }
    // Neon signs (flickering green/pink text shapes)
    g.fillStyle(0x00ff41, 0.2);
    g.fillRect(350, GAME_HEIGHT - 200, 20, 6);
    g.fillStyle(0xff00aa, 0.15);
    g.fillRect(900, GAME_HEIGHT - 180, 16, 5);
    this.tex(g, 'bg_mid', GAME_WIDTH * 2, GAME_HEIGHT);

    // --- Background: Near buildings (closest, most detail) ---
    g = this.gfx();
    g.fillStyle(0x060610, 0);
    g.fillRect(0, 0, GAME_WIDTH * 2, GAME_HEIGHT);
    for (let i = 0; i < 12; i++) {
      const bx = i * 170 + Math.random() * 40;
      const bh = 60 + Math.random() * 100;
      const bw = 50 + Math.random() * 80;
      // Building
      g.fillStyle(0x222238);
      g.fillRect(bx, GAME_HEIGHT - bh - 120, bw, bh);
      // Lit windows (brighter, more frequent)
      for (let wy = GAME_HEIGHT - bh - 110; wy < GAME_HEIGHT - 130; wy += 18) {
        for (let wx = bx + 6; wx < bx + bw - 6; wx += 14) {
          if (Math.random() > 0.35) {
            const lit = Math.random() > 0.6;
            if (lit) {
              const wColor = Math.random() > 0.5 ? 0x00ff41 : 0xffb000;
              g.fillStyle(wColor, 0.2 + Math.random() * 0.2);
            } else {
              g.fillStyle(0x334455, 0.3);
            }
            g.fillRect(wx, wy, 8, 10);
          }
        }
      }
      // Graffiti splashes
      if (Math.random() > 0.5) {
        const gColor = Math.random() > 0.5 ? 0xff00aa : 0x00ff41;
        g.fillStyle(gColor, 0.12);
        g.fillRect(bx + 5 + Math.random() * (bw - 20), GAME_HEIGHT - bh - 100,
          8 + Math.random() * 12, 4 + Math.random() * 6);
      }
    }
    // Hanging wires
    g.lineStyle(1, 0x333344, 0.4);
    g.lineBetween(100, GAME_HEIGHT - 180, 250, GAME_HEIGHT - 170);
    g.lineBetween(600, GAME_HEIGHT - 160, 780, GAME_HEIGHT - 175);
    this.tex(g, 'bg_near', GAME_WIDTH * 2, GAME_HEIGHT);

    // --- Background: Ground / Road (retro neon-lined road) ---
    g = this.gfx();
    // Curb
    g.fillStyle(0x444444);
    g.fillRect(0, 0, GAME_WIDTH * 2, 10);
    // Curb neon line
    g.fillStyle(0x00ff41, 0.3);
    g.fillRect(0, 0, GAME_WIDTH * 2, 2);
    // Road surface
    g.fillStyle(COLORS.ROAD_GRAY);
    g.fillRect(0, 10, GAME_WIDTH * 2, 110);
    // Road cracks
    g.fillStyle(0x1a1a1a);
    for (let i = 0; i < 30; i++) {
      const cx = Math.random() * GAME_WIDTH * 2;
      g.fillRect(cx, 20 + Math.random() * 80, 1, 6 + Math.random() * 15);
    }
    // Center line dashes (retro yellow)
    g.fillStyle(0xffaa00, 0.5);
    for (let i = 0; i < 40; i++) {
      g.fillRect(i * 50, 55, 30, 3);
    }
    // Road edge
    g.fillStyle(0x333333);
    g.fillRect(0, 110, GAME_WIDTH * 2, 10);
    // Bottom neon line
    g.fillStyle(0xff2222, 0.15);
    g.fillRect(0, 118, GAME_WIDTH * 2, 2);
    this.tex(g, 'bg_ground', GAME_WIDTH * 2, 120);
  }

  // ─── UI ASSETS ───────────────────────────────────
  private generateUIAssets(): void {
    // --- Retro button texture ---
    let g = this.gfx();
    g.fillStyle(0x111820);
    g.fillRect(0, 0, 200, 48);
    g.lineStyle(2, COLORS.CRT_GREEN);
    g.strokeRect(1, 1, 198, 46);
    // Corner decorations
    g.fillStyle(COLORS.CRT_GREEN);
    g.fillRect(0, 0, 6, 2);
    g.fillRect(0, 0, 2, 6);
    g.fillRect(194, 0, 6, 2);
    g.fillRect(198, 0, 2, 6);
    g.fillRect(0, 46, 6, 2);
    g.fillRect(0, 42, 2, 6);
    g.fillRect(194, 46, 6, 2);
    g.fillRect(198, 42, 2, 6);
    this.tex(g, 'retro_btn', 200, 48);

    // --- Retro panel texture ---
    g = this.gfx();
    g.fillStyle(0x0a0a12, 0.9);
    g.fillRect(0, 0, 400, 300);
    g.lineStyle(1, COLORS.CRT_GREEN, 0.6);
    g.strokeRect(2, 2, 396, 296);
    g.lineStyle(1, COLORS.CRT_GREEN, 0.2);
    g.strokeRect(6, 6, 388, 288);
    this.tex(g, 'retro_panel', 400, 300);

    // --- Mobile touch button ---
    g = this.gfx();
    g.fillStyle(0x000000, 0.3);
    g.fillCircle(24, 24, 24);
    g.lineStyle(2, COLORS.CRT_GREEN, 0.5);
    g.strokeCircle(24, 24, 22);
    this.tex(g, 'touch_btn', 48, 48);
  }
}

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
    const termBg = this.add.rectangle(cx, cy, 300, 120, 0x000000, 0.9);
    termBg.setStrokeStyle(2, COLORS.CRT_GREEN);

    // Terminal header
    this.add.text(cx, cy - 42, '[ SYSTEM BOOT ]', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#00ff41',
    }).setOrigin(0.5);

    // Loading bar border
    this.add.rectangle(cx, cy, 240, 20, 0x000000)
      .setStrokeStyle(1, COLORS.CRT_GREEN_DIM);

    // Loading bar fill
    const bar = this.add.rectangle(cx - 118, cy, 0, 16, COLORS.CRT_GREEN);
    bar.setOrigin(0, 0.5);

    this.load.on('progress', (value: number) => {
      bar.width = 236 * value;
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

  // ASCII 컬러맵으로 픽셀아트 스프라이트 생성
  private drawPixelMap(
    g: Phaser.GameObjects.Graphics,
    map: string[],
    palette: Record<string, number>,
    scale: number = 2
  ): void {
    for (let row = 0; row < map.length; row++) {
      for (let col = 0; col < map[row].length; col++) {
        const ch = map[row][col];
        if (ch === '.' || ch === ' ') continue;
        const color = palette[ch];
        if (color === undefined) continue;
        g.fillStyle(color);
        g.fillRect(col * scale, row * scale, scale, scale);
      }
    }
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
    // Player: 오토바이 + 라이더 side-view pixel art
    // 32×20 픽셀맵 @ 2x = 64×40px
    // H=헬멧 dark, V=visor green, S=skin, J=jacket brown
    // R=red bike, E=engine gray, W=wheel dark, G=green rim
    // P=package tan, F=fire orange, .=transparent
    const playerMap = [
      '................................',
      '................................',
      '..........HHHHHHHH..............',
      '.........HVVVVVVVVH.............',
      '.........HHHHHHHHHH.............',
      '..........SSSSSSS...............',
      '..........JJJJJJJ..RRRRRRRRRR..',
      '.........JJJJJJJJJ.RRRRRRRRRR..',
      'PP.......JJJJJJJJJ.RE.RRRRR..G.',
      'PP.......JJJJJJJJJ.RE.RRRRR..G.',
      'PP........JJJJJJJ..RRRRRRRRRR..',
      '...........JJJJJJJJRRRRRR......',
      '...........JJJJJJJJR..G....GG..',
      '............JJJJJJJR..G....GG..',
      '............JJJJJJJ.WWWWW.WWWWW',
      '.............JJJJJJ.W...W.W...W',
      'F............JJJJJ..WWWWW.WWWWW',
      'FF...................................',
      '................................',
      '................................',
    ];
    const playerPalette: Record<string, number> = {
      H: 0x333333,
      V: 0x00cc44,
      S: 0xdda577,
      J: 0x6b3a1f,
      R: 0xbb2222,
      E: 0x555555,
      W: 0x222222,
      G: 0x00ff41,
      P: 0x8b6914,
      F: 0xff5500,
    };
    let g = this.gfx();
    this.drawPixelMap(g, playerMap, playerPalette, 2);
    this.tex(g, 'player', 64, 40);

    // Player slide: flattened pose (20×12 pixels @ 2x = 40×24px)
    const slideMap = [
      '....................',
      '..HHHHHHH...........',
      '.HVVVVVVVH..........',
      '.HHHHHHHHHSSSS......',
      '..JJJJJJJJJJJJRRRR.',
      'PJJJJJJJJJJJJJREER.',
      'PJJJJJJJJJJJJJRRRR.',
      'PP.JJJJJJJJJJJRRRR.',
      '...JJJJJJJJJ.WWWWW.',
      'F..JJJJJJJJJ.W...W.',
      'FF...........WWWWW.',
      '....................',
    ];
    g = this.gfx();
    this.drawPixelMap(g, slideMap, playerPalette, 2);
    this.tex(g, 'player_slide', 40, 24);
  }

  // ─── ZOMBIE ASSETS ───────────────────────────────
  private generateZombieAssets(): void {
    // Normal Zombie: 16×20 픽셀맵 @ 2x = 32×40px
    // G=zombie green, D=dark green, R=red wound/eye
    // C=clothes dark, B=bone/light, .=transparent
    const normalMap = [
      '....GGGGGGGG....',
      '...GGGGGGGGGG...',
      '...GGRRGGRRGG...',
      '...GGGGGGGGG....',
      '...GGGGGGGGGG...',
      '..CCCCCCCCCCCC..',
      '..CCCCCCCCCCCC..',
      '.GCC..RRRR..CCG.',
      '.GCC..RRRR..CCG.',
      '..CCCCCCCCCCCC..',
      '..CCCCCCCCCCCC..',
      '.GCCCCCCCCCCCCG.',
      '.GCCCCCCCCCCCCG.',
      '..DDDDDDDDDDDD..',
      '..DDDDDDDDDDDD..',
      '..GGG....DDDD...',
      '..GGG....GGGG...',
      '..GGG....GGGG...',
      '..GGG....GGGG...',
      '................',
    ];
    const zombiePalette: Record<string, number> = {
      G: 0x44bb44,
      D: 0x227722,
      R: 0xff0000,
      C: 0x334433,
      B: 0xccaa88,
    };
    let g = this.gfx();
    this.drawPixelMap(g, normalMap, zombiePalette, 2);
    this.tex(g, 'zombie_normal', 32, 40);

    // Runner Zombie: slimmer, leaning forward
    const runnerMap = [
      '....GGGGGG......',
      '...GGGGGGGG.....',
      '...GGRRGGRRG....',
      '...GGGGGGGGG....',
      '....GGGGGGGG....',
      '...CCCCCCCCCC...',
      '...CCCCCCCCCC...',
      '..GC..RRRR.CCG..',
      '..GC..RRRR.CCG..',
      '...CCCCCCCCCC...',
      '...CCCCCCCCCC...',
      '..GCCCCCCCCCCG..',
      '..GCCCCCCCCCCG..',
      '...DDDDDDDDDD...',
      '...DDDDDDDDDD...',
      '...DDD...DDDD...',
      '...GGG...GGGG...',
      '...GGG...GGGG...',
      '...GGG...GGGG...',
      '................',
    ];
    g = this.gfx();
    this.drawPixelMap(g, runnerMap, zombiePalette, 2);
    this.tex(g, 'zombie_runner', 32, 40);

    // Fat Zombie: 20×22 pixels @ 2x = 40×44px
    const fatPalette: Record<string, number> = {
      G: 0x338833,
      D: 0x1a5c1a,
      R: 0xff0000,
      C: 0x334433,
      B: 0x227722,
    };
    const fatMap = [
      '.......GGGGGGGGG.......',
      '......GGGGGGGGGGG......',
      '......GGG..GG..GGG.....',
      '......GGGRRGGRRGGGG....',
      '......GGGGGGGGGGG......',
      '......GGGGGGGGGGG......',
      '.....CCCCCCCCCCCCCCC...',
      '.....CCCCCCCCCCCCCCC...',
      '.GGGGCCCCCCCCCCCCCCC...',
      '.GGGGCCC.RRRRRR.CCC....',
      '.GGGGCCC.RRRRRR.CCCGG..',
      '.GGGGCCCCCCCCCCCCCCCGG..',
      '.GGGGCCCCCCCCCCCCCCCGG..',
      '......BBBBBBBBBBBBB.....',
      '......BBBBBBBBBBBBB.....',
      '......BBBBBBBBBBBBB.....',
      '......BBBBBBBBBBBBB.....',
      '......DDD...DDDDDDD.....',
      '......DDD...DDDDDDD.....',
      '......GGG...GGGGGGG.....',
      '......GGG...GGGGGGG.....',
      '.....................',
    ];
    g = this.gfx();
    this.drawPixelMap(g, fatMap, fatPalette, 2);
    this.tex(g, 'zombie_fat', 44, 44);

    // Crawler Zombie: 20×10 pixels @ 2x = 40×20px
    // Flat, wide, mid-height zombie — slide under it
    // K=darkest green, D=dark green, G=normal green, R=red eyes
    const crawlerPalette: Record<string, number> = {
      K: 0x115511,
      D: 0x227722,
      G: 0x44bb44,
      R: 0xff0000,
    };
    const crawlerMap = [
      '....................',
      '....KKKKKKKKKKKKK...',
      'GKKKKRKKKKKRKKKKKKG.',
      'GKKKKKKKKKKKKKKKKKGG',
      '.DDDDDDDDDDDDDDDDDD.',
      '..KKK...........KKK.',
      '..GGG...........GGG.',
      '....................',
      '....................',
      '....................',
    ];
    g = this.gfx();
    this.drawPixelMap(g, crawlerMap, crawlerPalette, 2);
    this.tex(g, 'zombie_crawler', 40, 20);
  }

  // ─── OBSTACLE ASSETS ─────────────────────────────
  private generateObstacleAssets(): void {
    // Barricade: 16×14 pixels @ 2x = 32×28px
    // B=brown post, Y=yellow stripe, K=dark stripe, R=red top
    const barricadeMap = [
      'RRRRRRRRRRRRRRRR',
      'BBYYYYYYYYYYYBBB',
      'BBKYYKYYKYYKYYBB',
      'BBYYYYYYYYYYYBBB',
      'BBBBBBBBBBBBBBBB',
      'BBYYYY....YYYYBB',
      'BBKYYK....KYYKBB',
      'BBYYYY....YYYYBB',
      'BBBBBBBBBBBBBBBB',
      'BBYYYYYYYYYYYBBB',
      'BBKYYKYYKYYKYYBB',
      'BBYYYYYYYYYYYBBB',
      'RRRRRRRRRRRRRRRR',
      'BB............BB',
    ];
    const barricadePalette: Record<string, number> = {
      B: 0x4a2a0f,
      Y: 0xffaa00,
      K: 0x222222,
      R: 0xff2222,
    };
    let g = this.gfx();
    this.drawPixelMap(g, barricadeMap, barricadePalette, 2);
    this.tex(g, 'obstacle_barricade', 32, 28);

    // Broken road: 20×10 pixels @ 2x = 40×20px
    const roadMap = [
      '.......RRRRRR.......',
      '......RRRRRRRR......',
      '.....RRRRRRRRRR.....',
      '....RRRR....RRRR....',
      '...RRRR.KKK.RRRR...',
      '..RRRR..KKK..RRRR..',
      '.RRRRRRKKKKKRRRRRR.',
      'RRRRRRRRKKRRRRRRRRRR',
      'RRRRRRRRRRRRRRRRRRRR',
      'RRRRRRRRRRRRRRRRRRRR',
    ];
    const roadPalette: Record<string, number> = {
      R: 0x444444,
      K: 0x222222,
    };
    g = this.gfx();
    this.drawPixelMap(g, roadMap, roadPalette, 2);
    this.tex(g, 'obstacle_road', 40, 20);
  }

  // ─── ITEM ASSETS ─────────────────────────────────
  private generateItemAssets(): void {
    // Coin: 8×8 pixels @ 2x = 16×16px
    const coinMap = [
      '..YYYY..',
      '.YYYYYY.',
      'YYDYYYDY',
      'YYYYDDYY',
      'YYYYDDYY',
      'YYDYYYDY',
      '.YYYYYY.',
      '..YYYY..',
    ];
    const coinPalette: Record<string, number> = {
      Y: 0xffd700,
      D: 0xcc8800,
    };
    let g = this.gfx();
    this.drawPixelMap(g, coinMap, coinPalette, 2);
    this.tex(g, 'coin', 16, 16);

    // Fuel: 8×10 pixels @ 2x = 16×20px
    const fuelMap = [
      '...RR...',
      '..RRRR..',
      '..RRRR..',
      '.RRRRRR.',
      '.RWWWWR.',
      '.RWWWWR.',
      '.RWWWWR.',
      '.RRRRRRR',
      '.RRGGR..',
      '.RRRRRR.',
    ];
    const fuelPalette: Record<string, number> = {
      R: 0xdd3333,
      W: 0xffffff,
      G: 0x00ff41,
    };
    g = this.gfx();
    this.drawPixelMap(g, fuelMap, fuelPalette, 2);
    this.tex(g, 'fuel', 16, 20);

    // Health: 8×8 pixels @ 2x = 16×16px (white+green cross)
    const healthMap = [
      'WWWWWWWW',
      'WWWGGWWW',
      'WWWGGWWW',
      'WGGGGGGG',
      'WGGGGGGG',
      'WWWGGWWW',
      'WWWGGWWW',
      'WWWWWWWW',
    ];
    const healthPalette: Record<string, number> = {
      W: 0xeeeeee,
      G: 0x00cc00,
    };
    g = this.gfx();
    this.drawPixelMap(g, healthMap, healthPalette, 2);
    this.tex(g, 'health', 16, 16);

    // Weapon bat (keep for compatibility)
    g = this.gfx();
    g.fillStyle(0x6b3a1f);
    g.fillRect(2, 2, 6, 20);
    g.fillStyle(0x8b5a3f);
    g.fillRect(0, 0, 10, 8);
    g.fillStyle(0xaaaaaa);
    g.fillRect(2, 2, 2, 2);
    g.fillRect(6, 4, 2, 2);
    this.tex(g, 'weapon_bat', 10, 22);
  }

  // ─── EFFECT ASSETS ───────────────────────────────
  private generateEffectAssets(): void {
    // Attack swing effect (neon green arc)
    let g = this.gfx();
    g.lineStyle(3, 0x00ff41, 0.8);
    g.beginPath();
    g.arc(0, 20, 30, -1.2, -0.3, false);
    g.strokePath();
    g.lineStyle(2, 0xffff00, 0.5);
    g.beginPath();
    g.arc(0, 20, 24, -1.0, -0.4, false);
    g.strokePath();
    g.lineStyle(1, 0x00ff41, 0.3);
    g.beginPath();
    g.arc(0, 20, 34, -1.1, -0.35, false);
    g.strokePath();
    this.tex(g, 'attack_swing', 40, 40);

    // Particle (neon square)
    g = this.gfx();
    g.fillStyle(0x00ff41);
    g.fillRect(0, 0, 4, 4);
    this.tex(g, 'particle', 4, 4);

    // Dust particle
    g = this.gfx();
    g.fillStyle(0x887755);
    g.fillCircle(3, 3, 3);
    this.tex(g, 'dust', 6, 6);

    // Blood particle
    g = this.gfx();
    g.fillStyle(0xcc0000);
    g.fillRect(0, 0, 4, 4);
    this.tex(g, 'blood', 4, 4);

    // CRT Scanline texture — portrait size
    g = this.gfx();
    for (let y = 0; y < GAME_HEIGHT; y += CRT.SCANLINE_GAP) {
      g.fillStyle(0x000000, CRT.SCANLINE_ALPHA);
      g.fillRect(0, y, GAME_WIDTH, 1);
    }
    this.tex(g, 'scanlines', GAME_WIDTH, GAME_HEIGHT);

    // Static noise texture — portrait size
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

    // --- bg_sky: 405×720 portrait, night sky ---
    g = this.gfx();
    for (let y = 0; y < GAME_HEIGHT; y++) {
      const t = y / GAME_HEIGHT;
      const r = Math.floor(6 + t * 6);
      const gr = Math.floor(6 + t * 8);
      const b = Math.floor(18 + t * 10);
      g.fillStyle(Phaser.Display.Color.GetColor(r, gr, b));
      g.fillRect(0, y, GAME_WIDTH, 1);
    }
    // Moon (upper right)
    g.fillStyle(0xccddaa, 0.7);
    g.fillCircle(340, 90, 32);
    g.fillStyle(COLORS.SKY_DARK);
    g.fillCircle(350, 82, 28);
    // Moon glow
    g.fillStyle(0x88aa66, 0.1);
    g.fillCircle(340, 90, 50);
    // Stars (upper 60% of screen)
    for (let i = 0; i < 100; i++) {
      const brightness = Math.random();
      const alpha = 0.3 + brightness * 0.7;
      const size = brightness > 0.8 ? 2 : 1;
      g.fillStyle(0xffffff, alpha);
      g.fillRect(
        Math.random() * GAME_WIDTH,
        Math.random() * GAME_HEIGHT * 0.6,
        size, size
      );
    }
    // Shooting star trail
    g.lineStyle(1, 0x00ff41, 0.15);
    g.lineBetween(80, 60, 150, 100);
    this.tex(g, 'bg_sky', GAME_WIDTH, GAME_HEIGHT);

    // --- bg_far: 810×720 (2x wide for tiling), tall distant buildings ---
    const farW = GAME_WIDTH * 2;
    g = this.gfx();
    g.fillStyle(0x060610, 0);
    g.fillRect(0, 0, farW, GAME_HEIGHT);
    for (let i = 0; i < 14; i++) {
      const bx = i * 120 + Math.random() * 30;
      const bh = 250 + Math.random() * 200;  // Taller for portrait
      const bw = 40 + Math.random() * 60;
      const groundBase = GAME_HEIGHT - 156;   // above road area
      g.fillStyle(0x151525);
      g.fillRect(bx, groundBase - bh, bw, bh);
      // Damage chunks
      g.fillStyle(0x060610);
      g.fillRect(bx + Math.random() * bw * 0.5, groundBase - bh,
        4 + Math.random() * 10, 10 + Math.random() * 20);
      // Dim windows
      for (let wy = groundBase - bh + 10; wy < groundBase - 20; wy += 16) {
        for (let wx = bx + 4; wx < bx + bw - 4; wx += 12) {
          if (Math.random() > 0.7) {
            const wColor = Math.random() > 0.7 ? 0x00ff41 : 0xffb000;
            g.fillStyle(wColor, 0.12 + Math.random() * 0.12);
            g.fillRect(wx, wy, 5, 7);
          }
        }
      }
    }
    // Radio tower
    g.fillStyle(0x222233);
    g.fillRect(farW - 200, GAME_HEIGHT - 450, 3, 300);
    g.fillStyle(0xff0000, 0.8);
    g.fillCircle(farW - 199, GAME_HEIGHT - 450, 3);
    this.tex(g, 'bg_far', farW, GAME_HEIGHT);

    // --- bg_mid: 810×720, mid-distance buildings ---
    g = this.gfx();
    g.fillStyle(0x060610, 0);
    g.fillRect(0, 0, farW, GAME_HEIGHT);
    for (let i = 0; i < 12; i++) {
      const bx = i * 150 + Math.random() * 30;
      const bh = 180 + Math.random() * 180;
      const bw = 50 + Math.random() * 70;
      const groundBase = GAME_HEIGHT - 156;
      g.fillStyle(0x1a1a2a);
      g.fillRect(bx, groundBase - bh, bw, bh);
      // Damage
      g.fillStyle(0x0a0a15);
      for (let d = 0; d < 4; d++) {
        g.fillRect(
          bx + Math.random() * (bw - 8),
          groundBase - bh + Math.random() * bh,
          4 + Math.random() * 10,
          4 + Math.random() * 12
        );
      }
      // Rooftop antenna
      if (Math.random() > 0.5) {
        g.fillStyle(0x333344);
        g.fillRect(bx + bw / 2, groundBase - bh - 14, 2, 14);
      }
      // Windows
      for (let wy = groundBase - bh + 10; wy < groundBase - 20; wy += 18) {
        for (let wx = bx + 6; wx < bx + bw - 6; wx += 14) {
          if (Math.random() > 0.6) {
            const wColor = Math.random() > 0.6 ? 0x00ff41 : 0xffb000;
            g.fillStyle(wColor, 0.1 + Math.random() * 0.1);
            g.fillRect(wx, wy, 6, 8);
          }
        }
      }
    }
    // Neon signs
    g.fillStyle(0x00ff41, 0.2);
    g.fillRect(350, GAME_HEIGHT - 220, 22, 6);
    g.fillStyle(0xff00aa, 0.15);
    g.fillRect(680, GAME_HEIGHT - 200, 18, 5);
    this.tex(g, 'bg_mid', farW, GAME_HEIGHT);

    // --- bg_near: 810×720, closest buildings ---
    g = this.gfx();
    g.fillStyle(0x060610, 0);
    g.fillRect(0, 0, farW, GAME_HEIGHT);
    for (let i = 0; i < 10; i++) {
      const bx = i * 180 + Math.random() * 40;
      const bh = 100 + Math.random() * 130;
      const bw = 60 + Math.random() * 90;
      const groundBase = GAME_HEIGHT - 156;
      g.fillStyle(0x222238);
      g.fillRect(bx, groundBase - bh, bw, bh);
      // Lit windows
      for (let wy = groundBase - bh + 10; wy < groundBase - 20; wy += 20) {
        for (let wx = bx + 6; wx < bx + bw - 6; wx += 16) {
          if (Math.random() > 0.3) {
            const lit = Math.random() > 0.5;
            if (lit) {
              const wColor = Math.random() > 0.5 ? 0x00ff41 : 0xffb000;
              g.fillStyle(wColor, 0.2 + Math.random() * 0.2);
            } else {
              g.fillStyle(0x334455, 0.3);
            }
            g.fillRect(wx, wy, 9, 11);
          }
        }
      }
      // Graffiti
      if (Math.random() > 0.5) {
        const gColor = Math.random() > 0.5 ? 0xff00aa : 0x00ff41;
        g.fillStyle(gColor, 0.12);
        g.fillRect(bx + 5 + Math.random() * (bw - 20), groundBase - bh + 20,
          10 + Math.random() * 14, 5 + Math.random() * 6);
      }
    }
    // Hanging wires
    g.lineStyle(1, 0x333344, 0.4);
    g.lineBetween(80, GAME_HEIGHT - 220, 230, GAME_HEIGHT - 205);
    g.lineBetween(480, GAME_HEIGHT - 200, 650, GAME_HEIGHT - 215);
    this.tex(g, 'bg_near', farW, GAME_HEIGHT);

    // --- bg_ground: 810×120 road strip ---
    g = this.gfx();
    // Curb
    g.fillStyle(0x444444);
    g.fillRect(0, 0, farW, 10);
    // Curb neon line
    g.fillStyle(0x00ff41, 0.3);
    g.fillRect(0, 0, farW, 2);
    // Road surface
    g.fillStyle(COLORS.ROAD_GRAY);
    g.fillRect(0, 10, farW, 110);
    // Road cracks
    g.fillStyle(0x1a1a1a);
    for (let i = 0; i < 30; i++) {
      const cx2 = Math.random() * farW;
      g.fillRect(cx2, 20 + Math.random() * 80, 1, 6 + Math.random() * 15);
    }
    // Center line dashes (retro yellow)
    g.fillStyle(0xffaa00, 0.5);
    for (let i = 0; i < 40; i++) {
      g.fillRect(i * 50, 55, 30, 3);
    }
    // Road edge
    g.fillStyle(0x333333);
    g.fillRect(0, 110, farW, 10);
    // Bottom neon line
    g.fillStyle(0xff2222, 0.15);
    g.fillRect(0, 118, farW, 2);
    this.tex(g, 'bg_ground', farW, 120);
  }

  // ─── UI ASSETS ───────────────────────────────────
  private generateUIAssets(): void {
    // Retro button texture
    let g = this.gfx();
    g.fillStyle(0x111820);
    g.fillRect(0, 0, 200, 48);
    g.lineStyle(2, COLORS.CRT_GREEN);
    g.strokeRect(1, 1, 198, 46);
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

    // Retro panel texture
    g = this.gfx();
    g.fillStyle(0x0a0a12, 0.9);
    g.fillRect(0, 0, 400, 300);
    g.lineStyle(1, COLORS.CRT_GREEN, 0.6);
    g.strokeRect(2, 2, 396, 296);
    g.lineStyle(1, COLORS.CRT_GREEN, 0.2);
    g.strokeRect(6, 6, 388, 288);
    this.tex(g, 'retro_panel', 400, 300);

    // HUD game-button texture (120×60, for SLIDE/JUMP/ATTACK)
    g = this.gfx();
    g.fillStyle(0x000000, 0.45);
    g.fillRect(0, 0, 120, 60);
    g.lineStyle(2, COLORS.CRT_GREEN, 0.6);
    g.strokeRect(1, 1, 118, 58);
    this.tex(g, 'hud_btn', 120, 60);

    // Mobile touch button (kept for compatibility)
    g = this.gfx();
    g.fillStyle(0x000000, 0.3);
    g.fillCircle(24, 24, 24);
    g.lineStyle(2, COLORS.CRT_GREEN, 0.5);
    g.strokeCircle(24, 24, 22);
    this.tex(g, 'touch_btn', 48, 48);
  }
}

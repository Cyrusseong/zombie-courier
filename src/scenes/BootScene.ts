import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    this.createLoadingBar();
  }

  create(): void {
    this.generateAssets();
    this.scene.start('MenuScene');
  }

  private createLoadingBar(): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const bar = this.add.rectangle(cx - 156, cy, 0, 16, COLORS.NEON_GREEN);
    bar.setOrigin(0, 0.5);

    this.load.on('progress', (value: number) => {
      bar.width = 312 * value;
    });

    this.add.text(cx, cy - 40, 'LOADING...', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#39ff14',
    }).setOrigin(0.5);
  }

  private gfx(): Phaser.GameObjects.Graphics {
    return this.add.graphics();
  }

  private tex(g: Phaser.GameObjects.Graphics, key: string, w: number, h: number): void {
    g.generateTexture(key, w, h);
    g.destroy();
  }

  private generateAssets(): void {
    // --- Player (motorcycle + rider) ---
    let g = this.gfx();
    g.fillStyle(0x333333);
    g.fillCircle(10, 28, 10);
    g.fillCircle(50, 28, 10);
    g.lineStyle(1, 0x888888);
    g.strokeCircle(10, 28, 10);
    g.strokeCircle(50, 28, 10);
    g.fillStyle(0xcc3333);
    g.fillRect(12, 14, 36, 10);
    g.fillStyle(0x666666);
    g.fillRect(20, 18, 14, 10);
    g.fillStyle(0x888888);
    g.fillRect(44, 6, 4, 12);
    g.fillStyle(0x8B4513);
    g.fillRect(28, 0, 12, 14);
    g.fillStyle(0xffcc99);
    g.fillCircle(34, -4, 6);
    g.fillStyle(0xcc3333);
    g.fillRect(28, -10, 12, 6);
    g.fillStyle(0xcd853f);
    g.fillRect(14, 2, 10, 10);
    this.tex(g, 'player', 64, 40);

    // --- Player slide frame ---
    g = this.gfx();
    g.fillStyle(0x333333);
    g.fillCircle(10, 18, 10);
    g.fillCircle(50, 18, 10);
    g.lineStyle(1, 0x888888);
    g.strokeCircle(10, 18, 10);
    g.strokeCircle(50, 18, 10);
    g.fillStyle(0xcc3333);
    g.fillRect(12, 8, 36, 8);
    g.fillStyle(0x666666);
    g.fillRect(20, 10, 14, 8);
    g.fillStyle(0x8B4513);
    g.fillRect(28, 2, 16, 8);
    g.fillStyle(0xffcc99);
    g.fillCircle(46, 4, 5);
    this.tex(g, 'player_slide', 64, 30);

    // --- Normal Zombie ---
    g = this.gfx();
    g.fillStyle(0x4caf50);
    g.fillRect(8, 10, 16, 20);
    g.fillCircle(16, 6, 8);
    g.fillStyle(0x388e3c);
    g.fillRect(4, 14, 6, 14);
    g.fillRect(22, 12, 8, 4);
    g.fillStyle(0x2e7d32);
    g.fillRect(8, 30, 7, 10);
    g.fillRect(17, 30, 7, 10);
    g.fillStyle(0xff0000);
    g.fillCircle(13, 4, 2);
    g.fillCircle(19, 4, 2);
    this.tex(g, 'zombie_normal', 32, 42);

    // --- Runner Zombie ---
    g = this.gfx();
    g.fillStyle(0x8bc34a);
    g.fillRect(8, 10, 14, 18);
    g.fillCircle(15, 6, 7);
    g.fillStyle(0x689f38);
    g.fillRect(3, 12, 6, 12);
    g.fillRect(21, 10, 10, 4);
    g.fillStyle(0x558b2f);
    g.fillRect(8, 28, 6, 12);
    g.fillRect(16, 28, 6, 12);
    g.fillStyle(0xff0000);
    g.fillCircle(12, 4, 2);
    g.fillCircle(18, 4, 2);
    this.tex(g, 'zombie_runner', 32, 42);

    // --- Obstacle: barricade ---
    g = this.gfx();
    g.fillStyle(0x8B4513);
    g.fillRect(0, 0, 40, 30);
    g.fillStyle(0xffa500);
    g.fillRect(2, 4, 36, 6);
    g.fillRect(2, 16, 36, 6);
    g.fillStyle(0x654321);
    g.fillRect(4, 0, 6, 30);
    g.fillRect(30, 0, 6, 30);
    this.tex(g, 'obstacle_barricade', 40, 30);

    // --- Obstacle: broken road ---
    g = this.gfx();
    g.fillStyle(0x555555);
    g.fillTriangle(0, 20, 20, 0, 40, 20);
    g.fillStyle(0x444444);
    g.fillTriangle(5, 20, 20, 5, 35, 20);
    this.tex(g, 'obstacle_road', 40, 20);

    // --- Coin ---
    g = this.gfx();
    g.fillStyle(0xffd700);
    g.fillCircle(8, 8, 8);
    g.fillStyle(0xffaa00);
    g.fillCircle(8, 8, 5);
    g.fillStyle(0xffd700);
    g.fillRect(6, 4, 4, 8);
    this.tex(g, 'coin', 16, 16);

    // --- Fuel can ---
    g = this.gfx();
    g.fillStyle(0xff4444);
    g.fillRect(2, 4, 12, 14);
    g.fillStyle(0xcc0000);
    g.fillRect(4, 0, 8, 4);
    g.fillStyle(0xffffff);
    g.fillRect(6, 8, 4, 6);
    this.tex(g, 'fuel', 16, 18);

    // --- Health kit ---
    g = this.gfx();
    g.fillStyle(0xffffff);
    g.fillRect(1, 1, 14, 14);
    g.fillStyle(0xff0000);
    g.fillRect(6, 3, 4, 10);
    g.fillRect(3, 6, 10, 4);
    this.tex(g, 'health', 16, 16);

    // --- Weapon pickup (bat) ---
    g = this.gfx();
    g.fillStyle(0x8B4513);
    g.fillRect(2, 2, 6, 20);
    g.fillStyle(0xa0522d);
    g.fillRect(0, 0, 10, 8);
    this.tex(g, 'weapon_bat', 10, 22);

    // --- Attack swing effect ---
    g = this.gfx();
    g.lineStyle(3, 0xffffff, 0.8);
    g.beginPath();
    g.arc(0, 20, 30, -1.2, -0.3, false);
    g.strokePath();
    g.lineStyle(2, 0xffff00, 0.5);
    g.beginPath();
    g.arc(0, 20, 24, -1.0, -0.4, false);
    g.strokePath();
    this.tex(g, 'attack_swing', 40, 40);

    // --- Particle (white square) ---
    g = this.gfx();
    g.fillStyle(0xffffff);
    g.fillRect(0, 0, 4, 4);
    this.tex(g, 'particle', 4, 4);

    // --- Dust particle ---
    g = this.gfx();
    g.fillStyle(0xaa8866);
    g.fillCircle(3, 3, 3);
    this.tex(g, 'dust', 6, 6);

    // --- Blood particle ---
    g = this.gfx();
    g.fillStyle(0x8b0000);
    g.fillRect(0, 0, 4, 4);
    this.tex(g, 'blood', 4, 4);

    // --- Background: Sky ---
    g = this.gfx();
    g.fillStyle(COLORS.SKY_DARK);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    g.fillStyle(0xddddaa, 0.6);
    g.fillCircle(760, 80, 30);
    g.fillStyle(COLORS.SKY_DARK);
    g.fillCircle(770, 75, 26);
    g.fillStyle(0xffffff, 0.5);
    for (let i = 0; i < 40; i++) {
      g.fillRect(Math.random() * GAME_WIDTH, Math.random() * GAME_HEIGHT * 0.5, 2, 2);
    }
    this.tex(g, 'bg_sky', GAME_WIDTH, GAME_HEIGHT);

    // --- Background: Far buildings ---
    g = this.gfx();
    g.fillStyle(0x0f0f23, 0);
    g.fillRect(0, 0, GAME_WIDTH * 2, GAME_HEIGHT);
    g.fillStyle(0x222244);
    for (let i = 0; i < 20; i++) {
      const bx = i * 100 + Math.random() * 40;
      const bh = 80 + Math.random() * 160;
      const bw = 30 + Math.random() * 50;
      g.fillRect(bx, GAME_HEIGHT - bh - 120, bw, bh);
      g.fillStyle(0x334466, 0.3);
      for (let wy = GAME_HEIGHT - bh - 110; wy < GAME_HEIGHT - 130; wy += 14) {
        for (let wx = bx + 4; wx < bx + bw - 4; wx += 10) {
          if (Math.random() > 0.6) g.fillRect(wx, wy, 4, 6);
        }
      }
      g.fillStyle(0x222244);
    }
    this.tex(g, 'bg_far', GAME_WIDTH * 2, GAME_HEIGHT);

    // --- Background: Mid buildings ---
    g = this.gfx();
    g.fillStyle(0x0f0f23, 0);
    g.fillRect(0, 0, GAME_WIDTH * 2, GAME_HEIGHT);
    g.fillStyle(0x2a2a3e);
    for (let i = 0; i < 16; i++) {
      const bx = i * 130 + Math.random() * 30;
      const bh = 100 + Math.random() * 140;
      const bw = 40 + Math.random() * 60;
      g.fillRect(bx, GAME_HEIGHT - bh - 120, bw, bh);
      g.fillStyle(0x1a1a2e);
      for (let d = 0; d < 3; d++) {
        g.fillRect(bx + Math.random() * (bw - 8), GAME_HEIGHT - bh - 120 + Math.random() * bh, 4 + Math.random() * 8, 4 + Math.random() * 8);
      }
      g.fillStyle(0x2a2a3e);
    }
    g.fillStyle(0x444455, 0.3);
    for (let i = 0; i < 8; i++) {
      g.fillCircle(Math.random() * GAME_WIDTH * 2, 200 + Math.random() * 100, 20 + Math.random() * 30);
    }
    this.tex(g, 'bg_mid', GAME_WIDTH * 2, GAME_HEIGHT);

    // --- Background: Near buildings ---
    g = this.gfx();
    g.fillStyle(0x0f0f23, 0);
    g.fillRect(0, 0, GAME_WIDTH * 2, GAME_HEIGHT);
    g.fillStyle(0x333348);
    for (let i = 0; i < 12; i++) {
      const bx = i * 170 + Math.random() * 40;
      const bh = 60 + Math.random() * 100;
      const bw = 50 + Math.random() * 80;
      g.fillRect(bx, GAME_HEIGHT - bh - 120, bw, bh);
      g.fillStyle(0x445566, 0.4);
      for (let wy = GAME_HEIGHT - bh - 110; wy < GAME_HEIGHT - 130; wy += 18) {
        for (let wx = bx + 6; wx < bx + bw - 6; wx += 14) {
          if (Math.random() > 0.4) g.fillRect(wx, wy, 8, 10);
        }
      }
      g.fillStyle(0x333348);
    }
    this.tex(g, 'bg_near', GAME_WIDTH * 2, GAME_HEIGHT);

    // --- Background: Ground / Road ---
    g = this.gfx();
    g.fillStyle(0x555555);
    g.fillRect(0, 0, GAME_WIDTH * 2, 10);
    g.fillStyle(COLORS.ROAD_GRAY);
    g.fillRect(0, 10, GAME_WIDTH * 2, 110);
    g.fillStyle(0x666655);
    for (let i = 0; i < 40; i++) {
      g.fillRect(i * 50, 60, 30, 4);
    }
    g.fillStyle(0x444444);
    g.fillRect(0, 110, GAME_WIDTH * 2, 10);
    this.tex(g, 'bg_ground', GAME_WIDTH * 2, 120);
  }
}

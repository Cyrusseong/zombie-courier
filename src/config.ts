import Phaser from 'phaser';

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const COLORS = {
  BG_DARK: 0x1a1a2e,
  BG_MID: 0x16213e,
  NEON_GREEN: 0x39ff14,
  DANGER_RED: 0xff3333,
  COIN_GOLD: 0xffd700,
  ITEM_BLUE: 0x00bfff,
  UI_WHITE: 0xffffff,
  ZOMBIE_GREEN: 0x4caf50,
  ROAD_GRAY: 0x3a3a3a,
  SKY_DARK: 0x0f0f23,
};

export const PLAYER = {
  START_X: 150,
  GROUND_Y: 420,
  JUMP_VELOCITY: -550,
  GRAVITY: 1200,
  MAX_HP: 3,
  BASE_SPEED: 300,
  SLIDE_DURATION: 500,
  ATTACK_RANGE: 80,
  ATTACK_DAMAGE: 1,
  ATTACK_COOLDOWN: 300,
  INVINCIBLE_DURATION: 1000,
};

export const SPAWN = {
  ZOMBIE_INTERVAL_BASE: 2000,
  OBSTACLE_INTERVAL_BASE: 2500,
  COIN_INTERVAL: 800,
  FUEL_INTERVAL: 8000,
  HEALTH_INTERVAL: 15000,
  MIN_INTERVAL: 500,
};

export const DIFFICULTY = {
  SPEED_INCREMENT: 5,
  SPEED_MAX: 600,
  INTERVAL_DECAY: 0.98,
  ZONE_DISTANCE: [0, 500, 1500, 3000, 5000],
};

export const ZOMBIE_TYPES = {
  NORMAL: { speed: 80, hp: 1, score: 50, color: 0x4caf50 },
  RUNNER: { speed: 180, hp: 2, score: 100, color: 0x8bc34a },
  FAT: { speed: 50, hp: 3, score: 150, color: 0x2e7d32, scale: 1.5 },
  CRAWLER: { speed: 60, hp: 1, score: 80, color: 0x1b5e20 },
};

export const PHASER_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: COLORS.BG_DARK,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: PLAYER.GRAVITY },
      debug: false,
    },
  },
  input: {
    activePointers: 2,
  },
  render: {
    pixelArt: true,
    antialias: false,
  },
};

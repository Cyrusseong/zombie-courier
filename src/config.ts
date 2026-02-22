import Phaser from 'phaser';

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

// ═══════════════════════════════════════════════════
//  RETRO COLOR PALETTE - CRT Terminal / Arcade Style
// ═══════════════════════════════════════════════════
export const COLORS = {
  // Backgrounds
  BG_DARK: 0x0a0a12,         // Deep CRT black
  BG_MID: 0x0d1117,          // Dark terminal
  BG_PANEL: 0x111820,        // Panel background

  // CRT Phosphor Greens
  CRT_GREEN: 0x00ff41,       // Classic CRT phosphor green
  CRT_GREEN_DIM: 0x00aa2a,   // Dimmed green
  CRT_GREEN_GLOW: 0x33ff66,  // Bright green glow

  // Amber Terminal
  AMBER: 0xffb000,           // Classic amber terminal
  AMBER_DIM: 0xcc8800,       // Dim amber
  AMBER_GLOW: 0xffc933,      // Bright amber glow

  // Danger / Blood
  DANGER_RED: 0xff2222,      // Bright arcade red
  BLOOD_RED: 0x8b0000,       // Dark blood
  DANGER_GLOW: 0xff4444,     // Red glow

  // Accents
  COIN_GOLD: 0xffd700,       // Classic gold
  ITEM_BLUE: 0x00ccff,       // Cyan power-up
  NEON_PINK: 0xff00aa,       // Neon accent
  NEON_PURPLE: 0xaa44ff,     // Purple accent

  // UI
  UI_WHITE: 0xcccccc,        // Slightly dimmed white (CRT feel)
  UI_BRIGHT: 0xffffff,       // Full white for emphasis
  UI_DIM: 0x556666,          // Dim text

  // Game Objects
  ZOMBIE_GREEN: 0x44bb44,    // Zombie body
  ZOMBIE_DARK: 0x227722,     // Zombie shadow
  ROAD_GRAY: 0x2a2a2a,       // Dark road
  SKY_DARK: 0x060610,        // Night sky - very dark

  // Retro Neon (for signs and effects)
  NEON_GREEN: 0x39ff14,      // Keep for compatibility
  NEON_BLUE: 0x00ddff,
  NEON_RED: 0xff1744,
};

// CRT Effect Constants
export const CRT = {
  SCANLINE_ALPHA: 0.08,       // Scanline opacity
  SCANLINE_GAP: 3,            // Pixels between scanlines
  VIGNETTE_STRENGTH: 0.4,     // Edge darkening
  FLICKER_RANGE: 0.02,        // Screen flicker amount
  GLOW_BLUR: 2,               // Phosphor glow intensity
  NOISE_ALPHA: 0.03,          // Static noise amount
  CHROMATIC_OFFSET: 1,        // RGB offset pixels
};

// Retro UI Constants
export const RETRO_UI = {
  BORDER_WIDTH: 2,
  PIXEL_SCALE: 2,
  CORNER_SIZE: 4,
  SCORE_DIGITS: 8,            // Leading zero padded score
  BLINK_SPEED: 500,           // ms for blinking text
  TYPEWRITER_SPEED: 50,       // ms per character
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
  NORMAL: { speed: 80, hp: 1, score: 50, color: 0x44bb44 },
  RUNNER: { speed: 180, hp: 2, score: 100, color: 0x88cc44 },
  FAT: { speed: 50, hp: 3, score: 150, color: 0x227722, scale: 1.5 },
  CRAWLER: { speed: 60, hp: 1, score: 80, color: 0x115511 },
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
    activePointers: 3,
  },
  render: {
    pixelArt: true,
    antialias: false,
  },
};

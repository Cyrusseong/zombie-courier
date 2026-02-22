import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

export interface GameInputState {
  jump: boolean;
  slide: boolean;
  attack: boolean;
}

export class InputManager {
  private scene: Phaser.Scene;
  private keys: {
    up: Phaser.Input.Keyboard.Key;
    w: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    j: Phaser.Input.Keyboard.Key;
  } | null = null;

  private touchJump = false;
  private touchAttack = false;

  // Track which pointer ID is doing slide (for multi-touch correctness)
  private slidePointerId: number = -1;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupKeyboard();
    this.setupTouch();
  }

  private setupKeyboard(): void {
    const kb = this.scene.input.keyboard;
    if (!kb) return;

    this.keys = {
      up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      w: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      space: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      s: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      j: kb.addKey(Phaser.Input.Keyboard.KeyCodes.J),
    };
  }

  private setupTouch(): void {
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Use game coordinates (GAME_WIDTH/GAME_HEIGHT) consistently.
      // Phaser FIT mode auto-transforms pointer.x/y to game coordinates.
      const midY = GAME_HEIGHT * 0.5;
      const attackX = GAME_WIDTH * 0.6;

      if (pointer.y < midY) {
        // Top half → jump
        this.touchJump = true;
      } else if (pointer.x > attackX) {
        // Bottom-right → attack
        this.touchAttack = true;
      } else {
        // Bottom-left → slide (hold)
        this.slidePointerId = pointer.id;
      }
    });

    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      // Only release slide if the SAME pointer that started it is released
      if (pointer.id === this.slidePointerId) {
        this.slidePointerId = -1;
      }
    });
  }

  getState(): GameInputState {
    const state: GameInputState = {
      jump: false,
      slide: false,
      attack: false,
    };

    // Keyboard
    if (this.keys) {
      state.jump = Phaser.Input.Keyboard.JustDown(this.keys.up)
        || Phaser.Input.Keyboard.JustDown(this.keys.w)
        || Phaser.Input.Keyboard.JustDown(this.keys.space);

      state.slide = this.keys.down.isDown || this.keys.s.isDown;

      state.attack = Phaser.Input.Keyboard.JustDown(this.keys.j);
    }

    // Touch (merge)
    if (this.touchJump) {
      state.jump = true;
      this.touchJump = false;
    }
    if (this.slidePointerId >= 0) {
      state.slide = true;
    }
    if (this.touchAttack) {
      state.attack = true;
      this.touchAttack = false;
    }

    return state;
  }

  destroy(): void {
    this.scene.input.off('pointerdown');
    this.scene.input.off('pointerup');
    this.slidePointerId = -1;
  }
}

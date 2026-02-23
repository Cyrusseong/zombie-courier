import Phaser from 'phaser';
import { HUD } from '../ui/HUD';

export interface GameInputState {
  jump: boolean;
  slide: boolean;
  attack: boolean;
}

export class InputManager {
  private scene: Phaser.Scene;
  private hud: HUD | null = null;

  private keys: {
    up: Phaser.Input.Keyboard.Key;
    w: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    j: Phaser.Input.Keyboard.Key;
  } | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupKeyboard();
  }

  // Called from GameScene after HUD is created
  linkHUD(hud: HUD): void {
    this.hud = hud;
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

  getState(): GameInputState {
    const state: GameInputState = {
      jump: false,
      slide: false,
      attack: false,
    };

    // Keyboard input
    if (this.keys) {
      state.jump = Phaser.Input.Keyboard.JustDown(this.keys.up)
        || Phaser.Input.Keyboard.JustDown(this.keys.w)
        || Phaser.Input.Keyboard.JustDown(this.keys.space);

      state.slide = this.keys.down.isDown || this.keys.s.isDown;

      state.attack = Phaser.Input.Keyboard.JustDown(this.keys.j);
    }

    // HUD button state (mobile)
    if (this.hud) {
      if (this.hud.jumpPressed) state.jump = true;
      if (this.hud.slideHeld) state.slide = true;
      if (this.hud.attackPressed) state.attack = true;
    }

    return state;
  }

  destroy(): void {
    // Keyboard keys cleanup handled by Phaser scene shutdown
  }
}

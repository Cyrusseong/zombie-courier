import Phaser from 'phaser';
import { GAME_HEIGHT } from '../config';

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
  private touchSlide = false;
  private touchAttack = false;
  private isMobile: boolean;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.isMobile = !scene.sys.game.device.os.desktop;
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
      const midY = GAME_HEIGHT * 0.5;
      const midX = this.scene.scale.width * 0.6;

      if (pointer.y < midY) {
        this.touchJump = true;
      } else if (pointer.x > midX) {
        this.touchAttack = true;
      } else {
        this.touchSlide = true;
      }
    });

    this.scene.input.on('pointerup', () => {
      this.touchSlide = false;
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
    if (this.touchSlide) {
      state.slide = true;
    }
    if (this.touchAttack) {
      state.attack = true;
      this.touchAttack = false;
    }

    // Mouse click = attack on desktop
    if (!this.isMobile && this.scene.input.activePointer.isDown
      && Phaser.Input.Keyboard.JustDown === Phaser.Input.Keyboard.JustDown) {
      // handled by pointerdown above
    }

    return state;
  }

  destroy(): void {
    this.scene.input.off('pointerdown');
    this.scene.input.off('pointerup');
  }
}

import Phaser from 'phaser';
import { PHASER_CONFIG } from './config';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';

const config: Phaser.Types.Core.GameConfig = {
  ...PHASER_CONFIG,
  scene: [BootScene, MenuScene, GameScene, GameOverScene],
};

new Phaser.Game(config);

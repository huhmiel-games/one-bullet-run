import 'phaser';
import { WIDTH, HEIGHT, GAME_TITLE, GRAVITY } from './constant/config';

import LogoScene from './scenes/LogoScene';
import LoadingScene from './scenes/LoadingScene';
import HudScene from './scenes/HudScene';
import GameScene from './scenes/GameScene';
import GameOverScene from './scenes/GameOverScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    width: WIDTH,
    height: HEIGHT,
    title: GAME_TITLE,
    pixelArt: true,
    scale: {
        autoCenter: Phaser.Scale.Center.CENTER_HORIZONTALLY,
        mode: Phaser.Scale.ScaleModes.FIT,
        autoRound: true,
    },
    physics: {
        default: 'arcade',
        arcade: {
            tileBias: 10,
            gravity: {
                y: GRAVITY
            },
            debug: false,
            debugShowBody: true,
            debugShowStaticBody: true,
        },
    },
    scene: [
        LogoScene,
        LoadingScene,
        GameScene,
        HudScene,
        GameOverScene
    ],
};

const game = new Phaser.Game(config);

import { Scene } from 'phaser';
import { COLOR } from '../constant/color';
import { FONT, FONT_SIZE, HEIGHT, SCENE_NAME, WIDTH } from '../constant/config';
import GameScene from './GameScene';


/**
 * @description a hud scene example
 * @author © Philippe Pereira 2020
 * @export
 * @class HudScene
 * @extends {Scene}
 */
export default class HudScene extends Scene
{
    private mainScene: GameScene;
    private coinText: Phaser.GameObjects.BitmapText;
    private speedText: Phaser.GameObjects.BitmapText;

    constructor ()
    {
        super({ key: SCENE_NAME.HUD as string, active: false });
    }

    public create (): void
    {
        this.mainScene = this.scene.get(SCENE_NAME.GAME) as GameScene;

        this.scene.bringToTop(SCENE_NAME.HUD);

        this.cameras.main.setPosition(0, 0)
            .setSize(WIDTH, HEIGHT / 8)
            .setAlpha(0);

        this.coinText = this.add.bitmapText(WIDTH / 12 + 16, HEIGHT / 16, FONT, '0 points', FONT_SIZE, 0)
            .setOrigin(0.5, 0.5).setTintFill(COLOR.WHITE);
        
        this.speedText = this.add.bitmapText(WIDTH - 48, HEIGHT / 16, FONT, 'speed : 90', FONT_SIZE, 0)
        .setOrigin(0.5, 0.5).setTintFill(COLOR.WHITE);

        this.mainScene.events.on('setCoin', (coin: number ) =>
        {
            this.coinText.setText(`${coin.toString()} points`);
        });

        this.mainScene.events.on('setSpeed', (speed: number ) =>
        {
            this.speedText.setText(`speed: ${speed.toString()}`);
        });

        this.showHud();
    }

    private showHud (): void
    {
        this.cameras.main.setAlpha(1);
    }
}

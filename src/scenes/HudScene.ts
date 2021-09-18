import { Scene } from 'phaser';
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

        this.coinText = this.add.bitmapText(WIDTH / 12 + 16, HEIGHT / 16, FONT, '0', FONT_SIZE, 1)
            .setOrigin(0.5, 0.5);

        this.add.image(WIDTH / 12, HEIGHT / 16 - 3, 'coin', 6).setScale(0.6);

        this.mainScene.events.on('setCoin', (coin: number ) =>
        {
            this.coinText.setText(coin.toString());
        });

        this.showHud();
    }

    private showHud (): void
    {
        this.cameras.main.setAlpha(1);
    }
}

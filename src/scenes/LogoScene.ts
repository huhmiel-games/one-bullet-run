import { Scene } from 'phaser';
import { WIDTH, HEIGHT, FONT, FONT_SIZE, SCENE_NAME } from '../constant/config';

// import needed assets files
import progressBar from '../assets/ui/progress-bar.png';
import progressBarBg from '../assets/ui/progress-bar-bg.png';
import galaxy8 from '../assets/fonts/galaxy/galaxy8.png';
import galaxy8XML from '../assets/fonts/galaxy/galaxy8.xml';
import background from '../assets/graphics/background.png';
import { COLOR } from '../constant/color';

/**
 * @description a logo scene example, this is the first scene to load
 * @author © Philippe Pereira 2020
 * @export
 * @class LogoScene
 * @extends {Scene}
 */
export default class LogoScene extends Scene
{
    constructor ()
    {
        super({
            key: SCENE_NAME.LOGO as string
        });
    }

    public preload (): void
    {
        // Preload assets needed for this scene and the loading scene
        this.load.image('progressBar', progressBar);
        this.load.image('progressBarBg', progressBarBg);
        this.load.bitmapFont('galaxy8', galaxy8, galaxy8XML);
        this.load.image('background', background);
    }

    public create (): void
    {
        this.cameras.main.setRoundPixels(true).setBackgroundColor(COLOR.DARK);

        const sceneTitleText: Phaser.GameObjects.BitmapText = this.add.bitmapText(WIDTH / 2, HEIGHT / 2, FONT, 'huhmiel games', FONT_SIZE, 1)
            .setOrigin(0.5, 0.5)
            .setAlpha(0)
            .setTintFill(COLOR.WHITE);

        const tweenSceneTitleText: Phaser.Tweens.Tween = this.tweens.add({
            targets: sceneTitleText,
            ease: 'Sine.easeInOut',
            duration: 2000,
            delay: 1000,
            repeat: 0,
            yoyo: true,
            alpha: {
                getStart: () => 0,
                getEnd: () => 1,
            },
            onComplete: () =>
            {
                this.scene.start(SCENE_NAME.LOADING);
            },
        });

        // to skip this scene
        // handle click events on mobile
        const { android, iOS } = this.sys.game.device.os;

        if (android || iOS)
        {
            this.input.once(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) =>
            {
                if (pointer.leftButtonDown())
                {
                    tweenSceneTitleText.stop();

                    this.scene.start(SCENE_NAME.LOADING);
                }
            });
        }
        else
        {
            this.input.keyboard.once(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, () =>
            {
                tweenSceneTitleText.stop();

                this.scene.start(SCENE_NAME.LOADING);
            });
        }
    }
}

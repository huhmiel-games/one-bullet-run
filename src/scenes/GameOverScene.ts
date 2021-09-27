import { Scene } from 'phaser';
import { COLOR } from '../constant/color';
import { FONT, FONT_SIZE, HEIGHT, WIDTH, SCENE_NAME } from '../constant/config';
import GameScene from './GameScene';

interface IScore
{
    score: number;
    speed: number;
}

/**
 * @description a game over scene example
 * @author © Philippe Pereira 2020
 * @export
 * @class GameOverScene
 * @extends {Scene}
 */
export default class GameOverScene extends Scene
{
    private mainScene: GameScene;
    constructor ()
    {
        super({
            key: SCENE_NAME.GAME_OVER
        });
    }

    public create (): void
    {
        this.scene.stop(SCENE_NAME.HUD);

        this.mainScene = this.scene.get(SCENE_NAME.GAME) as GameScene;

        const currentScore: number = this.mainScene.player.getCoinCount();

        const currentSpeed: number = this.mainScene.speed;

        const highScoreStored = localStorage.getItem('highScore');

        if (!highScoreStored)
        {
            // create empty high score
            const data = JSON.stringify([{ score: currentScore, speed: this.mainScene.speed }]);

            localStorage.setItem('highScore', data);

            this.add.bitmapText(WIDTH / 2, HEIGHT / 3, FONT, `new high score : ${this.mainScene.player.getCoinCount().toString()} points at speed ${currentSpeed.toString()}`, FONT_SIZE, 1)
                .setOrigin(0.5, 0.5);
        }
        else
        {
            const data: IScore[] = JSON.parse(highScoreStored);

            // update old high scores
            if (typeof data[0] === 'number')
            {
                const _data = data as unknown as number[];

                _data.forEach((e, i) =>
                {
                    const val: IScore = { score: e, speed: 90 };

                    data[i] = val;
                });
            }

            // show saved high score
            for (let i = 0; i < data.length; i++)
            {
                const str = `${i + 1} : ${data[i].score} points at speed ${data[i].speed}`;

                this.add.bitmapText(WIDTH / 5, HEIGHT / 3 + 32 + (i * 12), FONT, str, FONT_SIZE, 1)
                    .setOrigin(0, 0.5)
                    .setTintFill(COLOR.WHITE);
            }

            // new high score
            if (currentScore > data[data.length - 1].score || data.length < 5)
            {
                data.push({ score: currentScore, speed: currentSpeed });
                data.sort((a: IScore, b: IScore) => b.score - a.score);

                if (data.length > 5)
                {
                    data.pop();
                }

                const newData = JSON.stringify(data);

                localStorage.setItem('highScore', newData);

                this.add.bitmapText(WIDTH / 2, HEIGHT / 3, FONT, `new high score : ${this.mainScene.player.getCoinCount().toString()} points at speed ${currentSpeed.toString()}`, FONT_SIZE, 1)
                    .setOrigin(0.5, 0.5).setTintFill(COLOR.WHITE);
            }
            else
            {
                this.add.bitmapText(WIDTH / 2, HEIGHT / 3, FONT, `score : ${this.mainScene.player.getCoinCount().toString()} points at speed ${currentSpeed.toString()}`, FONT_SIZE, 1)
                    .setOrigin(0.5, 0.5).setTintFill(COLOR.WHITE);
            }

        }

        this.add.bitmapText(WIDTH / 2, HEIGHT / 4, FONT, 'game over', FONT_SIZE * 2, 1)
            .setOrigin(0.5, 0.5).setTintFill(COLOR.GREEN_LIGHT);

        this.add.bitmapText(WIDTH / 2, HEIGHT / 3 + 16, FONT, 'high scores', FONT_SIZE, 1)
            .setOrigin(0.5, 0.5).setTintFill(COLOR.GREEN_LIGHT);

        const { android, iOS } = this.sys.game.device.os;

        if (android || iOS)
        {
            this.add.bitmapText(WIDTH / 2, HEIGHT / 6 * 5, FONT, 'touch to retry', FONT_SIZE, 1)
                .setOrigin(0.5, 0.5).setTintFill(COLOR.GREEN);
        }
        else
        {
            this.add.bitmapText(WIDTH / 2, HEIGHT / 6 * 5, FONT, 'press up key to retry', FONT_SIZE, 1)
                .setOrigin(0.5, 0.5).setTintFill(COLOR.GREEN);
        }

        // fading the scene from black
        this.cameras.main.fadeIn(500).setBackgroundColor(COLOR.DARK);

        // handle click events on mobile
        if (android || iOS)
        {
            this.input.once(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) =>
            {
                if (pointer.leftButtonDown())
                {
                    this.scene.start(SCENE_NAME.GAME);
                }
            });
        }
        else
        {
            this.input.keyboard.once(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, () =>
            {
                this.scene.start(SCENE_NAME.GAME);
            });
        }
    }
}

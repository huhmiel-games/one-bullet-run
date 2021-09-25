import { Scene } from 'phaser';
import { COLOR } from '../constant/color';
import { FONT, FONT_SIZE, HEIGHT, WIDTH, SCENE_NAME } from '../constant/config';
import GameScene from './GameScene';


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

        const currentScore = this.mainScene.player.getCoinCount();

        const highScoreStored = localStorage.getItem('highScore');

        if (!highScoreStored)
        {
            const data = JSON.stringify([currentScore]);
            localStorage.setItem('highScore', data);

            this.add.bitmapText(WIDTH / 2, HEIGHT / 3, FONT, `new high score : ${this.mainScene.player.getCoinCount().toString()} points`, FONT_SIZE, 1)
                .setOrigin(0.5, 0.5);
        }
        else
        {
            const data: number[] = JSON.parse(highScoreStored);

            for (let i = 0; i < data.length; i++)
            {
                const str = `${i + 1} :     ${data[i]} points`;
                this.add.bitmapText(WIDTH / 2, HEIGHT / 3 + 32 + (i * 12), FONT, str, FONT_SIZE, 1)
                    .setOrigin(0.5, 0.5)
                    .setTintFill(COLOR.WHITE);
            }

            if (currentScore > data[data.length - 1] || data.length < 5)
            {
                data.push(currentScore);
                data.sort((a: number, b: number) => b - a);
                if (data.length > 5)
                {
                    data.pop();
                }
                
                const newData = JSON.stringify(data);
                localStorage.setItem('highScore', newData);

                this.add.bitmapText(WIDTH / 2, HEIGHT / 3, FONT, `new high score : ${this.mainScene.player.getCoinCount().toString()} points`, FONT_SIZE, 1)
                .setOrigin(0.5, 0.5).setTintFill(COLOR.WHITE);
            }
            else
            {
                this.add.bitmapText(WIDTH / 2, HEIGHT / 3, FONT, `score : ${this.mainScene.player.getCoinCount().toString()} points`, FONT_SIZE, 1)
                .setOrigin(0.5, 0.5).setTintFill(COLOR.WHITE);
            }
            
        }

        this.add.bitmapText(WIDTH / 2, HEIGHT / 4, FONT, 'game over', FONT_SIZE * 2, 1)
            .setOrigin(0.5, 0.5).setTintFill(COLOR.GREEN_LIGHT);
        
        this.add.bitmapText(WIDTH / 2, HEIGHT / 3 + 16, FONT, 'high scores', FONT_SIZE, 1)
            .setOrigin(0.5, 0.5).setTintFill(COLOR.GREEN_LIGHT);
        
        // this.add.bitmapText(WIDTH / 2, HEIGHT / 3, FONT, `${this.mainScene.player.getCoinCount().toString()} coins`, FONT_SIZE, 1)
        //     .setOrigin(0.5, 0.5);
        
        
        this.add.bitmapText(WIDTH / 2, HEIGHT / 6 * 5, FONT, 'press up key to retry', FONT_SIZE, 1)
            .setOrigin(0.5, 0.5).setTintFill(COLOR.GREEN);

        // fading the scene from black
        this.cameras.main.fadeIn(500).setBackgroundColor(COLOR.DARK);

        // handle click events on mobile
        const { android, iOS } = this.sys.game.device.os;

        if (android || iOS)
        {
            this.input.once('pointerdown', (pointer: Phaser.Input.Pointer) =>
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

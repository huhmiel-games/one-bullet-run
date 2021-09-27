import { Scene } from 'phaser';
import { FONT, FONT_SIZE, HEIGHT, SCENE_NAME, WIDTH } from '../constant/config';
import tiles from '../assets/graphics/tiles-extruded.png';
import atlas from '../assets/graphics/atlas.png';
import atlasJSON from '../assets/graphics/atlas.json';
import map1 from '../assets/map/map1.json';
import map2 from '../assets/map/map2.json';
import music from '../assets/music/lights-out.ogg';
import victoryTheme from '../assets/music/VictoryTheme.ogg';
import gameOverTheme from '../assets/music/GameOverTheme.ogg';
import blipSfx from '../assets/sfx/blipSfx.wav';
import jumpSfx from '../assets/sfx/jumpSfx.wav';
import coinSfx from '../assets/sfx/coinSfx.wav';
import explosionSfx from '../assets/sfx/explosionSfx.wav';
import shootSfx from '../assets/sfx/shootSfx.wav';
import button from '../assets/ui/button.png';

import { COLOR } from '../constant/color';

/**
 * @description handle the preload of all assets
 * @author © Philippe Pereira 2020
 * @export
 * @class LoadingScene
 * @extends {Scene}
 */
export default class LoadingScene extends Scene
{
    constructor ()
    {
        super({
            key: SCENE_NAME.LOADING as string,
            pack: {
                files: [{
                    key: 'background',
                    type: 'image'
                }, {
                    key: 'progressBar',
                    type: 'image'
                }, {
                    key: 'progressBarBg',
                    type: 'image'
                }]
            } as any
        });
    }

    public preload (): void
    {
        //  Display cover and progress bar textures.
        this.showCover();
        this.showProgressBar();

        // Preload all assets here, ex:
        this.load.atlas('atlas', atlas, atlasJSON);
        this.load.image('tiles', tiles);
        this.load.image('button', button);
        this.load.tilemapTiledJSON('map1', map1);
        this.load.tilemapTiledJSON('map2', map2);
        this.load.audio('music', music);
        this.load.audio('victoryTheme', victoryTheme);
        this.load.audio('gameOverTheme', gameOverTheme);
        this.load.audio('blipSfx', blipSfx);
        this.load.audio('jumpSfx', jumpSfx);
        this.load.audio('coinSfx', coinSfx);
        this.load.audio('explosionSfx', explosionSfx);
        this.load.audio('shootSfx', shootSfx);
    }

    public create (): void
    {
        this.cameras.main.setRoundPixels(true);

        this.anims.create({
            key: 'player-walk',
            frames: this.anims.generateFrameNames('atlas', { prefix: 'player-walk_', start: 0, end: 3 }),
            frameRate: 8,
            yoyo: false,
            repeat: -1,
        });

        this.anims.create({
            key: 'player-jump',
            frames: this.anims.generateFrameNames('atlas', { prefix: 'player-jump_', start: 0, end: 0 }),
            frameRate: 6,
            yoyo: false,
            repeat: -1,
        });

        this.anims.create({
            key: 'player-fall',
            frames: this.anims.generateFrameNames('atlas', { prefix: 'player-jump_', start: 1, end: 4 }),
            frameRate: 6,
            yoyo: false,
            repeat: -1,
        });

        this.anims.create({
            key: 'player-land',
            frames: this.anims.generateFrameNames('atlas', { prefix: 'player-jump_', start: 5, end: 6 }),
            frameRate: 24,
            yoyo: false,
            repeat: 0,
        });

        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNames('atlas', { prefix: 'explosion_', start: 0, end: 8 }),
            frameRate: 8,
            yoyo: false,
            repeat: 0,
            hideOnComplete: true
        });

        this.anims.create({
            key: 'coin',
            frames: this.anims.generateFrameNames('atlas', { prefix: 'coin_', start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'badIdle',
            frames: this.anims.generateFrameNames('atlas', { prefix: 'bad-idle_', start: 0, end: 5 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'badShoot',
            frames: this.anims.generateFrameNames('atlas', { prefix: 'bad-shoot_', start: 0, end: 5 }),
            frameRate: 8,
            repeat: 0,
        });
    }

    /**
     * Display cover
     */
    private showCover (): void
    {
        this.cameras.main.setRoundPixels(true).setBackgroundColor(COLOR.DARK);

        this.add.image(WIDTH / 2, HEIGHT / 2, 'background');

        // progress bar white background
        this.add.image(WIDTH / 2, HEIGHT / 4 * 3 + 2, 'progressBarBg')
            .setDisplaySize(WIDTH / 4 * 3, 6)
            .setVisible(true)
            .setName('progressBarBg');
    }

    /**
     * Display progress bar and percentage text
     */
    private showProgressBar (): void
    {
        //  Get the progress bar filler texture dimensions.
        const { width: w, height: h } = this.textures.get('progressBar').get();

        //  Place the filler over the progress bar of the splash screen.
        const img: Phaser.GameObjects.Sprite = this.add.sprite(WIDTH / 2, HEIGHT / 4 * 3, 'progressBar')
            .setOrigin(0.5, 0)
            .setDisplaySize(WIDTH / 4 * 3 - 2, 4);

        // Add percentage text
        const loadingpercentage: Phaser.GameObjects.BitmapText = this.add.bitmapText(WIDTH / 2, HEIGHT - HEIGHT / 3, FONT, 'loading:', FONT_SIZE, 1)
            .setOrigin(0.5, 0.5)
            .setAlpha(1)
            .setDepth(10)
            .setTintFill(COLOR.WHITE);

        //  Crop the filler along its width, proportional to the amount of files loaded.
        this.load.on(Phaser.Loader.Events.PROGRESS, (progress: number) =>
        {
            loadingpercentage.text = `loading: ${Math.round(progress * 100)}%`;

            img.setCrop(0, 0, Math.ceil(progress * w), h);

            if (Math.round(progress * 100) === 100)
            {
                loadingpercentage.text = 'processing audio, please wait';
            }

        }).on(Phaser.Loader.Events.COMPLETE, () =>
        {
            const { android, iOS } = this.sys.game.device.os;

            if (android || iOS)
            {
                const bg = this.children.getByName('progressBarBg') as unknown as Phaser.GameObjects.Sprite;
                bg.setVisible(false);

                img.setVisible(false);

                loadingpercentage.text = '';

                this.add.image(WIDTH / 2, HEIGHT / 3 * 2, 'button');
            }
            else
            {
                loadingpercentage.text = 'press up key to start';
            }

            this.startGameScene();
        });
    }

    private startGameScene (): void
    {
        // handle click events on mobile
        const { android, iOS } = this.sys.game.device.os;

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
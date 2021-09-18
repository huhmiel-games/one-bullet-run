import { Scene } from 'phaser';
import { FONT, FONT_SIZE, HEIGHT, SCENE_NAME, WIDTH } from '../constant/config';
import tiles from '../assets/graphics/tiles.png';
import playerAtlas from '../assets/graphics/player-atlas.png';
import playerAtlasJSON from '../assets/graphics/player-atlas.json';
import bullet from '../assets/graphics/bullet.png';
import explosion from '../assets/graphics/explosion.png';
import coin from '../assets/graphics/coin.png';
import map1 from '../assets/map/map1.json';
import map2 from '../assets/map/map2.json';
import map3 from '../assets/map/map3.json';
import map4 from '../assets/map/map4.json';
import blipSfx from '../assets/sfx/blipSfx.wav';
import jumpSfx from '../assets/sfx/jumpSfx.wav';
import coinSfx from '../assets/sfx/coinSfx.wav';
import explosionSfx from '../assets/sfx/explosionSfx.wav';

import { COLOR } from '../constant/color';

/**
 * @description a loading scene example, handle the preload of all assets
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
                    key: 'logo',
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
        this.load.atlas('playerAtlas', playerAtlas, playerAtlasJSON);
        this.load.spritesheet('explosion', explosion, { frameWidth: 112, frameHeight: 128 });
        this.load.spritesheet('coin', coin, { frameWidth: 16, frameHeight: 16 });
        this.load.image('tiles', tiles);
        this.load.image('bullet', bullet);
        this.load.tilemapTiledJSON('map1', map1);
        this.load.tilemapTiledJSON('map2', map2);
        this.load.tilemapTiledJSON('map3', map3);
        this.load.tilemapTiledJSON('map4', map4);
        this.load.audio('blipSfx', blipSfx);
        this.load.audio('jumpSfx', jumpSfx);
        this.load.audio('coinSfx', coinSfx);
        this.load.audio('explosionSfx', explosionSfx);
    }

    public create (): void
    {
        this.cameras.main.setRoundPixels(true);

        this.anims.create({
            key: 'player-walk',
            frames: this.anims.generateFrameNames('playerAtlas', { prefix: 'player-walk_', start: 0, end: 3 }),
            frameRate: 8,
            yoyo: false,
            repeat: -1,
        });

        this.anims.create({
            key: 'player-jump',
            frames: this.anims.generateFrameNames('playerAtlas', { prefix: 'player-jump_', start: 0, end: 4 }),
            frameRate: 6,
            yoyo: false,
            repeat: -1,
        });

        this.anims.create({
            key: 'player-land',
            frames: this.anims.generateFrameNames('playerAtlas', { prefix: 'player-jump_', start: 5, end: 6 }),
            frameRate: 24,
            yoyo: false,
            repeat: 0,
        });

        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 9 }),
            frameRate: 8,
            yoyo: false,
            repeat: 0,
        });

        this.anims.create({
            key: 'coin',
            frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });


    }

    /**
     * Display cover
     */
    private showCover (): void
    {
        this.cameras.main.setRoundPixels(true);

        this.add.image(WIDTH / 2, HEIGHT / 2, 'background');

        // progress bar white background
        this.add.image(WIDTH / 2, HEIGHT / 4 * 3 + 2, 'progressBarBg')
            .setDisplaySize(WIDTH / 4 * 3, 6)
            .setVisible(true);
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
        const loadingpercentage: Phaser.GameObjects.BitmapText = this.add.bitmapText(WIDTH / 2, HEIGHT - HEIGHT / 8, FONT, 'loading:', FONT_SIZE, 1)
            .setOrigin(0.5, 0.5)
            .setAlpha(1)
            .setTintFill(COLOR.GREEN);

        //  Crop the filler along its width, proportional to the amount of files loaded.
        this.load.on('progress', (progress: number) =>
        {
            loadingpercentage.text = `loading: ${Math.round(progress * 100)}%`;

            img.setCrop(0, 0, Math.ceil(progress * w), h);

        }).on('complete', () =>
        {
            loadingpercentage.text = 'press up key to start';

            this.startGameScene();
        });
    }

    private startGameScene (): void
    {
        this.input.keyboard.once('keydown', () =>
        {
            this.scene.start(SCENE_NAME.GAME);
        });

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
    }
}
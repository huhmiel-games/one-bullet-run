import { Scene } from 'phaser';
import Bullet from '../characters/Bullet';
import Coin from '../characters/Coin';
import Player from '../characters/Player';
import { COLOR } from '../constant/color';
import { WIDTH, HEIGHT, FONT, FONT_SIZE, SCENE_NAME, DEPTH, BONUS } from '../constant/config';

/**
 * @description a main game scene example
 * @author © Philippe Pereira 2020
 * @export
 * @class GameScene
 * @extends {Scene}
 */
export default class GameScene extends Scene
{
    private backgroundLayer: Phaser.Tilemaps.TilemapLayer;
    private isEndStage: boolean = false;
    private isGameOver: any;
    private level: number = 1;
    private map: Phaser.Tilemaps.Tilemap;
    private platformLayer: Phaser.Tilemaps.TilemapLayer;
    private tileset: string | Phaser.Tilemaps.Tileset | string[] | Phaser.Tilemaps.Tileset[];
    public bullet: Bullet;
    public coins: Coin[] = [];
    public player: Player;
    public speed: number = 90;
    public isBlur: boolean = false;
    private pauseText: Phaser.GameObjects.BitmapText;
    private music: Phaser.Sound.BaseSound;
    private levelCount: number = 1;
    private bad: Phaser.GameObjects.Sprite;

    constructor ()
    {
        super({ key: SCENE_NAME.GAME as string });
    }

    public init (): void
    {
        // fading the scene from black
        this.cameras.main.fadeIn(500).setBackgroundColor(0x081820);

        this.isGameOver = false;

        this.isEndStage = false;

        this.player?.setPause(true);
        this.bullet?.setPause(true);
    }


    public create (): void
    {
        // set the fps to 120 for good collisions at high speed (only if needed)
        // this.physics.world.setFPS(120);

        // add the tiled map
        this.map = this.make.tilemap({ key: `map${this.level}` });

        // add the tileset associated to the map
        this.tileset = this.map.addTilesetImage('tiles', 'tiles');

        // add the map

        // add the layers
        this.addLayers();

        // add the player
        this.player = new Player(this, WIDTH / 2, HEIGHT - 32, 'playerAtlas', 'player-walk_0');

        // add the bullet
        this.bullet = new Bullet(this, 18, HEIGHT - 28).setAlpha(0);

        // add the bad
        this.bad = this.add.sprite(46, HEIGHT - 32, 'atlas', 'bad-idle_0').setDepth(DEPTH.TEXT);
        this.bad.anims.play('badIdle');

        // pause player and bullet
        this.player?.setPause(true);
        this.bullet?.setPause(true);

        // add enemies, coins, doors, etc from map objects layer
        this.addObjectsFromMap();

        // camera must follow player
        this.cameras.main.startFollow(this.player).setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        this.addColliders();

        this.music = this.sound.add('music', { volume: 0.4, loop: true });

        // Launch the HUD Scene
        this.scene.launch(SCENE_NAME.HUD).setActive(true, SCENE_NAME.HUD);

        // pause the game
        if (this.game.events.listenerCount('blur') < 4)
        {
            this.game.events.on('blur', () =>
            {
                this.isBlur = true;

                this.player?.setPause(true).anims?.pause();

                this.bullet?.setPause(true);

                this.coins.forEach(coin =>
                {
                    if (coin.active)
                    {
                        coin.anims.pause();
                    }
                });

                if (!this.cameras.main)
                {
                    return;
                }

                const midPoint = this.cameras.main.midPoint;

                this.pauseText = this.add.bitmapText(midPoint.x, midPoint.y, FONT, 'pause', FONT_SIZE * 2, 1)
                    .setDepth(DEPTH.TEXT)
                    .setOrigin(0.5, 0)
                    .setTintFill(COLOR.WHITE);
            });

            // unpause the game
            this.game.events.on('focus', () =>
            {
                this.isBlur = false;

                this.player?.setPause(false).anims?.resume();

                this.bullet?.setPause(false);

                this.coins.forEach(coin =>
                {
                    if (coin.active)
                    {
                        coin.anims.resume();
                    }
                });

                this.pauseText?.destroy();
            });
        }

        this.startCountDown();
        this.music.play();
    }

    public update (time: number, delta: number): void
    {
        // Handle logic here
        // end of stage
        if (this.player.body.x > 2460)
        {
            this.endStage();
        }
    }

    private startCountDown (): void
    {
        const stageTextValue = `stage : ${this.level} speed : ${this.speed}`;

        const stageText = this.add.bitmapText(WIDTH / 2, HEIGHT / 2 - 64, FONT, stageTextValue, FONT_SIZE, 1)
            .setDepth(DEPTH.TEXT)
            .setOrigin(0.5, 0)
            .setTintFill(COLOR.GREEN_LIGHT);

        const countDownText = this.add.bitmapText(WIDTH / 2, HEIGHT / 2 - 32, FONT, 'start in 4', FONT_SIZE, 1)
            .setDepth(DEPTH.TEXT)
            .setOrigin(0.5, 0)
            .setTintFill(COLOR.WHITE);

        // start countdown
        const countDownTimer = this.time.addEvent({
            delay: 1000,
            repeat: 3,
            callback: () =>
            {
                const startCount = countDownTimer.repeatCount;

                if (startCount > 0)
                {
                    countDownText.setText(`start in ${startCount.toString()}`);
                    this.playSound('blipSfx');
                }
                else
                {
                    this.bad.anims.play('badShoot').once('animationcomplete', () => this.bad.anims.play('badIdle'));

                    this.playSound('blipSfx', { rate: 0.95 });

                    this.player?.setPause(false);

                    this.bullet?.setPause(false).setAlpha(1);

                    countDownText.destroy();

                    stageText.destroy();
                }
            },
        });
    }

    /**
     * Play sounds when game is focus
     * @param snd 
     * @param config 
     */
    public playSound (snd: string, config: Phaser.Types.Sound.SoundConfig = { }): void
    {
        if (this.isBlur)
        {
            return;
        }

        this.sound.play(snd, config);
    }

    /**
     * Add the Tiled layers
     */
    private addLayers (): void
    {
        this.backgroundLayer = this.map.createLayer('background', this.tileset, 0, 0).setDepth(DEPTH.BACK);

        this.platformLayer = this.map.createLayer('platform', this.tileset, 0, 0).setDepth(DEPTH.PLATFORM);
    }

    /**
     * Convert Tiled objects layer into Sprites
     */
    private addObjectsFromMap (): void
    {
        this.map.createFromObjects('objects', [
            // @ts-ignore
            { name: 'coin', classType: Coin, key: 'atlas', frame: 'coin_0' },
        ]);
    }

    /**
     * Add all needed colliders
     */
    private addColliders (): void
    {
        // add the collision tiles
        this.platformLayer.setCollisionByProperty({ collides: true });

        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        this.physics.add.collider(this.player, this.platformLayer, undefined, undefined, this);
        this.physics.add.overlap(this.player, this.bullet, this.handleCollideBullet, undefined, this);
        this.physics.add.overlap(this.player, this.coins, this.handleCollideCoins, undefined, this);
    }

    /**
     * Handle collision between mario and enemies
     * @param player 
     * @param enemy 
     */
    private handleCollideBullet (): void
    {
        if (this.isGameOver)
        {
            return;
        }

        this.isGameOver = true;

        const { x, y } = this.player.body.center;

        const explosion = this.add.sprite(x, y - 20, 'explosion').setDepth(DEPTH.EXPLOSION).anims.play('explode', true);
        explosion.once('animationcomplete', () =>
        {
            this.player.die();
        });

        this.playSound('explosionSfx');

        this.player.alpha = 0;
        this.player.body.setEnable(false);

        this.bullet.body.setEnable(false);
        this.bullet.alpha = 0;
    }


    /**
     * Handle collision between player and coins
     * @param _player 
     * @param _coin 
     */
    private handleCollideCoins (_player: Phaser.GameObjects.GameObject, _coin: Phaser.GameObjects.GameObject)
    {
        const coin = _coin as unknown as Coin;
        const player = _player as unknown as Player;

        coin.body.setEnable(false);
        coin.setActive(false).setVisible(false);

        player.setCoinCount();
    }

    /**
     * start game over scene when mario die
     */
    public gameOver (): void
    {
        this.physics.add.collider(this.player, this.bullet, undefined, undefined, this);

        this.level = 1;
        this.speed = 90;
        this.levelCount = 1;

        this.music.stop();
        this.playSound('gameOverTheme', { volume: 0.5 });

        this.time.addEvent({
            delay: 1000,
            callback: () =>
            {
                this.scene.start(SCENE_NAME.GAME_OVER);
            }
        });
    }

    public endStage (): void
    {
        if (this.isEndStage)
        {
            return;
        }

        this.isEndStage = true;

        this.levelCount += 1;

        const bonus = (BONUS + this.speed / 2) * this.levelCount;

        const { x, y } = this.bullet.body.center;
        const explosion = this.add.sprite(x, y - 20, 'explosion').setDepth(DEPTH.EXPLOSION).anims.play('explode', true);
        this.music.stop();
        this.playSound('explosionSfx');

        this.bullet.body.setEnable(false);
        this.bullet.alpha = 0;

        this.player.body.stop().setEnable(false);
        this.player.anims.stop();
        this.player.setFlipX(true);

        explosion.once('animationcomplete', () =>
        {
            this.player.setFlipX(false);
            this.player.anims.play('player-walk', true);

            this.playSound('victoryTheme', { volume: 0.5, rate: 1.1 });

            this.tweens.add({
                targets: this.player,
                x: this.map.widthInPixels + 64,
                onComplete: () =>
                {
                    this.level += 1;

                    if (this.level === 3)
                    {
                        this.level = 1;
                        this.speed += 10;
                        this.events.emit('setSpeed', this.speed);
                    }

                    const midPoint = this.cameras.main.midPoint;

                    const stageBonusText = this.add.bitmapText(midPoint.x, midPoint.y, FONT, 'end stage bonus: ' + bonus, FONT_SIZE, 1)
                        .setDepth(DEPTH.TEXT)
                        .setOrigin(0.5, 0)
                        .setTintFill(COLOR.WHITE);

                    // add level bonus
                    const bonusTimer = this.time.addEvent({
                        delay: 2500,
                        callback: () =>
                        {
                            this.player.setBonus(bonus);

                            if (bonusTimer.getOverallProgress() === 1)
                            {
                                stageBonusText.destroy();
                                this.nextStageDelay();
                            }
                        },
                    });
                }
            });
        });
    }

    private nextStageDelay (): void
    {
        this.time.addEvent({
            delay: 2000,
            callback: this.nextStage,
            callbackScope: this
        });
    }

    /**
     * Start next stage
     */
    private nextStage ()
    {
        this.cameras.main.fadeOut(500);

        // destroy current map and gameObjects
        this.physics.world.colliders.destroy();

        this.map.destroy();

        this.coins.forEach(coin => coin.destroy());

        // create the new map
        this.map = this.make.tilemap({ key: `map${this.level}` });
        this.addLayers();
        this.addObjectsFromMap();
        this.addColliders();
        this.cameras.main.fadeIn(500);

        // reset player
        this.player.setPause(true);
        this.player.body.setEnable(true).reset(WIDTH / 2, HEIGHT - 32);

        // reset bullet
        this.bullet.setPause(true);
        this.bullet.body.setEnable(true).reset(18, HEIGHT - 28);

        this.startCountDown();
        this.music.play();

        this.isEndStage = false;
    }
}

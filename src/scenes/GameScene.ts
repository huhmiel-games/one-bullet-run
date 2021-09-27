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
    public player: Player;
    public speed: number = 90;
    public isBlur: boolean = false;
    private pauseText: Phaser.GameObjects.BitmapText;
    private music: Phaser.Sound.BaseSound;
    private levelCount: number = 1;
    private bad: Phaser.GameObjects.Sprite;
    private coinGroup: Phaser.Physics.Arcade.Group;
    private stageCoinCount: number = 0;
    private explosion: Phaser.GameObjects.Sprite;
    private countDownTimer: Phaser.Time.TimerEvent;

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

        this.stageCoinCount = 0;

        this.speed = 90;

        this.player?.setPause(true);
        this.bullet?.setPause(true);
    }


    public create (): void
    {
        // add the tiled map
        this.map = this.make.tilemap({ key: `map${this.level}` });

        // add the tileset associated to the map
        this.tileset = this.map.addTilesetImage('tiles', 'tiles', 8, 8, 1, 2);

        // add the layers
        this.addLayers();

        // add the player
        this.player = new Player(this, WIDTH / 2, HEIGHT - 32, 'atlas', 'player-walk_0');

        // add the bullet
        this.bullet = new Bullet(this, 18, HEIGHT - 28).setAlpha(0);

        // add the bad
        this.bad = this.add.sprite(46, HEIGHT - 32, 'atlas', 'bad-idle_0').setDepth(DEPTH.TEXT);
        this.bad.anims.play('badIdle');

        // add the explosion
        this.explosion = this.add.sprite(0, 0, 'explosion').setDepth(DEPTH.EXPLOSION).setActive(false).setVisible(false);

        // pause player and bullet
        this.player?.setPause(true);

        this.bullet?.setPause(true);

        // add enemies, coins, doors, etc from map objects layer
        this.creatCoins();

        this.addCoins();

        // camera must follow player
        this.cameras.main.startFollow(this.player)
            .setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
            .setRoundPixels(true);

        this.addColliders();

        this.music = this.sound.add('music', { volume: 0.4, loop: true });

        // Launch the HUD Scene
        this.scene.launch(SCENE_NAME.HUD).setActive(true, SCENE_NAME.HUD);

        // a pause bitmap text
        this.pauseText = this.add.bitmapText(WIDTH / 2, HEIGHT / 2, FONT, 'pause', FONT_SIZE * 2, 1)
            .setDepth(DEPTH.TEXT)
            .setOrigin(0.5, 0)
            .setTintFill(COLOR.WHITE)
            .setScrollFactor(0)
            .setVisible(false);

        // pause the game
        if (this.game.events.listenerCount(Phaser.Core.Events.BLUR) < 4)
        {
            this.game.events.on(Phaser.Core.Events.BLUR, () =>
            {
                this.isBlur = true;

                if (this.physics.world)
                {
                    this.physics.pause();
                }

                this?.anims?.pauseAll();

                if (!this.cameras.main)
                {
                    return;
                }

                this.pauseText.setVisible(true);

                this.countDownTimer.paused = true;
            }, this);

            // unpause the game
            this.game.events.on(Phaser.Core.Events.FOCUS, () =>
            {
                this.isBlur = false;

                if (this.physics.world)
                {
                    this.physics.resume();
                }

                this?.anims?.resumeAll();

                this?.pauseText?.setVisible(false);

                this.countDownTimer.paused = false;
            }, this);
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
            this.startEndStage();
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
        this.countDownTimer = this.time.addEvent({
            delay: 1000,
            repeat: 3,
            callback: () =>
            {
                const startCount = this.countDownTimer.repeatCount;

                if (startCount > 0)
                {
                    countDownText.setText(`start in ${startCount.toString()}`);
                    this.playSound('blipSfx');
                }
                else
                {
                    this.bad.anims.play('badShoot').once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => this.bad.anims.play('badIdle'));

                    this.playSound('shootSfx');

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
     * Add all needed colliders
     */
    private addColliders (): void
    {
        // add the collision tiles
        this.platformLayer.setCollisionByProperty({ collides: true });

        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        this.physics.add.collider(this.player, this.platformLayer, undefined, undefined, this);
        this.physics.add.overlap(this.player, this.bullet, this.handleCollideBullet, undefined, this);
        this.physics.add.overlap(this.player, this.coinGroup, this.handleCollideCoins, undefined, this);
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

        this.explosion.setPosition(x, y).setActive(true).setVisible(true).anims.play('explode', true);

        this.explosion.once(Phaser.Animations.Events.ANIMATION_COMPLETE, this.setPlayerDead, this);

        this.playSound('explosionSfx');

        this.player.alpha = 0;
        this.player.body.setEnable(false);

        this.bullet.body.setEnable(false);
        this.bullet.alpha = 0;
    }

    private setPlayerDead (): void
    {
        this.player.die();
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

        this.stageCoinCount += 1;
    }

    /**
     * start game over scene when mario die
     */
    public gameOver (): void
    {
        this.physics.add.collider(this.player, this.bullet, undefined, undefined, this);

        this.level = 1;

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

    public startEndStage (): void
    {
        if (this.isEndStage)
        {
            return;
        }

        this.isEndStage = true;

        this.levelCount += 1;

        const { x, y } = this.bullet.body.center;

        this.explosion.setPosition(x, y).setActive(true).setVisible(true).anims.play('explode', true);

        this.music.stop();
        this.playSound('explosionSfx');

        this.bullet.body.setEnable(false);
        this.bullet.alpha = 0;

        this.player.body.stop().setEnable(false);
        this.player.anims.stop();
        this.player.setFlipX(true);

        this.explosion.once(Phaser.Animations.Events.ANIMATION_COMPLETE, this.startBonusEndStage, this);
    }

    private startBonusEndStage ()
    {
        this.player.setFlipX(false);
        this.player.anims.play('player-walk', true);

        this.playSound('victoryTheme', { volume: 0.5, rate: 1.1 });

        const bonus = Math.round((this.stageCoinCount / 4) + (this.speed / 2) * this.levelCount);

        this.stageCoinCount = 0;

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

                const text = `end stage bonus: ${bonus}`;

                const stageBonusText = this.add.bitmapText(WIDTH / 2, HEIGHT / 2, FONT, text, FONT_SIZE, 1)
                    .setDepth(DEPTH.TEXT)
                    .setOrigin(0.5, 0)
                    .setTintFill(COLOR.WHITE)
                    .setScrollFactor(0);

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

        this.coinGroup?.children?.each(coin => coin.setActive(false));

        // create the new map
        this.map = this.make.tilemap({ key: `map${this.level}` });
        this.addLayers();
        this.addCoins();
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

    /**
     * Add coins to the map
     */
    private addCoins (): void
    {
        const layerArray: Phaser.Tilemaps.ObjectLayer = this.map.objects.filter((elm) => elm.name === 'objects')[0];

        if (!layerArray || !layerArray.objects.length)
        {
            return;
        }

        layerArray.objects.forEach((element) =>
        {
            if (!element.x || !element.y)
            {
                return;
            }

            const coin: Coin = this.coinGroup.getFirstDead(true, element.x + 8, element.y - 8, 'atlas', 'coin_0', true);

            coin.setActive(true)
                .setVisible(true)
                .anims.play('coin');

            coin.body.setEnable(true);
        });
    }

    /**
     * Create a physics coin group
     */
    private creatCoins ()
    {
        this.coinGroup = this.physics.add.group({
            classType: Coin,
            maxSize: 128,
            allowGravity: false,
        });
    }
}




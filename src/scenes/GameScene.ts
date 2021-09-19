import { Scene } from 'phaser';
import Bullet from '../characters/Bullet';
import Coin from '../characters/Coin';
import Player from '../characters/Player';
import { COLOR } from '../constant/color';
import { WIDTH, HEIGHT, FONT, FONT_SIZE, SCENE_NAME } from '../constant/config';

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
    // private countDownText: Phaser.GameObjects.BitmapText;

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
        this.bullet = new Bullet(this, 10, HEIGHT - 32);

        // pause player and bullet
        this.player?.setPause(true);
        this.bullet?.setPause(true);

        // add enemies, coins, doors, etc from map objects layer
        this.addObjectsFromMap();

        // camera must follow player
        this.cameras.main.startFollow(this.player).setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        this.addColliders();

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
                    .setDepth(50)
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
    }

    public update (time: number, delta: number): void
    {
        // Handle logic here
        // end of stage
        if (this.player.body.x > 3900)
        {
            this.endStage();
        }
    }

    private startCountDown (): void
    {
        const stageTextValue = `stage : ${this.level} speed : ${this.speed}`;

        const stageText = this.add.bitmapText(WIDTH / 2, HEIGHT / 2 - 64, FONT, stageTextValue, FONT_SIZE, 1)
            .setDepth(50)
            .setOrigin(0.5, 0)
            .setTintFill(COLOR.GREEN_LIGHT);

        const countDownText = this.add.bitmapText(WIDTH / 2, HEIGHT / 2 - 32, FONT, 'start in 4', FONT_SIZE, 1)
            .setDepth(50)
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
                }
                else
                {
                    this.player?.setPause(false);
                    this.bullet?.setPause(false);
                    countDownText.destroy();
                    stageText.destroy();
                }
            },
        });
    }

    public playSound (snd: string, config: Phaser.Types.Sound.SoundConfig = {}): void
    {
        if (this.isBlur)
        {
            return;
        }

        this.sound.play(snd, config);
    }

    // private addMap (): void
    // {
    //     // add the tiled map
    //     this.map = this.make.tilemap({ key: `map${this.level}` });

    //     this.addLayers();

    //     this.addObjectsFromMap();

    //     this.addColliders();

    //     this.cameras.main.fadeIn(500);
    // }

    /**
     * Add the Tiled layers
     */
    private addLayers (): void
    {
        this.backgroundLayer = this.map.createLayer('background', this.tileset, 0, 0).setDepth(1);

        this.platformLayer = this.map.createLayer('platform', this.tileset, 0, 0).setDepth(10);
    }

    /**
     * Convert Tiled objects layer into Sprites
     */
    private addObjectsFromMap (): void
    {
        this.map.createFromObjects('objects', [
            // @ts-ignore
            { name: 'coin', classType: Coin, key: 'coin', frame: 0 },
            // @ts-ignore
            // { name: 'powerup', classType: PowerUp, key: '', frame: 6 },
            // @ts-ignore
            // { name: '', classType: , key: '', frame: 11 },
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

        const explosion = this.add.sprite(x, y - 20, 'explosion').setDepth(50).anims.play('explode', true);
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

        const bonus = this.speed * this.level * this.level;

        const { x, y } = this.bullet.body.center;
        const explosion = this.add.sprite(x, y - 20, 'explosion').setDepth(50).anims.play('explode', true);
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

            this.tweens.add({
                targets: this.player,
                x: this.map.widthInPixels + 64,
                onComplete: () =>
                {
                    this.level += 1;
                    if (this.level === 5)
                    {
                        this.level = 1;
                        this.speed += 10;
                    }

                    // add level bonus
                    const bonusTimer = this.time.addEvent({
                        delay: 0.1,
                        repeat: bonus,
                        callback: () =>
                        {
                            this.player.setCoinCount();

                            if (bonusTimer.getOverallProgress() === 1)
                            {
                                this.nextStage();
                            }
                        },
                    });
                }
            });
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
        this.bullet.alpha = 1;
        this.bullet.setPause(true);
        this.bullet.body.setEnable(true).reset(10, HEIGHT - 32);

        this.startCountDown();

        this.isEndStage = false;
    }
}

import GameScene from '../scenes/GameScene';

interface BodySize
{
    filename: string;
    spriteSourceSize: {
        x: number
        y: number
        w: number
        h: number
    };
}

export default class Player extends Phaser.GameObjects.Sprite
{
    public scene: GameScene;
    public body: Phaser.Physics.Arcade.Body;
    private keys: Phaser.Types.Input.Keyboard.CursorKeys;
    private jumpTime: number = 0;
    private isDead: boolean = false;
    private isPaused: boolean = false;
    private coinCount: number = 0;

    constructor (scene: GameScene, x: number, y: number, texture: string, frame: string)
    {
        super(scene, x, y, texture, frame);

        this.scene = scene;
        this.scene.physics.world.enable(this);
        this.scene.add.existing(this);

        // this.body.setCollideWorldBounds(true);

        this.keys = this.scene.input.keyboard.createCursorKeys();

        this.setDepth(20);

        this.anims.play('player-walk');

        this.body.setSize(15, 15, false)
            .setOffset(19, 12);

        // handle animation
        this.on('animationupdate', () =>
        {
            const currentAnim = this.anims.getName();

            if (currentAnim === 'player-jump' && this.body.blocked.down)
            {
                this.anims.play('player-land', true);
            }

            if (currentAnim === 'player-land')
            {
                this.anims.play('player-walk', true);
            }
        });

        // handle click events on mobile
        const { android, iOS } = this.scene.sys.game.device.os;

        if (android || iOS)
        {
            this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) =>
            {
                if (pointer.leftButtonDown() && pointer.getDuration() < 250 && this.body.blocked.down && this.jumpTime < this.scene.time.now + 200)
                {
                    this.jumpTime = this.scene.time.now;

                    this.body.setVelocityY(-400);

                    this.anims.play(`player-jump`, true);

                    this.scene.playSound('jumpSfx');
                }
            });
        }
    }

    public preUpdate (time: number, delta: number): void
    {
        super.preUpdate(time, delta);

        if (this.isDead || this.isPaused)
        {
            this.body.stop();

            return;
        }

        const { up } = this.keys;

        // handle jump
        if (up.isDown && up.getDuration() < 250 && this.body.blocked.down && this.jumpTime < time + 200)
        {
            this.jumpTime = time;

            this.body.setVelocityY(-400);

            this.anims.play(`player-jump`, true);

            this.scene.playSound('jumpSfx');
        }

        this.body.setVelocityX(this.scene.speed);

        // fall in water or void
        if (this.y + this.height > 230)
        {
            this.die();
        }
    }

    /**
     * Keep coin count
     */
    public setCoinCount ()
    {
        this.coinCount += 1;

        this.scene.playSound('coinSfx', { volume: 0.1 });

        this.scene.events.emit('setCoin', this.coinCount);
    }

    public setBonus (bonus)
    {
        this.coinCount += bonus;
    }

    /**
     * get coin count
     */
    public getCoinCount (): number
    {
        return this.coinCount;
    }

    /**
     * set player pause
     */
    public setPause (bool: boolean)
    {
        this.isPaused = bool;
    }

    /**
     * Handle mario's death
     */
    public die (): void
    {
        if (this.isDead)
        {
            return;
        }

        this.isDead = true;

        this.body.stop().setAllowGravity(false);

        this.anims.play('dead');

        this.scene.gameOver();
    }
}
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
    private isJumping: boolean = false;

    constructor (scene: GameScene, x: number, y: number, texture: string, frame: string)
    {
        super(scene, x, y, texture, frame);

        this.scene = scene;
        this.scene.physics.world.enable(this);
        this.scene.add.existing(this);

        this.keys = this.scene.input.keyboard.createCursorKeys();

        this.setDepth(20);

        this.anims.play('player-walk');

        this.body.setSize(15, 15, false)
            .setOffset(19, 12)
            .setGravityY(1000);

        // handle walk animation after jump
        this.on('animationcomplete', () =>
        {
            const currentAnim = this.anims.getName();

            if (currentAnim === 'player-land')
            {
                this.anims.play('player-walk', true);

                this.isJumping = false;
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
        const { blocked } = this.body;

        // jump now
        if (up.isDown && up.getDuration() < 250 && blocked.down && !this.isJumping)
        {
            this.jumpTime = time;

            this.isJumping = true;

            this.body.setVelocityY(-400);

            this.scene.playSound('jumpSfx');

            this.anims.play('player-jump', true);
        }

        // end of jump
        if (up.isDown && this.isJumping && this.jumpTime + 350 < time)
        {
            this.isJumping = false;

            this.body.setVelocityY(0);

            this.setGravityMomentum();

            this.anims.play('player-fall', true);
        }
        
        // player stop the jump
        if (up.isUp && this.isJumping)
        {
            this.isJumping = false;

            this.body.setVelocityY(0);

            this.setGravityMomentum();

            this.anims.play('player-fall', true);
        }

        // if blocked to ceiling
        if (blocked.up)
        {
            this.body.setVelocityY(0);
        }

        // handle land animation
        if (blocked.down)
        {
            const currentAnim = this.anims.getName();

            if (currentAnim === 'player-fall')
            {
                this.anims.play('player-land', true);
            }
        }

        this.body.setVelocityX(this.scene.speed);

        // fall in water or void
        if (this.y + this.height > 230)
        {
            this.die();
        }
    }

    private setGravityMomentum (): void
    {
        this.body.setGravityY(500);

        this.scene.time.addEvent({
            delay: 100,
            callback: this.resetGravity,
            callbackScope: this
        });
    }

    private resetGravity ()
    {
        this.body.setGravityY(1000);
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

    public setBonus (bonus: number): Player
    {
        this.coinCount += bonus;

        return this;
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
    public setPause (bool: boolean): Player
    {
        this.isPaused = bool;

        return this;
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

        this.scene.gameOver();
    }
}
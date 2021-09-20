import { DEPTH } from '../constant/config';
import GameScene from '../scenes/GameScene';

export default class Bullet extends Phaser.GameObjects.Sprite
{
    public scene: GameScene;
    public body: Phaser.Physics.Arcade.Body;
    private isPaused: boolean = false;

    constructor (scene: GameScene, x: number, y: number)
    {
        super(scene, x, y, '', undefined);

        this.scene = scene;
        this.scene.physics.world.enable(this);
        this.scene.add.existing(this);
        this.setTexture('atlas').setFrame('bullet').setDepth(DEPTH.BULLET);

        this.body.setImmovable(true)
            .setCollideWorldBounds(true)
            .setAllowGravity(false)
            .setSize(16, 16, false);
    }

    public preUpdate (time: number, delta: number): void
    {
        super.preUpdate(time, delta);

        if (this.isPaused)
        {
            this.body.stop();

            return;
        }

        const { player } = this.scene;

        const dx = player.x - this.x;
        const dy = player.y - this.y;

        const angle = Math.atan2(dy, dx);

        this.body.setVelocity(
            Math.cos(angle) * this.scene.speed + 2,
            Math.sin(angle) * this.scene.speed + 2
        );

        this.rotation = angle;
    }

    /**
     * set bullet pause
     */
    public setPause (bool: boolean)
    {
        this.isPaused = bool;
    }
}
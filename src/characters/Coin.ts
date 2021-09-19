import GameScene from '../scenes/GameScene';

export default class Coin extends Phaser.GameObjects.Sprite
{
    public scene: GameScene;
    public body: Phaser.Physics.Arcade.Body;

    constructor (scene: GameScene, x: number, y: number)
    {
        super(scene, x, y, '', undefined);

        this.scene = scene;
        this.scene.physics.world.enable(this);
        this.scene.add.existing(this);

        this.setTexture('coin').setFrame(0);

        this.body.setImmovable()
            .setAllowGravity(false)
            .setSize(16, 16, false);

        this.setDepth(5);

        this.anims.play('coin', true);
        this.scene.coins.push(this);
    }
}
import { collisionCategories, collisionMasks } from '../engine/collisions'

export class MonsterBase extends Phaser.Physics.Matter.Sprite {
  constructor(
    world: Phaser.Physics.Matter.World,
    x: number,
    y: number,
    texture: string,
    frame: string | integer,
    public monsterType: string,
    imageDepth: number,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig
  ) {
    super(world, x, y, texture, frame, {
      ...options,
      friction: 0, //1,
      frictionStatic: 0, // 5,
      density: 0.025,
      collisionFilter: { category: collisionCategories.monster, mask: collisionMasks.monster },
    })
    this.setDepth(imageDepth)
  }

  remove = false

  done(): void {
    this.destroy()
    this.remove = true
  }
}

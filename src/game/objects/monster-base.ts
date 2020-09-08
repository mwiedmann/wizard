import { collisionCategories, collisionMasks } from '../engine/collisions'

export class MonsterBase extends Phaser.Physics.Matter.Sprite {
  constructor(
    world: Phaser.Physics.Matter.World,
    x: number,
    y: number,
    texture: string,
    frame: string | integer,
    public monsterType: string,
    options?: Phaser.Types.Physics.Matter.MatterBodyConfig
  ) {
    super(world, x, y, texture, frame, {
      ...options,
      friction: 0, //1,
      frictionStatic: 0, // 5,
      density: 0.025,
      collisionFilter: { category: collisionCategories.monster, mask: collisionMasks.monster },
    })
  }

  remove = false

  done(): void {
    this.destroy()
    this.remove = true
  }
}

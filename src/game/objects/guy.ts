import { collisionCategories, collisionMasks } from '../engine/collisions'

export class Guy extends Phaser.Physics.Matter.Sprite {
  constructor(world: Phaser.Physics.Matter.World, x: number, y: number, texture: string, frame: string | integer) {
    super(world, x, y, texture, frame, {
      friction: 0, // 1,
      frictionStatic: 0, // 5,
      density: 0.025,
      collisionFilter: { category: collisionCategories.guy, mask: collisionMasks.guy },
    })
  }

  lastJumpTime = 0
  touchingFloor = false
}

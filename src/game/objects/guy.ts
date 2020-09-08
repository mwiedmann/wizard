export class Guy extends Phaser.Physics.Matter.Sprite {
  constructor(world: Phaser.Physics.Matter.World, x: number, y: number, texture: string, frame: string | integer) {
    super(world, x, y, texture, frame, {
      friction: 1,
      frictionStatic: 5,
      density: 0.025,
      collisionFilter: { category: 2, mask: 1 },
    })
  }

  touchingFloor = false
}

import { MonsterBase } from './monster-base'

export class Ghost extends MonsterBase {
  constructor(
    world: Phaser.Physics.Matter.World,
    x: number,
    y: number,
    texture: string,
    frame: string | integer,
    imageDepth: number
  ) {
    super(world, x, y, texture, frame, 'ghost', imageDepth)
  }
}

import { MonsterBase } from './monster-base'

export class Zombie extends MonsterBase {
  constructor(world: Phaser.Physics.Matter.World, x: number, y: number, texture: string, frame: string | integer) {
    super(world, x, y, texture, frame, 'zombie')
  }
}

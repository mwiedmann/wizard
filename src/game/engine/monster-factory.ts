import { Ghost } from '../objects/ghost'
import { MonsterBase } from '../objects/monster-base'

export const monsterFactory = (
  scene: Phaser.Scene,
  type: string,
  x: number,
  y: number,
  imageDepth: number
): MonsterBase => {
  switch (type) {
    case 'ghost':
      return new Ghost(scene.matter.world, x, y, type, 0, imageDepth)
    default:
      throw new Error(`Invalid monster type: ${type}`)
  }
}

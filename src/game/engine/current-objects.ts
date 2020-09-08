import { MonsterBase } from '../objects/monster-base'

export const currentObjects: {
  blocks: MatterJS.BodyType[]
  images: Phaser.GameObjects.Image[]
  monsters: MonsterBase[]
} = {
  blocks: [],
  images: [],
  monsters: [],
}

import { gameObjects } from '../game-objects'
import { currentObjects } from './current-objects'

export const cleanup = (scene: Phaser.Scene): void => {
  console.log('cleanup')
  currentObjects.images.forEach((image) => {
    scene.matter.world.remove(image)
    image.destroy()
  })
  currentObjects.blocks.forEach((block) => scene.matter.world.remove(block))
  currentObjects.monsters.forEach((monster) => {
    scene.matter.world.remove(monster)
    monster.destroy()
  })
  currentObjects.images = []
  currentObjects.blocks = []
  currentObjects.monsters = []

  // Cleanup any gameObjects for this room (e.g. spells)
  gameObjects.spells.forEach((spell) => {
    spell.done()
  })
  gameObjects.spells = []
}

import { gameObjects } from '../game-objects'
import { currentObjects } from './current-objects'

export const cleanup = (scene: Phaser.Scene): void => {
  console.log('cleanup')
  const cleanupList = [...currentObjects.images, ...currentObjects.blocks, ...currentObjects.gates]
  cleanupList.forEach((item) => item.remove(scene))

  currentObjects.monsters.forEach((monster) => {
    scene.matter.world.remove(monster)
    monster.destroy()
  })
  currentObjects.images = []
  currentObjects.blocks = []
  currentObjects.gates = []
  currentObjects.monsters = []

  // Cleanup any gameObjects for this room (e.g. spells)
  gameObjects.spells.forEach((spell) => {
    spell.done()
  })
  gameObjects.spells = []
}

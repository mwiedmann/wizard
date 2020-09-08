import { currentObjects } from './current-objects'

export const cleanup = (scene: Phaser.Scene): void => {
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

  // TODO: How to clean up the collider between the guy and gate? Do we need to?
}

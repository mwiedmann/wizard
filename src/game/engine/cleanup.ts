import { currentObjects } from './current-objects'

export const cleanup = (scene: Phaser.Scene): void => {
  currentObjects.images.forEach((image) => image.destroy())
  currentObjects.blocks.forEach((block) => scene.matter.world.remove(block))

  currentObjects.images = []
  currentObjects.blocks = []

  // TODO: How to clean up the collider between the guy and gate? Do we need to?
}

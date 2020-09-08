import { preloadRoom } from '../engine/preload'
import { gameState } from '../scene-update'

export const initPreload = (scene: Phaser.Scene, roomKey: string): void => {
  preloadRoom(scene, roomKey, () => {
    gameState.phase = 'title'
  })
}

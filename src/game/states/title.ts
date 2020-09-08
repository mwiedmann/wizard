import { settingsHelpers } from '../consts'
import { preloadComplete } from '../engine/preload'
import { controls } from '../init'
import { gameState } from '../scene-update'

let titleScreen: Phaser.GameObjects.Image

export const titlePreload = (scene: Phaser.Scene, roomKey: string): void => {
  preloadComplete[roomKey] = true
  titleInit(scene)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const titleUpdate = (scene: Phaser.Scene, time: number, delta: number): void => {
  if (controls.next.isDown) {
    gameState.phase = 'gameStart'
  }
}

const titleInit = (scene: Phaser.Scene): void => {
  titleScreen = scene.add.image(settingsHelpers.fieldWidthMid, settingsHelpers.fieldHeightMid, 'title')
}

export const titleCleanup = (): void => {
  titleScreen.destroy()
}

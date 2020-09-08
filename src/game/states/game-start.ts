import { gameSettings } from '../consts'
import { preloadComplete } from '../engine/preload'
import { gameObjects } from '../game-objects'
import { Guy } from '../objects/guy'
import { gameState } from '../scene-update'

export const gameStartPreload = (scene: Phaser.Scene, roomKey: string): void => {
  preloadComplete[roomKey] = true
  gameStartInit(scene)
}

const gameStartInit = (scene: Phaser.Scene): void => {
  gameObjects.guy = new Guy(scene.matter.world, 1000, 0, 'guy', 0, {
    friction: 1,
    frictionStatic: 5,
    density: 0.025,
  })
  scene.anims.create({
    key: 'run',
    frames: scene.anims.generateFrameNumbers('guy', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  })

  // The normal here tells us if he has collided with something "down"
  // Eventually we will check the type of object (unless we want him to be able to jump off of anything)
  gameObjects.guy.setOnCollideActive((pair: Phaser.Types.Physics.Matter.MatterCollisionPair) => {
    if (pair.collision.normal.y === -1) {
      gameObjects.guy.touchingFloor = true
    }
  })

  scene.add.existing(gameObjects.guy)

  scene.matter.body.setInertia(gameObjects.guy.body as MatterJS.BodyType, Infinity)

  scene.cameras.main.setZoom(gameSettings.gameCameraZoom)
  scene.cameras.main.setDeadzone(100, 100)
  scene.cameras.main.startFollow(gameObjects.guy)
  scene.cameras.main.setLerp(0.1, 0.1)
  scene.cameras.main.setBounds(0, 0, gameSettings.fieldWidth, gameSettings.fieldHeight)

  gameState.phase = 'gameA1'
}

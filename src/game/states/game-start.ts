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
  gameObjects.guy = new Guy(scene.matter.world, 1000, 0, 'guy-run', 0)
  scene.anims.create({
    key: 'guy-run',
    frames: scene.anims.generateFrameNumbers('guy-run', {}),
    frameRate: 12,
    repeat: -1,
    // yoyo: true,
  })

  scene.anims.create({
    key: 'guy-jump',
    frames: scene.anims.generateFrameNumbers('guy-jump', {}),
    frameRate: 12,
    repeat: -1,
    // yoyo: true,
  })

  scene.anims.create({
    key: 'guy-shoot',
    frames: scene.anims.generateFrameNumbers('guy-shoot', {}),
    frameRate: 12,
    repeat: 1,
    // yoyo: true,
  })

  scene.anims.create({
    key: 'guy-yawn',
    frames: scene.anims.generateFrameNumbers('guy-yawn', {}),
    frameRate: 5,
    repeat: -1,
    repeatDelay: 5000,
    yoyo: true,
  })

  // Monter animationa
  scene.anims.create({
    key: 'zombie-walk',
    frames: scene.anims.generateFrameNumbers('zombie', { start: 0, end: 4 }),
    frameRate: 7,
    repeat: -1,
  })

  // The normal here tells us if he has collided with something "down"
  // Eventually we will check the type of object (unless we want him to be able to jump off of anything)
  gameObjects.guy.setOnCollideActive((pair: Phaser.Types.Physics.Matter.MatterCollisionPair) => {
    if (pair.collision.normal.y === -1 && pair.collision.normal.x === 0) {
      gameObjects.guy.touchingFloor = true
    }
  })

  scene.add.existing(gameObjects.guy)

  scene.matter.body.setInertia(gameObjects.guy.body as MatterJS.BodyType, Infinity)

  scene.cameras.main.setZoom(gameSettings.gameCameraZoom)

  // scene.cameras.main.setDeadzone(100, 100)
  // scene.cameras.main.startFollow(gameObjects.guy)
  // scene.cameras.main.setLerp(0.1, 0.1)
  // scene.cameras.main.setBounds(0, 0, gameSettings.fieldWidth, gameSettings.fieldHeight)

  gameState.phase = 'gameEntry'
}

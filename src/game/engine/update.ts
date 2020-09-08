import { gameObjects } from '../game-objects'
import { controls } from '../init'

const sideVelocityLimit = 4

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const update = (scene: Phaser.Scene, time: number, delta: number): void => {
  const { guy } = gameObjects

  let running = false

  if (guy.touchingFloor && controls.cursors.up?.isDown) {
    guy.applyForce(new Phaser.Math.Vector2(0, -3.7))
  }

  if (controls.cursors.left?.isDown) {
    guy.setVelocityX(-sideVelocityLimit)
    running = true
    guy.flipX = true
  }

  if (controls.cursors.right?.isDown) {
    guy.setVelocityX(sideVelocityLimit)
    running = true
    guy.flipX = false
  }

  if (Math.abs(guy.body.velocity.x) > sideVelocityLimit) {
    guy.setVelocity(guy.body.velocity.x > 0 ? sideVelocityLimit : -sideVelocityLimit, guy.body.velocity.y)
  }

  if (running) {
    guy.anims.play('run', true)
  } else {
    guy.anims.stop()
  }

  // This will be reset by the collider every loop so we always
  // want to set this to false to see if the guy is still touching the floor
  guy.touchingFloor = false
}

/*
  const background = scene.add.image(515 + 939 / 2, 300, 'blue')
  background.setPipeline('Light2D')
  scene.lights.enable().setAmbientColor(0x333333)
  scene.lights.addLight(515 + 939 / 2, 300, 150, 0xffffff, 2).setRadius(160)
*/
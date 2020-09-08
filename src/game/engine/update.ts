import { gameObjects } from '../game-objects'
import { controls } from '../init'
import { EnergyBolt } from '../objects/energy-bolt'
import { currentObjects } from './current-objects'

const sideVelocityLimit = 4

let playerNextSpellTime = 0

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

  if (controls.spell.isDown && time > playerNextSpellTime) {
    const spell = new EnergyBolt(scene.matter.world, guy.x, guy.y, time, 'energy-bolt', 0)
    spell.fire(guy.flipX ? -1 : 1, 1000)

    gameObjects.spells.push(spell)
    playerNextSpellTime = time + 1000
  }

  if (Math.abs(guy.body.velocity.x) > sideVelocityLimit) {
    guy.setVelocity(guy.body.velocity.x > 0 ? sideVelocityLimit : -sideVelocityLimit, guy.body.velocity.y)
  }

  if (running) {
    guy.anims.play('guy-run', true)
  } else {
    guy.anims.stop()
  }

  // This will be reset by the collider every loop so we always
  // want to set this to false to see if the guy is still touching the floor
  guy.touchingFloor = false

  // Update all active spells and check if any of them have expired
  gameObjects.spells.forEach((spell) => {
    spell.update(time, delta)
  })
  if (gameObjects.spells.some((spell) => spell.remove)) {
    gameObjects.spells = gameObjects.spells.filter((spell) => !spell.remove)
  }

  currentObjects.monsters.forEach((monster) => {
    monster.setVelocityX(monster.x < guy.x ? 1 : -1)
    monster.flipX = monster.x < guy.x
  })
}

/*
  const background = scene.add.image(515 + 939 / 2, 300, 'blue')
  background.setPipeline('Light2D')
  scene.lights.enable().setAmbientColor(0x333333)
  scene.lights.addLight(515 + 939 / 2, 300, 150, 0xffffff, 2).setRadius(160)
*/

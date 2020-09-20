import { gameObjects } from '../game-objects'
import { controls } from '../init'
import { EnergyBolt } from '../objects/energy-bolt'
import { MonsterBase } from '../objects/monster-base'
import { gameState } from '../scene-update'
import { currentObjects, objectsWithActiveKey } from './current-objects'

const sideVelocityLimit = 4

let playerNextSpellTime = 0
let shootTimeStart = 0

/** Used to track idle time and trigger yawning and other idle animations */
let lastActionTime = 0

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const update = (scene: Phaser.Scene, time: number, delta: number): void => {
  const { guy } = gameObjects

  // Reset the lastActionTime to current
  if (lastActionTime === 0) {
    lastActionTime = time
  }

  let running = false
  let shooting = false

  if (guy.touchingFloor && controls.cursors.up?.isDown && guy.lastJumpTime + 700 < time) {
    guy.applyForce(new Phaser.Math.Vector2(0, guy.jumpForce()))
    guy.lastJumpTime = time
    lastActionTime = time
  }

  if (controls.cursors.left?.isDown) {
    guy.setVelocityX(-sideVelocityLimit)
    running = true
    guy.flipX = true
    lastActionTime = time
  }

  if (controls.cursors.right?.isDown) {
    guy.setVelocityX(sideVelocityLimit)
    running = true
    guy.flipX = false
    lastActionTime = time
  }

  if (guy.canShoot() && controls.spell.isDown && time > playerNextSpellTime) {
    shooting = true
    lastActionTime = time
    const direction = guy.flipX ? -1 : 1
    const spell = new EnergyBolt(scene.matter.world, guy.x + direction * 32, guy.y, time, 'energy-bolt', 0)
    scene.add.existing(spell)
    spell.fire(direction, 1000)
    spell.setOnCollide((pair: Phaser.Types.Physics.Matter.MatterCollisionPair) => {
      spell.lifespan = 0
      // See if this is a monster and damage it if so
      const bodyHit = pair.bodyA.gameObject as MonsterBase
      if (bodyHit?.monsterType) {
        bodyHit.done()
      }
    })
    spell.setDepth(998)
    gameObjects.spells.push(spell)
    playerNextSpellTime = time + 1000
  }

  if (Math.abs(guy.body.velocity.x) > sideVelocityLimit) {
    guy.setVelocity(guy.body.velocity.x > 0 ? sideVelocityLimit : -sideVelocityLimit, guy.body.velocity.y)
  }

  // We only have 2 animations at this point (running and jumping)
  // We will always use the running animation unless he is jumping
  if (shootTimeStart + 150 < time) {
    let yawning = false
    if (shooting) {
      shootTimeStart = time
      guy.anims.play('guy-shoot', true)
    } else if (!guy.touchingFloor) {
      guy.anims.play(guy.canShoot() ? 'guy-jump' : 'guy-jump-nowand', true)
    } else {
      // If user hasn't acted in some time, play the waiting animation
      if (lastActionTime + 5000 < time) {
        yawning = true
        guy.anims.play('guy-yawn', true)
      } else {
        guy.anims.play(guy.canShoot() ? 'guy-run' : 'guy-run-nowand', true)
      }
    }

    // If the guy is on the floor and standing still, stop animations
    if (!yawning && guy.touchingFloor && !running) {
      guy.anims.stop()
      guy.setVelocity(0, 0)
    }
  }

  // This will be reset by the collider every loop so we always
  // want to set this to false to see if the guy is still touching the floor
  guy.touchingFloor = false

  // See if any state changes have activated or removed objects in the room
  if (gameState.stateChanged) {
    objectsWithActiveKey().forEach((obj) => obj.checkState(scene))
    gameState.stateChanged = false
  }

  // Update all active spells and check if any of them have expired
  gameObjects.spells.forEach((spell) => {
    spell.update(time, delta)
  })
  if (gameObjects.spells.some((spell) => spell.remove)) {
    gameObjects.spells = gameObjects.spells.filter((spell) => !spell.remove)
  }

  // Clean up any dead monsters
  if (currentObjects.monsters.some((monster) => monster.remove)) {
    currentObjects.monsters = currentObjects.monsters.filter((monster) => !monster.remove)
  }

  // Update any remaining monsters
  currentObjects.monsters.forEach((monster) => {
    monster.setVelocityX(monster.x < guy.x ? 1 : -1)
    monster.flipX = monster.x > guy.x
  })
}

/*
  const background = scene.add.image(515 + 939 / 2, 300, 'blue')
  background.setPipeline('Light2D')
  scene.lights.enable().setAmbientColor(0x333333)
  scene.lights.addLight(515 + 939 / 2, 300, 150, 0xffffff, 2).setRadius(160)
*/

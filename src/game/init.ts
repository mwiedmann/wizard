import * as Phaser from 'phaser'
import { gameSettings } from './consts'
import { sceneUpdate } from './scene-update'

export let controls: {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys
  next: Phaser.Input.Keyboard.Key
}

function scenePreload(this: Phaser.Scene) {
  // Images
  this.load.image('title', 'images/title.png')

  // Sprites
  this.load.spritesheet('guy', 'images/wizard.png', { frameWidth: 64 })
}

function sceneCreate(this: Phaser.Scene) {
  controls = {
    cursors: this.input.keyboard.createCursorKeys(),
    next: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
  }

  // this.matter.world.setBounds(0, 0, settingsHelpers.worldBoundWidth, settingsHelpers.worldBoundHeight)
}

export const startGame = (): void => {
  new Phaser.Game({
    type: Phaser.AUTO,
    width: gameSettings.screenWidth,
    height: gameSettings.screenHeight,
    scale: {
      mode: Phaser.Scale.ScaleModes.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'matter',
      matter: {
        enableSleeping: false,
        debug: true,
        // gravity: {
        //   y: 1,
        //   x: 0,
        // },
      },
    },
    scene: {
      preload: scenePreload,
      create: sceneCreate,
      update: sceneUpdate,
    },
    input: {
      gamepad: true,
    },
    parent: 'root',
  })
}
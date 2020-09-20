import { cleanup } from './engine/cleanup'
/* eslint-disable @typescript-eslint/no-empty-function */
import { preloadComplete, preloadRoom } from './engine/preload'
import { update } from './engine/update'
import { gameStartPreload } from './states/game-start'
import { initPreload } from './states/init'
import { titleCleanup, titlePreload, titleUpdate } from './states/title'

export type KnownGameStateKeys = 'wand'

export const gameState: {
  phase: string
  nextStateTransitionTime: number
  dropArea: string
  state: { [K in KnownGameStateKeys]?: boolean }
  stateChanged: boolean
} = {
  phase: 'init',
  nextStateTransitionTime: 0,
  dropArea: 'main',
  state: {},
  stateChanged: false,
}

/** Define any custom preload/update/cleanup for game phases.
 * Any missing will use the engine defaults. */
const gamePhaseFunctions: {
  [key: string]: {
    preload?: (scene: Phaser.Scene, roomKey: string) => void
    update?: (scene: Phaser.Scene, time: number, delta: number) => void
    cleanup?: (scene: Phaser.Scene) => void
  }
} = {
  title: { preload: titlePreload, update: titleUpdate, cleanup: titleCleanup },
  gameStart: { preload: gameStartPreload, update: () => {}, cleanup: () => {} },
  init: { preload: initPreload, update: () => {}, cleanup: () => {} },
}

let lastState: string | undefined = undefined

export function sceneUpdate(this: Phaser.Scene, time: number, delta: number): void {
  // See if we are moving to another phase
  if (lastState !== gameState.phase) {
    console.log('transition', lastState, gameState.phase)
    // Cleanup the last phase (if needed)
    if (lastState) {
      // Some states may have custom cleanup
      if (gamePhaseFunctions[lastState]?.cleanup) {
        gamePhaseFunctions[lastState]?.cleanup?.(this)
      } else {
        // Otherwise, use the standard engine cleanup
        cleanup(this)
      }
    }

    // Move to the next phase
    lastState = gameState.phase

    // Preload assets for the nexxt phase (if not already loaded)
    // Some states may have custom preload
    if (gamePhaseFunctions[gameState.phase]?.preload) {
      gamePhaseFunctions[gameState.phase]?.preload?.(this, gameState.phase)
    } else {
      // Otherwise, use the standard engine preload
      preloadRoom(this, gameState.phase)
    }

    return
  }

  // Don't process updates for the room until preload/init is complete
  if (preloadComplete[gameState.phase]) {
    // Some states may have a custom update
    if (gamePhaseFunctions[gameState.phase]?.update) {
      gamePhaseFunctions[gameState.phase]?.update?.(this, time, delta)
    } else {
      // Otherwise, use the standard engine update
      update(this, time, delta)
    }
  }
}

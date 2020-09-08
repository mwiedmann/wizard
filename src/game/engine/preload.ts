import { gameObjects } from '../game-objects'
import { gameState } from '../scene-update'
import { ILayout, layout } from './layout'

export const preloadComplete: Record<string, boolean> = {}

export const preloadRoom = (
  scene: Phaser.Scene,
  roomKey: string,
  init?: (scene: Phaser.Scene, roomKey: string) => void
): void => {
  console.log('Staring preload for', roomKey)

  /** Helper to call custom init or standard layout and mark the preload as complete */
  const loadingComplete = () => {
    if (init) {
      init(scene, roomKey)
    } else {
      layout(scene, roomKey)
    }
    preloadComplete[roomKey] = true
  }

  // When the json for this room is loaded,
  // start loading all of the images.
  // When they are all done, mark the level as loaded and call init
  const jsonLoaded = () => {
    const roomConfig: ILayout = scene.game.cache.json.get(roomKey)

    // Move the guy to the dropArea
    if (roomConfig.dropAreas) {
      const guyLocation = roomConfig.dropAreas.find((d) => d.key === gameState.dropArea)
      if (!guyLocation) {
        throw new Error(`Could not find dropArea: ${gameState.dropArea}`)
      }
      gameObjects.guy.setPosition(guyLocation.x, guyLocation.y)
    }

    // If we have already loaded everything on a previous visit, OR
    // If no images are defined for this room, then
    // Move to loadingComplete
    if (preloadComplete[roomKey] || !roomConfig.images || roomConfig.images.length === 0) {
      console.log(roomKey, 'skipping preload')
      loadingComplete()
      return
    }

    let filesRemaining = roomConfig.images.length

    scene.load.on('filecomplete', (loadedFile: string) => {
      filesRemaining -= 1
      console.log('Loaded image:', loadedFile, ' files remaining:', filesRemaining)

      if (filesRemaining === 0) {
        scene.load.off('filecomplete')
        loadingComplete()
      }
    })

    roomConfig.images.forEach((image) => {
      const imageKey = image.global ? image.key : `${roomKey}-${image.key}`
      scene.load.image(imageKey, `images/${image.url}`)
      scene.load.start()
    })
  }

  // We need to use a filecomplete event when loading the json for the 1st time
  scene.load.once('filecomplete', () => {
    console.log('Loaded json')
    jsonLoaded()
  })

  // Load room JSON or pull from cache
  if (!scene.game.cache.json.has(roomKey)) {
    scene.load.json(roomKey, `config/${roomKey}.json`)
    scene.load.start()
  } else {
    jsonLoaded()
  }
}

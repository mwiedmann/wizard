import { gameObjects } from '../game-objects'
import { gameState, KnownGameStateKeys } from '../scene-update'
import { collisionCategories, collisionMasks } from './collisions'
import { IGateLayout, IOnTouch } from './layout'

abstract class ActivateBase {
  constructor(public activateKey: KnownGameStateKeys | undefined, public activateReverse: boolean | undefined) {}

  abstract create(scene: Phaser.Scene): void
  abstract remove(scene: Phaser.Scene): void

  checkState(scene: Phaser.Scene): void {
    if (this.activateKey) {
      // activateReverse will create when the key is NOT true in the state
      // so we check both cases
      const shouldCreate =
        (this.activateReverse && !gameState.state[this.activateKey]) ||
        (!this.activateReverse && gameState.state[this.activateKey])
      if (shouldCreate) {
        this.create(scene)
      } else {
        this.remove(scene)
      }
    }
  }
}
export class ActivateImage extends ActivateBase {
  constructor(
    activateKey: KnownGameStateKeys | undefined,
    activateReverse: boolean | undefined,
    public imageKey: string | undefined,
    public x: number,
    public y: number,
    public imageDepth: number
  ) {
    super(activateKey, activateReverse)
  }

  imageRef?: Phaser.GameObjects.Image

  create(scene: Phaser.Scene): void {
    if (this.imageKey && !this.imageRef) {
      this.imageRef = scene.add.image(this.x, this.y, this.imageKey)
      this.imageRef.setDepth(this.imageDepth)
      console.log('created image', this.imageKey, this.imageDepth)
    }
  }

  remove(scene: Phaser.Scene): void {
    if (this.imageRef) {
      scene.matter.world.remove(this.imageRef)
      this.imageRef.destroy()
      this.imageRef = undefined
    }
  }
}

export class ActivateBlock extends ActivateImage {
  constructor(
    activateKey: KnownGameStateKeys | undefined,
    activateReverse: boolean | undefined,
    imageKey: string | undefined,
    x: number,
    y: number,
    imageDepth: number,
    public width: number,
    public height: number,
    public blockLayout: { onTouch?: IOnTouch; isEmpty?: boolean }
  ) {
    super(activateKey, activateReverse, imageKey, x, y, imageDepth)
  }

  blockRef?: MatterJS.BodyType

  create(scene: Phaser.Scene): void {
    super.create(scene)

    if (!this.blockRef) {
      this.blockRef = scene.matter.add.rectangle(this.x, this.y, this.width, this.height, {
        isStatic: true,
        collisionFilter: this.blockLayout.isEmpty
          ? {}
          : { category: collisionCategories.static, mask: collisionMasks.static },
      })

      if (this.blockLayout.onTouch) {
        const onTouch = this.blockLayout.onTouch

        this.blockRef.setOnCollideWith(gameObjects.guy.body as MatterJS.BodyType, () => {
          gameState.state[onTouch.key] = onTouch.isToggle ? !gameState.state[onTouch.key] : true
          gameState.stateChanged = true
          console.log('triggered block', onTouch, 'value now:', gameState.state[onTouch.key])
        })
      }
    }
  }

  remove(scene: Phaser.Scene): void {
    super.remove(scene)
    if (this.blockRef) {
      scene.matter.world.remove(this.blockRef)
      this.blockRef = undefined
    }
  }
}

export class ActivateGate extends ActivateBlock {
  constructor(
    activateKey: KnownGameStateKeys | undefined,
    activateReverse: boolean | undefined,
    imageKey: string | undefined,
    x: number,
    y: number,
    imageDepth: number,
    width: number,
    height: number,
    public gateLayout: IGateLayout
  ) {
    super(activateKey, activateReverse, imageKey, x, y, imageDepth, width, height, {})
  }

  create(scene: Phaser.Scene): void {
    super.create(scene)

    if (this.blockRef) {
      this.blockRef.setOnCollideWith(gameObjects.guy.body as MatterJS.BodyType, () => {
        gameState.phase = this.gateLayout.toRoom
        gameState.dropArea = this.gateLayout.dropArea
        gameObjects.guy.setVelocity(0, 0)
        console.log('hit gate', this.gateLayout.toRoom, this.gateLayout.dropArea)
      })
    }
  }
}

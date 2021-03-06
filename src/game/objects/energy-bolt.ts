import { collisionCategories, collisionMasks } from '../engine/collisions'

export class EnergyBolt extends Phaser.Physics.Matter.Sprite {
  constructor(
    world: Phaser.Physics.Matter.World,
    x: number,
    y: number,
    public timeCast: number,
    texture: string,
    frame: string | integer
  ) {
    super(world, x, y, texture, frame, {
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0,
      density: 0.01,
      ignoreGravity: true,
      collisionFilter: {
        category: collisionCategories.guySpell,
        mask: collisionMasks.guySpell,
      },
    })
    this.setDepth(998)
    this.particleManager = this.scene.add.particles('energy-bolt').setDepth(998)
  }

  particleManager: Phaser.GameObjects.Particles.ParticleEmitterManager

  lifespan = 0
  remove = false

  fire(direction: number, lifespan: number): void {
    this.setVelocity(direction * 10, 0)
    this.lifespan = lifespan

    const emitter = this.particleManager.createEmitter({
      speed: 30,
      scale: { start: 1, end: 0 },
      blendMode: 'ADD',
      lifespan: 150,
    })

    emitter.startFollow(this)
  }

  update(time: number, delta: number): void {
    this.lifespan -= delta
    if (this.lifespan <= 0) {
      this.done()
    }
  }

  done(): void {
    this.particleManager.destroy()
    this.destroy()
    this.remove = true
  }
}

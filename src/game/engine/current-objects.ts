import { MonsterBase } from '../objects/monster-base'
import { ActivateBlock, ActivateImage, ActivateGate } from './activate-object'

export const currentObjects: {
  blocks: ActivateBlock[]
  images: ActivateImage[]
  gates: ActivateGate[]
  monsters: MonsterBase[]
  activateEvents: { key: string; event: () => void }[]
} = {
  blocks: [],
  images: [],
  gates: [],
  monsters: [],
  activateEvents: [],
}

export const objectsWithActiveKey = (): ActivateImage[] => [
  ...currentObjects.blocks.filter((b) => b.activateKey),
  ...currentObjects.images.filter((b) => b.activateKey),
  ...currentObjects.gates.filter((b) => b.activateKey),
]

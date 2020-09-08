import { Guy } from './objects/guy'

/**
 * These objects will be set during init and we don't want to deal
 * with strict mode complaining that they could be undefined so we
 * cheat and give them a !
 */
class GameObjects {
  guy!: Guy
}

export const gameObjects = new GameObjects()

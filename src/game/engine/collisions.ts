export const collisionCategories = {
  static: 1,
  guy: 2,
  monster: 4,
  guySpell: 8,
  monsterAttack: 16,
}

export const collisionMasks = {
  // static collides with everything
  static:
    collisionCategories.guy |
    collisionCategories.monster |
    collisionCategories.guySpell |
    collisionCategories.monsterAttack,
  guy: collisionCategories.static | collisionCategories.monster | collisionCategories.monsterAttack,
  monster: collisionCategories.static | collisionCategories.guy | collisionCategories.guySpell,
  guySpell: collisionCategories.static | collisionCategories.monster,
  monsterAttack: collisionCategories.static | collisionCategories.guy,
}

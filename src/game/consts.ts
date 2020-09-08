export const gameSettings = {
  screenWidth: 1920,
  screenHeight: 1080,
  fieldWidth: 1920,
  fieldHeight: 1080,
  gameCameraZoom: 1.3,
  mapCameraZoom: 0.16,
  worldBoundEdgeSize: 32,
}

export const settingsHelpers = {
  fieldWidthMid: gameSettings.fieldWidth / 2,
  fieldHeightMid: gameSettings.fieldHeight / 2,
  worldBoundWidth: gameSettings.fieldWidth,
  worldBoundHeight: gameSettings.fieldHeight,
  mapCameraWidth: Math.round(gameSettings.fieldWidth / 5),
  mapCameraHeight: Math.round(gameSettings.fieldHeight / 5),
}

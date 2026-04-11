/**
 * Shared Three.js / DOM handles (filled during init).
 * Keeps modules decoupled from a single monolithic script.
 */
export const world = {
  scene: null,
  camera: null,
  renderer: null,
  car: null,
  roadRig: null,
  centerDashLine: null,
  leftEdgeDashLine: null,
  rightEdgeDashLine: null,
  leftDividerDashLine: null,
  trafficLightGroup: null,
  trafficBulbMaterials: { red: null, yellow: null, green: null },
  trafficSignalBarMat: null,
  trafficSignalPanelMat: null,
  intersectionGroup: null,
  strandedCarGroup: null,
  strandedHazardLights: [],
  obstacleCarGroup: null,
  dashCanvas: null,
  dashCtx: null,
};

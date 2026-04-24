/**
 * Autonomous Car
 * This is a self driving car simulator project
 * Perception / geometric queries (no rendering).
 * Feeds the vehicle FSM with distance-style facts.
 */
import * as C from "./config.js";

export function forwardFromYaw(yaw) {
  return { x: Math.sin(yaw), z: -Math.cos(yaw) };
}

/** Signed distance along Z to the stop line (positive = before stop, driving forward). */
export function distanceBeforeTrafficStop(carZ) {
  return carZ - C.TRAFFIC_STOP_CENTER_Z;
}

export function shouldStartLightApproach(carZ, trafficLightPassed) {
  return !trafficLightPassed && carZ < C.LIGHT_APPROACH_Z;
}

/**
 * Longitudinal distance to the stranded car along −Z travel (positive until ego passes its Z).
 */
export function distanceToStrandedCarAhead(carZ) {
  return carZ - C.STRANDED_CAR_Z;
}

/**
 * Longitudinal distance to the right-lane obstacle (positive until ego passes its Z).
 */
export function distanceToObstacleAhead(carZ) {
  return carZ - C.OBSTACLE_CAR_Z;
}

/**
 * Simple lane-change safety rule:
 * only begin a lane change if we still have enough longitudinal room.
 */
export function safeToChangeLane(distanceAhead, minDistance) {
  return distanceAhead > minDistance;
}

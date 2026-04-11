/**
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
 * Longitudinal distance (m) to the stranded vehicle ahead in the left lane.
 * Positive while approaching from behind; ≤0 once the ego passes its Z.
 */
export function distanceToStrandedCarAhead(carZ) {
  return carZ - C.STRANDED_CAR_Z;
}

/** Longitudinal distance (m) to the right-lane obstacle when it is active (same sign convention as stranded). */
export function distanceToObstacleAhead(carZ) {
  return carZ - C.OBSTACLE_CAR_Z;
}

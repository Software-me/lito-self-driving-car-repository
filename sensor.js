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

export function shouldStartStrandedSequence(carZ, strandedCarPassed) {
  return !strandedCarPassed && carZ < C.STRANDED_APPROACH_Z;
}

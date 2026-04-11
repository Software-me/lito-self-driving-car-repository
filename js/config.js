/** World / lane / traffic constants (single source of truth) */
export const LEFT_LANE_X = -3.2;
export const RIGHT_LANE_X = 3.2;

/** Repeating trees + street lamps along −Z (12 m/s × 600 s ≈ 7200 m+ of road; SCENERY_Z_END gives margin for stops). */
export const SCENERY_Z_START = 250;
export const SCENERY_Z_END = -11000;
/** Poles both sides every N m from SCENERY_Z_START → SCENERY_Z_END (40 aligns a row with LIGHT_STOP_Z = -70). */
export const STREET_LAMP_SPACING = 40;
/** Sparse warm pool under poles: PointLight on both sides every Nth row (keep N ≥ 8 on low-end GPUs). */
export const STREET_LAMP_POINT_LIGHT_EVERY_N = 10;
/**
 * Longitudinal lane dashes: z_vertex = BASE + scroll, scroll = −car.position.z (world +Z slides as car drives −Z).
 * BASE_FAR must stay below 2×min(car.z) so the forward vertex stays ahead; derived from SCENERY_Z_END.
 */
export const DASH_LINE_BASE_NEAR = 900;
export const DASH_LINE_BASE_FAR = 2 * SCENERY_Z_END - 2500;

/** Fog / clip tuned so long cruise recordings stay visible (raise with SCENERY_Z_END if needed). */
export const FOG_NEAR = 90;
export const FOG_FAR = 1100;
export const CAMERA_FAR = 2200;

export const LIGHT_STOP_Z = -70;
export const TRAFFIC_STOP_CENTER_Z = LIGHT_STOP_Z + 18.286;
export const LIGHT_APPROACH_Z = -40;

export const STRANDED_CAR_Z = -326.75;
/** Longitudinal gap (m) below which the left-lane FSM treats the lane as blocked (signal + pass). ~same geometry as former fixed-Z trigger (~70 m). */
export const BLOCK_THRESHOLD = 70;
/** Within this range (m), cruise speed is reduced toward the stranded car (same idea as traffic stop). */
export const STRANDED_FORWARD_SLOW_RADIUS_M = 92;

/** Right-lane obstacle (appears after OBSTACLE_DELAY_AFTER_STRANDED_S); ego avoids by sensing + lane change. */
export const OBSTACLE_CAR_Z = -478;
/** Seconds after stranded pass completes before obstacle becomes visible + sensed. */
export const OBSTACLE_DELAY_AFTER_STRANDED_S = 5;
export const OBSTACLE_BLOCK_THRESHOLD_M = 70;
export const OBSTACLE_FORWARD_SLOW_RADIUS_M = 92;
/** Floor (m/s) while still ahead of obstacle — prevents distObs*0.85→0 from freezing the car. */
export const OBSTACLE_MIN_CREEP_MPS = 2.8;
/** Ego z must be this far past OBSTACLE_CAR_Z before returning to right lane. */
export const OBSTACLE_PASS_CLEAR_M = 14;

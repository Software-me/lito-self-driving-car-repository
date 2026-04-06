/** Vehicle mesh, physics integration, manual controls, autonomous FSM. */
import { world as W } from "./world.js";
import * as C from "./config.js";
import * as sensor from "./sensor.js";
import { setTrafficBulbVisuals, syncTrafficLightWorldPosition } from "./traffic.js";
import { updateDashLineScroll } from "./road.js";

export let autonomous = true;

export const controls = { throttle: 0, brake: 0, steerInput: 0 };

export let speed = 0;
export let steering = 0;

let lanePhase = "right_lane";
let lanePhaseTimer = 0;
/** Only counts during changing_lane_* so progress isn’t tied to shared lanePhaseTimer. */
let laneChangeElapsed = 0;
let trafficLightPassed = false;
let strandedCarPassed = false;

export function toggleAutonomous() {
  autonomous = !autonomous;
}

const TURN_SIGNAL_BLINK_MS = 480;

function turnSignalBlinkPhase(nowMs) {
  return Math.floor(nowMs / TURN_SIGNAL_BLINK_MS) % 2 === 0 ? "lit" : "dim";
}

/** Dashboard left telltale: blinking during left signal + lane change (autonomous). */
export function getLeftTurnSignalPhase(nowMs) {
  if (!autonomous) return "off";
  if (lanePhase !== "signal_left_after_green" && lanePhase !== "changing_lane_left") return "off";
  return turnSignalBlinkPhase(nowMs);
}

/** Dashboard right telltale: blinking before / during lane change for stranded pass (autonomous). */
export function getRightTurnSignalPhase(nowMs) {
  if (!autonomous) return "off";
  if (lanePhase !== "signal_right_for_stranded" && lanePhase !== "changing_lane_right_for_stranded") {
    return "off";
  }
  return turnSignalBlinkPhase(nowMs);
}

export function buildCar() {
  const THREE = globalThis.THREE;
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x42a5f5,
    metalness: 0.5,
    roughness: 0.35,
  });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.55, 2.5), bodyMat);
  body.position.y = 0.55;
  body.castShadow = false;

  const cabinMat = new THREE.MeshStandardMaterial({
    color: 0x90caf9,
    transparent: true,
    opacity: 0.92,
  });
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.5, 1.25), cabinMat);
  cabin.position.set(0, 1.05, -0.15);

  W.car = new THREE.Group();
  W.car.add(body, cabin);
  W.car.position.set(C.RIGHT_LANE_X, 0, 6);
  W.scene.add(W.car);
}

export function resetVehicleState() {
  if (!W.car) return;
  W.car.position.set(C.RIGHT_LANE_X, 0, 6);
  W.car.rotation.y = 0;
  speed = 0;
  steering = 0;
  controls.throttle = 0;
  controls.brake = 0;
  controls.steerInput = 0;
  lanePhase = "right_lane";
  lanePhaseTimer = 0;
  laneChangeElapsed = 0;
  trafficLightPassed = false;
  strandedCarPassed = false;
}

/**
 * One simulation step: FSM, steering, integration, camera, HUD, road follow.
 * @param {object} hud — { speedLabel, statusLabel, steeringWheel, modeLabel }
 */
export function updateVehicle(dt, hud) {
  const THREE = globalThis.THREE;
  const maxSpeed = 22;
  const accel = 16;
  const brakeDecel = 22;

  let targetSpeed = 0;
  if (autonomous) {
    targetSpeed = 12;
  } else {
    if (controls.throttle) targetSpeed = maxSpeed;
    else if (controls.brake) targetSpeed = 0;
    else targetSpeed = speed * 0.92;
  }

  let targetSteer = 0;
  if (autonomous) {
    if (lanePhase === "changing_lane_left" || lanePhase === "changing_lane_right_for_stranded") {
      laneChangeElapsed += dt;
    } else {
      laneChangeElapsed = 0;
    }
    lanePhaseTimer += dt;
    const z = W.car.position.z;

    if (lanePhase === "right_lane") {
      targetSteer = 0;
      W.car.position.x = C.RIGHT_LANE_X;
      if (sensor.shouldStartLightApproach(z, trafficLightPassed)) {
        lanePhase = "traffic_approach";
        lanePhaseTimer = 0;
      }
    } else if (lanePhase === "traffic_approach") {
      const distBeforeStop = sensor.distanceBeforeTrafficStop(z);
      targetSteer = 0;
      W.car.position.x = C.RIGHT_LANE_X;
      if (distBeforeStop <= 0.25) {
        W.car.position.z = C.TRAFFIC_STOP_CENTER_Z;
        speed = 0;
        targetSpeed = 0;
        lanePhase = "traffic_wait";
        lanePhaseTimer = 0;
        setTrafficBulbVisuals("red");
      } else {
        targetSpeed = Math.min(12, Math.max(0, distBeforeStop * 0.85));
      }
    } else if (lanePhase === "traffic_wait") {
      targetSpeed = 0;
      targetSteer = 0;
      W.car.position.x = C.RIGHT_LANE_X;
      if (lanePhaseTimer > 2.4) {
        setTrafficBulbVisuals("green");
      }
      if (lanePhaseTimer > 4.9) {
        trafficLightPassed = true;
        lanePhase = "post_green_delay";
        lanePhaseTimer = 0;
      }
    } else if (lanePhase === "post_green_delay") {
      targetSteer = 0;
      W.car.position.x = C.RIGHT_LANE_X;
      if (lanePhaseTimer > 10.0) {
        lanePhase = "signal_left_after_green";
        lanePhaseTimer = 0;
      }
    } else if (lanePhase === "signal_left_after_green") {
      targetSteer = 0;
      W.car.position.x = C.RIGHT_LANE_X;
      if (lanePhaseTimer > 4.0) {
        lanePhase = "changing_lane_left";
        lanePhaseTimer = 0;
      }
    } else if (lanePhase === "changing_lane_left") {
      targetSteer = 0;
      const changeDuration = 2.2;
      const t = Math.min(1, laneChangeElapsed / changeDuration);
      W.car.position.x = C.RIGHT_LANE_X + (C.LEFT_LANE_X - C.RIGHT_LANE_X) * t;
      if (t >= 1) {
        lanePhase = "left_lane";
        lanePhaseTimer = 0;
        laneChangeElapsed = 0;
      }
    } else if (lanePhase === "left_lane") {
      targetSteer = 0;
      W.car.position.x = C.LEFT_LANE_X;
      if (sensor.shouldStartStrandedSequence(z, strandedCarPassed)) {
        lanePhase = "signal_right_for_stranded";
        lanePhaseTimer = 0;
      }
    } else if (lanePhase === "signal_right_for_stranded") {
      targetSteer = 0;
      W.car.position.x = C.LEFT_LANE_X;
      if (lanePhaseTimer > 2.5) {
        lanePhase = "changing_lane_right_for_stranded";
        lanePhaseTimer = 0;
      }
    } else if (lanePhase === "changing_lane_right_for_stranded") {
      targetSteer = 0;
      const changeDuration = 2.2;
      const t = Math.min(1, laneChangeElapsed / changeDuration);
      W.car.position.x = C.LEFT_LANE_X + (C.RIGHT_LANE_X - C.LEFT_LANE_X) * t;
      if (t >= 1) {
        lanePhase = "right_lane";
        lanePhaseTimer = 0;
        laneChangeElapsed = 0;
        strandedCarPassed = true;
      }
    }
  } else {
    targetSteer = controls.steerInput * 0.9;
  }

  if (targetSpeed > speed) {
    speed = Math.min(targetSpeed, speed + accel * dt);
  } else {
    speed = Math.max(targetSpeed, speed - brakeDecel * dt);
    if (speed < 0.05) speed = 0;
  }

  const steerRate = 4;
  steering += (targetSteer - steering) * Math.min(1, steerRate * dt);
  if (
    autonomous &&
    (lanePhase === "left_lane" ||
      lanePhase === "right_lane" ||
      lanePhase === "changing_lane_left" ||
      lanePhase === "changing_lane_right_for_stranded")
  ) {
    steering += (0 - steering) * Math.min(1, 7 * dt);
  }

  const yaw = W.car.rotation.y;
  const fwd = sensor.forwardFromYaw(yaw);
  const inLaneChange =
    autonomous &&
    (lanePhase === "changing_lane_left" || lanePhase === "changing_lane_right_for_stranded");
  if (!inLaneChange) {
    W.car.position.x += fwd.x * speed * dt;
  }
  W.car.position.z += fwd.z * speed * dt;
  W.car.rotation.y += steering * dt;

  if (autonomous && lanePhase === "left_lane") {
    W.car.position.x = C.LEFT_LANE_X;
  }

  // Road stays fixed in world X so lane changes move the car across markings (rig.x was car.x before).
  if (W.roadRig) {
    W.roadRig.position.set(0, 0, W.car.position.z - 380);
  }

  syncTrafficLightWorldPosition();

  const eye = new THREE.Vector3(W.car.position.x, W.car.position.y + 1.35, W.car.position.z);
  const f = sensor.forwardFromYaw(W.car.rotation.y);
  eye.x += f.x * 0.35;
  eye.z += f.z * 0.35;

  const lookDist = 28;
  const lookAt = new THREE.Vector3(
    eye.x + f.x * lookDist,
    eye.y - 0.15,
    eye.z + f.z * lookDist,
  );

  W.camera.position.copy(eye);
  W.camera.lookAt(lookAt);

  if (hud.speedLabel) hud.speedLabel.textContent = `${speed.toFixed(1)} m/s`;
  if (hud.statusLabel) {
    let status = "Following lane";
    if (!autonomous) status = "Manual control";
    else if (lanePhase === "post_green_delay") status = "Following lane";
    else if (lanePhase === "signal_left_after_green") status = "Left turn signal";
    else if (lanePhase === "changing_lane_left") status = "Changing lane left";
    else if (lanePhase === "signal_right_for_stranded") status = "Right turn signal — stranded car ahead";
    else if (lanePhase === "changing_lane_right_for_stranded") status = "Changing lane right — avoiding stranded car";
    else if (lanePhase === "traffic_approach") status = "Approaching red traffic light";
    else if (lanePhase === "traffic_wait" && lanePhaseTimer <= 2.4) status = "Stopped — red light";
    else if (lanePhase === "traffic_wait") status = "Green light — proceeding";
    hud.statusLabel.textContent = status;
  }

  updateDashLineScroll();

  // HUD wheel: lane changes move X only (steering≈0). One motion per maneuver — only during
  // changing_lane_* (not during signal_*), so we don’t “turn left” twice (signal then lane change).
  let wheelExtraDeg = 0;
  if (autonomous) {
    const changeDuration = 2.2;
    if (lanePhase === "changing_lane_left") {
      const t = Math.min(1, laneChangeElapsed / changeDuration);
      wheelExtraDeg = -55 * Math.sin(Math.PI * t);
    } else if (lanePhase === "changing_lane_right_for_stranded") {
      const t = Math.min(1, laneChangeElapsed / changeDuration);
      wheelExtraDeg = 55 * Math.sin(Math.PI * t);
    }
  }

  if (hud.steeringWheel) {
    const deg = THREE.MathUtils.radToDeg(steering) * 2.2 + wheelExtraDeg;
    hud.steeringWheel.style.transform = `translateY(-1.25rem) rotate(${deg}deg)`;
  }
}

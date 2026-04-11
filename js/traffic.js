/** Traffic lights, stranded vehicle, bulb state. */
import { world as W } from "./world.js";
import * as C from "./config.js";

export function buildTrafficLight() {
  const THREE = globalThis.THREE;
  const g = new THREE.Group();
  g.position.set(0, 0, 0);

  const poleMat = new THREE.MeshBasicMaterial({ color: 0x3a3a3a });
  const beamY = 4.7;
  const gantryZ = C.LIGHT_STOP_Z;
  const beamLenX = 16.0;
  const beam = new THREE.Mesh(new THREE.BoxGeometry(beamLenX, 0.18, 0.55), poleMat);
  beam.position.set(0, beamY, gantryZ);
  g.add(beam);

  const supportX = 7.2;
  function addSupport(x) {
    const support = new THREE.Mesh(new THREE.BoxGeometry(0.22, 4.7, 0.22), poleMat);
    support.position.set(x, beamY - 2.35, gantryZ);
    g.add(support);
  }
  addSupport(-supportX);
  addSupport(supportX);

  const headBoxMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
  const headXs = [-3.2, 0, 3.2];
  const headCenterY = 2.85;
  const bulbYOffset = 0.33;
  const bulbRadius = 0.16;
  const bulbZ = gantryZ + 0.22;

  W.trafficBulbMaterials.red = new THREE.MeshBasicMaterial({ color: 0xff2222 });
  W.trafficBulbMaterials.yellow = new THREE.MeshBasicMaterial({ color: 0x333300 });
  W.trafficBulbMaterials.green = new THREE.MeshBasicMaterial({ color: 0x003300 });

  function addSignalHead(x) {
    const housing = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.35, 0.35), headBoxMat);
    housing.position.set(x, headCenterY, gantryZ);
    g.add(housing);

    const red = new THREE.Mesh(new THREE.SphereGeometry(bulbRadius, 16, 16), W.trafficBulbMaterials.red);
    const yellow = new THREE.Mesh(new THREE.SphereGeometry(bulbRadius, 16, 16), W.trafficBulbMaterials.yellow);
    const green = new THREE.Mesh(new THREE.SphereGeometry(bulbRadius, 16, 16), W.trafficBulbMaterials.green);

    red.position.set(0, headCenterY + bulbYOffset, bulbZ);
    yellow.position.set(0, headCenterY, bulbZ);
    green.position.set(0, headCenterY - bulbYOffset, bulbZ);

    const head = new THREE.Group();
    head.position.set(x, 0, 0);
    head.add(red, yellow, green);
    g.add(head);
  }

  headXs.forEach(addSignalHead);

  W.trafficSignalBarMat = null;
  W.trafficSignalPanelMat = null;

  W.scene.add(g);
  W.trafficLightGroup = g;
  setTrafficBulbVisuals("red");
}

export function buildStrandedCar() {
  const THREE = globalThis.THREE;
  W.strandedHazardLights.length = 0;
  const g = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x8b7355,
    metalness: 0.4,
    roughness: 0.5,
  });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.55, 2.6), bodyMat);
  body.position.y = 0.55;

  const cabinMat = new THREE.MeshStandardMaterial({
    color: 0xa0826d,
    metalness: 0.35,
    roughness: 0.55,
  });
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.5, 1.3), cabinMat);
  cabin.position.set(0, 1.05, -0.15);

  g.add(body, cabin);

  const hazardMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
  const hazardGeom = new THREE.SphereGeometry(0.08, 8, 8);
  const positions = [
    [0.55, 0.9, 1.0],
    [-0.55, 0.9, 1.0],
    [0.55, 0.9, -1.0],
    [-0.55, 0.9, -1.0],
  ];
  positions.forEach(([x, y, z]) => {
    const light = new THREE.Mesh(hazardGeom, hazardMat.clone());
    light.position.set(x, y, z);
    g.add(light);
    W.strandedHazardLights.push(light);
  });

  g.position.set(C.LEFT_LANE_X, 0, C.STRANDED_CAR_Z);
  W.scene.add(g);
  W.strandedCarGroup = g;
}

/** Debris-style obstacle in the right lane; shown after post-stranded delay (see car FSM). */
export function buildObstacleCar() {
  const THREE = globalThis.THREE;
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xc62828,
    metalness: 0.35,
    roughness: 0.55,
  });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 2.4), bodyMat);
  body.position.y = 0.5;
  const coneMat = new THREE.MeshStandardMaterial({ color: 0xff6f00, metalness: 0.2, roughness: 0.6 });
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.75, 8), coneMat);
  cone.position.set(0.45, 0.85, 0.2);
  cone.rotation.z = Math.PI * 0.15;
  g.add(body, cone);
  g.position.set(C.RIGHT_LANE_X, 0, C.OBSTACLE_CAR_Z);
  g.visible = false;
  W.scene.add(g);
  W.obstacleCarGroup = g;
}

export function setObstacleCarVisible(visible) {
  if (W.obstacleCarGroup) W.obstacleCarGroup.visible = !!visible;
}

export function syncTrafficLightWorldPosition() {
  if (!W.trafficLightGroup) return;
  W.trafficLightGroup.position.set(0, 0, 0);
}

export function setTrafficBulbVisuals(state) {
  const r = W.trafficBulbMaterials.red;
  const y = W.trafficBulbMaterials.yellow;
  const gr = W.trafficBulbMaterials.green;
  if (!r || !y || !gr) return;
  const dim = 0x333333;
  const brightR = 0xff2222;
  const brightY = 0xffcc00;
  const brightG = 0x33ff66;
  if (state === "red") {
    r.color.setHex(brightR);
    y.color.setHex(dim);
    gr.color.setHex(dim);
    if (W.trafficSignalBarMat) W.trafficSignalBarMat.color.setHex(0xff3333);
    if (W.trafficSignalPanelMat) W.trafficSignalPanelMat.color.setHex(0xff4444);
  } else if (state === "green") {
    r.color.setHex(dim);
    y.color.setHex(dim);
    gr.color.setHex(brightG);
    if (W.trafficSignalBarMat) W.trafficSignalBarMat.color.setHex(0x33ff66);
    if (W.trafficSignalPanelMat) W.trafficSignalPanelMat.color.setHex(0x44ff88);
  } else {
    r.color.setHex(dim);
    y.color.setHex(brightY);
    gr.color.setHex(dim);
  }
}

export function resetTrafficVisuals() {
  syncTrafficLightWorldPosition();
  setTrafficBulbVisuals("red");
  setObstacleCarVisible(false);
}

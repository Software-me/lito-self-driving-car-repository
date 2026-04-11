/**
 * Entry: renderer, scene, camera, HUD, game loop, 2D dash overlay.
 * Vehicle + environment live in car.js, road.js, traffic.js, sensor.js, config.js.
 */
import { world as W } from "./world.js";
import * as C from "./config.js";
import * as road from "./road.js";
import * as traffic from "./traffic.js";
import * as car from "./car.js";

let lastTime = performance.now();

const hud = {};
let telltaleLeftEl = null;
let telltaleRightEl = null;

/** Merged keyboard + on-screen controls (phones have no WASD). */
const keyState = {
  throttle: false,
  brake: false,
  steerLeft: false,
  steerRight: false,
};
const touchState = {
  throttle: false,
  brake: false,
  steerLeft: false,
  steerRight: false,
};

function syncCarControls() {
  car.controls.throttle = keyState.throttle || touchState.throttle ? 1 : 0;
  car.controls.brake = keyState.brake || touchState.brake ? 1 : 0;
  let steer = 0;
  if (keyState.steerLeft || touchState.steerLeft) steer -= 1;
  if (keyState.steerRight || touchState.steerRight) steer += 1;
  car.controls.steerInput = steer;
}

function clearKeyboardInput() {
  keyState.throttle = false;
  keyState.brake = false;
  keyState.steerLeft = false;
  keyState.steerRight = false;
}

function buildLights() {
  const THREE = globalThis.THREE;
  W.scene.add(new THREE.AmbientLight(0xffffff, 0.85));
  const dir = new THREE.DirectionalLight(0xffffff, 0.9);
  dir.position.set(8, 25, 12);
  W.scene.add(dir);
}

function resizeDash() {
  if (!W.dashCanvas) return;
  const h = Math.floor(window.innerHeight * 0.38);
  W.dashCanvas.width = window.innerWidth;
  W.dashCanvas.height = Math.max(120, h);
}

function onResize() {
  W.camera.aspect = window.innerWidth / window.innerHeight;
  W.camera.updateProjectionMatrix();
  W.renderer.setSize(window.innerWidth, window.innerHeight);
  resizeDash();
}

function onKeyDown(e) {
  if (e.code === "ArrowUp" || e.code === "KeyW") keyState.throttle = true;
  if (e.code === "ArrowDown" || e.code === "KeyS") keyState.brake = true;
  if (e.code === "ArrowLeft" || e.code === "KeyA") keyState.steerLeft = true;
  if (e.code === "ArrowRight" || e.code === "KeyD") keyState.steerRight = true;
}

function onKeyUp(e) {
  if (e.code === "ArrowUp" || e.code === "KeyW") keyState.throttle = false;
  if (e.code === "ArrowDown" || e.code === "KeyS") keyState.brake = false;
  if (e.code === "ArrowLeft" || e.code === "KeyA") keyState.steerLeft = false;
  if (e.code === "ArrowRight" || e.code === "KeyD") keyState.steerRight = false;
}

/**
 * @param {HTMLElement | null} el
 * @param {(v: boolean) => void} setTouch
 */
function bindHoldPointer(el, setTouch) {
  if (!el) return;
  const down = (e) => {
    if (e.button != null && e.button !== 0) return;
    e.preventDefault();
    try {
      el.setPointerCapture(e.pointerId);
    } catch (_) {
      /* ignore */
    }
    setTouch(true);
  };
  const up = () => setTouch(false);
  el.addEventListener("pointerdown", down);
  el.addEventListener("pointerup", up);
  el.addEventListener("pointercancel", up);
}

/** DOM turn telltales sit above #dash (z-index 21); canvas was hidden behind steering (z 20). */
function updateTurnTelltales(nowMs) {
  if (!telltaleLeftEl || !telltaleRightEl) return;
  telltaleLeftEl.dataset.phase = car.getLeftTurnSignalPhase(nowMs);
  telltaleRightEl.dataset.phase = car.getRightTurnSignalPhase(nowMs);
}

function drawDash() {
  if (!W.dashCtx || !W.dashCanvas) return;
  const w = W.dashCanvas.width;
  const h = W.dashCanvas.height;
  const dashCtx = W.dashCtx;
  dashCtx.clearRect(0, 0, w, h);

  const hoodTop = h * 0.15;
  const g = dashCtx.createLinearGradient(0, hoodTop, 0, h);
  g.addColorStop(0, "#3d4a5c");
  g.addColorStop(0.3, "#2a3342");
  g.addColorStop(0.6, "#1e252f");
  g.addColorStop(1, "#0a0c10");
  dashCtx.fillStyle = g;
  dashCtx.beginPath();
  dashCtx.moveTo(0, h);
  dashCtx.lineTo(0, hoodTop + 40);
  dashCtx.quadraticCurveTo(w * 0.12, hoodTop - 15, w * 0.5, hoodTop + 8);
  dashCtx.quadraticCurveTo(w * 0.88, hoodTop + 35, w, hoodTop + 40);
  dashCtx.lineTo(w, h);
  dashCtx.closePath();
  dashCtx.fill();

  dashCtx.strokeStyle = "rgba(180, 200, 220, 0.5)";
  dashCtx.lineWidth = 2;
  dashCtx.beginPath();
  dashCtx.moveTo(0, hoodTop + 40);
  dashCtx.quadraticCurveTo(w * 0.12, hoodTop - 15, w * 0.5, hoodTop + 8);
  dashCtx.quadraticCurveTo(w * 0.88, hoodTop + 35, w, hoodTop + 40);
  dashCtx.stroke();

  const cx = w * 0.72;
  const cy = h * 0.42;
  const r = Math.min(48, w * 0.065);
  const maxKmh = 220;
  const speedKmh = Math.min(maxKmh, Math.max(0, car.speed * 3.6));

  dashCtx.beginPath();
  dashCtx.arc(cx, cy, r + 6, 0, Math.PI * 2);
  dashCtx.fillStyle = "rgba(8, 10, 16, 0.94)";
  dashCtx.fill();
  dashCtx.strokeStyle = "rgba(100, 120, 150, 0.9)";
  dashCtx.lineWidth = 3;
  dashCtx.stroke();

  const start = Math.PI * 0.75;
  const sweep = Math.PI * 1.5;
  const t = speedKmh / maxKmh;
  dashCtx.beginPath();
  dashCtx.arc(cx, cy, r - 3, start, start + sweep * t);
  dashCtx.strokeStyle = "#4fc3f7";
  dashCtx.lineWidth = 4;
  dashCtx.lineCap = "round";
  dashCtx.stroke();

  dashCtx.fillStyle = "rgba(220, 230, 245, 0.95)";
  dashCtx.font = `600 ${Math.round(r * 0.36)}px system-ui, sans-serif`;
  dashCtx.textAlign = "center";
  dashCtx.textBaseline = "middle";
  dashCtx.fillText(String(Math.round(speedKmh)), cx, cy + 4);
  dashCtx.font = `500 ${Math.round(r * 0.2)}px system-ui, sans-serif`;
  dashCtx.fillStyle = "rgba(160, 180, 200, 0.85)";
  dashCtx.fillText("km/h", cx, cy + r * 0.55);
}

function resetScene() {
  car.resetVehicleState();
  traffic.resetTrafficVisuals();
}

function loop(now) {
  const t = typeof now === "number" && Number.isFinite(now) ? now : performance.now();
  const dt = Math.min((t - lastTime) / 1000, 0.08);
  lastTime = t;

  try {
    syncCarControls();
    car.updateVehicle(dt, hud);
  } catch (err) {
    console.error("updateVehicle:", err);
    if (hud.statusLabel) hud.statusLabel.textContent = "Sim error — see console (F12)";
  }

  try {
    if (W.strandedHazardLights && W.strandedHazardLights.length) {
      const flashOn = Math.floor(t / 330) % 2 === 0;
      W.strandedHazardLights.forEach((mesh) => {
        mesh.visible = flashOn;
      });
    }
    if (W.renderer && W.scene && W.camera) {
      W.renderer.render(W.scene, W.camera);
    }
  } catch (err) {
    console.error("render:", err);
    if (hud.statusLabel) hud.statusLabel.textContent = "Render error — see console (F12)";
  }

  try {
    drawDash();
  } catch (err) {
    console.error("drawDash:", err);
  }

  try {
    updateTurnTelltales(t);
  } catch (err) {
    console.warn("telltales:", err);
  }

  requestAnimationFrame(loop);
}

function init() {
  if (typeof globalThis.THREE === "undefined") {
    const el = document.getElementById("statusLabel");
    if (el) el.textContent = "Error: Three.js failed to load (check network/CDN).";
    return;
  }

  const THREE = globalThis.THREE;
  const canvas = document.getElementById("view");
  W.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  W.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  W.renderer.setSize(window.innerWidth, window.innerHeight);

  W.scene = new THREE.Scene();
  W.scene.background = new THREE.Color(0x1a2332);
  W.scene.fog = new THREE.Fog(0x1a2332, C.FOG_NEAR, C.FOG_FAR);

  W.camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, C.CAMERA_FAR);

  buildLights();
  road.buildRoad();
  road.buildFourWayIntersection();
  road.buildScenery();
  traffic.buildTrafficLight();
  traffic.buildStrandedCar();
  traffic.buildObstacleCar();
  car.buildCar();

  W.dashCanvas = document.getElementById("dash");
  W.dashCtx = W.dashCanvas ? W.dashCanvas.getContext("2d") : null;
  resizeDash();

  hud.modeLabel = document.getElementById("modeLabel");
  hud.speedLabel = document.getElementById("speedLabel");
  hud.statusLabel = document.getElementById("statusLabel");
  hud.steeringWheel = document.getElementById("steering-wheel");
  telltaleLeftEl = document.getElementById("telltale-left");
  telltaleRightEl = document.getElementById("telltale-right");

  const toggleBtn = document.getElementById("toggleModeBtn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      car.toggleAutonomous();
      if (hud.modeLabel) hud.modeLabel.textContent = car.autonomous ? "Autonomous" : "Manual";
    });
  }

  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) resetBtn.addEventListener("click", resetScene);

  window.addEventListener("resize", onResize);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", clearKeyboardInput);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") clearKeyboardInput();
  });

  bindHoldPointer(document.getElementById("touchGas"), (v) => {
    touchState.throttle = v;
  });
  bindHoldPointer(document.getElementById("touchBrake"), (v) => {
    touchState.brake = v;
  });
  bindHoldPointer(document.getElementById("touchSteerLeft"), (v) => {
    touchState.steerLeft = v;
  });
  bindHoldPointer(document.getElementById("touchSteerRight"), (v) => {
    touchState.steerRight = v;
  });

  resetScene();
  requestAnimationFrame(loop);
}

function boot() {
  try {
    init();
  } catch (e) {
    console.error(e);
    const sl = document.getElementById("statusLabel");
    if (sl) sl.textContent = "Init error: " + (e && e.message ? e.message : String(e));
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}

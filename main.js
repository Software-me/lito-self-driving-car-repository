/**
 * Entry: renderer, scene, camera, HUD, game loop, 2D dash overlay.
 * Vehicle + environment live in car.js, road.js, traffic.js, sensor.js, config.js.
 */
import { world as W } from "./world.js";
import * as road from "./road.js";
import * as traffic from "./traffic.js";
import * as car from "./car.js";

let lastTime = performance.now();

const hud = {};

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
  if (e.code === "ArrowUp" || e.code === "KeyW") car.controls.throttle = 1;
  if (e.code === "ArrowDown" || e.code === "KeyS") car.controls.brake = 1;
  if (e.code === "ArrowLeft" || e.code === "KeyA") car.controls.steerInput = -1;
  if (e.code === "ArrowRight" || e.code === "KeyD") car.controls.steerInput = 1;
}

function onKeyUp(e) {
  if (e.code === "ArrowUp" || e.code === "KeyW") car.controls.throttle = 0;
  if (e.code === "ArrowDown" || e.code === "KeyS") car.controls.brake = 0;
  if (e.code === "ArrowLeft" || e.code === "KeyA" || e.code === "ArrowRight" || e.code === "KeyD") {
    car.controls.steerInput = 0;
  }
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
  const dt = Math.min((now - lastTime) / 1000, 0.08);
  lastTime = now;

  try {
    car.updateVehicle(dt, hud);
    if (W.strandedHazardLights && W.strandedHazardLights.length) {
      const flashOn = Math.floor(now / 330) % 2 === 0;
      W.strandedHazardLights.forEach((mesh) => {
        mesh.visible = flashOn;
      });
    }
    W.renderer.render(W.scene, W.camera);
    drawDash();
  } catch (err) {
    console.error(err);
    if (hud.statusLabel) hud.statusLabel.textContent = "Render error — see console (F12)";
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
  W.scene.fog = new THREE.Fog(0x1a2332, 90, 520);

  W.camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 500);

  buildLights();
  road.buildRoad();
  road.buildFourWayIntersection();
  road.buildScenery();
  traffic.buildTrafficLight();
  traffic.buildStrandedCar();
  car.buildCar();

  W.dashCanvas = document.getElementById("dash");
  W.dashCtx = W.dashCanvas ? W.dashCanvas.getContext("2d") : null;
  resizeDash();

  hud.modeLabel = document.getElementById("modeLabel");
  hud.speedLabel = document.getElementById("speedLabel");
  hud.statusLabel = document.getElementById("statusLabel");
  hud.steeringWheel = document.getElementById("steering-wheel");

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

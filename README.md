
# 3D Autonomous Driving Simulator (Driver View)

## Live Demo
https://software-me.github.io/lito-self-driving-car-repository/

## Demo Video
**[Watch on YouTube](https://youtu.be/2_xpX455byI)**  
[![Demo — click to play on YouTube](https://img.youtube.com/vi/2_xpX455byI/hqdefault.jpg)](https://youtu.be/2_xpX455byI)

> Note: This video shows an earlier version of the simulator. The current live demo includes an updated decision-based obstacle handling system (detect → decide → act).

---

## Overview

This project is a **real-time 3D autonomous driving simulator** built with **Three.js**, featuring a driver-perspective view, interactive controls, and modular system design.

It demonstrates how a vehicle can respond to environmental cues such as traffic lights and road hazards using a **finite state machine (FSM)** approach, while maintaining a clean and extensible architecture.

This project is designed as a **shippable intermediate toward autonomous systems**, focusing on simulation, control logic, and real-time UI feedback.

---

## Features

### Autonomous Driving Behavior

- Finite State Machine (FSM) for vehicle decision-making  
- Traffic light detection and response (stop → wait → go)  
- Lane change after traffic light  
- Stranded vehicle detection and avoidance  
- Smooth lane transition logic  

---

### Manual & Mobile Controls

- Keyboard controls (W/A/S/D or arrow keys)  
- **Touch controls for mobile devices**:
  - Gas  
  - Brake  
  - Steering  
- Unified input system (`car.controls`) for all control types  

---

### Road & Environment

- Procedural road generation with lane markings  
- Four-way intersection system  
- Dynamic traffic lights (red / yellow / green)  
- Stranded car with hazard lights  
- Scenery: trees and street lighting for depth and realism  

---

### Driver HUD (UI)

- Real-time speed display (m/s and km/h)  
- Status messages (traffic, lane change, hazard detection)  
- Steering wheel animation synchronized with vehicle behavior  
- Canvas-based dashboard overlay  

---

## Decision System Upgrade

This project was extended from a primarily rule-based system into a more reactive, decision-driven architecture for obstacle handling.

### Previous Approach
Obstacle avoidance was initially implemented using fixed thresholds and scripted transitions tied to environment positions. While effective for controlled scenarios, this approach limited adaptability.

### Updated Approach
A decision-based pipeline was introduced to improve realism and flexibility:

**Detect → Decide → Act**

- **Detect**: The system computes real-time distance to obstacles and determines whether the vehicle is approaching or blocked.  
- **Decide**: A decision layer evaluates:
  - Distance to the obstacle  
  - Whether a safe lane change is possible  
- **Act**: Based on the decision:
  - The vehicle changes lanes when safe  
  - Otherwise, it slows down dynamically until a safe maneuver is possible  

### Decision Policy
- If the path is clear → continue cruising  
- If blocked and a safe gap exists → initiate lane change  
- If blocked but unsafe to change → reduce speed and wait  

### Key Improvements
- Replaced fixed, position-based triggers with dynamic decision-making  
- Introduced safety constraints for lane-change initiation  
- Implemented adaptive speed control based on obstacle proximity  
- Improved separation of concerns (perception, decision, and control layers)  

This upgrade demonstrates a transition from static behavior to more reactive, sensor-driven autonomy.

---

### Architecture

The project is built using a **modular ES module structure**:

- `js/main.js` — renderer, loop, HUD, dashboard canvas, keyboard + touch input  
- `js/car.js` — vehicle mesh, physics, manual controls, autonomous FSM  
- `js/road.js` — road mesh, lane lines, intersection, scenery  
- `js/traffic.js` — traffic lights, stranded vehicle, hazard visuals  
- `js/sensor.js` — sensing helpers used by the vehicle logic  
- `js/world.js` — shared Three.js / DOM handles  
- `js/config.js` — shared constants (fog, camera, lanes, etc.)  
- `style.css` — theme variables, HUD, dashboard, responsive + touch UI  

---

## Getting Started

### Prerequisites

- Modern browser with **WebGL** support  
- A local HTTP server (ES modules do not load from `file://`) — e.g. `python -m http.server` or VS Code Live Server  

### Installation

```bash
git clone https://github.com/Software-me/lito-self-driving-car-repository.git
cd lito-self-driving-car-repository
```

Serve the project root and open `index.html` in the browser.

---

## Motivation

This project is built as part of a self-driving car challenge aligned with the engineering approach of comma.ai](https://comma.ai/ focusing on simulation, perception-style cues, and decision-driven autonomy.

It demonstrates a progression from rule-based systems toward more reactive, sensor-driven behavior.

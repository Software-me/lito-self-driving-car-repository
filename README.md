# 3D Autonomous Driving Simulator (Driver View)

## Live Demo

👉 https://software-me.github.io/lito-self-driving-car-repository/

## Demo Video

▶️ **[Watch on YouTube](https://www.youtube.com/watch?v=AitkL__Vudg)**

[![Demo — click to play on YouTube](https://img.youtube.com/vi/AitkL__Vudg/hqdefault.jpg)](https://www.youtube.com/watch?v=AitkL__Vudg)

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

This project is built as part of a **self-driving car challenge** inspired by [comma.ai](https://comma.ai/) initiatives, demonstrating environment simulation, perception-style cues (traffic lights, hazards), and a maintainable path toward richer autonomy simulations.

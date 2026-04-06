# 3D Autonomous Driving Simulator (Driver View)

## Live Demo
👉 https://your-username.github.io/lito-self-driving-car/

## Demo Video
👉 (Paste your video link here)

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
---
A real-time 3D autonomous driving simulator built with Three.js. 
Features: - FSM-based autonomous behavior - 
Traffic light detection and response - Lane changing and hazard avoidance - 
Mobile touch controls - Real-time dashboard UI Live Demo:
https://youtu.be/AitkL__Vudg

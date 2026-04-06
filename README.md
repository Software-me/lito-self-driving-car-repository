# 3D Autonomous Driving Dashboard Simulation

![Demo GIF Placeholder](docs/demo.gif)

## Overview

This project demonstrates a modular 3D driving environment built with **Three.js**, featuring:

- **Procedural road generation** with dashed lane markings and four-way intersections  
- **Traffic lights and stranded car hazards**, including dynamic bulb states  
- **Scenery elements** such as trees and poles for depth perception  
- **HUD/dashboard overlay**, including a **speedometer** and **steering wheel visualization**  
- **Clean, maintainable code structure** with modular JS and CSS for easy expansion

This repository serves as a **proof-of-skill project** for web-based components of autonomous driving software, showcasing the ability to design, implement, and maintain a real-time simulation environment.

---

## Motivation

This project is built as part of a **self-driving car challenge** inspired by [comma.ai](https://comma.ai/) initiatives. It demonstrates:

1. **Autonomous vehicle environment simulation**  
2. **Integration of perception cues** (traffic lights, hazards)  
3. **User interface for dashboard and steering visualization**  
4. **Modular, maintainable code architecture** for incremental improvements  

The goal is to provide a **shippable intermediate** that can be expanded toward **full autonomy stack simulations**.

---

## Features

### Road & Traffic

- Procedural road with dashed lane markings  
- Four-way intersection mesh with crosswalk-style dashes  
- Dynamic traffic lights with red/yellow/green bulbs  
- Stranded car with hazard lights  

### Scenery

- Procedurally placed trees and street poles  
- Adjustable spacing and scale for depth and realism  

### Dashboard & Controls

- Real-time **speedometer** drawn on canvas overlay  
- **Steering wheel rotation** reflecting user input  
- HUD showing mode, status, and speed  
- Responsive **CSS styling** with glow/shadow effects for visibility  

### Architecture

- **Modular JS**: `road.js`, `traffic.js`, `sensor.js`, `world.js`  
- **CSS variables** for easy theme and glow updates  
- **Single source of truth** for traffic and hazard states, ready for future dynamic updates  

---

## Getting Started

### Prerequisites

- Modern browser with WebGL support  
- Optional local HTTP server (e.g., VSCode Live Server) to run `index.html`  

### Installation

1. Clone the repo:

```bash
git clone https://github.com/<Software-me>/3d-autonomous-dashboard.git
cd 3d-autonomous-dashboard

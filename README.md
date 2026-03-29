# 3D Autonomous Driving Dashboard Simulation

## Demo

Add a screen recording as `docs/demo.gif` and embed it here:

`![Demo](docs/demo.gif)`

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

This project is built as part of a **self-driving car challenge** inspired by [comma.ai](https://comma.ai/) initiatives (e.g. open tooling, shipping real software, strong GitHub presence). It demonstrates:

1. **Autonomous vehicle environment simulation**  
2. **Integration of perception cues** (traffic lights, hazards)  
3. **User interface for dashboard and steering visualization**  
4. **Modular, maintainable code architecture** for incremental improvements  

**Honest scope:** this is a **browser simulation** with rule-based autonomy and UI—not onboard openpilot. It complements a portfolio by showing **frontend + simulation + systems thinking**; roles at comma are still best pursued via **their bounties/challenges** and merged contributions to their repos.

The goal is to provide a **shippable intermediate** that can be expanded toward richer simulations or tooling.

---

## Features

### Road & traffic

- Road slab with dashed lane markings (aligned with the moving road rig)  
- Four-way intersection mesh with crosswalk-style dashes  
- Dynamic traffic lights with red / green bulb states  
- Stranded car with flashing hazard lights  

### Scenery

- Repeated trees and street poles along the route  
- Spacing and scale tuned for depth  

### Dashboard & controls

- Real-time **speedometer** on a 2D canvas overlay  
- **Steering wheel** rotation (manual + autonomous lane-change motion)  
- HUD: mode, status, speed  
- **CSS custom properties** for colors, glow, and buttons—easy to tweak or theme later  

### Architecture

| File | Role |
|------|------|
| `js/main.js` | Entry: WebGL, HUD, game loop, 2D dash, input |
| `js/car.js` | Vehicle mesh, physics, manual controls, autonomous FSM |
| `js/sensor.js` | Geometry / “perception” helpers (distances, zones) |
| `js/road.js` | Road slab, dashed lines, intersection, scenery, dash scroll |
| `js/traffic.js` | Traffic lights, stranded car, bulb state |
| `js/config.js` | Lane and traffic constants |
| `js/world.js` | Shared Three.js and DOM handles |
| `style.css` | Layout and theme variables |

---

## Getting started

### Prerequisites

- A modern browser with **WebGL**  
- A **local HTTP server** (recommended)—the app loads `main.js` as an **ES module**, which is unreliable with `file://`  

### Clone and run

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
python -m http.server 8000
```



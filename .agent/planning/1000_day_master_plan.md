# 🚀 Project "Titan Nexus": The 1000-Day Master Plan
> **Target**: Build the world's #1 Tech Talent Platform for Teenagers.  
> **Concept**: "Education 4399" — A unified portal where every link leads to a world-class interactive simulation.  
> **Timeline**: 1000 Days (Day 1: Today)

---

## 1. Vision & Core Philosophy (核心理念)

### The "Super-4399" Model
Unlike traditional LMS (Learning Management Systems) or static wikis, **Titan Nexus** is an **App Store of Knowledge**.
- **Rule #1: No Static Text.** Every topic (Astronomy, Physics, History) must be an *interactive engine* (Simulator, Game, Sandbox).
- **Rule #2: World-Class Integrations.** Do not reinvent the data.
    - *Astronomy* -> Connect to NASA/JPL Horizons API.
    - *Earth* -> Connect to Google Earth Engine / USGS.
    - *Weather* -> Connect to Windy/OpenWeatherMap.
- **Rule #3: Unified "Metaverse" Identity.** The user is a "Player" in this universe. Their `profile.html` is their command center. Their learning is "leveling up".

---

## 2. The 1000-Day Roadmap (战略路线图)

### Phase 1: Foundation & The "Big Five" (Days 1 - 100)
**Goal**: Establish the "Operating System" and the first 5 killer apps.
*   **Infrastructure**:
    *   [x] **Command Center (SaaS Profile)**: The high-density dashboard.
    *   [ ] **Star Gate (Main Navigation)**: A 3D map replacing a traditional menu.
    *   [ ] **Passport System (Auth)**: Unified login across all sub-apps.
*   **The Big Five (Interactive Flagships)**:
    1.  **Cosmos (Astronomy)**: *Done*. Solar System gravity simulation.
    2.  **Gaia (Earth Science)**: A 3D globe showing tectonic plates, wind currents, and history.
    3.  **Quantum (Physics)**: An interactive lab for circuits, optics, and forces (like phET but better).
    4.  **Helix (Life Science)**: 3D DNA editor and evolution simulator.
    5.  **Turing (Code/AI)**: The playground where they modify the platform itself.

### Phase 2: Expansion & The Content Matrix (Days 101 - 365)
**Goal**: Reach 100+ "Micro-Apps".
*   **Implementation Strategy**: "One Day, One Module".
    *   Use **Micro-Frontend** architecture. Each subject is a separate folder/project but shares the `assets/` (Identity, UI, Auth).
*   **Community**:
    *   **Multiplayer**: Users can see each other's cursors or avatars in the simulation (e.g., visiting another user's Solar System).
    *   **Trading**: Trade virtual assets (collected space rocks, bred DNA strains).

### Phase 3: The Ecosystem (Days 366 - 1000)
**Goal**: User Generic Content (UGC) & Global Platform.
*   **Creator Mode**: Students can build their own "levels" using your tools and publish them.
*   **Real World Impact**: Partner with hardware (Arduino/Micro:bit) so code on the web affects real life.

---

## 3. Technical Architecture for "1000 Pages"

### The "Module" Pattern
To sustain "One Page Per Day", we need a factory template.
Every new page follows this structure:

```text
/modules
  /001_astronomy
     - engine.js (The simulation logic)
     - ui.js (The overlay controls)
     - index.html (The container)
  /002_earth
     - globe.js
     - layers.js
  ...
```

### Stack Choice
*   **3D Core**: **Three.js** / **Babylon.js** (Crucial for the "Premium" feel).
*   **Physics**: **Cannon.js** or **Matter.js**.
*   **Data**: **Supabase** (User profiles, Save states).
*   **UI**: **Glassmorphism** (The "SaaS" Grid style we established).

---

## 4. Next Concrete Steps (Day 8 - 15)

**Current Status**: 
- `Profile`: ⭐⭐⭐⭐⭐ (SaaS Command Center)
- `Astronomy`: ⭐⭐⭐⭐ (Needs more interactive missions)

**Immediate Plan**:
1.  **Map the Universe**: Create the **Main Interface (The 4399 Lobby)**. It shouldn't be a list of links. It should be a "Galaxy Map" where each star is a subject.
2.  **Earth Project**: Build `earth.html`. 
    *   *Idea*: A WebGL Globe that visualizes live earthquakes (USGS API) and ISS position.
3.  **Gamify Astronomy**: Add "Missions" to the Solar System page.
    *   *Mission 1*: "Land on Mars" (Calculate trajectory).
    *   *Reward*: Unlock "Mars Badge" (updates the Profile Badge Wall).

---

> **Motto**: "Don't tell them how the universe works. Give them a universe and let them figure it out."

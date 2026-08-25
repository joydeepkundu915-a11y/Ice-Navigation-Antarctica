# AI-Enabled Antarctic Sea-Ice, Iceberg Trajectory, and Navigation Decision Support System (POLARIS ECDIS)

A mission-critical polar maritime Electronic Chart Display and Information System (ECDIS) and AI decision support platform designed specifically for navigation across the Southern Ocean and Antarctic waters.

---

## 🌟 Core System Modules

### 1. IMO Polar Code POLARIS Engine (MSC.1/Circ.1519)
- **Risk Index Values (RIV)** across Polar Classes **PC1 (Year-round all polar waters)** through **PC7 (Summer/autumn thin first-year)** and Baltic Ice Classes (1A Super to 1C).
- Real-time **Risk Index Outcome (RIO)** calculation:
  $$\text{RIO} = \sum_{i=1}^n \left( C_i \times \text{RIV}_i \right)$$
- Generates speed limitations, hull yield stress threshold monitoring, and mandatory icebreaker escort flags.

### 2. Hydrodynamic Iceberg Trajectory & Monte Carlo Drift Forecaster
- Dynamic 2D force balance integrating:
  - **Atmospheric form and skin drag** on iceberg sail area ($C_a \approx 1.35$)
  - **Submerged keel hydrodynamic drag** ($C_w \approx 0.90$)
  - **Coriolis deflection force** in the Southern Hemisphere ($f = 2\Omega\sin\phi < 0$)
  - **Antarctic Circumpolar Current (ACC) & East Wind Drift** advection
- **72-Hour Stochastic Monte Carlo dispersion cones** ($R_{24h}, R_{48h}, R_{72h}$) predicting probabilistic drift envelopes for mega-icebergs (**A-23a, A-81, A-76a, D-28, B-22A**).

### 3. Multi-Objective Polar Route Optimization (Pareto Frontier)
- **SAFEST ROUTE**: Skirts heavy multi-year pack ice and maintains positive RIO margins.
- **FASTEST ROUTE**: Direct rhumb-line transit through radar-identified thermal leads.
- **FUEL-OPTIMAL (ECO)**: Minimizes continuous ice crushing and submersion resistance via the **Lindqvist (1989)** and **Riska (1997)** resistance models.

### 4. Synthetic Aperture Radar (SAR) Sentinel-1 AI Ice Vision
- Automated segmentation of open water leads, polynyas, pressure ridges, and stealth growler targets.
- Navigability score rating and tactical bridge conning advisories.

### 5. Tactical Polar Radar PPI (Plan Position Indicator)
- 24 NM range circular marine radar screen canvas with continuous rotating sweep.
- Automated Radar Plotting Aid (ARPA) tracking, **Closest Point of Approach (CPA)**, and **Time to CPA (TCPA)** alerts.

### 6. AI Polar Decision Copilot & Safe Haven Locator
- Intelligent polar ice pilot answering tactical conning queries, besetment mitigation SOPs, and routing to nearest Antarctic research bases (Rothera, Palmer, McMurdo, Bharati, Maitri, etc.).

---

## 🚀 Quick Start Guide

### Option 1: One-Click Launch (Windows)
Double-click `start_system.bat` to launch both Backend (port 8000) and Frontend (port 5173).

### Option 2: Manual Terminal Launch

#### Backend:
```cmd
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
- API Docs: `http://localhost:8000/docs`

#### Frontend:
```cmd
cd frontend
npm.cmd run dev
```
- Open `http://localhost:5173` in your browser.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Leaflet, HTML5 Canvas Radar |
| **Backend** | Python 3.13, FastAPI, Uvicorn, Pydantic, NumPy, SciPy |
| **Polar Physics** | Lindqvist (1989) Ice Resistance, Coriolis Hydrodynamics, Monte Carlo Drift |
| **Standards** | IMO Polar Code MSC.1/Circ.1519 (POLARIS), WMO Sea-Ice Nomenclature |

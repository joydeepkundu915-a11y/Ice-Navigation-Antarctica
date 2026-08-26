# 🏔️ POLARIS ECDIS: AI-Enabled Antarctic Sea-Ice & Iceberg Navigation Decision Support System

[![Deploy to GitHub Pages](https://github.com/joydeepkundu915-a11y/Ice-Navigation-Antarctica/actions/workflows/deploy-gh-pages.yml/badge.svg)](https://github.com/joydeepkundu915-a11y/Ice-Navigation-Antarctica/actions/workflows/deploy-gh-pages.yml)
[![Docker Image](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![IMO Polar Code](https://img.shields.io/badge/IMO%20Polar%20Code-MSC.1%2FCirc.1519-emerald.svg)](https://www.imo.org/)
[![License](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)

An operational, polar-grade Electronic Chart Display and Information System (**ECDIS**) for Antarctic polar vessels, research icebreakers, and autonomous polar shipping.

---

## 🌟 Key Capabilities

1. **🏔️ Crystalline Polar UI & Officer Authentication**:
   - Dedicated User Login Portal with STCW Reg A-V/4 license authentication.
   - 6 Commissionable Polar Vessels (**PC1 Heavy Icebreaker Krasin**, **PC2 Charcot**, **PC3 Polarstern**, **PC4 Attenborough & Bharati**, **1A Super Ushuaia**).
   - Custom Vector Iceberg Emblem with exposed sunlit peak and massive submerged 90% deep keel.

2. **✨ Golden Lead Navigation & Dual-Glow Corridors**:
   - Radiant golden-amber route polylines with ambient glow halos.
   - Automated Pareto multi-objective polar routing (Safest, Fastest, Fuel-Optimal).
   - Lindqvist (1989) dynamic ice crushing and submersion resistance modeling.

3. **📡 Tactical Radar PPI & ARPA Target Tracker**:
   - **Color-Coded Echo Detection**:
     - 🔴 **Red Echoes**: Critical collision hazards & mega-tabular icebergs inside guard ring.
     - 🟢 **Deep Green Echoes**: Safe passing vessels ($\text{DCPA} > 4.5\text{ NM}$) and open water leads.
     - 🟡 **Amber Echoes**: Monitored caution contacts.
   - Dual-band **X-Band 9.4 GHz** (Ice recognition) and **S-Band 3.0 GHz** (Sea penetration).
   - Interactive ARPA tracking gates `[ + ]` with DCPA/TCPA readouts.

4. **🤖 Autonomous AI Auto-Sail Polar Navigation**:
   - Autonomous waypoint navigation along open thermal leads and polynyas.
   - Hydrodynamic polar speed throttling and automated **COLREGs Rule 14/15 Starboard evasions** ($+25^\circ$).

5. **🚢 Multi-Vessel AIS Anti-Collision Engine**:
   - Real-time polar fleet traffic simulation (*R/V Polarstern*, *FESCO Krasin*, *MV Ushuaia Voyager*, *R/V Bharati Explorer*).
   - Dynamic DCPA/TCPA calculations and collision prevention vectors.

6. **🚨 GMDSS Polar Distress SOS Transceiver**:
   - 406 MHz COSPAS-SARSAT & VHF Ch 16 DSC emergency broadcast.
   - Automated SAR Base assignment (*Rothera*, *Palmer*, *McMurdo*, *Maitri*) with ETA calculations and two-tone acoustic sirens.

---

## 🚀 Deployment Options

### Option 1: Automated GitHub Pages (1-Click Free Hosting)
1. In your GitHub repository, navigate to **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. Push to `main` (or trigger the `Deploy to GitHub Pages` workflow).
4. Your application will be live at:
   `https://joydeepkundu915-a11y.github.io/Ice-Navigation-Antarctica/`

---

### Option 2: 1-Click Free Cloud Deployment on Render
Deploy the full-stack FastAPI backend + React frontend in a single container:
1. Fork or push this repository to GitHub.
2. Sign up on [Render.com](https://render.com/).
3. Click **New** > **Web Service**, connect your `Ice-Navigation-Antarctica` repository.
4. Select **Docker** environment and click **Create Web Service**.

---

### Option 3: 1-Click Frontend Deployment on Vercel
1. Import repository on [Vercel.com](https://vercel.com/).
2. Vercel automatically detects `vercel.json` and `frontend/` directory.
3. Click **Deploy**.

---

### Option 4: Local Docker Run (1 Command)
```bash
# Clone the repository
git clone https://github.com/joydeepkundu915-a11y/Ice-Navigation-Antarctica.git
cd Ice-Navigation-Antarctica

# Build and run with Docker Compose
docker compose up --build
```
Access the application at `http://localhost:8000`.

---

### Option 5: Local Development Setup

#### Backend:
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # On Windows (or source venv/bin/activate on Linux/Mac)
pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📜 Standards & Compliance
- **IMO Polar Code (MSC.385(94) / MEPC.264(68))**
- **POLARIS Risk Indexing (MSC.1/Circ.1519)**
- **IEC 62288 & IEC 61174 ECDIS Display Standards**
- **COLREGs 1972 (Rules 13, 14, 15 Collision Regulations)**
- **Antarctic Treaty Madrid Protocol (Annex IV)**
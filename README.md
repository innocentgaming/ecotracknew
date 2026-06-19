# EcoTrack — Carbon Footprint Awareness Platform 🌿

[![Build Status](https://img.shields.io/badge/Build-Passing-00ff88?style=for-the-badge&logo=nextdotjs&logoColor=white)](#)
[![Test Suite](https://img.shields.io/badge/Vitest-38%2F38%20Passed-7fff00?style=for-the-badge&logo=vitest&logoColor=white)](#)
[![Security Hardened](https://img.shields.io/badge/CSP-Hardened-00e5cc?style=for-the-badge&logo=google-cloud&logoColor=white)](#)
[![Accessibility](https://img.shields.io/badge/WCAG-AA%20Compliant-ffbb00?style=for-the-badge&logo=w3c&logoColor=white)](#)
[![AI Integration](https://img.shields.io/badge/AI-Gemini%202.0-a855f7?style=for-the-badge&logo=google-gemini&logoColor=white)](#)

A full-featured, premium, AI-powered web application for tracking, understanding, and reducing personal carbon footprints, tailored with **India-specific emission factors** and predictive mathematical models.

---

## 🗺️ Functional System Flowchart

Here is the operational architecture of how EcoTrack processes user metrics, runs mathematical calculations, makes trend projections, queries Gemini AI, and hooks into the gamification engine.

```mermaid
graph TD
    %% Custom Styling
    classDef main fill:#0a1610,stroke:#00ff88,stroke-width:2px,color:#e8f5ec;
    classDef highlight fill:#00ff88,stroke:#060d08,stroke-width:2px,color:#060d08;
    classDef process fill:#0e1a12,stroke:#00e5cc,stroke-width:1px,color:#e8f5ec;
    classDef storage fill:#13231a,stroke:#ffb700,stroke-width:1px,color:#ffd700;

    A[User Configurations / API Keys] --> B[5-Step Calculator Wizard]
    
    %% Inputs
    B --> B1[1. Travel Modes & Commuting Frequency]
    B --> B2[2. Electricity Bills & AC Usage Seasons]
    B --> B3[3. Dietary Profiles & Weekly Food Wastes]
    B --> B4[4. Clothing Purchases & Last-mile Deliveries]
    B --> B5[5. Trash Volume, Composting & Recycling %]
    
    B1 & B2 & B3 & B4 & B5 --> C[Carbon Calculator Engine]
    
    %% Core Operations
    C -->|Calculate CO₂ kg/month| D[Compute Category Sub-Scores 0-100]
    C -->|Fetch Log Records| E[Least Squares Regression Predictor]
    C -->|Caching State| F[(Browser Local Storage)]
    
    %% Suggestions & Advisor
    D & E --> G{Gemini API Key Set?}
    G -->|Yes| H[Request Gemini AI Advisor API]
    G -->|No| I[Fallback to Local Rules-Based Suggestion Engine]
    
    %% Visual Output
    H & I --> J[Dashboard & Analytics Panels]
    D --> K[Profile Level Points & Earned Badges]
    
    %% Interactive Views
    J --> J1[ChartJS Pie & Bar Segmentations]
    J --> J2[Linear Trend Line Projections]
    A --> L[Leaflet Maps Location Markers]
    A --> M[EcoBot Interactive Chat Dialog]

    class C,E highlight;
    class A,B,L,M process;
    class D,J,J1,J2,K main;
    class F,H,I storage;
```

---

## 🧮 Calculation Algorithms & Emission Factors

All calculator modules use **India-specific carbon statistics** (Electricity intensity: `0.82 kg CO₂/kWh`, national annual average vs Paris Agreement climate goals).

### 1. Transport Algorithm
Calculates monthly transportation emissions based on travel mode, distance, and flight metrics.
* **Equation:**
  $$\text{Monthly Emissions} = (\text{Daily Distance} \times \text{Commute Days}) \times \text{EF}_{\text{mode}} + \frac{(\text{Flight Hours} \times 480 \times \text{EF}_{\text{flight}})}{12}$$
* **Emission Factors ($\text{EF}_{\text{mode}}$):**
  - Petrol Car: `0.192 kg CO₂/km`
  - Diesel Car: `0.171 kg CO₂/km`
  - Petrol Bike (Motorcycle): `0.113 kg CO₂/km`
  - Electric Vehicle (EV): `0.055 kg CO₂/km` (India grid average)
  - Auto Rickshaw: `0.135 kg CO₂/km`
  - Bus Transit: `0.089 kg CO₂/km`
  - Train Transit: `0.041 kg CO₂/km`
  - Bicycle & Walking: `0 kg CO₂/km` (Strict undefined check safeguards zero emission states)
  - Domestic Flight: `0.255 kg CO₂/km` (assuming speed of $480\text{ km/h}$)

### 2. Home Energy Algorithm
Estimates domestic power footprint based on utility bills, AC hours, and clean solar offsets.
* **Equation:**
  $$\text{KWh} = \frac{\text{Monthly Bill}}{\text{Tariff}}$$
  $$\text{AC KWh} = \text{AC Hours/Day} \times 1.5 \times 30 \times \left(\frac{\text{AC Months/Year}}{12}\right)$$
  $$\text{Monthly Emissions} = (\text{KWh} + \text{AC KWh}) \times 0.82 \times (1 - \text{Solar Reduction})$$
* **Factors:**
  - Average Indian Electricity Tariff: `₹8 per kWh`
  - India Grid Emission Factor: `0.82 kg CO₂/kWh`
  - AC Power Consumption (1.5 ton): `1.5 kWh/hour`
  - Rooftop Solar Panel Reduction: `30%` discount (`0.30`)

### 3. Food & Diet Algorithm
Calculates dietary emissions combined with weekly food wastage penalties.
* **Equation:**
  $$\text{Monthly Emissions} = (\text{Diet Factor} \times 30) + (\text{Food Waste kg/week} \times 4 \times 1.9)$$
* **Diet Emission Factors ($\text{kg CO₂/day}$):**
  - Non-Vegetarian: `7.2`
  - Eggetarian: `4.5`
  - Vegetarian: `3.8`
  - Vegan: `2.9`
  - Food Waste Factor: `1.9 kg CO₂ per kg` wasted

### 4. Shopping & Electronics Algorithm
Measures carbon embedded in materials, delivery transits, and amortized electronics.
* **Equation:**
  $$\text{Monthly Emissions} = (\text{Clothing Items} \times 10) + (\text{Online Deliveries} \times 0.5) + \frac{(\text{New Phone} \times 70) + (\text{New Laptop} \times 400)}{12}$$
* **Embedded Carbon Factors:**
  - Clothing Item: `10 kg CO₂`
  - Electronics (Smartphone): `70 kg CO₂`
  - Electronics (Laptop): `400 kg CO₂`
  - Online Delivery (Last mile transit): `0.5 kg CO₂`

### 5. Household Waste Algorithm
Measures landfill waste emissions while crediting recycling and composting offsets.
* **Equation:**
  $$\text{Total Waste} = \text{Waste kg/week} \times 4$$
  $$\text{Landfill Waste} = \text{Total Waste} \times (1 - \text{Recycle \%})$$
  $$\text{Recycled Waste} = \text{Total Waste} \times \text{Recycle \%}$$
  $$\text{Net Emissions} = (\text{Landfill Waste} \times 0.5 - \text{Recycled Waste} \times 0.1) \times (1 - \text{Compost Reduction})$$
* **Factors:**
  - Landfill Emission Factor: `0.5 kg CO₂/kg`
  - Recycling Offset Credit: `-0.1 kg CO₂/kg`
  - Composting Reduction: `20%` discount if active (`0.20`)

---

## 📈 Mathematical Trend Projections

EcoTrack implements a **Least Squares Linear Regression Model** to project carbon emissions based on previous monthly inputs:
$$y = mx + c$$

Where:
- $x$ represents the chronological month index.
- $y$ represents the monthly total emissions in kg CO₂.
- The slope $m$ and intercept $c$ are computed as:
  $$m = \frac{N\sum(xy) - \sum x \sum y}{N\sum(x^2) - (\sum x)^2}$$
  $$c = \frac{\sum y - m\sum x}{N}$$

Using this model, EcoTrack projects the output for month $N$, alerting users if their carbon trajectory is expanding or declining.

---

## 🏆 Gamification & Tier Rankings

Users are scored from **0 to 100** based on their annualized carbon footprint, where a higher score signifies lower emissions.

### Eco Score Formula
$$\text{Annualized Emissions (AE)} = \text{Monthly Total CO₂} \times 12$$
$$\text{Eco Score} = 100 - \left( \frac{\text{AE} - 500}{7500} \times 100 \right)$$
*(Capped between 0 and 100. Lower bound threshold: $500\text{ kg/year}$, Upper bound threshold: $8000\text{ kg/year}$)*

### Tier Rankings
| Score Range | Badge Title | Emoji | Theme Color |
| :--- | :--- | :---: | :--- |
| **80 - 100** | **Eco Champion** | 🌟 | Emerald (`#00ff88`) |
| **60 - 79** | **Green Warrior** | 🌿 | Chartreuse (`#7fff00`) |
| **40 - 59** | **Eco Aware** | 🌱 | Gold (`#ffbb00`) |
| **20 - 39** | **Carbon Conscious** | ⚠️ | Amber (`#ff7700`) |
| **0 - 19** | **High Emitter** | 🔴 | Crimson (`#ff3333`) |

---

## 🚀 Key Features

1. 🧮 **Carbon Calculator** — A sleek 5-step wizard to evaluate transport, energy, food, shopping, and waste footprint.
2. 🤖 **AI-Powered Suggestions** — Personalized advice using the **Google Gemini API** (backed up by an intelligent rule-based fallback system).
3. 🏆 **Green Challenges** — Track and complete weekly challenges to earn points, level up, and unlock achievements.
4. 📊 **Analytics Dashboard** — Modern visualization including Pie, Bar, and Trend charts of your carbon profile compared against Indian and global baselines.
5. 🗺️ **Green Map** — Leaflet-powered maps locating EV charging hubs, public transit connections, recycling depots, and parks.
6. 💬 **EcoBot Chat** — Direct access to an AI chatbot trained to address your questions on sustainability and eco-friendly lifestyles.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (Turbopack) & React 19
- **Testing Framework**: Vitest & React Testing Library (under JSDOM environment)
- **Data Visualization**: Chart.js & React-Chartjs-2
- **Mapping**: Leaflet.js & React-Leaflet (using OpenStreetMap tiles)
- **AI Core**: `@google/generative-ai` (Gemini API integration)
- **Styling**: Vanilla CSS Modules (featuring glassmorphic theme styling)

---

## 🏁 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` or `.env.local` file in the root directory:
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 3. Spin Up Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 4. Run Automated Test Suite
```bash
# Run unit and integration tests once
npm run test

# Run tests in interactive watch mode
npm run test:watch
```

---

## 🌍 Project Documentation

For in-depth reviews and guides, refer to the following repository documents:
- 🗺️ **[ARCHITECTURE.md](file:///d:/ecotrack%20project/ecotrack/ARCHITECTURE.md)** — Architectural design and models math details.
- 🔒 **[SECURITY.md](file:///d:/ecotrack%20project/ecotrack/SECURITY.md)** — CSP parameters, vulnerability checks, and input boundaries.
- 🧪 **[TESTING.md](file:///d:/ecotrack%20project/ecotrack/TESTING.md)** — Automated test running guidelines.
- 📝 **[SECURITY_REPORT.md](file:///d:/ecotrack%20project/ecotrack/SECURITY_REPORT.md)** — Vulnerability review checklist outcome.
- 📁 **[CODE_QUALITY_REPORT.md](file:///d:/ecotrack%20project/ecotrack/CODE_QUALITY_REPORT.md)** — Refactoring logs and strict JavaScript checklist.
- ⚡ **[PERFORMANCE_REPORT.md](file:///d:/ecotrack%20project/ecotrack/PERFORMANCE_REPORT.md)** — Asset chunk optimizations and loading indicators.
- 📊 **[TEST_REPORT.md](file:///d:/ecotrack%20project/ecotrack/TEST_REPORT.md)** — Test coverage metrics breakdown.

---
*Created with 🌿 for a cleaner, greener planet.*

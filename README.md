# ECE-Connect

> Student Grievance & Facility Portal for the Department of Electronics & Communication Engineering, Government Engineering College Sreekrishnapuram (GECSKP), Palakkad.

## Overview
**ECE Connect** is a responsive web application built for the Department of ECE at GEC Sreekrishnapuram. It streamlines departmental facility issues, laboratory equipment maintenance, and sensitive student welfare concerns through a secure, dual-stream grievance tracking architecture.

---

## Key Features

### 1. Visual & Aesthetic Architecture
- **Monochrome Dark Theme**: Built with an obsidian dark theme (`#09090B`), elevated cards (`#0D0D10`), and delicate hairlines (`border-white/[0.08]`).
- **Official Department Emblem**: Displays the official GEC PKD ECE hexagonal PCB circuit logo.
- **Typography**: Clean, geometric **Inter** for all UI copy and headings, paired with JetBrains Mono for KTU roll numbers and hardware asset tags.
- **Ambient Zero-G Particles**: Canvas background with subtle orbital dust particles reacting gently to mouse movement.

### 2. Institutional Authentication & Role Architecture
- **Regex Validation**: Client-side enforcement of GECSKP email format (`/^pkd\d{2}ec\d{3}@gecskp\.ac\.in$/i`) or pre-whitelisted staff emails (`ece.rep@gecskp.ac.in`).
- **External Domain Rejection**: Automatically blocks external providers (`@gmail.com`, `@yahoo.com`) with an institutional protocol alert.
- **Unified Login**: Zero-clutter login modal without public "Admin" or "Staff" toggles. Roles are resolved seamlessly upon authentication.

### 3. Dual-Stream Grievance Mechanism
- **Stream A: Public Community Wall**
  - Department-wide visibility for issues across VLSI, Communication, DSP, and Microcontroller labs, classroom AV, and KTU timetables.
  - **"+1 Affects Me"** collective upvoting counter.
  - **4-Stage Connected Milestone Stepper**: `Reported` → `Acknowledged` → `In Progress` → `Resolved`.
  - Full search, category filtering, and student discussion comments.
- **Stream B: Private Confidential Vault**
  - Encrypted 1-on-1 counseling space between students and the ECE Association Representative.
  - **6-Digit Anonymous Vault Key** generator for anonymous submissions.
  - Direct key retrieval to resume ongoing threads from any terminal.
  - Real-time 2-way chat with document attachment simulations.

### 4. Representative Operations Desk
- Unlocked automatically for `ece.rep@gecskp.ac.in`.
- Real-time triage metrics (Active, Critical, Resolved, Confidential, 24.8h Turnaround).
- Status progression controller and formal **Department Requisition Indent Generator** (`IND-GECSKP-XXXX`).
- Confidential response console for direct replies to student welfare requests.

### 5. Reviewer Demo Dock
- Floating pill in the bottom-right corner allowing 1-click toggling between:
  - Standard Student: `pkd22ec045@gecskp.ac.in`
  - Junior Student: `pkd23ec012@gecskp.ac.in`
  - Representative Desk: `ece.rep@gecskp.ac.in`
  - Guest Mode

---

## Tech Stack
- **Framework**: React 18
- **Bundler**: Vite 6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

---

## Getting Started

```bash
# Clone repository
git clone https://github.com/AVA-NTHIKA14/ECE-Connect.git

# Enter project directory
cd ECE-Connect

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## Department & Institutional Details
- **Institution**: Government Engineering College Sreekrishnapuram (GECSKP), Palakkad, Kerala
- **Department**: Electronics & Communication Engineering
- **Affiliation**: APJ Abdul Kalam Technological University (KTU)

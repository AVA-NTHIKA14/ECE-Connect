# ECE Connect — Student Grievance & Facility Portal

> Department of Electronics & Communication Engineering  
> Government Engineering College Sreekrishnapuram Palakkad (GECP), Kerala

---

## Overview

**ECE Connect** is a responsive web application engineered for the Department of Electronics & Communication Engineering at **Government Engineering College Sreekrishnapuram Palakkad (GECP)**. It provides a transparent, accountable platform for addressing departmental facility maintenance, laboratory equipment upkeep, and sensitive student academic/welfare matters through a dual-stream architecture.

---

## Core Capabilities

### 1. Dual-Stream Grievance Mechanism

- **Stream A: Public Community Complaint Wall**
  - Transparent tracking for issues affecting department classrooms and laboratories:
    - *EC 1st Year Class*, *2nd Year EC Class*, *3rd Year EC Class*, *4th Year Class*
    - *Analog Circuit Lab*, *Advanced Communication Lab*, *Basic Electronics Lab*, *Digital Circuits Lab*
  - **"+1 Affects Me"** collective student upvoting to elevate priorities for urgent breakdowns.
  - **4-Stage Milestone Stepper**: `Reported` → `Acknowledged` → `In Progress` → `Resolved`.
  - Filter by category (Laboratory, Classroom AV, Department Facility, KTU Academics) and stage.
  - Threaded community observations and comments for peer updates.

- **Stream B: Confidential Welfare Vault**
  - Dedicated, non-public advisory channel between authenticated students and the authorized ECE Department Representative.
  - Verified complainant identification (Student Name, KTU Roll Number, Batch Semester, Institutional Email) enables direct verification of attendance records, medical condonation documents, and re-totaling requests.
  - End-to-end 2-way real-time message stream for direct representative guidance.

### 2. Representative Operations Desk

- Protected administrative console available strictly to the verified Department Representative (`ece.rep@gecskp.ac.in`).
- Real-time grievance triage queue with quick stage updates and resolution logging.
- Official **CLOSED** audit stamp with resolution notes, moving verified cases to the permanent **Resolved Archive**.
- Department requisition indent generator (`IND-GECP-XXXX`) for lab equipment repairs and faculty coordination.
- Dedicated responses panel to reply to confidential student welfare inquiries.

### 3. Institutional Authentication & Security

- Institutional email format validation strictly restricted to active student batches:
  - **S7 (Final Year)**: `pkd23ec001`–`pkd23ec075@gecskp.ac.in`
  - **S5 (Third Year)**: `pkd24ec001`–`pkd24ec075@gecskp.ac.in`
  - **S3 (Second Year)**: `pkd25ec001`–`pkd25ec075@gecskp.ac.in`
  - **S1 (First Year)**: `pkd26ec001`–`pkd26ec075@gecskp.ac.in`
- External email domains (`@gmail.com`, `@yahoo.com`) are automatically rejected.
- Firebase Authentication with email verification and Cloud Firestore real-time persistence.

### 4. Design & Usability

- **Authentic Noticeboard Aesthetic**: Clean, light physical paper theme with pin accents, KTU branding, and clear visual hierarchy.
- **Universal Responsiveness**: Adaptive layouts optimized across mobile phones (320px–430px), tablets (768px–1024px), laptops, and desktop monitors.
- **Lucide Iconography**: Clear, consistent Lucide React icons across all views with zero AI-generated emojis.

---

## Tech Stack

- **Framework**: React 18 + Vite 6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend / Database**: Google Firebase (Authentication & Cloud Firestore)
- **Deployment**: Node.js / Vite Static Build

---

## Getting Started

```bash
# Clone the repository
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

## Institutional Metadata

- **Institution**: Government Engineering College Sreekrishnapuram Palakkad (GECP)
- **Department**: Department of Electronics & Communication Engineering
- **Affiliation**: APJ Abdul Kalam Technological University (KTU)
- **Location**: Palakkad, Kerala 679513

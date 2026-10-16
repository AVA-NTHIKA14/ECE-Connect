// GECSKP ECE Departmental Mock Data & Protocols

export const DEPARTMENT_INFO = {
  institution: "Government Engineering College Sreekrishnapuram",
  shortInstitution: "GECSKP",
  location: "Palakkad, Kerala 679513",
  coordinates: "10.8753° N, 76.4258° E",
  department: "Department of Electronics & Communication Engineering",
  shortDept: "ECE DEPT",
  affiliation: "APJ Abdul Kalam Technological University (KTU)",
  hodEmail: "hod.ece@gecskp.ac.in",
  repEmail: "ece.rep@gecskp.ac.in",
};

export const LAB_FACILITIES = [
  { id: "vlsi-lab", name: "VLSI Design & EDA Lab", code: "ECE-LAB-01", room: "Block C - 201" },
  { id: "comm-lab", name: "Advanced Communication Systems Lab", code: "ECE-LAB-02", room: "Block C - 204" },
  { id: "dsp-lab", name: "DSP & Image Processing Lab", code: "ECE-LAB-03", room: "Block C - 208" },
  { id: "emb-lab", name: "Microcontroller & Embedded Systems Lab", code: "ECE-LAB-04", room: "Block C - 302" },
  { id: "ec-lab", name: "Electronic Circuits & Measurements Lab", code: "ECE-LAB-05", room: "Block C - 105" },
  { id: "mw-lab", name: "Microwave & Optical Fiber Lab", code: "ECE-LAB-06", room: "Block C - 310" },
  { id: "lh-1", name: "Lecture Hall 1 (S3/S4 ECE)", code: "ECE-LH-01", room: "Block C - 102" },
  { id: "lh-2", name: "Lecture Hall 2 (S5/S6 ECE)", code: "ECE-LH-02", room: "Block C - 202" },
  { id: "lh-3", name: "Lecture Hall 3 (S7/S8 ECE)", code: "ECE-LH-03", room: "Block C - 301" },
  { id: "seminar-hall", name: "ECE Dept Seminar Hall", code: "ECE-SEM-01", room: "Block C - 305" },
  { id: "dept-library", name: "ECE Departmental Library", code: "ECE-LIB-01", room: "Block C - 212" },
  { id: "corridor-f2", name: "General Dept Amenities (2nd Floor)", code: "ECE-GEN-02", room: "Corridor C2" }
];

export const INITIAL_PUBLIC_ISSUES = [
  {
    id: "GECSKP-PUB-101",
    title: "CRO / DSO Bench 03 Ground Fault & Probe Cal Drift",
    category: "lab",
    lab: "Advanced Communication Systems Lab",
    equipmentCode: "GECSKP-COMM-DSO-03",
    description: "Rigol 100MHz DSO on Bench 3 gives a floating ground potential (>18V AC relative to earth). Channel 1 attenuation toggle 10X ratio is loose and 1kHz test square wave shows severe overshoot.",
    urgency: "high",
    stage: "in_progress", // 'reported' | 'acknowledged' | 'in_progress' | 'resolved'
    reportedBy: "pkd22ec045@gecskp.ac.in",
    studentName: "Adithya R. (S5 ECE)",
    reportedAt: "2026-10-14T09:30:00Z",
    upvotes: 18,
    upvotedBy: ["pkd22ec045@gecskp.ac.in", "pkd23ec012@gecskp.ac.in"],
    resolutionNotes: "Requisition #REQ-ECE-882 submitted to Lab Superintendent Sri. Ramesh. New Tektronix 10X passive probe indented from Central Stores. Earth leakage trace scheduled for Saturday.",
    assignedRep: "ece.rep@gecskp.ac.in",
    targetFixDate: "2026-10-18",
    comments: [
      { id: "c1", author: "pkd22ec019@gecskp.ac.in", name: "Karthik P.", time: "2026-10-14 11:20", text: "Confirmed, bench 3 also caused our AM modulation waveform to distort heavily during yesterday's session." },
      { id: "c2", author: "ece.rep@gecskp.ac.in", name: "ECE Association Rep", time: "2026-10-14 14:05", text: "Bench 3 has been tagged with warning tape until the earth tester inspection is completed." }
    ]
  },
  {
    id: "GECSKP-PUB-102",
    title: "LH-2 Projector HDMI Handshake Error & Color Flashing",
    category: "classroom",
    lab: "Lecture Hall 2 (S5/S6 ECE)",
    equipmentCode: "GECSKP-LH2-PRJ-01",
    description: "Ceiling-mounted EPSON projector disconnects every 4-5 minutes when instructors connect through HDMI wall plate. Screen flickers magenta and goes to standby during Analog Circuits and DSP lectures.",
    urgency: "elevated",
    stage: "acknowledged",
    reportedBy: "pkd23ec012@gecskp.ac.in",
    studentName: "Fathima N. (S3 ECE)",
    reportedAt: "2026-10-15T11:15:00Z",
    upvotes: 27,
    upvotedBy: ["pkd23ec012@gecskp.ac.in"],
    resolutionNotes: "Inspected by ECE AV committee. Fault is with the passive 15m HDMI wall-conduit extender cable degraded contacts. Replacing with active fiber-optic HDMI extender.",
    assignedRep: "ece.rep@gecskp.ac.in",
    targetFixDate: "2026-10-19",
    comments: [
      { id: "c3", author: "pkd22ec051@gecskp.ac.in", name: "Rahul Menon", time: "2026-10-15 13:40", text: "Prof. Anitha had to use the whiteboard for the Nyquist plot derivation because the display cut out mid-lecture." }
    ]
  },
  {
    id: "GECSKP-PUB-103",
    title: "KTU S6 Internal Exam Timetable Overlap with TCS Placement Drive",
    category: "academics",
    lab: "Lecture Hall 3 (S7/S8 ECE)",
    equipmentCode: "KTU-ACAD-S6-EXAM",
    description: "The 2nd Series Internal Test for EC302 (VLSI Design) is slated for October 24 forenoon, coinciding with the mandatory on-campus TCS NQT shortlist assessment at the CCF center.",
    urgency: "critical",
    stage: "in_progress",
    reportedBy: "pkd22ec004@gecskp.ac.in",
    studentName: "Amaldev K. (S7 ECE)",
    reportedAt: "2026-10-15T14:45:00Z",
    upvotes: 46,
    upvotedBy: ["pkd22ec045@gecskp.ac.in"],
    resolutionNotes: "Meeting held with HoD Dr. Vinod and KTU Exam Coordinator. EC302 Internal Test shifted to Oct 27 forenoon (10:00 AM - 12:00 PM). Formal circular drafted for staff approval.",
    assignedRep: "ece.rep@gecskp.ac.in",
    targetFixDate: "2026-10-17",
    comments: [
      { id: "c4", author: "ece.rep@gecskp.ac.in", name: "ECE Association Rep", time: "2026-10-15 16:30", text: "Official notification circular will be displayed on the department notice board and WhatsApp group tomorrow morning." }
    ]
  },
  {
    id: "GECSKP-PUB-104",
    title: "Microcontroller Lab 8051/ARM Programmer Kit USB Bridge Dead",
    category: "lab",
    lab: "Microcontroller & Embedded Systems Lab",
    equipmentCode: "GECSKP-EMB-KIT-12",
    description: "CH340 / CP2102 USB-to-UART bridge on Workbench 6 developer board does not enumerate on host OS (Device Descriptor Request Failed, Code 43). Flash hex upload fails repeatedly.",
    urgency: "normal",
    stage: "reported",
    reportedBy: "pkd22ec019@gecskp.ac.in",
    studentName: "Karthik P. (S5 ECE)",
    reportedAt: "2026-10-16T10:10:00Z",
    upvotes: 11,
    upvotedBy: [],
    resolutionNotes: "Queued for technician check. Replacement kit available in lab cupboard B.",
    assignedRep: "ece.rep@gecskp.ac.in",
    targetFixDate: "2026-10-21",
    comments: []
  },
  {
    id: "GECSKP-PUB-105",
    title: "2nd Floor ECE Corridor Water Dispenser Filter Alarm & Leak",
    category: "facility",
    lab: "General Dept Amenities (2nd Floor)",
    equipmentCode: "GECSKP-FAC-RO-02",
    description: "The Kent RO commercial water purification unit outside VLSI lab has a continuous high-pitch buzzer beep (filter replacement warning) and water pools on the corridor tile.",
    urgency: "normal",
    stage: "resolved",
    reportedBy: "pkd23ec033@gecskp.ac.in",
    studentName: "Meenakshi V. (S3 ECE)",
    reportedAt: "2026-10-12T08:00:00Z",
    upvotes: 33,
    upvotedBy: ["pkd22ec045@gecskp.ac.in", "pkd23ec012@gecskp.ac.in"],
    resolutionNotes: "Plumbing maintenance team replaced the activated carbon sediment filter and re-seated the Teflon drainage elbow joint. Alarm silenced and leak resolved.",
    assignedRep: "ece.rep@gecskp.ac.in",
    targetFixDate: "2026-10-13",
    comments: [
      { id: "c5", author: "ece.rep@gecskp.ac.in", name: "ECE Association Rep", time: "2026-10-13 15:00", text: "Filter cartridge replacement verified by Department Attendant Sri. Vijayan. Status updated to Resolved." }
    ]
  },
  {
    id: "GECSKP-PUB-106",
    title: "DSP Lab Cadence / MATLAB License Server Timeout on Peak Slots",
    category: "lab",
    lab: "DSP & Image Processing Lab",
    equipmentCode: "GECSKP-DSP-LIC-01",
    description: "FLEXlm floating license server drops socket connection when more than 30 client terminals in DSP Lab initialize the Signal Processing Toolbox concurrently during S5 lab exams.",
    urgency: "elevated",
    stage: "in_progress",
    reportedBy: "pkd22ec045@gecskp.ac.in",
    studentName: "Adithya R. (S5 ECE)",
    reportedAt: "2026-10-13T16:20:00Z",
    upvotes: 24,
    upvotedBy: ["pkd22ec045@gecskp.ac.in"],
    resolutionNotes: "System administrator contacted. Server firewall TCP keepalive window expanded from 60s to 300s, and concurrent pool increased by 15 seats under campus agreement.",
    assignedRep: "ece.rep@gecskp.ac.in",
    targetFixDate: "2026-10-18",
    comments: []
  }
];

export const INITIAL_CONFIDENTIAL_VAULTS = [
  {
    vaultKey: "849201",
    title: "Medical Duty Leave & KTU Attendance Condonation Query",
    category: "attendance",
    isAnonymous: true,
    authorEmail: "pkd23ec012@gecskp.ac.in", // stored hashed/securely; displayed as ANONYMOUS
    createdAt: "2026-10-14T10:00:00Z",
    status: "active",
    priority: "high",
    subjectRoll: "ANONYMOUS (6-Digit Vault Secured)",
    messages: [
      {
        id: "msg-1",
        sender: "student",
        senderLabel: "STUDENT (Vault Owner)",
        timestamp: "2026-10-14T10:00:00Z",
        content: "Hello representative, I was hospitalized for severe Dengue fever for 11 consecutive working days between Sep 28 and Oct 9. My overall attendance in EC301 and EC303 has dropped to 68%. Will this qualify for medical duty leave condonation under KTU rules, and what documents do I need to hand in to the HoD?",
        attachments: ["Medical_Certificate_Govt_Taluk_Hosp.pdf"]
      },
      {
        id: "msg-2",
        sender: "rep",
        senderLabel: "ECE ASSOCIATION REP (Official)",
        timestamp: "2026-10-14T12:30:00Z",
        content: "Hello. Yes, under KTU B.Tech Ordinance Section 6.2, medical hospitalization leaves exceeding 5 days can be condoned down to 65% with the HoD and Principal's recommendation. You need: (1) Original discharge summary from Taluk/District hospital, (2) Fitness certificate, and (3) Parent's signature on the KTU Annexure-IV form. Please keep this Vault Key safe. You can drop off the hard copies in a sealed envelope to me in LH-2 during lunch hour tomorrow.",
        attachments: []
      },
      {
        id: "msg-3",
        sender: "student",
        senderLabel: "STUDENT (Vault Owner)",
        timestamp: "2026-10-14T15:10:00Z",
        content: "Understood, thank you so much! I have the discharge summary and fitness certificate ready. I will hand over the envelope tomorrow at 1:15 PM.",
        attachments: []
      }
    ]
  },
  {
    vaultKey: "310842",
    title: "EC304 Digital Signal Processing Internal Test Mark Discrepancy",
    category: "academics",
    isAnonymous: false,
    authorEmail: "pkd22ec045@gecskp.ac.in",
    createdAt: "2026-10-15T08:20:00Z",
    status: "in_review",
    priority: "normal",
    subjectRoll: "PKD22EC045 (Adithya R.)",
    messages: [
      {
        id: "msg-4",
        sender: "student",
        senderLabel: "Adithya R. [PKD22EC045]",
        timestamp: "2026-10-15T08:20:00Z",
        content: "Hi, in the EC304 Series Test 1 paper distributed yesterday, question 4b (FFT Butterfly computation) was awarded 7 marks, but on the front page summary grid, only 2 marks were transcribed. My total entered into KTU portal is showing 32 instead of 37.",
        attachments: ["Series1_FrontPage_Scan.jpg"]
      },
      {
        id: "msg-5",
        sender: "rep",
        senderLabel: "ECE ASSOCIATION REP (Official)",
        timestamp: "2026-10-15T11:45:00Z",
        content: "Checked with the course faculty Dr. Sureshkumar. He acknowledged the clerical transcription typo on the cover page. He will submit the revised mark sheet to the KTU internal exam cell by Friday afternoon. You don't need to file a formal revaluation fee.",
        attachments: []
      }
    ]
  },
  {
    vaultKey: "991204",
    title: "Confidential Financial Aid & Department Book-Bank Assistance",
    category: "welfare",
    isAnonymous: true,
    authorEmail: "pkd22ec019@gecskp.ac.in",
    createdAt: "2026-10-15T18:00:00Z",
    status: "active",
    priority: "elevated",
    subjectRoll: "ANONYMOUS (6-Digit Vault Secured)",
    messages: [
      {
        id: "msg-6",
        sender: "student",
        senderLabel: "STUDENT (Vault Owner)",
        timestamp: "2026-10-15T18:00:00Z",
        content: "Are there any departmental textbook grants or alumni financial book-banks for S5 core subjects (VLSI, DSP, Microcontrollers)? Buying all three reference texts (Weste & Harris, Oppenheim, Mazidi) is currently beyond my financial capacity.",
        attachments: []
      },
      {
        id: "msg-7",
        sender: "rep",
        senderLabel: "ECE ASSOCIATION REP (Official)",
        timestamp: "2026-10-16T09:15:00Z",
        content: "We have the GECSKP ECE Alumni Association 'Vidya Nidhi' book-bank in the department library. We have 4 sets of Weste and Oppenheim reserved specifically for semester lending. I can issue them to you directly without any public announcement. Reply here when you are free to pick them up from the library staff desk.",
        attachments: []
      }
    ]
  }
];

export const DEMO_USERS = [
  {
    email: "pkd22ec045@gecskp.ac.in",
    role: "student",
    name: "Adithya R.",
    rollNumber: "PKD22EC045",
    batch: "S5 ECE (2022-2026)",
    description: "Standard Student Account"
  },
  {
    email: "pkd23ec012@gecskp.ac.in",
    role: "student",
    name: "Fathima N.",
    rollNumber: "PKD23EC012",
    batch: "S3 ECE (2023-2027)",
    description: "Junior Student Account"
  },
  {
    email: "ece.rep@gecskp.ac.in",
    role: "representative",
    name: "ECE Student Representative",
    rollNumber: "REP-ECE-DESK",
    batch: "Association Executive Council",
    description: "Authorized Rep Desk (Unlocks Operations Desk)"
  }
];

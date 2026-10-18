# Issue #1: Anonymous Confidential Vault & Department Representative Unified Triage Dashboard

- **Issue URL**: [https://github.com/AVA-NTHIKA14/ECE-Connect/issues/1](https://github.com/AVA-NTHIKA14/ECE-Connect/issues/1)
- **Status**: COMPLETED & VERIFIED
- **Assignee**: Department Representative (`ece.rep@gecskp.ac.in`)
- **Category**: Enhancement / Architecture

---

## 1. Description & User Requirements

1. **Anonymous Support in Confidential Welfare Vault**:
   - Provide an optional anonymity toggle when raising a private grievance in the Confidential Vault.
   - When selected, mask complainant student name, KTU roll number, and email address from the representative view (`Anonymous Student`, `CONFIDENTIAL`, `[Protected Identity]`).
   - Retain 2-way real-time communication between the vault owner and the representative without exposing the student's real identity in chat message sender labels.

2. **Department Representative Unified Triage Dashboard**:
   - Provide the ECE Association Representative with a unified queue showing **all issues (both public complaints and private grievances)**.
   - Support master visibility filters (`All Inquiries`, `Public Wall Issues`, `Confidential Grievances`).
   - Support multi-dimensional filtering by category (Labs, Classrooms, Facilities, Academics, Welfare, Attendance, etc.), lifecycle stage, and urgency.
   - Provide live global metrics for active pipeline, confidential cases, and resolution totals.

3. **Mark Status of Issue**:
   - Enable representatives to advance lifecycle stages (`Reported` → `Acknowledged` → `In Progress` → `Resolved`) for any ticket (both public issues and private grievances).
   - Require resolution/triage progress notes and optional target fix dates.

4. **Mark to View Public (Publish to Community Wall)**:
   - Provide an action on private/confidential grievances to mark them to "View Public" (publish to the public Complaint Wall).
   - If the student opted for anonymity, strictly preserve anonymity by attributing the public issue to `ECE Student (Anonymous)`.
   - Allow representative to specify target department lab or facility room.

5. **Close Ticket**:
   - Provide formal ticket closure with mandatory resolution log notes.
   - Apply the official department `CLOSED` token stamp.
   - Transfer verified public cases to the permanent Resolved Issues Archive and mark private grievances as officially closed.

---

## 2. Implementation Checklist

- [x] Create GitHub Issue #1 via repository API.
- [x] Create in-repo issue documentation (`issues/001-anonymous-confidential-vault-and-rep-dashboard.md`).
- [x] Add `isAnonymous` option in `NewIssueModal.jsx` for private grievances.
- [x] Enhance `src/services/db.js` with:
  - `createPrivateGrievance` anonymous payload handling.
  - `subscribeAllPublicIssues` for representative view.
  - `updatePrivateGrievanceStage` for lifecycle updates.
  - `closePrivateGrievanceWithToken` for closing private tickets.
  - `publishPrivateGrievanceToPublic` for "Mark to View Public" action.
- [x] Update `ConfidentialVault.jsx` to render anonymous badges, mask details for representative view, and anonymize message sender labels.
- [x] Update `RepOperationsDesk.jsx` with unified queue, stage updater, "Mark to View Public" flow, and ticket closure.
- [x] Update `MyComplaints.jsx` to display anonymous indicator.
- [x] Connect `subscribeAllPublicIssues` in `App.jsx`.
- [x] Run `npm run build` and verify all flows.

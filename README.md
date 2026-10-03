# FocuzSpot

**Find a place to focus in Bishkek.**

FocuzSpot is a solo project for WarriorHacks 2.0. It is being built to help students find free or affordable public and student-accessible places to study in Bishkek.

> **Status:** MVP in progress. This repository currently contains the initial project skeleton and preference-form interface.

## The problem

Students often need somewhere to study for a few hours, but a general map may not make it easy to compare the details that matter: cost, access, opening hours, quietness, Wi-Fi, or power outlets. FocuzSpot focuses on those study-specific needs.

## Who it is for

Students in Bishkek looking for a free or affordable place to study, work on a laptop, or prepare for exams.

## MVP flow

1. Enter study preferences such as budget, noise level, Wi-Fi, and power outlets.
2. See study spaces ranked by how well they fit those needs.
3. Open a place to review its access information, hours, amenities, and data sources.
4. Submit a current-condition report; reports are shown with their age and are not treated as current after they expire.

The first directory will focus on libraries and public or student-accessible spaces. No physical venue visits are required for this initial research: public information will be recorded with its source, and unknown details will remain marked as unknown.

## Data accuracy

Stable place information and temporary user reports are treated separately. If no recent report exists, the app will show **“No recent report”** rather than implying current occupancy, noise, Wi-Fi, or outlet availability. Demo or test data will be labelled clearly.

## Tech stack

- React
- TypeScript
- Vite
- CSS

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed in your terminal. To create a production build, run `npm run build`.

## Project status

- [x] Initial React + TypeScript + Vite project skeleton
- [x] Preference-form interface
- [ ] Research and add sourced Bishkek study spaces
- [ ] Implement preference-based matching
- [ ] Add map and location details
- [ ] Add timestamped, expiring user reports
- [ ] Deploy demo and add screenshots/video

## Hackathon submission

Built for **WarriorHacks 2.0**.

- Live demo: _coming soon_
- Demo video: _coming soon_
- Screenshots: _coming soon_

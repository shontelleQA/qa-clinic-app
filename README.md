# QA Clinic  
*A calm, interactive learning space for hands-on Software Quality Assurance practice.*

QA Clinic is an interactive web app built for **Test Like A Girl (TLAG)**.  
Learners diagnose bugs, explore clues, write analysis, and receive AI mentor-style feedback.  
It blends healthcare-inspired structure with modern tech workflows—without being cheesy or literal.

---

## Features

### Interactive QA Challenges  
Each case includes symptoms, logs, artifacts, and investigation clues—presented like a patient chart.

### Practice Workspace  
Users can complete:
- Suspected root cause  
- Reproduction steps  
- Expected vs. actual results  
- Affected components  
- Severity  
- Test cases  

Progress automatically saves using localStorage.

### AI Mentor Feedback  
A built-in “Get Feedback” button sends the user’s analysis to Gemini and returns:
- Detailed coaching  
- Missing considerations  
- How a senior QA would approach the scenario  
- Suggestions for improvement  

### Difficulty Levels  
Cases are marked **Easy**, **Medium**, or **Hard** so learners can progress comfortably.

---

## Purpose

QA Clinic helps learners:

- Practice structured bug investigation  
- Build strong repro-case writing habits  
- Reason through root causes like a real QA engineer  
- Write thoughtful test cases  
- Develop confidence in diagnosing and communicating quality issues  

Part of the **Test Like A Girl** ecosystem — tools, content, and community built for women pivoting into QA, automation, and data roles.

---

## Roadmap

Planned additions include:

- SQL Clinic (sister training tool)  
- API Clinic  
- Performance and accessibility cases  
- Race condition and concurrency cases  
- Beginner-friendly security cases  
- Certification-style practice mode  
- TLAG Academy Hub integration  

---

## Contributing

Contributions are welcome — especially new case scenarios and datasets.  
This project is intended to remain free and community-friendly.

---

## Tech Stack

- React  
- TypeScript  
- Gemini API (AI mentorship)  
- LocalStorage (progress persistence)  
- Vite (or the bundler configured in AI Studio)

---

## Running Locally

```bash
npm install
npm run dev



<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1GtHx1PbD6Nk7IwhVSwnaXAoKw29DQRtB

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

# 🤖 BillSense — AI Multi-Agent Financial Intelligence System

## 📌 Overview
BillSense is an AI-powered multi-agent system that analyzes bills, detects anomalies, generates financial insights, and automatically creates dispute letters when suspicious charges are found. It demonstrates a real-world application of agentic AI systems built for automation, reasoning, and decision support.

---

## 🚨 Problem Statement
Manual bill verification is time-consuming, error-prone, and difficult for users to analyze. Many users fail to detect incorrect charges, duplicate billing, or suspicious pricing patterns.

BillSense solves this by using AI agents to automatically read, analyze, and interpret bills in a structured and intelligent way.

---

## 💡 Solution
BillSense uses a **multi-agent architecture** where different agents handle different responsibilities:

- Extract structured data from bills
- Detect anomalies and suspicious patterns
- Generate human-readable insights
- Automatically create dispute letters when required

This removes manual effort and improves accuracy in financial verification.

---

## 🧠 Key Features

### 📄 Bill Extraction Agent
- Parses uploaded bill data
- Converts unstructured input into structured format
- Identifies items, prices, and totals

### ⚠️ Anomaly Detection Agent
- Detects unusual pricing or mismatches
- Flags suspicious or duplicate entries
- Validates bill consistency

### 🧾 Insight Generation Agent
- Converts technical findings into simple explanations
- Summarizes bill health clearly for users

### ✉️ Dispute Letter Agent
- Generates professional dispute letters automatically
- Based on detected anomalies
- Ready-to-send format output

---

## 🏗️ Architecture

User Input (Bill Upload)
→ Frontend (React + Vite UI)
→ Backend (server.ts API)
→ AI Multi-Agent Orchestrator
→ Agents Pipeline:
   1. Extraction Agent
   2. Analysis Agent
   3. Insight Agent
   4. Dispute Generator Agent
→ Final Output:
   - Structured bill breakdown
   - Alerts & flags
   - Insight summary
   - Dispute letter (if needed)

---

## ⚙️ Tech Stack

Frontend:
- React
- Vite
- TypeScript
- CSS

Backend:
- Node.js
- TypeScript (server.ts)

AI System:
- Multi-agent orchestration
- Rule + reasoning based detection
- Structured output generation

Deployment:
- Local development

---

## 📁 Project Structure

src/
- App.tsx
- main.tsx
- index.css
- types.ts

server.ts
index.html
package.json
package-lock.json
vite.config.ts
tsconfig.json
metadata.json
README.md

---

## ⚙️ How to Run

npm install  
npm run dev (frontend)  
node server.ts (backend)

---

## 🎯 Highlights

- Real-world financial intelligence system  
- Fully agent-driven architecture  
- Automated anomaly detection  
- Human-readable insights generation  
- Dispute letter automation  

---

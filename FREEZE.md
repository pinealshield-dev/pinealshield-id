# PinealID — Technical Freeze Baseline
Version: 2026.02
Tag: pinealid-dev-stable-2026.02
Branch: dev (frozen snapshot)

---

## 1. Purpose

PinealID is the official mobile verification layer for Pineal Shield certifications.

Primary function:
- Scan QR (NFC future)
- Validate against public Supabase RPC
- Return certification authenticity status

---

## 2. Stack Confirmed

React Native: 0.83.1  
React: 19.2.0  
Node: v20.19.x  
Hermes: Enabled  
Metro: 8082  
Android compileSdk: 36  
Android targetSdk: 36  
Architectures: arm64-v8a, x86_64  

Vision Camera: Operational  
Reanimated: Operational  

---

## 3. Android Configuration Status

- Debug and Main AndroidManifest configured
- INTERNET permission enabled
- CAMERA permission enabled
- usesCleartextTraffic controlled via Gradle
- Release currently signed with debug keystore (temporary — Phase 2)

Proguard: Disabled in baseline  
Minify: Disabled  

---

## 4. Project Structure

src/
- config/
- domain/
- navigation/
- services/
- ui/
- utils/
- theme/

Core screens:
- HomeScreen
- ScanScreen
- ResultScreen
- OfflineScreen

---

## 5. Functional Flow (Validated)

Home → Scan → Result → Offline (if no network)

Validated on:
- Android Emulator
- Honor physical device

Public RPC verification working.

---

## 6. Stability Rules

- Do not change Node version without branch + justification
- Do not delete node_modules unless critical
- Do not modify Hermes configuration without diagnosis
- Do not alter Android architectures without analysis
- No build changes directly on dev branch

All config modifications require:
1. File inspection
2. Impact analysis
3. Rollback plan

---

## 7. Next Phases

Phase 2 — Android Release hardening
Phase 3 — Premium UI refinement
Phase 4 — iOS enablement

# Adaptive Mobile Security System - Kazakh Edition

## Executive Summary

Android-qa arnalgan kesendi mobil'di qauipsizdik qosymshasy. Qazaq jane orys tilderinde. AI skaneri, qupija qoyma, spam qorǵau, minez-qulyq analizin biriktiret'in tegi'n sheshim. 1K-10K paidalanushylar ushin MVP.

---

## Problem Statement

### Qazi'rgi' maseeler
- Qazaqstandyqtar ushin qazaq tilinde kesendi qauipsizdik qosymshasy joq
- Paidalanushylar birneshe qosymshalary qoldanuǵa majbur: antivirus + password manager + spam blocker
- Kobi'ne qosymshalar tek oryssha nemese agylyshynsha
- On-device AI skanerleri si'reqtylyq, kopshiligi bultta

### Sheshi'm
Barlyǵy bir jerde - "SENTINEL" qosymshasy:
- JI skaneri (qurylǵyda jumys istei'di)
- Qupija qoyma (AES-256 shifrlaǵan)
- Spam qoŋyraulardyŋ ozi'mi'zdi'ŋ bazasy
- Mi'nez-qulyq monitoringi
- Push eskertuler

---

## Success Criteria

| Metrika | Maqsat |
|---------|--------|
| Ornatylu | 1,000+ Play Store-dan |
| Retention (7 kun) | > 40% |
| Scan completion rate | > 80% |
| Crash-free users | > 99% |
| App rating | > 4.0 |

---

## User Personas

### 1. Kadimgi paidalanushy (Aisulu, 35 jas)
- **Tehnikaly'q deŋgei':** Tomen
- **Maqsaty:** Telefonyn qauipsi'z ustau, spam qoŋyraulardaŋ qorǵanu
- **Qalauу:** Qarapai'ym interface, qazaqsha
- **Pain point:** "Qai'da basu kerek - tusini'ksiz"

### 2. IT mamany (Arman, 28 jas)
- **Tehnikaly'q deŋgei':** Joǵary
- **Maqsaty:** Tereich analiz, logs koru
- **Qalauу:** Keŋei'tilgen parametrler
- **Pain point:** "On-device AI joq, barlyǵy bultqa jiberedi"

### 3. Biznes paidalanushy (Dinara, 42 jas)
- **Tehnikaly'q deŋgei':** Ortasha
- **Maqsaty:** Kompanija derekteri'n qorǵau
- **Qalauу:** Qupija qoyma, kushi'ti' shifrlapu
- **Pain point:** "Password manager-ler qazaqsha joq"

---

## User Journey

### Birі'nshi' 2 minut (Onboarding)
```
1. Qosymshanı ashý → Splash screen (SENTINEL logo)
2. Ti'l taŋdaý → Qazaqsha / Oryssha
3. Google Sign-In → Bir basýmen ti'rkelý
4. Ruxsattar → Storage, Phone, Notifications
5. Basty bet → "Skanerleý" batyrmasy
6. Birі'nshі' scan → 30 sekund, natije korsetý
```

### Kundelі'ktі' qoldaný
```
1. Qosymshanı ashý → Qauі'psі'zdі'k kui'n koru (jasyl/sary/qyzyl)
2. "Terech analiz" → Толыq scan bastaý
3. Qupіja qоуmа → Jeke faуldardу korý/qosý
4. Spam jurnal → Bloktаlǵan nomerler tі'zі'mі'
5. Parametrler → Til, notifications, account
```

---

## Functional Requirements

### P0 - Must Have (MVP)

#### F1: AI Skaneri
- **Sипаттама:** TensorFlow Lite modeli qurylǵyda jұmys і'stei'dі'
- **Acceptance criteria:**
  - [ ] Jyldам scan < 30 sekund
  - [ ] Tereich scan < 3 minyt
  - [ ] Malware detection accuracy > 90%
  - [ ] Offline jұmys і'stei'dі'
  - [ ] Scan natijesi': qauipsizdik ұpайы (0-100)

#### F2: Qupija Qоуmа (Vault)
- **Sипаттама:** AES-256 shifrlanǵan faуldar qоуmаsу
- **Acceptance criteria:**
  - [ ] Foto, video, document qosý
  - [ ] PIN/Biometria arqyly qorǵaý
  - [ ] Export/Import funkcijasy
  - [ ] Faуldar tі'zі'mі'n korý (thumbnails жоq - qauipsіzdіk)
  - [ ] Qoyma olmі'n korsetý

#### F3: Minez-qułyq Analizі'
- **Сипаттама:** Background-та qurylǵy aktivtі'gі'n baqylaý
- **Acceptance criteria:**
  - [ ] Battery қoldaný anomalijasy
  - [ ] Network traffic anomalijasy
  - [ ] App behavior anomalijasy
  - [ ] Ескertu push notification arqyly

#### F4: Spam Qоŋyraular
- **Сипаттама:** Oz bazamyz + user reports
- **Acceptance criteria:**
  - [ ] Incoming call screen-de spam eskertu
  - [ ] Nomer reporttaý myкіnдіgі'
  - [ ] Spam database sync (Firebase)
  - [ ] Auto-block opciјаsy
  - [ ] Spam jurnal (tarihi)

#### F5: Qaуі'p Esкertuleri
- **Сипаттама:** Push notifications
- **Acceptance criteria:**
  - [ ] Malware tabylǵanda eskertu
  - [ ] Anomalija tabylǵanda eskertu
  - [ ] Spam qoŋyraý kelgende eskertu
  - [ ] Notification settings

### P1 - Should Have

#### F6: Dashboard/Bаsty Bet
- Qauipsіzdіk ұpайы (skoр)
- Soŋǵy scan natiјеsі'
- Jyldam arеkеttеr

#### F7: Account Synс
- Google Sign-In
- Settings sync
- Spam reports sync

### P2 - Nice to Have

#### F8: Widget
- Home screen widget - qauipsіzdіk statusу

#### F9: Dark/Light Theme
- Qazіr tek dark theme (dizaуn dаiуn)

---

## Technical Architecture

### Data Model

```
Users
├── uid (string, PK)
├── email (string)
├── displayName (string)
├── language (enum: kk, ru)
├── createdAt (timestamp)
└── settings
    ├── notificationsEnabled (boolean)
    ├── autoScanEnabled (boolean)
    └── spamBlockEnabled (boolean)

ScanResults
├── id (string, PK)
├── userId (string, FK)
├── timestamp (timestamp)
├── type (enum: quick, deep)
├── score (number 0-100)
├── threatsFound (number)
├── duration (number, seconds)
└── details (json)

SpamNumbers (shared)
├── phoneNumber (string, PK)
├── reportCount (number)
├── category (enum: spam, fraud, telemarketing)
├── lastReported (timestamp)
└── confidence (number 0-1)

UserSpamReports
├── id (string, PK)
├── userId (string, FK)
├── phoneNumber (string)
├── category (enum)
├── timestamp (timestamp)
└── notes (string, optional)

VaultItems (local only)
├── id (string, PK)
├── fileName (string, encrypted)
├── fileType (enum: photo, video, document)
├── filePath (string, encrypted)
├── addedAt (timestamp)
└── size (number, bytes)
```

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    ANDROID APP                          │
├─────────────────────────────────────────────────────────┤
│  UI Layer (Jetpack Compose)                             │
│  ├── HomeScreen (Dashboard)                             │
│  ├── ScanScreen (AI Scanner)                            │
│  ├── VaultScreen (Encrypted Vault)                      │
│  ├── SpamScreen (Spam Calls)                            │
│  ├── BehaviorScreen (Anomaly Analysis)                  │
│  └── SettingsScreen                                     │
├─────────────────────────────────────────────────────────┤
│  Domain Layer                                           │
│  ├── ScanUseCase                                        │
│  ├── VaultUseCase                                       │
│  ├── SpamUseCase                                        │
│  └── BehaviorUseCase                                    │
├─────────────────────────────────────────────────────────┤
│  Data Layer                                             │
│  ├── LocalDatabase (Room + SQLCipher)                   │
│  ├── EncryptedStorage (AES-256)                         │
│  ├── FirebaseRepository                                 │
│  └── TFLiteRepository (AI Model)                        │
├─────────────────────────────────────────────────────────┤
│  Core Services                                          │
│  ├── ScannerService (Background)                        │
│  ├── BehaviorMonitorService (Foreground)                │
│  ├── CallScreeningService                               │
│  └── NotificationService                                │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    FIREBASE                             │
├─────────────────────────────────────────────────────────┤
│  Authentication                                         │
│  ├── Google Sign-In                                     │
│  └── Email/Password                                     │
├─────────────────────────────────────────────────────────┤
│  Firestore                                              │
│  ├── users/{uid}                                        │
│  ├── spam_numbers/{phoneNumber}                         │
│  └── user_spam_reports/{reportId}                       │
├─────────────────────────────────────────────────────────┤
│  Cloud Functions                                        │
│  ├── onSpamReport (aggregate reports)                   │
│  ├── calculateSpamConfidence                            │
│  └── cleanupOldReports                                  │
└─────────────────────────────────────────────────────────┘
```

### Integrations

| Service | Purpose | Notes |
|---------|---------|-------|
| Firebase Auth | User authentication | Google Sign-In preferred |
| Firebase Firestore | Cloud database | Spam numbers, user data |
| Firebase Cloud Functions | Server logic | Spam aggregation |
| TensorFlow Lite | AI scanning | On-device inference |
| Android CallScreeningService | Spam detection | System API |

### Security Model

#### Authentication
- Google Sign-In (primary)
- Email/Password (secondary)
- No anonymous access

#### Data Protection
| Data Type | Storage | Encryption |
|-----------|---------|------------|
| Vault files | Local | AES-256 |
| Vault metadata | Local | AES-256 |
| Scan results | Local | SQLCipher |
| User settings | Firebase | TLS + at-rest |
| Spam reports | Firebase | TLS + at-rest |

#### Permissions Required
```xml
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.READ_CALL_LOG" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
```

---

## Non-Functional Requirements

### Performance
- App launch: < 2 seconds (cold start)
- Quick scan: < 30 seconds
- Deep scan: < 3 minutes
- Vault file open: < 1 second
- Spam lookup: < 200ms

### Scalability
- 1K - 10K users (MVP phase)
- Spam database: up to 100K numbers
- Firebase free tier sufficient for MVP

### Reliability
- Crash-free rate: > 99%
- Offline functionality: Scan, Vault work offline
- Background service: Survives app kill

### Security
- AES-256 for vault encryption
- SQLCipher for local database
- No plain-text secrets in code
- ProGuard/R8 obfuscation

---

## Out of Scope

- iOS version (Android only for MVP)
- VPN functionality
- Web dashboard
- Multi-device sync for vault
- Corporate/Enterprise features
- Dark web monitoring
- SIM swap protection

---

## Open Questions for Implementation

1. **TensorFlow Lite model:** Need to train/find suitable malware detection model
2. **Spam database seed:** Initial data source for Kazakhstan phone numbers
3. **Behavioral analysis thresholds:** What constitutes "anomaly"?
4. **Vault backup:** Should encrypted backups be supported?
5. **Play Store compliance:** Call screening permissions review

---

## Appendix: Existing Screens (Stitch)

Qazaqsha ekrandar (projects/8359964081610504402):

| Screen ID | Title | Dimensions |
|-----------|-------|------------|
| 330c18bf | Basty bet - Qauipsizdik kui | 390x1225 |
| 334ecdca | Basty bet - JI Qauipsizdik kui | 390x1079 |
| 4ecbbc30 | Minez-qulyq anomalijasyn taldau | 390x1430 |
| ddc2322f | Quryłǵyny skanerleý - Tereч taldaý | 390x1019 |
| e7e724d0 | Qupija qouma - Qorǵalǵan derekter | 390x1079 |

### Design System
- **Theme:** Dark mode
- **Primary:** #a5c8ff (blue, trust)
- **Secondary:** #40e56c (green, safe)
- **Tertiary:** #ffb692 (orange, alert)
- **Surface:** #121416
- **Fonts:** Space Grotesk (headlines), Manrope (body)
- **Roundness:** 0.75rem (cards), 0.5rem (buttons)

---

## Appendix: Research Findings

### On-device AI vs Cloud AI
- **Choice:** On-device (TensorFlow Lite)
- **Rationale:**
  - Privacy: No user data leaves device
  - Speed: No network latency
  - Offline: Works without internet
  - Cost: No cloud inference costs
- **Tradeoffs:**
  - Model size limited (~5-20MB)
  - Less powerful than cloud models
  - Updates require app update

### Spam Database Strategy
- **Choice:** Own database + user reports
- **Rationale:**
  - Kazakhstan-specific numbers
  - Community-driven accuracy
  - No API costs
  - Data ownership
- **Implementation:**
  - Firebase Firestore for storage
  - Cloud Functions for aggregation
  - Confidence score based on report count

---

*Spec created: 2026-03-28*
*Interview conducted by: Claude Code (discovery-interview skill)*

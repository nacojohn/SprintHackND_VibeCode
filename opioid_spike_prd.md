# Product Requirements Document: Opioid Spike Detection & Response AI Agent (MVP)

**Version:** 1.0  
**Last Updated:** November 16, 2025  
**Document Owner:** Product Team  
**Status:** Draft for Review

---

## Executive Summary

### Product Vision
An AI-powered decision support system that empowers county public health overdose response teams to detect opioid overdose spikes in real-time, forecast emerging risks, and receive actionable intervention recommendations—reducing response time from days to hours and preventing preventable fatalities.

### The Problem
County public health teams currently face **1-3 day delays** in spike detection due to:
- Manual data downloads and spreadsheet cleaning
- Fragmented data sources requiring cross-system verification
- Lagged intelligence driving deployment decisions
- Manual situational reporting and partner communication

**Impact:** Delayed action during critical spike windows leads to preventable deaths.

### The Solution
An AI agent that:
1. **Detects** statistical anomalies in overdose patterns at ZIP code granularity
2. **Forecasts** spike risk 3-7 days in advance using leading indicators
3. **Recommends** prioritized interventions based on historical effectiveness and current capacity
4. **Automates** situational update generation and partner outreach communications

### Success Metrics (MVP)
- **Time to spike detection:** < 24 hours (vs. current 1-3 days)
- **Forecast accuracy:** 70%+ precision on 3-day spike predictions
- **User adoption:** 80%+ weekly active usage by pilot county response team
- **Operational efficiency:** 50% reduction in manual reporting time
- **User satisfaction:** 4.0+ NPS from pilot users

---

## Target Users

### Primary Persona: County Overdose Response Coordinator
**Role:** Opioid response coordinators, public health epidemiologists, overdose surveillance analysts

**Responsibilities:**
- Monitor overdose trends across county jurisdictions
- Deploy mobile harm reduction teams and naloxone distribution
- Coordinate with community partners (shelters, treatment centers, law enforcement)
- Report to county health leadership and state health departments

**Current Pain Points:**
- Data arrives too late to prevent spike escalation
- Manual data cleaning consumes 30-40% of weekly time
- Difficult to justify resource allocation without clear evidence
- Partner communications require manual customization per organization

**Goals:**
- Detect spikes before they escalate
- Make evidence-based deployment decisions quickly
- Maintain stakeholder trust with transparent, explainable analytics
- Reduce administrative burden of reporting

---

## Product Scope

### In Scope (MVP)
✅ **Data Ingestion**
- Manual CSV/Excel upload interface (simulated ODMAP-format data)
- Support for core ODMAP fields: date/time, location (ZIP), naloxone administered, outcome severity

✅ **Spike Detection**
- Statistical anomaly detection (2+ standard deviations above 28-day rolling mean)
- Naloxone dose escalation flagging
- ZIP code-level granularity

✅ **Risk Forecasting**
- 3-7 day spike probability forecasts
- Leading indicator tracking (naloxone usage rate, severity trends)

✅ **Intervention Recommendations**
- Prioritized action lists per ZIP code
- Resource deployment suggestions (mobile teams, naloxone kits)
- Partner notification recommendations

✅ **Communication Automation**
- Auto-generated situational update summaries
- Partner outreach email templates (editable)
- Copy-to-clipboard functionality for Slack/Teams

✅ **User Interface**
- Web-based dashboard (desktop-optimized)
- ZIP code heat map visualization
- Time-series trend charts
- Exportable reports (PDF/Excel)

### Out of Scope (MVP)
❌ Direct ODMAP API integration (future roadmap)  
❌ Real-time SMS/push alerting (future roadmap)  
❌ Mobile app  
❌ Case management or patient-level tracking  
❌ Integration with EMS/ED systems  
❌ Multi-county deployments (single pilot county only)  
❌ Predictive modeling beyond 7 days  

### Future Roadmap (Post-MVP)
- **Phase 2:** Direct ODMAP API integration with MOU support
- **Phase 3:** Multi-county deployment and state-level dashboards
- **Phase 4:** Real-time alerting (SMS, push notifications, Slack/Teams webhooks)
- **Phase 5:** Integration with EMS severity codes, ED syndromic surveillance, drug seizure labs
- **Phase 6:** Predictive modeling with machine learning (14-30 day forecasts)

---

## Functional Requirements

### FR-1: Data Upload & Management

#### FR-1.1: CSV/Excel Upload
- **User Story:** As a response coordinator, I want to upload overdose data from my local ODMAP export so I can analyze current trends.
- **Acceptance Criteria:**
  - System accepts CSV and XLSX file formats
  - Maximum file size: 50MB
  - Upload includes validation for required fields
  - System provides clear error messages for malformed data
  - Historical data retention: 24 months minimum

#### FR-1.2: Required Data Fields
| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| `date_time` | DateTime | Incident date and time | 2025-11-15 14:32:00 |
| `zip_code` | String (5 digits) | Incident location | 46619 |
| `naloxone_administered` | Boolean | Was naloxone given? | TRUE |
| `naloxone_doses` | Integer | Number of doses administered | 2 |
| `outcome` | Enum | Fatal/Non-Fatal | Non-Fatal |

#### FR-1.3: Data Validation
- ZIP codes must be valid for pilot county
- Dates cannot be in the future
- Naloxone doses must be ≥ 0 if naloxone_administered = TRUE
- System flags duplicate records (same date/time/location)

---

### FR-2: Spike Detection Engine

#### FR-2.1: Statistical Anomaly Detection
- **Algorithm:** 28-day rolling mean with 2 standard deviation threshold
- **Granularity:** ZIP code level
- **Detection Logic:**
  ```
  IF current_7day_average > (rolling_28day_mean + 2 * rolling_28day_stddev)
  THEN flag as "Spike Detected"
  ```

#### FR-2.2: Naloxone Escalation Flagging
- **Metric:** Average naloxone doses per incident
- **Detection Logic:**
  ```
  IF current_avg_doses_per_incident > 1.5 * historical_avg_doses_per_incident
  THEN flag as "Severity Escalation"
  ```

#### FR-2.3: Spike Severity Classification
| Level | Criteria | Color Code |
|-------|----------|------------|
| **Critical** | ≥3 SD above baseline OR fatal outcomes >20% | Red |
| **High** | 2-3 SD above baseline | Orange |
| **Moderate** | 1.5-2 SD above baseline | Yellow |
| **Watch** | 1-1.5 SD above baseline | Blue |

---

### FR-3: Risk Forecasting

#### FR-3.1: 3-7 Day Spike Probability
- **Input Features:**
  - Current 7-day trend trajectory
  - Naloxone usage rate change
  - Recent severity score (doses per incident)
  - Historical spike patterns (day of week, seasonal)

- **Output:** Probability score (0-100%) per ZIP code

#### FR-3.2: Leading Indicator Dashboard
- Display trend arrows for:
  - Total incidents (7-day rolling)
  - Naloxone doses per incident
  - Fatal outcome rate
  - Geographic spread (# of affected ZIPs)

---

### FR-4: Intervention Recommendations

#### FR-4.1: Recommendation Engine
- **Inputs:**
  - Detected spike severity
  - Historical intervention effectiveness per ZIP
  - User-provided team capacity (manual input)
  - Geographic proximity of resources

- **Outputs (Ranked List):**
  1. **Recommended Action** (e.g., "Deploy 2 mobile teams to ZIP 46619")
  2. **Rationale** (e.g., "Incidents up 42% vs. baseline, historically responsive to outreach")
  3. **Priority Score** (1-100)
  4. **Suggested Partners** (e.g., "Shelter A, Food Pantry B")

#### FR-4.2: Resource Allocation Suggestions
- Naloxone kit distribution quantities
- Mobile team deployment schedules (next 3-5 days)
- Priority locations (street addresses of partner sites from user-maintained directory)

---

### FR-5: Communication Automation

#### FR-5.1: Situational Update Generator
- **Auto-Generated Content:**
  - Executive summary (2-3 sentences)
  - Key metrics (incidents, % change, affected ZIPs)
  - Top 3 recommended actions
  - Map snapshot

- **Export Formats:** PDF, Word, Copy-to-clipboard

#### FR-5.2: Partner Outreach Templates
- **Template Types:**
  - Community partner alert (shelters, treatment centers)
  - Law enforcement liaison notification
  - County leadership briefing

- **Customization:**
  - Editable text fields before sending
  - Merge fields: {{ZIP_CODE}}, {{INCIDENT_COUNT}}, {{TREND}}

#### FR-5.3: Email Export
- Generate draft emails with pre-filled subject lines
- Include attachments (charts, maps)
- Copy button for Slack/Teams posting

---

### FR-6: User Interface & Visualization

#### FR-6.1: Dashboard Layout
**Main Dashboard Components:**
1. **County Overview Panel**
   - Total incidents (current week vs. prior week)
   - Active spike alerts (count by severity)
   - Forecast risk level (next 3 days, next 7 days)

2. **Interactive ZIP Code Heat Map**
   - Color-coded by spike severity
   - Click to drill down to ZIP-level detail
   - Toggle layers: incidents, naloxone usage, forecasts

3. **Time Series Chart**
   - 60-day historical trend line
   - Spike threshold bands (1 SD, 2 SD)
   - Annotations for major interventions

4. **Recommendation Panel**
   - Prioritized action list (top 5)
   - "Mark as Completed" buttons
   - Notes field for tracking outcomes

#### FR-6.2: ZIP Code Detail View
- 90-day incident history (chart)
- Demographic context (optional, if available)
- Recent interventions log
- Partner contact list
- Export ZIP-level report button

#### FR-6.3: Alerts & Notifications
- In-dashboard banner alerts for new spikes
- Alert history log (last 30 days)
- Email notification settings (optional, user preference)

---

## Non-Functional Requirements

### NFR-1: Performance
- Dashboard load time: < 3 seconds
- Data upload processing: < 30 seconds for 10,000 records
- Spike detection refresh: Every 6 hours (or on-demand manual refresh)

### NFR-2: Security & Privacy
- **Authentication:** Firebase Authentication (Email/password with optional 2FA, Google Sign-In)
- **Authorization:** Firebase Security Rules for role-based access control (Admin, Analyst, Viewer)
- **Data Privacy:** 
  - No personally identifiable information (PII) stored
  - All data aggregated at ZIP code level or higher
  - Compliant with public health data sharing regulations
  - Firebase complies with HIPAA requirements when Business Associate Agreement (BAA) is signed
- **Encryption:** TLS 1.3 for data in transit, AES-256 for data at rest (Firebase default)
- **API Security:** Gemini API calls authenticated with service account credentials, never exposed to client

### NFR-3: Reliability
- **Uptime target:** 99.5% (excluding planned maintenance)
- **Data backup:** Daily automated backups, 90-day retention
- **Disaster recovery:** RTO < 4 hours, RPO < 24 hours

### NFR-4: Usability
- **Accessibility:** WCAG 2.1 AA compliance
- **Browser support:** Chrome, Firefox, Safari, Edge (last 2 versions)
- **Mobile responsiveness:** Read-only dashboard view on tablets (iPad)
- **Training requirement:** < 2 hours for new users

### NFR-5: Scalability
- Support for 1-5 concurrent users (MVP)
- Database capacity: 1M+ incident records
- API rate limits: N/A (manual upload for MVP)

### NFR-6: Explainability & Transparency
- All spike detection thresholds visible to users
- Algorithm documentation accessible in Help section
- Ability to export raw data and calculations for audit

---

## Technical Architecture (High-Level)

### Technology Stack
- **Frontend:** React + Tailwind CSS
- **Backend:** Firebase Cloud Functions (Node.js/Python)
- **Database:** Firebase Firestore (NoSQL) with GeoPoint support for geospatial queries
- **AI/ML Engine:** Google Gemini API (via Vertex AI or direct API)
- **Analytics Processing:** Cloud Functions with statistical libraries
- **Visualization:** Recharts or D3.js
- **Hosting:** Firebase Hosting (static site with CDN)
- **Authentication:** Firebase Authentication
- **File Storage:** Firebase Cloud Storage (for CSV uploads)

### Data Flow
1. User uploads CSV → Firebase Cloud Storage → Cloud Function validates → Firestore storage
2. Scheduled Cloud Function (every 6 hours via Cloud Scheduler) runs spike detection → stores results in Firestore
3. User accesses dashboard → Firebase SDK fetches latest analytics → Frontend renders
4. User requests recommendations → Gemini API processes context + historical data → returns ranked actions
5. User generates report → Cloud Function assembles content → Exports PDF/DOCX

### AI/ML Components
- **Spike Detection:** Rule-based statistical thresholds (Cloud Functions)
- **Forecasting:** Time-series analysis with Gemini API for pattern recognition and 3-7 day predictions
- **Recommendation Ranking:** Gemini-powered analysis combining:
  - Spike severity score (40%)
  - Historical effectiveness (30%)
  - Resource availability (20%)
  - Geographic proximity (10%)
- **Communication Generation:** Gemini API generates situational updates, partner alerts, and executive summaries from structured data

---

## User Stories & Acceptance Criteria

### Epic 1: Data Management
**US-1.1:** As a response coordinator, I want to upload my weekly ODMAP export so I can see updated trends.
- **AC:** Upload succeeds for valid CSV/XLSX, error message shown for invalid formats

**US-1.2:** As an analyst, I want to see which ZIP codes have missing data so I can follow up with data sources.
- **AC:** Data quality dashboard shows completeness % per ZIP code

### Epic 2: Spike Detection
**US-2.1:** As a coordinator, I want to be notified when a spike is detected so I can respond immediately.
- **AC:** Dashboard banner displays new spike alerts within 1 hour of detection

**US-2.2:** As an epidemiologist, I want to understand why a spike was flagged so I can validate the alert.
- **AC:** Spike detail view shows: baseline, current rate, SD calculation, contributing factors

### Epic 3: Forecasting
**US-3.1:** As a coordinator, I want to see which ZIPs are at risk in the next 3 days so I can pre-position resources.
- **AC:** Forecast panel shows risk probability (Low/Med/High) for each ZIP with 70%+ accuracy

### Epic 4: Recommendations
**US-4.1:** As a coordinator, I want prioritized action recommendations so I don't have to manually analyze every ZIP.
- **AC:** Recommendation list ranks actions by priority score, includes rationale

**US-4.2:** As a program manager, I want to track which recommendations were implemented so I can measure effectiveness.
- **AC:** "Mark as Completed" button logs action with timestamp and optional notes

### Epic 5: Communication
**US-5.1:** As a coordinator, I want to generate a weekly situational report so I can brief county leadership.
- **AC:** One-click report export includes key metrics, charts, and narrative summary

**US-5.2:** As an outreach lead, I want pre-written partner alerts so I can notify organizations quickly.
- **AC:** Email template generator produces customized messages for each partner type

---

## Launch Plan

### Phase 1: Development (Weeks 1-8)
- **Weeks 1-2:** Firebase project setup, Firestore schema design, data pipeline with Cloud Functions
- **Weeks 3-4:** Spike detection algorithm implementation with Cloud Functions, Gemini API integration for forecasting
- **Weeks 5-6:** Dashboard UI development (React), Firebase Authentication setup
- **Weeks 7-8:** Gemini-powered recommendation engine and communication generation tools
- **Ongoing:** Landing page deployment to Firebase Hosting for pilot recruitment

### Phase 2: Testing (Weeks 9-10)
- **Week 9:** Internal QA testing with simulated data
- **Week 10:** User acceptance testing with pilot county (sandbox environment)

### Phase 3: Pilot Launch (Week 11)
- Deploy to production for single pilot county
- Initial user training (2-hour session)
- Daily check-ins for first week

### Phase 4: Iteration (Weeks 12-16)
- Collect user feedback weekly
- Bi-weekly sprint releases for bug fixes and UX improvements
- Measure success metrics against baselines

---

## Success Metrics & KPIs

### Usage Metrics
- Weekly Active Users (target: 80% of pilot team)
- Average session duration (target: 15+ minutes)
- Feature adoption rate (upload, forecast, recommendations, exports)

### Outcome Metrics
- Time to spike detection (target: < 24 hours)
- Forecast accuracy at 3-day horizon (target: 70%+)
- User-reported time savings (target: 50% reduction in manual reporting)
- User satisfaction score (target: 4.0+ / 5.0)

### Impact Metrics (Qualitative, Post-MVP)
- Stakeholder feedback on decision quality
- Case studies of successful early interventions
- Partner organization feedback on communication quality

---

## Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation Strategy |
|------|--------|------------|---------------------|
| Data quality issues (missing/incomplete uploads) | High | Medium | Implement robust validation, provide data quality dashboard, user training |
| False positive spike alerts erode trust | High | Medium | Conservative thresholds for MVP, allow users to adjust sensitivity, transparent methodology |
| Low user adoption due to change management | High | Medium | Co-design with pilot users, hands-on training, dedicated support during launch |
| Regulatory concerns about data sharing | Medium | Low | Aggregate data only, legal review of data use, clear privacy documentation |
| Technical performance issues with large datasets | Medium | Low | Database optimization, pagination, caching strategies |

---

## Open Questions & Decisions Needed

1. **Pilot County Selection:** Which county will participate in MVP testing?
2. **Data Upload Frequency:** Weekly, daily, or ad-hoc uploads?
3. **User Roles:** Do we need multiple permission levels for MVP, or single admin role?
4. **Partner Directory:** Who maintains the community partner contact list?
5. **Historical Data:** How many months of historical data will pilot county provide for baseline calculations?
6. **Budget & Timeline:** What are funding constraints and hard deadlines?

---

## Appendix

### A. ODMAP Data Format Reference
Example CSV structure for simulated data:
```csv
date_time,zip_code,naloxone_administered,naloxone_doses,outcome
2025-11-15 14:32:00,46619,TRUE,2,Non-Fatal
2025-11-15 16:45:00,46614,TRUE,1,Non-Fatal
2025-11-15 18:10:00,46619,FALSE,0,Fatal
```

### B. Glossary
- **Spike:** A statistically significant increase in overdose incidents compared to historical baseline
- **Leading Indicator:** A metric that tends to change before overdoses increase (e.g., naloxone usage rate)
- **Mobile Harm Reduction Team:** Community-based outreach workers who distribute naloxone and connect people to services
- **ODMAP:** Overdose Detection Mapping Application Program, a national database for near real-time overdose tracking

### C. Reference Documents
- ODMAP User Guide: [Link TBD]
- CDC Overdose Response Guidelines: [Link TBD]
- Pilot County MOU Template: [Link TBD]

---

**Document Approval**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | [TBD] | | |
| Technical Lead | [TBD] | | |
| Pilot County Stakeholder | [TBD] | | |

---

**End of Document**
# Browser Threat Simulator (browser-threat-sim)

AI-driven phishing simulation extension for security awareness training.

## Overview

Browser Threat Simulator is a Chrome extension that generates realistic, contextual phishing simulations to train users in recognizing and responding to cyber threats. It integrates with a CISO dashboard for comprehensive security training management.

## Features

- **AI-Powered Simulations**: Context-aware phishing simulations based on user activity
- **Multi-Platform Support**: GitHub, LinkedIn, Gmail content analysis
- **ML-Based Detection**: TensorFlow.js model for credential theft detection
- **CISO Dashboard**: Real-time metrics, campaign management, and reporting
- **Red Team Mode**: Advanced attack scenarios for security testing
- **Privacy First**: No real credentials are captured or transmitted

## Project Structure

```
browser-threat-sim/
├── manifest.json          # Chrome extension manifest v3
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── webpack.config.js      # Build configuration
├── src/
│   ├── content/           # Content scripts
│   │   ├── github.ts      # GitHub context reader
│   │   ├── linkedin.ts    # LinkedIn context reader
│   │   ├── gmail.ts       # Gmail context reader
│   │   ├── injector.ts    # Phishing simulation injector
│   │   └── detector.ts    # Credential entry detector
│   ├── background/        # Service worker
│   │   ├── service-worker.ts    # Main service worker
│   │   ├── api-client.ts        # Dashboard API client
│   │   ├── simulation-engine.ts # Simulation generator
│   │   └── ml-model.ts          # TensorFlow.js ML model
│   ├── popup/             # Extension popup UI
│   │   ├── Popup.tsx      # Main popup component
│   │   ├── Status.tsx     # Status display
│   │   ├── Controls.tsx   # Enable/disable controls
│   │   └── Stats.tsx      # User statistics
│   ├── ai/                # AI/ML modules
│   │   ├── context-analyzer.ts   # Context analysis
│   │   ├── phishing-generator.ts # Content generation
│   │   └── credential-detector.ts # Credential detection
│   └── shared/            # Shared utilities
│       ├── types.ts       # TypeScript interfaces
│       ├── constants.ts   # Constants
│       └── storage.ts     # Chrome storage wrapper
├── dashboard/             # CISO Dashboard (Next.js)
│   ├── pages/             # Dashboard pages
│   │   ├── index.tsx      # Overview
│   │   ├── campaigns.tsx  # Campaign manager
│   │   ├── users.tsx      # User stats
│   │   ├── reports.tsx    # Reports
│   │   ├── redteam.tsx    # Red team
│   │   └── settings.tsx   # Settings
│   └── pages/api/         # API routes
├── dist/                  # Build output
└── assets/                # Extension assets
```

## Installation

### Chrome Extension

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build the extension**:
   ```bash
   npm run build
   ```

3. **Load in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

4. **Configure the extension**:
   - Click the extension icon
   - Set your dashboard API endpoint and key
   - Enable simulations

### CISO Dashboard

1. **Navigate to dashboard**:
   ```bash
   cd dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open dashboard**:
   - Navigate to `http://localhost:3000`

## CISO Dashboard Setup

### Configuration

1. Access the Settings page
2. Configure API endpoint (default: `http://localhost:3000`)
3. Generate and set API key
4. Set organization ID

### Creating Campaigns

1. Go to Campaigns page
2. Click "New Campaign"
3. Configure:
   - Campaign name and description
   - Target platforms (GitHub, LinkedIn, Gmail)
   - Frequency (once, daily, weekly, continuous)
4. Activate campaign

### Monitoring Users

- View user statistics on the Users page
- Track detection rates, risk scores, and progress
- Identify high-risk users requiring additional training

### Generating Reports

1. Go to Reports page
2. Select report type (organization, campaign, user)
3. Choose date range
4. Generate and export as PDF or CSV

## Red Team API

### Authentication

```
X-API-Key: your-api-key
X-Organization-ID: your-org-id
```

### Trigger Simulation

```bash
curl -X POST http://localhost:3000/api/redteam/simulate \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "targetUsers": ["user-1", "user-2"],
    "type": "credential_harvest",
    "customPayload": "Urgent: Security update required",
    "difficulty": "expert"
  }'
```

### Create Custom Scenario

```bash
curl -X POST http://localhost:3000/api/redteam \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Custom BEC Attack",
    "description": "Impersonate CFO requesting wire transfer",
    "attackVector": "Business Email Compromise",
    "targetUsers": ["finance-1", "finance-2"],
    "successCriteria": ["User reports email", "User verifies via phone"]
  }'
```

## Training Workflow

### 1. User Onboarding
- Install extension on user browsers
- Configure API connection
- Set initial difficulty level

### 2. Baseline Assessment
- Run initial simulations
- Measure detection rates
- Calculate risk scores

### 3. Progressive Training
- Adjust difficulty based on performance
- Provide feedback on failures
- Celebrate successful detections

### 4. Reporting & Analysis
- Review aggregate statistics
- Identify training gaps
- Generate compliance reports

### 5. Continuous Improvement
- Update simulation templates
- Add new attack vectors
- Refine ML models

## Metrics Explained

- **Detection Rate**: Percentage of simulations correctly identified
- **Risk Score**: 0-100 score based on user behavior (lower is better)
- **Time-to-Detection**: Average time to identify a simulation (shorter is better)
- **Consecutive Successes**: Streak of correct identifications
- **Difficulty Level**: Easy → Medium → Hard → Expert progression

## Security Notes

⚠️ **Important**:
- This tool is for authorized security training only
- Never use on users without explicit consent
- No real credentials are ever captured or transmitted
- All simulations are clearly identifiable upon close inspection

## Development

### Build Commands

```bash
# Build extension for production
npm run build

# Build for development with watch
npm run watch

# Type check
npm run type-check

# Run dashboard
npm run dashboard:dev
```

### Adding New Platforms

1. Create content script in `src/content/{platform}.ts`
2. Add to `manifest.json` content_scripts
3. Implement platform-specific context extraction
4. Add templates to `phishing-generator.ts`

### Customizing Simulations

Edit `src/ai/phishing-generator.ts` to modify:
- Email templates
- Urgency levels
- Visual styling
- Success criteria

## License

MIT License - See LICENSE file for details

## Support

For issues and feature requests, please contact your security team or open an issue in the project repository.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **client-side trading journal web application** called "Trading Platform Pro" that helps traders track trades, analyze performance, manage psychology, and maintain trading notes. The application is built with vanilla JavaScript, HTML, and CSS with no backend server or build process required.

## Running the Application

- **No build process**: Open `index.html` directly in a web browser
- **No dependencies**: All code is vanilla JavaScript (ES6+), no npm packages or bundlers
- **No test framework**: Manual testing only via browser
- **Local storage**: All data persists in browser localStorage
- **External dependencies**: Chart.js (loaded via CDN in HTML)

### Script Load Order (Critical)

JavaScript files must load in this exact order (defined in index.html):
1. `config.js` - Global state and translations (must load first)
2. `utils.js` - Utility functions used by other modules
3. `market-data.js` - Alpha Vantage API integration for market data
4. `trading.js` - Trade calculations and management
5. `analytics.js` - Charts and statistics
6. `principles.js` - Trading principles tracking
7. `psychology.js` - Psychology tracking
8. `calendar.js` - Calendar view rendering
9. `notes.js` - Notes management
10. `main.js` - Initialization and page navigation (must load last)

## Architecture

### File Structure

```
├── index.html          # Single-page application with all pages/modals
├── css/
│   └── styles.css      # All application styles
└── js/
    ├── config.js       # Global state, variables, and translations
    ├── main.js         # Page navigation, initialization, form handlers
    ├── trading.js      # Trade entry, P&L calculation, time tracking
    ├── utils.js        # Date/time utilities, formatting, storage helpers
    ├── analytics.js    # Performance statistics and chart rendering
    ├── calendar.js     # Calendar view and date range selection
    ├── notes.js        # Trading notes management
    ├── psychology.js   # Trading psychology tracking and analysis
    ├── principles.js   # Trading principles and rules tracking
    └── market-data.js  # Alpha Vantage API integration for real-time quotes
```

### Core Architecture Patterns

**Single-Page Application (SPA)**
- All pages are divs with class `page` in index.html
- Navigation via `showPage(pageId)` in main.js toggles active page
- No routing library - uses simple show/hide CSS classes

**State Management**
- All global state is declared in `config.js`
- Key state variables:
  - `trades` - array of all trade objects
  - `notes` - array of note objects
  - `psychologyData` - object mapping dates to psychology data
  - `dailyFees` - object mapping dates to fee amounts
  - `currentTradingDate` - currently selected date (YYYY-MM-DD format)
  - Date range filters for each section (dashboard, analytics, trades list)

**Data Persistence**
- All data stored in browser localStorage with keys:
  - `tradingPlatformTrades`
  - `tradingPlatformNotes`
  - `tradingPlatformPsychologyData`
  - `tradingPlatformPrinciplesData`
  - `tradingPlatformDailyFees`
  - `tradingPlatformLanguage`
  - Market data cache (stored temporarily)
- Export/import feature uses JSON format

**Localization**
- Bilingual: English and Korean
- Translation object in `config.js`
- `updateLanguage()` function replaces text using `data-lang` attributes
- Current language stored in `currentLanguage` variable

### Key Components

**Dashboard (main.js, trading.js)**
- Two modes: Trading Record and Position Calculator
- Trading Record: displays performance stats, trade entry form, and trade history table
- Position Calculator: Kelly Criterion and Risk Management calculators
- Date navigation: previous/next day buttons, date picker modal
- Date range filtering for stats

**Calendar View (calendar.js)**
- Displays monthly calendar with P&L color coding per day
- Annual overview showing 12 months with weekly P&L summary
- Click handling: single day details, week details, month details
- Date range selection via click-and-drag

**Analytics (analytics.js)**
- Two sections: Detail (statistics cards) and Charts (visualizations)
- Detailed performance metrics: P&L, win/loss stats, time analysis, streaks, symbol performance, risk management
- Chart types: cumulative P&L, equity curve, drawdown, symbol performance, heatmaps
- Uses Chart.js library for all visualizations
- Date range filtering

**Psychology (psychology.js)**
- Daily psychology data input: sleep, caffeine, energy, mood, confidence, stress, focus
- Time tracking: planned vs actual start times
- Financial pressure tracking: account balance, daily target, max loss limit
- Metrics dashboard with calculated scores
- Bias analysis: overconfidence, loss aversion, anchoring
- Pattern insights and correlation analysis

**Notes (notes.js)**
- Three categories: Daily Review, Strategy, General
- Rich text editing with formatting toolbar
- Date-based organization
- Expandable preview (show more/less)

**Trade List (main.js, trading.js)**
- Complete list of all trades with date range filtering
- Bulk selection and deletion
- Edit modal for individual trades

## Data Model

### Trade Object
```javascript
{
  id: timestamp,
  date: "YYYY-MM-DD",
  symbol: "AAPL",
  shares: 100,
  buyPrice: 150.50,
  sellPrice: 152.00,
  pnl: 150.00,
  returnPct: 1.00,
  amount: 15050.00,
  entryTime: "09:30",
  exitTime: "10:45",
  holdingMinutes: 75
}
```

### Note Object
```javascript
{
  id: timestamp,
  date: "YYYY-MM-DD",
  title: "Note title",
  content: "Note content with HTML formatting",
  category: "daily" | "strategy" | "general",
  color: "#e4e4e7",
  font: "'Inter', sans-serif"
}
```

### Psychology Data Object
```javascript
{
  date: "YYYY-MM-DD",
  sleepHours: 7,
  sleepQuality: 4,
  caffeineIntake: 100,
  energyLevel: 4,
  plannedStartTime: "09:00",
  actualStartTime: "09:15",
  marketDelay: 15,
  tradingEnvironment: "home",
  accountBalance: 10000,
  pressureLevel: 2,
  dailyTarget: 200,
  maxDailyLoss: 100,
  preMood: 4,
  confidence: 4,
  stress: 2,
  focus: 4
}
```

## Development Guidelines

### Adding New Features

1. **New page**: Add page div in index.html, nav button, update `showPage()` logic
2. **New global state**: Declare in config.js, add to export if using modules
3. **New localStorage data**: Create save/load functions in utils.js, add to export/import in main.js
4. **New translations**: Add to both `en` and `ko` objects in config.js
5. **New chart**: Create render function in analytics.js, handle Chart.js instance lifecycle

### Date Handling

- Always use `formatTradingDate(date)` to convert Date objects to "YYYY-MM-DD" strings
- `currentTradingDate` is a string in "YYYY-MM-DD" format
- When creating Date objects from `currentTradingDate`, append 'T12:00:00' to avoid timezone issues
- All trade dates stored as "YYYY-MM-DD" strings for easy comparison and filtering

### Chart Management

- Chart instances stored in `basicCharts` and `advancedCharts` objects
- Always destroy existing chart before creating new one: `if (chart) chart.destroy()`
- Charts created in analytics.js using Chart.js library
- Psychology chart is window-level: `window.psychologyChart`

### Trade Calculations

- P&L calculation: `(sellPrice - buyPrice) * shares`
- Return %: `((sellPrice - buyPrice) / buyPrice) * 100`
- Amount: `buyPrice * shares`
- Holding time: difference in minutes between entry and exit times
- Auto-fill times: entry time set when buy price entered, exit time when sell price entered (if not in manual edit mode)

### Filtering Pattern

Each section has its own date range variables:
- Dashboard: `dashboardStartDate`, `dashboardEndDate`
- Analytics: `analyticsStartDate`, `analyticsEndDate`
- Trades List: `tradesStartDate`, `tradesEndDate`

Filter trades using: `trades.filter(t => t.date >= startDate && t.date <= endDate)`

### Modal Pattern

All modals follow same structure:
- Full-screen overlay with flex centering
- `display: 'flex'` to show, `display: 'none'` to hide
- Click outside modal to close (event.target === modal element)
- Example modals: datePickerModal, editTradeModal, monthDetailsModal, weekDetailsModal

## Common Tasks

### Updating Statistics
Call `updateStats()` after any trade data changes. This function:
- Filters trades by current date range
- Calculates all performance metrics
- Updates stat cards on dashboard
- Recalculates win rate, total P&L, trade counts, etc.

### Updating Trade Tables
Call `updateTradesTable(filteredTrades, tableBodyId)` with:
- Filtered trade array
- Target tbody element id ('tradesTableBody' or 'allTradesTableBody')

### Saving Data
- Trades: `saveTrades()` writes to localStorage
- Notes: `saveNotes()` writes to localStorage
- Psychology: `localStorage.setItem('tradingPlatformPsychologyData', JSON.stringify(psychologyData))` saves to localStorage
- Daily fees: stored in `dailyFees` object, saved inline when changed

### Language Updates
- Change `currentLanguage` variable ('en' or 'ko')
- Call `updateLanguage()` to update all text with `data-lang` attributes
- Refresh all pages/components to apply translations

## Known Patterns & Conventions

- Function names are camelCase
- Global variables declared at top of config.js
- All functions are globally scoped - no modules or namespacing
- Event listeners attached in DOMContentLoaded in main.js
- Korean comments in code (original developer)
- Inline onclick handlers in HTML (not addEventListener pattern)
- No ES modules - all scripts loaded globally in order
- Colors: green (#10b981) for profit, red (#ef4444) for loss, neutral (#64748b) for info
- Date inputs use HTML5 `<input type="date">` which returns "YYYY-MM-DD" format
- Time inputs use HTML5 `<input type="time">` which returns "HH:MM" format

## Initialization Flow

On page load (DOMContentLoaded in main.js):
1. Load all data from localStorage
2. Set `currentTradingDate` to today (formatted as "YYYY-MM-DD")
3. Initialize date range filters to last 7 days
4. Render initial dashboard view
5. Update statistics and tables
6. Attach global event listeners

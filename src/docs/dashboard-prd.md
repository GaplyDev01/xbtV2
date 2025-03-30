# Dashboard PRD: Personalized Crypto Dashboard with Chat-Based Onboarding

## 1. Overview

The Dashboard is the central hub of the TradesXBT platform, providing users with a customizable interface to monitor cryptocurrency markets, track portfolios, analyze trends, and receive alerts. The dashboard features an implemented chat-based onboarding process that guides users through personalization options and adapts the dashboard to their specific needs and preferences.

## 2. User Journey

### 2.1 First-Time User Experience (Implemented)
1. User logs in/signs up and is directed to dashboard
2. The OnboardingChat component appears with welcome message:
   > "Welcome to TradesXBT! Let's set up your dashboard to match your crypto strategy. Would you prefer a Trading, Investing, or Research focused dashboard?"
3. Based on selection, chat asks follow-up questions about:
   - Specific tokens of interest (BTC, ETH, SOL, etc.)
   - Preferred data visualizations (charts, tables, stats)
   - Color themes with ThemePreview visual selector
4. Dashboard is dynamically generated based on user responses via DashboardContext
5. OnboardingManager handles the flow and ensures a smooth transition to the dashboard

### 2.2 Return User Experience
1. User logs in and sees their customized dashboard
2. Layout, preferences, and token selections are preserved
3. Data automatically refreshes with latest market information
4. Recent activity is highlighted since last visit

## 3. Dashboard Components

### 3.1 Implemented Core Components

#### Market Overview Card ✅
- **Implementation**: `/dashboard/cards/market/MarketOverview.tsx`
- **Purpose**: Provide top-level market insights
- **Content**:
  - Market cap, 24h volume, BTC dominance
  - Top gainers and losers with percentage changes
  - Market sentiment indicator with trend
  - Global market trend visualization
- **Data Source**: CryptoContext with real-time updates
- **Customization**: Time range selector, display options

#### Portfolio Snapshot Card ✅
- **Implementation**: `/dashboard/cards/portfolio/PortfolioSnapshot.tsx`
- **Purpose**: Track portfolio performance at a glance
- **Content**:
  - Total portfolio value with fiat conversion
  - 24h change with visual indicators
  - Asset allocation donut chart
  - Performance timeline with selectable ranges
- **Data Source**: PortfolioContext with real portfolio data
- **Customization**: Chart type, time range, currency display

#### Token Chart Card ✅
- **Implementation**: `/dashboard/cards/market/TokenChart.tsx`
- **Purpose**: Detailed price analysis for selected tokens
- **Content**:
  - Interactive price chart with zooming capability
  - Time range selector (1D, 1W, 1M, 3M, 1Y)
  - Volume visualization below price chart
  - Technical indicator overlays
- **Data Source**: CryptoContext with historical OHLC data
- **Customization**: Chart style, indicators, timeframe

#### News Feed Card ✅
- **Implementation**: `/dashboard/cards/content/NewsFeed.tsx`
- **Purpose**: Latest crypto news and updates
- **Content**:
  - Categorized news from multiple sources
  - Token-specific filtering options
  - Sentiment indicators for each article
  - Timestamp and source attribution
- **Data Source**: News API integration
- **Customization**: Source preferences, refresh rate

#### Watchlist Card ✅
- **Implementation**: `/dashboard/cards/portfolio/Watchlist.tsx`
- **Purpose**: Quick monitoring of selected tokens
- **Content**:
  - Token list with live price updates
  - 24h change with visual indicators
  - Mini sparkline charts for quick trend view
  - Add/remove token functionality
- **Data Source**: CryptoContext with real-time updates
- **Customization**: Column display options, sorting

#### Social Sentiment Card ✅
- **Implementation**: `/dashboard/cards/content/SocialSentiment.tsx`
- **Purpose**: Track social media trends and sentiment
- **Content**:
  - Social sentiment score with trend indicator
  - Mention statistics across platforms
  - Recent relevant social posts
  - User and engagement metrics
- **Data Source**: Social data integration
- **Customization**: Platform selection, timeframe

#### Alerts Card ✅
- **Implementation**: `/dashboard/cards/tools/Alerts.tsx`
- **Purpose**: Manage and view token alerts
- **Content**:
  - Active alerts with toggle controls
  - Create new alert functionality
  - Alert type indicators (price, volume, etc.)
  - Delete alert option
- **Data Source**: AlertContext
- **Customization**: Alert threshold types

#### Developer Activity Card ✅
- **Implementation**: `/dashboard/cards/content/DeveloperActivity.tsx`
- **Purpose**: Track blockchain development progress
- **Content**:
  - Repository statistics (commits, PRs)
  - Contributor metrics
  - Recent development activity list
  - Project status indicators
- **Data Source**: GitHub API integration
- **Customization**: Repository selection, metric focus

### 3.2 Dashboard Layouts

#### Trading Layout
- **Primary Focus**: Real-time trading information
- **Default Cards**:
  - Token Chart (large)
  - Market Overview
  - Watchlist
  - Trading Volume
  - Alerts
  - News (compact)

#### Investing Layout
- **Primary Focus**: Long-term performance and fundamentals
- **Default Cards**:
  - Portfolio Snapshot (large)
  - Token Chart
  - Market Overview
  - News Feed
  - Developer Activity
  - Social Sentiment

#### Research Layout
- **Primary Focus**: In-depth analysis and trends
- **Default Cards**:
  - Social Sentiment (large)
  - Developer Activity
  - News Feed (large)
  - Token Chart
  - Market Overview (compact)
  - Economic Calendar

## 4. Customization Options

### 4.1 Layout Customization
- Drag and drop cards to rearrange
- Resize cards using corner handles
- Add/remove cards from card library
- Save custom layouts with names
- Reset to default layouts

### 4.2 Visual Customization (Implemented)
- **Card Colors**:
  - Default (follows theme) - ✅ Implemented
  - Uniform (all cards same color) - ✅ Implemented
  - Functional (color by card type) - ✅ Implemented
  - Custom (individual card colors) - ✅ Implemented with color picker
- **Theme Options**:
  - Light/Dark mode - ✅ Implemented with system detection
  - Color schemes - ✅ Implemented with ThemePreview component
    - Default, Blue, Green, Purple, Amber, Red options
  - Custom accent color - ✅ Implemented with color selection
- **Data Visualization**:
  - Chart types and styles - ✅ Implemented in TokenChart
  - Data density settings - ✅ Implemented in card settings
  - Animation preferences - 🔄 Partially implemented

### 4.3 Content Customization
- Default token selection
- Data refresh frequency
- Information density (compact vs expanded)
- Card-specific settings

## 5. Technical Requirements

### 5.1 Performance Requirements
- Initial dashboard load < 2 seconds
- Card data refresh < 500ms
- Smooth animations (60fps)
- Responsive across all device sizes
- Offline capabilities for critical data

### 5.2 Data Requirements
- Real-time market data (< 1 minute delay)
- Historical data with multiple timeframes
- Cached data for performance
- Fallback to sample data when API unavailable

### 5.3 Integration Requirements
- Authentication via Supabase Auth
- API integration with CoinGecko
- Social data from Twitter and Reddit APIs
- News aggregation from multiple sources
- GitHub integration for developer metrics

## 6. User Preferences Storage (Implemented)

### 6.1 Stored Preferences
- Selected dashboard layout - ✅ Implemented in DashboardContext
- Card positions and sizes - ✅ Persisted with GridStack layout
- Default token selection - ✅ Stored in OnboardingContext
- Theme and color preferences - ✅ Managed by DashboardPreferenceProvider
- Card-specific settings - ✅ Implemented with per-card settings storage

### 6.2 Implementation Details
- **Storage Mechanism**: LocalStorage with JSON serialization
- **Context Integration**: OnboardingContext and DashboardContext
- **Preference Migration**: Handled for schema changes
- **Defaults**: Sensible fallbacks when preferences not found
- **Sync**: Automatic saving on preference changes
- Update frequency preferences

### 6.2 Storage Implementation
- Primary: User account database (Supabase)
- Backup: localStorage for offline/guest use
- Sync mechanism between devices
- Version control for preference schema updates

## 7. Chat-Based Onboarding Specification

### 7.1 Initial Questions
1. **Dashboard Purpose**
   - "What will you primarily use TradesXBT for?"
   - Options: Trading, Investing, Research, Multiple

2. **Experience Level**
   - "How would you describe your cryptocurrency experience?"
   - Options: Beginner, Intermediate, Advanced

3. **Token Interest**
   - "Which cryptocurrencies are you most interested in?"
   - Free input with suggestions (BTC, ETH, etc.)

### 7.2 Follow-up Questions
1. **For Trading Focus**
   - "Which trading timeframes do you prefer?"
   - "Do you use technical indicators?"
   - "Which exchanges do you primarily use?"

2. **For Investing Focus**
   - "Are you interested in portfolio tracking?"
   - "Which fundamental metrics matter most to you?"
   - "Do you want to track DeFi investments?"

3. **For Research Focus**
   - "Are you interested in social sentiment analysis?"
   - "Do you want to track developer activity?"
   - "Which news sources do you prefer?"

### 7.3 Visual Preferences
1. **Theme Selection**
   - "Choose your preferred visual theme:"
   - Options: Light, Dark, System Default

2. **Color Scheme**
   - "Select a color scheme for your dashboard:"
   - Preview of color options with visual samples

3. **Card Customization**
   - "How would you like to color your dashboard cards?"
   - Options: Theme Default, Uniform, Functional, Custom

## 8. Implementation Requirements

### 8.1 Component Organization
- Refactor UI components into logical structure
- Create unified card component system
- Establish component library for reuse

### 8.2 Data Services
- Centralize API calls in dedicated services
- Implement caching and retry mechanisms
- Create consistent data loading patterns

### 8.3 Onboarding System
- Build interactive chat UI for onboarding
- Create preference mapping system
- Implement dashboard generation based on preferences

## 9. Success Metrics

### 9.1 User Engagement
- Average dashboard session time (target: 15+ minutes)
- Dashboard revisit frequency (target: 3+ times weekly)
- Card interaction rate (target: 5+ interactions per session)

### 9.2 Onboarding Success
- Onboarding completion rate (target: 90%+)
- Time to complete onboarding (target: < 3 minutes)
- Customization satisfaction (survey metric)

### 9.3 Technical Performance
- Dashboard load time (target: < 2 seconds)
- API error rate (target: < 0.5%)
- Cross-device consistency (100% feature parity)

## 10. Future Enhancements

### 10.1 Phase 2 Features
- AI-powered dashboard suggestions
- Advanced alert system with webhooks
- Cross-platform sync via cloud
- Dashboard sharing functionality
- Additional card types (DeFi metrics, NFT tracking)

### 10.2 Phase 3 Features
- Dashboard templates marketplace
- Custom visualization builder
- Advanced technical analysis tools
- Historical backtesting integration
- API access for developers
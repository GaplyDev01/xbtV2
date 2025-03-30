# Dashboard Implementation Plan

## 1. Component Organization

### Current State
- UI components scattered across multiple directories
- Duplicate components (Portfolio/PortfolioSnapshot, Alerts/Alerts copy)
- Mix of real API-connected and mock data components
- No clear separation of concerns between UI, data fetching, and business logic

### Implemented Structure
```
src/
├── components/
│   ├── ui/                      # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── DotPattern.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── ...
│   ├── dashboard/               # Dashboard-specific components
│   │   ├── Dashboard.tsx        # Main dashboard container
│   │   ├── Card.tsx             # Base dashboard card
│   │   ├── cards/               # Card components for dashboard
│   │   │   ├── market/           
│   │   │   │   ├── MarketOverview.tsx
│   │   │   │   ├── TokenChart.tsx
│   │   │   │   └── ...
│   │   │   ├── portfolio/
│   │   │   │   ├── PortfolioSnapshot.tsx
│   │   │   │   ├── Watchlist.tsx
│   │   │   │   └── ...
│   │   │   ├── content/
│   │   │   │   ├── NewsFeed.tsx
│   │   │   │   ├── SocialSentiment.tsx
│   │   │   │   ├── DeveloperActivity.tsx
│   │   │   │   └── ...
│   │   │   ├── tools/
│   │   │   │   ├── Alerts.tsx
│   │   │   │   └── ...
│   │   ├── layouts/             # Dashboard layout components
│   ├── OnboardingChat.tsx       # Chat-based onboarding interface
│   ├── OnboardingManager.tsx    # Controls onboarding flow
│   ├── ThemePreview.tsx         # Theme selection component
│   ├── MainApp.tsx             # Main application component
│   └── ...
├── context/                     # Context providers
│   ├── OnboardingContext.tsx   # Manages onboarding state
│   ├── DashboardContext.tsx    # Manages dashboard state
│   ├── ThemeContext.tsx        # Manages theme preferences
│   └── ...
├── types/                      # TypeScript type definitions
│   ├── onboarding.ts           # Onboarding-related types
│   ├── dashboard.ts            # Dashboard-related types
│   └── ...
└── ...
```

## 2. Dashboard Design

### Core Features
1. **Customizable Grid Layout**
   - Responsive grid system using GridStack.js
   - Draggable and resizable cards
   - Layout persistence in localStorage
   - Default layouts for new users

2. **Card Component System**
   - Unified card component with consistent styling
   - Support for different content types
   - Custom color schemes per card
   - Consistent header with title, actions, and drag handle

3. **Data Integration**
   - Real-time data from CryptoContext
   - Periodic refresh mechanism
   - Loading states and error handling
   - Fallback to mock data when needed

### Dashboard Cards
1. **Market Overview** (Priority: High)
   - Enhanced version of TopMovers component
   - Shows market summary, top gainers/losers
   - 24h volume, market sentiment
   - API-connected with real data

2. **Portfolio Snapshot** (Priority: High)
   - Consolidated version of Portfolio components
   - Total portfolio value, 24h change
   - Asset allocation chart
   - Connect to PortfolioContext for real data

3. **Token Chart** (Priority: High)
   - Price chart for selected token
   - Time range selector (1d, 1w, 1m, 1y)
   - Technical indicators
   - Connected to CryptoContext

4. **News Feed** (Priority: Medium)
   - Current NewsFeed component with token filtering
   - Categorization and sentiment analysis
   - Already connected to news API

5. **Watchlist** (Priority: Medium)
   - Enhanced version of current Watchlist
   - Quick add/remove tokens
   - Sorting options
   - Connect to real data from CryptoContext

6. **Social Sentiment** (Priority: Medium)
   - Based on DiscussionTrends component
   - Show social media sentiment for tokens
   - Twitter/Reddit mentions
   - API-connected with real data

7. **Developer Activity** (Priority: Low)
   - Current DeveloperActivity component
   - GitHub metrics for token projects
   - Already connected to API

8. **Alerts Panel** (Priority: Low)
   - Consolidated version of Alerts components
   - Create/manage price and volume alerts
   - Connect to AlertContext for real data

## 3. Implementation Plan

### Phase 1: Component Reorganization ✅ (Completed)
1. Created new directory structure for dashboard and card components
2. Moved components to appropriate directories following the proposed structure
3. Resolved duplicate Portfolio and Alerts components
4. Updated imports and references throughout the codebase
5. Maintained backward compatibility with existing functionality

### Phase 2: Dashboard Framework ✅ (Completed)
1. Enhanced Dashboard component with GridStack integration
2. Implemented DashboardContext for layout and card state management
3. Created unified Card component system with standardized styling
4. Implemented layout persistence using localStorage
5. Connected Dashboard to OnboardingContext for user preferences

### Phase 3: Card Implementation ✅ (Completed)
1. Implemented priority card components:
   - MarketOverview: Market summary and metrics
   - PortfolioSnapshot: Holdings overview and allocation
   - TokenChart: Price charts with customizable time ranges
   - Watchlist: User's tracked tokens
   - NewsFeed: Latest crypto news
2. Connected cards to respective context providers
3. Added loading states and error handling to all card components
4. Implemented card customization options (colors, settings)

### Phase 4: Onboarding System ✅ (Completed)
1. Implemented chat-based onboarding flow with OnboardingChat component
2. Created ThemePreview component for visual theme selection
3. Developed DashboardPreferenceProvider for user settings management
4. Added user preference persistence with localStorage
5. Integrated onboarding with dashboard customization

### Phase 5: Advanced Features 🔄 (In Progress)
1. Implemented card color customization
2. Added card content type selection
3. Implemented additional card components:
   - SocialSentiment: Social media sentiment analysis
   - DeveloperActivity: GitHub metrics for token projects
   - Alerts: Price and activity alert management
4. Added card-specific settings persistence

### Phase 6: Testing and Optimization 🔄 (Planned)
1. Performance testing and optimization
2. Cross-browser compatibility testing
3. Responsive design verification
4. User testing and feedback collection

## 4. Technical Specifications

### Dashboard Component
```typescript
interface DashboardProps {
  initialLayout?: GridStackLayout;
  onLayoutChange?: (layout: GridStackLayout) => void;
  showOnboarding?: boolean;
}
```

### Card Component
```typescript
interface CardProps {
  id: string;
  title: string;
  icon?: ReactNode;
  color?: string;
  contentType: CardContentType;
  gridItem: GridStackItem;
  onResize?: (item: GridStackItem) => void;
  onMove?: (item: GridStackItem) => void;
  settings?: Record<string, any>;
}
```

### DashboardContext
```typescript
interface DashboardContextProps {
  layout: GridStackLayout;
  updateLayout: (layout: GridStackLayout) => void;
  cards: CardConfig[];
  addCard: (card: CardConfig) => void;
  removeCard: (cardId: string) => void;
  updateCard: (cardId: string, updates: Partial<CardConfig>) => void;
  cardSettings: Record<string, CardSettings>;
  updateCardSettings: (cardId: string, settings: CardSettings) => void;
  selectedToken: string | null;
  setSelectedToken: (token: string | null) => void;
}
```

## 5. Dashboard Layout

### Default Layout
```typescript
const defaultLayout: GridStackLayout = [
  { id: 'market-overview', x: 0, y: 0, w: 6, h: 4, contentType: 'market-overview' },
  { id: 'portfolio-snapshot', x: 6, y: 0, w: 6, h: 4, contentType: 'portfolio' },
  { id: 'token-chart', x: 0, y: 4, w: 8, h: 6, contentType: 'token-chart' },
  { id: 'watchlist', x: 8, y: 4, w: 4, h: 6, contentType: 'watchlist' },
  { id: 'news-feed', x: 0, y: 10, w: 6, h: 5, contentType: 'news' },
  { id: 'social-sentiment', x: 6, y: 10, w: 6, h: 5, contentType: 'social' }
]
```

### Layout Presets
1. **Trader Layout**
   - Focus on price charts and market data
   - Multiple token charts
   - Order book and depth charts
   - Technical indicators

2. **Investor Layout**
   - Focus on portfolio and fundamentals
   - Asset allocation
   - Long-term price charts
   - News and developer activity

3. **Research Layout**
   - Focus on analysis and social data
   - Developer metrics
   - Social sentiment
   - News and events
   - Detailed token information

## 6. Data Flow

1. **Authentication Flow**
   - User logs in via AuthContext
   - OnboardingManager checks if user has completed onboarding
   - If not, OnboardingChat is displayed
   - User completes onboarding and preferences are saved
   - Dashboard is loaded with user preferences

2. **Dashboard Initialization**
   - Dashboard component loads user layout from localStorage
   - DashboardContext provides layout and card settings
   - GridStackWrapper renders the grid with cards
   - Each card connects to appropriate data provider
   - Cards load data and render content

3. **User Interaction**
   - User can drag and resize cards
   - Layout changes are saved to localStorage
   - User can customize card settings
   - Card color changes are applied through ThemeContext
   - Content type changes update card display

## 7. API Integration

### CoinGecko API
- Market data for tokens
- Historical price data
- OHLC data for charts
- Token metadata

### News API
- Cryptocurrency news articles
- Filtering by token/category

### Social Data API
- Twitter mentions and sentiment
- Reddit discussions
- Overall social sentiment scores

### GitHub API
- Repository metrics
- Commit activity
- Developer contributors

## 8. Enhancement Opportunities

1. **Improve Card Components**
   - Add more visualization options
   - Enhance interactivity
   - Add export/share functionality

2. **Data Integration**
   - Connect mock components to real APIs
   - Add more data sources
   - Implement caching for performance

3. **User Experience**
   - Add card suggestions based on usage
   - Implement card search/filter
   - Add keyboard shortcuts

4. **Performance**
   - Optimize data fetching with SWR/React Query
   - Implement virtualization for large datasets
   - Add pagination for news/feeds

## 9. Migration Strategy

1. **Step 1: File Structure**
   - Create new directories
   - Move components without changing implementation
   - Update import paths

2. **Step 2: Component Enhancement**
   - Update one component at a time
   - Ensure backward compatibility
   - Add tests for each component

3. **Step 3: Integration**
   - Connect dashboard to onboarding system
   - Implement new layout system
   - Connect cards to real data

4. **Step 4: Rollout**
   - Feature flag for new dashboard
   - A/B testing
   - Gradual rollout to users
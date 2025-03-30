# CryptoInsights Platform

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-0.1.0-green.svg)

A comprehensive dashboard platform for cryptocurrency analysis, tracking, and insights. Built with React, TypeScript, and integrated with multiple data sources to provide real-time market data, social sentiment analysis, and portfolio management.

## ✨ Features

- **Real-time Market Data** - Track prices, volume, and market movements
- **Social Sentiment Analysis** - Monitor community sentiment around tokens
- **Portfolio Management** - Track and analyze your crypto holdings
- **Developer Activity** - See which projects have active development
- **News Aggregation** - Stay informed with the latest crypto news
- **Technical Indicators** - Set alerts based on technical signals
- **Customizable Dashboard** - Arrange and select the widgets that matter to you
- **Dark/Light Mode** - UI that adapts to your preference

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/crypto-insights.git
cd crypto-insights

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Charts**: Chart.js, Recharts
- **Authentication**: Supabase Auth
- **Database**: Supabase
- **API Integration**: Axios
- **AI Integration**: OpenAI, Groq, Perplexity

## 📊 Architecture

The application follows a modular architecture with:

- **Components** - Reusable UI elements
- **Context** - Global state management
- **Services** - API integrations and data fetching
- **Utils** - Helper functions and utilities
- **Types** - TypeScript type definitions

## 📝 Development Guidelines

### Code Style

- **TypeScript**: Strict typing with interfaces for component props
- **React Components**: Functional components with hooks
- **State Management**: Context API for global state, useState/useReducer for local state
- **Styling**: Tailwind CSS with theme variables

### Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run typecheck` - Type check with TypeScript
- `npm run preview` - Preview production build

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check [issues page](https://github.com/yourusername/crypto-insights/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
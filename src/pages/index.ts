import LandingPage from './LandingPage';
import SignIn from './auth/SignIn';
import SignUp from './auth/SignUp';
import VerifyEmail from './auth/VerifyEmail';
import ResetPassword from './auth/ResetPassword';
import UpdatePassword from './auth/UpdatePassword';
import Explore from './Explore';
import Analytics from './Analytics';
// Importing Dashboard from components since it doesn't exist in pages
import Dashboard from '../components/Dashboard';
import TradingSignals from './TradingSignals';
import TradingSignalDetails from './TradingSignalDetails';
// Importing Portfolio from components since it doesn't exist in pages
import Portfolio from '../components/Portfolio';
// Importing Settings from components since it doesn't exist in pages
import Settings from '../components/Settings';
// Help component doesn't exist directly, using HelpCommunity
import Help from '../components/HelpCommunity';
import CategoryCoins from './CategoryCoins';

export {
  LandingPage,
  SignIn,
  SignUp,
  VerifyEmail,
  ResetPassword,
  UpdatePassword,
  Explore,
  Analytics,
  Dashboard,
  TradingSignals,
  TradingSignalDetails,
  Portfolio,
  Settings,
  Help,
  CategoryCoins
};
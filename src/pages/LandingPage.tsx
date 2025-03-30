import React from 'react';
import { StarsBackground } from '../components/ui/stars-background';
import { Link, useNavigate } from 'react-router-dom';
import { Terminal, LogIn, UserPlus } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-carbon-dark relative overflow-hidden">
      <StarsBackground 
        starDensity={0.00015}
        allStarsTwinkle={true}
        twinkleProbability={0.7}
        minTwinkleSpeed={0.5}
        maxTwinkleSpeed={1}
      />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-3xl w-full bg-carbon-light/20 backdrop-blur-sm rounded-lg border border-sand-dark/20 p-8 relative">
          
          <div className="flex items-center mb-6">
            <Terminal size={24} className="text-sand-DEFAULT mr-2" />
            <h1 className="text-xl font-mono text-sand-DEFAULT">TradesXBT Terminal</h1>
          </div>
          
          <pre className="font-mono text-sand-DEFAULT whitespace-pre-wrap text-sm">
            <code>{`// I could have made a really cool landing page with Figma
// and just told everyone there was a product coming,
// but I was too busy building the product.

const message = "Sign up and see what's inside";
console.log(message);

// Features:
// - Real-time market data
// - AI-powered analysis
// - Portfolio tracking
// - Social sentiment
// - Developer metrics`}</code>
          </pre>
          
          <div className="mt-8 flex justify-between items-center">
            <div className="text-xs text-sand-dark font-mono">
              Sorry I dont have any 3D animations, only utilities here fren.
            </div>
          </div>
          
          <div className="mt-6 border-t border-sand-dark/20 pt-6">
            <div className="flex justify-center space-x-4">
              <Link 
                to="/auth/sign-in"
                className="px-6 py-2 font-mono text-sm bg-carbon-dark border border-sand-DEFAULT/30 text-sand-DEFAULT hover:bg-sand-DEFAULT/5 hover:border-sand-DEFAULT transition-colors"
              >
                &gt; sign_in.sh
              </Link>
              <Link
                to="/auth/sign-up"
                className="px-6 py-2 font-mono text-sm bg-carbon-dark border border-sand-DEFAULT/30 text-sand-DEFAULT hover:bg-sand-DEFAULT/5 hover:border-sand-DEFAULT transition-colors"
              >
                &gt; register.sh
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
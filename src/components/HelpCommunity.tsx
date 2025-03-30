import React, { useState } from 'react';
import CanonicalLink from './CanonicalLink';
import { Book, HelpCircle, Users, Ticket, Lightbulb, Search, ExternalLink, ChevronRight } from 'lucide-react';

interface HelpCommunityProps {
  className?: string;
}

const HelpCommunity: React.FC<HelpCommunityProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<string>('documentation');

  const tabs = [
    { id: 'documentation', label: 'Documentation', icon: <Book size={18} /> },
    { id: 'tutorials', label: 'Tutorials', icon: <HelpCircle size={18} /> },
    { id: 'community', label: 'Community Forum', icon: <Users size={18} /> },
    { id: 'support', label: 'Support', icon: <Ticket size={18} /> },
    { id: 'knowledge', label: 'Knowledge Base', icon: <Lightbulb size={18} /> },
  ];

  return (
    <>
      <CanonicalLink path="/help" />
      <div className="space-y-4">
        <div className="bg-theme-bg bg-opacity-70 backdrop-blur-sm rounded-lg shadow-sm p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-xl font-bold text-theme-text-primary">Help & Community</h2>
              <p className="text-sm text-theme-accent">Get help and connect with other traders</p>
            </div>
          </div>

          <div className="flex flex-wrap border-b border-theme-border mb-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`flex items-center mr-6 py-2 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === tab.id
                    ? 'border-theme-accent text-theme-accent'
                    : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary hover:border-theme-border'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-theme-accent/10 rounded-lg p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-secondary" size={18} />
              <input
                type="text"
                placeholder="Search help articles..."
                className="w-full pl-10 pr-4 py-2 bg-theme-bg border border-theme-border rounded-lg text-theme-text-primary placeholder-theme-text-secondary focus:outline-none focus:ring-2 focus:ring-theme-accent focus:border-theme-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Quick Links */}
            <div className="bg-theme-accent/10 p-4 rounded-lg border border-theme-border">
              <h3 className="text-lg font-medium text-theme-text-primary mb-3">Getting Started</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="flex items-center text-theme-text-secondary hover:text-theme-accent">
                    <ChevronRight size={16} className="mr-1" />
                    Platform Overview
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center text-theme-text-secondary hover:text-theme-accent">
                    <ChevronRight size={16} className="mr-1" />
                    Account Setup
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center text-theme-text-secondary hover:text-theme-accent">
                    <ChevronRight size={16} className="mr-1" />
                    Trading Basics
                  </a>
                </li>
              </ul>
            </div>

            {/* Popular Articles */}
            <div className="bg-theme-accent/10 p-4 rounded-lg border border-theme-border">
              <h3 className="text-lg font-medium text-theme-text-primary mb-3">Popular Articles</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="flex items-center text-theme-text-secondary hover:text-theme-accent">
                    <ChevronRight size={16} className="mr-1" />
                    Understanding Market Analysis
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center text-theme-text-secondary hover:text-theme-accent">
                    <ChevronRight size={16} className="mr-1" />
                    Portfolio Management Tips
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center text-theme-text-secondary hover:text-theme-accent">
                    <ChevronRight size={16} className="mr-1" />
                    Technical Indicators Guide
                  </a>
                </li>
              </ul>
            </div>

            {/* Community Highlights */}
            <div className="bg-theme-accent/10 p-4 rounded-lg border border-theme-border">
              <h3 className="text-lg font-medium text-theme-text-primary mb-3">Community</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="flex items-center text-theme-text-secondary hover:text-theme-accent">
                    <Users size={16} className="mr-2" />
                    Join Discussion Forum
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center text-theme-text-secondary hover:text-theme-accent">
                    <ExternalLink size={16} className="mr-2" />
                    Discord Community
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center text-theme-text-secondary hover:text-theme-accent">
                    <Ticket size={16} className="mr-2" />
                    Submit Support Ticket
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-4 bg-theme-accent/5 rounded-lg border border-theme-border">
            <h3 className="text-lg font-medium text-theme-text-primary mb-2">Need More Help?</h3>
            <p className="text-theme-text-secondary mb-4">
              Our support team is available 24/7 to assist you with any questions or issues.
            </p>
            <button className="bg-theme-accent hover:bg-theme-accent-dark text-theme-bg px-4 py-2 rounded-lg transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HelpCommunity;
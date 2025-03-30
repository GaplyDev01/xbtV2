import React from 'react';
import { ReactNode } from 'react';
import {
  TrendingUp,
  Award,
  Clock,
  Zap,
  LineChart,
  BarChart2,
  Brain,
  Calendar,
  List,
  Bell,
  MessageCircle,
  Briefcase,
  Coins,
  DollarSign,
  Code,
  Users,
  Sparkles
} from 'lucide-react';

// Define the structure for dashboard components
export interface DashboardComponent {
  id: string;
  name: string;
  icon: ReactNode;
  defaultVisible: boolean;
  colSpan?: number;
  rowSpan?: number;
  priority?: number;
}

// Define a preset dashboard layout
export interface DashboardPreset {
  id: string;
  name: string;
  description: string;
  components: string[];
  thumbnail: string;
  layout?: Record<string, any[]>;
}

// Available dashboard components - keeping structure but emptying the list
export const availableComponents: DashboardComponent[] = [];

// Empty standard layout
const standardLayout = {
  lg: [],
  md: [],
  sm: [],
  xs: []
};

// Empty dashboard presets
export const dashboardPresets: DashboardPreset[] = [];

// Get component by ID
export const getComponentById = (id: string): DashboardComponent | undefined => {
  return availableComponents.find(component => component.id === id);
};

// Get preset by ID
export const getPresetById = (id: string): DashboardPreset | undefined => {
  return dashboardPresets.find(preset => preset.id === id);
};

// Default layout for the standard dashboard
export const defaultDashboardLayout: string[] = [];
import React from 'react';
import { DashboardPreset, DashboardComponent } from '../utils/dashboardPresets';
import { X, Check, Layout } from 'lucide-react';

interface DashboardSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (presetId: string) => void;
  onCustomSelection: (componentIds: string[]) => void;
  presets: DashboardPreset[];
  availableComponents: DashboardComponent[];
  selectedComponents: string[];
}

const DashboardSelectionModal: React.FC<DashboardSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
  onCustomSelection,
  presets,
  availableComponents,
  selectedComponents
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-theme-bg/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-theme-bg border border-theme-border rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-theme-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Layout size={24} className="text-theme-accent mr-3" />
              <div>
                <h2 className="text-xl font-bold text-theme-text-primary">Dashboard Layout</h2>
                <p className="text-sm text-theme-text-secondary">Choose a preset or customize your dashboard</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-theme-text-secondary hover:text-theme-text-primary"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {presets.map((preset) => (
              <button
                key={preset.id}
                className="p-4 border border-theme-border rounded-lg hover:border-theme-accent transition-colors text-left"
                onClick={() => onSelectPreset(preset.id)}
              >
                <h3 className="text-lg font-medium text-theme-text-primary mb-1">{preset.name}</h3>
                <p className="text-sm text-theme-text-secondary mb-2">{preset.description}</p>
                <div className="flex flex-wrap gap-1">
                  {preset.components.slice(0, 3).map((componentId) => {
                    const component = availableComponents.find(c => c.id === componentId);
                    return component && (
                      <span
                        key={componentId}
                        className="text-[10px] bg-theme-accent/10 text-theme-accent px-2 py-0.5 rounded-full"
                      >
                        {component.name}
                      </span>
                    );
                  })}
                  {preset.components.length > 3 && (
                    <span className="text-[10px] bg-theme-accent/10 text-theme-accent px-2 py-0.5 rounded-full">
                      +{preset.components.length - 3} more
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="border-t border-theme-border pt-6">
            <h3 className="text-lg font-medium text-theme-text-primary mb-4">Custom Layout</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {availableComponents.map((component) => (
                <button
                  key={component.id}
                  className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                    selectedComponents.includes(component.id)
                      ? 'bg-theme-accent text-theme-bg'
                      : 'bg-theme-accent/10 text-theme-text-primary hover:bg-theme-accent/20'
                  }`}
                  onClick={() => {
                    const newSelection = selectedComponents.includes(component.id)
                      ? selectedComponents.filter(id => id !== component.id)
                      : [...selectedComponents, component.id];
                    onCustomSelection(newSelection);
                  }}
                >
                  <div className="flex items-center">
                    {component.icon}
                    <span className="ml-2 text-xs">{component.name}</span>
                  </div>
                  {selectedComponents.includes(component.id) && (
                    <Check size={14} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-theme-border">
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-theme-border rounded-lg text-theme-text-primary hover:bg-theme-accent/10"
            >
              Cancel
            </button>
            <button
              onClick={() => onCustomSelection(selectedComponents)}
              className="px-4 py-2 text-sm bg-theme-accent rounded-lg text-theme-bg hover:bg-theme-accent-dark"
            >
              Apply Layout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSelectionModal;
import React from 'react';
import { HeartPulse, Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  minHeight?: string;
  variant?: 'card' | 'fullscreen' | 'inline';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading verified healthcare data...',
  minHeight = 'min-h-[280px]',
  variant = 'card',
}) => {
  if (variant === 'inline') {
    return (
      <div className="flex items-center justify-center gap-2 py-4 text-emerald-600 text-xs font-semibold">
        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 ${minHeight} text-slate-500 rounded-3xl bg-white/50 backdrop-blur-sm border border-slate-100 shadow-sm`}
    >
      <div className="relative flex items-center justify-center">
        {/* Soft glowing outer halo */}
        <div className="absolute w-20 h-20 rounded-full bg-emerald-500/10 blur-xl animate-pulse" />
        
        {/* Rotating ring */}
        <div className="w-14 h-14 rounded-full border-2 border-emerald-100 border-t-emerald-600 animate-spin" />
        
        {/* Pulsing Medical Heart */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/30">
            <HeartPulse className="w-5 h-5 text-white animate-pulse" />
          </div>
        </div>
      </div>

      <div className="mt-5 text-center space-y-1">
        <p className="text-sm font-bold text-slate-800">{message}</p>
        <p className="text-[11px] text-slate-400 font-medium">
          Verifying security & clinical synchronization
        </p>
      </div>
    </div>
  );
};

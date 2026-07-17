'use client';

import { MonitorPlay, X } from 'lucide-react';

interface WokwiModalProps {
  url: string;
  onClose: () => void;
}

export default function WokwiModal({ url, onClose }: WokwiModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-zinc-900 border border-zinc-700 w-full max-w-5xl h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
          <h3 className="font-semibold text-white flex items-center">
            <MonitorPlay className="h-5 w-5 mr-2 text-primary-500" />
            Simulasi IoT Wokwi
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 w-full h-full bg-zinc-950">
          <iframe 
            src={url} 
            className="w-full h-full border-none"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ProgressBarProps {
    progress: number;
    label?: string;
    isScanning?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label, isScanning }) => {
    return (
        <div className="w-full">
            <div className="flex justify-between mb-3 items-end">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Status Report</span>
                    <span className="text-sm font-bold text-slate-200 tracking-tight">{label || 'Transferring Data...'}</span>
                </div>
                <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-black text-primary-400 tracking-tighter">{progress}</span>
                    <span className="text-[10px] font-black text-primary-600 uppercase">Percent</span>
                </div>
            </div>
            <div className="w-full bg-slate-950 rounded-2xl h-6 overflow-hidden border border-slate-800 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] p-1 relative">
                <div
                    className={cn(
                        "h-full rounded-xl transition-all duration-500 ease-out relative group overflow-hidden",
                        progress === 100 ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]" : "bg-primary-500 shadow-[0_0_20px_rgba(14,165,233,0.3)]"
                    )}
                    style={{ width: `${progress}%` }}
                >
                    {/* Scanning light effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer pointer-events-none" />

                    {/* Inner texture */}
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)', backgroundSize: '4px 4px' }} />
                </div>

                {/* Background Grid */}
                <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay" style={{ backgroundImage: 'linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '10%' }} />
            </div>

            {progress < 100 && (
                <div className="mt-4 flex items-center justify-between px-1">
                    <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div
                                key={i}
                                className={cn(
                                    "w-1.5 h-1 rounded-full",
                                    (i * 16.6) <= progress ? "bg-primary-500" : "bg-slate-800 animate-pulse",
                                    `delay-[${i * 100}ms]`
                                )}
                            />
                        ))}
                    </div>
                    <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest animate-pulse">Encryption: Active | Uplink: Stable</span>
                </div>
            )}
        </div>
    );
};

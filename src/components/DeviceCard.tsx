import React from 'react';
import Link from 'next/link';
import { Cpu, Zap, Info } from 'lucide-react';

interface DeviceCardProps {
    device: {
        id: string;
        name: string;
        version: string;
        description: string;
        chip: string;
        image?: string;
    };
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ device }) => {
    return (
        <div className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-6 transition-all duration-300 hover:border-primary-500/50 hover:shadow-[0_0_30px_rgba(14,165,233,0.15)] overflow-hidden flex flex-col h-full">
            {/* Background Glow */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary-500/5 blur-3xl rounded-full group-hover:bg-primary-500/10 transition-colors" />

            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center shrink-0">
                    {device.image ? (
                        <img src={device.image} alt={device.name} className="w-full h-full object-cover" />
                    ) : (
                        <Cpu className="w-6 h-6 text-slate-600" />
                    )}
                </div>
                <span className="px-2 py-1 bg-slate-800 text-slate-500 text-[10px] font-bold uppercase rounded border border-slate-700 font-mono">
                    v{device.version}
                </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors tracking-tight">
                {device.name}
            </h3>

            <p className="text-slate-500 text-xs font-medium leading-relaxed mb-6 line-clamp-3">
                {device.description}
            </p>

            <div className="mt-auto">
                <div className="flex items-center space-x-4 mb-6 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                    <div className="flex items-center">
                        <Zap className="w-3 h-3 mr-1.5 text-yellow-500/50" />
                        {device.chip}
                    </div>
                </div>

                <Link
                    href={`/flash/${device.id}`}
                    className="block w-full text-center py-3 bg-slate-800 hover:bg-primary-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-200 active:scale-[0.98] border border-white/5"
                >
                    Initialize Flash
                </Link>
            </div>
        </div>
    );
};

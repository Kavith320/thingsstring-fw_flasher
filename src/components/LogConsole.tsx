import React, { useEffect, useRef } from 'react';
import { Terminal, Shield } from 'lucide-react';

interface LogConsoleProps {
    logs: string[];
}

export const LogConsole: React.FC<LogConsoleProps> = ({ logs }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="flex flex-col h-72 bg-[#020617] border border-slate-800 rounded-3xl overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900/40 border-b border-slate-800/80">
                <div className="flex items-center space-x-3">
                    <div className="flex space-x-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/10 border border-red-500/30" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/10 border border-amber-500/30" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30" />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center">
                        <Shield className="w-3 h-3 mr-2 text-primary-500/50" />
                        System Intelligence
                    </span>
                </div>
                <div className="text-[8px] font-mono text-slate-700 uppercase tracking-widest">
                    TS/X-CORELAYER V2.4
                </div>
            </div>
            <div
                ref={scrollRef}
                className="flex-1 p-6 font-mono text-xs overflow-y-auto scrollbar-hide selection:bg-primary-500/30"
            >
                {logs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-3 opacity-30">
                        <Terminal className="w-8 h-8 stroke-[1]" />
                        <span className="text-[9px] font-black tracking-[0.2em] uppercase">Kernel Idle</span>
                    </div>
                ) : (
                    logs.map((log, i) => (
                        <div key={i} className="flex items-start mb-2 group animate-in slide-in-from-left-2 duration-300">
                            <span className="w-10 text-slate-800 text-[8px] mt-1 select-none font-black opacity-30 group-hover:opacity-100 transition-opacity">
                                {(i + 1).toString().padStart(3, '0')}
                            </span>
                            <span className="text-slate-400 group-hover:text-white transition-colors leading-relaxed break-all">
                                {log}
                            </span>
                        </div>
                    ))
                )}
            </div>
            <div className="px-6 py-2 bg-slate-900/20 border-t border-slate-800/30">
                <div className="flex items-center space-x-2">
                    <div className="w-1 h-1 rounded-full bg-primary-500 animate-pulse" />
                    <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Core Status: Active</span>
                </div>
            </div>
        </div>
    );
};

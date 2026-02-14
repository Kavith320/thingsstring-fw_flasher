'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Trash2, StopCircle, PlayCircle, Download } from 'lucide-react';

interface SerialConsoleProps {
    data: string;
    onClear: () => void;
    onStop?: () => void;
    onStart?: () => void;
    isReading?: boolean;
}

export function SerialConsole({ data, onClear, onStop, onStart, isReading }: SerialConsoleProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [autoScroll, setAutoScroll] = useState(true);

    useEffect(() => {
        if (autoScroll && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [data, autoScroll]);

    const downloadLogs = () => {
        const blob = new Blob([data], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `serial-log-${new Date().getTime()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[400px]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900/50 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                    <div className="flex space-x-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center">
                        <Terminal className="w-3 h-3 mr-2" />
                        Live Serial Link
                    </span>
                    {isReading && (
                        <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[8px] font-black text-emerald-500 uppercase">Live</span>
                        </span>
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setAutoScroll(!autoScroll)}
                        className={`text-[9px] font-black uppercase px-2 py-1 rounded border transition-all ${autoScroll ? 'bg-primary-500/10 border-primary-500 text-primary-500' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                    >
                        Auto-Scroll
                    </button>
                    <button onClick={downloadLogs} className="p-2 text-slate-500 hover:text-white transition-colors" title="Download Logs">
                        <Download className="w-4 h-4" />
                    </button>
                    <button onClick={onClear} className="p-2 text-slate-500 hover:text-red-500 transition-colors" title="Clear Console">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 font-mono text-xs leading-relaxed selection:bg-primary-500/30 scrollbar-hide bg-[#020617]"
            >
                {data ? (
                    <pre className="whitespace-pre-wrap break-all text-slate-300">
                        {data}
                        <span className="inline-block w-2 h-4 bg-primary-500/50 ml-1 animate-pulse align-middle" />
                    </pre>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center space-y-4 text-slate-700 opacity-50">
                        <Terminal className="w-12 h-12 stroke-[1]" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Awaiting Serial Data...</p>
                    </div>
                )}
            </div>

            {/* Footer Control */}
            <div className="px-6 py-3 bg-slate-900/30 border-t border-slate-800/50 flex items-center justify-between">
                <div className="text-[8px] font-black text-slate-700 uppercase tracking-widest">
                    Baud: 115200 (Auto-Detected)
                </div>
                <div className="flex space-x-4">
                    {isReading ? (
                        <button
                            onClick={onStop}
                            className="flex items-center space-x-2 text-[9px] font-black text-red-500 uppercase tracking-widest hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all"
                        >
                            <StopCircle className="w-3.5 h-3.5" />
                            <span>Stop Reader</span>
                        </button>
                    ) : (
                        <button
                            onClick={onStart}
                            className="flex items-center space-x-2 text-[9px] font-black text-emerald-500 uppercase tracking-widest hover:bg-emerald-500/10 px-3 py-1.5 rounded-lg transition-all"
                        >
                            <PlayCircle className="w-3.5 h-3.5" />
                            <span>Start Reader</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

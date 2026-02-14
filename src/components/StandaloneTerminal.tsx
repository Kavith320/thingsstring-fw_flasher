'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Shield, Send, Trash2, Cpu, Activity, Wifi, Zap } from 'lucide-react';
import { ESPFlasher } from '@/lib/flasher';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function StandaloneTerminal() {
    const [logs, setLogs] = useState<string[]>([]);
    const [state, setState] = useState<'idle' | 'connecting' | 'connected' | 'flashing' | 'done' | 'error'>('idle');
    const [input, setInput] = useState('');
    const [baudRate, setBaudRate] = useState(115200);
    const flasherRef = useRef<ESPFlasher | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        flasherRef.current = new ESPFlasher({
            onLog: (msg) => setLogs(prev => [...prev.slice(-199), msg]),
            onProgress: () => { },
            onStateChange: (s) => setState(s),
            onSerialData: (data) => setLogs(prev => [...prev.slice(-199), data.trim()]),
        });

        return () => {
            if (flasherRef.current) flasherRef.current.disconnect();
        };
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const handleConnect = async () => {
        if (!flasherRef.current) return;
        try {
            await flasherRef.current.connect(baudRate, true);
            await flasherRef.current.startReading();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDisconnect = async () => {
        if (flasherRef.current) {
            await flasherRef.current.disconnect();
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input || !flasherRef.current || state !== 'connected') return;

        try {
            await flasherRef.current.sendData(input + '\n');
            setLogs(prev => [...prev, `>> ${input}`]);
            setInput('');
        } catch (err) {
            setLogs(prev => [...prev, `!! Failed to send: ${input}`]);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-widest uppercase flex items-center">
                        <Terminal className="w-8 h-8 mr-4 text-primary-500" />
                        Universal Terminal
                    </h1>
                    <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em] mt-2 font-bold">Standardized Serial Monitoring Interface</p>
                </div>

                <div className="flex items-center space-x-4 bg-slate-900/50 p-2 rounded-2xl border border-slate-800">
                    <select
                        value={baudRate}
                        onChange={(e) => setBaudRate(Number(e.target.value))}
                        className="bg-slate-950 text-white font-mono text-xs px-4 py-2 rounded-xl outline-none border border-slate-800 focus:border-primary-500 transition-colors"
                        disabled={state !== 'idle'}
                    >
                        {[9600, 19200, 38400, 57600, 74880, 115200, 230400, 460800, 921600].map(b => (
                            <option key={b} value={b}>{b} Baud</option>
                        ))}
                    </select>

                    {state === 'idle' ? (
                        <button
                            onClick={handleConnect}
                            className="bg-primary-600 hover:bg-primary-500 text-white font-black uppercase text-[10px] tracking-widest px-8 py-3 rounded-xl transition-all shadow-lg active:scale-95"
                        >
                            Establish Link
                        </button>
                    ) : (
                        <button
                            onClick={handleDisconnect}
                            className="bg-red-500 hover:bg-red-400 text-white font-black uppercase text-[10px] tracking-widest px-8 py-3 rounded-xl transition-all shadow-lg active:scale-95"
                        >
                            Sever Link
                        </button>
                    )}
                </div>
            </div>

            {/* Terminal Main Interface */}
            <div className="flex flex-col h-[600px] bg-[#020617] border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                {/* Subtle Grid Background */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                {/* Console Header */}
                <div className="z-10 flex items-center justify-between px-8 py-5 bg-slate-900/40 border-b border-slate-800/80 backdrop-blur-md">
                    <div className="flex items-center space-x-4">
                        <div className="flex space-x-2">
                            <div className={cn("w-2.5 h-2.5 rounded-full border", state === 'connected' ? "bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-slate-800 border-slate-700")} />
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
                        </div>
                        <div className="h-4 w-px bg-slate-800 mx-2" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
                            <Shield className="w-3.5 h-3.5 mr-2 text-primary-500/50" />
                            TS/X-INFRASTRUCTURE-TERMINAL
                        </span>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                            <Activity className={cn("w-3 h-3 text-emerald-500", state === 'connected' && "animate-pulse")} />
                            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">
                                {state === 'connected' ? 'Port: Active' : 'Port: Null'}
                            </span>
                        </div>
                        <button
                            onClick={() => setLogs([])}
                            className="p-2 text-slate-600 hover:text-white transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Output Area */}
                <div
                    ref={scrollRef}
                    className="flex-1 p-8 font-mono text-[13px] overflow-y-auto scrollbar-hide selection:bg-primary-500/30 z-10"
                >
                    {logs.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20">
                            <Cpu className="w-12 h-12 stroke-[1]" />
                            <p className="text-[10px] font-black tracking-[0.4em] uppercase">Awaiting hardware handshake</p>
                        </div>
                    ) : (
                        logs.map((log, i) => (
                            <div key={i} className="flex items-start mb-1.5 group animate-in slide-in-from-left-2 duration-300">
                                <span className="w-12 text-slate-800 text-[9px] mt-1 select-none font-black opacity-30 group-hover:opacity-100 transition-opacity">
                                    {(i + 1).toString().padStart(4, '0')}
                                </span>
                                <span className={cn(
                                    "leading-relaxed break-all",
                                    log.startsWith('>>') ? "text-primary-400 font-bold" :
                                        log.startsWith('!!') ? "text-red-500" : "text-slate-300"
                                )}>
                                    {log}
                                </span>
                            </div>
                        ))
                    )}
                </div>

                {/* Input Area */}
                <div className="z-10 px-8 py-6 bg-slate-900/40 border-t border-slate-800/80 backdrop-blur-md">
                    <form onSubmit={handleSend} className="flex items-center space-x-4 bg-slate-950 border border-slate-800 rounded-2xl p-2 pl-6 focus-within:border-primary-500/50 transition-all shadow-inner">
                        <div className="text-[10px] font-black text-primary-500/50 uppercase tracking-widest shrink-0">CMD {'>'}</div>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={state !== 'connected'}
                            placeholder={state === 'connected' ? "Enter command to transmit..." : "Connect hardware to initialize uplink..."}
                            className="flex-1 bg-transparent text-white font-mono text-sm outline-none placeholder:text-slate-700 disabled:cursor-not-allowed"
                        />
                        <button
                            type="submit"
                            disabled={state !== 'connected' || !input}
                            className="p-3 bg-primary-600 hover:bg-primary-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition-all active:scale-95 group"
                        >
                            <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-4 flex items-center justify-between px-2">
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                                <Zap className="w-3 h-3 text-amber-500" />
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{baudRate}bps</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Wifi className="w-3 h-3 text-primary-500" />
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Serial-8-N-1</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Uplink Encryption: Null</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ESPFlasher, hexToNumber } from '@/lib/flasher';
import { LogConsole } from '@/components/LogConsole';
import { ProgressBar } from '@/components/ProgressBar';
import { HelpPanel } from '@/components/HelpPanel';
import { SerialConsole } from '@/components/SerialConsole';
import { playSuccessSound, playErrorSound } from '@/lib/sounds';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

import {
    ArrowLeft,
    Settings,
    Power,
    Zap,
    Trash2,
    AlertCircle,
    CheckCircle2,
    RefreshCw,
    Cpu,
    Terminal
} from 'lucide-react';
import Link from 'next/link';

interface Device {
    id: string;
    name: string;
    version: string;
    baud: number;
    description: string;
    files: { path: string; address: string }[];
}

export default function FlashPage() {
    const { id } = useParams();
    const router = useRouter();

    const [device, setDevice] = useState<Device | null>(null);
    const [loading, setLoading] = useState(true);
    const [baudRate, setBaudRate] = useState<number>(460800);
    const [flashMode, setFlashMode] = useState<string>('dio');
    const [flashFreq, setFlashFreq] = useState<string>('40m');
    const [flashSize, setFlashSize] = useState<string>('4mb');
    const [eraseAll, setEraseAll] = useState<boolean>(false);
    const [state, setState] = useState<'idle' | 'connecting' | 'connected' | 'flashing' | 'done' | 'error'>('idle');
    const [logs, setLogs] = useState<string[]>([]);
    const [serialData, setSerialData] = useState<string>('');
    const [isReadingSerial, setIsReadingSerial] = useState(false);
    const [viewMode, setViewMode] = useState<'logs' | 'serial'>('logs');
    const [overallProgress, setOverallProgress] = useState(0);
    const [isSupported, setIsSupported] = useState(true);

    const flasherRef = useRef<ESPFlasher | null>(null);

    // Binary Cache
    const [binaryData, setBinaryData] = useState<{ address: number, data: Uint8Array }[] | null>(null);
    const [isFetchingBinary, setIsFetchingBinary] = useState(false);

    // Initialize Flasher
    useEffect(() => {
        const flasher = new ESPFlasher({
            onLog: (msg) => setLogs(prev => [...prev, msg]),
            onProgress: (step, progress) => setOverallProgress(progress),
            onStateChange: (newState) => {
                setState(newState);
                if (newState === 'done') {
                    setViewMode('serial');
                    playSuccessSound();
                }
                if (newState === 'error') {
                    playErrorSound();
                }
            },
            onSerialData: (data) => {
                setSerialData(prev => (prev + data).slice(-20000));
                setIsReadingSerial(true);
            }
        });

        flasherRef.current = flasher;
        setIsSupported(flasher.isSupported());

        fetch(`/api/devices/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setLogs(prev => [...prev, `Error: ${data.error}`]);
                } else {
                    setDevice(data);
                    setBaudRate(data.baud);
                    fetchBinaries(data);
                }
            })
            .catch(err => {
                setLogs(prev => [...prev, `Error loading device: ${err.message}`]);
            })
            .finally(() => setLoading(false));

        return () => {
            if (flasherRef.current) {
                flasherRef.current.disconnect();
            }
        };
    }, [id]);

    const fetchBinaries = async (deviceData: Device) => {
        setIsFetchingBinary(true);
        try {
            const data = await Promise.all(deviceData.files.map(async (f) => {
                const res = await fetch(f.path);
                if (!res.ok) throw new Error(`Failed to fetch firmware: ${f.path}`);
                const blob = await res.arrayBuffer();
                return {
                    address: hexToNumber(f.address),
                    data: new Uint8Array(blob)
                };
            }));
            setBinaryData(data);
        } catch (err: any) {
            setLogs(prev => [...prev, `Prefetch Error: ${err.message}`]);
        } finally {
            setIsFetchingBinary(false);
        }
    };

    const handleConnect = async () => {
        if (!flasherRef.current) return;
        try {
            setLogs([]);
            await flasherRef.current.connect(baudRate);
        } catch (err) { }
    };

    const handleDisconnect = async () => {
        if (!flasherRef.current) return;
        setIsReadingSerial(false);
        await flasherRef.current.disconnect();
    };

    const handleFlash = async () => {
        if (!flasherRef.current || !device) return;

        try {
            let dataToFlash = binaryData;
            if (!dataToFlash) {
                setState('flashing');
                setLogs(prev => [...prev, "Firmware not ready, fetching now..."]);
                const res = await Promise.all(device.files.map(async (f) => {
                    const r = await fetch(f.path);
                    const blob = await r.arrayBuffer();
                    return { address: hexToNumber(f.address), data: new Uint8Array(blob) };
                }));
                dataToFlash = res;
                setBinaryData(res);
            }

            setOverallProgress(0);
            await flasherRef.current.flash(dataToFlash, baudRate, {
                flashMode,
                flashFreq,
                flashSize,
                eraseAll
            });
        } catch (err: any) {
            setLogs(prev => [...prev, `Process Error: ${err.message}`]);
            setState('error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    if (!device) {
        return (
            <div className="max-w-2xl mx-auto px-6 py-20 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                <h1 className="text-2xl font-bold mb-4">Device Not Found</h1>
                <p className="text-slate-400 mb-8">The device identifier "{id}" does not exist in our catalog.</p>
                <Link href="/" className="px-6 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                    Back to list
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 md:py-12">
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-slate-400 hover:text-white transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Catalog
                </button>
                <div className="flex items-center space-x-3 text-xs font-mono uppercase tracking-widest text-slate-500">
                    <span>Device ID: {device.id}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                    <span>v{device.version}</span>
                </div>
            </div>

            {!isSupported && (
                <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-4 text-red-200">
                    <AlertCircle className="w-6 h-6 shrink-0" />
                    <p className="text-sm">
                        <strong>Web Serial not supported:</strong> Your browser does not support the Web Serial API.
                        Please use Google Chrome or Microsoft Edge on a desktop computer.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-3xl rounded-full" />

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                            <div>
                                <h1 className="text-3xl font-extrabold text-white mb-2">{device.name}</h1>
                                <p className="text-slate-400 text-sm max-w-md">{device.description}</p>
                            </div>
                            <div className="shrink-0 flex items-center p-1 bg-slate-950/50 rounded-2xl border border-slate-800">
                                <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium ${state === 'connected' || state === 'done' || state === 'flashing'
                                    ? 'bg-green-500/10 text-green-400'
                                    : 'bg-slate-800 text-slate-500'
                                    }`}>
                                    <Zap className="w-4 h-4" />
                                    <span>{state.toUpperCase()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-10">
                            <div className="space-y-3">
                                <label className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <Settings className="w-3 h-3 mr-2 text-primary-500" />
                                    Baud Rate
                                </label>
                                <select
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-primary-500 transition-colors"
                                    value={baudRate}
                                    onChange={(e) => setBaudRate(Number(e.target.value))}
                                    disabled={state !== 'idle' && state !== 'error'}
                                >
                                    <option value={9600}>9600 (Very Slow)</option>
                                    <option value={115200}>115200 (Standard)</option>
                                    <option value={230400}>230400 (Fast)</option>
                                    <option value={460800}>460800 (Very Fast)</option>
                                    <option value={921600}>921600 (Extreme)</option>
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <Cpu className="w-3 h-3 mr-2 text-primary-500" />
                                    Flash Mode
                                </label>
                                <select
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-primary-500 transition-colors"
                                    value={flashMode}
                                    onChange={(e) => setFlashMode(e.target.value)}
                                    disabled={state !== 'idle' && state !== 'error'}
                                >
                                    <option value="qio">QIO</option>
                                    <option value="qout">QOUT</option>
                                    <option value="dio">DIO</option>
                                    <option value="dout">DOUT</option>
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <Zap className="w-3 h-3 mr-2 text-primary-500" />
                                    Flash Speed
                                </label>
                                <select
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-primary-500 transition-colors"
                                    value={flashFreq}
                                    onChange={(e) => setFlashFreq(e.target.value)}
                                    disabled={state !== 'idle' && state !== 'error'}
                                >
                                    <option value="40m">40MHz</option>
                                    <option value="26m">26MHz</option>
                                    <option value="20m">20MHz</option>
                                    <option value="80m">80MHz</option>
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <Layers className="w-3 h-3 mr-2 text-primary-500" />
                                    Flash Size
                                </label>
                                <select
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-primary-500 transition-colors"
                                    value={flashSize}
                                    onChange={(e) => setFlashSize(e.target.value)}
                                    disabled={state !== 'idle' && state !== 'error'}
                                >
                                    <option value="detected">Auto Detect</option>
                                    <option value="1mb">1MB</option>
                                    <option value="2mb">2MB</option>
                                    <option value="4mb">4MB</option>
                                    <option value="8mb">8MB</option>
                                    <option value="16mb">16MB</option>
                                </select>
                            </div>

                            <div className="md:col-span-2 flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                                <div className="flex items-center space-x-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                                        eraseAll ? "bg-red-500/10 text-red-500" : "bg-slate-800 text-slate-500"
                                    )}>
                                        <Trash2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Erase Entire Flash</h4>
                                        <p className="text-[10px] text-slate-500">Perform full chip erase before writing</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setEraseAll(!eraseAll)}
                                    disabled={state !== 'idle' && state !== 'error'}
                                    className={cn(
                                        "w-12 h-6 rounded-full relative transition-colors duration-300 focus:outline-none",
                                        eraseAll ? "bg-red-500" : "bg-slate-800"
                                    )}
                                >
                                    <div className={cn(
                                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300",
                                        eraseAll ? "left-7" : "left-1"
                                    )} />
                                </button>
                            </div>

                            <div className="md:col-span-2 flex flex-col justify-end space-y-3 pt-4">
                                {state === 'idle' || state === 'error' ? (
                                    <button
                                        onClick={handleConnect}
                                        className="flex items-center justify-center space-x-2 w-full py-4 bg-primary-600 hover:bg-primary-500 text-white font-black rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-primary-500/20 uppercase tracking-widest text-[11px]"
                                    >
                                        <Power className="w-5 h-5" />
                                        <span>INITIALIZE SERIAL LINK</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleDisconnect}
                                        className="flex items-center justify-center space-x-2 w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-black rounded-xl transition-all active:scale-[0.98] uppercase tracking-widest text-[11px]"
                                    >
                                        <Power className="w-5 h-5" />
                                        <span>TERMINATE CONNECTION</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6 pt-6 border-t border-slate-800/50">
                            <div className="flex flex-col md:flex-row gap-4">
                                <button
                                    onClick={handleFlash}
                                    disabled={state !== 'connected' && state !== 'done' && state !== 'error'}
                                    className="flex-1 flex items-center justify-center space-x-3 py-5 bg-white text-slate-950 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white font-black rounded-2xl transition-all shadow-xl active:scale-[0.98] uppercase tracking-[0.2em] text-xs"
                                >
                                    <Zap className="w-5 h-5 fill-current" />
                                    <span>EXECUTE COMMAND</span>
                                </button>
                            </div>

                            {(state === 'flashing' || state === 'done') && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                                    <ProgressBar progress={overallProgress} label={state === 'done' ? 'Flash Complete!' : 'Flashing Storage...'} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 px-2">
                            <button
                                onClick={() => setViewMode('logs')}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2",
                                    viewMode === 'logs' ? "bg-slate-800 text-white shadow-lg" : "text-slate-600 hover:text-slate-400"
                                )}
                            >
                                <RefreshCw className={cn("w-3 h-3", state === 'flashing' && "animate-spin")} />
                                <span>System Intelligence</span>
                            </button>
                            <button
                                onClick={() => setViewMode('serial')}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2",
                                    viewMode === 'serial' ? "bg-slate-800 text-white shadow-lg" : "text-slate-600 hover:text-slate-400"
                                )}
                            >
                                <Terminal className="w-3 h-3" />
                                <span>Live Serial Link</span>
                            </button>
                        </div>

                        {viewMode === 'logs' ? (
                            <LogConsole logs={logs} />
                        ) : (
                            <SerialConsole
                                data={serialData}
                                onClear={() => setSerialData('')}
                                onStop={() => {
                                    flasherRef.current?.stopReading();
                                    setIsReadingSerial(false);
                                }}
                                onStart={() => {
                                    flasherRef.current?.startReading();
                                    setIsReadingSerial(true);
                                }}
                                isReading={isReadingSerial}
                            />
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    <HelpPanel />

                    <div className="bg-gradient-to-br from-primary-900/20 to-slate-900 border border-primary-500/20 rounded-2xl p-6">
                        <h3 className="text-white font-bold mb-4 flex items-center justify-between">
                            <span className="flex items-center">
                                <Cpu className="w-4 h-4 mr-2" />
                                Binary Manifest
                            </span>
                            {isFetchingBinary ? (
                                <span className="flex items-center text-[10px] text-primary-400 animate-pulse">
                                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                    FETCHING...
                                </span>
                            ) : binaryData ? (
                                <span className="flex items-center text-[10px] text-emerald-500 font-bold">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    READY
                                </span>
                            ) : null}
                        </h3>
                        <div className="space-y-3">
                            {device.files.map((file, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                                    <div className="text-xs font-mono text-slate-300">
                                        {file.path.split('/').pop()}
                                    </div>
                                    <div className="px-2 py-1 bg-primary-500/20 text-primary-400 text-[10px] font-bold rounded border border-primary-500/30">
                                        {file.address}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

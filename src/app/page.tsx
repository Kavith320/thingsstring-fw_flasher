import { DeviceCard } from '@/components/DeviceCard';
import Link from 'next/link';
import { Cpu, Plus, Terminal, Zap, Layers, Activity } from 'lucide-react';
import connectDB from '@/lib/mongoose';
import Device from '@/models/Device';

export const dynamic = 'force-dynamic';

async function getDevices() {
    try {
        await connectDB();
        const devices = await Device.find({}).sort({ createdAt: -1 });
        return JSON.parse(JSON.stringify(devices));
    } catch (error) {
        console.error('Failed to fetch devices:', error);
        return [];
    }
}

export default async function Home() {
    const devices = await getDevices();

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 md:py-12">
            {/* Tool Header - Simplified */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-slate-800 pb-8">
                <div>
                    <div className="flex items-center space-x-2 text-primary-400 mb-2">
                        <Zap className="w-5 h-5" />
                        <span className="text-xs font-bold tracking-widest uppercase">ThingsString Toolset</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                        Firmware Flasher <span className="text-slate-500 font-medium text-2xl ml-2">v1.0</span>
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-xl">
                        Deploy production-ready firmware directly to your ESP devices via Web Serial.
                    </p>
                </div>

                <div className="mt-6 md:mt-0 flex items-center space-x-4">
                    <Link
                        href="/serial-monitor"
                        className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center space-x-3 transition-all active:scale-95 group shadow-xl"
                    >
                        <Terminal className="w-4 h-4 text-primary-500 group-hover:rotate-12 transition-transform" />
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Universal Terminal</span>
                    </Link>
                    <div className="px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center space-x-3 shadow-xl">
                        <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">System Online</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {devices.length === 0 ? (
                    <div className="col-span-full py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center">
                        <Cpu className="w-12 h-12 text-slate-800 mb-6" />
                        <h3 className="text-white font-bold uppercase tracking-widest text-sm underline-offset-8">No Production Hardware Detected</h3>
                        <p className="text-slate-500 text-xs mt-3 max-w-sm px-6 leading-relaxed">
                            Register your devices in the admin panel to enable production firmware flashing, or use the direct uplink below for raw monitoring.
                        </p>
                        <Link
                            href="/serial-monitor"
                            className="mt-8 px-8 py-3 bg-primary-600/10 border border-primary-500/20 text-primary-400 font-black uppercase text-[10px] tracking-[0.3em] rounded-xl hover:bg-primary-500 hover:text-white transition-all active:scale-95"
                        >
                            Open Universal Terminal
                        </Link>
                    </div>
                ) : (
                    devices.map((device: any) => (
                        <DeviceCard key={device.id} device={device} />
                    ))
                )}
            </div>

            {/* Technical Context Footer */}
            <div className="mt-20 pt-10 border-t border-slate-800 flex flex-col lg:flex-row gap-10">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="p-5 bg-slate-900/30 rounded-xl border border-slate-800/50">
                        <Terminal className="w-5 h-5 text-primary-400 mb-3" />
                        <h4 className="text-slate-200 font-semibold mb-1">Web Serial</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">Cross-platform UART communication directly from Chrome/Edge.</p>
                    </div>
                    <div className="p-5 bg-slate-900/30 rounded-xl border border-slate-800/50">
                        <Cpu className="w-5 h-5 text-primary-400 mb-3" />
                        <h4 className="text-slate-200 font-semibold mb-1">Architecture</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">Optimized for ESP8266 & ESP32 series microcontrollers.</p>
                    </div>
                    <div className="p-5 bg-slate-900/30 rounded-xl border border-slate-800/50">
                        <Layers className="w-5 h-5 text-primary-400 mb-3" />
                        <h4 className="text-slate-200 font-semibold mb-1">Deployment</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">MD5 checksum verification ensures data integrity during flashing.</p>
                    </div>
                </div>

                <div className="lg:w-1/3 p-6 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl flex flex-col justify-center">
                    <div className="text-[10px] text-primary-400 uppercase tracking-[0.2em] font-bold mb-3">Target Specs</div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Max Baud Rate</span>
                            <span className="text-white font-mono">921600 bps</span>
                        </div>
                        <div className="w-full h-px bg-slate-800" />
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Flash Mode</span>
                            <span className="text-white font-mono">DIO / QIO</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

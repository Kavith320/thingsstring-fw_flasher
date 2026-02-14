import Link from 'next/link';
import { Plus, Settings, Cpu, FileText, LayoutDashboard, ChevronRight, Activity, Terminal } from 'lucide-react';
import connectDB from '@/lib/mongoose';
import Device from '@/models/Device';
import { DeviceActions } from '@/components/DeviceActions';

export const dynamic = 'force-dynamic';

async function getDevices() {
    try {
        await connectDB();
        const devices = await Device.find({}).sort({ createdAt: -1 });
        return JSON.parse(JSON.stringify(devices));
    } catch (error) {
        return [];
    }
}

export default async function AdminDashboard() {
    const devices = await getDevices();

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Admin Console</h1>
                    <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-semibold font-mono">Hardware & Firmware Management</p>
                </div>

                <div className="flex items-center space-x-4">
                    <Link
                        href="/serial-monitor"
                        className="flex items-center space-x-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold rounded-xl transition-all shadow-xl active:scale-[0.98] group"
                    >
                        <Terminal className="w-5 h-5 text-primary-500 group-hover:rotate-12 transition-transform" />
                        <span className="text-[10px] tracking-widest uppercase">Direct Uplink</span>
                    </Link>
                    <Link
                        href="/admin/add-device"
                        className="flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-500/20 active:scale-[0.98]"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="text-[10px] tracking-widest uppercase">Register Device</span>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
                    <div className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Total Devices</div>
                    <div className="flex items-end justify-between">
                        <span className="text-4xl font-black text-white">{devices.length}</span>
                        <Cpu className="w-8 h-8 text-primary-500/20" />
                    </div>
                </div>
                <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
                    <div className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Firmware Status</div>
                    <div className="flex items-end justify-between">
                        <span className="text-4xl font-black text-emerald-500">Live</span>
                        <Activity className="w-8 h-8 text-emerald-500/20" />
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Device Catalog</span>
                    <span className="text-[10px] bg-slate-700 px-2 py-1 rounded text-slate-300 font-mono">DB_CONNECTED</span>
                </div>

                <div className="divide-y divide-slate-800/50">
                    {devices.length === 0 ? (
                        <div className="p-24 text-center">
                            <Cpu className="w-16 h-16 text-slate-800 mx-auto mb-6 opacity-20" />
                            <p className="text-slate-600 font-bold uppercase text-[10px] tracking-[0.2em]">No hardware registry detected</p>
                        </div>
                    ) : (
                        devices.map((device: any) => (
                            <div key={device.id} className="group p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-800/20 transition-all">
                                <Link href={`/flash/${device.id}`} className="flex items-center space-x-6 mb-6 md:mb-0 cursor-pointer flex-1">
                                    <div className="relative w-20 h-20 bg-[#020617] rounded-[1.5rem] overflow-hidden border border-slate-800 flex items-center justify-center group-hover:border-primary-500/30 transition-colors shadow-inner">
                                        {/* Subtle Grid Background */}
                                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '10px 10px' }} />

                                        {device.image ? (
                                            <img src={device.image} alt={device.name} className="w-full h-full object-contain p-2 drop-shadow-2xl grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-110" />
                                        ) : (
                                            <Cpu className="w-8 h-8 text-slate-700" />
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center space-x-3">
                                            <h3 className="text-xl font-black text-white group-hover:text-primary-400 transition-colors tracking-tight uppercase">{device.name}</h3>
                                            <div className="px-2 py-0.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">
                                                Active
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4 text-[10px]">
                                            <div className="flex items-center text-slate-500">
                                                <span className="font-mono text-primary-500 font-black mr-2 opacity-70">ID:</span>
                                                <span className="text-white font-mono tracking-tighter">{device.id}</span>
                                            </div>
                                            <span className="w-1 h-1 rounded-full bg-slate-800" />
                                            <div className="flex items-center text-slate-500">
                                                <span className="font-black mr-2">VER:</span>
                                                <span className="text-slate-300 font-bold">{device.version}</span>
                                            </div>
                                            <span className="w-1 h-1 rounded-full bg-slate-800" />
                                            <div className="flex items-center text-slate-500">
                                                <span className="font-black mr-2">ARCH:</span>
                                                <span className="text-emerald-500/80 font-black uppercase tracking-widest">{device.chip}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>

                                <div className="flex items-center space-x-8 pl-6 md:pl-0">
                                    <div className="hidden lg:flex flex-col text-right">
                                        <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Last Modified</span>
                                        <span className="text-[10px] font-mono text-slate-500">{new Date(device.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</span>
                                    </div>
                                    <div className="h-10 w-px bg-slate-800/50 hidden md:block" />
                                    <DeviceActions deviceId={device.id} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

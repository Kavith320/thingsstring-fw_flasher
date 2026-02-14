'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { UploadButton } from '@/lib/uploadthing';
import {
    Cpu,
    Zap,
    CheckCircle2,
    AlertCircle,
    Image as ImageIcon,
    FileCode,
    RefreshCw,
    Trash2,
    Shield,
    ChevronRight,
    ChevronLeft,
    Loader2,
    History as HistoryIcon
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function AdminEditDevicePage() {
    const router = useRouter();
    const params = useParams();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [firmwareFiles, setFirmwareFiles] = useState<{ path: string; address: string; name: string }[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [formData, setFormData] = useState({
        id: '',
        name: '',
        chip: 'esp8266',
        version: '1.0.0',
        baud: 460800,
        description: '',
        imageUrl: ''
    });

    const [releases, setReleases] = useState<any[]>([]);
    const [loadingReleases, setLoadingReleases] = useState(false);

    useEffect(() => {
        const fetchDevice = async () => {
            try {
                const res = await fetch(`/api/devices/${params.id}`);
                if (!res.ok) throw new Error('Hardware not found in registry');
                const data = await res.json();

                setFormData({
                    id: data.id,
                    name: data.name,
                    chip: data.chip,
                    version: data.version,
                    baud: data.baud,
                    description: data.description || '',
                    imageUrl: data.image || ''
                });

                setFirmwareFiles(data.files.map((f: any) => ({
                    ...f,
                    name: f.path.split('/').pop() || 'binary-blob'
                })));
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        const fetchReleases = async () => {
            setLoadingReleases(true);
            try {
                const res = await fetch(`/api/devices/${params.id}/releases`);
                if (res.ok) {
                    const data = await res.json();
                    setReleases(data);
                }
            } catch (err) {
                console.error('Failed to load release history');
            } finally {
                setLoadingReleases(false);
            }
        };

        if (params.id) {
            fetchDevice();
            fetchReleases();
        }
    }, [params.id]);

    const nextStep = () => {
        if (currentStep === 1) {
            if (!formData.name) {
                setError("Device Designation is required.");
                return;
            }
        }
        setError(null);
        setCurrentStep(prev => Math.min(prev + 1, 3));
    };

    const prevStep = () => {
        setError(null);
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (firmwareFiles.length === 0) {
            setError('Please upload at least one firmware file.');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const deviceData = {
                name: formData.name,
                chip: formData.chip,
                version: formData.version,
                baud: Number(formData.baud),
                description: formData.description,
                image: formData.imageUrl,
                files: firmwareFiles.map(f => ({
                    path: f.path,
                    address: f.address
                }))
            };

            const res = await fetch(`/api/devices/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(deviceData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update hardware registry.');
            }

            setSuccess(true);
            setTimeout(() => router.push('/admin'), 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const removeBinary = (index: number) => {
        setFirmwareFiles(prev => prev.filter((_, i) => i !== index));
    };

    const updateBinaryAddress = (index: number, address: string) => {
        setFirmwareFiles(prev => prev.map((f, i) => i === index ? { ...f, address } : f));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-6">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Synchronizing Registry Parameters</p>
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-in fade-in zoom-in duration-500 bg-slate-950">
                <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-8 border border-emerald-500/20 shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 className="w-12 h-12" />
                </div>
                <h1 className="text-3xl font-black text-white tracking-widest uppercase">System Updated</h1>
                <p className="text-slate-500 text-[10px] uppercase tracking-[0.5em] mt-3">Hardware Metadata Rebuilt Successfully</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-primary-500/30">
            <div className="max-w-xl mx-auto px-6 py-12 lg:py-24">

                {/* Header with Back link */}
                <div className="mb-12">
                    <button
                        onClick={() => router.push('/admin')}
                        className="flex items-center space-x-2 text-slate-500 hover:text-white transition-colors group mb-6"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Abort Modification</span>
                    </button>
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                            <Cpu className="w-6 h-6 text-primary-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight uppercase">Update Hardware</h1>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Modifying: <span className="text-primary-400">{formData.id}</span></p>
                        </div>
                    </div>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center justify-between mb-16 relative px-4">
                    <div className="absolute top-1/2 left-0 w-full h-px bg-slate-900 -translate-y-1/2 z-0" />
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="relative z-10 flex flex-col items-center">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                                currentStep === s ? "bg-primary-500 border-primary-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]" :
                                    currentStep > s ? "bg-emerald-500 border-emerald-500 text-white" : "bg-slate-950 border-slate-800 text-slate-700"
                            )}>
                                {currentStep > s ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-xs font-black">{s}</span>}
                            </div>
                            <span className={cn(
                                "text-[8px] font-black uppercase tracking-widest mt-3 whitespace-nowrap",
                                currentStep === s ? "text-primary-500" : "text-slate-700"
                            )}>
                                {s === 1 ? "Identity" : s === 2 ? "Payload" : "Finalize"}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="min-h-[400px]">
                    {/* STEP 01: IDENTITY */}
                    {currentStep === 1 && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Refine Identity</h1>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Adjust core hardware specifics</p>
                            </div>

                            <div className="space-y-10">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] ml-1">Designation</label>
                                    <input
                                        required
                                        autoFocus
                                        placeholder="E.G. TS_SENSOR_NODE"
                                        className="w-full bg-transparent border-b-2 border-slate-900 py-4 text-3xl font-black text-white outline-none focus:border-primary-500 transition-colors placeholder:text-slate-900"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-12">
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] ml-1">Chipset</label>
                                        <select
                                            className="w-full bg-transparent border-b-2 border-slate-900 py-3 text-base font-black text-white outline-none focus:border-primary-500 appearance-none cursor-pointer"
                                            value={formData.chip}
                                            onChange={(e) => setFormData({ ...formData, chip: e.target.value })}
                                        >
                                            <option value="esp8266" className="bg-slate-950 text-white">ESP8266</option>
                                            <option value="esp32" className="bg-slate-950 text-white">ESP32 (WROOM)</option>
                                            <option value="esp32s2" className="bg-slate-950 text-white">ESP32-S2</option>
                                            <option value="esp32c3" className="bg-slate-950 text-white">ESP32-C3</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] ml-1">Revision</label>
                                        <input
                                            required
                                            placeholder="1.0.0"
                                            className="w-full bg-transparent border-b-2 border-slate-900 py-3 text-base font-black text-white outline-none focus:border-primary-500 font-mono"
                                            value={formData.version}
                                            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 02: PAYLOAD */}
                    {currentStep === 2 && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Update Assets</h1>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Synchronize visual & logic layers</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
                                {/* Image Part */}
                                <div className="space-y-6 flex flex-col">
                                    <div className="flex items-center space-x-3 px-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Interface Blueprint</span>
                                    </div>
                                    <div className="relative flex-1 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] flex items-center justify-center p-8 overflow-hidden group shadow-[inset_0_0_30px_rgba(0,0,0,0.5)] min-h-[420px]">
                                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                                        {!formData.imageUrl ? (
                                            <div className="z-10 w-full flex flex-col items-center text-center px-4">
                                                <div className="w-16 h-16 rounded-3xl bg-slate-800/50 flex items-center justify-center mb-8 border border-slate-700/50 group-hover:scale-110 transition-transform duration-500">
                                                    <ImageIcon className="w-8 h-8 text-slate-500" />
                                                </div>
                                                <UploadButton
                                                    endpoint="imageUploader"
                                                    onUploadBegin={() => setError(null)}
                                                    onClientUploadComplete={(res) => {
                                                        if (res?.[0]) setFormData({ ...formData, imageUrl: res[0].url });
                                                    }}
                                                    onUploadError={(error: Error) => setError(`Asset Error: ${error.message}`)}
                                                    appearance={{
                                                        button: "bg-white text-black font-black uppercase text-[10px] tracking-widest px-10 h-14 rounded-2xl border-none shadow-[0_10px_40px_-10px_rgba(255,255,255,0.3)] active:scale-95 transition-all disabled:opacity-50",
                                                        container: "w-full flex justify-center",
                                                        allowedContent: "hidden"
                                                    }}
                                                    content={{
                                                        button({ ready }) { return ready ? 'Deploy Visuals' : 'Syncing...'; }
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <img src={formData.imageUrl} className="max-w-full max-h-full object-contain drop-shadow-2xl scale-110 transition-transform duration-700 group-hover:scale-125 z-10 p-4" alt="Preview" />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, imageUrl: '' })}
                                                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center text-red-500 font-black uppercase text-[10px] tracking-[0.3em] z-20"
                                                >
                                                    <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                                                        <Trash2 className="w-5 h-5" />
                                                    </div>
                                                    Erase Entry
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Binary Part */}
                                <div className="space-y-6 flex flex-col">
                                    <div className="flex items-center space-x-3 px-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Logic Layer</span>
                                    </div>
                                    <div className="flex-1 bg-slate-900/20 border border-slate-800/80 rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden min-h-[420px] shadow-[inset_0_0_30px_rgba(0,0,0,0.3)]">
                                        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '15px 15px' }} />

                                        <div className="flex-1 space-y-4 z-10 overflow-y-auto pr-2 scrollbar-hide">
                                            {firmwareFiles.length > 0 ? (
                                                firmwareFiles.map((file, index) => (
                                                    <div key={index} className="flex items-center bg-slate-950/40 border border-slate-800/50 p-5 rounded-3xl group/item animate-in slide-in-from-right-4 transition-all hover:border-primary-500/30">
                                                        <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center mr-4">
                                                            <FileCode className="w-5 h-5 text-primary-500" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[10px] font-black text-white truncate uppercase tracking-tight">{file.name}</p>
                                                            <div className="flex items-center mt-2 space-x-2">
                                                                <span className="text-[7px] font-black text-slate-700 uppercase tracking-widest">Offset:</span>
                                                                <input
                                                                    type="text"
                                                                    value={file.address}
                                                                    onChange={(e) => updateBinaryAddress(index, e.target.value)}
                                                                    className="bg-transparent text-[10px] font-mono text-primary-500 outline-none w-24 border-b border-primary-500/10 focus:border-primary-500/40 transition-colors"
                                                                />
                                                            </div>
                                                        </div>
                                                        <button type="button" onClick={() => removeBinary(index)} className="p-2 text-slate-800 hover:text-red-500 transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-40">
                                                    <Zap className="w-8 h-8 text-slate-700 mb-6" />
                                                    <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">Awaiting Logic Injection</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-8 pt-8 border-t border-slate-800/30 z-10 flex justify-center">
                                            {!isUploading ? (
                                                <UploadButton
                                                    endpoint="firmwareUploader"
                                                    onUploadBegin={() => {
                                                        setError(null);
                                                        setIsUploading(true);
                                                        setUploadProgress(0);
                                                    }}
                                                    onUploadProgress={(p) => setUploadProgress(p)}
                                                    onClientUploadComplete={(res) => {
                                                        if (res) {
                                                            const newFiles = res.map(file => ({
                                                                path: file.ufsUrl || file.url,
                                                                name: file.name,
                                                                address: '0x00000'
                                                            }));
                                                            setFirmwareFiles(prev => [...prev, ...newFiles]);
                                                        }
                                                        setIsUploading(false);
                                                    }}
                                                    onUploadError={(error: Error) => {
                                                        setError(`Firmware Error: ${error.message}`);
                                                        setIsUploading(false);
                                                    }}
                                                    appearance={{
                                                        button: "bg-primary-600/10 border border-primary-500/20 text-primary-400 font-extrabold uppercase text-[9px] tracking-[0.3em] px-10 h-14 rounded-2xl hover:bg-primary-500/20 hover:text-primary-300 active:scale-95 transition-all disabled:opacity-50",
                                                        container: "w-full flex justify-center",
                                                        allowedContent: "hidden"
                                                    }}
                                                    content={{
                                                        button({ ready }) { return ready ? 'Refine Binary' : 'Syncing...'; }
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-2 space-y-4 w-full px-6">
                                                    <div className="flex items-center justify-between w-full mb-1">
                                                        <span className="text-[9px] font-black text-primary-500 uppercase tracking-widest flex items-center">
                                                            <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                                                            Transmitting
                                                        </span>
                                                        <span className="text-[9px] font-black text-primary-500 uppercase">{uploadProgress}%</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/30 shadow-inner">
                                                        <div className="h-full bg-primary-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-300 rounded-full" style={{ width: `${uploadProgress}%` }} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 03: FINALIZE */}
                    {currentStep === 3 && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Confirm Rewrite</h1>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Commit changes to hardware registry</p>
                            </div>

                            <div className="bg-slate-900/40 border border-slate-900 rounded-[2.5rem] overflow-hidden">
                                <div className="p-8 space-y-8">
                                    <div className="flex items-center justify-between border-b border-slate-800/50 pb-6">
                                        <div>
                                            <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Target Designation</p>
                                            <p className="text-xl font-black text-white uppercase tracking-tight">{formData.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Architecture</p>
                                            <p className="text-sm font-black text-primary-500 uppercase">{formData.chip}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest mb-3">Payload Assets</p>
                                            <div className="flex -space-x-3 overflow-hidden">
                                                {firmwareFiles.map((_, i) => (
                                                    <div key={i} className="inline-block h-8 w-8 rounded-full ring-4 ring-slate-950 bg-slate-800 flex items-center justify-center">
                                                        <FileCode className="w-3.5 h-3.5 text-primary-500" />
                                                    </div>
                                                ))}
                                                {formData.imageUrl && (
                                                    <div className="inline-block h-8 w-8 rounded-full ring-4 ring-slate-950 bg-slate-800 flex items-center justify-center">
                                                        <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest mb-1">Status</p>
                                            <div className="flex items-center justify-end space-x-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <p className="text-[10px] font-black text-emerald-500 uppercase">Authenticated</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={saving || isUploading}
                                className="w-full bg-slate-100 hover:bg-emerald-500 hover:text-white text-black font-black py-8 rounded-[2.5rem] transition-all shadow-[0_20px_60px_-15px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-20 flex items-center justify-center space-x-4 group"
                            >
                                {saving ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Shield className="w-6 h-6 transition-transform group-hover:rotate-12" />}
                                <span className="uppercase tracking-[0.5em] text-xs">Update Registry</span>
                            </button>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mt-8 bg-red-500/10 border border-red-500/20 p-6 rounded-[2rem] flex items-center space-x-4 animate-in shake">
                        <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-relaxed flex-1">{error}</span>
                    </div>
                )}

                {/* Nav Buttons */}
                {!success && (
                    <div className="mt-12 flex justify-between items-center px-2">
                        <button
                            type="button"
                            onClick={prevStep}
                            disabled={currentStep === 1 || saving}
                            className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 hover:text-white disabled:opacity-0 transition-all active:scale-90"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        {currentStep < 3 && (
                            <button
                                type="button"
                                onClick={nextStep}
                                disabled={saving || isUploading}
                                className="px-8 py-4 bg-slate-900 border border-slate-800 rounded-3xl text-white font-black uppercase text-[10px] tracking-widest flex items-center space-x-3 hover:bg-slate-800 transition-all active:scale-95"
                            >
                                <span>Proceed</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )}

                {/* Distribution Archive (Version History) */}
                <div className="mt-32 space-y-8 pb-12 border-t border-slate-900 pt-16">
                    <div className="flex items-center space-x-3 px-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Distribution Archive</span>
                    </div>

                    <div className="space-y-4">
                        {loadingReleases ? (
                            <div className="py-10 text-center">
                                <Loader2 className="w-6 h-6 text-slate-800 animate-spin mx-auto mb-2" />
                                <span className="text-[8px] font-black text-slate-800 uppercase tracking-widest">Scanning History...</span>
                            </div>
                        ) : releases.length > 0 ? (
                            releases.map((rel, i) => (
                                <div key={rel._id} className="bg-slate-900/20 border border-slate-800/50 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between group hover:border-primary-500/20 transition-all">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center border border-slate-700/30">
                                            <Shield className="w-5 h-5 text-slate-500 group-hover:text-primary-500 transition-colors" />
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-black text-white">v{rel.version}</span>
                                                <span className="text-[8px] font-bold text-slate-600 bg-slate-950 px-2 py-0.5 rounded-full uppercase tracking-tighter">{rel.chip}</span>
                                            </div>
                                            <p className="text-[9px] font-medium text-slate-500 mt-1 uppercase tracking-widest">
                                                Deployed: {new Date(rel.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 md:mt-0 flex items-center space-x-6">
                                        <div className="text-right hidden md:block">
                                            <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest mb-1">Status</p>
                                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center">
                                                <CheckCircle2 className="w-3 h-3 mr-1.5" />
                                                Stable
                                            </span>
                                        </div>
                                        <div className="flex -space-x-2">
                                            {rel.files.map((_: any, idx: number) => (
                                                <div key={idx} title="Binary File" className="w-6 h-6 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center ring-4 ring-slate-950">
                                                    <FileCode className="w-3 h-3 text-primary-500" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 bg-slate-900/10 border border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                                <HistoryIcon className="w-8 h-8 text-slate-800 mb-4" />
                                <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em]">No Historical Deployments</p>
                            </div>
                        )}
                    </div>
                </div>

                <footer className="mt-24 text-center">
                    <p className="text-[8px] text-slate-800 font-black uppercase tracking-[0.8em]">TS/X-INFRASTRUCTURE-TERMINAL</p>
                </footer>
            </div>
        </div>
    );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Settings, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DeviceActionsProps {
    deviceId: string;
}

export function DeviceActions({ deviceId }: DeviceActionsProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/devices/${deviceId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                router.refresh(); // Refresh the server component
            } else {
                const data = await res.json();
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            alert('Failed to delete device');
        } finally {
            setIsDeleting(false);
            setShowConfirm(false);
        }
    };

    if (showConfirm) {
        return (
            <div className="flex items-center space-x-2 animate-in fade-in slide-in-from-right-2 duration-300">
                <span className="text-[9px] font-black text-red-500 uppercase tracking-widest mr-2">Confirm Delete?</span>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all"
                >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
                <button
                    onClick={() => setShowConfirm(false)}
                    disabled={isDeleting}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all text-[9px] font-black uppercase tracking-widest px-3"
                >
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-3">
            <Link
                href={`/admin/edit-device/${deviceId}`}
                className="p-2.5 bg-slate-800 hover:bg-primary-500 text-slate-400 hover:text-white rounded-xl transition-all shadow-lg active:scale-95 group"
                title="Edit Device"
            >
                <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
            </Link>
            <button
                onClick={() => setShowConfirm(true)}
                className="p-2.5 bg-slate-800 hover:bg-red-500 text-slate-400 hover:text-white rounded-xl transition-all shadow-lg active:scale-95"
                title="Delete Device"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}

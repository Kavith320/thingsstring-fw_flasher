import React from 'react';
import { HelpCircle, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';

export const HelpPanel: React.FC = () => {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center space-x-2 mb-6 text-primary-400">
                <HelpCircle className="w-5 h-5" />
                <h2 className="text-lg font-semibold text-white">Troubleshooting Help</h2>
            </div>

            <div className="space-y-6">
                <section className="flex space-x-4">
                    <div className="shrink-0 p-2 bg-blue-500/10 rounded-lg text-blue-400 h-fit">
                        <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-slate-200 mb-1">Browser Support</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Ensure you are using <span className="text-slate-300 font-medium">Google Chrome</span> or <span className="text-slate-300 font-medium">Microsoft Edge</span>.
                            Web Serial API is not supported in Safari, Firefox, or Brave (unless enabled).
                        </p>
                    </div>
                </section>

                <section className="flex space-x-4">
                    <div className="shrink-0 p-2 bg-yellow-500/10 rounded-lg text-yellow-500 h-fit">
                        <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-slate-200 mb-1">Boot Mode Tip</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            If flashing fails to connect, hold the <span className="text-slate-300 font-medium">FLASH/BOOT</span> button,
                            tap the <span className="text-slate-300 font-medium">RESET</span> button, then release FLASH.
                            This forces the chip into download mode.
                        </p>
                    </div>
                </section>

                <section className="flex space-x-4">
                    <div className="shrink-0 p-2 bg-green-500/10 rounded-lg text-green-500 h-fit">
                        <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-slate-200 mb-1">USB Drivers</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Make sure you have the correct drivers installed for your USB-to-Serial converter
                            (mostly <span className="text-slate-300 font-medium">CH340</span>, <span className="text-slate-300 font-medium">CP210x</span>, or <span className="text-slate-300 font-medium">FTDI</span>).
                        </p>
                    </div>
                </section>
            </div>

            <div className="mt-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest font-mono">
                    Flash Offset: 0x00000 | Target: ESP8266
                </p>
            </div>
        </div>
    );
};

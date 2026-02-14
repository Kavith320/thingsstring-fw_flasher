import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "ThingsString Flasher | Device Firmware Tool",
    description: "Firmware deployment tool for ThingsString IoT devices.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark scroll-smooth">
            <body className={`${inter.className} bg-slate-950 text-slate-200 min-h-screen selection:bg-primary-500/30 selection:text-primary-200 uppercase-buttons font-sans`}>
                {/* Abstract Background Noise/Glow */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-900/5 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/5 blur-[120px] rounded-full" />
                </div>

                <header className="relative z-10 border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0">
                    <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-7 h-7 bg-primary-500 rounded flex items-center justify-center font-black text-white text-[10px]">
                                TS
                            </div>
                            <span className="font-bold text-lg tracking-tight text-white">
                                ThingsString <span className="text-slate-500 font-medium">Flasher</span>
                            </span>
                        </div>
                        <nav className="hidden md:flex items-center space-x-6 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                            <a href="/" className="hover:text-primary-400 transition-colors">Catalog</a>
                            <a href="https://www.thingsstring.com" target="_blank" className="hover:text-white transition-colors">Main Site</a>
                            <a href="#" className="px-3 py-1 bg-slate-800 rounded text-slate-300 hover:bg-slate-700 transition-colors">Documentation</a>
                        </nav>
                    </div>
                </header>

                <main className="relative z-10 min-h-[calc(100-h-14)]">
                    {children}
                </main>

                <footer className="relative z-10 border-t border-white/5 bg-slate-950 py-10 mt-20">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                        <p>© 2026 ThingsString. Sub-service of thingsstring.com</p>
                        <div className="flex items-center space-x-6 mt-4 md:mt-0">
                            <span className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" /> Web Serial Active</span>
                            <span>v1.0.4-STABLE</span>
                        </div>
                    </div>
                </footer>
            </body>
        </html>
    );
}

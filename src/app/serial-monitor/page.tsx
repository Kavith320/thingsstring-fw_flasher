import StandaloneTerminal from '@/components/StandaloneTerminal';

export const metadata = {
    title: 'Universal Serial Monitor | ThingsString Toolset',
    description: 'Standalone Web Serial terminal for communicating with any hardware device.',
};

export default function SerialMonitorPage() {
    return (
        <div className="min-h-screen bg-slate-950">
            <StandaloneTerminal />
        </div>
    );
}

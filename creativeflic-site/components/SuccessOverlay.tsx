import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import Reveal from './Reveal';

interface SuccessOverlayProps {
    isVisible: boolean;
    onClose: () => void;
}

const steps = [
    { title: 'We study your channel', desc: 'Keywords your buyers search, what competitors rank for, and the gaps you can win.' },
    { title: 'You get a short video audit', desc: 'About 10 minutes, sent to your inbox within 48 hours. Check spam just in case.' },
    { title: 'You decide what is next', desc: 'If it looks like a fit, we suggest a next step. No pressure, no sales call needed.' },
];

const SuccessOverlay: React.FC<SuccessOverlayProps> = ({ isVisible, onClose }) => {
    if (!isVisible) return null;
    return (
        <div className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center overflow-y-auto py-10 transition-opacity duration-700 animate-in fade-in" role="dialog" aria-modal="true" aria-label="Audit request received">
            <div className="text-center max-w-3xl px-6">
                <Reveal delay={0}><CheckCircle size={64} className="text-blue-400 mx-auto mb-6 animate-pulse-slow glow-blue" /></Reveal>
                <Reveal delay={100}><h2 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-tight">Your audit request is in!</h2></Reveal>
                <Reveal delay={250}>
                    <div className="inline-flex items-center gap-2.5 bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm md:text-base font-bold shadow-xl glow-blue">
                        <Clock size={20} /> <span className="uppercase tracking-wide">Your video audit arrives within 48 hours</span>
                    </div>
                </Reveal>
                <Reveal delay={400}>
                    <div className="mt-10 grid md:grid-cols-3 gap-4 text-left">
                        {steps.map((s, i) => (
                            <div key={s.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                <div className="text-xs font-black text-yellow-400 tracking-widest mb-2">STEP {i + 1}</div>
                                <div className="text-white font-bold mb-1.5">{s.title}</div>
                                <div className="text-sm text-neutral-400">{s.desc}</div>
                            </div>
                        ))}
                    </div>
                </Reveal>
                <Reveal delay={550}><button onClick={onClose} className="mt-10 px-8 py-3 border border-white/20 text-white hover:border-blue-400 hover:text-blue-400 transition-colors duration-300 uppercase tracking-widest font-bold text-sm rounded-full">Back to the site</button></Reveal>
            </div>
        </div>
    );
}

export default SuccessOverlay;

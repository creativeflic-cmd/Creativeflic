import React, { useEffect, useRef, useState } from 'react';
import { X, ArrowRight, CheckCircle2 } from 'lucide-react';
import { LEAD_FORM_URL } from '../config';
import { track } from '../analytics';

const SEEN_KEY = 'cf_audit_popup_seen';
const DONE_KEY = 'cf_audit_lead_sent';

const safeGet = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const safeSet = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } };

/** Mark that this visitor already sent the main audit form, so the popup never shows. */
export const markLeadSent = () => safeSet(DONE_KEY, '1');

/**
 * Soft audit offer. Shows once per visitor, after 45 s, 60% scroll, or desktop exit intent.
 * A slide-up card on phones and a small corner card on desktop, never a full-screen block.
 */
const AuditPopup: React.FC<{ onFullForm: () => void }> = ({ onFullForm }) => {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', url: '' });
  const fired = useRef(false);

  useEffect(() => {
    if (safeGet(SEEN_KEY) || safeGet(DONE_KEY)) return;
    const show = (why: string) => {
      if (fired.current || safeGet(DONE_KEY)) return;
      fired.current = true;
      safeSet(SEEN_KEY, '1');
      setOpen(true);
      track('popup_shown', { trigger: why });
    };
    const timer = window.setTimeout(() => show('time_45s'), 45000);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max > 0.6) show('scroll_60');
    };
    const onLeave = (e: MouseEvent) => { if (e.clientY <= 0 && window.innerWidth >= 768) show('exit_intent'); };
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('mouseout', onLeave);
    return () => { clearTimeout(timer); window.removeEventListener('scroll', onScroll); document.removeEventListener('mouseout', onLeave); };
  }, []);

  const close = () => { setOpen(false); track('popup_closed'); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.url.trim()) return;
    setBusy(true);
    const data = new FormData();
    data.append('DATE', new Date().toLocaleString());
    data.append('NAME', form.name);
    data.append('EMAIL', form.email);
    data.append('Service_Type', 'Free Audit / Popup');
    data.append('Message', `Website/Channel: ${form.url}\n\n(Sent from the website popup)`);
    try {
      await fetch(LEAD_FORM_URL, { method: 'POST', body: data, mode: 'no-cors' });
      markLeadSent();
      track('generate_lead', { form: 'popup' });
      setSent(true);
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  const input = 'w-full px-4 py-3 rounded-xl bg-black/50 border border-neutral-700 text-white placeholder-neutral-500 text-sm outline-none focus:border-blue-500';

  return (
    <div className="fixed z-[80] inset-x-0 bottom-0 md:inset-x-auto md:bottom-6 md:right-6 md:w-[400px] animate-[slideUp_.35s_ease-out]" role="dialog" aria-modal="false" aria-label="Free YouTube audit offer">
      <style>{'@keyframes slideUp{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}'}</style>
      <div className="relative m-0 md:m-0 rounded-t-3xl md:rounded-3xl border border-white/10 bg-neutral-950/95 backdrop-blur-xl p-6 shadow-[0_20px_70px_-15px_rgba(37,99,235,0.45)]">
        <button type="button" onClick={close} aria-label="Close" className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10">
          <X size={18} />
        </button>
        {sent ? (
          <div className="text-center py-4">
            <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-white mb-1">Got it. Your audit is on the way.</h4>
            <p className="text-sm text-neutral-400">Expect a 10-minute video within 48 hours.</p>
          </div>
        ) : (
          <>
            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-yellow-400 mb-2">Free · 10 minutes · No call</div>
            <h4 className="text-xl font-bold text-white leading-snug mb-2 pr-6">Want 3 quick fixes for your channel?</h4>
            <p className="text-sm text-neutral-400 mb-5">Send your website or channel and get a short video audit: keywords, competitors, and the first videos to make.</p>
            <form onSubmit={submit} className="space-y-3">
              <input className={input} placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input className={input} type="email" placeholder="Work email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <input className={input} placeholder="Website or YouTube channel" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required />
              <button type="submit" disabled={busy} className="w-full py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm inline-flex items-center justify-center gap-2 disabled:opacity-70">
                {busy ? 'Sending…' : <>Send My Free Audit <ArrowRight size={16} /></>}
              </button>
            </form>
            <div className="flex justify-between items-center mt-4 text-[11px] text-neutral-500">
              <a href="/privacy.html" className="hover:text-neutral-300 underline underline-offset-2">Privacy Policy</a>
              <button type="button" onClick={() => { close(); onFullForm(); }} className="hover:text-neutral-300 underline underline-offset-2">Use the full form instead</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuditPopup;

import { useRef, useState } from 'react';
import { Bot, Copy, Download, X } from 'lucide-react';

const PROMPT = 'Use https://nitk.me/ss/ to style the attached screenshot with the light background. Follow its agent guide and return the finished PNG.';

export default function AgentInstructions() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [copyStatus, setCopyStatus] = useState('');
  const base = import.meta.env.BASE_URL;

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(PROMPT);
      setCopyStatus('Prompt copied. Attach your screenshot when you send it.');
    } catch {
      setCopyStatus('Select and copy the prompt above.');
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        onClick={() => { setCopyStatus(''); dialogRef.current?.showModal(); }}
        className="flex items-center gap-2 rounded-full border border-foreground/15 px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Bot className="h-4 w-4" aria-hidden="true" /> Use with an agent
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="agent-instructions-title"
        onClose={() => triggerRef.current?.focus()}
        onKeyDown={(event) => {
          if (event.key !== 'Tab') return;
          const controls = event.currentTarget.querySelectorAll<HTMLElement>('button, textarea, a[href]');
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }}
        className="m-auto max-h-[90svh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-foreground/15 bg-background p-6 text-sm text-foreground shadow-2xl backdrop:bg-black/40"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="agent-instructions-title" className="text-xl font-semibold">Use with an agent</h2>
          <button
            type="button"
            aria-label="Close agent instructions"
            onClick={() => dialogRef.current?.close()}
            className="rounded-md p-2 hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <p className="mb-4 text-muted-foreground">Give your agent a screenshot and this prompt. It can style the image on your machine and return a PNG.</p>
        <label htmlFor="agent-prompt" className="mb-2 block font-medium">Prompt to send with your screenshot</label>
        <textarea id="agent-prompt" readOnly value={PROMPT} rows={5} className="mb-3 w-full resize-none rounded-xl border border-foreground/20 bg-white/60 p-3 leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        <button type="button" onClick={copyPrompt} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <Copy className="h-4 w-4" aria-hidden="true" /> Copy prompt
        </button>
        <p role="status" className="mt-2 min-h-5 text-xs text-muted-foreground">{copyStatus}</p>
        <p className="mb-4 mt-4 text-xs leading-relaxed text-muted-foreground">Your agent needs local execution with Node.js and Chromium, or browser tools that can upload and download files. The guide includes setup. Screenshots are processed locally; image URLs are downloaded by your agent.</p>
        <div className="flex flex-wrap gap-4 border-t border-foreground/15 pt-4 text-xs">
          <a href={`${base}agents/guide.md`} className="rounded-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Read the agent guide</a>
          <a href={`${base}agents/screenshot-styler/SKILL.md`} download="SKILL.md" className="flex items-center gap-1.5 rounded-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Download className="h-3.5 w-3.5" aria-hidden="true" /> Download optional skill
          </a>
        </div>
      </dialog>
    </>
  );
}

import { useMemo, useState } from "react";

function useCopyFeedback() {
  const [copied, setCopied] = useState("");

  const copyText = async (id, text) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    window.setTimeout(() => setCopied(""), 1400);
  };

  return { copied, copyText };
}

function buildReactSnippet({ svgText, preset, controls, scope }) {
  const escaped = svgText
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${")
    .trim();

  return `import { motion } from "motion/react";

const preset = "${preset}";
const controls = ${JSON.stringify(controls, null, 2)};
const scope = "${scope}";

export default function AnimatedLogo() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Replace this wrapper with motion.path/motion.g mapping when customizing */}
      <div dangerouslySetInnerHTML={{ __html: \`${escaped}\` }} />
    </motion.div>
  );
}
`;
}

function buildCssFallbackSnippet({ preset, controls }) {
  const duration = Number(controls.duration || 0.8).toFixed(2);
  const delay = Number(controls.delay || 0).toFixed(2);

  const keyframes = {
    fade: "from { opacity: 0; } to { opacity: 1; }",
    slide: "from { opacity: 0; transform: translate(-24px, 8px); } to { opacity: 1; transform: translate(0, 0); }",
    draw: "from { opacity: 0; stroke-dashoffset: 1000; } to { opacity: 1; stroke-dashoffset: 0; }",
    scale: "0% { opacity: 0; transform: scale(0.7); } 70% { transform: scale(1.04); } 100% { opacity: 1; transform: scale(1); }",
    stagger: "from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); }",
    rotate: "from { opacity: 0; transform: rotate(-25deg) scale(0.88); } to { opacity: 1; transform: rotate(0deg) scale(1); }",
  };

  return `/* CSS fallback for preset: ${preset} */
svg [data-anim-target="true"] {
  animation: svg-${preset} ${duration}s ease-out ${delay}s both;
}

@keyframes svg-${preset} {
  ${keyframes[preset] || keyframes.fade}
}
`;
}

function buildVanillaMotionSnippet({ preset, controls, scope }) {
  return `import { animate, stagger } from "motion";

const preset = "${preset}";
const scope = "${scope}";
const controls = ${JSON.stringify(controls, null, 2)};

const targets = scope === "selected"
  ? document.querySelectorAll('[data-selected-scope="true"]')
  : document.querySelectorAll('[data-anim-target="true"]');

if (preset === "stagger") {
  animate(targets, { opacity: [0, 1], y: [12, 0] }, {
    delay: stagger(0.08),
    type: "spring",
    stiffness: controls.stiffness,
    damping: controls.damping,
    mass: controls.mass
  });
} else {
  animate(targets, { opacity: [0, 1] }, {
    delay: controls.delay,
    duration: controls.duration,
    ease: "ease-out"
  });
}
`;
}

function ExportBox({ title, id, code, copied, onCopy, disabled }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-900">{title}</h3>
        <button
          type="button"
          onClick={() => onCopy(id, code)}
          disabled={disabled}
          className="rounded border border-slate-300 px-2 py-1 text-[11px] text-slate-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {copied === id ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="max-h-36 overflow-auto whitespace-pre-wrap rounded border border-slate-200 bg-white p-2 text-[11px] text-slate-700">
        {code}
      </pre>
    </div>
  );
}

function ExportPanel({ hasSvg, svgText, preset, controls, scope }) {
  const { copied, copyText } = useCopyFeedback();

  const snippets = useMemo(() => {
    const react = buildReactSnippet({ svgText, preset, controls, scope });
    const css = buildCssFallbackSnippet({ preset, controls });
    const vanilla = buildVanillaMotionSnippet({ preset, controls, scope });

    return { react, css, vanilla };
  }, [controls, preset, scope, svgText]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-900">Export</h2>
      <p className="mt-1 text-xs text-slate-600">Copy generated snippets and paste into your project.</p>

      <div className="mt-3 space-y-3">
        <ExportBox
          title="React + Motion"
          id="react"
          code={snippets.react}
          copied={copied}
          onCopy={copyText}
          disabled={!hasSvg}
        />

        <ExportBox
          title="Standalone CSS Fallback"
          id="css"
          code={snippets.css}
          copied={copied}
          onCopy={copyText}
          disabled={!hasSvg}
        />

        <ExportBox
          title="Vanilla JS + Motion"
          id="vanilla"
          code={snippets.vanilla}
          copied={copied}
          onCopy={copyText}
          disabled={!hasSvg}
        />

        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <h3 className="text-xs font-semibold text-slate-900">Setup Instructions</h3>
          <pre className="mt-2 overflow-auto whitespace-pre-wrap rounded border border-slate-200 bg-white p-2 text-[11px] text-slate-700">
{`# Bun
bun add motion

# npm
npm install motion

# Start dev server
bun run dev`}
          </pre>
        </div>
      </div>
    </section>
  );
}

export default ExportPanel;

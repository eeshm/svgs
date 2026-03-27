import { useEffect, useState, type ReactElement } from "react";
import { motion, useAnimate } from "motion/react";
import type { AnimationControlsState, PresetKey, ScopeMode, SvgNode } from "../types";

const SHAPE_TAGS = new Set(["path", "rect", "circle", "ellipse", "line", "polygon", "polyline"]);

const TAG_MAP: Record<string, any> = {
  svg: motion.svg,
  g: motion.g,
  path: motion.path,
  rect: motion.rect,
  circle: motion.circle,
  ellipse: motion.ellipse,
  line: motion.line,
  polygon: motion.polygon,
  polyline: motion.polyline,
};

interface PreviewCanvasProps {
  svgTree: SvgNode | null;
  preset: PresetKey;
  controls: AnimationControlsState;
  selectedLayerId: string | null;
  scope: ScopeMode;
  replayToken: number;
  onReplay: () => void;
}

function toReactPropName(name: string) {
  if (name === "class") return "className";
  if (name.startsWith("data-") || name.startsWith("aria-")) return name;
  return name.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
}

function parseStyle(styleValue: string) {
  return styleValue
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, pair) => {
      const [rawKey, rawValue] = pair.split(":");
      if (!rawKey || !rawValue) return acc;
      acc[toReactPropName(rawKey.trim())] = rawValue.trim();
      return acc;
    }, {});
}

function attrsToProps(attrs: Record<string, string>) {
  return Object.entries(attrs).reduce<Record<string, unknown>>((acc, [key, value]) => {
    if (key === "style") {
      acc.style = parseStyle(value);
      return acc;
    }
    acc[toReactPropName(key)] = value;
    return acc;
  }, {});
}

function getTransition(preset: PresetKey, controls: AnimationControlsState) {
  const spring = {
    type: "spring",
    stiffness: controls.stiffness,
    damping: controls.damping,
    mass: controls.mass,
    delay: controls.delay,
  };

  if (preset === "slide" || preset === "scale" || preset === "rotate" || preset === "stagger") {
    return spring;
  }

  return {
    duration: controls.duration,
    delay: controls.delay,
    ease: "easeOut",
  };
}

function getNodeVariants(preset: PresetKey, tag: string, controls: AnimationControlsState) {
  const transition = getTransition(preset, controls);

  if (preset === "fade") {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition },
    };
  }

  if (preset === "slide") {
    return {
      hidden: { opacity: 0, x: -24, y: 8 },
      visible: { opacity: 1, x: 0, y: 0, transition },
    };
  }

  if (preset === "draw") {
    if (tag === "path") {
      return {
        hidden: { opacity: 0, pathLength: 0 },
        visible: {
          opacity: 1,
          pathLength: 1,
          transition: {
            duration: controls.duration,
            delay: controls.delay,
            ease: "easeInOut",
          },
        },
      };
    }

    if (SHAPE_TAGS.has(tag)) {
      return {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            duration: controls.duration,
            delay: controls.delay,
            ease: "easeOut",
          },
        },
      };
    }

    return {
      hidden: {},
      visible: {},
    };
  }

  if (preset === "scale") {
    return {
      hidden: { opacity: 0, scale: 0.7 },
      visible: { opacity: 1, scale: 1, transition },
    };
  }

  if (preset === "rotate") {
    return {
      hidden: { opacity: 0, rotate: -25, scale: 0.88 },
      visible: { opacity: 1, rotate: 0, scale: 1, transition },
    };
  }

  return {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition },
  };
}

function getContainerVariants(controls: AnimationControlsState) {
  return {
    hidden: {},
    visible: {
      transition: {
        delayChildren: controls.delay,
        staggerChildren: Math.max(0.06, controls.duration * 0.2),
      },
    },
  };
}

function getReplayHidden(preset: PresetKey) {
  if (preset === "fade") return { opacity: 0 };
  if (preset === "slide") return { opacity: 0, x: -24, y: 8 };
  if (preset === "draw") return { opacity: 0 };
  if (preset === "scale") return { opacity: 0, scale: 0.7 };
  if (preset === "rotate") return { opacity: 0, rotate: -25, scale: 0.88 };
  return { opacity: 0, y: 12 };
}

function PreviewCanvas({
  svgTree,
  preset,
  controls,
  selectedLayerId,
  scope,
  replayToken,
  onReplay,
}: PreviewCanvasProps) {
  const [scopeRef, animate] = useAnimate();
  const [renderCycle, setRenderCycle] = useState(0);

  const effectiveScope = scope === "selected" && selectedLayerId ? "selected" : "all";

  useEffect(() => {
    if (!svgTree) return;

    const selector =
      effectiveScope === "selected"
        ? '[data-selected-scope="true"]'
        : '[data-anim-target="true"]';

    const hidden = getReplayHidden(preset);

    Promise.resolve(animate(selector, hidden, { duration: 0 })).finally(() => {
      setRenderCycle((prev) => prev + 1);
    });
  }, [animate, controls, effectiveScope, preset, replayToken, selectedLayerId, svgTree]);

  const renderNode = (node: SvgNode, parentInSelectedScope = false): ReactElement => {
    const MotionTag = TAG_MAP[node.tag] || motion.g;
    const props = attrsToProps(node.attrs || {});
    const isSelectedRoot = node.id === selectedLayerId;
    const inSelectedScope = parentInSelectedScope || isSelectedRoot;

    const shouldAnimate = node.tag !== "svg" && (effectiveScope === "all" || inSelectedScope);

    const shouldUseStaggerContainer =
      preset === "stagger" &&
      (node.tag === "svg" || (effectiveScope === "selected" && isSelectedRoot && node.tag === "g"));

    const variants = shouldUseStaggerContainer
      ? getContainerVariants(controls)
      : shouldAnimate
        ? getNodeVariants(preset, node.tag, controls)
        : undefined;

    const children = (node.children || []).map((child) => renderNode(child, inSelectedScope));

    if (node.tag === "svg") {
      return (
        <MotionTag
          key={node.id}
          {...props}
          className="h-auto max-h-[380px] w-full max-w-[520px]"
          initial={shouldUseStaggerContainer ? "hidden" : false}
          animate={shouldUseStaggerContainer ? "visible" : false}
          variants={variants}
        >
          {children}
        </MotionTag>
      );
    }

    return (
      <MotionTag
        key={node.id}
        {...props}
        data-anim-target="true"
        data-selected-scope={effectiveScope === "selected" && inSelectedScope ? "true" : undefined}
        initial={shouldAnimate ? "hidden" : false}
        animate={shouldAnimate ? "visible" : false}
        variants={variants}
      >
        {children}
      </MotionTag>
    );
  };

  return (
    <section ref={scopeRef} className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Live Preview</h2>
        <button
          type="button"
          onClick={onReplay}
          disabled={!svgTree}
          className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Replay
        </button>
      </div>

      <div className="mt-4 grid min-h-[420px] place-items-center rounded-md border border-slate-100 bg-slate-50 p-4">
        {svgTree ? (
          <div key={renderCycle} className="w-full">
            {renderNode(svgTree)}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Upload an SVG to start previewing animations.</p>
        )}
      </div>
    </section>
  );
}

export default PreviewCanvas;

import { useMemo, useState } from "react";
import UploadArea from "./components/UploadArea";
import LayerPanel from "./components/LayerPanel";
import PreviewCanvas from "./components/PreviewCanvas";
import AnimationControls from "./components/AnimationControls";
import ExportPanel from "./components/ExportPanel";

const ALLOWED_TAGS = new Set([
  "svg",
  "g",
  "path",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polygon",
  "polyline",
]);

const INITIAL_CONTROLS = {
  duration: 0.8,
  delay: 0,
  stiffness: 220,
  damping: 24,
  mass: 1,
};

function attrsToObject(element) {
  return Array.from(element.attributes).reduce((acc, attribute) => {
    acc[attribute.name] = attribute.value;
    return acc;
  }, {});
}

function parseSvgToTree(svgText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");
  const parserError = doc.querySelector("parsererror");

  if (parserError) {
    throw new Error("Invalid SVG file.");
  }

  const root = doc.querySelector("svg");
  if (!root) {
    throw new Error("No <svg> element found.");
  }

  let layerCount = 0;
  const layers = [];

  const visit = (element, path) => {
    const tag = element.tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) {
      return null;
    }

    const attrs = attrsToObject(element);
    const layerId = attrs.id ? `${tag}-${attrs.id}-${path}` : `${tag}-${path}`;
    const node = {
      id: layerId,
      tag,
      attrs,
      children: [],
    };

    if (tag !== "svg") {
      layerCount += 1;
      layers.push({
        id: node.id,
        tag,
        label: attrs.id || `${tag} ${layerCount}`,
      });
    }

    Array.from(element.children).forEach((child, index) => {
      const childNode = visit(child, `${path}-${index}`);
      if (childNode) {
        node.children.push(childNode);
      }
    });

    return node;
  };

  return {
    tree: visit(root, "0"),
    layers,
  };
}

function App() {
  const [fileName, setFileName] = useState("");
  const [svgText, setSvgText] = useState("");
  const [svgTree, setSvgTree] = useState(null);
  const [layers, setLayers] = useState([]);
  const [selectedLayerId, setSelectedLayerId] = useState(null);
  const [preset, setPreset] = useState("fade");
  const [controls, setControls] = useState(INITIAL_CONTROLS);
  const [scope, setScope] = useState("all");
  const [error, setError] = useState("");
  const [replayToken, setReplayToken] = useState(0);

  const hasSvg = useMemo(() => Boolean(svgTree), [svgTree]);

  const handleUpload = (payload, uploadError) => {
    if (uploadError) {
      setError(uploadError);
      return;
    }

    if (!payload) {
      return;
    }

    try {
      const parsed = parseSvgToTree(payload.text);
      setSvgText(payload.text);
      setSvgTree(parsed.tree);
      setLayers(parsed.layers);
      setFileName(payload.fileName);
      setSelectedLayerId(null);
      setScope("all");
      setError("");
      setReplayToken((prev) => prev + 1);
    } catch (parseError) {
      setError(parseError.message);
      setSvgTree(null);
      setLayers([]);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-6">
      <header className="mb-4 md:mb-6">
        <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">SVG Logo Animation Creator</h1>
        <p className="mt-1 text-sm text-slate-600">Upload an SVG, choose a Motion preset, tweak spring values, and export code.</p>
      </header>

      <section className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <UploadArea onUpload={handleUpload} fileName={fileName} error={error} />
          <LayerPanel layers={layers} selectedLayerId={selectedLayerId} onSelectLayer={setSelectedLayerId} />
        </div>

        <PreviewCanvas
          svgTree={svgTree}
          preset={preset}
          controls={controls}
          selectedLayerId={selectedLayerId}
          scope={scope}
          replayToken={replayToken}
          onReplay={() => setReplayToken((prev) => prev + 1)}
        />

        <div className="space-y-4">
          <AnimationControls
            hasSvg={hasSvg}
            preset={preset}
            controls={controls}
            scope={scope}
            selectedLayerId={selectedLayerId}
            onChangePreset={setPreset}
            onChangeControls={setControls}
            onChangeScope={setScope}
            onReplay={() => setReplayToken((prev) => prev + 1)}
          />

          <ExportPanel
            hasSvg={hasSvg}
            svgText={svgText}
            preset={preset}
            controls={controls}
            scope={scope}
          />
        </div>
      </section>
    </main>
  );
}

export default App;

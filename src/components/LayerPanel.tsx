import type { LayerItem } from "../types";

interface LayerPanelProps {
  layers: LayerItem[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
}

function LayerPanel({ layers, selectedLayerId, onSelectLayer }: LayerPanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Layers</h2>
        <span className="text-xs text-slate-500">{layers.length}</span>
      </div>

      <div className="mt-3 max-h-80 space-y-1 overflow-auto pr-1">
        <button
          type="button"
          onClick={() => onSelectLayer(null)}
          className={`w-full rounded-md border px-2 py-1.5 text-left text-xs ${
            selectedLayerId === null
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          Entire SVG
        </button>

        {layers.length === 0 ? (
          <p className="text-xs text-slate-500">Upload an SVG to view layers.</p>
        ) : (
          layers.map((layer) => (
            <button
              type="button"
              key={layer.id}
              onClick={() => onSelectLayer(layer.id)}
              className={`w-full rounded-md border px-2 py-1.5 text-left text-xs ${
                selectedLayerId === layer.id
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="font-medium">{layer.tag}</span>
              <span className="ml-2 opacity-80">{layer.label}</span>
            </button>
          ))
        )}
      </div>
    </section>
  );
}

export default LayerPanel;

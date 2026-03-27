const PRESETS = [
  { value: "fade", label: "Fade In" },
  { value: "slide", label: "Slide In" },
  { value: "draw", label: "Draw / Stroke" },
  { value: "scale", label: "Scale Bounce" },
  { value: "stagger", label: "Stagger" },
  { value: "rotate", label: "Rotate In" },
];

function ControlRow({ label, value, min, max, step, onChange }) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
        <span>{label}</span>
        <span className="font-medium text-slate-900">{value}</span>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-slate-800"
      />
    </label>
  );
}

function AnimationControls({
  hasSvg,
  preset,
  controls,
  scope,
  selectedLayerId,
  onChangePreset,
  onChangeControls,
  onChangeScope,
  onReplay,
}) {
  const disabled = !hasSvg;

  const updateControls = (partial) => {
    onChangeControls((prev) => ({
      ...prev,
      ...partial,
    }));
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-900">Animation Controls</h2>

      <div className="mt-3 space-y-3">
        <label className="block text-xs text-slate-600">
          Preset
          <select
            value={preset}
            onChange={(event) => onChangePreset(event.target.value)}
            disabled={disabled}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-900"
          >
            {PRESETS.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-slate-600">
          Apply To
          <select
            value={scope}
            onChange={(event) => onChangeScope(event.target.value)}
            disabled={disabled}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-900"
          >
            <option value="all">Entire SVG</option>
            <option value="selected" disabled={!selectedLayerId}>
              Selected Layer
            </option>
          </select>
        </label>

        <ControlRow
          label="Duration (s)"
          value={controls.duration}
          min={0.2}
          max={4}
          step={0.1}
          onChange={(value) => updateControls({ duration: value })}
        />
        <ControlRow
          label="Delay (s)"
          value={controls.delay}
          min={0}
          max={2}
          step={0.05}
          onChange={(value) => updateControls({ delay: value })}
        />
        <ControlRow
          label="Stiffness"
          value={controls.stiffness}
          min={50}
          max={500}
          step={10}
          onChange={(value) => updateControls({ stiffness: value })}
        />
        <ControlRow
          label="Damping"
          value={controls.damping}
          min={5}
          max={60}
          step={1}
          onChange={(value) => updateControls({ damping: value })}
        />
        <ControlRow
          label="Mass"
          value={controls.mass}
          min={0.2}
          max={2}
          step={0.1}
          onChange={(value) => updateControls({ mass: value })}
        />

        <button
          type="button"
          onClick={onReplay}
          disabled={disabled}
          className="w-full rounded-md border border-slate-900 bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        >
          Replay Animation
        </button>
      </div>
    </section>
  );
}

export default AnimationControls;

import { useRef, useState } from "react";

function UploadArea({ onUpload, fileName, error }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const readFile = async (file) => {
    const isSvg =
      Boolean(file) && (file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg"));

    if (!isSvg) {
      onUpload(null, "Please upload an SVG file.");
      return;
    }

    const text = await file.text();
    onUpload({ text, fileName: file.name }, null);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setIsDragging(false);
    const [file] = event.dataTransfer.files;
    await readFile(file);
  };

  const handleInput = async (event) => {
    const [file] = event.target.files;
    await readFile(file);
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-900">Upload SVG</h2>
      <p className="mt-1 text-xs text-slate-600">Drag and drop or choose a file.</p>

      <div
        className={`mt-3 rounded-md border border-dashed p-4 text-center transition ${
          isDragging ? "border-slate-500 bg-slate-50" : "border-slate-300"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".svg,image/svg+xml"
          onChange={handleInput}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Choose SVG
        </button>
        {fileName ? <p className="mt-3 text-xs text-slate-700">{fileName}</p> : null}
      </div>

      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
    </section>
  );
}

export default UploadArea;

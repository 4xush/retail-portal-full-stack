import { useCallback, useState } from 'react';

export function ImageUploadZone({
  files,
  onChange,
}: {
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const [drag, setDrag] = useState(false);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDrag(false);
      const list = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
      onChange([...files, ...list]);
    },
    [files, onChange]
  );

  return (
    <div
      className={`rounded-xl border-2 border-dashed p-6 text-center ${drag ? 'border-brand bg-red-50' : 'border-neutral-300'}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
    >
      <p className="text-sm text-neutral-600">Drag images here or</p>
      <label className="mt-2 inline-block cursor-pointer rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">
        Browse
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const list = Array.from(e.target.files ?? []);
            onChange([...files, ...list]);
            e.target.value = '';
          }}
        />
      </label>
      {files.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {files.map((f, i) => (
            <div key={`${f.name}-${i}`} className="relative h-16 w-16 overflow-hidden rounded-lg border">
              <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                className="absolute right-0 top-0 bg-black/60 px-1 text-xs text-white"
                onClick={() => onChange(files.filter((_, j) => j !== i))}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

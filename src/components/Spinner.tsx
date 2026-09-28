export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-gray-500 py-6">
      <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-sm text-gray-500 border border-dashed rounded py-8 text-center">
      {message}
    </div>
  );
}
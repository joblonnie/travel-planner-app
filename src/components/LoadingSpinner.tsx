export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-warm-50/40 backdrop-blur-[2px]">
      <div className="relative w-6 h-6">
        <div className="absolute inset-0 rounded-full bg-warm-100/30 backdrop-blur-md" />
        <div className="w-6 h-6 rounded-full border border-warm-200/60 border-t-primary/40 animate-spin" />
      </div>
    </div>
  );
}

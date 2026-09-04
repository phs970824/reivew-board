type PageLoadingProps = {
  label: string;
};

export function PageLoading({ label }: PageLoadingProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
      <span className="page-spinner" aria-hidden />
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

export default function PortalLoading() {
  return (
    <main className="mx-auto max-w-6xl animate-pulse px-5 py-9 sm:px-8">
      <div className="bg-silver-200 h-6 w-32 rounded-full" />
      <div className="bg-silver-200 mt-5 h-10 w-72 max-w-full rounded-xl" />
      <div className="mt-9 grid gap-5 sm:grid-cols-2">
        {[1, 2, 3, 4].map((item) => (
          <div
            className="border-border h-44 rounded-2xl border bg-white p-5"
            key={item}
          >
            <div className="bg-silver-200 size-10 rounded-xl" />
            <div className="bg-silver-200 mt-5 h-5 w-2/3 rounded" />
            <div className="bg-silver-100 mt-3 h-3 w-full rounded" />
          </div>
        ))}
      </div>
    </main>
  );
}

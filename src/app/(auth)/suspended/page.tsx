export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-sm text-center space-y-4 p-8">
        <h1 className="text-xl font-semibold text-slate-900">Account suspended</h1>
        <p className="text-sm text-slate-500">
          Your account has been deactivated. Please contact the administrator if you believe this is a mistake.
        </p>
      </div>
    </div>
  );
}

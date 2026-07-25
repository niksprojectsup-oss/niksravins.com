export default function AdminLoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12 text-ink">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

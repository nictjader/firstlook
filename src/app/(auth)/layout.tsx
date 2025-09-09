export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4">
      <div className="absolute inset-0 z-0 h-full w-full bg-gradient-to-br from-background via-background to-secondary/20" />
      <div className="absolute left-1/2 top-0 z-[1] h-full w-full max-w-md -translate-x-1/2 bg-white/5 backdrop-blur-3xl" />
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}

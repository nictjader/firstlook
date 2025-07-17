
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
          <p className="font-bold">Admin Section</p>
          <p>This area is for administrative purposes only.</p>
        </div>
        {children}
    </>
  );
}

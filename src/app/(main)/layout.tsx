import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-4 sm:py-6 md:py-8 fade-in">
        {children}
      </main>
      <Footer />
    </div>
  );
}


import { Button } from "../components/ui/button";
import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="rounded-lg border bg-card text-card-foreground w-full max-w-md text-center shadow-2xl">
        <div className="flex flex-col space-y-1.5 p-6">
          <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit mb-4">
            <FileQuestion className="h-16 w-16 text-primary" />
          </div>
          <h3 className="text-4xl font-headline font-semibold leading-none tracking-tight text-primary">404 - Page Not Found</h3>
          <p className="text-lg text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t seem to exist.
          </p>
        </div>
        <div className="p-6 pt-0">
          <p className="text-muted-foreground">
            Perhaps it was moved, deleted, or you mistyped the URL.
            Let&apos;s get you back on track.
          </p>
        </div>
        <div className="flex justify-center items-center p-6 pt-0">
          <Link href="/" passHref>
            <Button>
              Go to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}


"use client"; 

import { useEffect } from "react";
import { Button } from "../components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="rounded-lg border bg-card text-card-foreground w-full max-w-lg text-center shadow-2xl">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-3xl font-headline font-semibold leading-none tracking-tight text-destructive">Oops! Something Went Wrong</h3>
          <p className="text-lg text-muted-foreground">
            We encountered an unexpected issue.
          </p>
        </div>
        <div className="p-6 pt-0">
          <p className="text-muted-foreground mb-2">
            {error.message || "An unknown error occurred."}
          </p>
          {process.env.NODE_ENV === 'development' && error.digest && (
             <p className="text-xs text-muted-foreground">Digest: {error.digest}</p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4 items-center p-6 pt-0">
          <Button
            onClick={
              () => reset()
            }
            variant="destructive"
          >
            Try Again
          </Button>
          <Link href="/" passHref>
            <Button variant="outline">
              Go to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

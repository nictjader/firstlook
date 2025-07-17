
"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-lg text-center shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-destructive">Oops! Something Went Wrong</CardTitle>
          <CardDescription className="text-lg">
            We encountered an unexpected issue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-2">
            {error.message || "An unknown error occurred."}
          </p>
          {process.env.NODE_ENV === 'development' && error.digest && (
             <p className="text-xs text-muted-foreground">Digest: {error.digest}</p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            onClick={
              // Attempt to recover by trying to re-render the segment
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
        </CardFooter>
      </Card>
    </div>
  );
}


"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';


const ToastIcon = ({ variant }: { variant?: 'default' | 'destructive' | 'success' | null }) => {
    switch (variant) {
        case 'success':
            return <CheckCircle className="h-6 w-6 text-white" />;
        case 'destructive':
            return <AlertTriangle className="h-6 w-6 text-white" />;
        default:
            return <Info className="h-6 w-6 text-foreground" />;
    }
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const icon = <ToastIcon variant={variant} />;
        return (
          <Toast key={id} variant={variant} {...props}>
             <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">{icon}</div>
              <div className="grid gap-1 flex-grow">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

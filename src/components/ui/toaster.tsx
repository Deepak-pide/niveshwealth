
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

const CheckmarkIcon = () => (
    <svg className="checkmark-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
        <circle className="checkmark-icon circle" cx="26" cy="26" r="25" fill="none"/>
        <path className="checkmark-icon path" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
    </svg>
);


export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        if (variant === 'success') {
          return (
            <Toast key={id} variant={variant} {...props}>
                <div className="flex flex-col items-center gap-2">
                    <CheckmarkIcon />
                </div>
            </Toast>
          );
        }
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport className={toasts.some(t => t.variant === 'success') ? 'group/success-viewport' : ''} />
    </ToastProvider>
  )
}

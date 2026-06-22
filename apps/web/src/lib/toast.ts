import { sileo, type SileoOptions } from 'sileo';

/**
 * Adapter sobre Sileo con la misma firma que usábamos de sonner (`toast.success('texto')`),
 * para no reescribir cada call site. Sileo recibe un objeto con `title`; acá lo envolvemos.
 */
type ToastOptions = Omit<SileoOptions, 'title' | 'type'>;

/** Auto-cierre por defecto (Sileo sin `duration` queda persistente). Overridable por toast. */
const DEFAULT_DURATION = 4000;

function build(message: string, options?: ToastOptions): SileoOptions {
  return { title: message, duration: DEFAULT_DURATION, ...options };
}

export const toast = {
  success: (message: string, options?: ToastOptions) => sileo.success(build(message, options)),
  error: (message: string, options?: ToastOptions) => sileo.error(build(message, options)),
  warning: (message: string, options?: ToastOptions) => sileo.warning(build(message, options)),
  info: (message: string, options?: ToastOptions) => sileo.info(build(message, options)),
  message: (message: string, options?: ToastOptions) => sileo.show(build(message, options)),
  promise: sileo.promise,
  dismiss: sileo.dismiss,
};

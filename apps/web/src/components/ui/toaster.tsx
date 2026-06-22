import { Toaster as SileoToaster } from 'sileo';

/** Toaster global basado en Sileo: centrado arriba, tema oscuro. */
const Toaster = () => {
  return <SileoToaster position="top-center" theme="dark" />;
};

export { Toaster };

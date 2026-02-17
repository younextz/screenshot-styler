import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { Toaster as Sonner } from '@/components/ui/sonner';
const AllTheProviders = ({ children }: { children: ReactNode }) => {
  return (
    <>
      {children}
      <Sonner />
    </>
  );
};
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });
export * from '@testing-library/react';
export { customRender as render };

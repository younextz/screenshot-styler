import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import FullSizePreview from './FullSizePreview';

beforeEach(() => {
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => 'blob:preview'),
    revokeObjectURL: vi.fn(),
  });
  // jsdom does not implement the native dialog lifecycle.
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value: function (this: HTMLDialogElement) { this.setAttribute('open', ''); },
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value: function (this: HTMLDialogElement) { this.removeAttribute('open'); },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal');
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
});

it.each(['close button', 'Escape', 'backdrop'])('closes via %s, restores focus and scroll, and releases the image', (method) => {
  document.body.style.overflow = 'auto';
  render(<FullSizePreview svgContent="<svg />" sourceRef={createRef<HTMLDivElement>()} />);
  const trigger = screen.getByRole('button', { name: 'Full-size view' });
  fireEvent.click(trigger);
  const dialog = screen.getByRole('dialog', { name: 'Full-size preview' });
  expect(screen.getByRole('img')).toHaveAttribute('src', 'blob:preview');
  expect(document.body.style.overflow).toBe('hidden');

  // Clicking the picture must not dismiss it.
  fireEvent.click(screen.getByRole('img'));
  expect(dialog).toHaveAttribute('open');
  if (method === 'Escape') fireEvent(dialog, new Event('cancel', { cancelable: true }));
  else if (method === 'backdrop') fireEvent.click(dialog);
  else fireEvent.click(screen.getByRole('button', { name: 'Close full-size preview' }));

  expect(dialog).not.toHaveAttribute('open');
  expect(trigger).toHaveFocus();
  expect(document.body.style.overflow).toBe('auto');
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview');
});

it('restores scrolling and releases the preview if removed while open', () => {
  document.body.style.overflow = '';
  const { unmount } = render(<FullSizePreview svgContent="<svg />" sourceRef={createRef<HTMLDivElement>()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Full-size view' }));
  unmount();
  expect(document.body.style.overflow).toBe('');
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview');
});

it('waits for a ready composition before allowing expansion', () => {
  render(<FullSizePreview svgContent="<svg />" sourceRef={createRef<HTMLDivElement>()} disabled />);
  expect(screen.getByRole('button', { name: 'Full-size view' })).toBeDisabled();
  expect(URL.createObjectURL).not.toHaveBeenCalled();
});

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ExportButtons } from './ExportButtons';

describe('ExportButtons', () => {
  it('disables all actions when there is no SVG content', () => {
    render(<ExportButtons svgContent="" onExport={vi.fn()} />);

    expect(screen.getByRole('button', { name: /copy/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /png/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /4k/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /svg/i })).toBeDisabled();
  });

  it.each([
    ['copy', /copy/i, 'copy'],
    ['download', /png/i, 'download'],
    ['download4k', /4k/i, 'download4k'],
    ['downloadSvg', /svg/i, 'downloadSvg'],
  ] as const)('calls the export callback for %s', async (_label, name, exportType) => {
    const onExport = vi.fn().mockResolvedValue(undefined);

    render(<ExportButtons svgContent="<svg />" onExport={onExport} />);

    fireEvent.click(screen.getByRole('button', { name }));

    await waitFor(() => expect(onExport).toHaveBeenCalledWith(exportType));
    cleanup();
  });

  it('re-enables controls after an export settles', async () => {
    let finishExport: () => void = () => undefined;
    const onExport = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishExport = resolve;
        }),
    );

    render(<ExportButtons svgContent="<svg />" onExport={onExport} />);

    const copyButton = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(copyButton);

    expect(copyButton).toBeDisabled();

    finishExport();

    await waitFor(() => expect(copyButton).not.toBeDisabled());
  });
});

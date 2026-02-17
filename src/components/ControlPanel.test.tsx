import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ControlPanel } from './ControlPanel';
describe('ControlPanel', () => {
  it('marks active segmented options with aria-pressed', () => {
    render(
      <ControlPanel
        titleBar="none"
        aspectRatio="16:9"
        animationsEnabled
        onTitleBarChange={vi.fn()}
        onAspectRatioChange={vi.fn()}
        onAnimationsChange={vi.fn()}
        supportsTitleBar
      />,
    );
    expect(screen.getByRole('button', { name: 'Set title bar to None' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Set aspect ratio to 16:9' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
  it('disables unsupported title bar options', () => {
    render(
      <ControlPanel
        titleBar="none"
        aspectRatio="auto"
        animationsEnabled
        onTitleBarChange={vi.fn()}
        onAspectRatioChange={vi.fn()}
        onAnimationsChange={vi.fn()}
        supportsTitleBar={false}
      />,
    );
    expect(screen.getByRole('button', { name: 'Set title bar to macOS' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Set title bar to Windows' })).toBeDisabled();
  });
  it('calls callbacks when controls change', () => {
    const onAspectRatioChange = vi.fn();
    const onTitleBarChange = vi.fn();
    render(
      <ControlPanel
        titleBar="none"
        aspectRatio="auto"
        animationsEnabled
        onTitleBarChange={onTitleBarChange}
        onAspectRatioChange={onAspectRatioChange}
        onAnimationsChange={vi.fn()}
        supportsTitleBar
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Set title bar to macOS' }));
    fireEvent.click(screen.getByRole('button', { name: 'Set aspect ratio to 4:3' }));
    expect(onTitleBarChange).toHaveBeenCalledWith('macos');
    expect(onAspectRatioChange).toHaveBeenCalledWith('4:3');
  });
});

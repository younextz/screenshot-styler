import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ControlPanel } from '../ControlPanel';
import { AspectRatio, TitleBarType } from '@/lib/svgRenderer';

describe('ControlPanel', () => {
  const renderPanel = (
    titleBar: TitleBarType,
    aspect: AspectRatio,
    supportsTitleBar: boolean,
    onTitle = vi.fn(),
    onAspect = vi.fn()
  ) =>
    render(
      <ControlPanel
        titleBar={titleBar}
        aspectRatio={aspect}
        onTitleBarChange={onTitle}
        onAspectRatioChange={onAspect}
        supportsTitleBar={supportsTitleBar}
      />
    );

  it('disables non-none title bars when not supported', () => {
    renderPanel('none', 'auto', false);
    expect(screen.getByTestId('titlebar-macos')).toBeDisabled();
    expect(screen.getByTestId('titlebar-windows')).toBeDisabled();
    expect(screen.getByTestId('titlebar-none')).not.toBeDisabled();
  });

  it('invokes handlers when clicking options', async () => {
    const user = userEvent.setup();
    const onTitle = vi.fn();
    const onAspect = vi.fn();
    renderPanel('none', 'auto', true, onTitle, onAspect);

    await user.click(screen.getByTestId('titlebar-macos'));
    expect(onTitle).toHaveBeenCalledWith('macos');

    await user.click(screen.getByTestId('aspect-16:9'));
    expect(onAspect).toHaveBeenCalledWith('16:9');
  });

  it('reflects selected state via classes', () => {
    renderPanel('windows', '4:3', true);
    expect(screen.getByTestId('titlebar-windows').className).toMatch(/border-primary/);
    expect(screen.getByTestId('aspect-4:3').className).toMatch(/border-primary/);
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PresetPicker } from '../PresetPicker';
import { presets } from '@/lib/presets';

describe('PresetPicker', () => {
  it('renders all presets', () => {
    const onChange = vi.fn();
    render(<PresetPicker selectedId={presets[0].id} onChange={onChange} />);
    presets.forEach((p) => {
      expect(screen.getByTestId(`preset-${p.id}`)).toBeInTheDocument();
    });
  });

  it('calls onChange when a preset is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PresetPicker selectedId={presets[0].id} onChange={onChange} />);

    const target = presets[1];
    await user.click(screen.getByTestId(`preset-${target.id}`));

    expect(onChange).toHaveBeenCalledWith(target.id);
  });

  it('applies selected styles for the active preset', () => {
    const onChange = vi.fn();
    const selected = presets[2].id;
    render(<PresetPicker selectedId={selected} onChange={onChange} />);

    const btn = screen.getByTestId(`preset-${selected}`);
    expect(btn.className).toMatch(/border-primary/);
  });
});

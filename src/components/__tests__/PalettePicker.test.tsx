import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PalettePicker } from '../PalettePicker';
import { palettes } from '@/lib/palettes';

describe('PalettePicker', () => {
  it('renders all palettes', () => {
    const onChange = vi.fn();
    render(<PalettePicker selectedId={palettes[0].id} onChange={onChange} />);
    palettes.forEach((p) => {
      expect(screen.getByTestId(`palette-${p.id}`)).toBeInTheDocument();
    });
  });

  it('calls onChange when a palette is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PalettePicker selectedId={palettes[0].id} onChange={onChange} />);

    const target = palettes[1];
    await user.click(screen.getByTestId(`palette-${target.id}`));

    expect(onChange).toHaveBeenCalledWith(target.id);
  });

  it('applies selected styles for the active palette', () => {
    const onChange = vi.fn();
    const selected = palettes[2].id;
    render(<PalettePicker selectedId={selected} onChange={onChange} />);

    const btn = screen.getByTestId(`palette-${selected}`);
    expect(btn.className).toMatch(/border-primary/);
  });
});

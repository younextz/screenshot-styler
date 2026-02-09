import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';

vi.mock('@/hooks/useTheme', () => ({
  useTheme: vi.fn(),
}));

describe('ThemeToggle', () => {
  it('renders correctly for light theme and toggles', () => {
    const toggle = vi.fn();
    (useTheme as jest.Mock).mockReturnValue({ theme: 'light', toggle });

    render(<ThemeToggle />);

    const button = screen.getByRole('button', { name: /switch to dark theme/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(toggle).toHaveBeenCalledTimes(1);
  });

  it('renders correctly for dark theme and toggles', () => {
    const toggle = vi.fn();
    (useTheme as jest.Mock).mockReturnValue({ theme: 'dark', toggle });

    render(<ThemeToggle />);

    const button = screen.getByRole('button', { name: /switch to light theme/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(toggle).toHaveBeenCalledTimes(1);
  });
});

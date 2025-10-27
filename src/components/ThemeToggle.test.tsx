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

    expect(screen.getByText('Light')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));
    expect(toggle).toHaveBeenCalledTimes(1);
  });

  it('renders correctly for dark theme and toggles', () => {
    const toggle = vi.fn();
    (useTheme as jest.Mock).mockReturnValue({ theme: 'dark', toggle });

    render(<ThemeToggle />);

    expect(screen.getByText('Dark')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));
    expect(toggle).toHaveBeenCalledTimes(1);
  });
});

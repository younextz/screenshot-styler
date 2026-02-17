import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';
vi.mock('@/hooks/useTheme', () => ({
  useTheme: vi.fn(),
}));
describe('ThemeToggle', () => {
  const mockedUseTheme = vi.mocked(useTheme);
  it('renders correctly for light theme and toggles', () => {
    const toggle = vi.fn();
    mockedUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
      toggle,
    });
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: 'Switch to dark theme' });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(toggle).toHaveBeenCalledTimes(1);
  });
  it('renders correctly for dark theme and toggles', () => {
    const toggle = vi.fn();
    mockedUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: vi.fn(),
      toggle,
    });
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: 'Switch to light theme' });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(toggle).toHaveBeenCalledTimes(1);
  });
});

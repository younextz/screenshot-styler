import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import AgentInstructions from './AgentInstructions';

beforeEach(() => {
  vi.stubEnv('BASE_URL', '/ss/');
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); this.dispatchEvent(new Event('close')); };
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

it('opens instructions, provides discovery links, and restores focus when closed', () => {
  render(<AgentInstructions />);
  const trigger = screen.getByRole('button', { name: 'Use with an agent' });
  fireEvent.click(trigger);
  expect(screen.getByRole('dialog', { name: 'Use with an agent' })).toBeVisible();
  expect(screen.getByRole('link', { name: 'Read the agent guide' })).toHaveAttribute('href', '/ss/agents/guide.md');
  expect(screen.getByRole('link', { name: 'Download optional skill' })).toHaveAttribute('download', 'SKILL.md');
  fireEvent.click(screen.getByRole('button', { name: 'Close agent instructions' }));
  expect(trigger).toHaveFocus();
});

it('keeps a selectable prompt when clipboard access is denied', async () => {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } });
  render(<AgentInstructions />);
  fireEvent.click(screen.getByRole('button', { name: 'Use with an agent' }));
  fireEvent.click(screen.getByRole('button', { name: 'Copy prompt' }));
  expect(await screen.findByText('Select and copy the prompt above.')).toBeVisible();
  expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toContain('https://nitk.me/ss/');
});

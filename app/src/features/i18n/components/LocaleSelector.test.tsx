/**
 * LocaleSelector Component Tests - WILL FAIL until component is implemented
 *
 * Created by: Test Agent
 * Date: 2025-10-09
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleSelector } from './LocaleSelector';
import * as useLocaleHook from '../hooks/useLocale';

// Mock useLocale hook
vi.mock('../hooks/useLocale');

describe('LocaleSelector', () => {
  const mockSetLocale = vi.fn();

  beforeEach(() => {
    mockSetLocale.mockClear();
    vi.mocked(useLocaleHook.useLocale).mockReturnValue({
      locale: 'en',
      setLocale: mockSetLocale,
      isChangingLocale: false,
    });
  });

  describe('rendering', () => {
    it('renders the current locale label', () => {
      render(<LocaleSelector />);
      expect(screen.getByText(/english/i)).toBeInTheDocument();
    });

    it('renders the current locale flag', () => {
      render(<LocaleSelector />);
      expect(screen.getByText('🇺🇸')).toBeInTheDocument();
    });

    it('renders Spanish when locale is "es"', () => {
      vi.mocked(useLocaleHook.useLocale).mockReturnValue({
        locale: 'es',
        setLocale: mockSetLocale,
        isChangingLocale: false,
      });
      render(<LocaleSelector />);
      expect(screen.getByText(/español/i)).toBeInTheDocument();
      expect(screen.getByText('🇪🇸')).toBeInTheDocument();
    });
  });

  describe('dropdown interactions', () => {
    it('shows dropdown when clicked', async () => {
      const user = userEvent.setup();
      render(<LocaleSelector />);
      
      const button = screen.getByRole('combobox');
      await user.click(button);
      
      expect(screen.getByText(/español/i)).toBeVisible();
    });

    it('contains both language options in dropdown', async () => {
      const user = userEvent.setup();
      render(<LocaleSelector />);
      
      await user.click(screen.getByRole('combobox'));
      
      expect(screen.getByText(/english/i)).toBeInTheDocument();
      expect(screen.getByText(/español/i)).toBeInTheDocument();
    });

    it('calls setLocale when selecting a language', async () => {
      const user = userEvent.setup();
      render(<LocaleSelector />);
      
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText(/español/i));
      
      expect(mockSetLocale).toHaveBeenCalledWith('es');
    });

    it('closes dropdown after selecting a language', async () => {
      const user = userEvent.setup();
      render(<LocaleSelector />);
      
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText(/español/i));
      
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('closes dropdown when pressing Escape', async () => {
      const user = userEvent.setup();
      render(<LocaleSelector />);
      
      await user.click(screen.getByRole('combobox'));
      await user.keyboard('{Escape}');
      
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has role="combobox" on trigger', () => {
      render(<LocaleSelector />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('has aria-label', () => {
      render(<LocaleSelector />);
      const combobox = screen.getByRole('combobox');
      expect(combobox).toHaveAttribute('aria-label');
    });

    it('is keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<LocaleSelector />);
      
      const combobox = screen.getByRole('combobox');
      combobox.focus();
      expect(combobox).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('shows loading indicator when isChangingLocale is true', () => {
      vi.mocked(useLocaleHook.useLocale).mockReturnValue({
        locale: 'en',
        setLocale: mockSetLocale,
        isChangingLocale: true,
      });
      render(<LocaleSelector />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('disables button when changing locale', () => {
      vi.mocked(useLocaleHook.useLocale).mockReturnValue({
        locale: 'en',
        setLocale: mockSetLocale,
        isChangingLocale: true,
      });
      render(<LocaleSelector />);
      
      expect(screen.getByRole('combobox')).toBeDisabled();
    });
  });

  describe('edge cases', () => {
    it('does not show current locale in dropdown options', async () => {
      const user = userEvent.setup();
      render(<LocaleSelector />);
      
      await user.click(screen.getByRole('combobox'));
      
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(1); // Only Spanish, not English
    });
  });
});

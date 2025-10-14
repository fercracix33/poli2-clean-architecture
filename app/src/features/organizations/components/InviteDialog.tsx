/**
 * InviteDialog Component
 *
 * Dialog to display and copy organization invite code
 * Includes instructions for use
 *
 * Created by: UI/UX Expert Agent
 * Date: 2025-10-10
 * Feature: Organizations UI
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check } from 'lucide-react';

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inviteCode: string;
  organizationSlug: string;
}

export function InviteDialog({
  open,
  onOpenChange,
  inviteCode,
  organizationSlug
}: InviteDialogProps) {
  const t = useTranslations('organization.members.invite');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Invite Code Display */}
          <div className="space-y-2">
            <Label htmlFor="invite-code">{t('codeLabel')}</Label>
            <div className="flex gap-2">
              <Input
                id="invite-code"
                value={inviteCode}
                readOnly
                className="font-mono text-lg"
                data-testid="invite-code-input"
              />
              <Button
                type="button"
                size="icon"
                onClick={handleCopy}
                aria-label={copied ? t('copied') : t('copyCode')}
                data-testid="copy-invite-code-button"
              >
                {copied ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                <span className="sr-only">
                  {copied ? t('copied') : t('copyCode')}
                </span>
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-md bg-muted p-4 space-y-2">
            <h4 className="text-sm font-medium">{t('howToUse')}</h4>
            <p className="text-sm text-muted-foreground">
              {t('instructions')}
            </p>
            <div className="text-xs text-muted-foreground mt-2">
              <span className="font-mono">
                {window.location.origin}/auth/join?org={organizationSlug}&code={inviteCode}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            data-testid="close-invite-dialog"
          >
            {t('close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

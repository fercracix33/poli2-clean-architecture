'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Users } from 'lucide-react';

const joinOrgSchema = z.object({
  inviteCode: z.string()
    .length(8, 'Invite code must be 8 characters')
    .regex(/^[A-Z0-9]+$/, 'Invalid invite code format'),
});

type JoinOrgFormData = z.infer<typeof joinOrgSchema>;

interface JoinOrganizationDialogProps {
  trigger?: React.ReactNode;
}

export function JoinOrganizationDialog({ trigger }: JoinOrganizationDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<JoinOrgFormData>({
    resolver: zodResolver(joinOrgSchema),
    defaultValues: {
      inviteCode: '',
    },
  });

  const joinMutation = useMutation({
    mutationFn: async (data: JoinOrgFormData) => {
      const response = await fetch('/api/organizations/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_code: data.inviteCode }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join organization');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Successfully joined organization!');
      setOpen(false);
      form.reset();
      router.push(`/org/${data.organization.slug}`);
    },
    onError: (error: Error) => {
      toast.error('Failed to join organization', {
        description: error.message,
      });
    },
  });

  const onSubmit = (data: JoinOrgFormData) => {
    joinMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Users className="w-4 h-4 mr-2" />
            Join Organization
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join Organization</DialogTitle>
          <DialogDescription>
            Enter the 8-character invite code to join an existing organization
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="inviteCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invite Code</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="ABC12345"
                      maxLength={8}
                      className="uppercase font-mono text-lg tracking-wider"
                      onChange={(e) => {
                        field.onChange(e.target.value.toUpperCase());
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Ask an organization admin for the invite code
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={joinMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={joinMutation.isPending}
                className="bg-gradient-to-r from-emerald-600 to-teal-600"
              >
                {joinMutation.isPending ? 'Joining...' : 'Join Organization'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

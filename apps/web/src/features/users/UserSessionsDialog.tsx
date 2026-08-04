import { useState } from 'react';
import { toast } from '@/lib/toast';
import { Loader2, Monitor, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { errorMessage } from '@/lib/api-error';
import { useRevokeAllSessions, useRevokeSession, useUserSessions } from './queries';
import type { AdminUser } from './types';

type UserSessionsDialogProps = {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UserSessionsDialog({ user, open, onOpenChange }: UserSessionsDialogProps) {
  const [confirmRevokeAll, setConfirmRevokeAll] = useState(false);

  const { data: sessions = [], isLoading } = useUserSessions(user?.id ?? 0, open && !!user);
  const revokeOne = useRevokeSession(user?.id ?? 0);
  const revokeAll = useRevokeAllSessions(user?.id ?? 0);

  function handleRevokeOne(sessionId: string) {
    revokeOne.mutate(sessionId, {
      onSuccess: () => toast.success('Sesión revocada.'),
      onError: (error) => toast.error(errorMessage(error, 'No pudimos revocar la sesión.')),
    });
  }

  function handleRevokeAll() {
    revokeAll.mutate(undefined, {
      onSuccess: () => {
        toast.success('Todas las sesiones revocadas.');
        setConfirmRevokeAll(false);
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(errorMessage(error, 'No pudimos revocar las sesiones.'));
        setConfirmRevokeAll(false);
      },
    });
  }

  function formatActivity(iso: string) {
    return new Date(iso).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Sesiones de {user?.name ?? '…'}</DialogTitle>
            <DialogDescription>
              Sesiones activas del usuario. Revocar una sesión la cerrará de inmediato.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-80 space-y-3 overflow-y-auto py-1 pr-1">
            {isLoading && (
              <>
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </>
            )}

            {!isLoading && sessions.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No hay sesiones activas.
              </p>
            )}

            {sessions.map((session, idx) => (
              <div key={session.id}>
                {idx > 0 && <Separator />}
                <div className="flex items-start justify-between gap-3 py-2">
                  <div className="flex min-w-0 items-start gap-2">
                    <Monitor className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {session.user_agent}
                        {session.is_current && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            <Shield className="mr-1 size-3" />
                            Actual
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.ip_address ?? 'IP desconocida'} · {formatActivity(session.last_activity)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    disabled={revokeOne.isPending}
                    onClick={() => handleRevokeOne(session.id)}
                  >
                    {revokeOne.isPending ? <Loader2 className="size-3 animate-spin" /> : 'Revocar'}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {!isLoading && sessions.length > 0 && (
            <DialogFooter className="sm:justify-between">
              <Button
                variant="destructive"
                size="sm"
                disabled={revokeAll.isPending}
                onClick={() => setConfirmRevokeAll(true)}
              >
                {revokeAll.isPending && <Loader2 className="size-4 animate-spin" />}
                Revocar todas
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmRevokeAll}
        onOpenChange={setConfirmRevokeAll}
        title="Revocar todas las sesiones"
        description={`¿Cerrar todas las sesiones activas de "${user?.name ?? ''}"? El usuario deberá iniciar sesión nuevamente.`}
        confirmLabel="Revocar todas"
        destructive
        loading={revokeAll.isPending}
        onConfirm={handleRevokeAll}
      />
    </>
  );
}

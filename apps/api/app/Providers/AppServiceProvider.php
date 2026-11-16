<?php

namespace App\Providers;

use App\Models\AuditLog;
use App\Models\User;
use App\Models\WhatsAppMessage;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::define('manage-sales', fn (User $user): bool => $user->isSuperadmin());
        Gate::define('manage-maintenance', fn (User $user): bool => $user->isSuperadmin());
        Gate::define('manage-users', fn (User $user): bool => $user->isSuperadmin());
        Gate::define('view-audit', fn (User $user): bool => $user->isSuperadmin());

        $this->registerAudit();
    }

    /** Auditoría de accesos y envíos (los cambios de datos los registra el trait Auditable). */
    private function registerAudit(): void
    {
        // Login se dispara antes de que el guard fije el usuario → se pasa explícito.
        Event::listen(Login::class, fn (Login $e) => AuditLog::record('login', $e->user, userId: $e->user->getAuthIdentifier()));
        Event::listen(Logout::class, fn (Logout $e) => $e->user
            ? AuditLog::record('logout', $e->user, userId: $e->user->getAuthIdentifier())
            : null);
        // Nunca guardar la contraseña intentada: solo el email.
        Event::listen(Failed::class, fn (Failed $e) => AuditLog::record(
            'login_failed',
            new: ['email' => $e->credentials['Email_User'] ?? null],
        ));

        // Cada mensaje de WhatsApp creado = un envío pedido (recibo, rendición, recordatorios).
        // Los cambios de estado del webhook no se auditan: ya quedan en whatsapp_messages.
        WhatsAppMessage::created(fn (WhatsAppMessage $m) => AuditLog::record(
            'whatsapp.'.$m->type,
            $m,
            new: array_filter($m->only(['recipient_name', 'recipient_phone', 'receipt_id', 'contract_id'])),
        ));
    }
}

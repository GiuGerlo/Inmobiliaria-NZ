<?php
require_once '../config/config.php';
require_once 'includes/head.php';

$stmt = $db->prepare("SELECT email FROM users WHERE id = ?");
$stmt->bind_param('i', $_SESSION['user_id']);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$user_email = $user['email'] ?? '';
$letter     = strtoupper(substr($user_email, 0, 1) ?: 'A');
?>

<div class="nz-page">

    <header class="nz-page-header">
        <div class="nz-page-title">
            <div class="nz-page-title-icon"><i class="fa-solid fa-user-shield"></i></div>
            <div>
                <h1>Mi perfil</h1>
                <p>Datos de tu cuenta y cambio de contraseña</p>
            </div>
        </div>
    </header>

    <div class="nz-profile-grid">
        <!-- Datos cuenta -->
        <section class="nz-card">
            <header class="nz-card-header">
                <h5><i class="fa-solid fa-id-card"></i> Datos</h5>
            </header>
            <div class="nz-card-body">
                <div class="nz-profile-account">
                    <div class="nz-profile-avatar"><?php echo htmlspecialchars($letter); ?></div>
                    <div class="nz-profile-info">
                        <span class="nz-profile-label">Email</span>
                        <span class="nz-profile-email"><?php echo htmlspecialchars($user_email, ENT_QUOTES, 'UTF-8'); ?></span>
                    </div>
                </div>
            </div>
        </section>

        <!-- Cambiar contraseña -->
        <section class="nz-card">
            <header class="nz-card-header">
                <h5><i class="fa-solid fa-key"></i> Cambiar contraseña</h5>
            </header>
            <div class="nz-card-body">
                <form id="formCambiarPassword" autocomplete="off">
                    <?php echo nz_csrf_field(); ?>

                    <div class="nz-field-group" style="margin-bottom: var(--nz-sp-4);">
                        <label for="current_password">Contraseña actual <span class="req">*</span></label>
                        <div class="nz-pw-wrap">
                            <input type="password" class="nz-input" id="current_password" name="current_password" required>
                            <button type="button" class="nz-pw-toggle" data-target="current_password" aria-label="Mostrar contraseña">
                                <i class="fa-solid fa-eye"></i>
                            </button>
                        </div>
                    </div>

                    <div class="nz-field-group" style="margin-bottom: var(--nz-sp-4);">
                        <label for="new_password">Nueva contraseña <span class="req">*</span></label>
                        <div class="nz-pw-wrap">
                            <input type="password" class="nz-input" id="new_password" name="new_password" required minlength="8">
                            <button type="button" class="nz-pw-toggle" data-target="new_password" aria-label="Mostrar contraseña">
                                <i class="fa-solid fa-eye"></i>
                            </button>
                        </div>
                        <div class="nz-field-hint">Mínimo 8 caracteres.</div>
                    </div>

                    <div class="nz-field-group" style="margin-bottom: var(--nz-sp-5);">
                        <label for="confirm_password">Confirmar nueva contraseña <span class="req">*</span></label>
                        <div class="nz-pw-wrap">
                            <input type="password" class="nz-input" id="confirm_password" name="confirm_password" required minlength="8">
                            <button type="button" class="nz-pw-toggle" data-target="confirm_password" aria-label="Mostrar contraseña">
                                <i class="fa-solid fa-eye"></i>
                            </button>
                        </div>
                    </div>

                    <button type="submit" class="nz-btn-sm nz-btn-primary">
                        <i class="fa-solid fa-floppy-disk"></i> Cambiar contraseña
                    </button>
                </form>
            </div>
        </section>
    </div>
</div>

<style>
.nz-profile-grid {
    display: grid;
    grid-template-columns: minmax(280px, 1fr) minmax(320px, 1.4fr);
    gap: var(--nz-sp-5);
    align-items: start;
}
@media (max-width: 860px) {
    .nz-profile-grid { grid-template-columns: 1fr; }
}
.nz-profile-account {
    display: flex;
    align-items: center;
    gap: var(--nz-sp-4);
}
.nz-profile-avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: var(--nz-primary);
    color: white;
    display: grid;
    place-items: center;
    font-size: 1.6rem;
    font-weight: 700;
    flex-shrink: 0;
}
.nz-profile-info { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.nz-profile-label {
    font-size: var(--nz-fs-xs);
    color: var(--nz-text-muted);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .06em;
}
.nz-profile-email {
    font-size: var(--nz-fs-base);
    color: var(--nz-text);
    font-weight: 600;
    word-break: break-all;
}
.nz-pw-wrap { position: relative; }
.nz-pw-wrap .nz-input { padding-right: 42px; }
.nz-pw-toggle {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: 0;
    color: var(--nz-text-muted);
    width: 32px;
    height: 32px;
    border-radius: var(--nz-radius-sm);
    cursor: pointer;
    display: grid;
    place-items: center;
    transition: color var(--nz-transition-fast), background var(--nz-transition-fast);
}
.nz-pw-toggle:hover { color: var(--nz-primary); background: var(--nz-primary-soft); }
</style>

<script>
$(function () {
    // Toggle mostrar/ocultar contraseña
    $('.nz-pw-toggle').on('click', function () {
        const id = $(this).data('target');
        const $input = $('#' + id);
        const $icon = $(this).find('i');
        if ($input.attr('type') === 'password') {
            $input.attr('type', 'text');
            $icon.removeClass('fa-eye').addClass('fa-eye-slash');
        } else {
            $input.attr('type', 'password');
            $icon.removeClass('fa-eye-slash').addClass('fa-eye');
        }
    });

    $('#formCambiarPassword').on('submit', function (e) {
        e.preventDefault();
        const $btn  = $(this).find('button[type=submit]');
        const $form = $(this);

        if ($('#new_password').val() !== $('#confirm_password').val()) {
            Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
            return;
        }

        const btnHtml = $btn.html();
        $btn.prop('disabled', true).html('<i class="fa-solid fa-spinner fa-spin"></i> Procesando...');

        $.ajax({
            url: 'controllers/controller_perfil.php',
            type: 'POST',
            data: $form.serialize(),
            success: function (resp) {
                const data = typeof resp === 'string' ? JSON.parse(resp) : resp;
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Listo',
                        text: data.message || 'Contraseña actualizada',
                        timer: 1600,
                        showConfirmButton: false
                    }).then(() => $form[0].reset());
                } else {
                    Swal.fire('Error', data.message || 'No se pudo cambiar la contraseña', 'error');
                }
            },
            error: function () {
                Swal.fire('Error', 'No se pudo comunicar con el servidor', 'error');
            },
            complete: function () {
                $btn.prop('disabled', false).html(btnHtml);
            }
        });
    });
});
</script>

<?php require_once 'includes/footer.php'; ?>

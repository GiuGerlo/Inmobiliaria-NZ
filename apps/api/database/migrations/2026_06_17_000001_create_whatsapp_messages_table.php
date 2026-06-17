<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Log de envíos por WhatsApp (sub-I). Tabla nueva → naming destino: snake_case inglés.
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('whatsapp_messages')) {
            return;
        }

        Schema::create('whatsapp_messages', function (Blueprint $table) {
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_general_ci';

            $table->id();
            $table->unsignedInteger('receipt_id');
            $table->string('type', 20); // recibo | rendicion
            $table->string('recipient_phone', 20);
            $table->string('meta_message_id', 100)->nullable();
            $table->string('status', 20)->default('queued'); // queued | sent | failed
            $table->text('error')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->unsignedInteger('user_id')->nullable();
            $table->timestamps();

            $table->index(['receipt_id', 'type']);

            $table->foreign('receipt_id')->references('Nro_Recibo')->on('recibo')->cascadeOnDelete();
            $table->foreign('user_id')->references('ID_User')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_messages');
    }
};

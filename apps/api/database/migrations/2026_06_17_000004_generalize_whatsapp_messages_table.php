<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Generaliza whatsapp_messages (sub-J revisado): además de recibos/rendiciones, registra
// recordatorios de texto. receipt_id pasa a nullable; se suman batch, contrato, nombre y body.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('whatsapp_messages', function (Blueprint $table) {
            $table->dropForeign(['receipt_id']);
        });

        Schema::table('whatsapp_messages', function (Blueprint $table) {
            $table->unsignedInteger('receipt_id')->nullable()->change();
            $table->string('batch_id', 40)->nullable()->after('id')->index();
            $table->unsignedSmallInteger('contract_id')->nullable()->after('receipt_id');
            $table->string('recipient_name', 100)->nullable()->after('recipient_phone');
            $table->text('body')->nullable()->after('recipient_name');
        });

        Schema::table('whatsapp_messages', function (Blueprint $table) {
            $table->foreign('receipt_id')->references('Nro_Recibo')->on('recibo')->cascadeOnDelete();
            $table->foreign('contract_id')->references('ID_Contrato')->on('contrato')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('whatsapp_messages', function (Blueprint $table) {
            $table->dropForeign(['contract_id']);
            $table->dropForeign(['receipt_id']);
            $table->dropColumn(['batch_id', 'contract_id', 'recipient_name', 'body']);
        });

        Schema::table('whatsapp_messages', function (Blueprint $table) {
            $table->unsignedInteger('receipt_id')->nullable(false)->change();
            $table->foreign('receipt_id')->references('Nro_Recibo')->on('recibo')->cascadeOnDelete();
        });
    }
};

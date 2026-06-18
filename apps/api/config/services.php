<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // WhatsApp Cloud API oficial (Meta) — envío de recibos/rendiciones (sub-I, ADR-0008).
    'whatsapp' => [
        'token' => env('WHATSAPP_TOKEN'),
        'phone_number_id' => env('WHATSAPP_PHONE_NUMBER_ID'),
        'api_version' => env('WHATSAPP_API_VERSION', 'v21.0'),
        'template_recibo' => env('WHATSAPP_TEMPLATE_RECIBO'),
        'template_rendicion' => env('WHATSAPP_TEMPLATE_RENDICION'),
        // Recordatorios (sub-J): plantillas de solo texto.
        'template_recordatorio_pago' => env('WHATSAPP_TEMPLATE_RECORDATORIO_PAGO'),
        'template_recordatorio_faltante' => env('WHATSAPP_TEMPLATE_RECORDATORIO_FALTANTE'),
        // Idioma por plantilla (Meta exige el código exacto, sin fallback es→es_AR).
        // Defaults: recibo/rendición en es_AR; recordatorios en es. Override por env.
        'template_lang' => env('WHATSAPP_TEMPLATE_LANG', 'es'),
        'template_langs' => [
            'recibo' => env('WHATSAPP_TEMPLATE_RECIBO_LANG', 'es_AR'),
            'rendicion' => env('WHATSAPP_TEMPLATE_RENDICION_LANG', 'es_AR'),
            'recordatorio_pago' => env('WHATSAPP_TEMPLATE_RECORDATORIO_PAGO_LANG', 'es'),
            'recordatorio_faltante' => env('WHATSAPP_TEMPLATE_RECORDATORIO_FALTANTE_LANG', 'es'),
        ],
    ],

];

<?php

use Spatie\LaravelPdf\Caching\DefaultPdfCache;
use Spatie\LaravelPdf\Encryption\DefaultPdfEncrypter;
use Spatie\LaravelPdf\Jobs\GeneratePdfJob;

return [
    /*
     * The default driver to use for PDF generation.
     * Usamos dompdf (PHP puro) — ver ADR-0004. spatie/laravel-pdf soporta otros
     * drivers (browsershot/gotenberg/chrome/weasyprint/cloudflare); si alguna vez se
     * vuelve a un motor Chromium (VPS), re-publicar el config con `vendor:publish`.
     */
    'driver' => env('LARAVEL_PDF_DRIVER', 'dompdf'),

    /*
     * Render caching. When you call `->cache()` on a PDF, the generated
     * content is stored so identical renders are served from the cache.
     *
     * Swap `class` for your own implementation of the PdfCache contract
     * to fully customize how PDFs are keyed, stored, and expired.
     */
    'cache' => [
        'class' => DefaultPdfCache::class,

        /*
         * When set to true, every PDF is cached automatically without having
         * to call `->cache()`. Call `->cache()` or `->dontCache()` on a PDF
         * to override this.
         */
        'automatic' => env('LARAVEL_PDF_CACHE_AUTOMATIC', false),

        /*
         * The cache store to use. Leave null to use the default store.
         */
        'store' => env('LARAVEL_PDF_CACHE_STORE'),

        /*
         * The prefix prepended to every cache key.
         */
        'prefix' => 'laravel-pdf',

        /*
         * The default lifetime in seconds. Leave null to cache forever.
         */
        'ttl' => env('LARAVEL_PDF_CACHE_TTL', 60 * 60 * 24),
    ],

    /*
     * DOMPDF driver configuration.
     *
     * Pure PHP PDF generation — no external binaries required.
     * Requires the dompdf/dompdf package:
     * composer require dompdf/dompdf
     */
    'dompdf' => [
        /*
         * Allow DOMPDF to fetch external resources (images, CSS).
         * Set to true if your HTML references remote URLs.
         */
        'is_remote_enabled' => env('LARAVEL_PDF_DOMPDF_REMOTE_ENABLED', false),

        /*
         * The base path for local file access.
         * Defaults to DOMPDF's built-in chroot setting when null.
         */
        'chroot' => env('LARAVEL_PDF_DOMPDF_CHROOT'),
    ],

    /*
     * The job class used for queued PDF generation.
     * You can replace this with your own class that extends GeneratePdfJob
     * to customize things like $tries, $timeout, $backoff, or default queue.
     */
    'job' => GeneratePdfJob::class,

    /*
     * The class used to encrypt and decrypt password-protected PDFs.
     *
     * More info in our docs:
     * https://spatie.be/docs/laravel-pdf/v2/basic-usage/protecting-pdfs-with-a-password
     */
    'encrypter' => DefaultPdfEncrypter::class,
];

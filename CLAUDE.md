# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Mantener corto.** Este archivo carga al inicio de cada sesión. Detalles vivien en `.claude/rules/` y `docs/`. Si necesitás agregar más de 5 líneas a una sección, mejor creá una regla nueva o ampliá un doc.

## 1. Qué es esto

App de administración de alquileres ("Inmobiliaria NZ") en uso productivo. Estado actual = PHP legacy. **En reformulación completa** a Laravel 12 (API) + React + Vite (SPA) + Docker (PHP 8.5, MariaDB 11.8). Ver `docs/roadmap.md` para fases y estado.

## 2. Stack objetivo

Resumen — detalle completo en `.claude/rules/stack.md`.

- **Backend**: Laravel 12 sobre PHP 8.5, Sanctum (auth SPA), Eloquent, Pest tests.
- **Frontend**: React + Vite + TypeScript, React Query, React Router, shadcn/ui sobre Tailwind, Vitest.
- **DB**: MariaDB 11.8.6.
- **Infra**: Docker Compose (web/php-fpm + nginx + mariadb + phpmyadmin), `.env` por servicio.
- **Legacy**: PHP procedural + dompdf (carpeta `legacy/`). Sigue corriendo hasta que el nuevo lo reemplace por sub-fase.
- **Fusión NZ**: se integra el sitio público de venta `nz-estudio` (PHP vanilla) al monorepo. Target: sumar `apps/public` (Next.js SSG) → `nz-estudiojuridicoinmobiliario.com`; el admin React queda en `admin.nz-...`. Track de 7 fases en `docs/roadmap.md`. Spec `docs/superpowers/specs/2026-06-19-fusion-nz-design.md` + ADR-0009.

## 3. Cómo navegar el repo

- **Reglas que sigue el agente** → `.claude/rules/` (stack, code-style, security, git-workflow, testing, api-conventions, docs-workflow, codegraph).
- **Slash commands del proyecto** → `.claude/commands/` (`/fase-start`, `/fase-close`, `/sync-plan`).
- **Planificación viva** → `docs/roadmap.md` (sub-proyectos A–H + estado).
- **Specs de brainstorming** → `docs/superpowers/specs/`.
- **Planes de implementación** → `docs/plans/`.
- **Decisiones arquitectónicas** → `docs/adr/`.
- **Historial por fase** → `docs/changelog.md`.
- **Operación / deploy** → `docs/runbooks/` (`README-deploy.md` = resumen, `modo-mantenimiento.md`, `fase7-pasos-manuales.md`).
- **Doc del API (OpenAPI)** → autogenerada con Scramble en `http://localhost:8080/docs/api` (solo local).
- **Foto del legacy** → `docs/legacy/snapshot-php.md`.
- **Referencia del sitio público** → `legacy-nz-estudio/` (copia de nz-estudio PHP, sin secretos/uploads/dumps; insumo de la Fusión NZ). Su `.github/` + `docker/` sirven de base para el deploy de Fase 7.

## 4. Flujo de trabajo (resumen)

Detalle en `.claude/rules/git-workflow.md` y `.claude/rules/docs-workflow.md`.

1. Todo cambio creativo arranca con `/brainstorming` → spec en `docs/superpowers/specs/`.
2. Spec aprobado → plan en `docs/plans/` (via skill writing-plans).
3. Una **fase = un commit**. Los commits los hace el **usuario**; el agente sugiere mensaje en formato Conventional (≤50 chars) — ver skill `caveman-commit`.
4. Cerrar fase → actualizar `roadmap.md` + `changelog.md`.
5. Para preguntas estructurales sobre código existente, usar CodeGraph (`codegraph_*`) antes que grep — ver `.claude/rules/codegraph.md`.

## 5. Convenciones rápidas

- Idioma de UI, commits, docs y comentarios técnicos: **español**.
- Variables/funciones/identificadores de código: **inglés**, snake_case en PHP/DB, camelCase en JS/TS, PascalCase en componentes React y modelos Eloquent.
- Nunca commitear `.env`, credenciales, ni `settings.local.json`.
- Antes de tocar la DB de producción, exportar dump a `db/backups/` con fecha.

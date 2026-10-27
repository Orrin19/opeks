# AGENTS.md

Инструкции для ИИ-агентов (и напоминание разработчикам), работающих с этим репозиторием.
Прочитайте этот файл и `docs/README.md` перед внесением изменений.

## О проекте

**Opeks** — Discord-бот на TypeScript + discord.js v14. Утилитарные и ролевые команды,
поиск по Fandom-вики, интеграции с внешними API (OpenRouter/LLM, SauceNAO, trace.moe,
nekos.life). Полное описание — в каталоге `docs/`.

## Стек и жёсткие ограничения версий

- Node.js **24.x** (см. `engines` в `package.json`), TypeScript **5.9.3**, discord.js **^14.27.0**.
- Модульная система — **CommonJS** (`module: commonjs`, `moduleResolution: node`), импорты без расширений.
- **Не обновляйте без явной причины pinned-зависимости:**
  - `sagiri` — `^4.3.0` (5.x — ESM-only, ломает CJS-сборку);
  - `typescript` — `5.9.3` (7.x — нативный компилятор, несовместим с `typescript-eslint`, который требует `<6.1.0`);
  - `trace.moe.ts` — `1.3.10` (новейший dist-tag указывает на пререлиз).
- Не вводите ESM-only зависимости — сборка CommonJS их не соберёт.

## Жёсткие правила

1. **Секреты — только в `.env`** (не в git). Читать их только через `Config` из `src/config/env.ts`.
   Не использовать `process.env` напрямую в командах/сервисах, не логировать и не выводить значения секретов.
   Никогда не показывать содержимое `.env`.
2. **Константы** (ID серверов/пользователей, URL, лимиты, названия ролей/каналов) — в `src/config/constants.ts`.
3. **Архитектура**: команды/парсеры/слушатели — классы, наследующие базовые классы из `src/structures/`.
   Зависимости внедряются через `AppContext` (`{ config, logger, services }`) — без глобальных импортов `config`.
4. **Пользовательский текст бота — на русском**, локализации ru/uk у команд сохранять.
5. Перед завершением прогнать: `npm run lint`, `npm run format:check`, `npm run typecheck`,
   `npm run test`, `npm run build`. Pre-commit хук уже выполняет `npm run build && npm run lint`.
6. Тесты — на встроенном `node:test` (`test/*.test.ts`). Новый тест-раннер не добавлять.

## Быстрые команды

| Действие               | Команда                                   |
| ---------------------- | ----------------------------------------- |
| Установка зависимостей | `npm ci`                                  |
| Запуск (разработка)    | `npm run dev`                             |
| Сборка                 | `npm run build`                           |
| Запуск (прод)          | `npm start`                               |
| Проверка типов         | `npm run typecheck`                       |
| Линт / автофикс        | `npm run lint` / `npm run lint:fix`       |
| Формат / проверка      | `npm run format` / `npm run format:check` |
| Тесты                  | `npm test`                                |
| Релиз                  | `npm run release`                         |

## Версии и релизы

Версия в `package.json` обновляется автоматически через `commit-and-tag-version`
(поддерживаемый форк `standard-version`) на основе conventional-коммитов:

- `fix:` → **patch** (`3.0.0` → `3.0.1`);
- `feat:` → **minor** (`3.0.0` → `3.1.0`);
- `BREAKING CHANGE:` / `feat!:` → **major** (`3.0.0` → `4.0.0`);
- `docs:` / `chore:` / `test:` и пр. — версию не меняют.

Релиз: `npm run release` (или `release:patch` / `release:minor` / `release:major` для
принудительного bump). Скрипт обновляет версию, `CHANGELOG.md` и создаёт git-тег
`vX.Y.Z`. Автозапуск: хук Husky `post-merge` при локальном merge в `master` и GitHub
Actions (`.github/workflows/release.yml`) при merge PR на GitHub.

**Всегда пишите сообщения коммитов в формате `type: описание`** — от этого зависит
корректный bump версии.

## Структура (кратко)

```
src/
├── index.ts        # точка входа: конфиг → DI → регистрация → login
├── config/         # env.ts (валидация .env), constants.ts (константы)
├── core/           # Logger, ClientFactory, AppContext (DI-контекст)
├── structures/     # базовые классы Command / ChatInputCommand / … / TextParser / Listener
├── commands/       # 18 слеш-команд + 1 контекстная (классы)
├── listeners/      # 7 слушателей событий Discord
├── parsers/        # 6 парсеров обычных сообщений
├── services/       # wiki, llm, sauce, traceMoe, nekos + prompts
└── utils/          # random, time, text, embed, discord
```

## Как добавить…

- **команду** — `docs/development.md#добавление-команды`;
- **парсер** / **слушатель** / **сервис** — `docs/development.md`;
- **настройку** — `docs/configuration.md`.

Подробности — в `docs/README.md` и остальных файлах каталога `docs/`.

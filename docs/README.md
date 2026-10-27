# Документация Opeks

**Opeks** — универсальный Discord-бот на TypeScript + discord.js v14. Утилитарные и
ролевые команды, поиск по Fandom-вики, интеграции с внешними API (OpenRouter/LLM,
SauceNAO, trace.moe, nekos.life).

Этот каталог — гайд для разработчиков и ИИ-агентов. Краткие обязательные правила для
агентов собраны в [`AGENTS.md`](../AGENTS.md) в корне репозитория.

## Содержание

| Файл                                 | Описание                                                       |
| ------------------------------------ | -------------------------------------------------------------- |
| [architecture.md](architecture.md)   | Архитектура: слои, DI, базовые классы, поток обработки событий |
| [commands.md](commands.md)           | Каталог команд, парсеров и слушателей                          |
| [services.md](services.md)           | Внешние сервисы (вики, LLM, SauceNAO, trace.moe, nekos.life)   |
| [configuration.md](configuration.md) | Переменные окружения `.env` и константы                        |
| [development.md](development.md)     | Настройка, скрипты, тулинг, рецепты «как добавить…»            |

## Краткая справка

| Аспект            | Значение                                     |
| ----------------- | -------------------------------------------- |
| Язык              | TypeScript (strict)                          |
| Рантайм           | Node.js **24.x**                             |
| Фреймворк         | discord.js **^14.27.0**                      |
| Модульная система | CommonJS (`module: commonjs`)                |
| Менеджер          | npm                                          |
| Линт / формат     | ESLint 10 (+ typescript-eslint) + Prettier 3 |
| Тесты             | встроенный `node:test`                       |
| Git-хуки          | Husky (pre-commit: build + lint)             |

## Начало работы

Пошаговая инструкция по установке и запуску — в [`development.md`](development.md#запуск).

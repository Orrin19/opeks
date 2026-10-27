# Конфигурация и константы

Принцип: **секреты и параметры развёртывания — в `.env`, несекретные «магические»
значения — в `src/config/constants.ts`.** Единственная точка чтения `.env` —
`src/config/env.ts`.

## Переменные окружения (`.env`)

Шаблон — `.env.example`. Загрузка и валидация — `loadConfig()` в `config/env.ts`.

| Ключ                 | Тип             | Обязателен | По умолчанию                                    | Описание                                         |
| -------------------- | --------------- | ---------- | ----------------------------------------------- | ------------------------------------------------ |
| `TOKEN`              | строка          | ✅         | —                                               | токен бота Discord                               |
| `LINE_COLOR`         | число (HEX/dec) | —          | `0xfefefe`                                      | цвет эмбедов                                     |
| `ACTIVITY_NAME`      | строка          | —          | `Opeks`                                         | текст активности                                 |
| `ACTIVITY_TYPE`      | число           | —          | `0`                                             | тип активности (enum Discord)                    |
| `HOSTING`            | строка          | —          | `local`                                         | подпись хостинга в `/about`                      |
| `OPENROUTER_API_KEY` | строка          | —          | —                                               | ключ OpenRouter (нужен для `/wiki` и «Вердикта») |
| `OPENROUTER_URL`     | строка          | —          | `https://openrouter.ai/api/v1/chat/completions` | URL API OpenRouter                               |
| `OPENROUTER_MODEL`   | строка          | —          | `nvidia/nemotron-3-super-120b-a12b:free`        | модель LLM                                       |
| `SAUCE_TOKEN`        | строка          | —          | —                                               | ключ SauceNAO (нужен для `/sauce`)               |
| `LOG_LEVEL`          | enum            | —          | `info`                                          | `debug` \| `info` \| `warn` \| `error`           |

После валидации значения доступны как типизированный `Config` (поля в camelCase):
`token`, `lineColor` (уже число), `activityType` (число), `openRouterApiKey?`,
`openRouterUrl`, `openRouterModel`, `sauceToken?`, `logLevel`.

Команды и сервисы получают `Config` через `ctx.config` и **не читают** `process.env`
напрямую.

## Константы — `src/config/constants.ts`

Сгруппированы по назначению:

| Группа                 | Поля                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `GUILD_IDS`            | `lamoraun`, `stalker`, `emojiSource`                                                                                |
| `USER_IDS`             | `reactionCleanup`, `tushkan`                                                                                        |
| `ROLE_NAMES`           | `novice` («Начинающий»), `tushkan` («Тушкан»), `marsel` («Марсель»)                                                 |
| `CHANNEL_NAMES`        | `checkuser`                                                                                                         |
| `WIKIS`                | `lamoraun`, `stalker` (`{ name, apiBase, articleBase }`)                                                            |
| `SERVER_WIKI_MAP`      | ID сервера → ключ вики                                                                                              |
| URL/прочее             | `PROJECT_URL`, `WIKI_USER_AGENT`, `EIGHTBALL_BASE_URL`, `EIGHTBALL_IMAGE_COUNT`, `RICKROLL_URL`                     |
| Defaults (`DEFAULT_*`) | значения по умолчанию, переопределяемые через `.env`                                                                |
| Лимиты                 | `MS_PER_HOUR`, `CLEAN_LIMIT`, `TIMEOUT_*`, `COLLECTOR_TTL_MS`, `LLM_*`, `DISCORD_CONTENT_LIMIT`, `WIKI_*`, `DICE_*` |

## Как добавить настройку

1. Определите: это **секрет/параметр развёртывания** (→ `.env`) или **стабильная
   несекретная константа** (→ `constants.ts`).
2. Для `.env`: добавьте ключ в `.env.example`, поле в `Config`, чтение/валидацию в
   `loadConfig()` (`config/env.ts`). При наличии дефолта — вынесите его в
   `constants.ts` как `DEFAULT_*`.
3. Для константы: добавьте поле в нужную группу `constants.ts`.
4. Используйте значение через `ctx.config` / импорт из `constants.ts`.

## Безопасность

- `.env` **никогда** не коммитится (см. `.gitignore`) и не выводится.
- Не логируйте секреты: `Logger` не редкактирует сообщения, поэтому не передавайте
  токены/ключи в `logger.*`.
- На хостинге задавайте переменные через панель/окружение платформы, а не файлом `.env`.

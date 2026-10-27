# 03. Конфигурация, ENV и константы

## 1. Цель

- Один источник правды для конфигурации и всех «магических» значений.
- Чувствительные данные — только в ENV, никогда в коде.
- Валидация на старте с понятными сообщениями об ошибках и значениями по умолчанию.

## 2. Новый формат `.env`

Переменные группируются по назначению. Обязательные отмечены `*`.

```properties
# --- Discord ---
TOKEN=*                    # токен бота
CLIENT_ID=                 # ID приложения (для приглашений/команд)

# --- Отображение / статус ---
LINE_COLOR=0xfefefe        # цвет эмбедов (парсится в число)
ACTIVITY_NAME=Opeks        # текст активности
ACTIVITY_TYPE=0            # ActivityType (число), default 0
HOSTING=local              # название хостинга для /about

# --- Внешние API ---
SAUCE_TOKEN=               # SauceNAO
OPENROUTER_API_KEY=        # OpenRouter
OPENROUTER_MODEL=nvidia/nemotron-3-super-120b-a12b:free
OPENROUTER_URL=https://openrouter.ai/api/v1/chat/completions

# --- Сервисные ---
LOG_LEVEL=info
```

### Вынесенные из кода константы (в `config/constants.ts`)

| Текущее место | Значение | Куда |
| --- | --- | --- |
| `Wiki.ts`, `WikiLinks.ts` | `WIKIS` (lamoraun, stalker: apiBase/articleBase) | `constants.ts` → `WIKIS` |
| `Wiki.ts`, `WikiLinks.ts` | `SERVER_WIKI_MAP` (сервер→вики) | `constants.ts` → `SERVER_WIKI_MAP` (или ENV-файл настроек) |
| `Verdict.ts`, `Wiki.ts`, `WikiLinks.ts` | `WIKI_HEADERS` (User-Agent) | `constants.ts` → `WIKI_USER_AGENT` |
| `Eightball.ts` | base URL 8ball-картинок | `constants.ts` → `EIGHTBALL_BASE_URL` |
| `Roll.ts` | Rickroll gif URL | `constants.ts` → `RICKROLL_URL` |
| `guildMemberAdd.ts` | guild `664491015914258452`, роль `Начинающий` | `constants.ts` → `GUILD_IDS`, `ROLE_NAMES` |
| `guildMemberRemove.ts` | канал `checkuser` | `constants.ts` → `CHANNEL_NAMES` |
| `guildMemberUpdate.ts` | роль `Тушкан`, user `410701744872488960` | `constants.ts` → `ROLE_NAMES`, `USER_IDS` |
| `messageReactionAdd.ts` | user `478857385780183041` | `constants.ts` → `USER_IDS` |
| `ReactTrigger.ts` | guild `461757596236382229` | `constants.ts` → `EMOJI_GUILD_ID` |
| `TriggerWords.ts` | набор триггеров | оставить данными, но вынести в `constants` (или JSON) |
| `Marsel.ts`/`Univermag.ts` | роли `Марсель`, `Тушкан`, ключевые фразы | `constants.ts` → `ROLE_TRIGGERS` |

### «Магические числа» → именованные константы

| Значение | Смысл | Имя |
| --- | --- | --- |
| `3.6e6` | час → мс | `MS_PER_HOUR` |
| `100` | лимит bulkDelete | `CLEAN_LIMIT` |
| `168`/`0.1` | лимит таймаута (часы) | `TIMEOUT_MAX_HOURS` / `TIMEOUT_MIN_HOURS` |
| `60000` | время жизни коллектора | `COLLECTOR_TTL_MS` |
| `28000` | лимит промпта LLM | `LLM_MAX_PROMPT_CHARS` |
| `1900` | лимит ответа Discord | `DISCORD_CONTENT_LIMIT` |
| `600`/`800` | обрезка wikitext | `WIKI_SNIPPET_CHARS` |

## 3. Валидация конфигурации

Рекомендация: библиотека **zod** (лёгкая, типы генерируются из схемы — убирает
дублирование `ENV`/`Config`).

```ts
// config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  TOKEN: z.string().min(1),
  LINE_COLOR: z.coerce.number().int().default(0xfefefe),   // парсим один раз
  ACTIVITY_NAME: z.string().default('Opeks'),
  ACTIVITY_TYPE: z.coerce.number().int().default(0),
  HOSTING: z.string().default('local'),
  SAUCE_TOKEN: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().default('nvidia/nemotron-3-super-120b-a12b:free'),
  OPENROUTER_URL: z.url().default('https://openrouter.ai/api/v1/chat/completions'),
  LOG_LEVEL: z.enum(['debug','info','warn','error']).default('info'),
});

export type Config = z.infer<typeof envSchema>;
export const loadConfig = (): Config => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Неверная конфигурация:\n${parsed.error.format()}`);
  }
  return parsed.data;
};
```

Преимущества против текущего `config.ts`:
- `LINE_COLOR`/`ACTIVITY_TYPE` становятся **числами** сразу (убирает `Number(...)` в 10 местах).
- Понятные сообщения при отсутствии ключа (не просто `Missing key X`).
- Значения по умолчанию для необязательных настроек.
- Тип `Config` не дублируется вручную.

> Если не хочется новой зависимости — можно реализовать тот же контракт на чистом TS
> (функция `parseConfig` + сужение типов), но `zod` короче и надёжнее.

## 4. Убрать глобальный `config`-импорт

Сейчас `import config from '../config'` встречается в ~15 файлах. После рефакторинга:
- Конфиг загружается один раз в точке входа и передаётся в сервисы/команды.
- Команды не читают `process.env` напрямую.
- `global.d.ts` (`ProcessEnv`, `declare module '*'`) удаляется/заменяется типом из схемы.

## 5. `.env.example`

Добавить `env.example` (без реальных значений) и обновить README:
- полный список переменных (включая `OPENROUTER_API_KEY`, `SAUCE_TOKEN`),
- пояснение формата `LINE_COLOR` (число/HEX) и `ACTIVITY_TYPE` (enum).

## 6. Безопасность

- Убедиться, что `.env` не попадает в git (уже в `.gitignore`) и в артефакты деплоя.
- Не логировать токены/ключи API (логгер должен редкактировать секреты).
- Секреты передавать через переменные окружения хостинга, а не файл `.env`, где возможно.

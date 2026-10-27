# 04. Хелперы, сервисы, дедупликация, ошибки, логирование

## 1. Утилиты (`utils/`)

### 1.1 `utils/random.ts` (из `commonFunctions.ts`)

- `getRandomInt(min, max)` — инклюзивный диапазон `[min, max]`, устраняет путаницу
  между `Dice` (`getRandomInt(6)+1`) и `Eightball` (`getRandomInt(7)`).
- `pick<T>(arr: T[]): T` — замена `getRandArrElement` (типизированный).
- `pickIndex<T>(arr: T[]): number`.
- `chance(percent: number): boolean` — замена `getRandomInt(100) < chance`.
- Убрать `Array<any>`, двойной `Math.floor`.

### 1.2 `utils/time.ts` (из `commonFunctions.ts`)

- `formatDate(date: Date): string` — переименование `formateDate`.
- `formatDuration(seconds: number): string` — переименование `getTime`, убрать
  `parseInt(input.toString())`.
- `hoursToMs(hours: number)` — вместо `3.6e6`.

### 1.3 `utils/embed.ts`

- `buildEmbed(options)` — фабрика `EmbedBuilder` с заранее подставленным цветом.
- `buildFooter(client)` — подвал (год, иконка бота) без `as`-кастов.
- Заменяет `custom/Embed.ts` (удаляется) и `custom/Footer.ts` (переписывается).

### 1.4 `utils/text.ts`

- `cleanWikitext(raw: string, maxChars: number): string` — единая очистка wikitext
  (сейчас продублирована в `Wiki.ts` и `Verdict.ts`).
- `truncate(text: string, max: number): string` — обрезка с многоточием.

### 1.5 `utils/discord.ts`

- `findRoleByName(guild, name)` — без `as Role`.
- `requireMember(interaction, name)` — возвращает участника или бросает понятную ошибку
  (убирает дублирование проверок «корректный участник»).
- `applyRoleFromText(member, role, text)` — общая логика «выдать/снять роль по слову „не"»
  (дедупликация `Marsel.ts`/`Univermag.ts`).

## 2. Сервисы (`services/`)

### 2.1 `WikiService.ts` (дедупликация п.15-16 аудита)

Единый класс для всех обращений к Fandom:

- `search(query, wikiKey)` → `WikiArticle[]` (поиск + прямое извлечение).
- `resolveLink(raw, wikiKey)` → URL для `[[...]]`.
- `getWikiForGuild(guildId)`.
- Инкапсулирует `WIKIS`, `SERVER_WIKI_MAP`, `WIKI_HEADERS`, `cleanWikitext`.
- Используется в `Wiki.ts`, `WikiLinks.ts`, `Verdict.ts` (убирает 3 копии).

### 2.2 `LlmService.ts` (дедупликация `callLLM`)

- `chat(messages, options)` → строка.
- Хранит `OPENROUTER_URL`, `OPENROUTER_MODEL`, `temperature`, `max_tokens`.
- Обрабатывает ошибки HTTP и пустые ответы единообразно.
- Промпты (`system`-тексты `Verdict`/`Wiki`) выносятся в `constants.ts` или
  в отдельный `services/prompts.ts`.

### 2.3 `SauceService.ts`, `TraceMoeService.ts`, `NekosService.ts`

- Создаются один раз (а не на каждый вызов команды).
- `NekosService` — словарь методов вместо `Map` + `forEach` (прямой dispatch по ключу),
  убирает мёртвый `texts`.

## 3. Обработка ошибок

- Единая обёртка в базовом классе команды: перехват → `logger.error` → ответ
  `ephemeral` «Произошла ошибка…» (сейчас это вручную в `interactionCreate.ts`
  и дублируется в `Verdict`/`Wiki`).
- Не «проглатывать» ошибки: заменить `.catch(console.error)` на `logger.warn/error`
  с контекстом.
- Валидация входных данных до обращения к API (устраняет баг `Sauce.ts` с `contentType`).
- Для «бесконечного» цикла в `Special.ts` — ограничить число итераций и/или вынести
  алгоритм распределения в отдельную чистую функцию с тестами.

## 4. Логирование

- `core/Logger.ts` — обёртка (консоль или `pino`) с уровнями, таймстемпами и контекстом.
- Заменить все `console.log`/`console.error`.
- Редкактировать секреты (токены, ключи) из сообщений.
- Логировать: старт, регистрацию команд, ошибки команд, ошибки внешних API.

## 5. Конкретные исправления по командам (сводно)

| Команда     | Что исправить                                                                    |
| ----------- | -------------------------------------------------------------------------------- |
| `About`     | `import` версий вместо `require`; цвет из конфига-числа.                         |
| `Avatar`    | убрать недостижимый `if (!user)`; использовать `requireMember`.                  |
| `Choice`    | генерировать `option_1..10` циклом/фабрикой опций.                               |
| `Clean`     | `interaction.channel` вместо `cache.find`; проверка прав и лимитов.              |
| `Dice`      | типизировать `result`; единая ветка логики; константа граней.                    |
| `Eightball` | `getRandomInt(0, 6)`; URL в константы.                                           |
| `Nekoslife` | сервис + прямой dispatch; убрать мёртвый `texts`.                                |
| `Roll`      | `return` после ошибки `min > max`; парсить знак модификаторов; константы.        |
| `Rps`       | таблица исходов вместо трёх цепочек `if`.                                        |
| `Sauce`     | починить nullable `contentType`; убрать затенение `imageURL`.                    |
| `Special`   | вынести генерацию в функцию с гарантией выхода; константы распределения.         |
| `Timeout`   | `hoursToMs`; `logger` вместо `.catch(console.log)`.                              |
| `Tracemoe`  | оживить/удалить кнопку; убрать `any` и `as unknown as`; импорт типов без `dist`. |
| `Userinfo`  | `requireMember`; цвет из конфига.                                                |
| `Verdict`   | сервисы Wiki/LLM; промпт в константы; убрать дублирование.                       |
| `Voting`    | фабрика опций; переименовать `rollEmbed`; кнопки вместо эмодзи-реакций (опц.).   |
| `Wiki`      | сервис Wiki/LLM; промпт в константы.                                             |

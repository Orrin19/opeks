# Сервисы

Обёртки над внешними API. Создаются **один раз** в `services/index.ts`
(`createServices(config, logger)`) и переиспользуются всеми командами через
`ctx.services`.

## Состав

```ts
interface Services {
  wiki: WikiService; // Fandom-вики
  llm: LlmService; // OpenRouter (chat completions)
  sauce: SauceService; // SauceNAO
  traceMoe: TraceMoeService; // trace.moe
  nekos: NekosService; // nekos.life
}
```

## WikiService — `services/WikiService.ts`

Единый доступ к настроенным Fandom-вики (объединяет логику, ранее размазанную по
`Wiki`/`WikiLinks`/`Verdict`). Использует `WIKIS`, `SERVER_WIKI_MAP`, `WIKI_USER_AGENT`
из констант и `cleanWikitext`/`truncate` из утилит.

| Метод                                     | Назначение                                    |
| ----------------------------------------- | --------------------------------------------- |
| `getWikiForGuild(guildId)`                | конфиг вики по ID сервера (`SERVER_WIKI_MAP`) |
| `getWiki(key)`                            | конфиг вики по ключу                          |
| `getWikiKeyForGuild(guildId)`             | ключ вики по ID сервера                       |
| `listWikiKeys()`                          | список ключей вики                            |
| `fetchArticle(title, wikiKey, maxChars?)` | статья целиком (очищенный wikitext, обрезка)  |
| `search(query, wikiKey, limit?)`          | прямой + поисковый результат, список статей   |
| `getSnippet(term, wikiKey)`               | короткий сниппет для контекста LLM            |
| `resolveLink(rawLink, wikiKey)`           | `[[Ссылка]]`/интервики → полный URL статьи    |

Тип результата — `WikiArticle { title; content; url; imageUrl? }`.

## LlmService — `services/LlmService.ts`

Тонкий клиент OpenRouter chat-completions. Настройки (`openRouterApiKey`,
`openRouterUrl`, `openRouterModel`) берёт из `Config`.

| Метод                      | Назначение                   |
| -------------------------- | ---------------------------- |
| `chat(messages, options?)` | запрос к LLM → строка ответа |

- `messages: ChatMessage[]` (`{ role, content }`).
- `options: { temperature?; maxTokens? }`.
- Обрезает каждое сообщение до `LLM_MAX_PROMPT_CHARS`.
- Бросает ошибку при отсутствии `OPENROUTER_API_KEY`, не-2xx статусе или пустом ответе.

## SauceService — `services/SauceService.ts`

Обёртка над SauceNAO через `sagiri` (создаётся только при заданном `SAUCE_TOKEN`).

| Член              | Назначение               |
| ----------------- | ------------------------ |
| `get available()` | `true`, если токен задан |
| `search(url)`     | `SauceResult             | null` (первый результат) |

`SauceResult { url; site; similarity; thumbnail; authorName }`.

## TraceMoeService — `services/TraceMoeService.ts`

Обёртка над `trace.moe.ts`.

| Метод              | Назначение      |
| ------------------ | --------------- |
| `fetchAnime(link)` | `SearchResponse | null` (с anilistInfo) |

## NekosService — `services/NekosService.ts`

Обёртка над `nekos.life` с прямым диспетчем по категории (без `Map`/`forEach`).

| Метод                | Назначение                        |
| -------------------- | --------------------------------- |
| `getImage(category)` | `NekosImage { url }` по категории |

Категории перечислены в типе `NekosCategory` (например `meow`, `hug`, `wallpaper`, …).

## Промпты — `services/prompts.ts`

Тексты промптов вынесены из команд, чтобы не засорять бизнес-логику:

- `buildVerdictPrompt({ wikiContext, chatContext, author, content })` — для «Вердикта»;
- `buildWikiPrompt({ wikiName, query, wikiContext })` — для `/wiki`;
- `WIKI_SYSTEM_PROMPT` — системный промпт «отвечай только по-русски».

## Как добавить сервис

1. Создайте `src/services/MyService.ts` — класс с методами и `logger` в конструкторе.
2. Добавьте поле в интерфейс `Services` и создание в `createServices` (`services/index.ts`).
3. При необходимости ре-экспортируйте публичные типы из `services/index.ts`.
4. Используйте через `ctx.services.my` в командах/парсерах.

Сервисы должны создаваться один раз и быть «тонкими» (без форматирования эмбедов —
это задача команды или `utils/embed.ts`).

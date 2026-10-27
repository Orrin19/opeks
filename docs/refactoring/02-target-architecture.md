# 02. Целевая архитектура и SOLID

## 1. Принципы перехода

1. **Методы вместо функций, классы вместо объектов** — команды, парсеры и слушатели
   становятся классами с единым интерфейсом/базовым классом.
2. **SOLID**:
   - **S** — каждый класс отвечает за одну сущность (команда, парсер, сервис).
   - **O** — новая команда/парсер добавляется без изменения реестров и обработчиков.
   - **L** — производные классы полностью взаимозаменяемы с базовым.
   - **I** — узкие интерфейсы (не одна «мега-команда» с тремя run-методами).
   - **D** — зависимости (конфиг, сервисы, логгер) внедряются через конструктор/аргументы,
     а не импортируются глобально из `config`.
3. **Никаких глобальных `config`-импортов внутри команд** — конфиг и сервисы передаются
   как зависимости.
4. **Одна ответственность за внешние API** — обёртки-сервисы (`WikiService`,
   `LlmService`, `SauceService`, `TraceMoeService`, `NekosService`).

## 2. Целевая структура каталогов

```
src/
├── index.ts                      # точка входа (бывший Bot.ts): DI-контейнер, запуск
├── config/
│   ├── env.ts                    # валидация ENV (zod), типизированный Config
│   └── constants.ts              # ID, роли, URL, лимиты, эмодзи, тексты
├── core/
│   ├── ClientFactory.ts          # создание/настройка discord.js Client
│   ├── Logger.ts                 # логгер (обёртка над console или pino)
│   └── ErrorHandler.ts           # единая обработка ошибок команд
├── structures/
│   ├── Command.ts                # абстрактный базовый класс команды
│   ├── ChatInputCommand.ts       # /команды
│   ├── MessageContextCommand.ts  # контекстные команды на сообщениях
│   ├── UserContextCommand.ts     # контекстные команды на пользователях
│   ├── TextParser.ts             # абстрактный класс парсера сообщений
│   └── Listener.ts               # базовый класс слушателя
├── commands/
│   ├── index.ts                  # реестр (инстансы классов)
│   ├── About.ts, Avatar.ts, ...  # по классу на команду
│   └── options/                  # фабрики опций (устраняют дубли option_1..10)
├── listeners/
│   ├── index.ts
│   ├── Ready.ts, InteractionCreate.ts, MessageCreate.ts, ...
├── parsers/
│   ├── index.ts
│   ├── BotQuestion.ts, WikiLinks.ts, ...
│   └── triggers/ (TriggerWord, TriggerWords)
├── services/
│   ├── WikiService.ts            # единый доступ к Fandom-вики
│   ├── LlmService.ts             # OpenRouter (chat completions)
│   ├── SauceService.ts           # SauceNAO
│   ├── TraceMoeService.ts        # trace.moe
│   └── NekosService.ts           # nekos.life
├── utils/
│   ├── random.ts                 # getRandomInt (инклюзивно), pick, shuffle
│   ├── time.ts                   # formatDate, formatDuration
│   ├── embed.ts                  # фабрика EmbedBuilder с цветом/футером
│   ├── discord.ts                # упрощённые проверки (участник, канал, права)
│   └── text.ts                   # очистка wikitext, обрезка строк
└── types/
    └── env.d.ts (или удалить global.d.ts)
```

## 3. Иерархия классов

### Команды

```ts
// structures/Command.ts
abstract class Command {
  abstract readonly name: string;
  abstract readonly type: ApplicationCommandType;
  abstract execute(client: Client, interaction: Interaction): Promise<void>;
  toJSON(): RESTPostAPIApplicationCommandsJSONBody { /* сериализация для регистрации */ }
}

// structures/ChatInputCommand.ts
abstract class ChatInputCommand extends Command {
  abstract readonly description: string;
  readonly descriptionLocalizations?: ...;
  readonly options: ApplicationCommandOptionData[] = [];
  readonly defaultMemberPermissions?: bigint;
  abstract run(client: Client, i: ChatInputCommandInteraction): Promise<void>;
  execute(...) { /* обёртка: defer/ошибки → this.run */ }
}
```

- Сериализация для `commands.set(...)` выносится в `toJSON()`, чтобы один и тот же
  объект был источником и для регистрации, и для обработки.
- Дефер/обработка ошибок инкапсулируются в базовом классе — команды пишут только
  бизнес-логику (устраняет разнобой из `interactionCreate.ts`).

### Парсеры

```ts
abstract class TextParser {
  abstract matches(message: Message, client: Client): boolean;
  abstract run(message: Message, client: Client): Promise<void>;
}
```

### Слушатели

```ts
abstract class Listener {
  abstract readonly event: string;
  abstract run(...args: unknown[]): Promise<void> | void;
}
```

Реестр слушателей регистрирует их в `client.on(event, listener.run.bind(listener))`.

## 4. DI и композиция корня

```ts
// index.ts (псевдокод)
const config = loadConfig(); // zod-валидация, ранний fail-fast
const logger = new Logger(config.logLevel);
const client = createClient(config, logger);

const services = {
  wiki: new WikiService(config.wiki, logger),
  llm: new LlmService(config.openRouter, logger),
  sauce: new SauceService(config.sauceToken, logger),
  traceMoe: new TraceMoeService(logger),
  nekos: new NekosService(logger),
};

registerCommands(client, buildCommands(services));
registerParsers(buildParsers(services));
registerListeners(client, buildListeners(services));

client.login(config.token);
```

- Сервисы создаются один раз и переиспользуются (сейчас `NekoClient`, `TraceMoe`,
  `sagiri` инстанцируются на каждый вызов команды).
- Команды получают сервисы через конструктор — легко тестировать (подмена моков).

## 5. SOLID на примерах

- **S**: `Verdict.ts` сейчас = 234 строки, где смешаны: парсинг текста, поиск по вики,
  вызов LLM, сборка контекста, формирование промпта. После рефакторинга это команда
  - `WikiService` + `LlmService` + `utils/text`.
- **O**: добавление команды = новый класс + одна строка в реестре (или авто-обнаружение).
  Изменение существующих файлов не требуется.
- **I**: убрать «широкий» интерфейс с тремя необязательными `run*` (см. `Command.ts`).
  Вместо него — отдельные классы на каждый тип команды.
- **D**: `config` перестаёт импортироваться напрямую в 15+ файлах; зависимости явные.

## 6. Что удалить / перенести

- `src/custom/Embed.ts` — удалить (мёртвый код), заменить фабрикой `utils/embed.ts`.
- `src/custom/commonFunctions.ts` — разбить на `utils/random.ts` и `utils/time.ts`.
- `src/custom/Footer.ts` — переписать без кастов, вынести в `utils/embed.ts` как
  `buildFooter(client, user)`.
- `global.d.ts` — удалить `declare module '*'`; `ProcessEnv` заменить типизацией из `zod`.
- Хелперы-«роли» (`найти роль по имени`, `выдать/снять по слову «не»`) — в `utils/discord.ts`.

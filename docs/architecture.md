# Архитектура

## Структура каталогов

```
src/
├── index.ts                  # точка входа: конфиг → DI → регистрация → login
├── config/
│   ├── env.ts                # загрузка и валидация .env → типизированный Config
│   └── constants.ts          # несекретные константы (ID, URL, лимиты, роли)
├── core/
│   ├── AppContext.ts         # интерфейс DI-контекста { config, logger, services }
│   ├── ClientFactory.ts      # создание и настройка discord.js Client
│   └── Logger.ts             # логгер с уровнями debug/info/warn/error
├── structures/               # базовые абстрактные классы
│   ├── Command.ts
│   ├── ChatInputCommand.ts
│   ├── MessageContextCommand.ts
│   ├── UserContextCommand.ts
│   ├── TextParser.ts
│   └── Listener.ts
├── commands/                 # по одному классу на команду
│   ├── index.ts              # createCommands(): Map<name, Command>
│   ├── options.ts            # фабрики опций (устраняют дубли option_1..10)
│   └── About.ts, Roll.ts, …  # 19 слеш-команд + 1 контекстная (Verdict)
├── listeners/                # обработчики событий Discord
│   ├── index.ts              # createListeners(): Listener[]
│   ├── Ready.ts, InteractionCreate.ts, MessageCreate.ts, …
├── parsers/                  # реакция на обычные сообщения
│   ├── index.ts              # createParsers(): TextParser[]
│   ├── BotQuestion.ts, WikiLinks.ts, …
│   └── triggers/             # TriggerWord, TriggerWords (реакции-эмодзи)
├── services/                 # обёртки над внешними API
│   ├── index.ts              # createServices(): Services
│   ├── WikiService.ts, LlmService.ts, SauceService.ts,
│   │   TraceMoeService.ts, NekosService.ts
│   └── prompts.ts            # тексты промптов для LLM
└── utils/                    # чистые хелперы
    ├── random.ts             # getRandomInt, pick, pickIndex, chance
    ├── time.ts               # formatDate, formatDuration, hoursToMs
    ├── text.ts               # cleanWikitext, truncate
    ├── embed.ts              # buildFooter
    └── discord.ts            # findRoleByName, findTextChannelByName, applyRoleByText
```

## Точка входа и порядок запуска

`src/index.ts` выполняет bootstrap в строгом порядке:

1. `loadConfig()` — читает и валидирует `.env`, возвращает `Config`.
2. `new Logger(config.logLevel)`.
3. `createClient(config)` — создаёт `Client` (интенты, статус).
4. `createServices(config, logger)` — инстанцирует сервисы **один раз**.
5. Собирается `AppContext = { config, logger, services }`.
6. `createCommands(ctx)` / `createParsers(ctx)` / `createListeners(...)` — реестры классов.
7. `registerListener(client, listener)` для каждого слушателя.
8. `client.login(config.token)`.

Слушатели регистрируются **до** `login`, поэтому `Ready` корректно обрабатывается.

## Слои и ответственность

| Слой          | Файл           | Ответственность                                           |
| ------------- | -------------- | --------------------------------------------------------- |
| `config/`     | `env.ts`       | единственная точка чтения `.env`; типобезопасный `Config` |
|               | `constants.ts` | все несекретные «магические» значения                     |
| `core/`       | —              | логгер, создание клиента, DI-тип                          |
| `structures/` | —              | базовые классы и общая логика (defer, ошибки)             |
| `commands/`   | —              | бизнес-логика слеш- и контекстных команд                  |
| `listeners/`  | —              | тонкие обработчики событий, диспетчеризация               |
| `parsers/`    | —              | реакция на текст сообщений (не команды)                   |
| `services/`   | —              | доступ к внешним API, переиспользуются                    |
| `utils/`      | —              | чистые функции без побочных эффектов                      |

## Базовые классы

### `Command` (абстрактный)

```ts
abstract class Command {
  abstract readonly name: string;
  abstract toJSON(): ApplicationCommandData; // данные для регистрации
  abstract execute(interaction: Interaction, logger: Logger): Promise<void>;
}
```

Команда сама владеет и данными регистрации (`toJSON`), и логикой выполнения (`execute`).

### `ChatInputCommand extends Command`

```ts
abstract class ChatInputCommand extends Command {
  readonly type = ApplicationCommandType.ChatInput;
  abstract readonly description: string;
  readonly descriptionLocalizations?: LocalizationMap;
  readonly options?: ApplicationCommandOptionData[];
  readonly defaultMemberPermissions?: bigint;

  abstract run(interaction: ChatInputCommandInteraction): Promise<void>;

  async execute(interaction, logger) {
    if (!interaction.isChatInputCommand()) return;
    try { await interaction.deferReply(); }          // «Unknown interaction» не роняет бота
    catch (e) { logger.warn(...); return; }
    try { await this.run(interaction); }
    catch (e) { logger.error(...); await interaction.editReply({...}).catch(() => {}); }
  }
}
```

Команда пишет только `run`; defer и обработка ошибок — в базовом классе. Ответ команде
отправляется через `interaction.followUp(...)` (после defer) или `editReply(...)`.

### `MessageContextCommand` / `UserContextCommand extends Command`

Аналогичны, но `run` принимает соответствующий тип interaction и сам решает про defer
(см. `Verdict`, который делает `deferReply({ ephemeral: true })`).

### `TextParser` (абстрактный)

```ts
abstract class TextParser {
  abstract matches(message: Message): boolean;
  abstract run(message: Message): void | Promise<void>;
}
```

Парсеры перебираются в `MessageCreateListener`: для каждого сообщения вызываются все
`matches`, и при совпадении — `run`.

### `Listener` (абстрактный) и регистрация

```ts
abstract class Listener {
  abstract readonly event: Events;
  abstract run(...args: unknown[]): void | Promise<void>;
}
```

`registerListener(client, listener)` подписывает слушателя на `listener.event` и оборачивает
вызов `run` в глобальную защиту от необработанных rejection — ошибка слушателя не роняет процесс.

## Внедрение зависимостей (DI)

Единый контекст передаётся командам/парсерам/сервисам через конструктор:

```ts
interface AppContext {
  config: Config; // настройки из .env
  logger: Logger; // логгер
  services: Services; // wiki, llm, sauce, traceMoe, nekos
}
```

- Глобального импорта `config` нет; команды не читают `process.env` напрямую.
- Сервисы создаются один раз (`createServices`) и переиспользуются всеми командами.

## Поток обработки слеш-команды

```
InteractionCreate (Discord)
  → InteractionCreateListener.run
    → commands.get(interaction.commandName)
    → command.execute(interaction, logger)
      → isChatInputCommand() → deferReply()
      → run(interaction)          # бизнес-логика, followUp/editReply
```

Поток обработки сообщения:

```
MessageCreate (Discord)
  → MessageCreateListener.run (пропускает ботов)
    → для каждого TextParser: matches(message) → run(message)
```

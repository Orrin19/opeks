# Разработка

## Требования

- Node.js **24.x** (см. `engines` в `package.json`).
- npm.

## Запуск

```bash
npm ci          # установка зависимостей
cp .env.example .env   # и заполните своими значениями
npm run dev     # запуск через ts-node (разработка)
```

Для продакшена:

```bash
npm run build   # компиляция TypeScript → dist/
npm start       # node dist/index.js
```

## Скрипты (`npm run <script>`)

| Скрипт         | Команда                                          | Назначение                          |
| -------------- | ------------------------------------------------ | ----------------------------------- |
| `dev`          | `ts-node src/index.ts`                           | запуск без сборки                   |
| `build`        | `tsc`                                            | сборка в `dist/`                    |
| `start`        | `node dist/index.js`                             | запуск собранного кода              |
| `typecheck`    | `tsc --noEmit`                                   | проверка типов                      |
| `lint`         | `eslint .`                                       | линт                                |
| `lint:fix`     | `eslint . --fix`                                 | линт + автофикс                     |
| `format`       | `prettier --write .`                             | форматирование                      |
| `format:check` | `prettier --check .`                             | проверка форматирования             |
| `test`         | `tsc -p tsconfig.test.json && node --test "..."` | юнит-тесты на `node:test`           |
| `prepare`      | `husky`                                          | установка git-хуков (автоматически) |

## Линт и формат

- **ESLint 10** (flat config `eslint.config.mjs`) + `typescript-eslint` + `eslint-config-prettier`.
- **Prettier 3** (`.prettierrc`): `singleQuote`, `trailingComma: all`, `printWidth: 100`,
  `endOfLine: lf`.
- Соглашения: запрещён `any` (warn), неиспользуемые переменные (warn; игнор `_`-префикса),
  `console` разрешён только для `warn`/`error` (в `Logger` — полностью).

## Тесты

Юнит-тесты на встроенном `node:test` лежат в `test/*.test.ts` и покрывают чистые функции
`utils/` (`random`, `text`, `time`). Тесты компилируются отдельной конфигурацией
`tsconfig.test.json` в `.test-dist/`.

Новые чистые функции (утилиты, парсинг, генерация) должны сопровождаться тестами.

## Git-хуки (Husky)

Pre-commit хук (`.husky/pre-commit`) выполняет `npm run build && npm run lint`.
Не коммитьте код, не проходящий сборку и линт.

## Рецепты «как добавить…»

### Команду (слеш)

1. Создайте `src/commands/MyCommand.ts`:
   ```ts
   export class MyCommand extends ChatInputCommand {
     readonly name = 'my';
     readonly description = '...';
     constructor(private readonly ctx: AppContext) {
       super();
     }
     async run(interaction: ChatInputCommandInteraction): Promise<void> {
       await interaction.followUp({ content: '...' });
     }
   }
   ```
   - `run` пишет бизнес-логику; defer и ошибки — в базовом классе.
   - Ответ — через `followUp` (после defer) или `editReply`.
   - Зависимости — через `ctx` (или без конструктора, если не нужны).
2. Зарегистрируйте в `src/commands/index.ts` (`new MyCommand(ctx)` в `createCommands`).
3. Локализации `descriptionLocalizations`/`nameLocalizations` (ru/uk) сохраняйте.

### Команду (контекстное меню)

Наследуйте `MessageContextCommand`/`UserContextCommand`; defer (`ephemeral`) делайте в
`run`, ответ — `editReply`. Пример — `Verdict.ts`.

### Парсер

1. Создайте `src/parsers/MyParser.ts`: класс-наследник `TextParser` с `matches` и `run`.
2. Добавьте в `createParsers` (`src/parsers/index.ts`). Порядок = порядок перебора.

### Слушатель

1. Создайте `src/listeners/MyListener.ts`: класс-наследник `Listener` (`event` + `run`).
2. Добавьте в `createListeners` (`src/listeners/index.ts`).

### Сервис

См. [services.md](services.md#как-добавить-сервис).

## Деплой

- `Procfile`: `worker: npm ci && npm run build && npm start`.
- `amvera.yml`: собирает через `additionalCommands: 'npm run build'`, запускает
  `dist/index.js` (`command: npm start`).

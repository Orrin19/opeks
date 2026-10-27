# 05. Инструментарий: сборка, tsconfig, линтер, package.json

## 1. Сборка и запуск

Сейчас прод запускается через `ts-node` (`npm start` → `ts-node src/Bot.ts`), что:

- компилирует на лету (медленный старт, выше потребление памяти),
- требует `typescript`/`ts-node` в продакшн-зависимостях.

**Цель** — компилировать в `dist/` и запускать JS:

```jsonc
// package.json
{
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "lint": "eslint . --ext .ts",
    "format": "prettier --write \"src/**/*.ts\"",
    "typecheck": "tsc --noEmit",
  },
}
```

`Procfile`: `worker: npm ci && npm run build && npm start`.
`amvera.yml`: `command: npm start` (после сборки), `scriptName` → `dist/index.js`.

## 2. `tsconfig.json`

Предложения:

- Явно задать модульный режим: либо добавить `"type": "module"` в `package.json` и
  использовать ESM (тогда импорты через `.js`-расширения), либо зафиксировать
  `module: "commonjs"`. Сейчас `nodenext` без `"type"` — неоднозначно.
- Добавить строгость: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`,
  `noImplicitReturns`.
- Убрать `files: ["src/Bot.ts"]` (достаточно `include`), согласовать `rootDir`/`outDir`.
- Включить `declaration: false`, `sourceMap: true` (для отладки в проде) по желанию.

## 3. `package.json`

| Проблема                                                               | Исправление                                                  |
| ---------------------------------------------------------------------- | ------------------------------------------------------------ |
| `"opeks": "file:"` (зависимость на себя)                               | удалить                                                      |
| `@types/node`, `@types/gaussian`, `@types/superagent` в `dependencies` | перенести в `devDependencies`                                |
| `typescript`, `ts-node` в `dependencies`                               | `typescript` → dev; `ts-node` → dev (нужен только для `dev`) |
| нет `build`/`lint`/`format`                                            | добавить (см. выше)                                          |
| `main: "src/Bot.ts"`                                                   | `main: "dist/index.js"`                                      |

Итоговые зависимости:

- **dependencies**: `discord.js`, `dotenv` (или убрать в пользу node `--env-file`),
  `nekos.life`, `sagiri`, `trace.moe.ts`, `gaussian`, `zod` (опц.).
- **devDependencies**: `typescript`, `ts-node`, `@types/*`, `eslint`, `prettier`,
  `@typescript-eslint/*`.

## 4. Линтер и форматтер

- ESLint + `@typescript-eslint` + `eslint-config-prettier`.
- Prettier с единым стилем (2 пробела, одинарные кавычки, trailing comma).
- Правила: запрет `any` (или только с обоснованием), запрет non-null `!` без проверки,
  запрет `require`, `@typescript-eslint/no-unused-vars`.
- Опционально: `eslint-plugin-import/order` для консистентных импортов.

## 5. Типы и `global.d.ts`

- Удалить `declare module '*'` (маскирует отсутствующие типы).
- `ProcessEnv` заменить типом из `zod`-схемы (см. [03](03-config-constants.md)).
- Для `trace.moe.ts` проверить экспорт типов из корня пакета, чтобы не импортировать
  из `dist/structures/...`.

## 6. Тесты

- Минимально: юнит-тесты на чистые функции (`utils/random`, `utils/time`,
  `utils/text`, распределение `Special`, парсинг модификаторов `Roll`).
- Раннер: `vitest` или `jest` + `ts-jest`.
- Сервисы тестировать с моками `fetch`.

## 7. Контрольный список завершения тулинга

- [ ] `npm run build` собирает проект без ошибок.
- [ ] `npm run lint` и `npm run format` проходят чисто.
- [ ] `npm start` запускает скомпилированный код.
- [ ] `.env.example` присутствует, `.env` в `.gitignore`.
- [ ] `global.d.ts` очищен от `declare module '*'`.
- [ ] CI (при наличии) выполняет `lint` + `typecheck` + `test`.

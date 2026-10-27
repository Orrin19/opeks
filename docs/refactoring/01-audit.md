# 01. Аудит текущего состояния

## 1. Обзор структуры

```
opeks/
├── assets/8ball/               # 0.png..6.png (картинки для /8ball)
├── src/
│   ├── Bot.ts                  # точка входа: создание Client, регистрация слушателей
│   ├── config.ts               # загрузка и валидация .env
│   ├── commands/
│   │   ├── Command.ts          # типы команд (union)
│   │   ├── Commands.ts         # ручной реестр всех команд
│   │   └── storage/            # 19 команд (объекты)
│   ├── custom/
│   │   ├── commonFunctions.ts  # утилиты (дата/время/рандом)
│   │   ├── Embed.ts            # ⚠️ мёртвый код (нигде не импортируется)
│   │   └── Footer.ts           # класс подвала эмбеда
│   ├── listeners/              # 7 слушателей (функции)
│   └── parsers/
│       ├── TextParser.ts       # интерфейс парсера сообщений
│       ├── Parsers.ts          # реестр парсеров
│       ├── triggers/           # TriggerWord, TriggerWords
│       └── storage/            # 6 парсеров (объекты)
├── .env                        # (не в git) реальные секреты
├── global.d.ts                 # declare module '*' + ProcessEnv
├── amvera.yml, Procfile        # конфиги деплоя
└── package.json, tsconfig.json
```

Запуск: `npm start` → `ts-node src/Bot.ts`. Билд отсутствует, деплой компилирует
на лету через `ts-node` (см. [05-tooling.md](05-tooling.md)).

## 2. Реестр проблем

Легенда приоритетов: 🔴 критично · 🟠 важно · 🟡 желательно.

### 2.1 Конфигурация и ENV

| # | Приоритет | Проблема | Где |
| --- | --- | --- | --- |
| 1 | 🟠 | `config.ts` дублирует интерфейс `ENV` и `Config` (поля идентичны, отличается только `undefined`). Можно заменить одним типом + утилитой проверки. | `src/config.ts:11-29` |
| 2 | 🟠 | `getSanitzedConfig` (опечатка «Sanitzed») полагается на `Object.entries` + `as Config`, без типобезопасного сужения. | `src/config.ts:51-58` |
| 3 | 🔴 | `global.d.ts` объявляет `ProcessEnv` с `SAUCE_TOKEN`, но **без `OPENROUTER_API_KEY`** — рассинхрон с `config.ts` (где оба ключа). Один источник правды отсутствует. | `global.d.ts:2-10` |
| 4 | 🟠 | `Number(config.LINE_COLOR)` и `Number(config.ACTIVITY_TYPE)` вызываются повторно в ~10 местах. Значения надо парсить один раз в конфиге и хранить как число. | `src/custom/Embed.ts`, все команды с `color` |
| 5 | 🟡 | Нет значений по умолчанию для необязательных настроек (`LINE_COLOR`, `ACTIVITY_TYPE`, `HOSTING`). Сбой происходит только при полном отсутствии ключа. | `src/config.ts` |
| 6 | 🟡 | Путь к `.env` захардкожен (`path.resolve(__dirname, '../.env')`) и зависит от положения файла после сборки. | `src/config.ts:5` |
| 7 | 🟡 | Нет `.env.example`; README описывает только 5 переменных и **не упоминает** `OPENROUTER_API_KEY` и `SAUCE_TOKEN`. | корень, `README.md:40-46` |
| 8 | 🟠 | `dotenv` + ручная типизация вместо валидационной схемы (например, `zod`). Отсутствует валидация формата (`ACTIVITY_TYPE` — число, `LINE_COLOR` — HEX). | `src/config.ts` |

### 2.2 Захардкоженные чувствительные данные и константы

| # | Приоритет | Значение | Где |
| --- | --- | --- | --- |
| 9 | 🔴 | ID пользователей/серверов: `478857385780183041`, `664491015914258452`, `410837371299561473`, `461757596236382229`, `410701744872488960`, `664491015914258460`. | `messageReactionAdd.ts`, `guildMemberAdd.ts`, `guildMemberUpdate.ts`, `ReactTrigger.ts`, `Wiki.ts`, `WikiLinks.ts`, `Roll.ts` |
| 10 | 🔴 | Имена ролей/каналов: `Начинающий`, `checkuser`, `Тушкан`, `Марсель`. | `guildMemberAdd.ts`, `guildMemberRemove.ts`, `guildMemberUpdate.ts`, `Marsel.ts`, `Univermag.ts` |
| 11 | 🔴 | URL: OpenRouter API, `lamoraun.fandom.com`, `stalker.fandom.com`, raw.githubusercontent (8ball), Rickroll gif. | `Verdict.ts`, `Wiki.ts`, `WikiLinks.ts`, `Eightball.ts`, `Roll.ts` |
| 12 | 🔴 | Модель LLM `nvidia/nemotron-3-super-120b-a12b:free`, `max_tokens: 2048`, `temperature` — продублированы и захардкожены. | `Verdict.ts:116-120`, `Wiki.ts:163-173` |
| 13 | 🟠 | `User-Agent: OpeksBot/1.0 (https://github.com/Orrin19/opeks)` — продублирован. | `Verdict.ts`, `Wiki.ts`, `WikiLinks.ts` |
| 14 | 🟡 | Магические числа: `3.6e6` (часы→мс), лимиты `100`, `168`, `0.1`, `60000`, `28000`, `1900`, `600`, `800`. | `Timeout.ts`, `Clean.ts`, `Tracemoe.ts`, `Verdict.ts`, `Wiki.ts`, `Special.ts` |

### 2.3 Дублирование

| # | Приоритет | Проблема | Где |
| --- | --- | --- | --- |
| 15 | 🔴 | `callLLM` продублирован (с отличиями: системный промпт, `temperature`, закомментированная обрезка). | `Verdict.ts:96-129`, `Wiki.ts:144-183` |
| 16 | 🔴 | Доступ к Fandom-вики (конфиг `WIKIS`, `SERVER_WIKI_MAP`, `WIKI_HEADERS`, `fetch`, чистка wikitext) — в 3 местах. | `Wiki.ts`, `WikiLinks.ts`, `Verdict.ts` |
| 17 | 🟠 | Опции `option_1..option_10` (10 почти одинаковых объектов) продублированы. | `Choice.ts`, `Voting.ts` |
| 18 | 🟠 | Логика «найти роль по имени и добавить/убрать в зависимости от „не"» продублирована. | `Marsel.ts`, `Univermag.ts` |
| 19 | 🟠 | Проверка «корректный участник» + ephemeral-ответ продублирована. | `Avatar.ts`, `Timeout.ts`, `Userinfo.ts` |
| 20 | 🟡 | Ручной реестр команд — можно генерировать из файлов/декораторов. | `Commands.ts`, `Parsers.ts` |

### 2.4 Баги и слабые места в логике

| # | Приоритет | Проблема | Где |
| --- | --- | --- | --- |
| 21 | 🔴 | `Sauce.ts`: `attachment.contentType?.split('/')[0] !== 'image'` — если `contentType` отсутствует, `?.` даст `undefined`, затем `attachment.contentType.includes(...)` упадёт с TypeError. Плюс двойное объявление `let imageURL` (затенение). | `Sauce.ts:49-73` |
| 22 | 🟠 | `Roll.ts`: при `min > max` выводится ошибка, но код продолжает работу и считает `getRandomInt(max - min + 1)` с отрицательным аргументом. Модификаторы объявлены «со знаком», но парсится только сложение; `break` молча обрезает остаток. | `Roll.ts:66-72, 90-98` |
| 23 | 🟠 | `Special.ts`: `while`-цикл генерации характеристик без гарантии выхода (потенциальный бесконечный цикл), магические числа (`mean`, `variance 4`, диапазоны очков). | `Special.ts:147-158` |
| 24 | 🟠 | `Nekoslife.ts`: `Map` строится на каждый вызов команды; `images.forEach(async ...)` — «fire-and-forget» без `await`, `texts` — мёртвый код. | `Nekoslife.ts:60-113` |
| 25 | 🟠 | `Tracemoe.ts`: кнопка `videoButton` создаётся, но `components` закомментированы — коллектор на сообщении без компонентов (мёртвый код). Глубокий импорт `trace.moe.ts/dist/...`, `filter = (i: any)`, `episode as unknown as string`. | `Tracemoe.ts:80-114` |
| 26 | 🟠 | `Clean.ts`: канал ищется через `interaction.guild.channels.cache.find` вместо `interaction.channel`; `bulkDelete` без проверки прав/типа канала. | `Clean.ts:43-46` |
| 27 | 🟡 | `Avatar.ts`: опция `required: true`, но затем проверка `if (!user)` — недостижимый код. | `Avatar.ts:32-40` |
| 28 | 🟡 | `About.ts`: `require('../../../package.json')` — лучше `import` (включён `resolveJsonModule`) или чтение версий через `process`. | `About.ts:6,36-38` |
| 29 | 🟡 | `Dice.ts`: `let result` без типа; массив `dices` с `null` в индексе 0; две ветки для одного и многих кубиков дублируют логику. | `Dice.ts:41-69` |
| 30 | 🟡 | `ready.ts`: подписка на событие строкой `'clientReady'`. В discord.js v14.27 событие действительно называется `clientReady` (enum `Events.ClientReady = 'clientReady'`), поэтому подписка корректна. Рекомендация — использовать `Events.ClientReady` вместо магической строки. | `ready.ts:5` |
| 31 | 🟡 | `messageReactionAdd.ts`: сравнение `[null, 1].includes(reaction.count)` — хрупкая проверка частичных реакций. | `messageReactionAdd.ts:10-15` |

### 2.5 Типобезопасность и стиль

| # | Приоритет | Проблема | Где |
| --- | --- | --- | --- |
| 32 | 🟠 | Обильные `as`-касты и non-null assertion `!`, маскирующие `null`/`undefined` (`client.user as Discord.User`, `(channel as Discord.TextChannel)`, `attachment!.url`). | повсеместно |
| 33 | 🟠 | `commonFunctions.ts`: `Array<any>`, `getRandomInt` с `Math.floor(Math.random() * Math.floor(max))` (двойной `floor`, неинклюзивный максимум — разная трактовка в `Dice`/`Eightball`). | `commonFunctions.ts:21-27` |
| 34 | 🟡 | Опечатки/нейминг: `formateDate` (format), `getSanitzedConfig`, переменная `rollEmbed` в `Voting.ts`, имя команды `Standart`. | повсеместно |
| 35 | 🟡 | `Footer.ts`: касты `as string` и `interaction.client.user!`. | `Footer.ts:8-14` |
| 36 | 🟡 | Смешанный импорт: `import Discord from 'discord.js'` (default) vs именованные импорты в других файлах. Привести к единому стилю. | повсеместно |

### 2.6 Инфраструктура и деплой

| # | Приоритет | Проблема | Где |
| --- | --- | --- | --- |
| 37 | 🟠 | В `package.json` зависимость на самого себя: `"opeks": "file:"`. | `package.json:21` |
| 38 | 🟠 | `@types/node`, `typescript`, `ts-node` лежат в `dependencies`, а `@types/superagent` — в `devDependencies` (наоборот: `@types/*` → dev). | `package.json:14-29` |
| 39 | 🟠 | Нет `build`-скрипта и запуска скомпилированного кода — прод работает через `ts-node` (медленно, тянет dev-зависимости). | `package.json:9-11`, `Procfile` |
| 40 | 🟡 | `tsconfig`: `files: ["src/Bot.ts"]` + `include: ["./**/*.ts"]`; нет `noUnusedLocals/noUnusedParameters`; `module/moduleResolution: nodenext` без `"type": "module"` в `package.json` (неоднозначный модуль-режим). | `tsconfig.json` |
| 41 | 🟡 | `global.d.ts` содержит `declare module '*'` — маскирует отсутствующие типы всех импортов. | `global.d.ts:1` |
| 42 | 🟡 | Нет логгера (только `console.log/error`), нет централизованной обработки ошибок, нет тестов, нет `.env.example`. | повсеместно |
| 43 | 🟡 | `amvera.yml`: `version: null`, `scriptName: src/Bot.ts`, `command: npm start`. | `amvera.yml` |
| 44 | 🟡 | `messageCreate` не отфильтровывает сообщения ботов глобально (проверка только в `RandomEmoji`). | `messageCreate.ts` |
| 45 | 🟡 | `interactionCreate` ищет команду линейно (`Commands.find`) и по-разному обрабатывает defer для slash и контекстных команд. | `interactionCreate.ts:25,53` |

## 3. Сводка по слоям

- **config.ts** — рабочий, но дублирует типы и не валидирует форматы. Основа для переработки (п. 1-8).
- **commands/** — однотипные объекты; 3 «тяжёлые» команды (`Verdict`, `Wiki`, `Sauce`) содержат встроенные сервисы и запросы. Главный кандидат на классы и сервисы.
- **listeners/** — тонкие функции, но с захардкоженными ID и ролями.
- **parsers/** — интерфейс хорош, но реализации дублируют логику ролей и вики.
- **custom/** — `commonFunctions` надо разбить на именованные хелперы, `Embed` удалить, `Footer` переработать.

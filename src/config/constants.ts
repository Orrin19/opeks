// Non-sensitive, environment-independent constants of the application.
// Sensitive and deploy-specific values live in `.env` (see `config/env.ts`).

export const GUILD_IDS = {
  /** Основной ролевой сервер «Ламоран». */
  lamoraun: '664491015914258452',
  /** Сервер «Сталкер». */
  stalker: '410837371299561473',
  /** Сервер-источник эмодзи для реакций-триггеров. */
  emojiSource: '461757596236382229',
} as const;

export const USER_IDS = {
  /** Пользователь, чьи реакции снимаются автоматически. */
  reactionCleanup: '478857385780183041',
  /** Пользователь, которому запрещена роль «Тушкан». */
  tushkan: '410701744872488960',
} as const;

export const ROLE_NAMES = {
  novice: 'Начинающий',
  tushkan: 'Тушкан',
  marsel: 'Марсель',
} as const;

export const CHANNEL_NAMES = {
  checkuser: 'checkuser',
} as const;

export interface WikiConfig {
  name: string;
  apiBase: string;
  articleBase: string;
}

export const WIKIS: Record<string, WikiConfig> = {
  lamoraun: {
    name: 'lamoraun',
    apiBase: 'https://lamoraun.fandom.com/ru/api.php',
    articleBase: 'https://lamoraun.fandom.com/ru/wiki/',
  },
  stalker: {
    name: 'stalker',
    apiBase: 'https://stalker.fandom.com/ru/api.php',
    articleBase: 'https://stalker.fandom.com/ru/wiki/',
  },
};

/** ID сервера Discord → ключ из WIKIS. */
export const SERVER_WIKI_MAP: Record<string, string> = {
  [GUILD_IDS.lamoraun]: 'lamoraun',
  [GUILD_IDS.stalker]: 'stalker',
};

export const PROJECT_URL = 'https://github.com/Orrin19/opeks';
export const WIKI_USER_AGENT = 'OpeksBot/1.0 (' + PROJECT_URL + ')';

export const EIGHTBALL_BASE_URL =
  'https://raw.githubusercontent.com/Orrin19/opeks/master/assets/8ball';
export const EIGHTBALL_IMAGE_COUNT = 7; // 0.png .. 6.png

export const RICKROLL_URL =
  'https://media.discordapp.net/attachments/664491015914258460/824896135902134283/Rickrolling.gif';

// --- Defaults (overridable via .env, see config/env.ts) ---
export const DEFAULT_LINE_COLOR = 0xfefefe;
export const DEFAULT_ACTIVITY_NAME = 'Opeks';
export const DEFAULT_ACTIVITY_TYPE = 0;
export const DEFAULT_HOSTING = 'local';
export const DEFAULT_OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
export const DEFAULT_OPENROUTER_MODEL = 'nvidia/nemotron-3-super-120b-a12b:free';

// --- Limits / thresholds ---
export const MS_PER_HOUR = 3.6e6;
export const CLEAN_LIMIT = 100; // Discord bulkDelete limit (including the command itself)
export const TIMEOUT_MIN_HOURS = 0.1;
export const TIMEOUT_MAX_HOURS = 168;
export const COLLECTOR_TTL_MS = 60_000;
export const LLM_MAX_PROMPT_CHARS = 28_000;
export const LLM_MAX_TOKENS = 2_048;
export const DISCORD_CONTENT_LIMIT = 1_900;
export const WIKI_SNIPPET_CHARS = 600;
export const WIKI_ARTICLE_CHARS = 800;
export const DICE_FACES = 6;
export const DICE_MAX_AMOUNT = 100;

// --- Dice: game-master roll request (/dice) ---
export const DICE_DEFAULT_MIN = 1;
export const DICE_DEFAULT_MAX = 20;
/** Абсолютная граница значений min/max в опциях /dice. */
export const DICE_RANGE_LIMIT = 1_000_000;
export const DICE_MAX_MODIFIERS = 10;
/** Роли, которым разрешено запрашивать бросок куба. */
export const DICE_ROLE_NAMES: readonly string[] = ['Администратор', 'Младший вердер'];
/** Префикс customId кнопки броска куба. */
export const DICE_BUTTON_PREFIX = 'dice:';

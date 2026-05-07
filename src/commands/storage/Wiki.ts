import Discord from 'discord.js';
import { Command } from '../Command';
import config from '../../config';
import { Footer } from '../../custom/Footer';

interface WikiConfig {
  name: string;
  apiBase: string;
  articleBase: string;
}

interface WikiArticle {
  title: string;
  content: string;
  url: string;
  imageUrl?: string;
}

const WIKIS: Record<string, WikiConfig> = {
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

// ID сервера Discord → ключ из WIKIS
const SERVER_WIKI_MAP: Record<string, string> = {
  '664491015914258452': 'lamoraun',
  '410837371299561473': 'stalker',
};

const WIKI_HEADERS = {
  'User-Agent': 'OpeksBot/1.0 (https://github.com/Orrin19/opeks)',
  Accept: 'application/json',
};

async function fetchArticleByTitle(
  title: string,
  wiki: WikiConfig,
): Promise<WikiArticle | null> {
  try {
    const encodedTitle = encodeURIComponent(title);
    const url = `${wiki.apiBase}?action=query&prop=revisions%7Cpageimages&rvprop=content&rvslots=main&pithumbsize=1200&titles=${encodedTitle}&format=json`;

    const res = await fetch(url, { headers: WIKI_HEADERS });
    if (!res.ok) return null;

    const text = await res.text();
    if (!text.trim().startsWith('{')) return null;

    const data = JSON.parse(text);
    const pages = data?.query?.pages;
    if (!pages) return null;

    const page = Object.values(pages)[0] as any;
    if (page?.invalid || page?.missing) return null;

    const wikitext: string =
      page?.revisions?.[0]?.slots?.main?.['*'] || page?.revisions?.[0]?.['*'];
    if (typeof wikitext !== 'string' || wikitext.trim().length < 20)
      return null;

    const realTitle: string = page.title ?? title;

    let clean = wikitext
      .replace(/{{[^}]*}}/g, '')
      .replace(/\[\[([^\]|]*?)\]\]/g, '$1')
      .replace(/\[\[[^\]|]*\|([^\]]*?)\]\]/g, '$1')
      .replace(/==+[^=]+==+/g, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/\n+/g, '\n')
      .replace(/^\s+|\s+$/g, '');

    if (clean.length > 800) {
      clean = clean.substring(0, 800).replace(/\s+\S*$/, '') + '...';
    }
    if (clean.length < 30) return null;

    const pageUrl = `${wiki.articleBase}${encodeURIComponent(realTitle.replace(/ /g, '_'))}`;
    const imageUrl: string | undefined = page?.thumbnail?.source;
    return { title: realTitle, content: clean, url: pageUrl, imageUrl };
  } catch {
    return null;
  }
}

async function searchWikiMultiple(
  query: string,
  wiki: WikiConfig,
): Promise<WikiArticle[]> {
  const cleanQuery = query.trim().replace(/[^\p{L}\p{N}\s]/gu, '');
  if (!cleanQuery) return [];

  const encodedQuery = encodeURIComponent(cleanQuery);
  const searchUrl = `${wiki.apiBase}?action=query&list=search&srsearch=${encodedQuery}&format=json&utf8=1&srlimit=3`;

  const [directArticle, searchRes] = await Promise.all([
    fetchArticleByTitle(cleanQuery, wiki),
    fetch(searchUrl, { headers: WIKI_HEADERS }).catch(() => null),
  ]);

  const seen = new Set<string>();
  const results: WikiArticle[] = [];

  if (directArticle) {
    seen.add(directArticle.title.toLowerCase());
    results.push(directArticle);
  }

  try {
    if (!searchRes?.ok) return results;

    const text = await searchRes.text();
    if (!text.trim().startsWith('{')) return results;

    const data = JSON.parse(text);
    if (data?.error || !data?.query?.search?.length) return results;

    const fetched = await Promise.all(
      (data.query.search as any[])
        .slice(0, 3)
        .map((r: any) => fetchArticleByTitle(r.title, wiki)),
    );

    for (const article of fetched) {
      if (!article || seen.has(article.title.toLowerCase())) continue;
      seen.add(article.title.toLowerCase());
      results.push(article);
      if (results.length >= 3) break;
    }
  } catch {
    // возвращаем что есть
  }

  return results;
}

async function callLLM(prompt: string): Promise<string> {
  const apiKey = config.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY не задан');

  // if (prompt.length > 28000) {
  //   prompt = prompt.substring(0, 28000) + '\n... (контекст обрезан)';
  // }

  const response = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/Orrin19/opeks',
        'X-Title': 'Opeks Bot',
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-super-120b-a12b:free',
        messages: [
          {
            role: 'system',
            content:
              'Ты отвечаешь ТОЛЬКО на русском языке. Это абсолютное требование. Ни одного английского слова, буквы или фразы в ответе быть не должно — даже в скобках, даже как термин. Любое иностранное слово обязательно переводится на русский язык.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 2048,
        temperature: 0.35,
      }),
    },
  );

  if (!response.ok) throw new Error(`LLM error: ${response.status}`);
  const data = await response.json();
  const content: string | null = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('LLM вернул пустой ответ');
  return content.trim();
}

export const Wiki: Command = {
  name: 'wiki',
  description: 'Search a wiki and get an AI summary',
  descriptionLocalizations: {
    ru: 'Поиск по вики с кратким ответом от ИИ',
    uk: 'Пошук по вікі з коротким описом від ШІ',
  },
  options: [
    {
      name: 'query',
      nameLocalizations: { ru: 'запрос', uk: 'запит' },
      type: Discord.ApplicationCommandOptionType.String,
      description: 'Search query (max 20 characters)',
      descriptionLocalizations: {
        ru: 'Поисковый запрос (до 20 символов)',
        uk: 'Пошуковий запит (до 20 символів)',
      },
      required: true,
      maxLength: 20,
    },
    {
      name: 'wiki',
      nameLocalizations: { ru: 'вики', uk: 'вікі' },
      type: Discord.ApplicationCommandOptionType.String,
      description: 'Wiki to search (required if server has no default)',
      descriptionLocalizations: {
        ru: 'Вики для поиска (обязательно, если у сервера нет вики по умолчанию)',
        uk: 'Вікі для пошуку (обов\'язково, якщо у сервера немає вікі за замовчуванням)',
      },
      required: false,
      choices: Object.entries(WIKIS).map(([value, w]) => ({
        name: w.name,
        value,
      })),
    },
  ],
  type: Discord.ApplicationCommandType.ChatInput,
  runChatInput: async (
    client: Discord.Client,
    interaction: Discord.ChatInputCommandInteraction,
  ) => {
    const query = interaction.options.getString('query', true);
    const wikiArg = interaction.options.getString('wiki');

    const wikiKey =
      wikiArg ??
      (interaction.guildId ? SERVER_WIKI_MAP[interaction.guildId] : undefined);

    if (!wikiKey) {
      await interaction.editReply(
        'Укажите вики через аргумент `/wiki вики:`, так как для этого сервера вики по умолчанию не задана.',
      );
      return;
    }

    const wiki = WIKIS[wikiKey];
    const articles = await searchWikiMultiple(query, wiki);

    if (articles.length === 0) {
      await interaction.editReply(
        `По запросу «${query}» статьи в вики «${wiki.name}» не найдены.`,
      );
      return;
    }

    try {
      const wikiContext = articles
        .map((a) => `=== ${a.title} ===\n${a.content}`)
        .join('\n\n');

      const prompt = `
Ты — помощник, знающий вики «${wiki.name}».
Пользователь задал запрос: "${query}"

Ниже приведены статьи из вики, найденные по этому запросу. Проанализируй их содержимое и дай связный, содержательный ответ на русском языке.

Правила:
- Ответь строго на русском языке. Любые иностранные слова переводи на русский — без исключений.
- Используй только те статьи, которые явно относятся к запросу. Если статья не имеет прямого отношения к запросу — игнорируй её полностью, не упоминай и не выдумывай связей.
- Ответ должен состоять из 2-3 абзацев. Выдели самое важное и характерное из статей применительно к запросу — сжато и по существу. Не пересказывай статью с начала, не трать место на второстепенные детали и вводные факты.
- Не используй заголовки, списки, символы разметки и лишние символы — только чистый текст абзацами.
- Не упоминай, что ты ИИ или бот.
- Не начинай ответ с фраз «Конечно», «Разумеется», «Отвечаю» и тому подобных.

=== СТАТЬИ ИЗ ВИКИ ===
${wikiContext}

=== ОТВЕТ ===
`.trim();

      const answer = await callLLM(prompt);

      const links = articles.map((a) => `[${a.title}](${a.url})`).join('\n');
      const imageUrl = articles.find((a) => a.imageUrl)?.imageUrl;

      const embed: Discord.APIEmbed = {
        color: Number(config.LINE_COLOR),
        title: query,
        description: answer,
        image: imageUrl ? { url: imageUrl } : undefined,
        fields: [{ name: 'Источники', value: links }],
        footer: new Footer(interaction),
      };

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply(
        'Не удалось получить ответ. Попробуйте позже.',
      );
    }
  },
};

import Discord from 'discord.js';
import { Command } from '../Command';
import config from '../../config';

function extractPotentialProperNouns(text: string): string[] {
  const words = text
    .replace(/[.,;:!?()«»"“”\[\]—–\-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const properNouns: string[] = [];
  properNouns.push('РВПИ:Список стран');
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (
      word[0] === word[0].toUpperCase() &&
      word !== word.toUpperCase() &&
      isNaN(Number(word))
    ) {
      properNouns.push(word);
    }
  }
  return [...new Set(properNouns)];
}

async function searchWiki(term: string): Promise<string | null> {
  const cleanTerm = term.trim().replace(/[^\p{L}\p{N}\s]/gu, '');
  if (!cleanTerm) return null;

  const encodedTerm = encodeURIComponent(cleanTerm);
  const searchUrl = `https://lamoraun.fandom.com/ru/api.php?action=query&list=search&srsearch=${encodedTerm}&format=json&utf8=1&srlimit=1`;

  try {
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'OpeksBot/1.0 (https://github.com/Orrin19/opeks)',
      },
    });

    if (!res.ok) return null;

    const text = await res.text();
    if (!text.trim().startsWith('{')) return null;

    const data = JSON.parse(text);
    if (data?.error || !data?.query?.search?.[0]) return null;

    const title = data.query.search[0].title;
    const encodedTitle = encodeURIComponent(title);
    const contentUrl = `https://lamoraun.fandom.com/ru/api.php?action=query&prop=revisions&rvprop=content&rvslots=main&titles=${encodedTitle}&format=json`;

    const contentRes = await fetch(contentUrl, {
      headers: {
        'User-Agent': 'OpeksBot/1.0 (https://github.com/Orrin19/opeks)',
        Accept: 'application/json',
      },
    });

    if (!contentRes.ok) return null;

    const contentText = await contentRes.text();
    if (!contentText.trim().startsWith('{')) return null;

    const contentData = JSON.parse(contentText);
    const pages = contentData?.query?.pages;
    if (!pages) return null;

    const page = Object.values(pages)[0] as any;
    if (page?.invalid || page?.missing) return null;

    const wikitext =
      page?.revisions?.[0]?.slots?.main?.['*'] || page?.revisions?.[0]?.['*'];
    if (typeof wikitext !== 'string' || wikitext.trim().length < 20)
      return null;

    let clean = wikitext
      .replace(/{{[^}]*}}/g, '')
      .replace(/\[\[([^\]|]*?)\]\]/g, '$1')
      .replace(/\[\[[^\]|]*\|([^\]]*?)\]\]/g, '$1')
      .replace(/==+[^=]+==+/g, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/\n+/g, '\n')
      .replace(/^\s+|\s+$/g, '');

    if (clean.length > 600) {
      clean = clean.substring(0, 600).replace(/\s+\S*$/, '') + '...';
    }
    if (clean.length < 30) return null;

    return `=== ${title} ===\n${clean}`;
  } catch {
    return null;
  }
}

async function callLLM(prompt: string): Promise<string> {
  const apiKey = config.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY не задан');

  // Защита от слишком длинного промпта
  if (prompt.length > 28000) {
    prompt = prompt.substring(0, 28000) + '\n... (контекст обрезан)';
  }

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
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 512,
        temperature: 0.7,
      }),
    }
  );

  if (!response.ok) throw new Error(`LLM error: ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content.trim();
}

async function buildThreadContext(
  channel: Discord.TextBasedChannel,
  startMessage: Discord.Message
): Promise<string> {
  const visited = new Set<string>();
  const lines: string[] = [];
  let current = startMessage;

  while (current && !visited.has(current.id) && lines.length < 25) {
    visited.add(current.id);
    lines.unshift(
      `${current.author.username}: ${current.content || '(вложение/эмбед)'}`
    );

    if (current.reference?.messageId) {
      try {
        const ref = await channel.messages.fetch(current.reference.messageId);
        if (ref) current = ref;
        else break;
      } catch {
        break;
      }
    } else {
      break;
    }
  }

  return lines.join('\n');
}

export const Verdict: Command = {
  name: 'Составить вердикт',
  type: Discord.ApplicationCommandType.Message,
  runMessageContext: async (client, interaction) => {
    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply({ content: '🔍 Собираю данные...' });

    const targetMessage = interaction.targetMessage;
    const channel = interaction.channel;
    if (!channel?.isTextBased()) {
      await interaction.editReply(
        'Команда работает только в текстовых каналах.'
      );
      return;
    }

    const chatContext = await buildThreadContext(channel, targetMessage);

    const properNouns = extractPotentialProperNouns(targetMessage.content);
    const wikiSnippets: string[] = [];
    for (const term of properNouns.slice(0, 5)) {
      const snippet = await searchWiki(term);
      if (snippet) wikiSnippets.push(snippet);
    }

    const wikiContext =
      wikiSnippets.length > 0
        ? wikiSnippets.join('\n\n')
        : 'Статьи по ключевым словам не найдены.';

    try {
      await interaction.editReply({ content: '🧠 Генерирую вердикт...' });

      const prompt = `
Ты — мастер военно-политической ролевой игры «Ламоран».  
Твоя задача — написать **вердикт** к посту игрока в **том же стиле**, что и сам пост.

Правила:
- Если пост написан в художественном, повествовательном стиле (как глава книги) — продолжи его в таком же духе.
- Если пост — приказ, донесение или официальный документ — ответь отчётом, донесением или реакцией в средневековой/игровой стилистике.
- Используй контекст из чата и вики, но не повторяй его дословно.
- Не выдумывай ничего нового, бери сведения только из контекста. Однако течение событий ты определять вправе.
- Не переписывай ничего из поста и контекста. Нужно лишь продолжение.
- Старайся делать нечто противоположное описанному в посте игрока: если он описывает действия персонажа, отыгрывай только других персонажей, но не него. Если он пишет приказ, ответь официальным документом.
- Не упоминай, что ты ИИ или бот.
- Ответ должен быть на русском языке.
- Ответ должен быть отформатирован в Markdown, приемлемом для чата Discord, он не должен содержать лишних тегов.


=== КОНТЕКСТ ИЗ ВИКИ ===
${wikiContext}

=== СЮЖЕТНАЯ ЦЕПОЧКА ===
${chatContext}

=== ПОСТ ИГРОКА ===
${targetMessage.author.username}: ${targetMessage.content}

=== ВЕРДИКТ ===
`.trim();

      const verdict = await callLLM(prompt);
      const finalContent =
        verdict.length > 1900 ? verdict.substring(0, 1900) + '...' : verdict;

      await interaction.editReply({ content: finalContent });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        content: '❌ Не удалось сгенерировать вердикт. Попробуйте позже.',
      });
    }
  },
};

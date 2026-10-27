import {
  ApplicationCommandOptionType,
  type ApplicationCommandOptionData,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { ChatInputCommand } from '../structures/ChatInputCommand';
import { pick } from '../utils/random';

type Gesture = 'камень' | 'бумага' | 'ножницы';

const GESTURES: readonly Gesture[] = ['камень', 'бумага', 'ножницы'];

const BEATS: Record<Gesture, Gesture> = {
  камень: 'ножницы',
  ножницы: 'бумага',
  бумага: 'камень',
};

export class RpsCommand extends ChatInputCommand {
  readonly name = 'rps';
  readonly description = 'A rock-paper-scissors game!';
  readonly descriptionLocalizations = {
    ru: 'Игра камень-ножницы-бумага!',
    uk: 'Гра камінь-ножиці-папір!',
  };
  readonly options: ApplicationCommandOptionData[] = [
    {
      name: 'gesture',
      nameLocalizations: { ru: 'жест', uk: 'жест' },
      type: ApplicationCommandOptionType.String,
      description: 'Your move!',
      descriptionLocalizations: { ru: 'Твой ход!', uk: 'Твій хід!' },
      required: true,
      choices: [
        { name: 'rock', nameLocalizations: { ru: 'камень', uk: 'камінь' }, value: 'камень' },
        { name: 'paper', nameLocalizations: { ru: 'бумага', uk: 'папір' }, value: 'бумага' },
        { name: 'scissors', nameLocalizations: { ru: 'ножницы', uk: 'ножиці' }, value: 'ножницы' },
      ],
    },
  ];

  async run(interaction: ChatInputCommandInteraction): Promise<void> {
    const gesture = interaction.options.getString('gesture', true) as Gesture;
    const botGesture = pick(GESTURES);

    let answers: string[];
    if (gesture === botGesture) {
      answers = [
        `У тебя ${gesture}, и у меня ${botGesture}... Ничья!`,
        `Боевая ничья! У нас обоих ${gesture}!`,
        `У нас с тобой ${gesture}... Ничья?`,
      ];
    } else if (BEATS[gesture] === botGesture) {
      answers = [
        `У тебя ${gesture}, а у меня ${botGesture}... Твоя взяла!`,
        `Ты победил! У тебя ${gesture}, а у меня ${botGesture}. Но в следующий раз...`,
        `Подожди, это ${gesture}? Похоже, ты победил, у меня ${botGesture}!`,
      ];
    } else {
      answers = [
        `У тебя ${gesture}, а у меня ${botGesture}! Я победил!`,
        `Я победил! У тебя ${gesture}, а у меня ${botGesture}. Ничего, потом повезёт.`,
        `Подожди, это ${gesture}? О-хо-хо, а у меня ${botGesture}! Выкуси!`,
      ];
    }

    await interaction.followUp(pick(answers));
  }
}

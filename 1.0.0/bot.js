// Bot settings
const Discord = require('discord.js');
const bot = new Discord.Client({
  intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS', 'DIRECT_MESSAGES'],
  presence: {
    status: 'dmd',
    activities: [
      {
        name: 'Sabaton',
        type: 2,
      },
    ],
  },
});

const prefix = '!';
const lineColor = '0xad1914';
const footerText = 'Opeks powered by Оррин';
const ownerID = process.env.OWNER_ID;
const logChannel = process.env.LOG_CHANNEL;

const superagent = require('superagent');
const pack = require('./package.json');
require('events').EventEmitter.defaultMaxListeners = Infinity;

// Database connection
const data = require('./database.json');
const joke = data.joke;
const maps = data.maps;
const flags = data.flags;

// Bot connection
bot.login(process.env.TOKEN);

// Ordinary functions
const getRandomInt = (max) => Math.floor(Math.random() * Math.floor(max));
const getRandArrIndex = (arr) => Math.floor(Math.random() * arr.length);
const getRandArrElement = (arr) => arr[getRandArrIndex(arr)];
const logToChannel = (msg) => bot.channels.cache.get(logChannel).send(msg);
const formatDate = (date) =>
  date.toLocaleDateString('ru', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  });
const triggerCommand = (message, command) =>
  message.content.startsWith(prefix) &&
  command === message.content.split(' ')[0].slice(1) &&
  !message.author.bot;

// !say
bot.on('messageCreate', async (message) => {
  if (triggerCommand(message, 'say') && message.author.id === ownerID) {
    await message.delete().catch((o_O) => {
      console.log(o_O);
    });
    message.channel.send(message.content.slice(5));
  }
});

// !invite
bot.on('messageCreate', async (message) => {
  if (triggerCommand(message, 'invite')) {
    const inviteButton = new Discord.MessageActionRow().addComponents(
      new Discord.MessageButton()
        .setLabel('Invite')
        .setStyle('LINK')
        .setURL(
          'https://discord.com/api/oauth2/authorize?client_id=672043257219252224&permissions=8&scope=bot'
        )
    );
    message.channel.send({
      content:
        'https://tenor.com/view/bots-hobots-buzz-lightyear-toy-story-woody-gif-17120878',
      components: [inviteButton],
    });
  }
});

// !help
bot.on('messageCreate', async (message) => {
  if (triggerCommand(message, 'help')) {
    const helpEmbed = new Discord.MessageEmbed()
      .setColor(lineColor)
      .setTitle('Opeks')
      .setThumbnail(
        bot.user.displayAvatarURL({
          dynamic: true,
          size: 1024,
        })
      )
      .setTimestamp()
      .setFooter(footerText)
      .addFields(
        {
          name: 'Бот создан',
          value: '29 января 2020 в 11:39:58 (UTC)',
        },
        {
          name: 'Написан на',
          value: `Node.js: v${pack.engines.node}\nDiscord.js: v${pack.dependencies['discord.js']}`,
        },
        {
          name: 'Хостинг',
          value: process.env.HOSTING,
        }
      );
    message.channel.send({
      content: 'Привет, я Opeks! Чем могу быть полезен?',
      embeds: [helpEmbed],
    });
  }
});

// !roll
bot.on('messageCreate', async (message) => {
  if (triggerCommand(message, 'roll')) {
    const args = message.content.split(' ').slice(1);
    const min = isNaN(args[0])
      ? !args[0]
        ? 1
        : args[0].split('-')[0] != args[0]
        ? Number(args[0].split('-')[0])
        : 1
      : 1;
    const max = isNaN(args[0])
      ? !args[0]
        ? 20
        : args[0].split('-')[0] != args[0]
        ? Number(args[0].split('-')[1])
        : 20
      : Number(args[0]);
    const result = getRandomInt(max - min) + min;

    const mods = new Array();
    var finalResult = result;
    for (let arg of args.slice(1)) {
      if (!isNaN(arg)) {
        finalResult += Number(arg);
        mods.push(arg);
      } else break;
    }

    const rollEmbed = new Discord.MessageEmbed()
      .setColor(lineColor)
      .setDescription(`**${result}**`)
      .setTimestamp()
      .setFooter(footerText);

    max == min
      ? rollEmbed.setTitle(`:game_die: Случайное число ${max} :smile:`)
      : rollEmbed.setTitle(`:game_die: Случайное число от ${min} до ${max}`);

    if (result === max) {
      rollEmbed.setImage(
        'https://media.discordapp.net/attachments/664491015914258460/824896135902134283/Rickrolling.gif'
      );
    }

    if (finalResult !== result) {
      rollEmbed.addFields(
        {
          name: ':heavy_plus_sign: Модификаторы:',
          value: `**${mods.join(' ')}**`,
        },
        {
          name: ':gem: Итоговое значение:',
          value: `**${finalResult}**`,
        }
      );
    }

    message.channel.send({
      embeds: [rollEmbed],
    });
  }
});

// !кубик
bot.on('messageCreate', async (message) => {
  if (triggerCommand(message, 'кубик')) {
    let number = message.content.split(' ').slice(1)[0];
    let results = [];
    let sum = 0;
    let result;
    if (number > 1 && number < 101) {
      for (let i = 0; i < number; i++) {
        result = getRandomInt(6) + 1;
        sum += result;
        if (result === 1) {
          results[i] = ':one:';
        }
        if (result === 2) {
          results[i] = ':two:';
        }
        if (result === 3) {
          results[i] = ':three:';
        }
        if (result === 4) {
          results[i] = ':four:';
        }
        if (result === 5) {
          results[i] = ':five:';
        }
        if (result === 6) {
          results[i] = ':six:';
        }
      }
      message.channel.send(
        `Брошено кубиков: ${Math.ceil(number)}\nРезультаты: ${results.join(
          ' '
        )}\nСумма: ${sum}`
      );
    }
    if (number === 1 || !number) {
      let result = getRandomInt(6) + 1;
      if (result === 1) {
        result = ':one:';
      }
      if (result === 2) {
        result = ':two:';
      }
      if (result === 3) {
        result = ':three:';
      }
      if (result === 4) {
        result = ':four:';
      }
      if (result === 5) {
        result = ':five:';
      }
      if (result === 6) {
        result = ':six:';
      }
      message.channel.send(`Брошен кубик. Результат: ${result}`);
    }
  }
});

// question
bot.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.mentions.users.first() === bot.user) {
    if (message.content[message.content.length - 1] === '?') {
      let w = getRandomInt(100) + 1;
      let answer;
      if (w <= 50) {
        answer = [
          'Да!',
          'Определённо, да!',
          'Да, конечно!',
          'Да, ясно дело!',
          'Однозначно.',
          'Конечно!',
          'Да. А как может быть иначе?',
        ];
      } else {
        answer = [
          'Нет!',
          'Определённо, нет!',
          'Нет, конечно!',
          'Ни в коем случае.',
          'Я так не думаю.',
          'Ответ отрицателен.',
          'С чего? Нет, конечно.',
        ];
      }
      message.reply(getRandArrElement(answer));
    }
  }
});

// !chance
bot.on('messageCreate', async (message) => {
  if (triggerCommand(message, 'chance')) {
    let args = message.content.split(' ').slice(1);
    let chance;
    let action;
    if (isNaN(args[0])) {
      chance = 50;
      action = args.join(' ');
    } else {
      chance = args[0];
      action = args.slice(1).join(' ');
    }
    let w = getRandomInt(100) + 1;
    let answer;
    if (w <= chance) {
      answer = [
        'Да!',
        'Определённо, да!',
        'Да, конечно!',
        'Однозначно.',
        'Почему бы и нет?',
        'Конечно!',
        'Да. А как может быть иначе?',
      ];
    } else {
      answer = [
        'Нет!',
        'Определённо, нет!',
        'Нет, конечно!',
        'Ни в коем случае.',
        'Я так не думаю.',
        'Ответ отрицателен.',
        'С чего? Нет, конечно.',
      ];
    }
    const chanceEmbed = new Discord.MessageEmbed()
      .setColor(lineColor)
      .setTitle('🎲 Вероятность события')
      .setTimestamp()
      .setFooter(footerText)
      .addFields(
        {
          name: ':grey_question: Событие:',
          value: action,
        },
        {
          name: ':scales: Вероятность удачи:',
          value: `${chance} %`,
        },
        {
          name: ':ballot_box_with_check: Результат:',
          value: getRandArrElement(answer),
        }
      );
    message.channel.send({
      embeds: [chanceEmbed],
    });
  }
});

// !special (Fallout)
bot.on('messageCreate', async (message) => {
  if (triggerCommand(message, 'special')) {
    const specialEmbed = new Discord.MessageEmbed()
      .setColor(lineColor)
      .setTitle('S.P.E.C.I.A.L.')
      .setDescription('Случайная характеристика для вашего персонажа')
      .setTimestamp()
      .setFooter(footerText)
      .addFields(
        {
          name: ':muscle: Сила:',
          value: `**${getRandomInt(10) + 1}**`,
        },
        {
          name: ':eyes: Восприятие:',
          value: `**${getRandomInt(10) + 1}**`,
        },
        {
          name: ':man_running: Выносливость:',
          value: `**${getRandomInt(10) + 1}**`,
        },
        {
          name: ':sunglasses: Харизма:',
          value: `**${getRandomInt(10) + 1}**`,
        },
        {
          name: ':brain: Интеллект:',
          value: `**${getRandomInt(10) + 1}**`,
        },
        {
          name: ':cartwheel: Ловкость:',
          value: `**${getRandomInt(10) + 1}**`,
        },
        {
          name: ':unicorn: Удача:',
          value: `**${getRandomInt(10) + 1}**`,
        }
      );
    message.channel.send({
      embeds: [specialEmbed],
    });
  }
});

// !joke (jokes from the S.T.A.L.K.E.R. game)
bot.on('messageCreate', async (message) => {
  if (triggerCommand(message, 'joke')) {
    const value = getRandArrIndex(joke);
    const jokeEmbed = new Discord.MessageEmbed()
      .setColor(lineColor)
      .setTitle('Внимание, анекдот!')
      .setDescription(joke[value])
      .setTimestamp()
      .setFooter(footerText);
    message.channel.send({
      embeds: [jokeEmbed],
    });
  }
});

// !rickroll meme
bot.on('messageCreate', async (message) => {
  if (triggerCommand(message, 'rickroll')) {
    message.channel.send(
      'https://media.discordapp.net/attachments/664491015914258460/824896135902134283/Rickrolling.gif'
    );
  }
});

// sends random local emoji
bot.on('messageCreate', async (message) => {
  if (getRandomInt(300) === 50 && !message.author.bot) {
    let emoji = message.guild.emojis.cache.random();
    message.channel.send('<:' + emoji.name + ':' + emoji.id + '>');
  }
});

// !clean
bot.on('messageCreate', async (message) => {
  if (triggerCommand(message, 'чистка')) {
    let messageArray = message.content.split(' ');
    let args = messageArray.slice(1);
    let amount = parseInt(args[0]) + 1;
    let messCount = args[0];
    if (isNaN(amount)) {
      return message.reply(
        'введите количество сообщений, которые нужно удалить.'
      );
    }
    if (amount <= 1 || amount > 100) {
      return message.reply('необходимо ввести число от 1 до 99.');
    }
    if (!message.member.permissions.has('MANAGE_MESSAGES')) {
      return message.reply('вам недоступна эта функция.');
    }
    message.channel.bulkDelete(amount, true);
    message.channel
      .send(`Удалено ${messCount} сообщений!`)
      .then((msg) => setTimeout(() => msg.delete(), 5000));
    logToChannel(
      `${message.author.username} удалил ${amount - 1} сообщений в ${
        message.channel.isThread()
          ? `треде «${message.channel.name}» канала #${message.channel.parent.name}`
          : `канале #${message.channel.name}`
      } (${message.guild}).`
    );
  }
});

// !mute
bot.on('messageCreate', async (message) => {
  if (triggerCommand(message, 'mute')) {
    let args = message.content.split(' ').slice(1);
    let mutedMember = message.guild.members.cache.get(
      message.guild.members.cache.find(
        (m) => m.user.username === args[0] || m.id === args[0]
      ).id || message.mentions.users.first().id
    );
    if (!mutedMember)
      return message.channel.send('Не могу найти этого пользователя...');
    if (
      !message.member.permissions.has('MANAGE_ROLES') &&
      message.author.id !== mutedMember.id
    )
      return message.channel.send('У тебя недостаточно прав для этого');
    if (
      mutedMember.permissions.has('MANAGE_MESSAGES') &&
      message.author.id !== mutedMember.id
    )
      return message.channel.send('Этот пользователь не может быть заглушен');
    let reason = args.slice(1).join(' ');
    let muterole = message.guild.roles.cache.find((r) => r.name === 'Заглушен');
    if (!muterole) {
      muterole = await message.guild.roles.create({
        data: {
          name: 'Заглушен',
          color: 0x607d8d,
        },
      });
    }
    mutedMember.send(
      `${message.author.username} заглушил вас на сервере «${message.guild}» по причине: ${reason}`
    );
    logToChannel(
      `${message.author.username} заглушил ${mutedMember.user.username} на сервере «${message.guild}» по причине: ${reason}`
    );
    await mutedMember.roles.add(muterole.id);
    const muteEmbed = new Discord.MessageEmbed()
      .setColor(lineColor)
      .setTitle('Мут пользователя')
      .setTimestamp()
      .setFooter(footerText)
      .addFields(
        {
          name: 'Заглушенный пользователь:',
          value: mutedMember.user.tag,
        },
        {
          name: 'Был заглушен:',
          value: message.author.tag,
        },
        {
          name: 'Дата:',
          value: message.createdAt,
        },
        {
          name: 'Причина:',
          value: reason,
        }
      );
    message.channel.send({
      embeds: [muteEmbed],
    });
  }
});

// !kick
bot.on('messageCreate', async (message) => {
  if (triggerCommand(message, 'kick')) {
    let args = message.content.split(' ').slice(1);
    let kickedMember = message.guild.members.cache.get(
      message.guild.members.cache.find(
        (m) => m.user.username === args[0] || m.id === args[0]
      ).id || message.mentions.users.first().id
    );
    if (!kickedMember)
      return message.channel.send('Не могу найти этого пользователя...');
    if (!kickedMember.kickable)
      return message.channel.send(
        'Не могу выгнать пользователя: не хватает прав.'
      );
    if (
      !message.member.permissions.has('KICK_MEMBERS') &&
      message.author.id !== kickedMember.id
    )
      return message.channel.send('У тебя недостаточно прав для этого');
    if (
      kickedMember.permissions.has('MANAGE_MESSAGES') &&
      message.author.id !== kickedMember.id
    )
      return message.channel.send('Этот пользователь не может быть кикнут');
    let reason = args.slice(1).join(' ');
    kickedMember.send(
      `${message.author.username} кикнул вас с сервера «${message.guild}» по причине: ${reason}`
    );
    logToChannel(
      `${message.author.username} кикнул ${kickedMember.user.username} на сервере «${message.guild}» по причине: ${reason}`
    );
    await kickedMember.kick(reason);
    const kickEmbed = new Discord.MessageEmbed()
      .setColor(lineColor)
      .setTitle('Кик пользователя')
      .setTimestamp()
      .setFooter(footerText)
      .addFields(
        {
          name: 'Кикнутый пользователь:',
          value: kickedMember.user.tag,
        },
        {
          name: 'Был кикнут:',
          value: message.author.tag,
        },
        {
          name: 'Дата:',
          value: message.createdAt,
        },
        {
          name: 'Причина:',
          value: reason,
        }
      );
    message.channel.send({
      embeds: [kickEmbed],
    });
  }
});

// !ban
bot.on('messageCreate', async (message) => {
  if (triggerCommand(message, 'ban')) {
    let args = message.content.split(' ').slice(1);
    let bannedMember = message.guild.members.cache.get(
      message.guild.members.cache.find(
        (m) => m.user.username === args[0] || m.id === args[0]
      ).id || message.mentions.users.first().id
    );
    if (!bannedMember) return message.channel.send('Пользователь не найден');
    if (!bannedMember.bannable)
      return message.channel.send(
        'Не могу заблокировать пользователя: не хватает прав.'
      );
    if (
      !message.member.permissions.has('BAN_MEMBERS') &&
      message.author.id !== bannedMember.id
    )
      return message.channel.send('У тебя недостаточно прав для этого');
    if (
      bannedMember.permissions.has('MANAGE_MESSAGES') &&
      message.author.id !== bannedMember.id
    )
      return message.channel.send(
        'Этот пользователь не может быть заблокирован'
      );
    let reason = args.slice(1).join(' ');
    bannedMember.send(
      `${message.author.username} заблокировал вас на сервере «${message.guild}» по причине: ${reason}`
    );
    logToChannel(
      `${message.author.username} заблокировал ${bannedMember.user.username} на сервере «${message.guild}» по причине: ${reason}`
    );
    await bannedMember.ban({
      reason: reason,
    });
    const banEmbed = new Discord.MessageEmbed()
      .setColor(lineColor)
      .setTitle('Бан пользователя')
      .setTimestamp()
      .setFooter(footerText)
      .addFields(
        {
          name: 'Заблокированный пользователь:',
          value: bannedMember.user.tag,
        },
        {
          name: 'Был заблокирован:',
          value: message.author.tag,
        },
        {
          name: 'Дата:',
          value: message.createdAt,
        },
        {
          name: 'Причина:',
          value: reason,
        }
      );
    message.channel.send({
      embeds: [banEmbed],
    });
  }
});

// !avatar
bot.on('messageCreate', async (message) => {
  if (triggerCommand(message, 'avatar')) {
    let args = message.content.split(' ').slice(1);
    let member = message.guild.members.cache.get(
      message.mentions.users.first().id ||
        message.guild.members.cache.find(
          (m) => m.user.username == args[0] || m.id == args[0]
        ).id
    );
    message.channel.send(
      member.user.displayAvatarURL({
        dynamic: true,
        size: 1024,
      })
    );
  }
});

// !userinfo
bot.on('messageCreate', async (message) => {
  if (triggerCommand(message, 'userinfo')) {
    let args = message.content.split(' ').slice(1);
    let member = message.guild.members.cache.get(
      message.mentions.users.first().id ||
        message.guild.members.cache.find(
          (m) => m.user.username == args[0] || m.id == args[0]
        ).id
    );
    let user = member.user;
    let nickname = member.nickname;
    if (nickname == null) {
      nickname = member.user.username;
    }
    const userEmbed = new Discord.MessageEmbed()
      .setColor(lineColor)
      .setTitle('Информация о пользователе')
      .setThumbnail(
        user.displayAvatarURL({
          dynamic: true,
          size: 1024,
        })
      )
      .setTimestamp()
      .setFooter(footerText)
      .addFields(
        {
          name: ':globe_with_meridians: Основные данные:',
          value: `
            **Имя:** *${user.username}#${user.discriminator}*
            **ID:** *${user.id}*
            **Создан:** *${formatDate(user.createdAt)}*
          `,
        },
        {
          name: ':map: На этом сервере:',
          value: `
            **Никнейм:** *${nickname}*
            **Присоединился:** *${formatDate(member.joinedAt)}*
          `,
        }
      );
    message.channel.send({
      embeds: [userEmbed],
    });
  }
});

// !serverinfo
bot.on('messageCreate', async (message) => {
  if (triggerCommand(message, 'serverinfo')) {
    const guild = message.guild;
    const regions = {
      russia: ':flag_ru: Россия',
      india: 'flag_in: Индия',
      japan: ':flag_ja: Япония',
      brasil: ':flag_br: Бразилия',
      'us-west': ':flag_us: Запад США',
      hongkong: ':flag_hk: Гонконг',
      southafrica: ':flag_za: Южная Африка',
      sydney: ':flag_au: Сидней',
      europe: ':flag_eu: Европа',
      singapore: ':flag_sg: Сингапур',
      'us-central': ':flag_us: Центр США',
      'us-south': ':flag_us: Юг США',
      'us-east': ':flag_us: Восток США',
    };
    const guildOwner = guild.members.cache.get(guild.ownerId);
    const serverEmbed = new Discord.MessageEmbed()
      .setColor(lineColor)
      .setTitle('Информация о сервере')
      .setThumbnail(
        guild.iconURL({
          dynamic: true,
          size: 1024,
        })
      )
      .setTimestamp()
      .setFooter(footerText)
      .addFields(
        {
          name: ':globe_with_meridians: Основные данные:',
          value: `
            **Название:** *${guild.name}*
            **ID:** *${guild.id}*
            **Создан:** *${formatDate(guild.createdAt)}*
            **Владелец:** *${guildOwner.user.username}*
            **Регион:** *${regions[guild.region]}*
          `,
        },
        {
          name: ':mens: Участники:',
          value: `
            **Количество участников:** *${guild.memberCount}*
            **Количество ролей:** *${guild.roles.cache.size}*
            **Уровень проверки:** *${guild.mfaLevel}*
            **Вы присоединились:** *${formatDate(message.member.joinedAt)}*
          `,
        }
      );
    message.channel.send({
      embeds: [serverEmbed],
    });
  }
});

// !gr
/*bot.on('messageCreate', async (message) => {
  if (
    triggerCommand(message, 'rickroll') &&
    message.member.permissions.has('MANAGE_ROLES')
  ) {
    await message.delete();
    const args = message.content.split(' ').slice(1);
    /*var member;
    try {
      member = message.guild.members.cache.get(
        message.mentions.users.first().id
      );
    } catch (e) {
      member = message.guild.members.cache.get(
        message.guild.members.cache.find(
          (m) => m.user.username === args[0] || m.id === args[0]
        ).userId
      );
    }
    let member = message.guild.members.cache.get(
      message.mentions.users.first().id ||
      message.guild.members.cache.find(
        (m) => m.user.username === args[0] || m.id === args[0]
      ).userId
    );
    let member = message.guild.members.cache.get(
      message.guild.members.cache.find(
        (m) => m.user.username === args[0] || m.id === args[0]
      ).id || message.mentions.users.first().id
    );
    let role = message.guild.roles.cache.find(
      (r) => r.name === args.slice(1).join(' ')
    );
    member.roles.add(role.id);
  }
});

// !rr
bot.on('messageCreate', async (message) => {
  if (
    triggerCommand(message, 'rickroll') &&
    message.member.permissions.has('MANAGE_ROLES')
  ) {
    await message.delete();
    let args = message.content.split(' ').slice(1);
    let member = message.guild.members.cache.get(
      message.guild.members.cache.find(
        (m) => m.user.username === args[0] || m.id === args[0]
      ).id || message.mentions.users.first().id
    );
    let role = message.guild.roles.cache.find(
      (r) => r.name === args.slice(1).join(' ')
    );
    member.roles.remove(role.id);
  }
});*/

// !voting
bot.on('messageCreate', async (message) => {
  if (triggerCommand(message, 'voting')) {
    let args = message.content.split(' ').slice(1);
    let variables = args.join(' ');
    variables = variables.split('|');
    const voteEmbed = new Discord.MessageEmbed()
      .setColor(lineColor)
      .setTitle('Голосование')
      .setTimestamp()
      .setFooter(footerText)
      .addFields(
        {
          name: 'Описание',
          value: variables[0],
        },
        {
          name: 'Варианты',
          value: variables.slice(1).join('\n'),
        }
      );
    message.channel
      .send({
        embeds: [voteEmbed],
      })
      .then((msg) => {
        let i = 1;
        function reactionLoop() {
          setTimeout(function () {
            if (i === 1) msg.react('1️⃣');
            if (i === 2) msg.react('2️⃣');
            if (i === 3) msg.react('3️⃣');
            if (i === 4) msg.react('4️⃣');
            if (i === 5) msg.react('5️⃣');
            if (i === 6) msg.react('6️⃣');
            if (i === 7) msg.react('7️⃣');
            if (i === 8) msg.react('8️⃣');
            if (i === 9) msg.react('9️⃣');
            if (i === 10) msg.react('0️⃣');
            i++;
            if (i < variables.length) {
              reactionLoop();
            }
          }, 500);
        }
        reactionLoop();
      });
  }
});

// !choise
bot.on('messageCreate', async (message) => {
  if (triggerCommand(message, 'choise')) {
    let args = message.content.split(' ').slice(1);
    message.channel.send(getRandArrElement(args));
  }
});

// !nekos-life
bot.on('messageCreate', async (message) => {
  if (triggerCommand(message, 'nekos-life')) {
    if (!message.channel.nsfw)
      return message.reply(
        'команда может использоваться только в канале NSFW.'
      );
    let category = message.content.split(' ').slice(1);
    let resp = await superagent.get(
      `https://nekos.life/api/v2/img/${category}`
    );
    let { body } = await superagent.get(
      `https://nekos.life/api/v2/img/${category}`
    );
    if (body.msg === '404' || resp.statusCode !== 200)
      return message.reply('не могу найти картинку по этому запросу...');
    const nekoEmbed = new Discord.MessageEmbed()
      .setColor(lineColor)
      .setImage(body.url)
      .setTimestamp()
      .setFooter(footerText);
    message.channel.send({
      embeds: [nekoEmbed],
    });
  }
});

// !wttr
bot.on('messageCreate', async (message) => {
  if (triggerCommand(message, 'wttr')) {
    let args = message.content.split(' ').slice(1);
    let type = args[0];
    let city = args.slice(1).join(' ');
    if (type === 'text') {
      let url = encodeURI(`http://wttr.in/${city}?m&M&format=2&lang=ru`);
      let resp = await superagent.get(url);
      const wttrEmbed = new Discord.MessageEmbed()
        .setColor(lineColor)
        .setTitle(`Погода: ${city}`)
        .setDescription(resp.text)
        .setTimestamp()
        .setFooter(footerText);
      return message.channel.send({
        embeds: [wttrEmbed],
      });
    }
    if (type === 'img') {
      let url = encodeURI(`http://wttr.in/${city}.png?m&M&p&0&Q&lang=ru`);
      const wttrEmbed = new Discord.MessageEmbed()
        .setColor(lineColor)
        .setTitle(`Погода: ${city}`)
        .setImage(url)
        .setTimestamp()
        .setFooter(footerText);
      return message.channel.send({
        embeds: [wttrEmbed],
      });
    }
  }
});

// Чтение DM
bot.on('messageCreate', async (message) => {
  if (message.channel.type === 'DM') {
    logToChannel(
      `${message.author.tag} отправил в личные сообщения: «${message.content}».`
    );
  }
});

// Выдача ролей и автоприветствие на Ламоране
bot.on('guildMemberAdd', async (member) => {
  if (member.guild.id !== '664491015914258452') return;
  const noviceRole = member.guild.roles.cache.find(
    (r) => r.name === 'Начинающий'
  );
  await member.roles.add(noviceRole);

  return; //удалитб
  const noviceButton = new Discord.MessageActionRow().addComponents(
    new Discord.MessageButton()
      .setLabel('Давай как с новичком. Ничего не знаю')
      .setStyle('LINK')
      .setURL('https://lamoraun.fandom.com/ru/wiki/Ламоран_вики')
  );
  const experiencedButton = new Discord.MessageActionRow().addComponents(
    new Discord.MessageButton()
      .setLabel('Давай как с опытным')
      .setStyle('LINK')
      .setURL('https://forms.gle/DqnNAuS8qDRAm8Qt8')
  );
  member.send({
    content:
      'Короче, новичок. Я тебе огромный и сложный лор покажу и в благородство играть не буду. Пройдёшь регистрацию — и мы в расчёте. Заодно проверим, как быстро башка после ВПИ 1936 прояснится. А по твоей теме — сейчас расскажу.\nЗначит, выбирай, как мы с тобой поступим: либо я тебе сейчас мозги буду парить, как обычно всем новичкам делаю, либо как с опытным ролевиком — получаешь ссылку на регистрацию, и вперёд.',
    components: [noviceButton, experiencedButton],
  });
});

// Ссылки на вики на Ламоране
bot.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (
    message.content.includes('[[') &&
    message.content.includes(']]') &&
    message.guild.id === '664491015914258452'
  ) {
    let help = 0;
    let link = [];
    for (let symbol of message.content.split('')) {
      if (help === 5) {
        message.channel.send(
          `<https://lamoraun.fandom.com/ru/wiki/${link.join('')}>`
        );
        help = 0;
        link = [];
      }
      if (help === 2 && symbol === ']') {
        help = 5;
      }
      if (help === 2 && symbol !== ']') {
        if (symbol === ' ') {
          symbol = '_';
        }
        link.push(symbol);
      }
      if (symbol === '[' && help === 1) {
        help = 2;
      }
      if (symbol === '[' && help === 0) {
        help = 1;
      }
    }
  }
});

// //////////////////////////////////////////////////////
// //////////////Games///////////////////////////////////
// //////////////////////////////////////////////////////
const kmaps = Object.keys(maps);
const vmaps = Object.values(maps);
const kflags = Object.keys(flags);
const vflags = Object.values(flags);
let cell,
  chan,
  game = 0;

bot.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (
    message.channel.id === chan &&
    !message.content.startsWith(prefix + 'game')
  ) {
    if (game === 'map') {
      for (let i of vmaps[cell]) {
        if (message.content.includes(i)) {
          cell, chan, (game = 0);
          return message.reply('правильно!');
        }
      }
      return message.reply('неверно!');
    }
    if (game === 'flag') {
      for (let i of vflags[cell]) {
        if (message.content.includes(i)) {
          cell, chan, (game = 0);
          return message.reply('правильно!');
        }
      }
      return message.reply('неверно!');
    }
  }
});

bot.on('messageCreate', async (message) => {
  if (triggerCommand(message, 'game')) {
    chan = message.channel.id;
    let args = message.content.split(' ').slice(1);
    if (args[0] === 'map-state') {
      game = 'map';
      cell = getRandArrIndex(kmaps);
      const gameEmbed = new Discord.MessageEmbed()
        .setColor(lineColor)
        .setTitle('Игра «Карта — Страна»')
        .setImage(kmaps[cell])
        .setTimestamp()
        .setFooter(footerText);
      message.channel.send({
        embeds: [gameEmbed],
      });
    }
    if (args[0] === 'flag-state') {
      game = 'flag';
      cell = getRandArrIndex(kflags);
      const gameEmbed = new Discord.MessageEmbed()
        .setColor(lineColor)
        .setTitle('Игра «Флаг — Страна»')
        .setImage(kflags[cell])
        .setTimestamp()
        .setFooter(footerText);
      message.channel.send({
        embeds: [gameEmbed],
      });
    }
  }
});

///////////////////////////////////
//////////////// Slashes //////////
///////////////////////////////////
bot.once('ready', async () => {
  const data = [
    {
      name: 'help',
      description: 'Показывает информацию о боте.',
    },
    {
      name: 'invite',
      description: 'Отправляет ссылку для приглашения бота.',
    },
    {
      name: 'roll',
      description: 'Выдаёт случайное число от 1 до заданного.',
      options: [
        {
          name: 'number',
          type: 'INTEGER',
          description: 'Максимальное значение.',
          required: false,
        },
      ],
    },
    {
      name: 'dice',
      description: 'Кидает кубик.',
      options: [
        {
          name: 'amount',
          type: 'INTEGER',
          description: 'Количество кубиков.',
          required: false,
        },
      ],
    },
    {
      name: 'clean',
      description: 'Удаляет определённое количество сообщений.',
      options: [
        {
          name: 'amount',
          type: 'INTEGER',
          description: 'Количество удаляемых сообщений.',
          required: true,
        },
      ],
    },
    {
      name: 'meow',
      description: 'Отправляет картинку с котиком.',
    },
  ];

  const command = await bot.application?.commands.set(data);
});

// /help
bot.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName === 'help') {
    const helpEmbed = new Discord.MessageEmbed()
      .setColor(lineColor)
      .setTitle('Opeks')
      .setThumbnail(
        bot.user.displayAvatarURL({
          dynamic: true,
          size: 1024,
        })
      )
      .setTimestamp()
      .setFooter(footerText)
      .addFields(
        {
          name: 'Бот создан',
          value: '29 января 2020 в 11:39:58 (UTC)',
        },
        {
          name: 'Написан на',
          value: `Node.js: v${pack.engines.node}\nDiscord.js: v${
            Object.values(pack.dependencies)[0]
          }`,
        },
        {
          name: 'Хостинг',
          value: process.env.HOSTING,
        }
      );
    await interaction.reply({
      content: 'Привет, я Opeks! Чем могу быть полезен?',
      embeds: [helpEmbed],
    });
  }
});

// /invite
bot.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName === 'invite') {
    const inviteButton = new Discord.MessageActionRow().addComponents(
      new Discord.MessageButton()
        .setLabel('Invite')
        .setStyle('LINK')
        .setURL(
          'https://discord.com/api/oauth2/authorize?client_id=672043257219252224&permissions=8&scope=bot'
        )
    );
    await interaction.reply({
      content:
        'https://tenor.com/view/bots-hobots-buzz-lightyear-toy-story-woody-gif-17120878',
      components: [inviteButton],
    });
  }
});

// /roll
bot.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName === 'roll') {
    let value = interaction.options.getInteger('option');
    if (value === null) {
      value = 20;
    }
    let result = getRandomInt(value) + 1;
    const rollEmbed = new Discord.MessageEmbed()
      .setColor(lineColor)
      .setTitle(`:game_die: Случайное число от 1 до ${value}`)
      .setDescription(`**${result}**`)
      .setTimestamp()
      .setFooter(footerText);
    if (result === value) {
      rollEmbed.setImage(
        'https://media.discordapp.net/attachments/664491015914258460/824896135902134283/Rickrolling.gif'
      );
    }
    await interaction.reply({
      embeds: [rollEmbed],
    });
  }
});

// /dice
bot.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName === 'dice') {
    let number = interaction.options.getInteger('option');
    let results = [];
    let sum = 0;
    let result;
    if (number > 1 && number < 101) {
      for (let i = 0; i < number; i++) {
        result = getRandomInt(6) + 1;
        sum += result;
        if (result === 1) {
          results[i] = ':one:';
        }
        if (result === 2) {
          results[i] = ':two:';
        }
        if (result === 3) {
          results[i] = ':three:';
        }
        if (result === 4) {
          results[i] = ':four:';
        }
        if (result === 5) {
          results[i] = ':five:';
        }
        if (result === 6) {
          results[i] = ':six:';
        }
      }
      await interaction.reply(
        `Брошено кубиков: ${number}\nРезультаты: ${results.join(
          ' '
        )}\nСумма: ${sum}`
      );
    }
    if (number === 1 || !number) {
      let result = getRandomInt(6) + 1;
      if (result === 1) {
        result = ':one:';
      }
      if (result === 2) {
        result = ':two:';
      }
      if (result === 3) {
        result = ':three:';
      }
      if (result === 4) {
        result = ':four:';
      }
      if (result === 5) {
        result = ':five:';
      }
      if (result === 6) {
        result = ':six:';
      }
      await interaction.reply(`Брошен кубик. Результат: ${result}`);
    }
  }
});

// /clean
bot.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName === 'clean') {
    let messCount = interaction.options.getInteger('option');
    let amount = messCount + 1;
    if (amount <= 1 || amount > 100) {
      return interaction.reply('необходимо ввести число от 1 до 99.');
    }
    if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
      return interaction.reply('вам недоступна эта функция.');
    }
    interaction.channel.bulkDelete(amount, true);
    interaction.channel
      .send(`Удалено ${messCount} сообщений!`)
      .then((msg) => setTimeout(() => msg.delete(), 5000));
    logToChannel(
      `${interaction.member.user.username} удалил ${amount - 1} сообщений в ${
        interaction.channel.isThread()
          ? `треде «${interaction.channel.name}» канала #${interaction.channel.parent.name}`
          : `канале #${interaction.channel.name}`
      } (${interaction.guild}).`
    );
  }
});

// /meow
bot.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName === 'meow') {
    let { body } = await superagent.get(`https://nekos.life/api/v2/img/meow`);
    const meowEmbed = new Discord.MessageEmbed()
      .setColor(lineColor)
      .setImage(body.url)
      .setTimestamp()
      .setFooter(footerText);
    await interaction.reply({
      embeds: [meowEmbed],
    });
  }
});

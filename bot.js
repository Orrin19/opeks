// Bot settings
const Discord = require("discord.js");
const ytdl = require('ytdl-core');
const bot = new Discord.Client();
const queue = new Map();
const prefix = "!";
const ownerID = process.env.OWNER_ID;

const superagent = require("superagent");

/*
const gay = "RenesSans";
const suka = "288";
const pidor = "Кенни";
const lobotomitis = "%&&%";
*/

let roulette
/*function roulette_reset() {
  let roulette = [10, 0, 0, 0, 0, 0, 0];
  roulette[getRandArrIndex(roulette)] = 1
};
roulette_reset()*/

// Database connection
const data = require("./database.json");
const database = data.database;
const databasenames = data.databasenames;
const databaseicons = data.databaseicons;
const joke = data.joke;

// Bot connection
bot.login(process.env.TOKEN);
bot.on("ready", () => {
  bot.user.setPresence({
    status: "dmd",
    game: {
      name: "Sabaton",
      type: 2
    }
  })
});

// Logs and Anti-Sleep
const http = require("http");
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
  bot.channels.get(process.env.POOP_CHANNEL).send(`:poop:`)
}, 60000);

// Math functions
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
function getRandArrIndex(arr) {
  return Math.floor(Math.random() * arr.length);
}

// !say
bot.on("message", async message => {
  if (message.author.bot) return;
  if (
    message.content.startsWith(prefix + "say") &&
    message.author.id === ownerID
  ) {
    await message.delete();
    message.channel.send(message.content.slice(5));
  }
});

// !invite
bot.on("message", async message => {
  if (message.author.bot) return;
  if (message.content.startsWith(prefix + "invite")) {
    message.channel.send(`https://discord.com/api/oauth2/authorize?client_id=672043257219252224&permissions=0&scope=bot`);
  }
});

// !help
bot.on("message", async message => {
  if (message.author.bot) return;
  if (message.content.startsWith(prefix + "help")) {
    const help = new Discord.RichEmbed()
      .setAuthor("Доступные команды — Opeks")
      .setColor("#ad1914")
      .setThumbnail(bot.user.displayAvatarURL)
      .addField(
        "!roll",
        "Введите *!roll* **аргумент**, чтобы получить случайное число от 1 до указанного в аргументе числа. По умолчанию аргумент равен 20."
      )
      .addField(
        "!chance",
        "Введите *!chance* **вероятность действие**, чтобы узнать, выполнилось ли задуманное действие. Укажите через пробел вероятность в процентах (1-99) и само действие. Если не указать вероятность, она будет равной 50%."
      )
      .addField(
        "!анекдот",
        "Введите *!анекдот*, чтобы Opeks рассказал вам анекдот."
      )
      .addField(
        "!database",
        "Введите *!database* **аргумент**, чтобы открыть ячейку базы данных. В качестве аргумента укажите номер ячейки."
      )
      .addField(
        "!server-info",
        "Введите *!server-info*, чтобы получить информацию о сервере."
      )
      .addField(
        "!Opeks-info",
        "Введите *!Opeks-info*, чтобы получить информацию о боте."
      )
      .addField(
        "!чистка",
        "Введите *!чистка* **аргумент**, чтобы удалить необходимое количество сообщений. В качестве аргумента укажите число от 1 до 99."
      )
      .setFooter("Opeks powered by Оррин")
      .setTimestamp(new Date());
    message.reply("привет! Я — Opeks! Чем могу быть полезен?");
    message.channel.send(help);
  }
});

// !Привет
bot.on("message", async message => {
  if (message.author.bot) return;
  if (message.content.startsWith(prefix + "Привет")) {
    message.channel.send(`Привет, ${message.author}`);
  }
});

// Local jokes
bot.on("message", async message => {
  if (message.author.bot) return;
  if (message.content.startsWith(prefix + "time")) {
    let time = new Date();
    message.channel.send(time)//new Date());
                         }
  if (message.content.startsWith(prefix + 'монетка')) {
      let answer = [
          'Выпал «орёл».',
          'Выпала «решка».'
      ]
      message.channel.send(answer[getRandArrIndex(answer)])
  }
  if (message.content.startsWith(prefix + "проверканапидора")) {
    let answer = [
      'ты пидор!',
      'ты не пидор!'
      ];
    message.reply(answer[getRandArrIndex(answer)])
  };
  //  if (message.content.includes("ОФС")) {
  //    message.channel.send(`Да-да, дети голодают! :cucumber:`);
  //  }
  //  if (message.content.includes("Керенко")) {
  //    message.channel.send(`:prince: :gun:`);
  //  }
  //  if (message.content.includes("ельтан")) {
  //    message.channel.send("ОРКИ!!!");
  //  }
  if (message.content.includes("урк")) {
    message.channel.send(`:ambulance:`);
  }
  if (message.content.includes("Ave Maria")) {
    message.channel.send('DEUS VULT!');
  }
  /*
  if (message.content.includes(gay)) {
    let Agay = [
      `И, всё-таки, он — :regional_indicator_g: :regional_indicator_a: :regional_indicator_y:...`,
      `${gay} — настоящий :regional_indicator_g: :regional_indicator_a: :regional_indicator_y:! Все это знают.`,
      `${gay} — :regional_indicator_g: :regional_indicator_a: :regional_indicator_y:.`,
      `:regional_indicator_g: :regional_indicator_a: :regional_indicator_y:. Не правда ли? Он похож на него.`
    ];
    message.channel.send(Agay[getRandArrIndex(Agay)]);
  }
  if (message.content.includes(suka)) {
    let Asuka = [
      `И, всё-таки, он — :regional_indicator_s: :regional_indicator_u: :regional_indicator_k: :regional_indicator_a:...`,
      `${suka} — настоящая :regional_indicator_s: :regional_indicator_u: :regional_indicator_k: :regional_indicator_a:! Все это знают.`,
      `${suka} — :regional_indicator_s: :regional_indicator_u: :regional_indicator_k: :regional_indicator_a:.`,
      `:regional_indicator_s: :regional_indicator_u: :regional_indicator_k: :regional_indicator_a:. Не правда ли? Он похож на неё.`
    ];
    message.channel.send(Asuka[getRandArrIndex(Asuka)]);
  }
  if (message.content.includes(pidor)) {
    let Apidor = [
      `И, всё-таки, он — :regional_indicator_p: :regional_indicator_i: :regional_indicator_d: :regional_indicator_o: :regional_indicator_r:...`,
      `${pidor} — настоящий :regional_indicator_p: :regional_indicator_i: :regional_indicator_d: :regional_indicator_o: :regional_indicator_r:! Все это знают.`,
      `${pidor} — :regional_indicator_p: :regional_indicator_i: :regional_indicator_d: :regional_indicator_o: :regional_indicator_r:.`,
      `:regional_indicator_p: :regional_indicator_i: :regional_indicator_d: :regional_indicator_o: :regional_indicator_r:. Не правда ли? Он похож на него.`
    ];
    message.channel.send(Apidor[getRandArrIndex(Apidor)]);
  }
  if (message.content.includes(lobotomitis)) {
    let Alobotomitis = [
      `И, всё-таки, он — :regional_indicator_l: :regional_indicator_o: :regional_indicator_b: :regional_indicator_o: :regional_indicator_t: :regional_indicator_o: :regional_indicator_m: :regional_indicator_i: :regional_indicator_t:...`,
      `${lobotomitis} — настоящий :regional_indicator_l: :regional_indicator_o: :regional_indicator_b: :regional_indicator_o: :regional_indicator_t: :regional_indicator_o: :regional_indicator_m: :regional_indicator_i: :regional_indicator_t:! Все это знают.`,
      `${lobotomitis} — :regional_indicator_l: :regional_indicator_o: :regional_indicator_b: :regional_indicator_o: :regional_indicator_t: :regional_indicator_o: :regional_indicator_m: :regional_indicator_i: :regional_indicator_t:.`,
      `:regional_indicator_l: :regional_indicator_o: :regional_indicator_b: :regional_indicator_o: :regional_indicator_t: :regional_indicator_o: :regional_indicator_m: :regional_indicator_i: :regional_indicator_t:. Не правда ли? Он похож на него.`
    ];
    message.channel.send(Alobotomitis[getRandArrIndex(Alobotomitis)]);
  }
  */
  if (message.content.includes("Ведьмак")) {
    let st1 = [
      "Однажды скромный бард, покинув свой причал,",
      "Когда они пришли, решив меня сгубить,",
      "Он хоть на край земли отправиться готов,",
      "Он бьет не в бровь, а в глаз, был ранен много раз,"
    ];
    let st2 = [
      "Отправился в путь и ведьмака повстречал!",
      "Разбив мою лютню, пытаясь убить...",
      "Сразить всех чудовищ и орды врагов!",
      "Спаситель невинных и всех, кого спас!"
    ];
    let st3 = [
      "То Геральт Белый Волк, о нём я буду петь,",
      "Когда злобный бес стоял надо мной,",
      "Он эльфов злых прогнал за дальний перевал,",
      "К чему эта вражда? Никак я не пойму!"
    ];
    let st4 = [
      "Что дьявольских эльфов сумел одолеть!",
      "То Геральт воскликнул: «Эй, братец, постой!»",
      "В высокие горы, на вечный привал.",
      "Он нас защищает — так налейте ж ему!"
    ];
    let quart = getRandArrIndex(st1);
    message.channel.send(`${st1[quart]}\n${st2[quart]}\n${st3[quart]}\n${st4[quart]}\n\nВедьмаку заплатите чеканной монетой, чеканной монетой, во-о-о-оу!\nВедьмаку заплатите, зачтётся всё э-э-это-о-о вам!`)
  }
});

// !roll
bot.on("message", async message => {
  if (message.author.bot) return;
  if (message.content.startsWith(prefix + "roll")) {
    let args = message.content.slice(6);
    let value = args;
    if (!args[0]) {
      value = 20;
    }
    if (Number(value) !== 1 * value) return message.reply("Введите верхний порог!")
    const pseudoroll = new Discord.RichEmbed()
      .setAuthor(`Случайное число от 1 до ${value}`)
      .setColor("#ad1914")
      .addField("Выпало значение:", `**${getRandomInt(value) + 1}**`)
      .setFooter("Opeks powered by Оррин")
      .setTimestamp(new Date());
    message.channel.send(pseudoroll);
  }
});

// !chance
bot.on("message", async message => {
  if (message.author.bot) return;
  function fchancecell(action, answer, chance) {
    const chancecell = new Discord.RichEmbed()
      .setAuthor("Вероятность происшествия действия")
      .setColor("#ad1914")
      .addField("Действие:", action)
      .addField("Автор:", message.author)
      .addField("Вероятность удачи:", `${chance}%`)
      .addField("Удачность:", answer[getRandArrIndex(answer)])
      .setFooter("Opeks powered by Оррин")
      .setTimestamp(new Date());
    message.channel.send(chancecell);
  }
  function fchance(chance, action) {
    let w = getRandomInt(100) + 1;
    if (w <= chance) {
      let answer = [
        "Да!",
        "Определённо, да!",
        "Да, всё верно!",
        "Да, всё именно так!"
      ];
      fchancecell(action, answer, chance);
    } else {
      let answer = [
        "Нет!",
        "Определённо, нет!",
        "Нет, к сожалению...",
        "Увы, нет."
      ];
      fchancecell(action, answer, chance);
    }
  }
  function fch(message, slice) {
    let args = message.content.slice(slice);
    if (!args[0])
      return message.reply("Введите вероятность происшествия действия!");
    let chance;
    if (args[1] === ' ') {
      chance = args[0]
    } else {
      chance = args[0] + args[1];
    }
    let action = args.slice(2);
    if (Number(chance) !== 1 * chance) {
      fchance(50, args);
    } else {
      fchance(chance, action);
    }
  }
  if (message.content.startsWith(prefix + "chance")) {
    fch(message, 8)
  };
  if (message.content.startsWith(prefix + "c")) {
    fch(message, 3)
  }
});

// !database
bot.on("message", async message => {
  if (message.author.bot) return;
  if (message.content.startsWith(prefix + "database")) {
    let content = message.content.slice(10);
    let index = 0;
    for (let i = 0; i <= databasenames.length; i++) {
      if (databasenames[i] === content) {
        let index = i;
        const databasecell = new Discord.RichEmbed()
          .setAuthor("База данных Opeks")
          .setColor("#ad1914")
          .setThumbnail(databaseicons[index])
          .addField(content, database[index])
          .setFooter("Opeks powered by Оррин")
          .setTimestamp(new Date());
        message.channel.send(databasecell);
      }
    }
  }
});

// !анекдот (jokes from the S.T.A.L.K.E.R. game)
bot.on("message", async message => {
  if (message.author.bot) return;
  if (message.content.startsWith(prefix + "анекдот")) {
    let value = getRandArrIndex(joke);
    const jokecell = new Discord.RichEmbed()
      .setAuthor(`Внимание, анекдот!`)
      .setColor("#ad1914")
      .addField(`№${value}`, joke[value])
      .setFooter("Opeks powered by Оррин")
      .setTimestamp(new Date());
    message.channel.send(jokecell);
  }
});

// !server-info
bot.on("message", async message => {
  if (message.author.bot) return;
  if (message.content.startsWith(prefix + "server-info")) {
    let sicon = message.guild.iconURL;
    let serverembed = new Discord.RichEmbed()
      .setAuthor("Информация о сервере")
      .setColor("#ad1914")
      .setThumbnail(sicon)
      .addField("Название", message.guild.name)
      .addField("Владелец", message.guild.owner, true)
      .addField("Регион", message.guild.region, true)
      .addField("Всего участников", message.guild.memberCount, true)
      .addField("Создан", message.guild.createdAt)
      .addField("Вы присоединились", message.member.joinedAt)
      .setFooter("Opeks powered by Оррин")
      .setTimestamp(new Date());
    message.channel.send(serverembed);
  }
});

// !Opeks-info
bot.on("message", async message => {
  if (message.author.bot) return;
  if (message.content.startsWith(prefix + "Opeks-info")) {
    let opeksinfo = new Discord.RichEmbed()
      .setAuthor("Информация о боте")
      .setColor("#ad1914")
      .setThumbnail(bot.user.displayAvatarURL)
      .addField("Имя бота", "Opeks")
      .addField("Создан", bot.user.createdAt)
      .addField("Автор", "Оррин")
      .setFooter("Opeks powered by Оррин")
      .setTimestamp(new Date());
    message.channel.send(opeksinfo);
  }
});

// !чистка
bot.on("message", async message => {
  if (message.author.bot) return;
  if (message.content.startsWith(prefix + "чистка")) {
    let messageArray = message.content.split(" ");
    let args = messageArray.slice(1);
    let amount = parseInt(args[0]) + 1;
    let messCount = args[0];
    if (isNaN(amount)) return message.reply("введите количество сообщений, которые нужно удалить.");
    if (amount <= 1 || amount > 100) return message.reply("необходимо ввести число от 1 до 99.");
    if (!message.member.hasPermission("MANAGE_MESSAGES") && message.author.id !== ownerID) return message.reply("Вам недоступна эта функция.");
    message.channel.bulkDelete(amount, true);
    message.channel
        .send(`Удалено ${messCount} сообщений!`)
        .then(msg => msg.delete(5000));
    bot.channels.get(process.env.LOG_CHANNEL).send(`${message.author} удалил ${amount-1} сообщений в канале ${message.channel} (${message.guild}).`)
  }
});

// !mute
bot.on("message", async message => {
  if (message.author.bot) return;
  if (message.content.startsWith(prefix + "mute")) {
    let args = message.content.split(' ').slice(1);
    let mUser = message.guild.member(message.mentions.users.first() || message.guild.members.find(m => m.user.username == args[0] || m.id == args[0]));
    if (!mUser) return message.channel.send("Не могу найти этого пользователя...");
    if (!message.member.hasPermission("MANAGE_MESSAGES") && message.author.id !== ownerID) return message.channel.send("У тебя недостаточно прав для этого");
    if (mUser.hasPermission("MANAGE_MESSAGES") || mUser.id === ownerID) return message.channel.send("Этот пользователь не может быть заглушен");
    let reason = args.slice(1).join(' ');
    let muterole = message.guild.roles.find(r => r.name == 'Заглушен');
    if (!muterole) muterole = await message.guild.createRole({
      name: 'Заглушен',
      color: 0x607d8d
    });
    if (mUser.roles.has(muterole.id)) return message.channel.send("Этот пользователь уже заглушен!");
    await mUser.addRole(muterole.id);
    let muteEmbed = new Discord.RichEmbed()
      .setDescription("Глушение пользователя")
      .setColor("#ad1914")
      .addField("Заглушенный пользователь:", mUser)
      .addField("Был заглушен:", message.author)
      .addField("Дата:", message.createdAt)
      .addField("Причина:", reason)
      .setFooter("Opeks powered by Оррин")
      .setTimestamp(new Date());
    message.channel.send(muteEmbed);
    bot.channels.get(process.env.LOG_CHANNEL).send(`${message.author} заглушил ${mUser} на сервере ${message.guild} по причине: ${reason}`)
  }
});

// !kick
bot.on("message", async message => {
  if (message.author.bot) return;
  if (message.content.startsWith(prefix + "kick")) {
    let args = message.content.split(' ').slice(1);
    let kUser = message.guild.member(message.mentions.users.first() || message.guild.members.find(m => m.user.username == args[0] || m.id == args[0]));
    if (!kUser) return message.channel.send("Не могу найти этого пользователя...");
    if (!message.member.hasPermission("MANAGE_MESSAGES") && message.author.id !== ownerID) return message.channel.send("У тебя недостаточно прав для этого");
    if (kUser.hasPermission("MANAGE_MESSAGES") || kUser.id === ownerID) return message.channel.send("Этот пользователь не может быть кикнут");
    let reason = args.slice(1).join(' ');
    await kUser.kick(reason);
    let kickEmbed = new Discord.RichEmbed()
      .setDescription("Кик пользователя")
      .setColor("#ad1914")
      .addField("Кикнутый пользователь:", kUser)
      .addField("Был кикнут:", message.author)
      .addField("Дата:", message.createdAt)
      .addField("Причина:", reason)
      .setFooter("Opeks powered by Оррин")
      .setTimestamp(new Date());
    message.channel.send(kickEmbed);
    bot.channels.get(process.env.LOG_CHANNEL).send(`${message.author} кикнул ${kUser} на сервере ${message.guild} по причине: ${reason}`)
  }
});

// !ban
bot.on("message", async message => {
  if (message.author.bot) return;
  if (message.content.startsWith(prefix + "ban")) {
    let args = message.content.split(' ').slice(1);
    let bUser = message.guild.member(message.mentions.users.first() || message.guild.members.find(m => m.user.username == args[0] || m.id == args[0]));
    if (!bUser) return message.channel.send("Пользователь не найден");
    if (!message.member.hasPermission("MANAGE_MESSAGES") && message.author.id !== ownerID ) return message.channel.send("У тебя недостаточно прав для этого");
    if( bUser.hasPermission("MANAGE_MESSAGES") || bUser.id === ownerID) return message.channel.send("Этот пользователь не может быть заблокирован");
    let reason = args.slice(1).join(' ');
    await bUser.ban(reason);
    let banEmbed = new Discord.RichEmbed()
      .setDescription("Блокировка пользователя")
      .setColor("#ad1914")
      .addField("Заблокированный пользователь:", bUser)
      .addField("Был заблокирован:", message.author)
      .addField("Дата:", message.createdAt)
      .addField("Причина:", reason)
      .setFooter("Opeks powered by Оррин")
      .setTimestamp(new Date());
    message.channel.send(banEmbed);
    bot.channels.get(process.env.LOG_CHANNEL).send(`${message.author} заблокировал ${bUser} на сервере ${message.guild} по причине: ${reason}`)
  }
});

// !gr
bot.on("message", async message => {
  if (message.author.bot) return;
  if (message.content.startsWith(prefix + "gr") && (message.author.id == ownerID)) {
    await message.delete();
    let args = message.content.split(' ').slice(1);
    let user = message.guild.member(message.mentions.users.first() || message.guild.members.find(m => m.user.username == args[0] || m.id == args[0]));
    let role = message.guild.roles.find(r => r.name === args[1]);
    user.addRole(role.id)
  }
});

// !rr
bot.on("message", async message => {
  if (message.author.bot) return;
  if (message.content.startsWith(prefix + "gr") && (message.author.id == ownerID)) {
    await message.delete();
    let args = message.content.split(' ').slice(1);
    let user = message.guild.member(message.mentions.users.first() || message.guild.members.find(m => m.user.username == args[0] || m.id == args[0]));
    let role = message.guild.roles.find(r => r.name === args[1]);
    user.removeRole(role.id)
  }
});

// !голосование
bot.on("message", async message => {
  if (message.author.bot) return;
  if (message.content.startsWith(prefix + "голосование")) {
    let args = message.content.split(' ').slice(1);
    let variables = args.slice(1).join();
    variables = variables.split("|");
    if (args[0] === 'вар') {
      let embed = new Discord.RichEmbed()
        .setDescription("Голосование")
        .setColor("#ad1914")
        .addField("Описание:", variables[0])
        .addField("Варианты:", variables.slice(1).join("\n "))
        .setFooter("Opeks powered by Оррин")
        .setTimestamp(new Date());
      message.channel.send(embed).then(message => {
        let i;
      function reactionLoop() {
            setTimeout(function() {
              if (i == 1) message.react("1️⃣");
              if (i == 2) message.react("2️⃣");
              if (i == 3) message.react("3️⃣");
              if (i == 4) message.react("4️⃣");
              if (i == 5) message.react("5️⃣");
              if (i == 6) message.react("6️⃣");
              if (i == 7) message.react("7️⃣");
              if (i == 8) message.react("8️⃣");
              if (i == 9) message.react("9️⃣");
              if (i == 10) message.react("0️⃣");
              i++;
              if (i < variables.length + 1) {
                reactionLoop();
              }
            }, 500);
      }
      reactionLoop();
      })
    }
  }
});

// !рулетка
bot.on("message", async message => {
  function roulette_reset() {
    let roulette = [0, 0, 0, 0, 0, 0, 0];
    let rand = getRandArrIndex(roulette);
    if (rand == 0) {
      rand = 1
    };
    roulette[rand] = 1
  };
  if (message.author.bot) return;
  if (message.content.startsWith(prefix + "рулетка-сброс")) {
    message.channel.send("Перезаряжаю револьвер...");
    await roulette_reset();
    message.channel.send("Револьвер перезаряжен!")
  };
  if (message.content.startsWith(prefix + "рулетка") && !message.content.startsWith(prefix + "рулетка-сброс")) {
    let arg = message.content.slice(9);
    arg = arg[0];
    message.channel.send(arg);
    message.channel.send(roulette.join(' '));
    if (arg > 6 || arg < 1 || Number(arg) !== 1 * arg) return message.reply("укажите в аргументе число от 1 до 6!");
    if (roulette[arg] == 0) {
      roulette[arg] = 2
      let reply = [
        "ты однозначно везучий!",
        "тебе повезло! Ты выжил.",
        "сегодня твой день, везунчик.",
        "удачный выбор. Ты победил!",
        "да ты везунчик!",
        "сегодня тебе повезло. Но в следующий раз..."
      ];
      message.reply(reply[getRandArrIndex(reply)])
    }
    if (roulette[arg] == 2) {
      let reply = [
        "так уже стреляли ведь!",
        "не повторяемся!"
      ];
      message.reply(reply[getRandArrIndex(reply)])
    }
    if (roulette[arg] == 1) {
      let reply = [
        "ты убит, дружок!",
        "БА-БАХ! И ты умер."
      ];
      message.reply(reply[getRandArrIndex(reply)]);
      message.channel.send("Перезаряжаю револьвер...");
      await roulette_reset();
      message.channel.send("Револьвер перезаряжен!")
    }
  }
});

// !nekos-life
bot.on("message", async message => {
  if (message.author.bot) return;
  if (message.content.startsWith(prefix + "nekos-life")) {
    if (!message.channel.nsfw) return message.reply('команда может использоваться только в канале NSFW.');
    let category = message.content.split(' ').slice(1);
    let { body } = await superagent.get(
      `https://nekos.life/api/v2/img/${category}`
    );
    let embed = new Discord.RichEmbed()
      .setColor("#ad1914")
      .setImage(body.url)
      .setFooter("Opeks powered by Оррин")
      .setTimestamp(new Date());
    message.channel.send(embed);
  }
});

bot.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.find(ch => ch.name === 'приветствия');
  if (!channel) return;
  let role = member.guild.roles.find(r => r.name == 'Начинающий');
  await member.addRole(role.id);
  channel.send(`Здравствуй, ${member}! Ты попал на сервер нашей ролевой военно-политической игры «Ламоран». Действие происходит на одноимённом континенте, полном разнообразных стран. Стоит напомнить, что в канале #собственно-впи действует режим Role-Play, и не стоит писать туда, не выбрав страну. Напиши одному из наших администраторов, чтобы они проконсультировалии тебя, рассказали про свободные страны. Они выдадут тебе роль и ты сможешь начать игру.\n 
С чего начать?\n
1) Попробуй описать внутреннюю обстановку страны, провести реформы, заняться своими городами.\n
2) Наладь отношения с соседями, или ухудши их, ведя к войне.\n
Далее твоя игра, скорее всего, пойдёт сама по себе. Удачи, и ждём тебя в игре!\n
Ссылка на карту: https://media.discordapp.net/attachments/709012285028433970/712932319517736980/ef3313fe797004ea.png?width=1219&height=679`)
});

////////////////////////////////////////////////////////
////////////////Games///////////////////////////////////
////////////////////////////////////////////////////////
const maps = require("./maps.json");
const kmaps = Object.keys(maps);
const vmaps = Object.values(maps);
let chgameid = 0;
let game = 0;
let cell = 0;

bot.on("message", async message => {
  if (message.author.bot) return;
  if (message.channel.id === chgameid) {
    if (game === "map") {
      for (let i of vmaps[cell]) {
        if (message.content.includes(i)) {
          chgameid = 0;
          cell = 0;
          game = 0;
          return message.reply("правильно!")
        }
      };
      return message.reply("неверно!")
    }
  }
});

bot.on("message", async message => {
  if (message.author.bot) return;
  if (message.content.startsWith(prefix + "игра")) {
    chgameid = message.channel.id;
    let args = message.content.split(' ').slice(1);
    if (args[0] === 'карта-страна') {
      game = "map";
      cell = getRandArrIndex(kmaps);
      let embed = new Discord.RichEmbed()
        .setDescription("Игра «Карта — Страна»")
        .setColor("#ad1914")
        .addField("Что написать в ответе:", "Название страны, изображённой на карте.")
        .setImage(kmaps[cell])
        .setFooter("Opeks powered by Оррин")
        .setTimestamp(new Date());
      message.channel.send(embed)
    }
  }
});

// !порфирьевич (не работает)
bot.on("message", async message => {
  if (message.author.bot) return;
  if (message.content.startsWith(prefix + "порфирьевич")) {
    let args = message.content.split(' ').slice(1);
    let post = {prompt: args, length: 30, num_samples: 4}
    let response = await fetch('https://models.dobro.ai/gpt2/medium/', {
      method: 'POST',
      body: post
    }); 
    let { result } = await response.json();
    let answer = getRandArrIndex(result['replies']);
    message.channel.send(answer);
  }
});

// !google-images (нужна платная подписка на serpapi, а у меня денег нет ¯\_(ツ)_/¯)
bot.on("message", async message => {
  if (message.author.bot) return;
  if (message.content.startsWith(prefix + "google-images")) {
    let category = message.content.split(' ').slice(1).join(' ');
    let { body } = await superagent.get(
      `https://serpapi.com/search?q=${category}&tbm=isch&ijn=0`
    );
    let results = body.images_results;
    if (!results) return message.reply("произошла ошибка.")
    for (let i; i < 5; i++) {
      let res = results[i];
      let embed = new Discord.RichEmbed()
        .setColor("#ad1914")
        .setImage(res.original)
        .setFooter("Opeks powered by Оррин")
        .setTimestamp(new Date());
      message.channel.send(embed);
    }
  }
});

///////////////////////////////
//////MUSIC////////////////////
///////////////////////////////
bot.once('ready', () => {
	console.log('Ready!');
});

bot.once('reconnecting', () => {
	console.log('Reconnecting!');
});

bot.once('disconnect', () => {
	console.log('Disconnect!');
});

bot.on('message', async message => {
	if (message.author.bot) return;
	if (!message.content.startsWith(prefix)) return;

	const serverQueue = queue.get(message.guild.id);

	if (message.content.startsWith(`${prefix}play`)) {
		execute(message, serverQueue);
		return;
	} else if (message.content.startsWith(`${prefix}skip`)) {
		skip(message, serverQueue);
		return;
	} else if (message.content.startsWith(`${prefix}stop`)) {
		stop(message, serverQueue);
		return;
	}
});

async function execute(message, serverQueue) {
	const args = message.content.split(' ');

	const voiceChannel = message.member.voiceChannel;
	if (!voiceChannel) return message.channel.send('Тебе нужно находиться в голосовом канале, чтобы заказать музыку!');
	const permissions = voiceChannel.permissionsFor(message.client.user);
	if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
		return message.channel.send('Мне нужны права на использование голосового чата!');
	}

	const songInfo = await ytdl.getInfo(args[1]);
	const song = {
		title: songInfo.videoDetails.title,
		url: songInfo.videoDetails.video_url,
	};

	if (!serverQueue) {
		const queueContruct = {
			textChannel: message.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true,
		};

		queue.set(message.guild.id, queueContruct);

		queueContruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueContruct.connection = connection;
			play(message.guild, queueContruct.songs[0]);
      message.channel.send(`Сейчас играет: «${song.title}»`);
		} catch (err) {
			console.log(err);
			queue.delete(message.guild.id);
			return message.channel.send(err);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		return message.channel.send(`«${song.title}» была добавлена в очередь.`);
	}

}

function skip(message, serverQueue) {
	if (!message.member.voiceChannel) return message.channel.send('Тебе нужно находиться в голосовом канале, чтобы пропустить песню!');
	if (!serverQueue) return message.channel.send('Сейчас не играет никакая песня, пропускать нечего!');
	serverQueue.connection.dispatcher.end();
  message.channel.send('Песня пропущена.');
}

function stop(message, serverQueue) {
	if (!message.member.voiceChannel) return message.channel.send('Тебе нужно находиться в голосовом канале, чтобы остановить музыку!');
	serverQueue.songs = [];
	serverQueue.connection.dispatcher.end();
  return message.channel.send('Музыка остановлена.');
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', () => {
			console.log('Music ended!');
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => {
			console.error(error);
		});
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}
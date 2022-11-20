import Discord from 'discord.js';

const formateDate = (date: Date) =>
  Discord.time(Math.floor(+date / 1000), 'F') +
  ' (' +
  Discord.time(Math.floor(+date / 1000), 'R') +
  ')';

const getTime = (input: number) => {
  const ms = parseInt(input.toString(), 10),
    hrs = Math.floor(ms / 3600),
    min = Math.floor((ms - 3600 * hrs) / 60),
    sec = ms - 3600 * hrs - 60 * min;
  return [
    hrs.toString().padStart(2, '0'),
    min.toString().padStart(2, '0'),
    sec.toString().padStart(2, '0'),
  ].join(':');
};

const getRandomInt = (max: number) =>
  Math.floor(Math.random() * Math.floor(max));

const getRandArrIndex = (arr: Array<any>) =>
  Math.floor(Math.random() * arr.length);

const getRandArrElement = (arr: Array<any>) => arr[getRandArrIndex(arr)];

export {
  formateDate,
  getTime,
  getRandomInt,
  getRandArrIndex,
  getRandArrElement,
};

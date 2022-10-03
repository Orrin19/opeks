import Discord from 'discord.js';

const formateDate = (date: Date) => {
  return (
    Discord.time(Math.floor(+date / 1000), 'F') +
    ' (' +
    Discord.time(Math.floor(+date / 1000), 'R') +
    ')'
  );
  /*return date.toLocaleDateString('ru', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }) as string;*/
};

const getRandomInt = (max: number) =>
  Math.floor(Math.random() * Math.floor(max));

const getRandArrIndex = (arr: Array<any>) =>
  Math.floor(Math.random() * arr.length);

const getRandArrElement = (arr: Array<any>) => arr[getRandArrIndex(arr)];

export { formateDate, getRandomInt, getRandArrIndex, getRandArrElement };

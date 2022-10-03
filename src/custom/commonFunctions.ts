const formateDate = (date: Date) => {
  return date.toLocaleDateString('ru', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }) as string;
};

const getRandomInt = (max: number) =>
  Math.floor(Math.random() * Math.floor(max));

const getRandArrIndex = (arr: Array<any>) =>
  Math.floor(Math.random() * arr.length);

const getRandArrElement = (arr: Array<any>) => arr[getRandArrIndex(arr)];

export { formateDate, getRandomInt, getRandArrIndex, getRandArrElement };

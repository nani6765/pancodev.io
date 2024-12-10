const MAX_VALUE = 950;
const ARRAY_LENGTH = 100;
const PEEK = 70;

const calculateValue = (index: number) => {
  if (index <= PEEK) {
    return Math.round(MAX_VALUE * Math.sin((Math.PI / 2) * (index / PEEK)));
  }
  return Math.round(
    MAX_VALUE *
      Math.sin((Math.PI / 2) * ((ARRAY_LENGTH - index) / (ARRAY_LENGTH - PEEK)))
  );
};

export const dummy = Array.from({ length: ARRAY_LENGTH }, (_, index) => [
  index,
  calculateValue(index),
]);

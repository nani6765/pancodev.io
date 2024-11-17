export const insertDotByPosition = (input: number, position: number) => {
  const withDot =
    `${input}`.slice(0, position) + "." + `${input}`.slice(position);
  return Number(withDot);
};

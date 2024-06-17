// https://github.com/processing/p5.js/blob/5ad11796045cd928889c9b3d76566593cb01bb18/src/math/calculation.js#L397

export function map(
  value: number,
  from: number,
  to: number,
  min: number,
  max: number,
  bound = false,
) {
  const result = ((value - from) / (to - from)) * (max - min) + min;
  if (bound) {
    return result > max ? max : result < min ? min : result;
  }

  return result;
}

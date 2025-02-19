export interface Paint<T> {
  color: T;
  ratio: number;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export function interpolateMix(...paints: Paint<RGB>[]): RGB {
  const totalWeight = paints.reduce((sum, paint) => sum + paint.ratio, 0);

  return {
    r: Math.round(
      paints.reduce(
        (r, paint) => r + (paint.color.r * paint.ratio) / totalWeight,
        0
      )
    ),
    g: Math.round(
      paints.reduce(
        (g, paint) => g + (paint.color.g * paint.ratio) / totalWeight,
        0
      )
    ),
    b: Math.round(
      paints.reduce(
        (b, paint) => b + (paint.color.b * paint.ratio) / totalWeight,
        0
      )
    ),
  };
}

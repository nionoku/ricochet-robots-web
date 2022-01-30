function transpose<T>(matrix: Array<Array<T>>): Array<Array<T>> {
  return matrix[0].map((_, i) => matrix.map((row) => row[i]));
}

/**
 * Rotate matrix
 */
export function rotateMatrix<T>(matrix: Array<Array<T>>, quarter: number): Array<Array<T>> {
  const calcQuarter = quarter <= 3 ? quarter : quarter - 3;

  switch (calcQuarter) {
    case 0: {
      return matrix;
    }

    case 1: {
      return transpose(matrix).reverse();
    }

    case 2: {
      return transpose(transpose(matrix.reverse()).reverse());
    }

    case 3: {
      return transpose(matrix.reverse());
    }

    default: {
      throw new Error(`'${quarter}' is unsupport quarter`);
    }
  }
}

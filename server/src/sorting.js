export function normalizeArrayInput(numbers) {
  if (!Array.isArray(numbers)) {
    throw new Error('numbers must be an array');
  }
  return numbers.map((value) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      throw new Error('Array must contain only finite numbers');
    }
    return Math.trunc(numericValue);
  });
}

export function lab2Sort(numbers) {
  const arr = normalizeArrayInput(numbers);
  const data = [...arr];

  let gap = data.length;
  const shrink = 1.3;
  let sorted = false;

  while (!sorted) {
    // уменьшение шага
    gap = Math.floor(gap / shrink);
    if (gap <= 1) {
      gap = 1;
      sorted = true;
    }

    // проход по массиву
    let i = 0;
    while (i + gap < data.length) {
      if (data[i] > data[i + gap]) {
        const temp = data[i];
        data[i] = data[i + gap];
        data[i + gap] = temp;
        sorted = false;
      }
      i++;
    }
  }

  return data;
}

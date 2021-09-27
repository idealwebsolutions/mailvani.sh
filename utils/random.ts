export function pickFromArray (strings: string[]) {
  if (!strings.length) {
    throw new RangeError('No options to pick from');
  }
  return strings.length === 1 ? strings[0] : strings[Math.floor(Math.random() * strings.length)];
}
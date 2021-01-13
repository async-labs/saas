import { sum } from '../../../server/utils/sum';

console.log(sum(1, 2));

describe.skip('testing sum function', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
  });
});

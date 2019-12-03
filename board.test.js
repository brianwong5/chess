const board = require("./js/board");

describe("index and square conversions", () => {
  test("squareToIndex", () => {
    // a1: 0, b1: 1, ..., h8: 63
    let expected = 0;
    for (const rank of "12345678") {
      for (const file of "abcdefgh") {
        expect(board.squareToIndex(`${file}${rank}`)).toBe(expected++);
      }
    }
  });
});

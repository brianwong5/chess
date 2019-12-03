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
  test("indexToSquare", () => {
    // same as above but reverse
    let expected = 0;
    for (const rank of "12345678") {
      for (const file of "abcdefgh") {
        expect(board.indexToSquare(expected++)).toBe(`${file}${rank}`);
      }
    }
  });
});

describe("board representation conversions", () => {
  test("fenPiecesToArray", () => {
    // starting pos
    const arr = [
      "R","N","B","Q","K","B","N","R",
      "P","P","P","P","P","P","P","P",
      " "," "," "," "," "," "," "," ",
      " "," "," "," "," "," "," "," ",
      " "," "," "," "," "," "," "," ",
      " "," "," "," "," "," "," "," ",
      "p","p","p","p","p","p","p","p",
      "r","n","b","q","k","b","n","r"
    ]
    expect(board.fenPiecesToArr("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR")).toStrictEqual(arr);
  });
});

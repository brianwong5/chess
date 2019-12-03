const ranks = ["1", "2", "3", "4", "5", "6", "7", "8"];
const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const pieces = ["P","N","B","R","Q","K","p","n","b","r","q","k"];

// White: PNBRQK
// Black: pnbrqk
// Empty squares are noted using digits 1 through 8 (the number of empty squares)
// "/" separates ranks.
//
// active colour
//
// Castling availability
// https://www.chessable.com/blog/2019/05/17/how-to-castle-in-chess/
// Conditions:
// 1. king and chosen rook may not have moved
// 3. no pieces between king and chosen rook
// 4. king not currently in check
// 5. king mustn't pass through a square that is under attack by enemy pieces
// 6. king mustn't end up in check
//
// en passant target square (rank is 3 or 6) (file of pawn that just moved) or "-"
//
// halfmove clock: count of halfmoves (or ply) since the last pawn advance or capturing move.
// This value is used for the fifty move draw rule.
//
// fullmove number: This will have the value "1" for the first move of a game for both White and Black.
// Incremented by one immediately after each move by Black.
//
// starting position:
// "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

// LSF, or rank file mapping
// string -> number
const squareToIndex = ([file, rank]) =>
  ranks.indexOf(rank) * 8 + files.indexOf(file.toLowerCase());

const indexToFile = index => files[index & 7];
const indexToRank = index => ranks[index >> 3];

// number -> string
const indexToSquare = index => indexToFile(index) + indexToRank(index);

const bitboardToIndicies = bitboard => {
  const output = [];
  for (let i = 0n; i < bitboard.toString(2).length; ++i) {
    if (((bitboard >> i) & 1n) === 1n) {
      output.push(Number(i));
    }
  }
  return output;
}

const fenPiecesToArr = pieces => {
  const formatted =
    pieces.replace(/\d/g, match => " ".repeat(match)).replace(/\//g, "");

  return Array(64).fill().map((_, i) => formatted[i ^ 56]);
}

const arrToFenPieces = arr => {
  const formatted = arr.map((_, i) => arr[i ^ 56]);
  let output = "";
  let emptyCount = 0;
  for (let i = 0; i < formatted.length; ++i) {
    if (formatted[i] === " ") {
      ++emptyCount;
      if (formatted[i + 1] !== " " || files[i & 7] === "h") {
        output += emptyCount;
        emptyCount = 0;
      }
    }
    else {
      output += formatted[i];
    }
    if (i < 63 && files[i & 7] === "h") {
      output += "/";
    }
  }
  return output;
}

const arrToBitboard = array => {
  const bitboard = pieces.map(() => 0n);
  array.forEach((x, i) => {
    if (pieces.includes(x)) {
      bitboard[pieces.indexOf(x)] |= 1n << BigInt(i);
    }
  });
  return bitboard;
}

const bitboardToArr = bitboard => 
  bitboard.reduce((acc, cur, i) => {
    const converted = cur.toString(2)
      .split("")
      .map(x => x === "1" ? pieces[i] : "")
      .reverse();
    return acc.map((x, i) => converted[i] ? converted[i] : x);
  }, Array(64).fill(" "));

const fenPiecesToBitboard = pieces => arrToBitboard(fenPiecesToArr(pieces));
const bitboardToFenPieces = bitboard => arrToFenPieces(bitboardToArr(bitboard));

const fenToObj = fen => {
  const [
    pieces, side, castle, enPas, halfMove, fullMove
  ] = fen.split(" ");
  return {
    pieces: fenPiecesToBitboard(pieces),
    side,
    castle,
    enPas,
    halfMove: parseInt(halfMove) || 0,
    fullMove: parseInt(fullMove) || 1
  };
}

const objToFen = (obj) => {
  const [pieces, ...rest] = Object.values(obj)
  return [bitboardToFenPieces(pieces), ...rest].join(" ");
}

const printBoard = board => {
  const pieces = bitboardToArr(board.pieces);
  let output = "\n";
  for (const rank of [...ranks].reverse()) {
    output += rank + "  ";
    for (const file of files) {
      const tile = pieces[squareToIndex(`${file}${rank}`)];
      output += ` ${tile !== " " ? tile : "."} `;
    }
    output += "\n";
  }
  output += `\n    ${files.join("  ")}\n\n`;
  output += `Side: ${board.side}\n`;
  output += `Castle: ${board.castle}\n`;
  output += `En passant: ${board.enPas}\n`;

  return output;
}

// Keeps track of board state ONLY
// Does not handle move legality
class Board {
  constructor(fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1") {
    this.pos = fenToObj(fen);
  }
  ascii() {
    return printBoard(this.pos);
  }
  fen() {
    return objToFen(this.pos);
  }
  load(fen) {
    this.pos = fenToObj(fen);
  }
}

module.exports = Board;

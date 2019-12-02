// White: PNBRQK
// Black: pnbrqk
// Empty squares are noted using digits 1 through 8 (the number of empty squares)
// "/" separates ranks.
//
// active colour
//
// Castling availability
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
class Board {
  constructor() {
    // pieces - needs encoding - 12 bitboards (array length 12 of numbers)
    // active colour - boolean - true = white
    // castling availability - string
    // en passant target square - string
    // halfmove clock - number
    // fullmove number - number
  }
}

const fenPiecesToArr = pieces => {
  const arr = [];
  for (let i = j = 0; i < 64; ++i, ++j) {
    if (pieces[j] === "/") {
      --i;
      continue;
    }
    const converted = parseInt(pieces[j]);
    if (isNaN(converted)) {
      arr[i] = pieces[j];
      continue;
    }
    for (let k = i; k < i + converted; ++k) {
      arr[k] = " ";
    }
    i += converted - 1;
  }
  return arr;
}

const arrToBitboard = array =>
  pieces.map(piece =>
    array.reduce((acc, cur, i) => {
      if (cur === piece) {
        acc |= 1 << i;
      }
      return acc;
    }, 0)
  );

const fenToObj = fen => {
  const [
    pieces, active, castle, enPas, halfmove, fullmove
  ] = fen.split(" ");
  const board = {
    board: arrToBitboard(fenPiecesToArr(pieces)),
    whiteTurn: active === "w",
    castle,
    enPas,
    halfmove: parseInt(halfmove),
    fullmove: parseInt(fullmove)
  }
  return board;
}

const objToFen = obj => {

}

// string -> number
const squareToIndex = ([file, rank]) =>
  ranks.indexOf(parseInt(rank)) + files.indexOf(file.toLowerCase()) * 8;

// number -> string
const indexToSquare = index =>
  `${files[index % 8]}${ranks[Math.floor(index / 8)]}`;

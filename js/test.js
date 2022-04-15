const assertEquals = (expected, actual) => console.assert(expected === actual, `Expected: ${expected}, Actual: ${actual}`);
const assertTrue = condition => assertEquals(true, condition);
const assertFalse = condition => assertEquals(false, condition);

const assertSquaresSet = (bitboard, ...squares) =>
  squares.forEach(square =>
    console.assert(getBit(bitboard, square), `Square ${squareToFileRank(square)} should be set\n` + bitboardToString(bitboard)));

const assertSquaresNotSet = (bitboard, ...squares) =>
  squares.forEach(square =>
    console.assert(!getBit(bitboard, square), `Square ${squareToFileRank(square)} should not be set\n` + bitboardToString(bitboard)));


function assertSetAndPop(square) {
  let bitboard = createBitboard();
  setBit(bitboard, square)
  assertSquaresSet(bitboard, square);
  popBit(bitboard, square);
  assertSquaresNotSet(bitboard, square);
}

function bitwise() {
  let h4 = createBitboard();
  setBit(h4, SQUARE.H4);
  assertSquaresSet(h4, SQUARE.H4);
  h4 = and(h4, NOT_H_FILE);
  assertSquaresNotSet(h4, SQUARE.H4);

  let h5 = createBitboard();
  setBit(h5, SQUARE.H5);
  assertSquaresSet(h5, SQUARE.H5);
  h5 = and(h5, NOT_H_FILE);
  assertSquaresNotSet(h5, SQUARE.H5);

  let bitboard = createBitboard();
  setBit(bitboard, SQUARE.C1);
  assertEquals(SQUARE.C1, getLSB(bitboard));
  assertEquals(1, countBits(bitboard));
  setBit(bitboard, SQUARE.A5);
  assertEquals(2, countBits(bitboard));
  popBit(bitboard, SQUARE.C1);
  assertEquals(1, countBits(bitboard));

  bitboard = createBitboard();
  setBit(bitboard, SQUARE.A1);
  assertEquals(SQUARE.A1, getLSB(bitboard));

  bitboard = createBitboard();
  setBit(bitboard, SQUARE.A1);
  bitboard = leftShift(bitboard, 32);
  assertSquaresSet(bitboard, SQUARE.A5);
  bitboard = rightShift(bitboard, 32);
  assertSquaresSet(bitboard, SQUARE.A1);
}

function fen() {
  let engine = new Engine();
  engine.parseFen(START_FEN);
  assertSquaresSet(engine.bitboards[PIECE.WHITE_PAWN], SQUARE.A2, SQUARE.B2, SQUARE.C2, SQUARE.D2, SQUARE.E2, SQUARE.F2, SQUARE.G2, SQUARE.H2);
  assertSquaresSet(engine.bitboards[PIECE.WHITE_KNIGHT], SQUARE.B1, SQUARE.G1);
  assertSquaresSet(engine.bitboards[PIECE.WHITE_BISHOP], SQUARE.C1, SQUARE.F1);
  assertSquaresSet(engine.bitboards[PIECE.WHITE_ROOK], SQUARE.A1, SQUARE.H1);
  assertSquaresSet(engine.bitboards[PIECE.WHITE_QUEEN], SQUARE.D1);
  assertSquaresSet(engine.bitboards[PIECE.WHITE_KING], SQUARE.E1);

  assertSquaresSet(engine.bitboards[PIECE.BLACK_PAWN], SQUARE.A7, SQUARE.B7, SQUARE.C7, SQUARE.D7, SQUARE.E7, SQUARE.F7, SQUARE.G7, SQUARE.H7);
  assertSquaresSet(engine.bitboards[PIECE.BLACK_KNIGHT], SQUARE.B8, SQUARE.G8);
  assertSquaresSet(engine.bitboards[PIECE.BLACK_BISHOP], SQUARE.C8, SQUARE.F8);
  assertSquaresSet(engine.bitboards[PIECE.BLACK_ROOK], SQUARE.A8, SQUARE.H8);
  assertSquaresSet(engine.bitboards[PIECE.BLACK_QUEEN], SQUARE.D8);
  assertSquaresSet(engine.bitboards[PIECE.BLACK_KING], SQUARE.E8);

  assertEquals(COLOUR.WHITE, engine.side);
  assertEquals(15, engine.castlePermission);
  assertEquals(SQUARE.NONE, engine.enPassant);

  engine.parseFen(FEN_2);
  assertSquaresSet(engine.bitboards[PIECE.WHITE_PAWN], SQUARE.A2, SQUARE.B4, SQUARE.C2, SQUARE.D3, SQUARE.D4, SQUARE.E2, SQUARE.F5, SQUARE.G7, SQUARE.H3);
  assertEquals(SQUARE.E6, engine.enPassant);

  engine.parseFen(FEN_3);
  assertSquaresSet(engine.bitboards[PIECE.WHITE_PAWN], SQUARE.A2, SQUARE.B2, SQUARE.C2, SQUARE.D3, SQUARE.E4, SQUARE.F2, SQUARE.G3, SQUARE.H3);
  assertSquaresSet(engine.bitboards[PIECE.WHITE_KNIGHT], SQUARE.E2, SQUARE.F3);
  assertSquaresSet(engine.bitboards[PIECE.WHITE_BISHOP], SQUARE.C1, SQUARE.G2);
  assertSquaresSet(engine.bitboards[PIECE.WHITE_ROOK], SQUARE.A1, SQUARE.F1);
  assertSquaresSet(engine.bitboards[PIECE.WHITE_QUEEN], SQUARE.D1);
  assertSquaresSet(engine.bitboards[PIECE.WHITE_KING], SQUARE.G1);

  assertSquaresSet(engine.bitboards[PIECE.BLACK_PAWN], SQUARE.A7, SQUARE.B7, SQUARE.C7, SQUARE.D4, SQUARE.E5, SQUARE.F7, SQUARE.G7, SQUARE.H7);
  assertSquaresSet(engine.bitboards[PIECE.BLACK_KNIGHT], SQUARE.C6, SQUARE.F6);
  assertSquaresSet(engine.bitboards[PIECE.BLACK_BISHOP], SQUARE.C5, SQUARE.E6);
  assertSquaresSet(engine.bitboards[PIECE.BLACK_ROOK], SQUARE.A8, SQUARE.F8);
  assertSquaresSet(engine.bitboards[PIECE.BLACK_QUEEN], SQUARE.D8);
  assertSquaresSet(engine.bitboards[PIECE.BLACK_KING], SQUARE.G8);
  assertEquals(0, engine.castlePermission);
}

function pawnAttacks() {
  const e4WhitePawnAttacks = maskPawnAttacks(COLOUR.WHITE, SQUARE.E4);
  assertEquals(2, countBits(e4WhitePawnAttacks));
  assertSquaresSet(e4WhitePawnAttacks, SQUARE.D5, SQUARE.F5);

  const a4WhitePawnAttacks = maskPawnAttacks(COLOUR.WHITE, SQUARE.A4);
  assertEquals(1, countBits(a4WhitePawnAttacks));
  assertSquaresSet(a4WhitePawnAttacks, SQUARE.B5);

  const e4BlackPawnAttacks = maskPawnAttacks(COLOUR.BLACK, SQUARE.E4);
  assertEquals(2, countBits(e4BlackPawnAttacks));
  assertSquaresSet(e4BlackPawnAttacks, SQUARE.D3, SQUARE.F3);

  const a4BlackPawnAttacks = maskPawnAttacks(COLOUR.BLACK, SQUARE.A4);
  assertEquals(1, countBits(a4BlackPawnAttacks));
  assertSquaresSet(a4BlackPawnAttacks, SQUARE.B3);

  const h7WhitePawnAttacks = maskPawnAttacks(COLOUR.WHITE, SQUARE.H7);
  assertEquals(1, countBits(h7WhitePawnAttacks));
  assertSquaresSet(h7WhitePawnAttacks, SQUARE.G8);

  const h7BlackPawnAttacks = maskPawnAttacks(COLOUR.BLACK, SQUARE.H7);
  assertEquals(1, countBits(h7BlackPawnAttacks));
  assertSquaresSet(h7BlackPawnAttacks, SQUARE.G6);
}

function knightAttacks() {
  const e4KnightAttacks = maskKnightAttacks(SQUARE.E4);
  assertEquals(8, countBits(e4KnightAttacks));
  assertSquaresSet(e4KnightAttacks, SQUARE.D6, SQUARE.F6, SQUARE.G5, SQUARE.G3, SQUARE.D2, SQUARE.F2, SQUARE.C3, SQUARE.C5);

  const a8KnightAttacks = maskKnightAttacks(SQUARE.A8);
  assertEquals(2, countBits(a8KnightAttacks));
  assertSquaresSet(a8KnightAttacks, SQUARE.B6, SQUARE.C7);

  const g2KnightAttacks = maskKnightAttacks(SQUARE.G2);
  assertEquals(4, countBits(g2KnightAttacks));
  assertSquaresSet(g2KnightAttacks, SQUARE.E1, SQUARE.E3, SQUARE.F4, SQUARE.H4);
}

function kingAttacks() {
  const e4KingAttacks = maskKingAttacks(SQUARE.E4);
  assertEquals(8, countBits(e4KingAttacks));
  assertSquaresSet(e4KingAttacks, SQUARE.D5, SQUARE.E5, SQUARE.F5, SQUARE.F4, SQUARE.F3, SQUARE.E3, SQUARE.D3, SQUARE.D4);

  const a8KingAttacks = maskKingAttacks(SQUARE.A8);
  assertEquals(3, countBits(a8KingAttacks));
  assertSquaresSet(a8KingAttacks, SQUARE.A7, SQUARE.B7, SQUARE.B8);

  const h5KingAttacks = maskKingAttacks(SQUARE.H5);
  assertEquals(5, countBits(h5KingAttacks));
  assertSquaresSet(h5KingAttacks, SQUARE.H4, SQUARE.G4, SQUARE.G5, SQUARE.G6, SQUARE.H6);
}

function bishopAttacks() {
  const block = createBitboard();
  setBit(block, SQUARE.B6);
  setBit(block, SQUARE.G7);
  setBit(block, SQUARE.E3);
  setBit(block, SQUARE.B2);

  const d4BishopAttacks = bishopAttacksOnTheFly(SQUARE.D4, block);
  assertEquals(8, countBits(d4BishopAttacks));
  assertSquaresSet(d4BishopAttacks, SQUARE.E5, SQUARE.F6, SQUARE.G7, SQUARE.C5, SQUARE.B6, SQUARE.C3, SQUARE.B2, SQUARE.E3);
}

function rookAttacks() {
  const block = createBitboard();
  setBit(block, SQUARE.D7);
  setBit(block, SQUARE.D1);
  setBit(block, SQUARE.B4);
  setBit(block, SQUARE.E4);

  const d4RookAttacks = rookAttacksOnTheFly(SQUARE.D4, block);
  assertEquals(9, countBits(d4RookAttacks));
  assertSquaresSet(d4RookAttacks, SQUARE.D5, SQUARE.D6, SQUARE.D7, SQUARE.D1, SQUARE.D2, SQUARE.D3, SQUARE.B4, SQUARE.C4, SQUARE.E4);
}

function magicAttacks() {
  const occupancy = createBitboard();
  setBit(occupancy, SQUARE.B6);
  setBit(occupancy, SQUARE.G7);
  setBit(occupancy, SQUARE.E3);
  setBit(occupancy, SQUARE.B2);
  setBit(occupancy, SQUARE.D7);
  setBit(occupancy, SQUARE.D1);
  setBit(occupancy, SQUARE.B4);
  setBit(occupancy, SQUARE.E4);

  const d4BishopAttacks = getBishopAttacks(SQUARE.D4, occupancy);
  assertEquals(8, countBits(d4BishopAttacks));
  assertSquaresSet(d4BishopAttacks, SQUARE.E5, SQUARE.F6, SQUARE.G7, SQUARE.C5, SQUARE.B6, SQUARE.C3, SQUARE.B2, SQUARE.E3);

  const d4RookAttacks = getRookAttacks(SQUARE.D4, occupancy);
  assertEquals(9, countBits(d4RookAttacks));
  assertSquaresSet(d4RookAttacks, SQUARE.D5, SQUARE.D6, SQUARE.D7, SQUARE.D1, SQUARE.D2, SQUARE.D3, SQUARE.B4, SQUARE.C4, SQUARE.E4);

  const d4QueenAttacks = getQueenAttacks(SQUARE.D4, occupancy);
  assertEquals(17, countBits(d4QueenAttacks));
  assertSquaresSet(d4QueenAttacks, SQUARE.E5, SQUARE.F6, SQUARE.G7, SQUARE.C5, SQUARE.B6, SQUARE.C3, SQUARE.B2, SQUARE.E3);
  assertSquaresSet(d4QueenAttacks, SQUARE.D5, SQUARE.D6, SQUARE.D7, SQUARE.D1, SQUARE.D2, SQUARE.D3, SQUARE.B4, SQUARE.C4, SQUARE.E4);
}

function isSquareAttacked() {
  const engine = new Engine();
  engine.parseFen(FEN_3);

  assertTrue(engine.isSquareAttacked(SQUARE.D5, COLOUR.WHITE)); // pawn
  assertTrue(engine.isSquareAttacked(SQUARE.H6, COLOUR.WHITE)); // bishop
  assertTrue(engine.isSquareAttacked(SQUARE.B1, COLOUR.WHITE)); // rook
  assertTrue(engine.isSquareAttacked(SQUARE.C2, COLOUR.WHITE)); // queen
  assertFalse(engine.isSquareAttacked(SQUARE.A8, COLOUR.WHITE));

  assertTrue(engine.isSquareAttacked(SQUARE.A6, COLOUR.BLACK)); // pawn
  assertTrue(engine.isSquareAttacked(SQUARE.H5, COLOUR.BLACK)); // knight
  assertTrue(engine.isSquareAttacked(SQUARE.H8, COLOUR.BLACK)); // king
  assertFalse(engine.isSquareAttacked(SQUARE.G5, COLOUR.BLACK));
  assertFalse(engine.isSquareAttacked(SQUARE.G1, COLOUR.BLACK));
}

function perft() {
  const engine = new Engine();
  engine.parseFen(FEN_1);
  assertEquals(4085603, engine.perft(4));
}

function m2() {
  const engine = new Engine();
  engine.parseFen(M2_FEN);
  assertEquals("d5f6", engine.search(4).moveString);
}

function hash() {
  const engine = new Engine();
  engine.parseFen(START_FEN);
  engine.makeMove(engine.parseMove("e2e4"));
  assertEquals(engine.generateHashKey(), engine.key);
  engine.takeMove();
  assertEquals(engine.generateHashKey(), engine.key);
}

function repetition() {
  const engine = new Engine();

  engine.parseFen(START_FEN);
  engine.makeMove(engine.parseMove("b1c3"));
  engine.makeMove(engine.parseMove("b8c6"));
  engine.makeMove(engine.parseMove("c3b1"));
  engine.makeMove(engine.parseMove("c6b8"));
  engine.makeMove(engine.parseMove("b1c3"));
  engine.makeMove(engine.parseMove("b8c6"));
  engine.makeMove(engine.parseMove("c3b1"));
  assertEquals(false, engine.isRepetition());
  engine.makeMove(engine.parseMove("c6b8"));
  assertEquals(true, engine.isRepetition());
}

for (let square = SQUARE.A1; square <= SQUARE.H8; ++square) {
  assertSetAndPop(square);
}

assertEquals("B6", squareToFileRank(SQUARE.B6));
assertEquals(fileRankToSquare(FILE.FILE_B, RANK.RANK_6), SQUARE.B6);
assertEquals(FILE.FILE_E, squareToFile(SQUARE.E4));
assertEquals(RANK.RANK_4, squareToRank(SQUARE.E4));
assertEquals("B", pieceToAscii(PIECE.WHITE_BISHOP));
assertEquals(PIECE.WHITE_KNIGHT, asciiToPiece("N"));
bitwise();
fen();

pawnAttacks();
knightAttacks();
kingAttacks();
bishopAttacks();
rookAttacks();
magicAttacks();

isSquareAttacked();

perft();

m2();
hash();
repetition();

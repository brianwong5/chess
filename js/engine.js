const EMPTY_FEN = "8/8/8/8/8/8/8/8 b - -";
const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const FEN_1 = "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1";
const FEN_2 = "rnbqkb1r/pp1p1pPp/8/2p1pP2/1P1P4/3P3P/P1P1P3/RNBQKBNR w KQkq e6 0 1";
const FEN_3 = "r2q1rk1/ppp2ppp/2n1bn2/2b1p3/3pP3/3P1NPP/PPP1NPB1/R1BQ1RK1 b - - 0 9";
const REPETITION_FEN = "2r3k1/R7/8/1R6/8/8/P4KPP/8 w - - 0 40";
const M2_FEN = "r2qkb1r/pp2nppp/3p4/2pNN1B1/2BnP3/3P4/PPP2PPP/R2bK2R w KQkq - 1 0";
const DODGY_FEN = "4Q3/8/2R4p/5kp1/3P1P2/1PB5/5PPP/5NK1 w - - 5 42"; // m2 at depth 3, trolls at depth 8 somehow becuase of hashtable

const FILE = { FILE_A: 0, FILE_B: 1, FILE_C: 2, FILE_D: 3, FILE_E: 4, FILE_F: 5, FILE_G: 6, FILE_H: 7 }
const RANK = { RANK_1: 0, RANK_2: 1, RANK_3: 2, RANK_4: 3, RANK_5: 4, RANK_6: 5, RANK_7: 6, RANK_8: 7 }
const SQUARE = {
  A1: 0, B1: 1, C1: 2, D1: 3, E1: 4, F1: 5, G1: 6, H1: 7,
  A2: 8, B2: 9, C2: 10, D2: 11, E2: 12, F2: 13, G2: 14, H2: 15,
  A3: 16, B3: 17, C3: 18, D3: 19, E3: 20, F3: 21, G3: 22, H3: 23,
  A4: 24, B4: 25, C4: 26, D4: 27, E4: 28, F4: 29, G4: 30, H4: 31,
  A5: 32, B5: 33, C5: 34, D5: 35, E5: 36, F5: 37, G5: 38, H5: 39,
  A6: 40, B6: 41, C6: 42, D6: 43, E6: 44, F6: 45, G6: 46, H6: 47,
  A7: 48, B7: 49, C7: 50, D7: 51, E7: 52, F7: 53, G7: 54, H7: 55,
  A8: 56, B8: 57, C8: 58, D8: 59, E8: 60, F8: 61, G8: 62, H8: 63, NONE: 69
}
const COLOUR = { WHITE: 0, BLACK: 1, BOTH: 2 }
const PIECE = {
  WHITE_PAWN: 0, WHITE_KNIGHT: 1, WHITE_BISHOP: 2, WHITE_ROOK: 3, WHITE_QUEEN: 4, WHITE_KING: 5,
  BLACK_PAWN: 6, BLACK_KNIGHT: 7, BLACK_BISHOP: 8, BLACK_ROOK: 9, BLACK_QUEEN: 10, BLACK_KING: 11, NONE: 13
}
const PAWN_START_RANK = [RANK.RANK_2, RANK.RANK_7];
const PAWN_PUSH_DIRECTION = [8, -8];
const CASTLE = { WHITE_KING_SIDE: 1, WHITE_QUEEN_SIDE: 2, BLACK_KING_SIDE: 4, BLACK_QUEEN_SIDE: 8 }
const CASTLE_PERMISSION = Array(64).fill(15);
CASTLE_PERMISSION[SQUARE.A1] = 13;
CASTLE_PERMISSION[SQUARE.E1] = 12;
CASTLE_PERMISSION[SQUARE.H1] = 14;
CASTLE_PERMISSION[SQUARE.A8] = 7;
CASTLE_PERMISSION[SQUARE.E8] = 3;
CASTLE_PERMISSION[SQUARE.H8] = 11;
const ASCII_PIECE = "PNBRQKpnbrqk";

const isPawn = piece => piece === PIECE.WHITE_PAWN || piece === PIECE.BLACK_PAWN;
const isKnight = piece => piece === PIECE.WHITE_KNIGHT || piece === PIECE.BLACK_KNIGHT;
const isBishop = piece => piece === PIECE.WHITE_BISHOP || piece === PIECE.BLACK_BISHOP;
const isRook = piece => piece === PIECE.WHITE_ROOK || piece === PIECE.BLACK_ROOK;
const isQueen = piece => piece === PIECE.WHITE_QUEEN || piece === PIECE.BLACK_QUEEN;
const isKing = piece => piece === PIECE.WHITE_KING || piece === PIECE.BLACK_KING;
const getSide = piece => piece <= PIECE.WHITE_KING ? COLOUR.WHITE : COLOUR.BLACK;

const squareToFileRank = square => Object.keys(SQUARE).find(key => SQUARE[key] === square);
const fileRankToSquare = (file, rank) => rank * 8 + file;
const squareToFile = square => square % 8;
const squareToRank = square => square / 8 << 0;
const isOnBoard = square => square >= SQUARE.A1 && square <= SQUARE.H8;
const pieceToAscii = piece => ASCII_PIECE[piece];
const asciiToPiece = ascii => ASCII_PIECE.indexOf(ascii);

// BigInts are slow, therefore using 2 32 bit numbers
const createBitboard = () => [0, 0];
const copyBitboard = bitboard => [bitboard[0], bitboard[1]];
const setBit = (bitboard, square) => bitboard[square < 32 ? 0 : 1] |= (1 << square);
const getBit = (bitboard, square) => bitboard[square < 32 ? 0 : 1] & (1 << square);
const popBit = (bitboard, square) => bitboard[square < 32 ? 0 : 1] &= ~(1 << square);
const negate = bitboard => [~bitboard[0] >>> 0, ~bitboard[1] >>> 0];
const rightShift = (bitboard, pos) => {
  const output = createBitboard();
  output[0] = pos >= 32 ? bitboard[1] >>> (pos - 32) : bitboard[0] >>> pos | bitboard[1] << (32 - pos);
  output[1] = pos >= 32 ? 0 : bitboard[1] >>> pos;
  return output;
};
const leftShift = (bitboard, pos) => {
  const output = createBitboard();
  output[0] = pos >= 32 ? 0 : (bitboard[0] << pos) >>> 0;
  output[1] = pos >= 32 ? (bitboard[0] << (pos - 32)) >>> 0 : (bitboard[0] >>> (32 - pos)) | (bitboard[1] << pos);
  return output;
};
const and = (bb1, bb2) => [(bb1[0] & bb2[0]) >>> 0, (bb1[1] & bb2[1]) >>> 0];
const or = (bb1, bb2) => [(bb1[0] | bb2[0]) >>> 0, (bb1[1] | bb2[1]) >>> 0];
const xor = (bb1, bb2) => [bb1[0] ^ bb2[0], bb1[1] ^ bb2[1]];
const isZero = bitboard => !bitboard[0] && !bitboard[1];

function count32(n) {
  let out = n >>> 0;
  out -= (out >>> 1) & 0x55555555;
  out = (out & 0x33333333) + ((out >>> 2) & 0x33333333);
  return ((out + (out >>> 4) & 0xF0F0F0F) * 0x1010101) >>> 24;
}

const countBits = bitboard => count32(bitboard[0]) + count32(bitboard[1]);

function getLSB(bitboard) {
  if (bitboard[0]) {
    return count32((bitboard[0] & -bitboard[0]) - 1);
  }
  if (bitboard[1]) {
    return count32((bitboard[1] & -bitboard[1]) - 1) + 32;
  }
  return -1;
}

function bitboardToString(bitboard) {
  let output = "";
  for (let rank = RANK.RANK_8; rank >= RANK.RANK_1; --rank) {
    output += ` ${rank + 1}\t`;
    for (let file = FILE.FILE_A; file <= FILE.FILE_H; ++file) {
      let square = fileRankToSquare(file, rank);
      output += ` ${getBit(bitboard, square) ? 1 : 0}`;
    }
    output += "\n";
  }
  output += "\n \t a b c d e f g h"
  return output;
}

let randomState = 1804289383;
function random() {
  let number = randomState;
  number ^= number << 13;
  number ^= number >> 17;
  number ^= number << 5;
  randomState = number;

  return number;
}

const PIECE_KEYS = Array(12).fill().map(() => Array(64).fill().map(() => random()));
const EN_PASSANT_KEYS = Array(64).fill().map(() => random());
const CASTLE_KEYS = Array(16).fill().map(() => random());
const SIDE_KEY = random();

/*

  0000 0000 0000 0000 0011 1111 source        0x3F
  0000 0000 0000 1111 1100 0000 target        0xFC0
  0000 0000 1111 0000 0000 0000 movedPiece    0xF000
  0000 1111 0000 0000 0000 0000 promotedPiece 0xF0000
  0001 0000 0000 0000 0000 0000 capture       0x100000
  0010 0000 0000 0000 0000 0000 pawnStart     0x200000
  0100 0000 0000 0000 0000 0000 enPassant     0x400000
  1000 0000 0000 0000 0000 0000 castle        0x800000
*/

const CAPTURE_FLAG = 0x100000;
const PAWN_START_FLAG = 0x200000;
const EN_PASSANT_FLAG = 0x400000;
const CASTLE_FLAG = 0x800000;

const encodeMove = (source, target, movedPiece, promotedPiece, flags) =>
  source | (target << 6) | (movedPiece << 12) | (promotedPiece << 16) | flags;

const getSource = move => move & 0x3F;
const getTarget = move => (move & 0xFC0) >> 6;
const getMovedPiece = move => (move & 0xF000) >> 12;
const getPromotedPiece = move => (move & 0xF0000) >> 16;
const isCapture = move => move & CAPTURE_FLAG;
const isPawnStart = move => move & PAWN_START_FLAG;
const isEnPassant = move => move & EN_PASSANT_FLAG;
const isCastle = move => move & CASTLE_FLAG;
const moveToString = move => {
  const promotedPiece = getPromotedPiece(move);
  return `${squareToFileRank(getSource(move))}${squareToFileRank(getTarget(move))}${promotedPiece === PIECE.NONE ? '' : pieceToAscii(promotedPiece)}`.toLowerCase();
}

const NOT_A_FILE = createBitboard().map(() => 4278124286);
const NOT_AB_FILE = createBitboard().map(() => 4244438268);
const NOT_H_FILE = createBitboard().map(() => 2139062143);
const NOT_GH_FILE = createBitboard().map(() => 1061109567);

const PAWN_ATTACKS = Array(2).fill().map(() => Array(64).fill());
const KNIGHT_ATTACKS = Array(64).fill();
const KING_ATTACKS = Array(64).fill();
const BISHOP_MASKS = Array(64).fill();
const ROOK_MASKS = Array(64).fill();
const BISHOP_ATTACKS = Array(64).fill().map(() => Array(512).fill());
const ROOK_ATTACKS = Array(64).fill().map(() => Array(4096).fill());

function maskPawnAttacks(side, square) {
  let attacks = createBitboard();
  const bitboard = createBitboard();
  setBit(bitboard, square);
  const eastAttack = (side === COLOUR.WHITE) ? and(leftShift(bitboard, 9), NOT_A_FILE) : and(rightShift(bitboard, 7), NOT_A_FILE);
  const westAttack = (side === COLOUR.WHITE) ? and(leftShift(bitboard, 7), NOT_H_FILE) : and(rightShift(bitboard, 9), NOT_H_FILE);
  attacks = or(attacks, westAttack);
  attacks = or(attacks, eastAttack);
  return attacks;
}

function maskKnightAttacks(square) {
  let attacks = createBitboard();
  const bitboard = createBitboard();
  setBit(bitboard, square);
  const nnwAttack = and(leftShift(bitboard, 15), NOT_H_FILE);
  const nneAttack = and(leftShift(bitboard, 17), NOT_A_FILE);
  const eneAttack = and(leftShift(bitboard, 10), NOT_AB_FILE);
  const eseAttack = and(rightShift(bitboard, 6), NOT_AB_FILE);
  const sseAttack = and(rightShift(bitboard, 15), NOT_A_FILE);
  const sswAttack = and(rightShift(bitboard, 17), NOT_H_FILE);
  const wswAttack = and(rightShift(bitboard, 10), NOT_GH_FILE);
  const wnwAttack = and(leftShift(bitboard, 6), NOT_GH_FILE);
  attacks = or(attacks, nnwAttack);
  attacks = or(attacks, nneAttack);
  attacks = or(attacks, eneAttack);
  attacks = or(attacks, eseAttack);
  attacks = or(attacks, sseAttack);
  attacks = or(attacks, sswAttack);
  attacks = or(attacks, wswAttack);
  attacks = or(attacks, wnwAttack);
  return attacks;
}

function maskKingAttacks(square) {
  let attacks = createBitboard();
  const bitboard = createBitboard();
  setBit(bitboard, square);
  const nAttack = leftShift(bitboard, 8);
  const neAttack = and(leftShift(bitboard, 9), NOT_A_FILE);
  const eAttack = and(leftShift(bitboard, 1), NOT_A_FILE);
  const seAttack = and(rightShift(bitboard, 7), NOT_A_FILE);
  const sAttack = rightShift(bitboard, 8);
  const swAttack = and(rightShift(bitboard, 9), NOT_H_FILE);
  const wAttack = and(rightShift(bitboard, 1), NOT_H_FILE);
  const nwAttack = and(leftShift(bitboard, 7), NOT_H_FILE);
  attacks = or(attacks, nAttack);
  attacks = or(attacks, neAttack);
  attacks = or(attacks, eAttack);
  attacks = or(attacks, seAttack);
  attacks = or(attacks, swAttack);
  attacks = or(attacks, sAttack);
  attacks = or(attacks, wAttack);
  attacks = or(attacks, nwAttack);
  return attacks;
}

const BISHOP_RELEVANT_BITS = [
  6, 5, 5, 5, 5, 5, 5, 6,
  5, 5, 5, 5, 5, 5, 5, 5,
  5, 5, 7, 7, 7, 7, 5, 5,
  5, 5, 7, 9, 9, 7, 5, 5,
  5, 5, 7, 9, 9, 7, 5, 5,
  5, 5, 7, 7, 7, 7, 5, 5,
  5, 5, 5, 5, 5, 5, 5, 5,
  6, 5, 5, 5, 5, 5, 5, 6
];
const ROOK_RELEVANT_BITS = [
  12, 11, 11, 11, 11, 11, 11, 12,
  11, 10, 10, 10, 10, 10, 10, 11,
  11, 10, 10, 10, 10, 10, 10, 11,
  11, 10, 10, 10, 10, 10, 10, 11,
  11, 10, 10, 10, 10, 10, 10, 11,
  11, 10, 10, 10, 10, 10, 10, 11,
  11, 10, 10, 10, 10, 10, 10, 11,
  12, 11, 11, 11, 11, 11, 11, 12
];
const BISHOP_MAGICS_32 = [
  [135159554, 134611152], [11472850, 1194459268], [8651011, 311968258], [533633, 0],
  [135696, 0], [2807942015, 4157675724], [261960, 2978549767], [173142359, 1143219472],
  [33571343, 27329044], [345329580, 2692780679], [1296925895, 2500087680], [1654538763, 3734518749],
  [536875589, 2600996640], [3187373163, 3269986154], [2260792627, 2349041829], [4240233121, 3324134025],
  [2928211334, 4109096464], [4010114178, 2772038960], [2147582984, 3056866832], [1208099076, 620900352],
  [140292, 36765696], [1485048866, 1289038324], [152584194, 22144066], [537927954, 2698308178],
  [9126416, 692199940], [1208051810, 277985536], [537018448, 143681600], [2148535424, 2231632386],
  [136380480, 50860098], [4093781016, 1216446614], [2148565144, 556397612], [13676583, 9767409],
  [302130436, 2149714690], [4227605, 543352079], [541074584, 1065007], [2283046920, 538198080],
  [8650890, 2105358], [4284705, 749346928], [15073441, 4498670], [269517130, 3217562],
  [1064973263, 2298872856], [2256667393, 1145250308], [485524676, 33555523], [1310720097, 1109418048],
  [4753441, 16785586], [2333345240, 270532864], [202129800, 3795847296], [270794884, 4064285057],
  [33825, 3023245864], [11206721, 152710208], [596343893, 3607363742], [4261121, 101040256],
  [553713758, 90243696], [1107472454, 1540734991], [316802081, 2215359633], [419562058, 186679552],
  [1073873185, 567734976], [889733645, 128135953], [1210188565, 7080800], [0, 101731336],
  [0, 815219527], [363432049, 1060434506], [121653362, 2393083584], [3286790192, 536843882]
];
const ROOK_MAGICS_32 = [
  [2099296, 2684425224], [1060868, 1342701584], [8392240, 41963520], [285282320, 1887449100],
  [2151753730, 4269568], [2151678476, 678429064], [1141375249, 1128271360], [2097477, 2692743231],
  [2684485890, 2193621028], [134230112, 537396224], [16403, 596377688], [17420, 546570304],
  [2231386630, 973095041], [1073750275, 539002112], [285229441, 3221422184], [4131, 75579422],
  [19992578, 134415594], [1073758273, 503325002], [2692776961, 2219704360], [136446468, 134496306],
  [27525377, 7342912], [2151711234, 1199575116], [536903745, 1078657035], [1073774849, 2416918656],
  [1418734913, 8388688], [33570993, 1216615712], [1611079810, 1644839154], [16785934, 3075477516],
  [2754611746, 169213956], [273419009, 2156135442], [269486852, 1213059], [16777326, 16867476],
  [1142071304, 269492299], [134742057, 956317864], [3255869474, 2348875840], [2192646200, 2282225800],
  [87626024, 285215492], [2182152325, 16779266], [4325403, 2164327457], [3224462849, 270534720],
  [25166408, 2444231680], [67125254, 166203408], [67895314, 570441792], [269549638, 687882251],
  [418971654, 3246424078], [1630476, 35684354], [11793, 2282754116], [33611781, 2228481],
  [12714160, 2416967712], [277348384, 3761766432], [2315518056, 403308576], [1342239746, 1275330592],
  [41974273, 1191313440], [55333, 50397216], [1124614145, 50430016], [134258695, 3826321412],
  [10432, 1773633], [3288606739, 2432713090], [67112994, 999786], [639504, 268385],
  [3221226504, 268634379], [539095044, 2214733825], [1073746402, 1073884161], [2097249, 151004847]
];

function maskBishopAttacks(square) {
  let attacks = createBitboard();
  const file = squareToFile(square);
  const rank = squareToRank(square);
  for (let r = rank + 1, f = file + 1; r <= RANK.RANK_7 && f <= FILE.FILE_G; ++r, ++f) {
    setBit(attacks, fileRankToSquare(f, r));
  }
  for (let r = rank - 1, f = file + 1; r >= RANK.RANK_2 && f <= FILE.FILE_G; --r, ++f) {
    setBit(attacks, fileRankToSquare(f, r));
  }
  for (let r = rank - 1, f = file - 1; r >= RANK.RANK_2 && f >= FILE.FILE_B; --r, --f) {
    setBit(attacks, fileRankToSquare(f, r));
  }
  for (let r = rank + 1, f = file - 1; r <= RANK.RANK_7 && f >= FILE.FILE_B; ++r, --f) {
    setBit(attacks, fileRankToSquare(f, r));
  }
  return attacks;
}

function maskRookAttacks(square) {
  let attacks = createBitboard();
  const file = squareToFile(square);
  const rank = squareToRank(square);
  for (let r = RANK.RANK_2; r <= RANK.RANK_7; ++r) {
    if (r !== rank) setBit(attacks, fileRankToSquare(file, r));
  }
  for (let f = FILE.FILE_B; f <= FILE.FILE_G; ++f) {
    if (f !== file) setBit(attacks, fileRankToSquare(f, rank));
  }
  return attacks;
}

function bishopAttacksOnTheFly(square, occupancy) {
  let attacks = createBitboard();
  const file = squareToFile(square);
  const rank = squareToRank(square);
  for (let r = rank + 1, f = file + 1; r <= RANK.RANK_8 && f <= FILE.FILE_H; ++r, ++f) {
    setBit(attacks, fileRankToSquare(f, r));
    if (getBit(occupancy, fileRankToSquare(f, r))) break;
  }
  for (let r = rank - 1, f = file + 1; r >= RANK.RANK_1 && f <= FILE.FILE_H; --r, ++f) {
    setBit(attacks, fileRankToSquare(f, r));
    if (getBit(occupancy, fileRankToSquare(f, r))) break;
  }
  for (let r = rank - 1, f = file - 1; r >= RANK.RANK_1 && f >= FILE.FILE_A; --r, --f) {
    setBit(attacks, fileRankToSquare(f, r));
    if (getBit(occupancy, fileRankToSquare(f, r))) break;
  }
  for (let r = rank + 1, f = file - 1; r <= RANK.RANK_8 && f >= FILE.FILE_A; ++r, --f) {
    setBit(attacks, fileRankToSquare(f, r));
    if (getBit(occupancy, fileRankToSquare(f, r))) break;
  }
  return attacks;
}

function rookAttacksOnTheFly(square, occupancy) {
  let attacks = createBitboard();
  const file = squareToFile(square);
  const rank = squareToRank(square);
  for (let r = rank + 1; r <= RANK.RANK_8; ++r) {
    setBit(attacks, fileRankToSquare(file, r));
    if (getBit(occupancy, fileRankToSquare(file, r))) break;
  }
  for (let r = rank - 1; r >= RANK.RANK_1; --r) {
    setBit(attacks, fileRankToSquare(file, r));
    if (getBit(occupancy, fileRankToSquare(file, r))) break;
  }
  for (let f = file + 1; f <= FILE.FILE_H; ++f) {
    setBit(attacks, fileRankToSquare(f, rank));
    if (getBit(occupancy, fileRankToSquare(f, rank))) break;
  }
  for (let f = file - 1; f >= FILE.FILE_A; --f) {
    setBit(attacks, fileRankToSquare(f, rank));
    if (getBit(occupancy, fileRankToSquare(f, rank))) break;
  }
  return attacks;
}

function initLeaperAttacks() {
  for (let square = SQUARE.A1; square <= SQUARE.H8; ++square) {
    PAWN_ATTACKS[COLOUR.WHITE][square] = maskPawnAttacks(COLOUR.WHITE, square);
    PAWN_ATTACKS[COLOUR.BLACK][square] = maskPawnAttacks(COLOUR.BLACK, square);
    KNIGHT_ATTACKS[square] = maskKnightAttacks(square);
    KING_ATTACKS[square] = maskKingAttacks(square);
  }
}

function setOccupancy(index, bits, attackMask) {
  const maskCopy = copyBitboard(attackMask);
  const occupancy = createBitboard();
  for (let count = 0; count < bits; ++count) {
    const sqaure = getLSB(maskCopy);
    popBit(maskCopy, sqaure);
    if (index & (1 << count)) {
      setBit(occupancy, sqaure);
    }
  }
  return occupancy;
}

function initSliderAttacks() {
  for (let square = SQUARE.A1; square <= SQUARE.H8; ++square) {
    BISHOP_MASKS[square] = maskBishopAttacks(square);
    ROOK_MASKS[square] = maskRookAttacks(square);

    const bishopAttackMask = BISHOP_MASKS[square];
    const bishopRelevantBits = countBits(bishopAttackMask);
    const bishopOccupancyIndicies = 1 << bishopRelevantBits;

    const rookAttackMask = ROOK_MASKS[square];
    const rookRelevantBits = countBits(rookAttackMask);
    const rookOccupancyIndicies = 1 << rookRelevantBits;

    for (let i = 0; i < bishopOccupancyIndicies; ++i) {
      // idea: try maps
      const occupancy = setOccupancy(i, bishopRelevantBits, bishopAttackMask);
      const low = BISHOP_MAGICS_32[square][0] * occupancy[0];
      const high = BISHOP_MAGICS_32[square][1] * occupancy[1];
      const magicIndex = (low ^ high) >>> (32 - BISHOP_RELEVANT_BITS[square]);
      BISHOP_ATTACKS[square][magicIndex] = bishopAttacksOnTheFly(square, occupancy);
    }
    for (let i = 0; i < rookOccupancyIndicies; ++i) {
      const occupancy = setOccupancy(i, rookRelevantBits, rookAttackMask);
      const low = ROOK_MAGICS_32[square][0] * occupancy[0];
      const high = ROOK_MAGICS_32[square][1] * occupancy[1];
      const magicIndex = (low ^ high) >>> (32 - ROOK_RELEVANT_BITS[square]);
      ROOK_ATTACKS[square][magicIndex] = rookAttacksOnTheFly(square, occupancy);
    }
  }
}

function getBishopAttacks(square, occupancy) {
  const result = and(occupancy, BISHOP_MASKS[square]);
  const low = BISHOP_MAGICS_32[square][0] * result[0];
  const high = BISHOP_MAGICS_32[square][1] * result[1];
  const magicIndex = (low ^ high) >>> (32 - BISHOP_RELEVANT_BITS[square]);
  return BISHOP_ATTACKS[square][magicIndex];
}

function getRookAttacks(square, occupancy) {
  const result = and(occupancy, ROOK_MASKS[square]);
  const low = ROOK_MAGICS_32[square][0] * result[0];
  const high = ROOK_MAGICS_32[square][1] * result[1];
  const magicIndex = (low ^ high) >>> (32 - ROOK_RELEVANT_BITS[square]);
  return ROOK_ATTACKS[square][magicIndex];
}

function getQueenAttacks(square, occupancy) {
  return or(getBishopAttacks(square, occupancy), getRookAttacks(square, occupancy));
}

const INFINITY = 50000;
const MATE_VALUE = 49000;
const MATE_SCORE = 48000;
const MAX_PLY = 64;
const FULL_DEPTH_MOVES = 4;
const REDUCTION_LIMIT = 3;
const FUTILITY_MARGIN = [0, 100, 320, 500];

const MATERIAL_SCORE = [100, 320, 330, 500, 900, 20000, -100, -320, -330, -500, -900, -20000];
const PIECE_SQUARE_TABLES = [
  [ // pawn
    0, 0, 0, 0, 0, 0, 0, 0,
    10, 10, 0, -10, -10, 0, 10, 10,
    5, 0, 0, 5, 5, 0, 0, 5,
    0, 0, 10, 20, 20, 10, 0, 0,
    5, 5, 5, 10, 10, 5, 5, 5,
    10, 10, 10, 20, 20, 10, 10, 10,
    20, 20, 20, 30, 30, 20, 20, 20,
    0, 0, 0, 0, 0, 0, 0, 0
  ],
  [ // knight
    -40, -20, -20, -20, -20, -20, -20, -40,
    -30, -20, 0, 5, 5, 0, -20, -30,
    -20, 5, 10, 15, 15, 10, 5, -20,
    -20, 0, 15, 20, 20, 15, 0, -20,
    -20, 5, 15, 20, 20, 15, 5, -20,
    -20, 0, 10, 15, 15, 10, 0, -20,
    -30, -20, 0, 0, 0, 0, -20, -30,
    -40, -30, -20, -20, -20, -20, -30, -40
  ],
  [ // bishop
    -20, -10, -10, -10, -10, -10, -10, -20,
    -10, 5, 0, 0, 0, 0, 5, -10,
    -10, 10, 10, 10, 10, 10, 10, -10,
    -10, 0, 10, 10, 10, 10, 0, -10,
    -10, 5, 5, 10, 10, 5, 5, -10,
    -10, 0, 5, 10, 10, 5, 0, -10,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -20, -10, -10, -10, -10, -10, -10, -20
  ],
  [ // rook
    0, 0, 5, 10, 10, 5, 0, 0,
    0, 0, 5, 10, 10, 5, 0, 0,
    0, 0, 5, 10, 10, 5, 0, 0,
    0, 0, 5, 10, 10, 5, 0, 0,
    0, 0, 5, 10, 10, 5, 0, 0,
    0, 0, 5, 10, 10, 5, 0, 0,
    25, 25, 25, 25, 25, 25, 25, 25,
    0, 0, 5, 10, 10, 5, 0, 0
  ],
  [ // queen
    -20, -10, -10, -5, -5, -10, -10, -20,
    -10, 0, 5, 0, 0, 0, 0, -10,
    -10, 5, 5, 5, 5, 5, 0, -10,
    0, 0, 5, 5, 5, 5, 0, -5,
    -5, 0, 5, 5, 5, 5, 0, -5,
    -10, 0, 5, 5, 5, 5, 0, -10,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -20, -10, -10, -5, -5, -10, -10, -20
  ]
];
const KING_TABLE = [
  [
    20, 30, 10, 0, 0, 10, 30, 20,
    20, 20, 0, 0, 0, 0, 20, 20,
    -10, -20, -20, -20, -20, -20, -20, -10,
    -20, -30, -30, -40, -40, -30, -30, -20,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30
  ],
  [
    -50, -30, -30, -30, -30, -30, -30, -50,
    -30, -30, 0, 0, 0, 0, -30, -30,
    -30, -10, 20, 30, 30, 20, -10, -30,
    -30, -10, 30, 40, 40, 30, -10, -30,
    -30, -10, 30, 40, 40, 30, -10, -30,
    -30, -10, 20, 30, 30, 20, -10, -30,
    -30, -20, -10, 0, 0, -10, -20, -30,
    -50, -40, -30, -20, -20, -30, -40, -50
  ]
];
const MIRROR = [
  SQUARE.A8, SQUARE.B8, SQUARE.C8, SQUARE.D8, SQUARE.E8, SQUARE.F8, SQUARE.G8, SQUARE.H8,
  SQUARE.A7, SQUARE.B7, SQUARE.C7, SQUARE.D7, SQUARE.E7, SQUARE.F7, SQUARE.G7, SQUARE.H7,
  SQUARE.A6, SQUARE.B6, SQUARE.C6, SQUARE.D6, SQUARE.E6, SQUARE.F6, SQUARE.G6, SQUARE.H6,
  SQUARE.A5, SQUARE.B5, SQUARE.C5, SQUARE.D5, SQUARE.E5, SQUARE.F5, SQUARE.G5, SQUARE.H5,
  SQUARE.A4, SQUARE.B4, SQUARE.C4, SQUARE.D4, SQUARE.E4, SQUARE.F4, SQUARE.G4, SQUARE.H4,
  SQUARE.A3, SQUARE.B3, SQUARE.C3, SQUARE.D3, SQUARE.E3, SQUARE.F3, SQUARE.G3, SQUARE.H3,
  SQUARE.A2, SQUARE.B2, SQUARE.C2, SQUARE.D2, SQUARE.E2, SQUARE.F2, SQUARE.G2, SQUARE.H2,
  SQUARE.A1, SQUARE.B1, SQUARE.C1, SQUARE.D1, SQUARE.E1, SQUARE.F1, SQUARE.G1, SQUARE.H1,
];

const MVV_LVA = [
  [105, 205, 305, 405, 505, 605, 105, 205, 305, 405, 505, 605],
  [104, 204, 304, 404, 504, 604, 104, 204, 304, 404, 504, 604],
  [103, 203, 303, 403, 503, 603, 103, 203, 303, 403, 503, 603],
  [102, 202, 302, 402, 502, 602, 102, 202, 302, 402, 502, 602],
  [101, 201, 301, 401, 501, 601, 101, 201, 301, 401, 501, 601],
  [100, 200, 300, 400, 500, 600, 100, 200, 300, 400, 500, 600],
  [105, 205, 305, 405, 505, 605, 105, 205, 305, 405, 505, 605],
  [104, 204, 304, 404, 504, 604, 104, 204, 304, 404, 504, 604],
  [103, 203, 303, 403, 503, 603, 103, 203, 303, 403, 503, 603],
  [102, 202, 302, 402, 502, 602, 102, 202, 302, 402, 502, 602],
  [101, 201, 301, 401, 501, 601, 101, 201, 301, 401, 501, 601],
  [100, 200, 300, 400, 500, 600, 100, 200, 300, 400, 500, 600]
];

const FILE_MASKS = Array(64).fill();
const RANK_MASKS = Array(64).fill();
const ISOLATED_MASKS = Array(64).fill();
const PASSED_PAWN_MASKS = Array(2).fill().map(() => Array(64));
const DOUBLED_PAWN_PENALTY = -10;
const ISOLATED_PAWN_PENALTY = -15;
// const PASSED_PAWN_BONUS = [0, 10, 30, 50, 75, 100, 150, 200];
const PASSED_PAWN_BONUS = [0, 5, 10, 20, 35, 60, 100, 200];
const BISHOP_PAIR_BONUS = 20;
const SEMI_OPEN_FILE_SCORE = 10;
const OPEN_FILE_SCORE = 15;

function setFileRankMask(file, rank) {
  const mask = createBitboard();
  for (let r = RANK.RANK_1; r <= RANK.RANK_8; ++r) {
    for (let f = FILE.FILE_A; f <= FILE.FILE_H; ++f) {
      const square = fileRankToSquare(f, r);
      if (file === f) setBit(mask, square);
      if (rank === r) setBit(mask, square);
    }
  }
  return mask;
}

function initEvaluationMasks() {
  for (let r = RANK.RANK_1; r <= RANK.RANK_8; ++r) {
    for (let f = FILE.FILE_A; f <= FILE.FILE_H; ++f) {
      const square = fileRankToSquare(f, r);
      FILE_MASKS[square] = setFileRankMask(f, -1);
      RANK_MASKS[square] = setFileRankMask(-1, r);
      ISOLATED_MASKS[square] = or(setFileRankMask(f - 1, -1), setFileRankMask(f + 1, -1));
    }
  }
  for (let r = RANK.RANK_1; r <= RANK.RANK_8; ++r) {
    for (let f = FILE.FILE_A; f <= FILE.FILE_H; ++f) {
      const square = fileRankToSquare(f, r);
      for (let colour = COLOUR.WHITE; colour <= COLOUR.BLACK; ++colour) {
        PASSED_PAWN_MASKS[colour][square] = or(ISOLATED_MASKS[square], FILE_MASKS[square]);
      }
      for (let i = RANK.RANK_1; i <= r; ++i) {
        const redundant = fileRankToSquare(f, i);
        PASSED_PAWN_MASKS[COLOUR.WHITE][square] = and(PASSED_PAWN_MASKS[COLOUR.WHITE][square], negate(RANK_MASKS[redundant]));
      }
      for (let i = r; i <= RANK.RANK_8; ++i) {
        const redundant = fileRankToSquare(f, i);
        PASSED_PAWN_MASKS[COLOUR.BLACK][square] = and(PASSED_PAWN_MASKS[COLOUR.BLACK][square], negate(RANK_MASKS[redundant]));
      }
    }
  }
}

const NO_HASH_ENTRY = 100000;

const HASH_EXACT = 0;
const HASH_ALPHA = 1;
const HASH_BETA = 2;

class HashTable {
  constructor() {
    this.reset();
  }

  get size() {
    return 1051069;
  }

  reset() {
    this.table = new Array(this.size).fill();
    // this.table = new Map();
  }

  write(key, score, depth, ply, flag) {
    if (score < -MATE_SCORE) score -= ply;
    if (score > MATE_SCORE) score += ply;
    const entry = this.table[(key & 0x7fffffff) % this.size];
    // const entry = this.table.get(key);
    if (entry === undefined || entry.key !== key || entry.depth <= depth) {
      this.table[(key & 0x7fffffff) % this.size] = { key, score, depth, flag };
      // this.table.set(key, { key, score, depth, flag });
    }
  }

  read(key, alpha, beta, depth, ply) {
    const entry = this.table[(key & 0x7fffffff) % this.size];
    // const entry = this.table.get(key);
    if (entry !== undefined && entry.key === key && entry.depth >= depth) {
      if (entry.flag === HASH_EXACT) {
        let score = entry.score;
        if (score < -MATE_SCORE) score += ply;
        if (score > MATE_SCORE) score -= ply;
        return score;
      }
      if (entry.flag === HASH_ALPHA && entry.score <= alpha) return alpha;
      if (entry.flag === HASH_BETA && entry.score >= beta) return beta;
    }
    return NO_HASH_ENTRY;
  }
}

class Engine {
  constructor(level = 2) {
    this.level = level;
    this.reset();
  }

  generateHashKey() {
    let key = 0;
    for (let piece = PIECE.WHITE_PAWN; piece <= PIECE.BLACK_KING; ++piece) {
      const bitboard = copyBitboard(this.bitboards[piece]);
      while (!isZero(bitboard)) {
        const square = getLSB(bitboard);
        key ^= PIECE_KEYS[piece][square];
        popBit(bitboard, square);
      }
    }
    if (this.enPassant != SQUARE.NONE) key ^= EN_PASSANT_KEYS[this.enPassant];
    key ^= CASTLE_KEYS[this.castlePermission];
    if (this.side === COLOUR.BLACK) key ^= SIDE_KEY;
    return key;
  }

  reset() {
    this.bitboards = new Array(12).fill().map(() => createBitboard());
    this.occupancies = new Array(3).fill().map(() => createBitboard());
    this.side = COLOUR.BOTH;
    this.enPassant = SQUARE.NONE;
    this.fiftyMove = 0;
    this.fullMove = 0;
    this.castlePermission = 0;
    this.key = 0;
    this.history = [];
    this.historyPly = 0;
    this.hashTable = new HashTable();

    this.resetSearch();
  }

  resetSearch() {
    this.searchedNodes = 0;
    this.searchPly = 0;
    this.pvLength = Array(MAX_PLY).fill(0);
    this.pvTable = Array(MAX_PLY).fill().map(() => Array(MAX_PLY).fill(0));
    this.followPv = false;
    this.scorePv = false;
    this.killerMoves = Array(2).fill().map(() => Array(MAX_PLY).fill(0));
    this.historyMoves = Array(12).fill().map(() => Array(64).fill(0));
  }

  isRepetition() {
    let repetitions = 0;
    for (let i = Math.max(0, this.historyPly - this.fiftyMove); i < this.historyPly - 1; ++i) {
      if (this.key === this.history[i].key) ++repetitions;
    }
    return repetitions >= 2;
  }

  isMaterialDraw() {
    return isZero(this.bitboards[PIECE.WHITE_PAWN]) && isZero(this.bitboards[PIECE.BLACK_PAWN]) &&
      isZero(this.bitboards[PIECE.WHITE_QUEEN]) && isZero(this.bitboards[PIECE.BLACK_QUEEN]) &&
      isZero(this.bitboards[PIECE.WHITE_ROOK]) && isZero(this.bitboards[PIECE.BLACK_ROOK]) &&
      countBits(this.bitboards[PIECE.WHITE_BISHOP]) + countBits(this.bitboards[PIECE.WHITE_KNIGHT]) < 2 &&
      countBits(this.bitboards[PIECE.BLACK_BISHOP]) + countBits(this.bitboards[PIECE.BLACK_KNIGHT]) < 2
  }

  evaluate() {
    if (this.isMaterialDraw()) return 0;
    let score = 0;
    for (let piece = PIECE.WHITE_PAWN; piece <= PIECE.BLACK_KING; ++piece) {
      const bitboard = copyBitboard(this.bitboards[piece]);
      while (!isZero(bitboard)) {
        const square = getLSB(bitboard);
        score += MATERIAL_SCORE[piece];
        popBit(bitboard, square);
      }
    }
    if (this.level >= 2) {
      const gamePhase = this.getGamePhase();
      for (let piece = PIECE.WHITE_PAWN; piece <= PIECE.BLACK_KING; ++piece) {
        const bitboard = copyBitboard(this.bitboards[piece]);
        while (!isZero(bitboard)) {
          const square = getLSB(bitboard);
          if (getSide(piece) === COLOUR.WHITE) {
            if (isKing(piece)) {
              score += KING_TABLE[gamePhase][square];
            } else {
              score += PIECE_SQUARE_TABLES[piece][square];
            }
          } else {
            if (isKing(piece)) {
              score -= KING_TABLE[gamePhase][MIRROR[square]];
            } else {
              score -= PIECE_SQUARE_TABLES[piece - 6][MIRROR[square]];
            }
          }
          popBit(bitboard, square);
        }
      }
    }
    if (this.level >= 3) {
      const whitePawns = copyBitboard(this.bitboards[PIECE.WHITE_PAWN]);
      while (!isZero(whitePawns)) {
        const square = getLSB(whitePawns);
        const pawnsOnFile = countBits(and(this.bitboards[PIECE.WHITE_PAWN], FILE_MASKS[square]));
        // doubled pawns
        if (pawnsOnFile > 1) score += DOUBLED_PAWN_PENALTY * pawnsOnFile;
        // isoalted pawns
        if (isZero(and(this.bitboards[PIECE.WHITE_PAWN], ISOLATED_MASKS[square]))) score += ISOLATED_PAWN_PENALTY;
        // passed pawns
        if (isZero(and(this.bitboards[PIECE.BLACK_PAWN], PASSED_PAWN_MASKS[COLOUR.WHITE][square]))) score += PASSED_PAWN_BONUS[squareToRank(square)];
        popBit(whitePawns, square);
      }
      const blackPawns = copyBitboard(this.bitboards[PIECE.BLACK_PAWN]);
      while (!isZero(blackPawns)) {
        const square = getLSB(blackPawns);
        // doubled pawns
        const pawnsOnFile = countBits(and(this.bitboards[PIECE.BLACK_PAWN], FILE_MASKS[square]));
        if (pawnsOnFile > 1) score -= DOUBLED_PAWN_PENALTY * pawnsOnFile;
        // isolated pawns
        if (isZero(and(this.bitboards[PIECE.BLACK_PAWN], ISOLATED_MASKS[square]))) score -= ISOLATED_PAWN_PENALTY;
        // passed pawns
        if (isZero(and(this.bitboards[PIECE.WHITE_PAWN], PASSED_PAWN_MASKS[COLOUR.BLACK][square]))) score -= PASSED_PAWN_BONUS[7 - squareToRank(square)];
        popBit(blackPawns, square);
      }
      const whiteRooks = copyBitboard(this.bitboards[PIECE.WHITE_ROOK]);
      while (!isZero(whiteRooks)) {
        const square = getLSB(whiteRooks);
        // semi open file
        if (isZero(and(this.bitboards[PIECE.WHITE_PAWN], FILE_MASKS[square]))) score += SEMI_OPEN_FILE_SCORE;
        // open file
        if (isZero(and(or(this.bitboards[PIECE.WHITE_PAWN], this.bitboards[PIECE.BLACK_PAWN]), FILE_MASKS[square]))) score += OPEN_FILE_SCORE;
        popBit(whiteRooks, square);
      }
      const blackRooks = copyBitboard(this.bitboards[PIECE.BLACK_ROOK]);
      while (!isZero(blackRooks)) {
        const square = getLSB(blackRooks);
        // semi open file
        if (isZero(and(this.bitboards[PIECE.BLACK_PAWN], FILE_MASKS[square]))) score -= SEMI_OPEN_FILE_SCORE;
        // open file
        if (isZero(and(or(this.bitboards[PIECE.WHITE_PAWN], this.bitboards[PIECE.BLACK_PAWN]), FILE_MASKS[square]))) score -= OPEN_FILE_SCORE;
        popBit(blackRooks, square);
      }
      const whiteKingSquare = getLSB(this.bitboards[PIECE.WHITE_KING]);
      // semi open file
      if (isZero(and(this.bitboards[PIECE.WHITE_PAWN], FILE_MASKS[whiteKingSquare]))) score -= SEMI_OPEN_FILE_SCORE;
      // open file
      if (isZero(and(or(this.bitboards[PIECE.WHITE_PAWN], this.bitboards[PIECE.BLACK_PAWN]), FILE_MASKS[whiteKingSquare]))) score -= OPEN_FILE_SCORE;
      const blackKingSquare = getLSB(this.bitboards[PIECE.BLACK_KING]);
      // semi open file
      if (isZero(and(this.bitboards[PIECE.BLACK_PAWN], FILE_MASKS[blackKingSquare]))) score += SEMI_OPEN_FILE_SCORE;
      // open file
      if (isZero(and(or(this.bitboards[PIECE.WHITE_PAWN], this.bitboards[PIECE.BLACK_PAWN]), FILE_MASKS[blackKingSquare]))) score += OPEN_FILE_SCORE;
      // bishop pair
      if (countBits(this.bitboards[PIECE.WHITE_BISHOP]) > 2) score += BISHOP_PAIR_BONUS;
      if (countBits(this.bitboards[PIECE.BLACK_BISHOP]) > 2) score -= BISHOP_PAIR_BONUS;
    }
    // experimental - penalty for fifty move rule
    // score = score * Math.floor((100 - this.fiftyMove) / 100);
    return this.side === COLOUR.WHITE ? score : -score;
  }

  // 0 = opening/middle game, 1 = end game
  getGamePhase() {
    let score = 0;
    for (let piece = PIECE.WHITE_KNIGHT; piece <= PIECE.WHITE_QUEEN; ++piece) score += countBits(this.bitboards[piece]) * MATERIAL_SCORE[piece];
    for (let piece = PIECE.BLACK_KNIGHT; piece <= PIECE.BLACK_QUEEN; ++piece) score += countBits(this.bitboards[piece]) * -MATERIAL_SCORE[piece];
    return score <= 2460 ? 1 : 0;
  }

  enablePvScoring(moves) {
    this.followPv = false;
    for (let i = 0; i < moves.length; ++i) {
      if (this.pvTable[0][this.searchPly] === moves[i]) {
        this.scorePv = true;
        this.followPv = true;
        return;
      }
    }
  }

  scoreMove(move) {
    const targetSquare = getTarget(move);
    const movedPiece = getMovedPiece(move);
    if (this.scorePv && this.pvTable[0][this.searchPly] === move) {
      this.scorePv = false;
      return 20000;
    }
    if (isCapture(move)) {
      let targetPiece = PIECE.WHITE_PAWN;
      for (let piece = PIECE.WHITE_PAWN; piece <= PIECE.BLACK_KING; ++piece) {
        if (getBit(this.bitboards[piece], targetSquare)) {
          targetPiece = piece;
          break;
        }
      }
      return MVV_LVA[movedPiece][targetPiece] + 10000;
    }
    if (this.killerMoves[0][this.searchPly] == move) return 9000;
    if (this.killerMoves[1][this.searchPly] == move) return 8000;
    return this.historyMoves[movedPiece][targetSquare];
  }

  isSquareAttacked(square, side) {
    if (!isZero(and(PAWN_ATTACKS[side ^ 1][square], this.bitboards[side * 6 + PIECE.WHITE_PAWN]))) {
      return true;
    }

    for (let piece = side * 6 + PIECE.WHITE_KNIGHT; piece <= side * 6 + PIECE.WHITE_KING; ++piece) {
      if (!isZero(and(this.getAttacks(piece, square), this.bitboards[piece]))) {
        return true;
      }
    }
    return false;
  }

  getAttacks(piece, source) {
    if (isKing(piece)) return KING_ATTACKS[source];
    if (isKnight(piece)) return KNIGHT_ATTACKS[source];
    if (isBishop(piece)) return getBishopAttacks(source, this.occupancies[COLOUR.BOTH]);
    if (isRook(piece)) return getRookAttacks(source, this.occupancies[COLOUR.BOTH]);
    if (isQueen(piece)) return getQueenAttacks(source, this.occupancies[COLOUR.BOTH]);
  }

  generateMoves() {
    const moves = [];
    for (let piece = PIECE.WHITE_PAWN; piece <= PIECE.BLACK_KING; ++piece) {
      const bitboard = copyBitboard(this.bitboards[piece]);
      if (isPawn(piece) && getSide(piece) === this.side) {
        while (!isZero(bitboard)) {
          const source = getLSB(bitboard);
          const target = source + PAWN_PUSH_DIRECTION[this.side];
          if (isOnBoard(target) && !getBit(this.occupancies[COLOUR.BOTH], target)) {
            // pawn promotion
            if (squareToRank(source) === PAWN_START_RANK[this.side ^ 1]) {
              moves.push(encodeMove(source, target, piece, piece + 4, 0));
              moves.push(encodeMove(source, target, piece, piece + 3, 0));
              moves.push(encodeMove(source, target, piece, piece + 2, 0));
              moves.push(encodeMove(source, target, piece, piece + 1, 0));
            } else {
              // pawn quiet
              moves.push(encodeMove(source, target, piece, PIECE.NONE, 0));
              if (squareToRank(source) === PAWN_START_RANK[this.side] && !getBit(this.occupancies[COLOUR.BOTH], target + PAWN_PUSH_DIRECTION[this.side])) {
                moves.push(encodeMove(source, target + PAWN_PUSH_DIRECTION[this.side], piece, PIECE.NONE, PAWN_START_FLAG));
              }
            }
          }
          const attacks = and(PAWN_ATTACKS[this.side][source], this.occupancies[this.side ^ 1]);
          while (!isZero(attacks)) {
            const attackTarget = getLSB(attacks);
            // pawn capture promotion
            if (squareToRank(source) === PAWN_START_RANK[this.side ^ 1]) {
              moves.push(encodeMove(source, attackTarget, piece, piece + 4, CAPTURE_FLAG));
              moves.push(encodeMove(source, attackTarget, piece, piece + 3, CAPTURE_FLAG));
              moves.push(encodeMove(source, attackTarget, piece, piece + 2, CAPTURE_FLAG));
              moves.push(encodeMove(source, attackTarget, piece, piece + 1, CAPTURE_FLAG));
            } else {
              // pawn capture
              moves.push(encodeMove(source, attackTarget, piece, PIECE.NONE, CAPTURE_FLAG));
            }
            popBit(attacks, attackTarget);
          }
          if (this.enPassant !== SQUARE.NONE) {
            if (getBit(PAWN_ATTACKS[this.side][source], this.enPassant)) {
              moves.push(encodeMove(source, this.enPassant, piece, PIECE.NONE, CAPTURE_FLAG | EN_PASSANT_FLAG));
            }
          }
          popBit(bitboard, source);
        }
      } else if (getSide(piece) === this.side) {
        while (!isZero(bitboard)) {
          const source = getLSB(bitboard);
          const attacks = and(this.getAttacks(piece, source), negate(this.occupancies[this.side]));
          while (!isZero(attacks)) {
            const target = getLSB(attacks);
            if (getBit(this.occupancies[this.side ^ 1], target)) {
              // capture
              moves.push(encodeMove(source, target, piece, PIECE.NONE, CAPTURE_FLAG));
            } else {
              // quiet
              moves.push(encodeMove(source, target, piece, PIECE.NONE, 0));
            }
            popBit(attacks, target);
          }
          popBit(bitboard, source);
        }
      }
      if (piece === PIECE.WHITE_KING && COLOUR.WHITE === this.side) {
        if (this.castlePermission & CASTLE.WHITE_KING_SIDE && !getBit(this.occupancies[COLOUR.BOTH], SQUARE.F1) && !getBit(this.occupancies[COLOUR.BOTH], SQUARE.G1) &&
          !this.isSquareAttacked(SQUARE.E1, COLOUR.BLACK) && !this.isSquareAttacked(SQUARE.F1, COLOUR.BLACK) && !this.isSquareAttacked(SQUARE.G1, COLOUR.BLACK)) {
          moves.push(encodeMove(SQUARE.E1, SQUARE.G1, piece, PIECE.NONE, CASTLE_FLAG));
        }
        if (this.castlePermission & CASTLE.WHITE_QUEEN_SIDE &&
          !getBit(this.occupancies[COLOUR.BOTH], SQUARE.B1) && !getBit(this.occupancies[COLOUR.BOTH], SQUARE.C1) && !getBit(this.occupancies[COLOUR.BOTH], SQUARE.D1) &&
          !this.isSquareAttacked(SQUARE.C1, COLOUR.BLACK) && !this.isSquareAttacked(SQUARE.E1, COLOUR.BLACK) && !this.isSquareAttacked(SQUARE.D1, COLOUR.BLACK)) {
          moves.push(encodeMove(SQUARE.E1, SQUARE.C1, piece, PIECE.NONE, CASTLE_FLAG));
        }
      } else if (piece === PIECE.BLACK_KING && COLOUR.BLACK === this.side) {
        if (this.castlePermission & CASTLE.BLACK_KING_SIDE && !getBit(this.occupancies[COLOUR.BOTH], SQUARE.F8) && !getBit(this.occupancies[COLOUR.BOTH], SQUARE.G8) &&
          !this.isSquareAttacked(SQUARE.E8, COLOUR.WHITE) && !this.isSquareAttacked(SQUARE.F8, COLOUR.WHITE) && !this.isSquareAttacked(SQUARE.G8, COLOUR.WHITE)) {
          moves.push(encodeMove(SQUARE.E8, SQUARE.G8, piece, PIECE.NONE, CASTLE_FLAG));
        }
        if (this.castlePermission & CASTLE.BLACK_QUEEN_SIDE &&
          !getBit(this.occupancies[COLOUR.BOTH], SQUARE.B8) && !getBit(this.occupancies[COLOUR.BOTH], SQUARE.C8) && !getBit(this.occupancies[COLOUR.BOTH], SQUARE.D8) &&
          !this.isSquareAttacked(SQUARE.E8, COLOUR.WHITE) && !this.isSquareAttacked(SQUARE.C8, COLOUR.WHITE) && !this.isSquareAttacked(SQUARE.D8, COLOUR.WHITE)) {
          moves.push(encodeMove(SQUARE.E8, SQUARE.C8, piece, PIECE.NONE, CASTLE_FLAG));
        }
      }
    }
    return moves;
  }

  generateCaptures() {
    const moves = [];
    for (let piece = PIECE.WHITE_PAWN; piece <= PIECE.BLACK_KING; ++piece) {
      const bitboard = copyBitboard(this.bitboards[piece]);
      if (isPawn(piece) && getSide(piece) === this.side) {
        while (!isZero(bitboard)) {
          const source = getLSB(bitboard);
          const attacks = and(PAWN_ATTACKS[this.side][source], this.occupancies[this.side ^ 1]);
          while (!isZero(attacks)) {
            const attackTarget = getLSB(attacks);
            // pawn capture promotion
            if (squareToRank(source) === PAWN_START_RANK[this.side ^ 1]) {
              moves.push(encodeMove(source, attackTarget, piece, piece + 4, CAPTURE_FLAG));
              moves.push(encodeMove(source, attackTarget, piece, piece + 3, CAPTURE_FLAG));
              moves.push(encodeMove(source, attackTarget, piece, piece + 2, CAPTURE_FLAG));
              moves.push(encodeMove(source, attackTarget, piece, piece + 1, CAPTURE_FLAG));
            } else {
              // pawn capture
              moves.push(encodeMove(source, attackTarget, piece, PIECE.NONE, CAPTURE_FLAG));
            }
            popBit(attacks, attackTarget);
          }
          if (this.enPassant !== SQUARE.NONE) {
            if (getBit(PAWN_ATTACKS[this.side][source], this.enPassant)) {
              moves.push(encodeMove(source, this.enPassant, piece, PIECE.NONE, CAPTURE_FLAG | EN_PASSANT_FLAG));
            }
          }
          popBit(bitboard, source);
        }
      } else if (getSide(piece) === this.side) {
        while (!isZero(bitboard)) {
          const source = getLSB(bitboard);
          const attacks = and(this.getAttacks(piece, source), negate(this.occupancies[this.side]));
          while (!isZero(attacks)) {
            const target = getLSB(attacks);
            if (getBit(this.occupancies[this.side ^ 1], target)) {
              // capture
              moves.push(encodeMove(source, target, piece, PIECE.NONE, CAPTURE_FLAG));
            }
            popBit(attacks, target);
          }
          popBit(bitboard, source);
        }
      }
    }
    return moves;
  }

  addPiece(piece, square) {
    setBit(this.bitboards[piece], square);
    setBit(this.occupancies[getSide(piece)], square);
    this.key ^= PIECE_KEYS[piece][square];
  }

  clearPiece(piece, square) {
    popBit(this.bitboards[piece], square);
    popBit(this.occupancies[getSide(piece)], square);
    this.key ^= PIECE_KEYS[piece][square];
  }

  makeMove(move) {
    const source = getSource(move);
    const target = getTarget(move);
    const movedPiece = getMovedPiece(move);
    const promotedPiece = getPromotedPiece(move);

    this.history[this.historyPly] = {
      move,
      capturedPiece: PIECE.NONE,
      enPassant: this.enPassant,
      fiftyMove: this.fiftyMove,
      castlePermission: this.castlePermission,
      key: this.key
    }
    ++this.fiftyMove;

    this.clearPiece(movedPiece, source);
    this.addPiece(promotedPiece === PIECE.NONE ? movedPiece : promotedPiece, target);
    if (isCapture(move)) {
      this.fiftyMove = 0;
      for (let p = (this.side ^ 1) * 6; p <= (this.side ^ 1) * 6 + 5; ++p) {
        if (getBit(this.bitboards[p], target)) {
          this.clearPiece(p, target);
          this.history[this.historyPly].capturedPiece = p;
          break;
        }
      }
    } else if (isPawn(movedPiece)) {
      this.fiftyMove = 0;
    }
    if (isEnPassant(move)) {
      this.clearPiece((this.side ^ 1) * 6, target + PAWN_PUSH_DIRECTION[this.side ^ 1]);
    } else if (isCastle(move)) {
      switch (target) {
        case SQUARE.C1:
          this.clearPiece(PIECE.WHITE_ROOK, SQUARE.A1);
          this.addPiece(PIECE.WHITE_ROOK, SQUARE.D1);
          break;
        case SQUARE.C8:
          this.clearPiece(PIECE.BLACK_ROOK, SQUARE.A8);
          this.addPiece(PIECE.BLACK_ROOK, SQUARE.D8);
          break;
        case SQUARE.G1:
          this.clearPiece(PIECE.WHITE_ROOK, SQUARE.H1);
          this.addPiece(PIECE.WHITE_ROOK, SQUARE.F1);
          break;
        case SQUARE.G8:
          this.clearPiece(PIECE.BLACK_ROOK, SQUARE.H8);
          this.addPiece(PIECE.BLACK_ROOK, SQUARE.F8);
        default:
          break;
      }
    }
    this.occupancies[COLOUR.BOTH] = or(this.occupancies[COLOUR.WHITE], this.occupancies[COLOUR.BLACK]);
    this.key ^= CASTLE_KEYS[this.castlePermission];
    this.castlePermission &= CASTLE_PERMISSION[source] & CASTLE_PERMISSION[target];
    this.key ^= CASTLE_KEYS[this.castlePermission];
    ++this.historyPly;
    if (this.side === COLOUR.BLACK) {
      ++this.fullMove;
    }
    if (this.enPassant !== SQUARE.NONE) this.key ^= EN_PASSANT_KEYS[this.enPassant];
    if (isPawnStart(move)) {
      this.enPassant = target + PAWN_PUSH_DIRECTION[this.side ^ 1];
      this.key ^= EN_PASSANT_KEYS[this.enPassant];
    } else {
      this.enPassant = SQUARE.NONE;
    }
    this.side ^= 1;
    this.key ^= SIDE_KEY;
    if (this.isSquareAttacked(getLSB(this.bitboards[(this.side ^ 1) * 6 + PIECE.WHITE_KING]), this.side)) {
      this.takeMove();
      return false;
    }
    return true;
  }

  takeMove() {
    --this.historyPly;
    if (this.side === COLOUR.WHITE) {
      --this.fullMove;
    }
    const move = this.history[this.historyPly].move;
    const capturedPiece = this.history[this.historyPly].capturedPiece;
    this.enPassant = this.history[this.historyPly].enPassant;
    this.fiftyMove = this.history[this.historyPly].fiftyMove;
    this.castlePermission = this.history[this.historyPly].castlePermission;
    this.side ^= 1;

    const source = getSource(move);
    const target = getTarget(move);
    const movedPiece = getMovedPiece(move);
    const promotedPiece = getPromotedPiece(move);

    this.clearPiece(promotedPiece === PIECE.NONE ? movedPiece : promotedPiece, target);
    this.addPiece(movedPiece, source);
    if (capturedPiece !== PIECE.NONE) {
      this.addPiece(capturedPiece, target);
    }
    if (isEnPassant(move)) {
      this.addPiece([(this.side ^ 1) * 6], target + PAWN_PUSH_DIRECTION[this.side ^ 1]);
    } else if (isCastle(move)) {
      switch (target) {
        case SQUARE.C1:
          this.addPiece(PIECE.WHITE_ROOK, SQUARE.A1);
          this.clearPiece(PIECE.WHITE_ROOK, SQUARE.D1);
          break;
        case SQUARE.C8:
          this.addPiece(PIECE.BLACK_ROOK, SQUARE.A8);
          this.clearPiece(PIECE.BLACK_ROOK, SQUARE.D8);
          break;
        case SQUARE.G1:
          this.addPiece(PIECE.WHITE_ROOK, SQUARE.H1);
          this.clearPiece(PIECE.WHITE_ROOK, SQUARE.F1);
          break;
        case SQUARE.G8:
          this.addPiece(PIECE.BLACK_ROOK, SQUARE.H8);
          this.clearPiece(PIECE.BLACK_ROOK, SQUARE.F8);
        default:
          break;
      }
    }
    this.occupancies[COLOUR.BOTH] = or(this.occupancies[COLOUR.WHITE], this.occupancies[COLOUR.BLACK]);
    this.key = this.history[this.historyPly].key;
  }

  makeNullMove() {
    this.history[this.historyPly++] = {
      enPassant: this.enPassant,
      fiftyMove: this.fiftyMove,
      key: this.key
    }
    this.side ^= 1;
    this.key ^= SIDE_KEY;
    if (this.enPassant !== SQUARE.NONE) this.key ^= EN_PASSANT_KEYS[this.enPassant];
    this.enPassant = SQUARE.NONE;
    this.fiftyMove = 0;
  }

  takeNullMove() {
    --this.historyPly;
    this.enPassant = this.history[this.historyPly].enPassant;
    this.fiftyMove = this.history[this.historyPly].fiftyMove;
    this.key = this.history[this.historyPly].key;
    this.side ^= 1;
  }

  perftDriver(depth) {
    if (depth <= 0) return 1;
    let nodes = 0;
    const moves = this.generateMoves();
    for (let i = 0; i < moves.length; ++i) {
      if (!this.makeMove(moves[i])) continue;
      nodes += this.perftDriver(depth - 1);
      this.takeMove();
    }
    return nodes;
  }

  perft(depth) {
    let nodes = 0;
    console.log(`Perft Test: depth ${depth}`);
    const startTime = Date.now();
    const moves = this.generateMoves();
    for (let i = 0; i < moves.length; ++i) {
      if (!this.makeMove(moves[i])) continue;
      const oldNodes = this.perftDriver(depth - 1);
      nodes += oldNodes;
      console.log(` Move: ${i + 1}\t${moveToString(moves[i])}\tnodes: ${oldNodes}`);
      this.takeMove();
    }
    const endTime = Date.now();
    console.log(` Depth: ${depth}\n Nodes: ${nodes}\n Time: ${endTime - startTime}ms`);
    return nodes;
  }

  multiSearch(depth, lines = 3) {
    const output = [];
    const excludedMoves = [];
    for (let line = 0; line < lines; ++line) {
      console.table(`line ${line + 1}`);
      const search = this.search(line === 0 ? depth : Math.max(5, depth - 1), excludedMoves);
      if (!search.moveEncoded) break;
      excludedMoves.push(search.moveEncoded);
      output.push(search);
    }
    console.table(output);
    return output;
  }

  search(depth, excludedMoves = []) {
    const start = Date.now();
    this.resetSearch();

    let alpha = -INFINITY;
    let beta = INFINITY;
    let score = 0;
    for (let currentDepth = 1; currentDepth <= depth; ++currentDepth) {
      this.followPv = true;
      score = this.negamax(alpha, beta, currentDepth, true, excludedMoves);
      // we fell outside the window, so try again with a full-width window and same depth
      if (score <= alpha || score >= beta) {
        alpha = -INFINITY;
        beta = INFINITY;
        --currentDepth;
        continue;
      }
      // aspiration window for iterative deepening
      alpha = score - 50;
      beta = score + 50;

      const end = Date.now();
      let line = "info score ";
      if (score > -MATE_VALUE && score < -MATE_SCORE) {
        line += `mate ${-Math.floor((score + MATE_VALUE) / 2) - 1}`;
      }
      else if (score > MATE_SCORE && score < MATE_VALUE) {
        line += `mate ${Math.floor((MATE_VALUE - score) / 2) + 1}`;
      } else {
        line += `cp ${score}`;
      }
      line += ` depth ${currentDepth} nodes ${this.searchedNodes} time ${end - start}ms pv `;

      for (let i = 0; i < this.pvLength[0]; ++i) {
        line += moveToString(this.pvTable[0][i]) + " ";
      }
      console.log(line);

      // experimental - if found mate end search early
      const absoluteScore = Math.abs(score);
      if (absoluteScore > MATE_SCORE && absoluteScore < MATE_VALUE) break;
    }
    return {
      moveEncoded: this.pvTable[0][0],
      moveString: moveToString(this.pvTable[0][0]),
      score
    };
  }

  quiescence(alpha, beta) {
    const evaluation = this.evaluate();
    if (this.searchPly > MAX_PLY - 1) return evaluation;
    if (evaluation >= beta) {
      return beta;
    }
    if (evaluation > alpha) {
      alpha = evaluation;
    }
    ++this.searchedNodes;
    const moves = this.generateCaptures().sort((a, b) => this.scoreMove(b) - this.scoreMove(a));
    for (let i = 0; i < moves.length; ++i) {
      const move = moves[i];
      ++this.searchPly;
      if (!this.makeMove(move)) {
        --this.searchPly;
        continue;
      }
      let score = -this.quiescence(-beta, -alpha);
      --this.searchPly;
      this.takeMove();

      if (score > alpha) {
        alpha = score;
        if (score >= beta) {
          return beta;
        }
      }
    }
    return alpha;
  }

  negamax(alpha, beta, depth, doNullMove, excludedMoves = []) {
    let score = 0;
    let hashFlag = HASH_ALPHA;
    let pvNode = beta - alpha > 1;
    let futilityPruning = false;
    if (this.searchPly > 0 && (score = this.hashTable.read(this.key, alpha, beta, depth, this.searchPly)) !== NO_HASH_ENTRY && !pvNode) {
      return score;
    }
    this.pvLength[this.searchPly] = this.searchPly;
    if (this.searchPly > 0 && (this.fiftyMove >= 100 || this.isRepetition())) return 0;
    if (depth <= 0) return this.quiescence(alpha, beta);
    if (this.searchPly > MAX_PLY - 1) return this.evaluate();
    ++this.searchedNodes;

    // mate distance pruning
    if (alpha < -MATE_VALUE) alpha = -MATE_VALUE;
    if (beta > MATE_VALUE - 1) beta = MATE_VALUE - 1;
    if (alpha >= beta) return alpha;

    const inCheck = this.isSquareAttacked(getLSB(this.bitboards[this.side * 6 + PIECE.WHITE_KING]), this.side ^ 1);
    if (inCheck) ++depth;
    if (!inCheck && !pvNode) {
      const staticEval = this.evaluate();
      // evalution pruning
      if (depth < 3 && Math.abs(beta - 1) > -MATE_VALUE + 100) {
        const evalMargin = 100 * depth;
        if (staticEval - evalMargin >= beta) return staticEval - evalMargin;
      }
      // null move pruning
      if (doNullMove && depth > 2 && staticEval >= beta && this.searchPly > 0 &&
        (countBits(this.bitboards[this.side * 6 + PIECE.WHITE_ROOK]) > 0 || countBits(this.bitboards[this.side * 6 + PIECE.WHITE_QUEEN]) > 0)) {
        ++this.searchPly;
        this.makeNullMove();
        score = -this.negamax(-beta, -beta + 1, depth - 1 - 2, false);
        --this.searchPly;
        this.takeNullMove();
        if (score >= beta) {
          return beta;
        }
      }
      // razoring
      score = staticEval + 125;
      if (score < beta) {
        if (depth === 1) {
          const newScore = this.quiescence(alpha, beta);
          return newScore > score ? newScore : score;
        }
        // score += 175;
        // if (score < beta && depth <= 3) {
        //   const newScore = this.quiescence(alpha, beta);
        //   if (newScore < beta) return newScore > score ? newScore : score;
        // }
      }

      if (depth < 4 && Math.abs(alpha) < MATE_SCORE && staticEval + FUTILITY_MARGIN[depth] <= alpha) {
        futilityPruning = true;
      }
    }

    let legalMoves = 0;
    let moves = this.generateMoves();
    if (this.searchPly === 0) moves = moves.filter(move => !excludedMoves.includes(move));
    if (this.followPv) this.enablePvScoring(moves);
    moves.sort((a, b) => this.scoreMove(b) - this.scoreMove(a));
    let movesSearched = 0;
    for (let i = 0; i < moves.length; ++i) {
      const move = moves[i];
      ++this.searchPly;
      if (!this.makeMove(move)) {
        --this.searchPly;
        continue;
      }
      ++legalMoves;
      if (movesSearched === 0) {
        score = -this.negamax(-beta, -alpha, depth - 1, true);
      } else {
        const moveGivesCheck = this.isSquareAttacked(getLSB(this.bitboards[this.side * 6 + PIECE.WHITE_KING]), this.side ^ 1);
        if (futilityPruning && !inCheck && !moveGivesCheck && !isCapture(move) && getPromotedPiece(move) === PIECE.NONE) {
          --this.searchPly;
          this.takeMove();
          continue;

        }
        // late move reduction
        if (movesSearched >= FULL_DEPTH_MOVES && depth >= REDUCTION_LIMIT &&
          !inCheck && !moveGivesCheck && !isCapture(move) && getPromotedPiece(move) === PIECE.NONE) {
          score = -this.negamax(-alpha - 1, - alpha, depth - 2, true);
        } else {
          score = alpha + 1
        }
        if (score > alpha) {
          score = -this.negamax(-alpha - 1, -alpha, depth - 1, true);
          if (score > alpha && score < beta) {
            score = -this.negamax(-beta, -alpha, depth - 1, true);
          }
        }
      }
      --this.searchPly;
      this.takeMove();
      ++movesSearched;
      if (score > alpha) {
        hashFlag = HASH_EXACT;
        if (!isCapture(move)) {
          this.historyMoves[getMovedPiece(move)][getTarget(move)] += depth;
        }
        alpha = score;
        this.pvTable[this.searchPly][this.searchPly] = move;
        for (let i = this.searchPly + 1; i < this.pvLength[this.searchPly + 1]; ++i) {
          this.pvTable[this.searchPly][i] = this.pvTable[this.searchPly + 1][i];
        }
        this.pvLength[this.searchPly] = this.pvLength[this.searchPly + 1];
        if (score >= beta) {
          this.hashTable.write(this.key, beta, depth, this.searchPly, HASH_BETA);
          if (!isCapture(move)) {
            this.killerMoves[1][this.searchPly] = this.killerMoves[0][this.searchPly];
            this.killerMoves[0][this.searchPly] = move;
          }
          return beta;
        }
      }
    }
    if (legalMoves === 0) {
      return inCheck ? -MATE_VALUE + this.searchPly : 0;
    }
    this.hashTable.write(this.key, alpha, depth, this.searchPly, hashFlag);
    return alpha;
  }

  parseMove(moveString) {
    const moves = this.generateMoves();
    const sourceFile = moveString[0].charCodeAt(0) - "a".charCodeAt(0);
    const sourceRank = moveString[1] - 1;
    const source = fileRankToSquare(sourceFile, sourceRank);
    const targetFile = moveString[2].charCodeAt(0) - "a".charCodeAt(0);
    const targetRank = moveString[3] - 1;
    const target = fileRankToSquare(targetFile, targetRank);
    for (let i = 0; i < moves.length; ++i) {
      const move = moves[i];
      if (getSource(move) === source && getTarget(move) === target) {
        const promotedPiece = getPromotedPiece(move);
        if (promotedPiece !== PIECE.NONE) {
          if (pieceToAscii(promotedPiece).toLowerCase() === moveString[4]) {
            return move;
          }
          continue;
        }
        return move;
      }
    }
    return 0;
  }

  parseFen(fen) {
    this.reset();
    const [pieces, side, castle, enPassant, halfMove, fullMove] = fen.split(" ");
    for (let i = 0, rank = RANK.RANK_8, file = FILE.FILE_A; rank >= RANK.RANK_1 && i < pieces.length; ++i) {
      switch (pieces[i]) {
        case "p": setBit(this.bitboards[PIECE.BLACK_PAWN], fileRankToSquare(file++, rank)); break;
        case "n": setBit(this.bitboards[PIECE.BLACK_KNIGHT], fileRankToSquare(file++, rank)); break;
        case "b": setBit(this.bitboards[PIECE.BLACK_BISHOP], fileRankToSquare(file++, rank)); break;
        case "r": setBit(this.bitboards[PIECE.BLACK_ROOK], fileRankToSquare(file++, rank)); break;
        case "q": setBit(this.bitboards[PIECE.BLACK_QUEEN], fileRankToSquare(file++, rank)); break;
        case "k": setBit(this.bitboards[PIECE.BLACK_KING], fileRankToSquare(file++, rank)); break;
        case "P": setBit(this.bitboards[PIECE.WHITE_PAWN], fileRankToSquare(file++, rank)); break;
        case "N": setBit(this.bitboards[PIECE.WHITE_KNIGHT], fileRankToSquare(file++, rank)); break;
        case "B": setBit(this.bitboards[PIECE.WHITE_BISHOP], fileRankToSquare(file++, rank)); break;
        case "R": setBit(this.bitboards[PIECE.WHITE_ROOK], fileRankToSquare(file++, rank)); break;
        case "Q": setBit(this.bitboards[PIECE.WHITE_QUEEN], fileRankToSquare(file++, rank)); break;
        case "K": setBit(this.bitboards[PIECE.WHITE_KING], fileRankToSquare(file++, rank)); break;
        case "8": ++file;
        case "7": ++file;
        case "6": ++file;
        case "5": ++file;
        case "4": ++file;
        case "3": ++file;
        case "2": ++file;
        case "1": ++file;
          break;
        case "/":
          --rank;
          file = FILE.FILE_A;
          break;
        default:
          throw `Invalid fen at index ${i}: ${pieces[i]}`;
      }
    }
    this.side = side === "w" ? COLOUR.WHITE : COLOUR.BLACK;
    for (const i of castle) {
      if (i === "-") {
        break;
      }
      switch (i) {
        case "K": this.castlePermission |= CASTLE.WHITE_KING_SIDE; break;
        case "Q": this.castlePermission |= CASTLE.WHITE_QUEEN_SIDE; break;
        case "k": this.castlePermission |= CASTLE.BLACK_KING_SIDE; break;
        case "q": this.castlePermission |= CASTLE.BLACK_QUEEN_SIDE; break;
        default:
          throw `Invalid fen: castle`;
      }
    }
    if (enPassant !== "-") {
      let file = enPassant[0].charCodeAt(0) - "a".charCodeAt(0);
      let rank = enPassant[1] - 1;
      this.enPassant = fileRankToSquare(file, rank);
    }
    this.fiftyMove = parseInt(halfMove);
    if (isNaN(this.fiftyMove)) this.fiftyMove = 0;
    this.fullMove = parseInt(fullMove);
    if (isNaN(this.fullMove)) this.fullMove = 0;

    for (let piece = PIECE.WHITE_PAWN; piece <= PIECE.WHITE_KING; ++piece) {
      this.occupancies[COLOUR.WHITE] = or(this.occupancies[COLOUR.WHITE], this.bitboards[piece]);
    }
    for (let piece = PIECE.BLACK_PAWN; piece <= PIECE.BLACK_KING; ++piece) {
      this.occupancies[COLOUR.BLACK] = or(this.occupancies[COLOUR.BLACK], this.bitboards[piece]);
    }
    this.occupancies[COLOUR.BOTH] = or(this.occupancies[COLOUR.WHITE], this.occupancies[COLOUR.BLACK]);
    this.key = this.generateHashKey();
  }

  boardToString() {
    let output = "";
    for (let rank = RANK.RANK_8; rank >= RANK.RANK_1; --rank) {
      output += ` ${rank + 1}  `;
      for (let file = FILE.FILE_A; file <= FILE.FILE_H; ++file) {
        let square = fileRankToSquare(file, rank);
        let piece = -1;
        for (let p = PIECE.WHITE_PAWN; p <= PIECE.BLACK_KING; ++p) {
          if (getBit(this.bitboards[p], square)) {
            piece = p;
            break;
          }
        }
        output += ` ${piece === -1 ? "." : pieceToAscii(piece)}`;
      }
      output += "\n";
    }
    output += "\n     a b c d e f g h";
    output += `\n     Side: ${"wb-"[this.side]}`;
    output += `\n     EnPas: ${this.enPassant !== SQUARE.NONE ? squareToFileRank(this.enPassant) : "N/A"}`;
    output += "\n     Castle: "
    if (this.castlePermission & CASTLE.WHITE_KING_SIDE) output += "K";
    if (this.castlePermission & CASTLE.WHITE_QUEEN_SIDE) output += "Q";
    if (this.castlePermission & CASTLE.BLACK_KING_SIDE) output += "k";
    if (this.castlePermission & CASTLE.BLACK_QUEEN_SIDE) output += "q";
    // todo
    output += `\n     Key: ${this.key}`;
    return output;
  }

  boardToArray() {
    let output = [];
    for (let rank = RANK.RANK_1; rank <= RANK.RANK_8; ++rank) {
      output[rank] = [];
      for (let file = FILE.FILE_A; file <= FILE.FILE_H; ++file) {
        let square = fileRankToSquare(file, rank);
        let piece = -1;
        for (let p = PIECE.WHITE_PAWN; p <= PIECE.BLACK_KING; ++p) {
          if (getBit(this.bitboards[p], square)) {
            piece = p;
            break;
          }
        }
        output[rank][file] = `${piece === -1 ? "." : pieceToAscii(piece)}`;
      }
    }
    return output;
  }
}

function magic64ToBitboardCode(array) {
  let b32 = array.map(x => {
    let low = Number(x & 0xFFFFFFFFn)
    let high = Number((x >> 32n) & 0xFFFFFFFFn)
    return [low, high];
  });

  let line = "[\n";
  for (let i = 0; i < 64; i += 4) {
    line += `[${b32[i][0]}, ${b32[i][1]}],[${b32[i + 1][0]}, ${b32[i + 1][1]}],[${b32[i + 2][0]}, ${b32[i + 2][1]}],[${b32[i + 3][0]}, ${b32[i + 3][1]}],\n`
  }
  line += "]";
  console.log(line);
}

initLeaperAttacks();
initSliderAttacks();
initEvaluationMasks();

// testing

// const engine = new Engine(2);

// engine.parseFen(FEN_1);
// console.log(engine.boardToString());
// engine.search(7);

// console.log(moveToString(engine.parseMove("g2g1q")));
// engine.perft(4);

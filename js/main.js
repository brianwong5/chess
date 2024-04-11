import Engine, { START_FEN } from "./engine.js";
import ChessGUI from "./gui.js";
import { Chess } from './lib/chess.js';
import PgnParser from "./lib/pgn-parser.js";

(function () {
  const engine = new Engine(Engine.PESTO);
  const gui = new ChessGUI("#board", { handleMove, afterMove });

  mirror(engine, gui);
  let book;

  document.getElementById("set-fen").addEventListener("click", () => {
    const fenString = document.getElementById("fen-input").value;
    engine.parseFen(fenString);
    mirror(engine, gui);
  });
  document.getElementById("file-input-btn").addEventListener("click", () => {
    const fileInput = document.getElementById("file-input");
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (event) {
      const fileContent = event.target.result;
      const pgn = PgnParser.parse(fileContent, { startRule: "games" });
      book = toBook(pgn);
    };
    reader.readAsText(file);
  });
  document.getElementById("analyse").addEventListener("click", () => {
    const move = engine.search(document.getElementById("search-depth").value);
    const bestMove = move.moveString;
    if (bestMove) {
      document.getElementById("output-best").textContent = bestMove;
      document.getElementById("output-score").textContent = move.score;
    }
  });
  document.getElementById("make-move").addEventListener("click", engineMove);
  document.getElementById("undo").addEventListener("click", () => {
    if (engine.historyPly > 0) {
      engine.takeMove();
      mirror(engine, gui);
    }
  });
  document.getElementById("new-game").addEventListener("click", () => {
    document.getElementById("output-best").textContent = "";
    document.getElementById("output-score").textContent = "";
    console.clear();
    engine.parseFen(START_FEN);
    mirror(engine, gui);
    book = undefined;
  });
  document.getElementById("flip-board").addEventListener("click", () => gui.flip());
  document.getElementById("perft").addEventListener("click", () => engine.perft(document.getElementById("perft-depth").value));

  function mirror(engine, gui) {
    gui.clear();
    const letters = "FPNBRQK"
    const array = engine.boardToArray();
    for (let rank = 0; rank < 8; ++rank) {
      for (let file = 0; file < 8; ++file) {
        const piece = array[rank][file];
        if (piece !== ".") {
          gui.addPiece(file, rank, (piece === piece.toUpperCase()) ? ChessGUI.WHITE : ChessGUI.BLACK, letters.indexOf(piece.toUpperCase()));
        }
      }
    }
    console.log(engine.boardToString());
  }
  function engineMove() {
    if (book?.get(engine.key)) {
      const bookMoves = book.get(engine.key);
      const move = bookMoves[Math.floor(Math.random() * bookMoves.length)];
      engine.makeMove(engine.parseMove(move));
      mirror(engine, gui);
      gui.highlight(move.charCodeAt(0) - "a".charCodeAt(0), move[1] - 1);
      gui.highlight(move.charCodeAt(2) - "a".charCodeAt(0), move[3] - 1);
    } else {
      const bestMove = engine.search(document.getElementById("search-depth").value);
      if (bestMove.moveEncoded) {
        document.getElementById("output-best").textContent = bestMove.moveString;
        document.getElementById("output-score").textContent = bestMove.score;
        engine.makeMove(bestMove.moveEncoded);
        mirror(engine, gui);
        gui.highlight(bestMove.moveString.charCodeAt(0) - "a".charCodeAt(0), bestMove.moveString[1] - 1);
        gui.highlight(bestMove.moveString.charCodeAt(2) - "a".charCodeAt(0), bestMove.moveString[3] - 1);
      }
    }
  }
  function handleMove(move) {
    const encoded = engine.parseMove(move) || engine.parseMove(move + "q");
    if (engine.makeMove(encoded)) {
      mirror(engine, gui);
      gui.highlight(move.charCodeAt(0) - "a".charCodeAt(0), move[1] - 1);
      gui.highlight(move.charCodeAt(2) - "a".charCodeAt(0), move[3] - 1);
      return true;
    }
    return false;
  }
  function afterMove() {
    if (document.getElementById("mode").value === "1") {
      setTimeout(engineMove, 200);
    }
  }
  function toBook(parseTrees) {
    const chess = new Chess(); // using chess.js to parse standard notation
    const tempEngine = new Engine();
    const book = new Map();

    function traverse(moveList) {
      if (moveList.length === 0) return;

      const nextMove = moveList[0];
      const lan = chess.move(nextMove.notation.notation).lan;
      const key = tempEngine.key;
      tempEngine.makeMove(tempEngine.parseMove(lan));
      if (!book.has(key)) {
        book.set(key, []);
      }
      if (!book.get(key).includes(lan)) {
        book.get(key).push(lan);
        console.log(`added book entry: ${key} => ${nextMove.notation.notation} / ${lan}`);
      }
      
      traverse(moveList.slice(1));
      chess.undo();
      tempEngine.takeMove();
      nextMove.variations.forEach(variation => traverse(variation));
    }

    for (const parseTree of parseTrees) {
      traverse(parseTree.moves);  
    }

    return book;
  }
})();

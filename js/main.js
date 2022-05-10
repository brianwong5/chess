import Engine, { START_FEN } from "./engine.js";
import ChessGUI from "./gui.js";

(function () {
  const engine = new Engine(Engine.PESTO);
  const gui = new ChessGUI("#board", { handleMove, afterMove });

  engine.parseFen(START_FEN);
  mirror(engine, gui);

  document.getElementById("set-fen").addEventListener("click", () => {
    const fenString = document.getElementById("fen-input").value;
    engine.parseFen(fenString);
    mirror(engine, gui);
  });
  document.getElementById("analyse").addEventListener("click", () => {
    const bestMove = engine.search(8).moveString;
    if (bestMove) {
      document.getElementById("output-best").textContent = bestMove;
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
    engine.parseFen(START_FEN);
    mirror(engine, gui);
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
  }
  function engineMove() {
    const bestMove = engine.search(7);
    if (bestMove.moveEncoded) {
      document.getElementById("output-best").textContent = bestMove.moveString;
      engine.makeMove(bestMove.moveEncoded);
      mirror(engine, gui);
      gui.highlight(bestMove.moveString.charCodeAt(0) - "a".charCodeAt(0), bestMove.moveString[1] - 1);
      gui.highlight(bestMove.moveString.charCodeAt(2) - "a".charCodeAt(0), bestMove.moveString[3] - 1);
    }
  }
  function handleMove(move) {
    const encoded = engine.parseMove(move);
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
})();

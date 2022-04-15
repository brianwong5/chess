(function () {
  const engine = new Engine();
  const gui = new ChessGUI("#board", { handleMove, afterMove });

  engine.parseFen(START_FEN);
  mirror(engine, gui);

  document.getElementById("set-fen").addEventListener("click", () => {
    const fenString = document.getElementById("fen-input").value;
    engine.parseFen(fenString);
    mirror(engine, gui);
  });
  document.getElementById("analyse").addEventListener("click", () => {
    // search.time = parseInt(document.getElementById("time").value);
    // search.level = parseInt(document.getElementById("level").value);
    const bestMove = engine.search(8).moveString;
    if (bestMove) {
      document.getElementById("output-best").textContent = bestMove;
    }
  });
  document.getElementById("make-move").addEventListener("click", () => {
    const bestMove = engine.search(8);
    if (bestMove.moveEncoded) {
      document.getElementById("output-best").textContent = bestMove.moveString;
      engine.makeMove(bestMove.moveEncoded);
      mirror(engine, gui);
    }
  });
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
  function handleMove(move) {
    const encoded = engine.parseMove(move);
    if (encoded) {
      engine.makeMove(encoded);
      mirror(engine, gui);
      return true;
    }
    return false;
  }
  function afterMove() {
    console.log(document.getElementById("mode").value === "1")
    if (document.getElementById("mode").value === "1") {
      console.log("computer move")
      setTimeout(() => {
        const bestMove = engine.search(8);
        if (bestMove.moveEncoded) {
          document.getElementById("output-best").textContent = bestMove.moveString;
          engine.makeMove(bestMove.moveEncoded);
          mirror(engine, gui);
        }
      }, 200);
    }
  }
})();

(function () {
  const engine = new Engine();
  const gui = new ChessGUI("#board");

  engine.parseFen(FEN_1);

  mirror(engine, gui);

  

})();


function mirror(engine, gui) {
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

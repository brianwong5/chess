const PIECE_LETTER = "FPNBRQK";
const fileLetters = ["a", "b", "c", "d", "e", "f", "g", "h"];
const rankLetters = ["1", "2", "3", "4", "5", "6", "7", "8"];

class ChessGUI {
  static WHITE = 0;
  static BLACK = 1;
  static PAWN = 1;
  static KNIGHT = 2;
  static BISHOP = 3;
  static ROOK = 4;
  static QUEEN = 5;
  static KING = 6;
  static FILE_A = 0;
  static FILE_B = 1;
  static FILE_C = 2;
  static FILE_D = 3;
  static FILE_E = 4;
  static FILE_F = 5;
  static FILE_G = 6;
  static FILE_H = 7;
  static RANK_1 = 0;
  static RANK_2 = 1;
  static RANK_3 = 2;
  static RANK_4 = 3;
  static RANK_5 = 4;
  static RANK_6 = 5;
  static RANK_7 = 6;
  static RANK_8 = 7;
  constructor(container) {
    if (typeof container === "object") {
      this.board = container;
    }
    else if (typeof container === "string") {
      this.board = document.querySelector(container);
    }
    // empty board and create divs
    this.board.textContent = "";
    ["ranks", "files", "squares"].forEach(x => {
      this[x] = document.createElement("div");
      this[x].id = x;
      this.board.appendChild(this[x]);
    });
    // display ranks and files
    rankLetters.slice().reverse().forEach(x => {
      const span = document.createElement("span");
      span.textContent = x;
      this.ranks.appendChild(span);
    });
    fileLetters.forEach(x => {
      const span = document.createElement("span");
      span.textContent = x;
      this.files.appendChild(span);
    });
    //display squares
    for (let col = 0; col < 8; ++col) {
      for (let row = 0; row < 8; ++row) {
        const square = document.createElement("div");
        const colour = col % 2 ? (row % 2 ? "light" : "dark") : (row % 2 ? "dark" : "light");
        square.classList.add("square", colour, `file${fileLetters[row]}`, `rank${rankLetters[7 - col]}`);
        this.squares.appendChild(square);
      }
    }
    // define images
    this.pieceImages = Array(2).fill().map(() => Array(7).fill());
    for (let colour = ChessGUI.WHITE; colour <= ChessGUI.BLACK; ++colour) {
      for (let pieceType = ChessGUI.PAWN; pieceType <= ChessGUI.KING; ++pieceType) {
        const img = document.createElement("img");
        img.src = `img/${colour === ChessGUI.WHITE ? "w" : "b"}${PIECE_LETTER[pieceType]}.png`;
        img.classList.add("piece");
        this.pieceImages[colour][pieceType] = img;
      }
    }
    this.userFrom = null;
    this.board.addEventListener("mousemove", this.followMouse.bind(this));
    this.squares.childNodes.forEach(square => square.addEventListener("click", ({target: element}) => {
      const file = this.getFile(element);
      const rank = this.getRank(element);
      if (this.userFrom === null) {
        this.click = true;
        this.selectedPiece = this.getPiece(file, rank);
        if (this.selectedPiece === undefined) return;
        this.selectedSquare = element;
        this.userFrom = fileLetters[file] + rankLetters[rank];
        element.classList.toggle("selected");
      } else {
        this.click = false;
        this.deselectAll();
        this.selectedPiece.removeAttribute("style");
        this.selectedPiece = undefined;
        this.movePiece(fileLetters.indexOf(this.userFrom[0]), rankLetters.indexOf(this.userFrom[1]), file, rank);
        this.userFrom = null;
      }
    }));
    // this.squares.childNodes.forEach(square => square.addEventListener("mousedown", ({target: element}) => {
    //   if (this.click) return;
    //   const file = this.getFile(element);
    //   const rank = this.getRank(element);
    //   this.selectedPiece = this.getPiece(file, rank);
    //   if (this.selectedPiece === undefined) return;
    //   this.selectedSquare = element;
    //   this.userFrom = fileLetters[file] + rankLetters[rank];
    //   element.classList.toggle("selected");
    // }));
    // this.squares.childNodes.forEach(square => square.addEventListener("mouseup", ({target: element}) => {
    //   if (this.click || this.selectedPiece === undefined) return;
    //   const file = this.getFile(element);
    //   const rank = this.getRank(element);
    //   this.deselectAll();
    //   this.selectedPiece.removeAttribute("style");
    //   this.selectedPiece = undefined;
    //   this.movePiece(fileLetters.indexOf(this.userFrom[0]), rankLetters.indexOf(this.userFrom[1]), file, rank);
    //   this.userFrom = null;
    // }));
  }

  selectSquare(file, rank) {
    this.squareToElement(file, rank).classList.add("selected");
  }

  deselectSquare(file, rank) {
    this.squareToElement(file, rank).classList.remove("selected");
  }

  deselectAll() {
    this.squares.childNodes.forEach(x => x.classList.remove("selected"));
  }

  flip() {
    const invertChildren = element => {
      const children = [...element.childNodes].reverse();
      element.textContent = "";
      children.forEach(x => element.appendChild(x));
    }
    ["ranks", "files", "squares"].forEach(x => invertChildren(this[x]));
  }

  squareToElement(file, rank) {
    return [...this.squares.childNodes].find(x =>
      x.classList.contains(`file${fileLetters[file]}`) && x.classList.contains(`rank${rankLetters[rank]}`));
  }

  getFile(element) {
    return fileLetters.indexOf([...element.classList].find(x => x.startsWith("file"))[4]);
  }

  getRank(element) {
    return rankLetters.indexOf([...element.classList].find(x => x.startsWith("rank"))[4]);
  }

  clear() {
    this.squares.childNodes.forEach(x => x.textContent = "");
  }

  getPiece(file, rank) {
    const square = this.squareToElement(file, rank);
    if (square.childNodes.length === 0) return undefined;
    return this.squareToElement(file, rank).firstElementChild;
  }

  removePiece(file, rank) {
    this.squareToElement(file, rank).textContent = "";
  }

  addPiece(file, rank, colour, pieceType) {
    const img = this.pieceImages[colour][pieceType].cloneNode();
    img.classList.add(`file${fileLetters[file]}`, `rank${rankLetters[rank]}`);
    this.removePiece(file, rank);
    this.squareToElement(file, rank).appendChild(img);
  }

  movePiece(fromFile, fromRank, toFile, toRank) {
    const img = this.getPiece(fromFile, fromRank);
    if (img === null) return;
    img.classList.remove(`file${fileLetters[fromFile]}`, `rank${rankLetters[fromRank]}`);
    img.classList.add(`file${fileLetters[toFile]}`, `rank${rankLetters[toRank]}`);
    this.removePiece(fromFile, fromRank);
    this.removePiece(toFile, toRank);
    this.squareToElement(toFile, toRank).appendChild(img);
  }

  followMouse(event) {
    if (this.selectedPiece === undefined) {
      return;
    }
    const {x, y, width, height} = this.selectedSquare.getBoundingClientRect();
    const {clientX, clientY} = event;
    this.selectedPiece.style.transform = `translate(${clientX - x - width / 2}px, ${clientY - y - height / 2}px)`;
  }
}

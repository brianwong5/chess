/**
 * Board that interacts with the DOM. Builds upon the board class.
 * @param {object|string} parent - DOM element or selector string of element

  */
class BoardGUI extends Board {
  constructor(container, fen) {
    super(fen);
    if (typeof container === "object") {
      this.board = container;
    }
    else if (typeof container === "string") {
      this.board = document.querySelector(container);
    }
    this.pieceImages = ["wP","wN","wB","wR","wQ","wK","bP","bN","bB","bR","bQ","bK"]
    .map(x => {
      const img = document.createElement("img");
      img.src = `img/${x}.png`;
      img.classList.add("piece");
      return img;
    });
    this.init();
    this.load(this.fen());
  }
  init() {
    // empty board and create divs
    this.board.textContent = "";
    ["ranks", "files", "squares"].forEach(x => {
      this[x] = document.createElement("div");
      this[x].id = x;
      this.board.appendChild(this[x]);
    });

    // display ranks and files
    ["8", "7", "6", "5", "4", "3", "2", "1"].forEach(x => {
      const span = document.createElement("span");
      span.textContent = x;
      this.ranks.appendChild(span);
    });
    ["a", "b", "c", "d", "e", "f", "g", "h"].forEach(x => {
      const span = document.createElement("span");
      span.textContent = x;
      this.files.appendChild(span);
    });

    //display squares
    for (let col = 0; col < 8; ++col) {
      for (let row = 0; row < 8; ++row) {
        const square = document.createElement("div");
        square.addEventListener("click", event => {
          console.log(this.elementToSquare(event.target), squareToIndex(this.elementToSquare(event.target)));
        });
        const colour = col % 2 ? (row % 2 ? "light" : "dark") : (row % 2 ? "dark" : "light");
        square.classList.add("square", colour, `file${files[row]}`, `rank${ranks[7 - col]}`);
        this.squares.appendChild(square);
      }
    }
  }
  flip() {
    const invertChildren = element => {
      const children = [...element.childNodes].reverse();
      element.textContent = "";
      children.forEach(x => element.appendChild(x));
    }
    ["ranks", "files", "squares"].forEach(x => invertChildren(this[x]));
  }
  getImage(i) {
    return this.pieceImages[i].cloneNode()
  }
  squareToElement(file, rank) {
    return [...this.squares.childNodes].find(x =>
      x.classList.contains(`file${file}`) && x.classList.contains(`rank${rank}`));
  }
  elementToSquare(e) {
    const file = [...e.classList].find(x => x.startsWith("file"))[4];
    const rank = [...e.classList].find(x => x.startsWith("rank"))[4];
    return `${file}${rank}`;
  }
  clear() {
    this.squares.childNodes.forEach(x => x.textContent = "");
  }
  remove(file, rank) {
    this.squareToElement(file, rank).textContent = "";
  }
  add(file, rank, img) {
    img.classList.add(`file${file}`, `rank${rank}`);
    this.remove(file, rank);
    this.squareToElement(file, rank).appendChild(img);
  }
  load(fen) {
    super.load(fen);
    this.clear();
    this.pos.pieces.forEach((x, i) => 
    bitboardToIndicies(x).forEach(index => {
      const img = this.getImage(i);
      const file = indexToFile(index);
      const rank = indexToRank(index);
      this.add(file, rank, img)
    }));
  }
}
const gui = new BoardGUI("#board");

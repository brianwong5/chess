const boardGUI = document.querySelector("#board");
const pieceImages = ["wP","wN","wB","wR","wQ","wK","bP","bN","bB","bR","bQ","bK"]
  .map(x => {
    const img = document.createElement("img");
    img.src = `img/${x}.png`;
    img.classList.add("piece");
    return img;
  });
const board = fenToObj("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
const getImage = index => pieceImages[index].cloneNode();

const loadBoard = board => board.pieces.forEach((x, i) => {
  bitboardToIndicies(x).forEach(index => {
    const img = getImage(i);
    // img.classList.add(`file${indexToFile(index)}`, `rank${indexToRank(index)}`);
    squareToElement(indexToFile(index), indexToRank(index)).appendChild(img);
  });
});

const squareToElement = (file, rank) =>
  [...boardGUI.children].find(x =>
    x.classList.contains(`file${file}`) && x.classList.contains(`rank${rank}`));

const elementToSquare = element => {
  const file = [...element.classList].find(x => x.startsWith("file"))[4];
  const rank = [...element.classList].find(x => x.startsWith("rank"))[4];
  return `${file}${rank}`;
}

for (let col = 0; col < 8; ++col) {
  for (let row = 0; row < 8; ++row) {
    const square = document.createElement("div");
    square.addEventListener("click", event => {
      console.log(elementToSquare(event.target), squareToIndex(elementToSquare(event.target)));
    });
    const colour = col % 2 ? (row % 2 ? "light" : "dark") : (row % 2 ? "dark" : "light");
    square.classList.add("square", colour, `file${files[row]}`,`rank${ranks[7 - col]}`);
    boardGUI.appendChild(square);
  }
}

loadBoard(board);

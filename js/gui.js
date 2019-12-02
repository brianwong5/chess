const board = document.querySelector("#board");

const elementToSquare = element => {
  const file = [...element.classList].find(x => x.startsWith("file"))[4];
  const rank = [...element.classList].find(x => x.startsWith("rank"))[4];
  return `${file}${rank}`;
}

for (let col = 0; col < 8; ++col) {
  for (let row = 0; row < 8; ++row) {
    const square = document.createElement("div");
    square.addEventListener("click", event => {
      console.log(elementToSquare(event.target));
    });
    const colour = col % 2 ? (row % 2 ? "light" : "dark") : (row % 2 ? "dark" : "light");
    square.classList.add("square", colour, `file${files[row]}`,`rank${ranks[7 - col]}`);
    board.appendChild(square);
  }
}

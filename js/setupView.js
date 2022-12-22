"use strict";

class setupView {
  startScreen = document.querySelector(".start-screen");
  numPlayersInput = document.querySelector(".num-players-input");
  playerNameSection = document.querySelector(".player-name-section");
  #startBtn = document.querySelector(".start-game-btn");

  constructor() {
    this.#addHandlerNumPlayersInput();
  }

  renderPlayerInputList() {
    const num = this.numPlayersInput.value;
    this.playerNameSection.innerHTML = "";
    let markup = "";
    for (let i = 1; i <= num; i++) {
      markup += `
        <div class="player-name-container">
          <label for="player-${i}-name" class="player-name-label"
            >Player${i}:</label
          >
          <input
            class="start-screen-input player-name-input"
            type="text"
            name="player-${i}-name"
            value="Player${i}"
          />
        </div>
      `;
    }
    this.playerNameSection.insertAdjacentHTML("afterbegin", markup);
  }

  HANDLERS;
  #addHandlerNumPlayersInput() {
    this.numPlayersInput.addEventListener(
      "change",
      this.renderPlayerInputList.bind(this)
    );
  }

  addHandlerStartBtn(handler) {
    this.#startBtn.addEventListener("click", () => {
      const players = [];
      const playerInputs = document.querySelectorAll(".player-name-input");
      playerInputs.forEach((input) => players.push(input.value));

      handler(players);
    });
  }
}

export default new setupView();

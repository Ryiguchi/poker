"use strict";

class GameView {
  gameBoard = document.querySelector(".game-container");
  showCardsSection = document.querySelector(".show-cards-section");

  #potSection = document.querySelector(".pot-section");
  #nameMessageSection = document.querySelector(".messsage-section-player-name");
  #messageText = document.querySelector(".message_text");
  #showCards = document.querySelectorAll(".player-card");
  #showCardsName = document.querySelector(".show-cards-name");
  #overlay = document.querySelector(".show-cards-overlay");
  #actionBtns = document.querySelectorAll(".action-btn");
  #betBtn = document.querySelector(".bet-btn");
  #checkBtn = document.querySelector(".check-btn");
  #callBtn = document.querySelector(".call-btn");
  #raiseBtn = document.querySelector(".raise-btn");
  #foldBtn = document.querySelector(".fold-btn");
  #dealBtn = document.querySelector(".deal-btn");
  #actionBox = document.querySelector(".message-action-box");
  #potAmount = document.querySelector(".pot_amount span");
  #betSlider = document.querySelector(".slider");
  #sliderNum = document.querySelector(".slider-num");
  // #discardBtn = document.querySelector(".discard-btn");

  constructor() {
    this.#addHandlerSelectCard();
  }

  #setSlider(game, activePlayer) {
    const player = game.dealer.players[activePlayer];

    this.#betSlider.setAttribute(
      "min",
      `${
        game.state.gameState === "call"
          ? game.state.highBet - player.bet
          : game.state.minBet
      }`
    );
    this.#betSlider.setAttribute(
      "max",
      game.dealer.players[activePlayer].chips
    );
    this.#betSlider.setAttribute("step", game.state.minBet);
    this.#betSlider.setAttribute("value", game.state.highBet);
    this.#sliderNum.value = game.state.highBet;
    this.#betSlider.focus();
  }

  #setBetState() {
    [this.#betBtn, this.#checkBtn, this.#foldBtn].forEach(
      (btn) => (btn.style.opacity = 1)
    );
    this.#messageText.textContent = "What would you like to do?";
  }

  #setCallState() {
    [this.#raiseBtn, this.#callBtn, this.#foldBtn].forEach(
      (btn) => (btn.style.opacity = 1)
    );
  }

  #displayMessageBoxItems(game) {
    const player = game.dealer.players[game.state.turn];
    this.#nameMessageSection.textContent = `${player.name}'s turn ...`;

    this.#callBtn.textContent =
      game.state.gameState === "call"
        ? `Call $${game.state.highBet - player.bet}`
        : "Call";
  }

  #resetBtns() {
    this.#actionBtns.forEach((btn) => (btn.style.opacity = 0.4));
  }

  #setDiscardState() {
    this.#messageText.textContent = "Please choose cards to discard!";
  }

  #changeActivePlayer(turn) {
    const players = [...document.querySelectorAll(".player")];
    players.forEach((el) => el.classList.remove("active"));
    document.querySelector(`.player-${turn + 1}`).classList.add("active");
  }

  #getDiscardCards() {
    const cards = [];
    document.querySelectorAll(".show-cards-card").forEach((card) => {
      if (card.classList.contains("discard")) cards.push(card.dataset.index);
    });
    return cards;
  }

  #removeDiscardClass() {
    document.querySelectorAll(".show-cards-card").forEach((card) => {
      card.classList.remove("discard");
    });
  }

  #removeAllSiblingsBefore(el) {
    let previousSibling = el.previousElementSibling;
    while (previousSibling) {
      previousSibling.remove();
      previousSibling = el.previousElementSibling;
    }
  }

  // PUBLIC APIs
  renderGameBoard(players) {
    this.#removeAllSiblingsBefore(this.#potSection);
    let markup = "";
    players.forEach((player, i) => {
      markup += `
        <section class="player player-${i + 1} grid-area-${
        players.length === 2 && i === 1 ? 3 : i + 1
      }" data-name="${player.hyphName}">
          <div class="player-name">${player.hyphName}</div>
          <button class="player-show-btn">Show</button>
          <div class="player-chips ${player.hyphName}-chips">C: $<span>${
        player.chips
      }</span></div>
          <div class="player-bet ${player.hyphName}-bet">B: $<span>${
        player.bet
      }</div>
        </section>

               
      `;
    });
    this.gameBoard.insertAdjacentHTML("afterbegin", markup);
  }

  renderEndCards(players) {
    let markup = "";
    players.forEach((player, i) => {
      markup += `
        <section
      class="hidden game-end-section grid-area-${i + 1} "
      data-name="${player.hyphName}"
    >
      <div class="game-end-name">${player.name}</div>
      <div class="game-end-cards-container">
        <div class="game-end-card">
          ${player.cards[0].number}${player.cards[0].suit}
        </div>
        <div class="game-end-card">
          ${player.cards[1].number}${player.cards[1].suit}
        </div>
        <div class="game-end-card">
          ${player.cards[2].number}${player.cards[2].suit}
        </div>
        <div class="game-end-card">
          ${player.cards[3].number}${player.cards[3].suit}
        </div>
        <div class="game-end-card">
          ${player.cards[4].number}${player.cards[4].suit}
        </div>
      </div>
    </section>        
      `;
    });

    this.gameBoard.insertAdjacentHTML("afterbegin", markup);
    if (players.length === 2) {
      const grid2 = document.querySelector(".grid-area-2");
      grid2.style.gridArea = "g3";
      grid2.style.transform = "none";
    }
  }

  renderCards(player) {
    this.#showCards.forEach((card, i) => {
      card.textContent = `${player.cards[i].number}${player.cards[i].suit}`;
      card.setAttribute("data-index", player.cards[i].index);
    });
    this.#showCardsName.textContent = player.name;
  }

  setDealState() {
    this.#resetBtns();
    this.#dealBtn.style.opacity = 1;
  }

  setWinnerMessage(winner, pot, hand) {
    this.#nameMessageSection.textContent = `${winner} wins $${pot}, with a ${hand}`;
    this.#messageText.textContent = `Press 'Deal' to play again.`;
  }

  displayCards(state, activePlayers) {
    if (state === "end-fold") return;
    if (state === "end-call") {
      document
        .querySelectorAll(".player")
        .forEach((el) => el.classList.add("hidden"));
      document.querySelectorAll(".game-end-section").forEach((el) => {
        activePlayers.forEach((p) => {
          if (p.hyphName === el.dataset.name) el.classList.remove("hidden");
        });
      });
    }
  }

  hideCards() {
    document
      .querySelectorAll(".player")
      .forEach((el) => el.classList.remove("hidden"));
    document
      .querySelectorAll(".game-end-section")
      .forEach((el) => el.classList.add("hidden"));
  }

  adjustBtns(game) {
    const num = this.#sliderNum.value;
    const player = game.dealer.players[game.state.turn];
    this.#raiseBtn.textContent =
      game.state.gameState === "call"
        ? `Raise $${num - game.state.highBet}`
        : "Raise";
    this.#betBtn.textContent =
      game.state.gameState === "bet" ? `Bet $${num}` : "Bet";
  }

  displayBettingState(state, game) {
    this.updateBets(game.dealer.players, game.state.pot);
    this.#changeActivePlayer(game.state.turn);
    this.#displayMessageBoxItems(game);
    this.#resetBtns();
    this.#setSlider(game, game.state.turn);

    if (state === "discard") this.#setDiscardState();
    if (state === "bet") this.#setBetState();
    if (state === "call") this.#setCallState();
  }

  updateBets(players, pot) {
    players.forEach((player) => {
      document.querySelector(`.${player.hyphName}-chips span`).textContent =
        player.chips;
      document.querySelector(`.${player.hyphName}-bet span`).textContent =
        player.bet;
    });

    this.#potAmount.textContent = `$${pot}`;
  }

  discard(player) {
    this.renderCards(player);
    this.#removeDiscardClass();
  }

  // Handlers

  #addHandlerSelectCard() {
    this.showCardsSection.addEventListener("click", (e) => {
      e.preventDefault();
      const card = e.target.closest(".show-cards-card");
      if (!card) return;

      card.classList.toggle("discard");
    });
  }

  addHandlerShowCardsBtn(handler) {
    this.gameBoard.addEventListener("click", (e) => {
      e.preventDefault();
      const name = e.target.closest(".player")?.dataset.name;
      if (!name || !e.target.classList.contains("player-show-btn")) return;

      this.#overlay.classList.remove("hidden");
      handler(name);
    });
  }

  addHandlerHideShowCards(handler) {
    this.#overlay.addEventListener("click", (e) => {
      e.preventDefault();
      this.#overlay.classList.add("hidden");
      handler();
    });
  }

  addHandlerSlider(handler) {
    this.#betSlider.addEventListener("input", () => {
      this.#sliderNum.value = this.#betSlider.value;
      handler();
    });
  }

  addHandlerBetBtn(handler) {
    this.#actionBox.addEventListener("click", (e) => {
      e.preventDefault();
      if (!e.target.classList.contains("bet-btn")) return;
      const bet = this.#betSlider.value;
      handler(bet);
    });
  }

  addHandlerFoldBtn(handler) {
    this.#actionBox.addEventListener("click", (e) => {
      e.preventDefault();
      if (!e.target.classList.contains("fold-btn")) return;

      handler();
    });
  }

  addHandlerCheckBtn(handler) {
    this.#actionBox.addEventListener("click", (e) => {
      e.preventDefault();
      if (!e.target.classList.contains("check-btn")) return;

      handler();
    });
  }

  addHandlerRaiseBtn(handler) {
    this.#actionBox.addEventListener("click", (e) => {
      e.preventDefault();
      if (!e.target.classList.contains("raise-btn")) return;

      const raise = this.#betSlider.value;
      handler(raise);
    });
  }

  addHandlerCallBtn(handler) {
    this.#actionBox.addEventListener("click", (e) => {
      e.preventDefault();
      if (!e.target.classList.contains("call-btn")) return;

      handler();
    });
  }

  addHandlerDiscardBtn(handler) {
    this.showCardsSection.addEventListener("click", (e) => {
      e.preventDefault();
      if (!e.target.classList.contains("discard-btn")) return;
      const discardCards = this.#getDiscardCards();
      handler(discardCards);
    });
  }

  addHandlerDoneBtn(handler) {
    this.showCardsSection.addEventListener("click", (e) => {
      e.preventDefault();
      if (!e.target.classList.contains("done-btn")) return;

      handler();
    });
  }

  addHandlerDealBtn(handler) {
    this.#actionBox.addEventListener("click", (e) => {
      e.preventDefault();
      if (!e.target.classList.contains("deal-btn")) return;

      handler();
    });
  }
}

export default new GameView();

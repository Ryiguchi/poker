"use strict";
import gameView from "./gameView.js";
import Game from "./model.js";
import setupView from "./setupView.js";

let game;

const toggleScreens = function (screen) {
  screen === "start"
    ? setupView.startScreen.classList.remove("hidden")
    : setupView.startScreen.classList.add("hidden");
  screen === "game"
    ? gameView.gameBoard.classList.remove("hidden")
    : gameView.gameBoard.classList.add("hidden");
  screen === "show"
    ? gameView.showCardsSection.classList.remove("hidden")
    : gameView.showCardsSection.classList.add("hidden");
};

const getPlayer = function (name) {
  return game.dealer.players.find((player) => player.name === name);
};

const startNewHand = function () {
  game.startNewHand();
  gameView.renderGameBoard(game.dealer.players);
  gameView.displayBettingState("bet", game);
  toggleScreens("game");
  // gameView.updateBets(game.dealer.players, game.state.pot);
};

// CONTROL FUNCTIONS
const controlStartBtn = function (names) {
  // Create instance of Game
  game = new Game(names);
  startNewHand();
};

const controlShowCardsBtn = function (name) {
  const player = getPlayer(name);
  gameView.renderCards(player);
  toggleScreens("show");
};

const controlHideShowCards = function () {
  if (game.state.gameState === "discard") return;

  toggleScreens("game");
};

const controlBetBtn = function (bet) {
  if (game.state.gameState !== "bet") return;

  game.bet(bet);
  gameView.displayBettingState(game.state.gameState, game);
};

const controlWinner = function () {
  gameView.setWinnerMessage(
    game.state.winner.name,
    game.state.pot,
    game.state.winningHand
  );
  gameView.updateBets(game.dealer.players, game.state.pot);
  gameView.renderEndCards(game.dealer.players);
  gameView.displayCards(game.state.gameState, game.getActivePlayers());
  gameView.setDealState();
};

const controlFoldBtn = function () {
  game.fold();
  game.state.gameState === "end-fold"
    ? controlWinner()
    : gameView.displayBettingState(game.state.gameState, game);
};

const controlCheckBtn = function () {
  if (game.state.gameState !== "bet") return;
  game.check();
  game.state.gameState === "end-call"
    ? controlWinner()
    : gameView.displayBettingState(game.state.gameState, game);
  // if (game.state.gameState === "show") {
  //   game.calcWinningHand();
  // }
};

const controlRaiseBtn = function (raise) {
  if (game.state.gameState === "bet") return;
  // const player = game.dealer.players[game.state.turn];
  game.raise(raise);
  gameView.displayBettingState(game.state.gameState, game);
};

const controlCallBtn = function () {
  if (game.state.gameState !== "call") return;

  game.call();
  game.state.gameState === "end-call"
    ? controlWinner()
    : gameView.displayBettingState(game.state.gameState, game);
};

const controlDicsardBtn = function (discardCards) {
  game.discard(discardCards);
  gameView.discard(game.dealer.players[game.state.turn]);
};

const controlDoneBtn = function () {
  toggleScreens("game");
  game.discardDone();
  gameView.displayBettingState(game.state.gameState, game);
};

const controlSlider = function () {
  gameView.adjustBtns(game);
};

const controlDealBtn = function () {
  game.startNewHand();
  gameView.renderGameBoard(game.dealer.players);
  gameView.displayBettingState(game.state.gameState, game);
};

// GAME INITIALIZATION
const init = function () {
  toggleScreens("start");
  setupView.renderPlayerInputList();

  // HANDLERS
  setupView.addHandlerStartBtn(controlStartBtn);
  gameView.addHandlerShowCardsBtn(controlShowCardsBtn);
  gameView.addHandlerHideShowCards(controlHideShowCards);
  gameView.addHandlerBetBtn(controlBetBtn);
  gameView.addHandlerFoldBtn(controlFoldBtn);
  gameView.addHandlerCheckBtn(controlCheckBtn);
  gameView.addHandlerRaiseBtn(controlRaiseBtn);
  gameView.addHandlerCallBtn(controlCallBtn);
  gameView.addHandlerDiscardBtn(controlDicsardBtn);
  gameView.addHandlerDoneBtn(controlDoneBtn);
  gameView.addHandlerSlider(controlSlider);
  gameView.addHandlerDealBtn(controlDealBtn);
};

init();

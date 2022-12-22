import { STARTING_CHIPS } from "./config.js";

// const Hand = require("pokersolver").Hand;

var hand1 = Hand.solve(["Ad", "As", "Jc", "Th", "2d", "3c", "Kd"]);
var hand2 = Hand.solve(["Ad", "As", "Jc", "Th", "2d", "Qs", "Qd"]);
var winner = Hand.winners([hand1, hand2]); // hand2

class Card {
  constructor(suit, number, value, index) {
    this.suit = suit;
    this.number = number;
    this.value = value;
    this.index = index;
  }
}

class Deck {
  constructor() {
    this.cards = [];
  }

  createDeck() {
    const suits = ["♠️", "♦️", "♥️", "♣️"];
    // prettier-ignore
    const numbers = [ "2", "3", '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K',"A"];
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    let index = 0;

    for (let i = 0; i < suits.length; i++) {
      for (let j = 0; j < numbers.length; j++) {
        this.cards.push(new Card(suits[i], numbers[j], values[j], index));
        index++;
      }
    }
  }

  shuffleDeck() {
    const c = this.cards;
    for (let i = c.length - 1; i > 0; i--) {
      const num = Math.floor(Math.random() * (i + 1));
      const temp = c[i];
      c[i] = c[num];
      c[num] = temp;
    }
  }
}

class Player {
  constructor(name, chips) {
    this.name = name;
    this.hyphName = name.split(" ").join("-");
    this.cards = [];
    this.chips = chips;
    this.bet = 0;
    this.playing = true;
    this.evalHand = [];
  }
}

class Dealer {
  constructor() {
    this.players = [];
    this.deck = new Deck();
  }

  createPlayers(players) {
    players.forEach((p) => this.players.push(new Player(p, STARTING_CHIPS)));
    this.players[0].bigBlind = true;
  }

  dealCards() {
    this.deck.createDeck();
    this.deck.shuffleDeck();

    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < this.players.length; j++) {
        this.players[j].cards.push(this.deck.cards[i]);
        this.deck.cards.splice(i, 1);
      }
    }
    this.sortHands();
  }

  sortHands() {
    this.players.forEach((p) => p.cards.sort((a, b) => a.value - b.value));
  }
}

export default class Game {
  state = {
    gameState: "start",
    minBet: +STARTING_CHIPS * 0.01,
    pot: 0,
    turn: 0,
    highBet: 0,
    bigBlind: 0,
    round: 1,
    winner: "",
    winningHand: "",
    discardStart: 0,
  };

  constructor(names) {
    this.playersNames = [...names];
    this.players = [];
    this.dealer = new Dealer();
    this.#startNewGame();
  }

  #startNewGame() {
    this.dealer.createPlayers(this.playersNames);
  }

  #convertToEval() {
    this.getActivePlayers().forEach((player) => {
      player.cards.forEach((card) => {
        let suit;
        if (card.suit === "♣️") suit = "c";
        if (card.suit === "♥️") suit = "h";
        if (card.suit === "♦️") suit = "d";
        if (card.suit === "♠️") suit = "s";

        const newCard = `${card.number === "10" ? "T" : card.number}${suit}`;
        player.evalHand.push(newCard);
      });
    });
  }

  #anteUp() {
    console.log(this.#playerToTheRight());
    this.#logBet(this.state.minBet, this.dealer.players[this.state.bigBlind]);
    this.#logBet(this.state.minBet / 2, this.#playerToTheRight());
    this.state.turn = this.#playerToLeftIndex(this.state.bigBlind);
  }

  #playerToRightIndex(i) {
    return i - 1 >= 0 ? i - 1 : this.dealer.players.length - 1;
  }

  #playerToTheRight(i) {
    return this.dealer.players[this.#playerToRightIndex(this.state.bigBlind)];
  }

  #playerToLeftIndex(i) {
    return i + 1 <= this.dealer.players.length - 1 ? i + 1 : 0;
  }

  // #playerToTheLeft(i) {
  //   return (this.state.turn = this.#playerToLeftIndex(this.state.bigBlind));
  // }

  #changeGameState() {
    if (this.state.round === 1) this.state.gameState = "discard";
    if (this.state.round === 3) {
      this.state.gameState = "show";
      this.#calcWinningHand();
    }
  }

  #findWinnerIndex(winner) {
    const card = this.#convertWinningCard(winner[0].cards[0]);
    return this.dealer.players.indexOf(
      this.dealer.players.find((p) => p.evalHand.includes(card))
    );
  }

  #convertWinningCard(card) {
    return `${card.value}${card.suit}`;
  }

  #logBet(amount, player = this.#getCurrentPlayer()) {
    player.chips -= amount;
    player.bet += amount;
    this.state.pot += amount;
    if (amount > 5) this.state.highBet = player.bet;
  }

  #logRaise(amount, player = this.#getCurrentPlayer()) {
    const raiseAmt = amount - player.bet;
    player.chips -= amount;
    player.bet += raiseAmt;
    this.state.pot += amount;
    this.state.highBet = player.bet;
  }

  #clearPot() {
    this.state.pot = 0;
  }

  #clearBets() {
    this.dealer.players.forEach((p) => (p.bet = 0));
  }

  #removeLosers() {
    this.dealer.players.forEach((p, i) => {
      if (p.chips === 0) this.dealer.players.splice(i, 1);
    });
    if (this.dealer.players.length === 1) gameOver();
  }

  #changeBlinds() {
    this.state.bigBlind = this.#playerToLeftIndex(this.state.bigBlind);
  }

  #setTurn() {
    this.state.turn = this.#playerToLeftIndex(this.state.bigBlind);
  }

  // setPlayersToPlaying() {
  //   this.dealer.players.forEach((p) => (p.playing = true));
  // }

  #clearData() {
    this.#clearPot();
    this.#clearBets();
    this.state.highBet = 0;
    this.state.gameState = "bet";
    this.state.round = 1;
  }

  #clearCards() {
    this.dealer.players.forEach((p) => {
      p.evalHand = [];
      p.cards = [];
    });
    this.dealer.deck.cards = [];
  }

  #endHand(winner = "split", type) {
    winner.chips += this.state.pot;
    this.#clearBets();
    this.#removeLosers();
    this.#setTurn();
    this.state.gameState = `end-${type}`;
    this.state.winner = winner;
  }

  getActivePlayers() {
    return this.dealer.players.filter((p) => p.playing === true);
  }

  #checkForNextTurn() {
    let i = this.state.turn;
    let nextPlayer;
    for (let j = 0; j < this.dealer.players.length; j++) {
      const nextIndex = this.#playerToLeftIndex(i);
      const next = this.dealer.players[nextIndex];
      if (next.playing === true && next.bet < this.state.highBet) {
        nextPlayer = nextIndex;
        break;
      }
      i = nextIndex;
    }
    return nextPlayer;
  }

  // findIndexFromName(name) {
  //   return this.dealer.players.filter((p) => p.name === name);
  // }

  #endBetRound() {
    this.#clearBets();
    this.state.highBet = 0;
    this.#changeGameState();
    this.state.round++;
    this.state.turn = this.#getNextActivePlayer();
    this.state.discardStart = this.state.turn;
  }

  #getNextActivePlayer() {
    const player = this.dealer.players[this.state.turn];
    let i = this.dealer.players.indexOf(player);
    for (let j = 0; j < this.dealer.players.length; j++) {
      const nextIndex = this.#playerToLeftIndex(i);
      const next = this.dealer.players[nextIndex];
      if (next.playing === true) {
        return nextIndex;
      }
      i = nextIndex;
    }
  }

  #changeTurn(action) {
    if (this.state.gameState === "bet" && action === "bet")
      this.state.turn = this.#getNextActivePlayer();
    if (this.state.gameState === "call" && action === "raise")
      this.state.turn = this.#getNextActivePlayer();

    if (action === "fold") {
      if (this.getActivePlayers().length <= 1) {
        this.#endHand(...this.getActivePlayers(), "fold");
        return;
      }

      if (this.getActivePlayers().length > 1) {
        const nextTurn = this.#checkForNextTurn();
        nextTurn || nextTurn === 0
          ? (this.state.turn = nextTurn)
          : this.#endBetRound();
      }
    }
  }

  #removeCards(discardCards) {
    const player = this.#getCurrentPlayer();
    discardCards.forEach((card) => {
      const index = player.cards.findIndex((c) => c.index === +card);
      player.cards.splice(index, 1);
    });
  }

  #giveNewCards(num) {
    const player = this.#getCurrentPlayer();
    for (let i = 1; i <= num; i++) {
      player.cards.push(this.dealer.deck.cards[0]);
      this.dealer.deck.cards.shift();
    }
  }

  #getCurrentPlayer() {
    return this.dealer.players[this.state.turn];
  }

  #setPlayersToPlaying() {
    this.dealer.players.forEach((p) => (p.playing = true));
  }

  // PUBLIC APIs

  #calcWinningHand() {
    const solvedHands = [];
    this.#convertToEval();
    console.log(this.dealer.players);
    this.getActivePlayers().forEach((p) => {
      solvedHands.push(Hand.solve(p.evalHand));
    });
    console.log(solvedHands);
    const winner = Hand.winners(solvedHands);
    console.log(winner);
    this.state.winningHand = winner[0].name;
    const index = this.#findWinnerIndex(winner);
    this.state.winner = this.dealer.players[index];
    this.#endHand(this.state.winner, "call");
  }

  bet(amount) {
    const player = this.#getCurrentPlayer();
    const betAmt = amount - player.bet;
    this.#logBet(betAmt);
    this.#changeTurn("bet");
    this.state.gameState = "call";
  }

  fold() {
    const player = this.#getCurrentPlayer();
    player.bet = "FOLD";
    player.playing = false;
    this.#changeTurn("fold");
    console.log(this.state.turn);
  }

  check() {
    this.state.turn === this.state.bigBlind
      ? this.#endBetRound()
      : (this.state.turn = this.#playerToLeftIndex(this.state.turn));
  }

  raise(raise) {
    this.#logRaise(+raise);
    this.#changeTurn("raise");
  }

  call() {
    const callAmt = this.state.highBet - this.#getCurrentPlayer().bet;
    this.#logBet(callAmt);
    const nextTurn = this.#checkForNextTurn();
    nextTurn || nextTurn === 0
      ? (this.state.turn = nextTurn)
      : this.#endBetRound();
  }

  discard(discardCards) {
    const numCards = discardCards.length;
    if (numCards === 0) return;

    this.#removeCards(discardCards);
    this.#giveNewCards(numCards);
    this.dealer.sortHands();
  }

  discardDone() {
    this.state.turn = this.#getNextActivePlayer();
    if (this.state.turn === this.state.discardStart) {
      this.state.gameState = "bet";
      this.state.round++;
    }
  }

  startNewHand() {
    if (this.state.gameState !== "start") this.#changeBlinds();
    this.#clearData();
    this.#clearCards();
    this.#setPlayersToPlaying();
    this.dealer.dealCards();
    this.state.gameState = "bet";
    this.#anteUp();
  }
}

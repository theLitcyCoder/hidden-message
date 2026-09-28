import { db } from "./firebase.js";
import { ensureAnonymousUser } from "./auth.js";

import {
  doc,
  getDoc,
  collection,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const cards = document.getElementById("cards");
const gameTitle = document.getElementById("gameTitle");
const gameIntro = document.getElementById("gameIntro");
const status = document.getElementById("status");
const result = document.getElementById("result");

let chosen = false;
let currentUser = null;

const params = new URLSearchParams(window.location.search);
const gameId = params.get("game");

async function loadGame() {
  if (!gameId) {
    showError(
      "Game not found.",
      "This game link is missing a game ID."
    );
    return;
  }

  try {
    status.textContent = "Loading your game...";

    // Get the anonymous Firebase user.
    currentUser = await ensureAnonymousUser();

    // Load the game.
    const gameRef = doc(db, "games", gameId);
    const gameSnapshot = await getDoc(gameRef);

    if (!gameSnapshot.exists()) {
      showError(
        "Game not found.",
        "This game may have been deleted or the link is invalid."
      );
      return;
    }

    const game = gameSnapshot.data();

    if (!Array.isArray(game.cards) || game.cards.length === 0) {
      showError(
        "Game is empty.",
        "The creator did not add any cards."
      );
      return;
    }

    document.title =
      `${game.title || "Hidden Message"} · Hidden Message`;

    gameTitle.textContent =
      game.title || "Pick one paper.";

    gameIntro.textContent =
      game.intro ||
      "There is one hidden message waiting for you.";

    // Check whether THIS player has already selected a card.
    const resultRef = doc(
      db,
      "games",
      gameId,
      "results",
      currentUser.uid
    );

    const resultSnapshot = await getDoc(resultRef);

    if (resultSnapshot.exists()) {
      const previousResult = resultSnapshot.data();

      chosen = true;

      status.textContent =
        "You already made your choice.";

      renderCards(
        game.cards,
        previousResult.cardIndex
      );

      showPreviousChoice(
        previousResult.cardIndex,
        game.cards
      );

      return;
    }

    status.textContent = "Choose one card.";

    renderCards(game.cards);

  } catch (error) {
    console.error("Could not load game:", error);

    showError(
      "Something went wrong.",
      error.message
    );
  }
}

function renderCards(messages, previousChoice = null) {
  cards.innerHTML = "";

  messages.forEach((message, index) => {

    const wrap = document.createElement("div");
    wrap.className = "card-wrap";

    wrap.innerHTML = `
      <div class="card" data-index="${index}">

        <div class="face front">
          <div class="seal">${index + 1}</div>

          <div class="label">
            Card ${index + 1}
          </div>

          <div class="hint">
            ${previousChoice === null
              ? "tap to reveal"
              : index === previousChoice
                ? "your choice"
                : "not chosen"}
          </div>

          <button
            class="card-btn"
            aria-label="Choose Card ${index + 1}"
          ></button>
        </div>

        <div class="face back">
          <div class="tiny">
            Hidden message
          </div>

          <div class="message"></div>

          <div class="lock">
            This was your one choice.
          </div>
        </div>

      </div>
    `;

    wrap.querySelector(".message").textContent = message;

    const button = wrap.querySelector(".card-btn");

    // If the player already selected a card,
    // disable every card.
    if (previousChoice !== null) {
      button.disabled = true;

      if (index !== previousChoice) {
        wrap.classList.add("disabled-card");
      }
    } else {
      button.addEventListener("click", () => {
        chooseCard(index, wrap, messages);
      });
    }

    cards.appendChild(wrap);
  });

  // Re-open the card that the player previously selected.
  if (previousChoice !== null) {
    const selectedWrap =
      document.querySelector(
        `.card-wrap:nth-child(${previousChoice + 1})`
      );

    if (selectedWrap) {
      const selectedCard =
        selectedWrap.querySelector(".card");

      selectedCard.classList.add("flipped");
      selectedWrap.classList.add("selected");
    }
  }
}

async function chooseCard(index, wrap, messages) {

  // Extra protection.
  if (chosen) return;

  chosen = true;

  document.querySelectorAll(".card-btn").forEach(button => {
    button.disabled = true;
  });

  const card = wrap.querySelector(".card");

  card.classList.add("flipped");
  wrap.classList.add("selected");

  status.textContent =
    "Your choice is locked.";

  result.classList.remove("hidden");

  result.textContent =
    `Card ${index + 1} revealed.`;

  try {

    const user =
      currentUser || await ensureAnonymousUser();

    const resultRef = doc(
      db,
      "games",
      gameId,
      "results",
      user.uid
    );

    await setDoc(resultRef, {
      cardIndex: index,
      selectedAt: serverTimestamp()
    });

    console.log(
      "Selection saved for player:",
      user.uid
    );

  } catch (error) {

    console.error(
      "Could not save selection:",
      error
    );

    // Important:
    // If saving failed, allow the player to try again.
    chosen = false;

    document.querySelectorAll(".card-btn").forEach(button => {
      button.disabled = false;
    });

    status.textContent =
      "Something went wrong. Please try again.";

    result.classList.add("hidden");
  }
}

function showPreviousChoice(cardIndex, messages) {

  if (
    !Number.isInteger(cardIndex) ||
    !messages[cardIndex]
  ) {
    return;
  }

  result.classList.remove("hidden");

  result.textContent =
    `You previously chose Card ${cardIndex + 1}.`;

  status.textContent =
    "Your previous choice is locked.";
}

function showError(title, message) {

  gameTitle.textContent = title;

  gameIntro.textContent = message;

  cards.innerHTML = "";

  status.textContent = "";

  result.classList.add("hidden");
}

loadGame();
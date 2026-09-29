import { db } from "./firebase.js";
import { ensureAnonymousUser } from "./auth.js";

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
  DEFAULT_GAME
} from "./shared.js";


let cardCount = 3;


/* -----------------------------------
   ELEMENTS
----------------------------------- */

const gameTitle =
  document.getElementById("gameTitle");

const gameIntro =
  document.getElementById("gameIntro");

const messageEditor =
  document.getElementById("messageEditor");

const generateBtn =
  document.getElementById("generateBtn");

const previewBtn =
  document.getElementById("previewBtn");

const shareBox =
  document.getElementById("shareBox");

const shareUrl =
  document.getElementById("shareUrl");

const copyBtn =
  document.getElementById("copyBtn");

const gamesLoading =
  document.getElementById("gamesLoading");

const gamesError =
  document.getElementById("gamesError");

const savedGames =
  document.getElementById("savedGames");


let resultListeners = [];


/* -----------------------------------
   CARD COUNT BUTTONS
----------------------------------- */

document
  .querySelectorAll(".count-btn")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(".count-btn")
          .forEach(btn =>
            btn.classList.remove("active")
          );

        button.classList.add("active");

        cardCount =
          Number(button.dataset.count);

        renderMessageFields();

      }
    );

  });


/* -----------------------------------
   MESSAGE FIELDS
----------------------------------- */

function renderMessageFields(
  existingMessages = []
) {

  messageEditor.innerHTML = "";

  for (
    let i = 0;
    i < cardCount;
    i++
  ) {

    const field =
      document.createElement("div");

    field.className =
      "message-field";

    field.innerHTML = `

      <label>
        Card ${i + 1} — hidden message
      </label>

      <textarea
        class="message-input"
        data-index="${i}"
        maxlength="500"
        placeholder="Write the hidden message..."
      ></textarea>

    `;

    const textarea =
      field.querySelector("textarea");

    textarea.value =
      existingMessages[i] || "";

    messageEditor.appendChild(field);

  }

}


/* -----------------------------------
   READ FORM
----------------------------------- */

function readGameForm() {

  const messages =
    [
      ...document.querySelectorAll(
        ".message-input"
      )
    ]
    .map(input =>
      input.value.trim()
    );


  return {

    title:
      gameTitle.value.trim()
      || DEFAULT_GAME.title,

    intro:
      gameIntro.value.trim()
      || DEFAULT_GAME.intro,

    messages

  };

}


/* -----------------------------------
   GENERATE FIREBASE GAME
----------------------------------- */

generateBtn.addEventListener(
  "click",
  async () => {

    const game =
      readGameForm();


    const hasEmptyMessage =
      game.messages.some(
        message => !message
      );


    if (hasEmptyMessage) {

      alert(
        "Please write a message for every card."
      );

      return;

    }


    generateBtn.disabled = true;

    generateBtn.textContent =
      "Creating game...";


    try {

      const user =
        await ensureAnonymousUser();


      const gameData = {

        creatorId:
          user.uid,

        title:
          game.title,

        intro:
          game.intro,

        cards:
          game.messages,

        createdAt:
          serverTimestamp()

      };


      const gameRef =
        await addDoc(
          collection(db, "games"),
          gameData
        );


      const gameId =
        gameRef.id;


      const url =
        new URL(
          "play.html",
          window.location.href
        );


      url.searchParams.set(
        "game",
        gameId
      );


      shareUrl.value =
        url.toString();


      shareBox.classList.remove(
        "hidden"
      );


      /*
       * IMPORTANT:
       *
       * We are NOT saving the game
       * to localStorage anymore.
       *
       * Firebase is now the source
       * of truth.
       */


      /*
       * Reload the Firebase games list
       * immediately so the newly created
       * game appears without refreshing.
       */

      await loadCreatedGames();


      generateBtn.textContent =
        "Game link generated!";


    } catch (error) {

      console.error(
        "Could not create game:",
        error
      );


      alert(
        "Something went wrong creating your game. Check the browser console for details."
      );


      generateBtn.textContent =
        "Generate game link";

    } finally {

      generateBtn.disabled = false;

    }

  }
);


/* ============================================
   LOAD CREATOR'S FIREBASE GAMES
============================================ */

async function loadCreatedGames() {

  if (!savedGames) {
    return;
  }


  gamesLoading.classList.remove(
    "hidden"
  );

  gamesError.classList.add(
    "hidden"
  );

  savedGames.innerHTML = "";


  /*
   * Remove old result listeners
   * before rebuilding the list.
   */

  resultListeners.forEach(
    unsubscribe => unsubscribe()
  );

  resultListeners = [];


  try {

    const user =
      await ensureAnonymousUser();


    const gamesQuery =
      query(
        collection(db, "games"),
        where(
          "creatorId",
          "==",
          user.uid
        )
      );


    const snapshot =
      await getDocs(
        gamesQuery
      );


    gamesLoading.classList.add(
      "hidden"
    );


    if (snapshot.empty) {

      savedGames.innerHTML = `

        <div class="empty">

          You haven't created any games yet.

        </div>

      `;

      return;

    }


    const games = [];


    snapshot.forEach(
      docSnapshot => {

        games.push({

          id:
            docSnapshot.id,

          ...docSnapshot.data()

        });

      }
    );


    /*
     * Newest games first
     */

    games.sort(
      (a, b) => {

        const aTime =
          a.createdAt?.toMillis
            ? a.createdAt.toMillis()
            : 0;

        const bTime =
          b.createdAt?.toMillis
            ? b.createdAt.toMillis()
            : 0;

        return bTime - aTime;

      }
    );


    games.forEach(
      game => {

        createSavedGame(
          game
        );

      }
    );


  } catch (error) {

    console.error(
      "Could not load created games:",
      error
    );


    gamesLoading.classList.add(
      "hidden"
    );

    gamesError.classList.remove(
      "hidden"
    );


    gamesError.textContent =
      "Could not load your games: "
      + error.message;

  }

}


/* ============================================
   CREATE ONE GAME ON CREATOR PAGE
============================================ */

function createSavedGame(game) {

  const gameElement =
    document.createElement(
      "article"
    );

  gameElement.className =
    "saved-game";
  /* ------------------------------------------
     GAME HEADER
  ------------------------------------------ */

  const header =
    document.createElement(
      "div"
    );

  header.className =
    "saved-game-header";


  const info =
    document.createElement(
      "div"
    );


  const title =
    document.createElement(
      "h3"
    );

  title.className =
    "saved-game-title";

  title.textContent =
    game.title ||
    "Untitled Game";


  const date =
    document.createElement(
      "div"
    );

  date.className =
    "saved-game-date";

  date.textContent =
    formatTimestamp(
      game.createdAt
    );


  info.appendChild(title);
  info.appendChild(date);


  /* ------------------------------------------
     BUTTONS
  ------------------------------------------ */

  const actions =
    document.createElement(
      "div"
    );

  actions.className =
    "saved-game-actions";


  const playButton =
    document.createElement(
      "a"
    );

  playButton.className =
    "small-btn";

  playButton.href =
    `play.html?game=${encodeURIComponent(
      game.id
    )}`;

  playButton.textContent =
    "Play Game";


  const copyButton =
    document.createElement(
      "button"
    );

  copyButton.className =
    "small-btn";

  copyButton.type =
    "button";

  copyButton.textContent =
    "Copy Link";


  copyButton.addEventListener(
    "click",
    async () => {

      const url =
        new URL(
          "play.html",
          window.location.href
        );


      url.searchParams.set(
        "game",
        game.id
      );


      try {

        await navigator.clipboard.writeText(
          url.toString()
        );


        copyButton.textContent =
          "Copied!";


        setTimeout(
          () => {

            copyButton.textContent =
              "Copy Link";

          },
          1500
        );


      } catch (error) {

        console.error(
          "Could not copy link:",
          error
        );

      }

    }
  );


  actions.appendChild(
    playButton
  );

  actions.appendChild(
    copyButton
  );


  header.appendChild(
    info
  );

  header.appendChild(
    actions
  );


  /* ------------------------------------------
     RESULTS SECTION
  ------------------------------------------ */

  const resultsSection =
    document.createElement(
      "div"
    );

  resultsSection.className =
    "game-results";


 const resultsHeader = document.createElement("div");
resultsHeader.className = "results-header";

const resultsTitle = document.createElement("h4");
resultsTitle.textContent = "Player Results";

const resultsControls = document.createElement("div");
resultsControls.className = "results-controls";

const resultCount = document.createElement("span");
resultCount.className = "result-count";
resultCount.textContent = "0 selections";

const deleteGameButton = document.createElement("button");
deleteGameButton.type = "button";
deleteGameButton.className = "delete-game-btn";
deleteGameButton.textContent = "Delete Game";

resultsControls.appendChild(resultCount);
resultsControls.appendChild(deleteGameButton);

resultsHeader.appendChild(resultsTitle);
resultsHeader.appendChild(resultsControls);

deleteGameButton.addEventListener("click", async () => {
  const confirmed = confirm(
    `Delete "${game.title || "Untitled Game"}"?\n\n` +
    "This will permanently delete the game and ALL player results.\n\n" +
    "This cannot be undone."
  );

  if (!confirmed) return;

  deleteGameButton.disabled = true;
  deleteGameButton.textContent = "Deleting...";

  try {
    const user = await ensureAnonymousUser();

    // Get the game first to verify ownership.
    const gameRef = doc(db, "games", game.id);
    const gameSnapshot = await getDoc(gameRef);

    if (!gameSnapshot.exists()) {
      throw new Error("This game no longer exists.");
    }

    const gameData = gameSnapshot.data();

    if (gameData.creatorId !== user.uid) {
      throw new Error("You are not allowed to delete this game.");
    }

    // Get all player results.
    const resultsRef = collection(
      db,
      "games",
      game.id,
      "results"
    );

    const resultsSnapshot = await getDocs(resultsRef);

    // Delete every result.
    const deletePromises = [];

    resultsSnapshot.forEach(resultDoc => {
      deletePromises.push(deleteDoc(resultDoc.ref));
    });

    await Promise.all(deletePromises);

    // Delete the actual game.
    await deleteDoc(gameRef);

    console.log(`Game ${game.id} deleted successfully.`);

    // Remove the game from the page immediately.
    gameElement.remove();

    // If there are no games left, show the empty message.
    if (!savedGames.querySelector(".saved-game")) {
      savedGames.innerHTML = `
        <div class="empty">
          You haven't created any games yet.
        </div>
      `;
    }

  } catch (error) {
    console.error("Could not delete game:", error);

    alert(
      "Could not delete the game.\n\n" +
      error.message
    );

    deleteGameButton.disabled = false;
    deleteGameButton.textContent = "Delete Game";
  }
});

// clearResultsButton.addEventListener("click", async () => {
//   const confirmed = confirm(
//     "Are you sure you want to clear all player results for this game?\n\n" +
//     "This will permanently delete all player selections from the database."
//   );

//   if (!confirmed) return;

//   clearResultsButton.disabled = true;
//   clearResultsButton.textContent = "Clearing...";

//   try {
//     const user = await ensureAnonymousUser();

//     // Verify that this game belongs to the current creator.
//     const gameRef = doc(db, "games", game.id);
//     const gameSnapshot = await getDoc(gameRef);

//     if (!gameSnapshot.exists()) {
//       throw new Error("Game no longer exists.");
//     }

//     const gameData = gameSnapshot.data();

//     if (gameData.creatorId !== user.uid) {
//       throw new Error("You are not allowed to clear this game's results.");
//     }

//     const resultsRef = collection(
//       db,
//       "games",
//       game.id,
//       "results"
//     );

//     const resultsSnapshot = await getDocs(resultsRef);

//     if (resultsSnapshot.empty) {
//       clearResultsButton.textContent = "No Results";
//       setTimeout(() => {
//         clearResultsButton.textContent = "Clear Results";
//       }, 1500);
//       return;
//     }

//     // Delete every player result document.
//     const deletePromises = [];

//     resultsSnapshot.forEach(resultDoc => {
//       deletePromises.push(deleteDoc(resultDoc.ref));
//     });

//     await Promise.all(deletePromises);

//     console.log(
//       `Deleted ${resultsSnapshot.size} player results from game ${game.id}`
//     );

//     clearResultsButton.textContent = "Results Cleared!";

//     setTimeout(() => {
//       clearResultsButton.textContent = "Clear Results";
//     }, 1500);

//   } catch (error) {
//     console.error("Could not clear results:", error);

//     alert(
//       "Could not clear the results.\n\n" +
//       error.message
//     );

//     clearResultsButton.textContent = "Clear Results";

//   } finally {
//     clearResultsButton.disabled = false;
//   }
// });

  const resultsList =
    document.createElement(
      "div"
    );

  resultsList.className =
    "results-list";


  const waiting =
    document.createElement(
      "div"
    );

  waiting.className =
    "empty result-empty";

  waiting.textContent =
    "No one has selected a card yet.";


  resultsList.appendChild(
    waiting
  );


  resultsSection.appendChild(
    resultsHeader
  );

  resultsSection.appendChild(
    resultsList
  );


  gameElement.appendChild(
    header
  );

  gameElement.appendChild(
    resultsSection
  );


  savedGames.appendChild(
    gameElement
  );


  /* ------------------------------------------
     REAL-TIME PLAYER RESULTS
  ------------------------------------------ */

const resultsRef = collection(db, "games", game.id, "results");

const unsubscribe = onSnapshot(
  resultsRef,
  snapshot => {
    console.log("🔥 Results updated for game:", game.id);
    console.log("Number of players:", snapshot.size);

    renderPlayerResults(
      snapshot,
      resultsList,
      resultCount,
      game.cards || []
    );
  },
  error => {
    console.error("❌ Could not listen for results:", error);

    resultsList.innerHTML = "";

    const errorMessage = document.createElement("div");
    errorMessage.className = "empty";
    errorMessage.textContent =
      "Could not load player results: " + error.message;

    resultsList.appendChild(errorMessage);
  }
);

resultListeners.push(unsubscribe);

}


/* ============================================
   DISPLAY PLAYER RESULTS
============================================ */

function renderPlayerResults(
  snapshot,
  resultsList,
  resultCount,
  cards
) {

  resultsList.innerHTML = "";


  if (snapshot.empty) {

    resultCount.textContent =
      "0 selections";


    const empty =
      document.createElement(
        "div"
      );

    empty.className =
      "empty result-empty";

    empty.textContent =
      "No one has selected a card yet.";


    resultsList.appendChild(
      empty
    );

    return;

  }


  const results = [];


  snapshot.forEach(
    docSnapshot => {

      results.push({

        playerId:
          docSnapshot.id,

        ...docSnapshot.data()

      });

    }
  );


  /*
   * Newest selections first
   */

  results.sort(
    (a, b) => {

      const aTime =
        a.selectedAt?.toMillis
          ? a.selectedAt.toMillis()
          : 0;

      const bTime =
        b.selectedAt?.toMillis
          ? b.selectedAt.toMillis()
          : 0;

      return bTime - aTime;

    }
  );


  resultCount.textContent =
    `${results.length} ${
      results.length === 1
        ? "selection"
        : "selections"
    }`;


  results.forEach(
    result => {

      const row =
        document.createElement(
          "div"
        );

      row.className =
        "result-row";


      /* ----------------------------------------
         PLAYER ID
      ---------------------------------------- */

      const playerArea =
        document.createElement(
          "div"
        );

      playerArea.className =
        "result-player";


      const playerLabel =
        document.createElement(
          "div"
        );

      playerLabel.className =
        "result-label";

      playerLabel.textContent =
        "Anonymous Player";


      const playerId =
        document.createElement(
          "code"
        );

      playerId.textContent =
        result.playerId;


      playerArea.appendChild(
        playerLabel
      );

      playerArea.appendChild(
        playerId
      );


      /* ----------------------------------------
         CARD
      ---------------------------------------- */

      const cardArea =
        document.createElement(
          "div"
        );

      cardArea.className =
        "result-card";


      const cardLabel =
        document.createElement(
          "div"
        );

      cardLabel.className =
        "result-label";

      cardLabel.textContent =
        "Selected";


      const cardNumber =
        document.createElement(
          "strong"
        );


      const cardIndex =
        Number.isInteger(
          result.cardIndex
        )
          ? result.cardIndex
          : null;


      cardNumber.textContent =
        cardIndex !== null
          ? `Card ${cardIndex + 1}`
          : "Unknown";


      cardArea.appendChild(
        cardLabel
      );

      cardArea.appendChild(
        cardNumber
      );


      /* ----------------------------------------
         MESSAGE
      ---------------------------------------- */

      const messageArea =
        document.createElement(
          "div"
        );

      messageArea.className =
        "result-message";


      const messageLabel =
        document.createElement(
          "div"
        );

      messageLabel.className =
        "result-label";

      messageLabel.textContent =
        "Message";


      const messageText =
        document.createElement(
          "div"
        );


      if (
        cardIndex !== null &&
        cards[cardIndex] !== undefined
      ) {

        messageText.textContent =
          cards[cardIndex];

      } else {

        messageText.textContent =
          "Message unavailable";

      }


      messageArea.appendChild(
        messageLabel
      );

      messageArea.appendChild(
        messageText
      );


      /* ----------------------------------------
         TIME
      ---------------------------------------- */

      const timeArea =
        document.createElement(
          "div"
        );

      timeArea.className =
        "result-time";

      timeArea.textContent =
        formatTimestamp(
          result.selectedAt
        );


      /* ----------------------------------------
         ADD TO ROW
      ---------------------------------------- */

      row.appendChild(
        playerArea
      );

      row.appendChild(
        cardArea
      );

      row.appendChild(
        messageArea
      );

      row.appendChild(
        timeArea
      );


      resultsList.appendChild(
        row
      );

    }
  );

}


/* ============================================
   FORMAT TIMESTAMP
============================================ */

function formatTimestamp(timestamp) {

  if (!timestamp) {
    return "Just now";
  }


  try {

    const date =
      timestamp.toDate
        ? timestamp.toDate()
        : new Date(timestamp);


    return date.toLocaleString();

  } catch {

    return "Unknown time";

  }

}


/* ============================================
   PREVIEW
============================================ */

previewBtn.addEventListener(
  "click",
  () => {

    const game =
      readGameForm();


    const hasEmptyMessage =
      game.messages.some(
        message => !message
      );


    if (hasEmptyMessage) {

      alert(
        "Please write a message for every card."
      );

      return;

    }


    sessionStorage.setItem(
      "hiddenMessagePreview",
      JSON.stringify(game)
    );


    const url =
      new URL(
        "play.html",
        window.location.href
      );


    url.searchParams.set(
      "preview",
      "true"
    );


    window.open(
      url.toString(),
      "_blank"
    );

  }
);


/* ============================================
   COPY GENERATED LINK
============================================ */

copyBtn.addEventListener(
  "click",
  async () => {

    if (!shareUrl.value) {
      return;
    }


    try {

      await navigator.clipboard.writeText(
        shareUrl.value
      );


      copyBtn.textContent =
        "Copied!";


      setTimeout(
        () => {

          copyBtn.textContent =
            "Copy link";

        },
        1500
      );


    } catch {

      shareUrl.select();

      document.execCommand(
        "copy"
      );

    }

  }
);


/* ============================================
   INITIALIZE
============================================ */

renderMessageFields(
  DEFAULT_GAME.messages
);


loadCreatedGames();
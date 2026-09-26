let cardCount = 5;


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

const savedGames =
  document.getElementById("savedGames");

const clearGamesBtn =
  document.getElementById("clearGamesBtn");


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
          Number(
            button.dataset.count
          );

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

    messageEditor.appendChild(
      field
    );

  }

}


/* -----------------------------------
   READ CREATOR FORM
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
      || "Pick one paper.",

    intro:
      gameIntro.value.trim()
      || DEFAULT_GAME.intro,

    messages

  };

}


/* -----------------------------------
   GENERATE
----------------------------------- */

generateBtn.addEventListener(
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


    const url =
      createPlayerUrl(game);


    shareUrl.value =
      url;


    shareBox.classList.remove(
      "hidden"
    );


    saveGame(game);


    renderSavedGames();


    generateBtn.textContent =
      "Game link generated!";


    setTimeout(() => {

      generateBtn.textContent =
        "Generate game link";

    }, 2000);

  }
);


/* -----------------------------------
   PREVIEW
----------------------------------- */

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


    const url =
      createPlayerUrl(game);


    window.open(
      url,
      "_blank"
    );

  }
);


/* -----------------------------------
   COPY LINK
----------------------------------- */

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

      setTimeout(() => {

        copyBtn.textContent =
          "Copy link";

      }, 1500);

    } catch {

      shareUrl.select();

      document.execCommand(
        "copy"
      );

    }

  }
);


/* -----------------------------------
   SAVED GAMES
----------------------------------- */

function renderSavedGames() {

  const games =
    getSavedGames();


  savedGames.innerHTML = "";


  if (!games.length) {

    savedGames.innerHTML = `

      <div class="empty">
        You haven't created any games yet.
      </div>

    `;

    return;

  }


  games.forEach(saved => {

    const item =
      document.createElement("div");

    item.className =
      "saved-game";


    const date =
      new Date(
        saved.createdAt
      );


    item.innerHTML = `

      <div>

        <div class="saved-game-title">
          ${escapeHtml(
            saved.game.title
          )}
        </div>

        <div class="saved-game-date">
          ${date.toLocaleString()}
        </div>

      </div>


      <div class="saved-game-actions">

        <button
          class="small-btn play-saved"
          data-id="${saved.id}"
        >
          Play
        </button>

        <button
          class="small-btn delete-saved"
          data-id="${saved.id}"
        >
          Delete
        </button>

      </div>

    `;


    savedGames.appendChild(
      item
    );

  });


  document
    .querySelectorAll(".play-saved")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const saved =
            getSavedGames()
              .find(
                game =>
                  game.id ===
                  button.dataset.id
              );


          if (!saved) return;


          const url =
            createPlayerUrl(
              saved.game
            );


          window.open(
            url,
            "_blank"
          );

        }
      );

    });


  document
    .querySelectorAll(".delete-saved")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          deleteGame(
            button.dataset.id
          );

          renderSavedGames();

        }
      );

    });

}


/* -----------------------------------
   CLEAR ALL
----------------------------------- */

clearGamesBtn.addEventListener(
  "click",
  () => {

    const confirmed =
      confirm(
        "Delete all saved games from this browser?"
      );


    if (!confirmed) {
      return;
    }


    clearSavedGames();

    renderSavedGames();

  }
);


/* -----------------------------------
   SECURITY HELPER
----------------------------------- */

function escapeHtml(value) {

  return String(value)

    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll("'", "&#039;");

}


/* -----------------------------------
   INITIALIZE
----------------------------------- */

renderMessageFields(
  DEFAULT_GAME.messages
);

renderSavedGames();
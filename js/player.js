const game =
  getGameFromUrl();


const cards =
  document.getElementById("cards");

const gameTitle =
  document.getElementById("gameTitle");

const gameIntro =
  document.getElementById("gameIntro");

const status =
  document.getElementById("status");

const result =
  document.getElementById("result");


let chosen =
  false;


/* -----------------------------------
   INVALID GAME
----------------------------------- */

if (!game || !Array.isArray(game.messages)) {

  gameTitle.textContent =
    "Game not found.";

  gameIntro.textContent =
    "This game link is missing or invalid.";

  status.textContent =
    "Ask the creator for a new link.";

}


/* -----------------------------------
   LOAD GAME
----------------------------------- */

else {

  document.title =
    `${game.title} · Hidden Message`;


  gameTitle.textContent =
    game.title;


  gameIntro.textContent =
    game.intro;


  renderCards();

}


/* -----------------------------------
   RENDER CARDS
----------------------------------- */

function renderCards() {

  cards.innerHTML = "";


  game.messages.forEach(
    (message, index) => {

      const wrap =
        document.createElement("div");


      wrap.className =
        "card-wrap";


      wrap.innerHTML = `

        <div
          class="card"
          data-index="${index}"
        >

          <div class="face front">

            <div class="seal">
              ${index + 1}
            </div>

            <div class="label">
              Card ${index + 1}
            </div>

            <div class="hint">
              tap to reveal
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


      wrap
        .querySelector(".message")
        .textContent =
          message;


      wrap
        .querySelector(".card-btn")
        .addEventListener(
          "click",
          () =>
            chooseCard(
              index,
              wrap
            )
        );


      cards.appendChild(
        wrap
      );

    }
  );

}


/* -----------------------------------
   CHOOSE CARD
----------------------------------- */

function chooseCard(
  index,
  wrap
) {

  if (chosen) {
    return;
  }


  chosen = true;


  const card =
    wrap.querySelector(
      ".card"
    );


  card.classList.add(
    "flipped"
  );


  wrap.classList.add(
    "selected"
  );


  document
    .querySelectorAll(
      ".card-btn"
    )
    .forEach(button => {

      button.disabled =
        true;

    });


  status.textContent =
    "Your choice is locked.";


  result.classList.remove(
    "hidden"
  );


  result.textContent =
    `Card ${index + 1} revealed.`;

}
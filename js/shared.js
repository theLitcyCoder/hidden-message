export const DEFAULT_GAME = {

  title: "Pick one paper.",

  intro:
    "There is one hidden message waiting for you. Tap a paper to reveal it.",

  messages: [

    "You were meant to find this one. 💌",

    "A little reminder: you are more special than you realize.",

    "Plot twist… this was the message I wanted you to see.",

    "Keep this one to yourself. It's your little secret. 🤫",

    "You found it. Now smile. That's the whole message. ✨"

  ]

};


/* -----------------------------------
   ID
----------------------------------- */

export function makeId() {

  return Math.random()
    .toString(36)
    .substring(2, 10);

}


/* -----------------------------------
   LOCAL STORAGE
----------------------------------- */

const STORAGE_KEY = "hiddenMessageGames";


export function getSavedGames() {

  try {

    return JSON.parse(
      localStorage.getItem(STORAGE_KEY)
    ) || [];

  } catch {

    return [];

  }

}


export function saveGame(game) {

  const games = getSavedGames();

  games.unshift({

    id: makeId(),

    createdAt:
      new Date().toISOString(),

    game

  });

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(games)
  );

}


export function deleteGame(id) {

  const games =
    getSavedGames()
      .filter(game => game.id !== id);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(games)
  );

}


export function clearSavedGames() {

  localStorage.removeItem(
    STORAGE_KEY
  );

}


/* -----------------------------------
   SECURITY HELPER
----------------------------------- */

export function escapeHtml(value) {

  return String(value)

    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll("'", "&#039;");

}




// const DEFAULT_GAME = {

//   title: "Pick one paper.",

//   intro:
//     "There is one hidden message waiting for you. Tap a paper to reveal it.",

//   messages: [

//     "You were meant to find this one. 💌",

//     "A little reminder: you are more special than you realize.",

//     "Plot twist… this was the message I wanted you to see.",

//     "Keep this one to yourself. It's your little secret. 🤫",

//     "You found it. Now smile. That's the whole message. ✨"

//   ]

// };


// /* -----------------------------------
//    ID
// ----------------------------------- */

// function makeId() {

//   return (
//     Math.random()
//       .toString(36)
//       .substring(2, 10)
//   );

// }


// /* -----------------------------------
//    UTF-8 SAFE BASE64
// ----------------------------------- */

// function encodeGame(game) {

//   const json =
//     JSON.stringify(game);

//   const bytes =
//     new TextEncoder().encode(json);

//   let binary = "";

//   bytes.forEach(byte => {

//     binary += String.fromCharCode(byte);

//   });

//   return btoa(binary);

// }


// function decodeGame(encoded) {

//   try {

//     const binary =
//       atob(encoded);

//     const bytes =
//       Uint8Array.from(
//         binary,
//         char => char.charCodeAt(0)
//       );

//     const json =
//       new TextDecoder().decode(bytes);

//     return JSON.parse(json);

//   } catch (error) {

//     console.error(
//       "Could not decode game:",
//       error
//     );

//     return null;

//   }

// }


// /* -----------------------------------
//    CREATE PLAYER URL
// ----------------------------------- */

// function createPlayerUrl(game) {

//   const url =
//     new URL(
//       "play.html",
//       window.location.href
//     );

//   url.searchParams.set(
//     "g",
//     encodeGame(game)
//   );

//   url.searchParams.set(
//     "id",
//     makeId()
//   );

//   return url.toString();

// }


// /* -----------------------------------
//    READ GAME FROM URL
// ----------------------------------- */

// function getGameFromUrl() {

//   const params =
//     new URLSearchParams(
//       window.location.search
//     );

//   const encoded =
//     params.get("g");

//   if (!encoded) {

//     return null;

//   }

//   return decodeGame(encoded);

// }


// /* -----------------------------------
//    LOCAL STORAGE
// ----------------------------------- */

// const STORAGE_KEY =
//   "hiddenMessageGames";


// function getSavedGames() {

//   try {

//     return JSON.parse(
//       localStorage.getItem(STORAGE_KEY)
//     ) || [];

//   } catch {

//     return [];

//   }

// }


// function saveGame(game) {

//   const games =
//     getSavedGames();

//   games.unshift({

//     id: makeId(),

//     createdAt:
//       new Date().toISOString(),

//     game

//   });

//   localStorage.setItem(
//     STORAGE_KEY,
//     JSON.stringify(games)
//   );

// }


// function deleteGame(id) {

//   const games =
//     getSavedGames()
//       .filter(game => game.id !== id);

//   localStorage.setItem(
//     STORAGE_KEY,
//     JSON.stringify(games)
//   );

// }


// function clearSavedGames() {

//   localStorage.removeItem(
//     STORAGE_KEY
//   );

// }



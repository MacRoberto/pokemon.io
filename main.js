function toggleMenu() {
  document.getElementById("mainMenu").classList.toggle("hidden");
}

function toggleSubmenu() {
  document.getElementById("appearanceOptions").classList.toggle("hidden");
}

const menuBtn = document.getElementById('menuBtn');
const menu = document.getElementById('menu');
const menuText = document.querySelectorAll('.menuText');

menuBtn.addEventListener('click', () => {
    menu.classList.toggle('open');
    menuText.forEach(function(text, index,) {
        setTimeout(() => {
            text.classList.toggle('open2');
        }, index * 50);
    })
});

const dayNight = document.querySelector('#themeChangeBtn');
dayNight.addEventListener('click', () => {
  document.body.classList.toggle('tema-rojo');
  document.body.classList.toggle('tema-blanco');
  if(document.body.classList.contains('tema-rojo')){
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
  updateIcon();
});

function themeMode() {
  if(localStorage.getItem('theme') !== null){
    if(localStorage.getItem('theme') === 'light'){
      document.body.classList.remove('tema-rojo');
      document.body.classList.add('tema-blanco');
    } else {
      document.body.classList.remove('tema-blanco');
      document.body.classList.add('tema-rojo');
    }
  }
  updateIcon();
}
themeMode();

function updateIcon() {
  if(document.body.classList.contains('tema-rojo')){
    dayNight.querySelector('i').classList.remove('fa-moon');
    dayNight.querySelector('i').classList.add('fa-sun');
  } else {
    dayNight.querySelector('i').classList.remove('fa-sun');
    dayNight.querySelector('i').classList.add('fa-moon');
  }
}

const paramsString = window.location.search;
const urlParams = new URLSearchParams(paramsString);

fetch("https://pokeapi.co/api/v2/pokemon/?limit=30")
  .then((response) => response.json())
  .then((json) => {
    const pokemon_container = document.querySelector(".container-cards");

    const typeClassMap = {
      grass: "type-grass",
      fire: "type-fire",
      water: "type-water",
      poison: "type-poison",
      electric: "type-electric",
      bug: "type-bug",
      normal: "type-normal",
      flying: "type-flying",
      ground: "type-ground",
      fairy: "type-fairy",
      fighting: "type-fighting",
      psychic: "type-psychic",
      rock: "type-rock",
      steel: "type-steel",
      ice: "type-ice",
      ghost: "type-ghost",
      dragon: "type-dragon",
      dark: "type-dark",
    };

    const promises = json.results.slice(0, 9).map((pokemon) => {
      const id = pokemon.url.split("/").filter(Boolean).pop();
      const idReal = `#${id.toString().padStart(3, `0`)}`;
      const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

      return Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}/`).then((res) =>
          res.json()
        ),
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`).then((res) =>
          res.json()
        ),
      ]).then(([speciesData, pokemonData]) => {
        const elemental = pokemonData.types.map((t) => t.type.name);
        const entry = speciesData.flavor_text_entries.find(
          (entry) => entry.language.name === "en"
        );
        const descripcion = entry
          ? entry.flavor_text.replace(/\f/g, " ")
          : "No description available.";
        const elementalHTML = elemental
          .map((elemental) => `<h2>${elemental.toUpperCase()}</h2>`)
          .join("");

        return `
                <div class="card">
                <div class="card-info">
                      <div class="card-header-row">
                            <div class="card-h2-row">
                            ${elementalHTML}
                        </div>
                            <h3>${idReal}</h3>
                    </div>
                    <h1><a href="pokemon.html?id=${id}">${pokemon.name}</a></h1>
                    <p>${descripcion}</p>
                    <button class="button"><a href="pokemon.html?id=${id}">Know More</a></button>
                </div>
                <img src="${sprite}" alt="${pokemon.name}">
                </div>
                `;
      });
    });

    Promise.all(promises).then((cards) => {
      pokemon_container.innerHTML = cards.join("");

      document.querySelectorAll(`.card`).forEach((card) => {
        const typeElements = card.querySelectorAll(`.card-h2-row h2`);
        typeElements.forEach((typeElement) => {
          const type = typeElement.textContent.trim().toLowerCase();
          const typeClass = typeClassMap[type];
          if (typeClass) {
            typeElement.classList.add(typeClass);
          }
        });
      });
    });
  });

const CARDS_PER_PAGE = 9;
const TOTAL_POKEMON = 1025;
const totalPages = Math.ceil(TOTAL_POKEMON / CARDS_PER_PAGE);
let currentPage = 1;

renderPage(currentPage);
buildPaginator(currentPage);

async function renderPage(page) {
  currentPage = page;

  const offset = (page - 1) * CARDS_PER_PAGE;
  const remaining = TOTAL_POKEMON - offset;
  const limit = Math.min(CARDS_PER_PAGE, remaining);

  const pageData = await fetch(
    `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`
  ).then((r) => r.json());

  const cards = await Promise.all(
    pageData.results.map(async (pkm) => {
      const id = pkm.url.split("/").filter(Boolean).pop();
      const idFmt = `#${id.toString().padStart(3, "0")}`;
      const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

      const [species, data] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then((r) =>
          r.json()
        ),
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((r) => r.json()),
      ]);

      const entry = species.flavor_text_entries.find(
        (e) => e.language.name === "en"
      );
      const desc = entry
        ? entry.flavor_text.replace(/\f/g, " ")
        : "No description";
      const types = data.types.map((t) => t.type.name);

      return `
        <div class="card">
          <div class="card-info">
            <div class="card-header-row">
              <div class="card-h2-row">
                ${types.map((t) => `<h2>${t.toUpperCase()}</h2>`).join("")}
              </div>
              <h3>${idFmt}</h3>
            </div>
            <h1><a href="pokemon.html?id=${id}">${pkm.name}</a></h1>
            <p>${desc}</p>
            <button class="button"><a href="pokemon.html?id=${id}">Know More</a></button>
          </div>
          <img src="${sprite}" alt="${pkm.name}">
        </div>`;
    })
  );

  document.querySelector(".container-cards").innerHTML = cards.join("");

  const typeClassMap = {
    grass: "type-grass",
    fire: "type-fire",
    water: "type-water",
    poison: "type-poison",
    electric: "type-electric",
    bug: "type-bug",
    normal: "type-normal",
    flying: "type-flying",
    ground: "type-ground",
    fairy: "type-fairy",
    fighting: "type-fighting",
    psychic: "type-psychic",
    rock: "type-rock",
    steel: "type-steel",
    ice: "type-ice",
    ghost: "type-ghost",
    dragon: "type-dragon",
    dark: "type-dark",
  };
  document.querySelectorAll(".card-h2-row h2").forEach((h2) => {
    const cls = typeClassMap[h2.textContent.toLowerCase()];
    if (cls) h2.classList.add(cls);
  });
}

function buildPaginator(page) {
  const container = document.getElementById("pagination");
  container.innerHTML = "";

  const groupStart = Math.floor((page - 1) / 10) * 10 + 1;
  const groupEnd = Math.min(groupStart + 9, totalPages);

  if (groupStart > 1)
    container.appendChild(makeButton("◄", () => goToPage(groupStart - 1)));

  for (let p = groupStart; p <= groupEnd; p++)
    container.appendChild(makeButton(p, () => goToPage(p), p === page));

  if (groupEnd < totalPages)
    container.appendChild(makeButton("►", () => goToPage(groupEnd + 1)));

  const input = document.createElement("input");
  input.type = "number";
  input.min = 1;
  input.max = totalPages;
  input.placeholder = "Ir a…";
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const n = +input.value;
      if (n >= 1 && n <= totalPages) goToPage(n);
    }
  });
  container.appendChild(input);
}

function makeButton(label, cb, active = false) {
  const b = document.createElement("button");
  b.textContent = label;
  if (active) b.classList.add("active");
  b.onclick = cb;
  return b;
}
function goToPage(p) {
  renderPage(p);
  buildPaginator(p);
}

fetch("https://pokeapi.co/api/v2/pokemon-species?limit=0")
  .then((r) => r.json())
  .then((data) => {
    document.getElementById("pokemon-count").textContent = data.count;
  })
  .catch(() => {
    document.getElementById("pokemon-count").textContent = "No disponible";
  });

document.getElementById("searchBtn").addEventListener("click", handleSearch);
document.getElementById("searchInput").addEventListener("keypress", function (e) {
  if (e.key === "Enter") handleSearch();
});

const typeClassMap = {
  grass: "type-grass",
  fire: "type-fire",
  water: "type-water",
  poison: "type-poison",
  electric: "type-electric",
  bug: "type-bug",
  normal: "type-normal",
  flying: "type-flying",
  ground: "type-ground",
  fairy: "type-fairy",
  fighting: "type-fighting",
  psychic: "type-psychic",
  rock: "type-rock",
  steel: "type-steel",
  ice: "type-ice",
  ghost: "type-ghost",
  dragon: "type-dragon",
  dark: "type-dark",
};

function handleSearch() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  if (!query) return;

  const container = document.querySelector(".container-cards");
  container.innerHTML = "<p>Searching...</p>";

  fetch(`https://pokeapi.co/api/v2/pokemon/${query}`)
    .then((res) => {
      if (!res.ok) throw new Error("Not a Pokémon");
      return res.json();
    })
    .then(async (pokemonData) => {
      const speciesData = await fetch(pokemonData.species.url).then((res) => res.json());
      const entry = speciesData.flavor_text_entries.find(
        (e) => e.language.name === "en"
      );
      const descripcion = entry
        ? entry.flavor_text.replace(/\f/g, " ")
        : "No description available.";
      const id = pokemonData.id;
      const idReal = `#${id.toString().padStart(3, "0")}`;
      const sprite = pokemonData.sprites.other["official-artwork"].front_default;
      const types = pokemonData.types.map((t) => t.type.name);
      const cardHTML = `
        <div class="card">
          <div class="card-info">
            <div class="card-header-row">
              <div class="card-h2-row">
                ${types.map((t) => `<h2>${t.toUpperCase()}</h2>`).join("")}
              </div>
              <h3>${idReal}</h3>
            </div>
            <h1><a href="pokemon.html?id=${id}">${pokemonData.name}</a></h1>
            <p>${descripcion}</p>
            <button class="button"><a href="pokemon.html?id=${id}">Know More</a></button>
          </div>
          <img src="${sprite}" alt="${pokemonData.name}">
        </div>
      `;
      container.innerHTML = cardHTML;
      document.querySelectorAll(".card-h2-row h2").forEach((h2) => {
        const cls = typeClassMap[h2.textContent.toLowerCase()];
        if (cls) h2.classList.add(cls);
      });
    })
    .catch(() => {
      fetch(`https://pokeapi.co/api/v2/type/${query}`)
        .then((res) => {
          if (!res.ok) throw new Error("Not a type either");
          return res.json();
        })
        .then(async (typeData) => {
          const container = document.querySelector(".container-cards");
          const pokemons = typeData.pokemon.slice(0, 9); 
          const cards = await Promise.all(
            pokemons.map(async (entry) => {
              const pkmData = await fetch(entry.pokemon.url).then((r) => r.json());
              const speciesData = await fetch(pkmData.species.url).then((r) => r.json());
              const id = pkmData.id;
              const idFmt = `#${id.toString().padStart(3, "0")}`;
              const sprite = pkmData.sprites.other["official-artwork"].front_default;
              const types = pkmData.types.map((t) => t.type.name);
              const descEntry = speciesData.flavor_text_entries.find(
                (e) => e.language.name === "en"
              );
              const desc = descEntry
                ? descEntry.flavor_text.replace(/\f/g, " ")
                : "No description.";
              return `
                <div class="card">
                  <div class="card-info">
                    <div class="card-header-row">
                      <div class="card-h2-row">
                        ${types.map((t) => `<h2>${t.toUpperCase()}</h2>`).join("")}
                      </div>
                      <h3>${idFmt}</h3>
                    </div>
                    <h1><a href="pokemon.html?id=${id}">${pkmData.name}</a></h1>
                    <p>${desc}</p>
                    <button class="button"><a href="pokemon.html?id=${id}">Know More</a></button>
                  </div>
                  <img src="${sprite}" alt="${pkmData.name}">
                </div>
              `;
            })
          );
          container.innerHTML = cards.join("");
          document.querySelectorAll(".card-h2-row h2").forEach((h2) => {
            const cls = typeClassMap[h2.textContent.toLowerCase()];
            if (cls) h2.classList.add(cls);
          });
        })
        .catch(() => {
          container.innerHTML = `<p>The search has not obtained any results..</p>`;
        });
    });
}

let allPokemonNames = [];
const pokemonTypes = [
  "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison",
  "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon",
  "dark", "steel", "fairy"
];

fetch("https://pokeapi.co/api/v2/pokemon?limit=1025")
  .then(res => res.json())
  .then(data => {
    allPokemonNames = data.results.map(p => p.name);
  });

const searchInput = document.getElementById("searchInput");
const autocompleteList = document.getElementById("autocomplete-results");

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase().trim();

  if (query.length < 3) {
    autocompleteList.innerHTML = "";
    return;
  }
  const nameMatches = allPokemonNames.filter(name => name.startsWith(query));
  const typeMatches = pokemonTypes.filter(type => type.startsWith(query));
  const allMatches = [...typeMatches, ...nameMatches].slice(0, 10);
  if (allMatches.length === 0) {
    autocompleteList.innerHTML = `<li>No matches found</li>`;
    return;
  }
  autocompleteList.innerHTML = allMatches
    .map(item => `<li>${item}</li>`)
    .join("");
  document.querySelectorAll("#autocomplete-results li").forEach(item => {
    item.addEventListener("click", () => {
      searchInput.value = item.textContent;
      autocompleteList.innerHTML = "";
      handleSearch(); 
    });
  });
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".search_bar")) {
    autocompleteList.innerHTML = "";
  }
});

let currentTypeSearch = null;
let currentTypeResults = [];

function toggleMenu() {
  document.getElementById("mainMenu").classList.toggle("hidden");
}

function toggleSubmenu() {
  document.getElementById("appearanceOptions").classList.toggle("hidden");
}

function handleSearch() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  if (!query) return;

  const container = document.querySelector(".container-cards");
  container.innerHTML = "<p>Searching...</p>";

  fetch(`https://pokeapi.co/api/v2/pokemon/${query}`)
    .then((res) => {
      if (!res.ok) throw new Error("Not a Pokémon");
      return res.json();
    })
    .then(async (pokemonData) => {
      currentTypeSearch = null;
      const speciesData = await fetch(pokemonData.species.url).then((res) => res.json());
      const entry = speciesData.flavor_text_entries.find(
        (e) => e.language.name === "en"
      );
      const descripcion = entry
        ? entry.flavor_text.replace(/\f/g, " ")
        : "No description available.";
      const id = pokemonData.id;
      const idReal = `#${id.toString().padStart(3, "0")}`;
      const sprite = pokemonData.sprites.other["official-artwork"].front_default;
      const types = pokemonData.types.map((t) => t.type.name);
      const cardHTML = `
        <div class="card">
          <div class="card-info">
            <div class="card-header-row">
              <div class="card-h2-row">
                ${types.map((t) => `<h2>${t.toUpperCase()}</h2>`).join("")}
              </div>
              <h3>${idReal}</h3>
            </div>
            <h1><a href="pokemon.html?id=${id}">${pokemonData.name}</a></h1>
            <p>${descripcion}</p>
            <button class="button"><a href="pokemon.html?id=${id}">Know More</a></button>
          </div>
          <img src="${sprite}" alt="${pokemonData.name}">
        </div>
      `;
      container.innerHTML = cardHTML;
      document.querySelectorAll(".card-h2-row h2").forEach((h2) => {
        const cls = typeClassMap[h2.textContent.toLowerCase()];
        if (cls) h2.classList.add(cls);
      });
    })
    .catch(() => {
      fetch(`https://pokeapi.co/api/v2/type/${query}`)
        .then((res) => {
          if (!res.ok) throw new Error("Not a type either");
          return res.json();
        })
        .then(async (typeData) => {
          currentTypeResults = typeData.pokemon.filter((p) => !p.pokemon.name.includes("-"));
          currentTypeSearch = query;
          currentPage = 1;
          showPaginatedTypeResults(currentPage);
        })
        .catch(() => {
          container.innerHTML = `<p>The search has not obtained any results..</p>`;
        });
})
};

function showPaginatedTypeResults(page) {
  const container = document.querySelector(".container-cards");
  const totalPages = Math.ceil(currentTypeResults.length / CARDS_PER_PAGE);

  if (page > totalPages) {
    buildPaginator(totalPages);
    return;
  }
  const offset = (page - 1) * CARDS_PER_PAGE;
  const currentPagePokemon = currentTypeResults.slice(offset, offset + CARDS_PER_PAGE);
  Promise.all(
    currentPagePokemon.map(async (entry) => {
      const pkmData = await fetch(entry.pokemon.url).then((r) => r.json());
      const speciesData = await fetch(pkmData.species.url).then((r) => r.json());
      const id = pkmData.id;
      const idFmt = `#${id.toString().padStart(3, "0")}`;
      const sprite = pkmData.sprites.other["official-artwork"].front_default;
      const types = pkmData.types.map((t) => t.type.name);
      const descEntry = speciesData.flavor_text_entries.find(
        (e) => e.language.name === "en"
      );
      const desc = descEntry
        ? descEntry.flavor_text.replace(/\f/g, " ")
        : "No description.";
      return `
        <div class="card">
          <div class="card-info">
            <div class="card-header-row">
              <div class="card-h2-row">
                ${types.map((t) => `<h2>${t.toUpperCase()}</h2>`).join("")}
              </div>
              <h3>${idFmt}</h3>
            </div>
            <h1><a href="pokemon.html?id=${id}">${pkmData.name}</a></h1>
            <p>${desc}</p>
            <button class="button"><a href="pokemon.html?id=${id}">Know More</a></button>
          </div>
          <img src="${sprite}" alt="${pkmData.name}">
        </div>
      `;
    })
  ).then((cards) => {
    container.innerHTML = cards.join("");
    document.querySelectorAll(".card-h2-row h2").forEach((h2) => {
      const cls = typeClassMap[h2.textContent.toLowerCase()];
      if (cls) h2.classList.add(cls);
    });
    buildPaginator(page, currentTypeResults.length);
  });
}

function goToPage(p) {
  currentPage = p;
  if (currentTypeSearch) {
    showPaginatedTypeResults(p);
  } else {
    renderPage(p);
    buildPaginator(p);
  }
}

function buildPaginator(page, totalItems = TOTAL_POKEMON) {
  const container = document.getElementById("pagination");
  container.innerHTML = "";
  const totalPages = Math.ceil(totalItems / CARDS_PER_PAGE);
  const groupStart = Math.floor((page - 1) / 10) * 10 + 1;
  const groupEnd = Math.min(groupStart + 9, totalPages);
  if (groupStart > 1)
    container.appendChild(makeButton("◄", () => goToPage(groupStart - 1)));
  for (let p = groupStart; p <= groupEnd; p++)
    container.appendChild(makeButton(p, () => goToPage(p), p === page));
  if (groupEnd < totalPages)
    container.appendChild(makeButton("►", () => goToPage(groupEnd + 1)));
  const input = document.createElement("input");
  input.type = "number";
  input.min = 1;
  input.max = totalPages;
  input.placeholder = "Go to…";
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const n = +input.value;
      if (n >= 1 && n <= totalPages) goToPage(n);
    }
  });
  container.appendChild(input);
}

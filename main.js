function toggleMenu() {
  document.getElementById("mainMenu").classList.toggle("hidden");
}

function toggleSubmenu() {
  document.getElementById("appearanceOptions").classList.toggle("hidden");
}

const paramsString = window.location.search;
const urlParams = new URLSearchParams(paramsString);

fetch("https://pokeapi.co/api/v2/pokemon/?limit=30")
.then(response => response.json())
.then(json => {
    const pokemon_container = document.querySelector(".container-cards");

    const typeClassMap ={
        grass: 'type-grass',
        fire: 'type-fire',
        water: 'type-water',
        poison: 'type-poison',
        electric: 'type-electric',
        bug: 'type-bug',
        normal: 'type-normal',
        flying: 'type-flying',
        ground: 'type-ground',
        fairy: 'type-fairy',
        fighting: 'type-fighting',
        psychic: 'type-psychic',
        rock: 'type-rock',
        steel: 'type-steel',
        ice: 'type-ice',
        ghost: 'type-ghost',
        dragon: 'type-dragon',
        dark: 'type-dark'
    };
   
    const promises = json.results.slice(0, 9).map(pokemon => {
        const id = pokemon.url.split("/").filter(Boolean).pop();
        const idReal = `#${id.toString().padStart(3,`0`)}`;
        const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

       
        return Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}/`) .then(res => res.json()),
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`) .then(res => res.json())
            ]).then(([speciesData, pokemonData]) => {
                const elemental = pokemonData.types.map(t => t.type.name);
                const entry = speciesData.flavor_text_entries.find(
                    entry => entry.language.name === "en"
                );
                const descripcion = entry ? entry.flavor_text.replace(/\f/g, ' ')  : "No description available.";
                const elementalHTML = elemental.map(elemental => `<h2>${elemental.toUpperCase()}</h2>`).join("");

              
                return `
                <div class="card">
                <div class="card-info">
                      <div class="card-header-row">
                            <div class="card-h2-row">
                            ${elementalHTML}
                        </div>
                            <h3>${idReal}</h3>
                    </div>
                    <h1><a href="#">${pokemon.name}</a></h1>
                    <p>${descripcion}</p>
                    <button class="button"><a href="#">Know More</a></button>
                </div>
                <img src="${sprite}" alt="${pokemon.name}">
                </div>
                `;
            });
    });

    Promise.all(promises).then(cards => {
        pokemon_container.innerHTML = cards.join("");

        document.querySelectorAll(`.card`).forEach(card => {
            const typeElements = card.querySelectorAll(`.card-h2-row h2`);
            typeElements.forEach(typeElement => { 
                const type = typeElement.textContent.trim().toLowerCase();
                const typeClass = typeClassMap[type];
                if (typeClass) {
                    typeElement.classList.add(typeClass);
                }
            });     
        });
    });
});
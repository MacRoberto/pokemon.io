function toggleMenu() {
  document.getElementById("mainMenu").classList.toggle("hidden");
}

function toggleSubmenu() {
  document.getElementById("appearanceOptions").classList.toggle("hidden");
}

const paramsString = window.location.search;
const searchParams = new URLSearchParams(paramsString);
const id = searchParams.get("id");

fetch("https://pokeapi.co/api/v2/pokemon/" + id)
.then(response => {
    if (!response.ok) throw new Error("Pokémon not found");
    return response.json();
})
.then(json => {
    fetch(json.species.url)
    .then(res => res.json())
    .then(species => {
        const entry = species.flavor_text_entries.find(e => e.language.name === "en");
        const generation = species.generation.name;
        const descripcion = entry ? entry.flavor_text.replace(/\f/g, ' ') : "No description available.";
        const typeClassMap = {
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

        const generationRegionMap ={
            'generation-i': 'Kanto',
            'generation-ii': 'Johto',
            'generation-iii': 'Hoenn',
            'generation-iv': 'Sinnoh',
            'generation-v': 'Unova',
            'generation-vi': 'Kalos',
            'generation-vii': 'Alola',
            'generation-viii': 'Galar',
            'generation-ix': 'Paldea'
        };

        const generationRomanMap ={
            'generation-i': 'I',
            'generation-ii': 'II',
            'generation-iii': 'III',
            'generation-iv': 'IV',
            'generation-v': 'V',
            'generation-vi': 'VI',
            'generation-vii': 'VII',
            'generation-viii': 'VIII',
            'generation-ix': 'IX'
        };

        const region = generationRegionMap[generation] || `Unknown`;
        const generationRoman =generationRomanMap [generation] || ``;
        const container = document.querySelector(".container_token");
        const idReal = `#${id.toString().padStart(3, "0")}`;
        const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
        const name = json.name.charAt(0).toUpperCase() + json.name.slice(1);
        const types = json.types.map(t => t.type.name);
        const elementalHTML = types.map(type => {
            const typeClass = typeClassMap[type] || '';
            return `<h2 class="${typeClass}">${type.charAt(0).toUpperCase() + type.slice(1)}</h2>`;
        }).join('');

        const height = (json.height / 10) + "m";
        const weight = (json.weight / 10) + "kg";
        const abilities = json.abilities.map(a => `<h5>${a.ability.name.charAt(0).toUpperCase() + a.ability.name.slice(1)}</h5>`).join('');
        const statColors = {
            hp: "#DF2140",
            attack: "#FF994D",
            defense: "#eecd3d",
            "special-attack": "#85ddff",
            "special-defense": "#96da83",
            speed: "#fb94a8"
        };

        const stats = json.stats.map(stat => {
            const statName = stat.stat.name;
            const color = statColors[statName] || "#BFC66B";
            let label = statName.toUpperCase();
            if (statName === "special-attack") label = "SpA";
            if (statName === "special-defense") label = "SpD";
            if (statName === "attack") label = "ATK";
            if (statName === "defense") label = "DEF";
            if (statName === "speed") label = "SPD";
            if (statName === "hp") label = "HP";
            return `
                <div class="stat-box" style="background-color: ${color};">
                    <span>${label}</span>
                    <span class="stat-value">${stat.base_stat}</span>
                </div>
            `;
        }).join('');
        
        const token = `
            <img src="${sprite}" alt="${name}">
            <div class="info_token">
                <div class="token-begin-row">
                    <span class="ID">${idReal}</span>   
                    <span class="Generation"> ${generationRoman}</span>
                    <span class="Region">${region}</span>
                </div>

                <h1 id="token_name">${name}</h1>
                <div class="token-h2-row">${elementalHTML}</div>
                <p>${descripcion}</p>
                <div class="token-h3-row">
                    <div class="hw-box">
                        <span class="hw-label">Height</span>
                        <span class="hw-value">${height}</span>
                    </div>
                    <div class="hw-box">
                        <span class="hw-label">Weight</span>
                        <span class="hw-value">${weight}</span>
                    </div>
                </div>
                <h2 class="Stats">Stats</h2>
                <div class="token-h4-row">${stats}</div>
                <h3 class="Abilities">Abilities</h3>
                <div class="token-h5-row">${abilities}</div>
            </div>

        `;
        container.innerHTML = token;

        fetch(species.evolution_chain.url)
        .then (res => res.json())
        .then(evoChain => {
          function getAllEvolutions(chain) {
            let result = [];
            function traverse(node) {
                result.push(node.species.name);
                node.evolves_to.forEach(child => traverse(child));
            }
            traverse(chain);
            return result;
          }

            const evoNames = getAllEvolutions(evoChain.chain);
            console.log(evoNames);
            const pokemonEvolve = document.querySelector(`.pokemon-evolve`);
            const evolveBox = document.getElementById(`evolveBox`);

            if (!evoNames || (evoNames.length === 1 && evoNames [0] === json.name.toLowerCase())) {
                if (pokemonEvolve) pokemonEvolve.style.display = `none`;
                if (evolveBox) evolveBox.innerHTML = ``;
                return;
            }else{
                if (pokemonEvolve) pokemonEvolve.style.display = ``;
            }

            Promise.all(
                evoNames.map (async name => {
                    let res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
                    if (res.ok) {
                        let poke = await res.json();
                        return {
                            name: poke.name,
                            img: poke.sprites.other[`official-artwork`].front_default
                        };
                    }
                    let listRes = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000');
                    if (!listRes.ok) return null;
                    let list = await listRes.json();
                    let found = list.results.find(p => p.name.startsWith(name));
                    if (found) {
                        let pokeRes = await fetch(found.url);
                        if (!pokeRes.ok) return null;
                        let poke = await pokeRes.json();
                        return {
                            name: poke.name,
                            img: poke.sprites.other[`official-artwork`].front_default
                        };
                    }
                    return null;
                })
            ).then (evos =>{
                evos = evos.filter(evo => evo);
                let evoHTML = evos.map((evo, idx) => {
                const pokeIdMatch = evo.img && evo.img.match(/\/(\d+)\.png$/);
                const pokeId = pokeIdMatch ? pokeIdMatch[1] : ``;
                return`
                <a href="pokemon.html?id=${pokeId}">
                    <img src="${evo.img}" alt="${evo.name}" style="width: 100px;">
                </a>
                ${idx < evos.length - 1 ? `<span style="font-size: 32px;">&#8594;</span>` : ``}
                `;    
            }).join(``);
                if (evolveBox) evolveBox.innerHTML = evoHTML;
            });

            const formsBox = document.getElementById(`formsBox`);
            const pokemonForms = document.querySelector(`.pokemon-forms`);

            if (pokemonForms) pokemonForms.style.display = `none`;
            formsBox.innerHTML = ``;
            
            if (species.varieties && species.varieties.length > 1) {
                Promise.all(
                    species.varieties.map(variant =>
                        fetch(variant.pokemon.url)
                        .then(res => res.json())
                        .then(poke => ({
                            name: poke.name,
                            img: poke.sprites.other[`official-artwork`].front_default
                        }))
                    )
                ).then(forms => {
                    const validForms = forms.filter(form => form.img);
                    if (validForms.length > 1) {
                        let formsHTML = validForms.map((form, idx) => { 
                        const pokeIdMatch = form.img && form.img.match(/\/(\d+)\.png$/);
                        const pokeId = pokeIdMatch ? pokeIdMatch[1] : ``;
                        return `
                            <a href="pokemon.html?id=${pokeId}">
                                <img src="${form.img}" alt="${form.name}" style="width:100px;">
                            </a>
                        `}).join(``);
                        formsBox.innerHTML = formsHTML;
                        if (pokemonForms) pokemonForms.style.display = `block`;
                    } else {
                        formsBox.innerHTML = ``;
                        if (pokemonForms) pokemonForms.style.display = `none`;
                    }
                });
            } else{
                formsBox.innerHTML = ``;
                if (pokemonForms) pokemonForms.style.display = `none`;
            }
        });
    });
});

fetch("https://pokeapi.co/api/v2/pokemon-species?limit=0")
  .then((r) => r.json())
  .then((data) => {
    document.getElementById("pokemon-count").textContent = data.count;
  })
  .catch(() => {
    document.getElementById("pokemon-count").textContent = "No disponible";
  });

const botonesTema = document.querySelectorAll('button[data-tema]');

botonesTema.forEach(boton => {
  boton.addEventListener('click', () => {
    const tema = boton.dataset.tema;

    if (tema === 'red') {
      document.body.classList.add('tema-rojo');
      document.body.classList.remove('tema-blanco');
    } else if (tema === 'white') {
      document.body.classList.remove('tema-rojo');
      document.body.classList.add('tema-blanco');
    }
  });
});

const menuBtn = document.getElementById('menuBtn');
const menu = document.getElementById('menu');
const menuText = document.querySelectorAll('.menuText');

menuBtn.addEventListener('click', () => {
    menu.classList.toggle('open');
    menuText.forEach(function(text, index) {
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

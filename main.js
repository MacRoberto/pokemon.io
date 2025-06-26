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

const CARDS_PER_PAGE = 9;
const TOTAL_POKEMON  = 1025;
const totalPages     = Math.ceil(TOTAL_POKEMON / CARDS_PER_PAGE);
let currentPage      = 1;

renderPage(currentPage);
buildPaginator(currentPage);

async function renderPage(page){
  currentPage = page;

  const offset = (page - 1) * CARDS_PER_PAGE;       
  const remaining = TOTAL_POKEMON - offset;             
  const limit = Math.min(CARDS_PER_PAGE, remaining);    

  const pageData = await fetch(
      `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`
    ).then(r => r.json());

  const cards = await Promise.all(
    pageData.results.map(async pkm => {
      const id   = pkm.url.split('/').filter(Boolean).pop();
      const idFmt = `#${id.toString().padStart(3,'0')}`;
      const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

      const [species, data] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then(r=>r.json()),
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(r=>r.json())
      ]);

      const entry = species.flavor_text_entries.find(e=>e.language.name==='en');
      const desc  = entry ? entry.flavor_text.replace(/\f/g,' ') : 'No description';
      const types = data.types.map(t=>t.type.name);

      return `
        <div class="card">
          <div class="card-info">
            <div class="card-header-row">
              <div class="card-h2-row">
                ${types.map(t=>`<h2>${t.toUpperCase()}</h2>`).join('')}
              </div>
              <h3>${idFmt}</h3>
            </div>
            <h1><a href="#">${pkm.name}</a></h1>
            <p>${desc}</p>
            <button class="button"><a href="#">Know More</a></button>
          </div>
          <img src="${sprite}" alt="${pkm.name}">
        </div>`;
    })
  );

  document.querySelector('.container-cards').innerHTML = cards.join('');

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
  document.querySelectorAll('.card-h2-row h2').forEach(h2=>{
      const cls = typeClassMap[h2.textContent.toLowerCase()];
      if (cls) h2.classList.add(cls);
  });
}

function buildPaginator(page){
  const container = document.getElementById('pagination');
  container.innerHTML = '';

  const groupStart = Math.floor((page-1)/10)*10 + 1;        
  const groupEnd   = Math.min(groupStart+9, totalPages);    

  if (groupStart > 1)
    container.appendChild( makeButton('◄', ()=>goToPage(groupStart-1)) );

  for (let p = groupStart; p <= groupEnd; p++)
    container.appendChild( makeButton(p, ()=>goToPage(p), p===page) );

  if (groupEnd < totalPages)
    container.appendChild( makeButton('►', ()=>goToPage(groupEnd+1)) );

  const input = document.createElement('input');
  input.type='number'; input.min=1; input.max=totalPages; input.placeholder='Ir a…';
  input.addEventListener('keypress', e=>{
    if (e.key==='Enter'){
      const n = +input.value;
      if (n>=1 && n<=totalPages) goToPage(n);
    }
  });
  container.appendChild(input);
}

function makeButton(label, cb, active=false){
  const b=document.createElement('button');
  b.textContent=label; if(active) b.classList.add('active'); b.onclick=cb;
  return b;
}
function goToPage(p){ renderPage(p); buildPaginator(p); }

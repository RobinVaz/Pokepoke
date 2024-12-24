const cardContainer = document.getElementById('card-container');
const collectedContainer = document.getElementById('collected-container');
const boosterContainer = document.getElementById('booster-container');
const boosterAnimationContainer = document.getElementById('booster-animation-container');
const boosterAnimation = document.getElementById('booster-animation');
const openBoosterButtonSSP = document.getElementById('open-booster-ssp');
const openBoosterButtonSCR = document.getElementById('open-booster-scr');
const resetCollectionButton = document.getElementById('reset-collection');
const searchBar = document.getElementById('search-bar');
const progressContainer = document.getElementById('progress-container');
const collectionProgress = document.getElementById('collection-progress');
const progressText = document.getElementById('progress-text');
const modal = document.getElementById('card-modal');
const modalImage = document.getElementById('modal-image');
const modalName = document.getElementById('modal-name');
const modalDescription = document.getElementById('modal-description');
const closeButton = document.querySelector('.close-button');

let pokemons = [];
let collectedPokemons = [];

async function loadPokemons() {
    const response = await fetch('pokemons.json');
    pokemons = await response.json();
    loadCollectedPokemons();
    createAlbum();
}

function createAlbum() {
    const albumContainer = document.getElementById('collected-container');
    albumContainer.innerHTML = '';
    pokemons.forEach((pokemon, index) => {
        const placeholder = document.createElement('div');
        placeholder.className = 'placeholder';
        placeholder.textContent = index + 1;
        albumContainer.appendChild(placeholder);
    });
}

function createCard(pokemon, container) {
    const card = document.createElement('div');
    card.className = 'card';
    
    const img = document.createElement('img');
    img.src = pokemon.image;
    card.appendChild(img);
    
    const name = document.createElement('h2');
    name.textContent = pokemon.name;
    card.appendChild(name);
    
    const edition = document.createElement('p');
    edition.textContent = `Edition ${pokemon.edition}`;
    card.appendChild(edition);
    
    if (pokemon.edition === 'SSP') {
        const editionImage = document.createElement('img');
        editionImage.src = 'https://www.pokecardex.com/assets/images/logos/SSP.png';
        editionImage.className = 'edition-logo';
        card.appendChild(editionImage);
    }
    
    card.onclick = () => openModal(pokemon);
    
    // Replace the placeholder with the actual card
    const albumContainer = document.getElementById('collected-container');
    const placeholder = albumContainer.children[pokemons.indexOf(pokemon)];
    albumContainer.replaceChild(card, placeholder);
    
    setTimeout(() => card.classList.add('show'), 100);
}

function collectCard(pokemon) {
    if (!collectedPokemons.some(p => p.name === pokemon.name && p.image === pokemon.image)) {
        collectedPokemons.push(pokemon);
        createCard(pokemon, collectedContainer);
        saveCollectedPokemons();
        updateProgress();
    }
}

function openBooster(edition) {
    boosterContainer.innerHTML = '';
    boosterAnimationContainer.style.display = 'flex';
    setTimeout(() => {
        boosterAnimationContainer.style.display = 'none';
        const boosterPokemons = [];
        const filteredPokemons = pokemons.filter(pokemon => pokemon.edition === edition);
        for (let i = 0; i < 3; i++) {
            const randomPokemon = getRandomPokemon(filteredPokemons);
            boosterPokemons.push(randomPokemon);
            collectCard(randomPokemon);
        }
        boosterPokemons.forEach((pokemon, index) => {
            setTimeout(() => createCard(pokemon, boosterContainer), index * 500);
        });
    }, 2000); // Duration of the animation
}

function getRandomPokemon(filteredPokemons) {
    const random = Math.random() * 100;
    if (random < 80) {
        return getRandomPokemonByRarity(filteredPokemons, 'common');
    } else if (random < 94) {
        return getRandomPokemonByRarity(filteredPokemons, 'rare');
    } else if (random < 94.8) {
        return getRandomPokemonByRarity(filteredPokemons, 'ultra-rare');
    } else {
        return getRandomPokemonByRarity(filteredPokemons, 'gold');
    }
}

function getRandomPokemonByRarity(filteredPokemons, rarity) {
    const filteredByRarity = filteredPokemons.filter(pokemon => pokemon.rarity === rarity);
    return filteredByRarity[Math.floor(Math.random() * filteredByRarity.length)];
}

function resetCollection() {
    collectedContainer.innerHTML = '';
    collectedPokemons = [];
    localStorage.removeItem('collectedPokemons');
    createAlbum();
    updateProgress();
}

function openModal(pokemon) {
    modalImage.src = pokemon.image;
    modalName.textContent = pokemon.name;
    modalDescription.textContent = pokemon.description;
    modal.style.display = 'block';
}

function closeModal() {
    modal.style.display = 'none';
}

function saveCollectedPokemons() {
    localStorage.setItem('collectedPokemons', JSON.stringify(collectedPokemons));
}

function loadCollectedPokemons() {
    const savedPokemons = localStorage.getItem('collectedPokemons');
    if (savedPokemons) {
        collectedPokemons = JSON.parse(savedPokemons);
        collectedPokemons.forEach(pokemon => {
            createCard(pokemon, collectedContainer);
        });
    }
    updateProgress();
}

function filterCards() {
    const searchTerm = searchBar.value.toLowerCase();
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => {
        const cardName = card.querySelector('h2').textContent.toLowerCase();
        if (cardName.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function updateProgress(edition = 'SSP') {
    const totalCards = pokemons.filter(pokemon => pokemon.edition === edition).length;
    const collectedCards = collectedPokemons.filter(pokemon => pokemon.edition === edition).length;
    collectionProgress.max = totalCards;
    collectionProgress.value = collectedCards;
    progressText.textContent = `${collectedCards}/${totalCards}`;
}

function disableButton(button, duration) {
    button.disabled = true;
    setTimeout(() => {
        button.disabled = false;
    }, duration);
}

openBoosterButtonSSP.addEventListener('click', () => {
    openBooster('SSP');
    disableButton(openBoosterButtonSSP, 3000); // Disable for 3 seconds
});
openBoosterButtonSCR.addEventListener('click', () => {
    openBooster('SCR');
    disableButton(openBoosterButtonSCR, 3000); // Disable for 3 seconds
});
resetCollectionButton.addEventListener('click', resetCollection);
searchBar.addEventListener('input', filterCards);
closeButton.addEventListener('click', closeModal);
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

loadPokemons();

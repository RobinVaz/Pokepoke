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
const albumContainer = document.getElementById('album-container');
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
    createAlbum();
    loadCollectedPokemons();
}

function createAlbum() {
    albumContainer.innerHTML = '';
    pokemons.forEach((pokemon, index) => {
        const card = document.createElement('div');
        card.className = 'album-card';
        card.dataset.index = index;
        
        const number = document.createElement('p');
        number.textContent = `#${index + 1}`;
        card.appendChild(number);
        
        albumContainer.appendChild(card);
    });
}

function updateAlbum() {
    collectedPokemons.forEach(pokemon => {
        const index = pokemons.findIndex(p => p.name === pokemon.name && p.image === pokemon.image);
        if (index !== -1) {
            const card = albumContainer.querySelector(`.album-card[data-index="${index}"]`);
            card.innerHTML = ''; // Clear the placeholder number
            const img = document.createElement('img');
            img.src = pokemon.image;
            card.appendChild(img);
        }
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
    
    // Insert the card in the correct order based on rarity
    const rarityOrder = ['common', 'rare', 'ultra-rare', 'gold'];
    const existingCards = Array.from(container.children);
    const insertIndex = existingCards.findIndex(existingCard => {
        const existingRarity = existingCard.querySelector('p').textContent.split(' ')[1];
        return rarityOrder.indexOf(existingRarity) > rarityOrder.indexOf(pokemon.rarity);
    });
    if (insertIndex === -1) {
        container.appendChild(card);
    } else {
        container.insertBefore(card, existingCards[insertIndex]);
    }
    
    setTimeout(() => card.classList.add('show'), 100);
}

function collectCard(pokemon) {
    if (!collectedPokemons.some(p => p.name === pokemon.name && p.image === pokemon.image)) {
        collectedPokemons.push(pokemon);
        const editionContainer = getOrCreateEditionContainer(pokemon.edition);
        createCard(pokemon, editionContainer);
        saveCollectedPokemons();
        updateProgress();
        updateAlbum();
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
    updateProgress();
    createAlbum();
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
            const editionContainer = getOrCreateEditionContainer(pokemon.edition);
            createCard(pokemon, editionContainer);
        });
    }
    updateProgress();
    updateAlbum();
}

function getOrCreateEditionContainer(edition) {
    let editionContainer = document.getElementById(`collected-${edition}`);
    if (!editionContainer) {
        editionContainer = document.createElement('div');
        editionContainer.id = `collected-${edition}`;
        editionContainer.className = 'edition-container';
        const editionTitle = document.createElement('h3');
        editionTitle.textContent = `Edition ${edition}`;
        editionTitle.className = 'edition-title';
        editionTitle.onclick = () => toggleEdition(edition);
        collectedContainer.appendChild(editionTitle);
        collectedContainer.appendChild(editionContainer);
    }
    return editionContainer;
}

function toggleEdition(edition) {
    const allEditionContainers = document.querySelectorAll('.edition-container');
    allEditionContainers.forEach(container => {
        container.style.display = 'none';
    });
    const selectedEditionContainer = document.getElementById(`collected-${edition}`);
    if (selectedEditionContainer) {
        selectedEditionContainer.style.display = 'flex';
    }
    updateProgress(edition);
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

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
const albumContainerSCR = document.getElementById('album-container-scr');
const albumSCRTitle = document.getElementById('album-scr-title');
const modal = document.getElementById('card-modal');
const modalImage = document.getElementById('modal-image');
const modalName = document.getElementById('modal-name');
const modalDescription = document.getElementById('modal-description');
const closeButton = document.querySelector('.close-button');
const profileImage = document.getElementById('profile-image');

let pokemons = [];
let collectedPokemons = [];
let boostersOpened = 0;
let startTime = Date.now();

async function loadPokemons() {
    const response = await fetch('pokemons.json');
    pokemons = await response.json();
    createAlbum();
    loadCollectedPokemons();
}

function createAlbum() {
    albumContainer.innerHTML = '';
    albumContainerSCR.innerHTML = '';
    albumSCRTitle.style.display = 'none';
    albumContainerSCR.style.display = 'none';

    pokemons.forEach((pokemon, index) => {
        const card = document.createElement('div');
        card.className = 'album-card';
        card.dataset.index = index;
        
        const number = document.createElement('p');
        number.textContent = `#${index + 1}`;
        card.appendChild(number);

        albumContainer.appendChild(card);

        if (index === 252) {
            const spacer = document.createElement('div');
            spacer.style.width = '100%';
            spacer.style.height = '200px';
            spacer.style.display = 'flex';
            spacer.style.alignItems = 'center';
            spacer.style.justifyContent = 'center';
            const label = document.createElement('h2');
            label.textContent = 'Album SCR';
            spacer.appendChild(label);
            albumContainer.appendChild(spacer);
            albumSCRTitle.style.display = 'block';
            albumContainerSCR.style.display = 'flex';
        }
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
            card.onclick = () => openModal(pokemon);
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
    } else if (pokemon.edition === 'SCR') {
        const editionImage = document.createElement('img');
        editionImage.src = 'https://www.pokecardex.com/assets/images/logos/SCR.png';
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
    boostersOpened++;
    boosterContainer.innerHTML = '';
    boosterAnimation.src = edition === 'SSP' ? 'https://lesgentlemendujeu.com/11166-large_default/pokemon-ev08-boosters-etincelles-deferlantes.jpg' : 'https://www.ludifolie.com/49553-large_default/pokemon-ev07-couronne-stellaire-booster.jpg';
    boosterAnimationContainer.style.display = 'flex';
    boosterAnimation.style.animation = 'boosterTremble 2s forwards';
    setTimeout(() => {
        boosterAnimationContainer.style.display = 'none';
        const boosterPokemons = [];
        const filteredPokemons = pokemons.filter(pokemon => pokemon.edition === edition);
        for (let i = 0; i < 5; i++) { // Change 3 to 5
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
    const random = Math.random();
    let rarity;

    if (random < 0.8) {
        rarity = 'common';
    } else if (random < 0.99) {
        rarity = 'rare';
    } else if (random < 0.998) {
        rarity = 'ultra-rare';
    } else {
        rarity = 'gold';
    }

    return getRandomPokemonByRarity(filteredPokemons, rarity);
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
    modalDescription.textContent = `Edition: ${pokemon.edition}`;
    if (pokemon.edition === 'SSP') {
        const editionImage = document.createElement('img');
        editionImage.src = 'https://www.pokecardex.com/assets/images/logos/SSP.png';
        editionImage.className = 'edition-logo';
        modalDescription.appendChild(editionImage);
    } else if (pokemon.edition === 'SCR') {
        const editionImage = document.createElement('img');
        editionImage.src = 'https://www.pokecardex.com/assets/images/logos/SCR.png';
        editionImage.className = 'edition-logo';
        modalDescription.appendChild(editionImage);
    }
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
    const selectedEditionContainer = document.getElementById(`collected-${edition}`);
    if (selectedEditionContainer) {
        if (selectedEditionContainer.style.display === 'flex') {
            selectedEditionContainer.style.display = 'none';
        } else {
            const allEditionContainers = document.querySelectorAll('.edition-container');
            allEditionContainers.forEach(container => {
                container.style.display = 'none';
            });
            selectedEditionContainer.style.display = 'flex';
        }
    }
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

function updateProgress() {
    const totalCards = pokemons.length;
    const collectedCards = collectedPokemons.length;
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

function redirectToStats() {
    const totalTime = Date.now() - startTime;
    localStorage.setItem('boostersOpened', boostersOpened);
    localStorage.setItem('totalTime', totalTime);
    window.location.href = 'stats.html';
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
profileImage.addEventListener('click', redirectToStats);
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

loadPokemons();

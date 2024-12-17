const cardsData = [
    { name: "Noeunoeuf", image: "images/noeunoeuf.PNG", rarity: "common" },
    { name: "Noeunoeuf V2", image: "images/noeunoeuf2.PNG", rarity: "common" },
    { name: "Lépidonille", image: "images/lépidonille.PNG", rarity: "common" },
    { name: "Noadkoko", image: "images/Noadkoko.PNG", rarity: "rare" },
    { name: "Fermite EX", image: "images/fermite ex.PNG", rarity: "ultra-rare" },
];

// Probabilités de rareté pour différents types de boosters
const boosterProbabilities = {
    free: {
        common: 0.8,
        rare: 0.195,
        "ultra-rare": 0.005,
    },
    rare: {
        common: 0.4,
        rare: 0.55,
        "ultra-rare": 0.05,
    },
    legendary: {
        common: 0.25,
        rare: 0.6,
        "ultra-rare": 0.15,
    },
};

// Images des boosters
const boosterImages = {
    free: "booster/booster_gratuit.PNG",
    rare: "booster/booster_rare.PNG",
    legendary: "booster/booster_legendaire.PNG",
};

// Variables globales
let collection = [];
let pokecoins = 0;
let boosterCount = 0;
let commonCount = 0;
let rareCount = 0;
let ultraRareCount = 0;
let currentUser = '';
let playtime = 0;
let playtimeInterval;

// Fonction pour tirer une carte aléatoire en respectant les probabilités du booster
function getRandomCard(boosterType) {
    const random = Math.random();
    let accumulatedProbability = 0;
    const probabilities = boosterProbabilities[boosterType];

    for (const rarity in probabilities) {
        accumulatedProbability += probabilities[rarity];
        if (random <= accumulatedProbability) {
            const filteredCards = cardsData.filter(card => card.rarity === rarity);
            return filteredCards[Math.floor(Math.random() * filteredCards.length)];
        }
    }
}

// Fonction pour ouvrir un booster (5 cartes)
function openBooster(boosterType) {
    const boosterOpening = document.getElementById("booster-opening");
    const boosterImage = document.getElementById("booster-image");
    const cardsContainer = document.getElementById("cards-container");
    const boosterContainer = document.getElementById("booster-container");

    // Afficher l'animation d'ouverture du booster
    boosterImage.src = boosterImages[boosterType];
    boosterOpening.style.display = "flex";
    boosterContainer.style.display = "none";

    setTimeout(() => {
        boosterOpening.style.display = "none";
        cardsContainer.innerHTML = ""; // Nettoyer l'affichage précédent
        boosterContainer.style.display = "block";

        const openedCards = [];

        for (let i = 0; i < 5; i++) {
            const card = getRandomCard(boosterType);
            openedCards.push(card);

            // Création de l'élément de carte
            const cardElement = document.createElement("div");
            cardElement.classList.add("card", card.rarity); // Ajouter la classe de rareté

            cardElement.innerHTML = `
                <img src="${card.image}" alt="${card.name}">
                <p>${card.name}</p>
            `;

            cardElement.addEventListener("click", () => showModal(card));
            cardsContainer.appendChild(cardElement);
        }

        // Mettre à jour la collection et gérer les doublons
        updateCollection(openedCards);

        // Mettre à jour le nombre de boosters ouverts
        boosterCount++;
        updateUI();
        saveGame();
    }, 2000); // Durée de l'animation avant d'afficher les cartes
}

// Fonction pour mettre à jour la collection
function updateCollection(newCards) {
    newCards.forEach(card => {
        const existingCard = collection.find(c => c.name === card.name);
        if (existingCard) {
            // Carte en doublon => ajouter des Pokécoins selon la rareté
            switch (card.rarity) {
                case "common":
                    pokecoins += 1;
                    break;
                case "rare":
                    pokecoins += 3;
                    break;
                case "ultra-rare":
                    pokecoins += 5;
                    break;
            }
        } else {
            // Ajouter la carte à la collection
            collection.push(card);
            // Mettre à jour les compteurs de rareté
            switch (card.rarity) {
                case "common":
                    commonCount++;
                    break;
                case "rare":
                    rareCount++;
                    break;
                case "ultra-rare":
                    ultraRareCount++;
                    break;
            }
        }
    });

    // Mettre à jour les affichages
    updateUI();
    saveGame();
}

// Fonction pour afficher/masquer la collection
function toggleCollection() {
    const collectionSection = document.getElementById("collection-section");
    const collectionContainer = document.getElementById("collection-container");

    if (collectionSection.style.display === 'none' || collectionSection.style.display === '') {
        collectionContainer.innerHTML = ""; // Nettoyer l'affichage précédent

        collection.forEach(card => {
            const cardElement = document.createElement("div");
            cardElement.classList.add("card", card.rarity); // Ajouter la classe de rareté

            cardElement.innerHTML = `
                <img src="${card.image}" alt="${card.name}">
                <p>${card.name}</p>
            `;

            cardElement.addEventListener("click", () => showModal(card));
            collectionContainer.appendChild(cardElement);
        });

        collectionSection.style.display = "block";
    } else {
        collectionSection.style.display = "none";
    }
}

// Fonction pour afficher/masquer les statistiques
function toggleStats() {
    const statsSection = document.getElementById("stats-section");

    if (statsSection.style.display === 'none' || statsSection.style.display === '') {
        statsSection.style.display = "block";
    } else {
        statsSection.style.display = "none";
    }
}

// Fonction pour afficher/masquer les utilisateurs et les classements
function toggleUsers() {
    const usersSection = document.getElementById("users-section");
    const usersList = document.getElementById("users-list");
    const rankingCards = document.getElementById("ranking-cards");
    const rankingBoosters = document.getElementById("ranking-boosters");
    const rankingPokecoins = document.getElementById("ranking-pokecoins");

    if (usersSection.style.display === 'none' || usersSection.style.display === '') {
        usersList.innerHTML = ""; // Nettoyer l'affichage précédent
        rankingCards.innerHTML = "";
        rankingBoosters.innerHTML = "";
        rankingPokecoins.innerHTML = "";

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userData = users.map(user => {
            const savedGame = JSON.parse(localStorage.getItem(`pokemonGame_${user}`));
            return {
                username: user,
                collectionSize: savedGame ? savedGame.collection.length : 0,
                boosterCount: savedGame ? savedGame.boosterCount : 0,
                pokecoins: savedGame ? savedGame.pokecoins : 0
            };
        });

        // Afficher la liste des utilisateurs
        users.forEach(user => {
            const userElement = document.createElement("li");
            userElement.textContent = user;
            usersList.appendChild(userElement);
        });

        // Classement par nombre de cartes différentes
        userData.sort((a, b) => b.collectionSize - a.collectionSize);
        userData.forEach(user => {
            const userElement = document.createElement("li");
            userElement.textContent = `${user.username}: ${user.collectionSize} cartes`;
            rankingCards.appendChild(userElement);
        });

        // Classement par nombre de boosters ouverts
        userData.sort((a, b) => b.boosterCount - a.boosterCount);
        userData.forEach(user => {
            const userElement = document.createElement("li");
            userElement.textContent = `${user.username}: ${user.boosterCount} boosters`;
            rankingBoosters.appendChild(userElement);
        });

        // Classement par nombre de Pokécoins
        userData.sort((a, b) => b.pokecoins - a.pokecoins);
        userData.forEach(user => {
            const userElement = document.createElement("li");
            userElement.textContent = `${user.username}: ${user.pokecoins} Pokécoins`;
            rankingPokecoins.appendChild(userElement);
        });

        usersSection.style.display = "block";
    } else {
        usersSection.style.display = "none";
    }
}

// Fonction pour afficher la modal avec les détails de la carte
function showModal(card) {
    const modal = document.getElementById("card-modal");
    const modalImg = document.getElementById("modal-card-image");
    const modalName = document.getElementById("modal-card-name");

    modalImg.src = card.image;
    modalName.textContent = card.name;
    modal.style.display = "block";
}

// Fonction pour fermer la modal
function closeModal() {
    const modal = document.getElementById("card-modal");
    modal.style.display = "none";
}

// Ajout d'un événement de clic pour fermer la modal
document.querySelector(".close").addEventListener("click", closeModal);

// Ajout d'un événement de clic pour fermer la modal en cliquant en dehors du contenu
window.addEventListener("click", function(event) {
    const modal = document.getElementById("card-modal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

// Fonction pour sauvegarder la partie
function saveGame() {
    if (currentUser) {
        const gameData = {
            collection,
            pokecoins,
            boosterCount,
            commonCount,
            rareCount,
            ultraRareCount,
            playtime
        };
        localStorage.setItem(`pokemonGame_${currentUser}`, JSON.stringify(gameData));
    }
}

// Fonction pour charger la partie
function loadGame() {
    currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const savedGame = localStorage.getItem(`pokemonGame_${currentUser}`);
        if (savedGame) {
            const gameData = JSON.parse(savedGame);
                collection = gameData.collection || [];
            pokecoins = gameData.pokecoins || 0;
            boosterCount = gameData.boosterCount || 0;
            commonCount = gameData.commonCount || 0;
            rareCount = gameData.rareCount || 0;
            ultraRareCount = gameData.ultraRareCount || 0;
            playtime = gameData.playtime || 0;
            updateUI();
        } else {
            // Réinitialiser les variables si aucune sauvegarde n'est trouvée
            collection = [];
            pokecoins = 0;
            boosterCount = 0;
            commonCount = 0;
            rareCount = 0;
            ultraRareCount = 0;
            playtime = 0;
            updateUI();
        }
        // Démarrer le suivi du temps de jeu
        startPlaytimeTracking();
    } else {
        // Rediriger vers la page de connexion si aucun utilisateur n'est connecté
        window.location.href = 'login.html';
    }
}

// Fonction pour démarrer le suivi du temps de jeu
function startPlaytimeTracking() {
    playtimeInterval = setInterval(() => {
        playtime++;
        document.getElementById("playtime").textContent = Math.floor(playtime / 60) + " heures " + (playtime % 60) + " minutes";
        saveGame();
    }, 60000); // Incrémenter toutes les minutes
}

// Fonction pour arrêter le suivi du temps de jeu
function stopPlaytimeTracking() {
    clearInterval(playtimeInterval);
}

// Mettre à jour les valeurs de l'interface utilisateur
function updateUI() {
    document.getElementById("collection-count").textContent = collection.length;
    document.getElementById("pokecoin-count").textContent = `Pokécoins : ${pokecoins}`;
    document.getElementById("booster-count").textContent = boosterCount;
    document.getElementById("common-count").textContent = commonCount;
    document.getElementById("rare-count").textContent = rareCount;
    document.getElementById("ultra-rare-count").textContent = ultraRareCount;
    document.getElementById("playtime").textContent = Math.floor(playtime / 60) + " heures " + (playtime % 60) + " minutes";
}

// Charger la partie au démarrage
window.addEventListener('load', loadGame);
window.addEventListener('beforeunload', stopPlaytimeTracking);

// Gestion des boutons pour différents types de boosters
document.getElementById("open-free-booster").addEventListener("click", () => openBooster("free"));
document.getElementById("open-rare-booster").addEventListener("click", () => {
    if (pokecoins >= 500) {
        pokecoins -= 500;
        openBooster("rare");
    } else {
        alert("Vous n'avez pas assez de Pokécoins pour ouvrir un Booster Rare.");
    }
});
document.getElementById("open-legendary-booster").addEventListener("click", () => {
    if (pokecoins >= 2000) {
        pokecoins -= 2000;
        openBooster("legendary");
    } else {
        alert("Vous n'avez pas assez de Pokécoins pour ouvrir un Booster Légendaire.");
    }
});
document.getElementById("view-collection").addEventListener("click", toggleCollection);
document.getElementById("view-stats").addEventListener("click", toggleStats);
document.getElementById("view-users").addEventListener("click", toggleUsers);
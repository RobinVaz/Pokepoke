const cardsData = [
    { name: "Noeunoeuf", image: "images/noeunoeuf.PNG", rarity: "common" },
    { name: "Noeunoeuf V2", image: "images/noeunoeuf2.PNG", rarity: "common" },
    { name: "Lépidonille", image: "images/lépidonille.PNG", rarity: "common" },
    { name: "Noadkoko", image: "images/Noadkoko.PNG", rarity: "rare" },
    { name: "Fermite EX", image: "images/fermite ex.PNG", rarity: "ultra-rare" },
    { name: "Pérégrain", image: "images/peregrain.PNG", rarity: "common" },
    { name: "Prismillon", image: "images/prismillon.PNG", rarity: "rare" },
    { name: "Spododo", image: "images/spododo.PNG", rarity: "common" },
    { name: "Lampignon", image: "images/lampignon.PNG", rarity: "rare" },
    { name: "Sinistrail", image: "images/sinistrail.PNG", rarity: "rare" },
    { name: "Zarude", image: "images/zarude.PNG", rarity: "rare" },
    { name: "Pimito", image: "images/pimito.PNG", rarity: "common" },
    { name: "Léboulérou", image: "images/leboulerou.PNG", rarity: "common" },
    { name: "Bérasca", image: "images/bérasca.PNG", rarity: "common" },
    { name: "Chongjian", image: "images/chongjian.PNG", rarity: "rare" },
];

// Probabilités de rareté pour différents types de boosters
const boosterProbabilities = {
    free: {
        common: 0.8,
        rare: 0.199,
        "ultra-rare": 0.001,
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
let extraChance = 0; // Variable pour stocker l'amélioration de chance

// Fonction pour enregistrer les logs
function logAction(action) {
    const logEntry = `${new Date().toISOString()} - ${currentUser} - ${action}\n`;
    console.log(logEntry); // Afficher le log dans la console

    // Enregistrer le log dans localStorage
    let logs = localStorage.getItem('gameLogs') || '';
    logs += logEntry;
    localStorage.setItem('gameLogs', logs);
}

// Fonction pour tirer une carte aléatoire en respectant les probabilités du booster
function getRandomCard(boosterType) {
    const random = Math.random();
    let accumulatedProbability = 0;
    const probabilities = boosterProbabilities[boosterType];

    for (const rarity in probabilities) {
        accumulatedProbability += probabilities[rarity] * (1 + extraChance); // Appliquer l'amélioration de chance
        if (random <= accumulatedProbability) {
            const filteredCards = cardsData.filter(card => card.rarity === rarity);
            return filteredCards[Math.floor(Math.random() * filteredCards.length)];
        }
    }
}

// Fonction pour ouvrir un booster (5 cartes)
function openBooster(boosterType) {
    logAction(`Ouvrir un booster de type ${boosterType}`);
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
    }, 1000); // Durée de l'animation avant d'afficher les cartes
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
            logAction(`Carte en doublon : ${card.name} (${card.rarity})`);
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
            logAction(`Nouvelle carte ajoutée : ${card.name} (${card.rarity})`);
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
            const savedGame = JSON.parse(localStorage.getItem(`pokemonGame_${user.username}`));
            return {
                username: user.username,
                collectionSize: savedGame ? savedGame.collection.length : 0,
                boosterCount: savedGame ? savedGame.boosterCount : 0,
                pokecoins: savedGame ? savedGame.pokecoins : 0
            };
        });

        // Afficher la liste des utilisateurs
        users.forEach(user => {
            const userElement = document.createElement("li");
            userElement.innerHTML = `<i class="fas fa-user"></i> ${user.username}`;
            usersList.appendChild(userElement);
        });

        // Classement par nombre de cartes différentes
        userData.sort((a, b) => b.collectionSize - a.collectionSize);
        userData.forEach(user => {
            const userElement = document.createElement("li");
            userElement.innerHTML = `<i class="fas fa-user"></i> ${user.username}: ${user.collectionSize} cartes`;
            rankingCards.appendChild(userElement);
        });

        // Classement par nombre de boosters ouverts
        userData.sort((a, b) => b.boosterCount - a.boosterCount);
        userData.forEach(user => {
            const userElement = document.createElement("li");
            userElement.innerHTML = `<i class="fas fa-user"></i> ${user.username}: ${user.boosterCount} boosters`;
            rankingBoosters.appendChild(userElement);
        });

        // Classement par nombre de Pokécoins
        userData.sort((a, b) => b.pokecoins - a.pokecoins);
        userData.forEach(user => {
            const userElement = document.createElement("li");
            userElement.innerHTML = `<i class="fas fa-user"></i> ${user.username}: ${user.pokecoins} Pokécoins`;
            rankingPokecoins.appendChild(userElement);
        });

        // Ajouter des médailles aux classements
        addMedals(rankingCards);
        addMedals(rankingBoosters);
        addMedals(rankingPokecoins);

        usersSection.style.display = "block";
    } else {
        usersSection.style.display = "none";
    }
}

// Fonction pour ajouter des médailles aux classements
function addMedals(rankingList) {
    const medals = ['🥇', '🥈', '🥉'];
    rankingList.querySelectorAll('li').forEach((item, index) => {
        if (index < 3) {
            item.innerHTML = `${medals[index]} ${item.innerHTML}`;
        }
    });
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

// Fonction pour générer un checksum basé sur les données de jeu
function generateChecksum(data) {
    const jsonString = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < jsonString.length; i++) {
        const char = jsonString.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

// Fonction pour sauvegarder la partie avec Firebase
function saveGame() {
    if (currentUser) {
        const gameData = {
            collection,
            pokecoins,
            boosterCount,
            commonCount,
            rareCount,
            ultraRareCount,
            playtime,
            extraChance
        };
        firebase.database().ref('users/' + currentUser).set(gameData);
        logAction("Sauvegarde de la partie");
    }
}

// Fonction pour charger la partie avec Firebase
function loadGame() {
    currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        firebase.database().ref('users/' + currentUser).once('value').then((snapshot) => {
            const gameData = snapshot.val();
            if (gameData) {
                collection = gameData.collection || [];
                pokecoins = gameData.pokecoins || 0;
                boosterCount = gameData.boosterCount || 0;
                commonCount = gameData.commonCount || 0;
                rareCount = gameData.rareCount || 0;
                ultraRareCount = gameData.ultraRareCount || 0;
                playtime = gameData.playtime || 0;
                extraChance = gameData.extraChance || 0;
                updateUI();
            } else {
                resetGame();
            }
            startPlaytimeTracking();
            logAction("Chargement de la partie");
        });
    } else {
        window.location.href = 'login.html';
    }
}

// Fonction pour réinitialiser la partie
function resetGame() {
    collection = [];
    pokecoins = 0;
    boosterCount = 0;
    commonCount = 0;
    rareCount = 0;
    ultraRareCount = 0;
    playtime = 0;
    extraChance = 0;
    updateUI();
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

// Fonction pour acheter une amélioration
function buyUpgrade(upgrade) {
    if (upgrade === 'extraChance10' && pokecoins >= 10000) {
        pokecoins -= 10000;
        extraChance += 0.1; // Ajouter 10 % de chance en plus
        alert("Amélioration de 10 % de chance achetée avec succès !");
        logAction("Amélioration de 10 % de chance achetée");
    } else if (upgrade === 'extraChance20' && pokecoins >= 20000) {
        pokecoins -= 20000;
        extraChance += 0.2; // Ajouter 20 % de chance en plus
        alert("Amélioration de 20 % de chance achetée avec succès !");
        logAction("Amélioration de 20 % de chance achetée");
    } else {
        alert("Vous n'avez pas assez de Pokécoins pour acheter cette amélioration.");
    }
    updateUI();
    saveGame();
}

// Fonction pour tourner la roue de bonus quotidien
function spinWheel() {
    const wheel = document.getElementById("daily-bonus-wheel");
    const spinButton = document.getElementById("spin-button");
    const segments = [100, 200, 300, 400, 500, 600, 700, 1000, 10000]; // Ajuster les valeurs des segments
    const probabilities = [0.2, 0.2, 0.2, 0.2, 0.2, 0.1, 0.1, 0.05, 0.01]; // Probabilités ajustées
    const random = Math.random();
    let accumulatedProbability = 0;
    let selectedIndex = 0;

    for (let i = 0; i < probabilities.length; i++) {
        accumulatedProbability += probabilities[i];
        if (random <= accumulatedProbability) {
            selectedIndex = i;
            break;
        }
    }

    const degrees = selectedIndex * 40 + 360 * 3; // Ajuster l'angle du segment

    // Réinitialiser la rotation avant de commencer une nouvelle animation
    wheel.style.transition = "none";
    wheel.style.transform = "rotate(0deg)";

    // Forcer le reflow pour appliquer la réinitialisation
    wheel.offsetHeight;

    // Appliquer la nouvelle rotation avec animation
    wheel.style.transition = "transform 4s ease-out";
    wheel.style.transform = `rotate(${degrees}deg)`;

    spinButton.disabled = true; // Désactiver le bouton pendant le spin

    setTimeout(() => {
        const bonus = segments[selectedIndex];
        pokecoins += bonus;
        alert(`Félicitations ! Vous avez gagné ${bonus} Pokécoins.`);
        logAction(`Gagné ${bonus} Pokécoins avec la roue de bonus quotidien`);
        updateUI();
        saveGame();
        spinButton.disabled = false; // Réactiver le bouton après le spin
    }, 1000); // Durée de l'animation
}

// Fonction pour réclamer le bonus quotidien
function claimDailyBonus() {
    const dailyBonusButton = document.getElementById("daily-bonus-button");
    const dailyBonusMessage = document.getElementById("daily-bonus-message");
    const bonusAmounts = [100, 200, 300, 400, 500];
    const randomBonus = bonusAmounts[Math.floor(Math.random() * bonusAmounts.length)];

    pokecoins += randomBonus;
    dailyBonusMessage.textContent = `Félicitations ! Vous avez gagné ${randomBonus} Pokécoins.`;
    logAction(`Réclamé ${randomBonus} Pokécoins avec le bonus quotidien`);
    updateUI();
    saveGame();

    // Désactiver le bouton après avoir réclamé le bonus
    dailyBonusButton.disabled = true;
    dailyBonusButton.textContent = "Bonus réclamé";
}

// Fonction pour réclamer un bonus basé sur le temps de jeu
function claimTimeBasedBonus(minutes) {
    const bonusAmounts = {
        1: 100,
        5: 200,
        10: 300,
        30: 400,
        60: 500
    };

    const claimedBonuses = JSON.parse(localStorage.getItem('claimedBonuses')) || {};

    if (claimedBonuses[minutes]) {
        alert(`Vous avez déjà réclamé le bonus pour ${minutes} minutes de jeu.`);
        return;
    }

    if (playtime >= minutes) {
        pokecoins += bonusAmounts[minutes];
        alert(`Félicitations ! Vous avez gagné ${bonusAmounts[minutes]} Pokécoins.`);
        logAction(`Réclamé ${bonusAmounts[minutes]} Pokécoins pour ${minutes} minutes de jeu`);
        document.getElementById(`bonus-${minutes}min`).disabled = true;
        claimedBonuses[minutes] = true;
        localStorage.setItem('claimedBonuses', JSON.stringify(claimedBonuses));
        updateUI();
        saveGame();
    } else {
        alert(`Vous devez jouer pendant au moins ${minutes} minutes pour réclamer ce bonus.`);
    }
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

    const claimedBonuses = JSON.parse(localStorage.getItem('claimedBonuses')) || {};

    // Activer/désactiver les boutons de bonus en fonction du temps de jeu et des bonus déjà réclamés
    document.getElementById("bonus-1min").disabled = playtime < 1 || claimedBonuses[1];
    document.getElementById("bonus-5min").disabled = playtime < 5 || claimedBonuses[5];
    document.getElementById("bonus-10min").disabled = playtime < 10 || claimedBonuses[10];
    document.getElementById("bonus-30min").disabled = playtime < 30 || claimedBonuses[30];
    document.getElementById("bonus-60min").disabled = playtime < 60 || claimedBonuses[60];
}

// Charger la partie au démarrage
window.addEventListener('load', loadGame);
window.addEventListener('beforeunload', stopPlaytimeTracking);

// Fonction pour créer un compte utilisateur avec Firebase
function signup(username, password, email) {
    const usersRef = firebase.database().ref('users');
    usersRef.orderByChild('username').equalTo(username).once('value', (snapshot) => {
        if (snapshot.exists()) {
            alert('Nom d\'utilisateur déjà utilisé.');
        } else {
            usersRef.orderByChild('email').equalTo(email).once('value', (snapshot) => {
                if (snapshot.exists()) {
                    alert('Adresse e-mail déjà utilisée.');
                } else {
                    const newUser = {
                        username,
                        password,
                        email,
                        collection: [],
                        pokecoins: 0,
                        boosterCount: 0,
                        commonCount: 0,
                        rareCount: 0,
                        ultraRareCount: 0,
                        playtime: 0,
                        extraChance: 0
                    };
                    usersRef.child(username).set(newUser);
                    alert('Inscription réussie.');
                }
            });
        }
    });
}

// Fonction pour se connecter avec Firebase
function login(username, password) {
    const usersRef = firebase.database().ref('users');
    usersRef.child(username).once('value', (snapshot) => {
        const user = snapshot.val();
        if (user && user.password === password) {
            localStorage.setItem('currentUser', username);
            window.location.href = 'index.html';
        } else {
            alert('Nom d\'utilisateur ou mot de passe incorrect.');
        }
    });
}

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
    if (pokecoins >= 1000) {
        pokecoins -= 1000;
        openBooster("legendary");
    } else {
        alert("Vous n'avez pas assez de Pokécoins pour ouvrir un Booster Légendaire.");
    }
});
document.getElementById("view-collection").addEventListener("click", toggleCollection);
document.getElementById("view-stats").addEventListener("click", toggleStats);
document.getElementById("view-users").addEventListener("click", toggleUsers);
document.getElementById("view-shop").addEventListener("click", () => {
    const shopSection = document.getElementById("shop-section");
    shopSection.style.display = shopSection.style.display === "none" ? "block" : "none";
});
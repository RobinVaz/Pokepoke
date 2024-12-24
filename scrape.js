const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const url = 'https://www.pokecardex.com/series/SSP#galery-1';
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    let pokemons = [];
    let hasNextPage = true;
    let pageIndex = 1;

    while (hasNextPage) {
        const newPokemons = await page.evaluate(() => {
            const cards = Array.from(document.querySelectorAll('.card'));
            return cards.map(card => {
                const name = card.querySelector('.card-name').innerText;
                const image = card.querySelector('img').src;
                const description = 'Un Pokémon de type inconnu.'; // Update this if you have specific descriptions
                return { name, image, description };
            });
        });

        pokemons = pokemons.concat(newPokemons);

        // Check if there is a next page
        hasNextPage = await page.evaluate(() => {
            const nextButton = document.querySelector('.pagination-next');
            return nextButton && !nextButton.classList.contains('disabled');
        });

        if (hasNextPage) {
            pageIndex++;
            await page.goto(`https://www.pokecardex.com/series/SSP#galery-${pageIndex}`);
        }
    }

    fs.writeFileSync('pokemons.json', JSON.stringify(pokemons, null, 2));
    await browser.close();
})();

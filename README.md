# PokePoke

PokePoke is a web-based Pokémon card collection game where users can open booster packs, collect cards, and view their collection. The game features cards from different editions and allows users to search and filter their collected cards.

## Features

- Open booster packs from different editions (SSP, SCR)
- Collect Pokémon cards with varying rarities (common, rare, ultra-rare, gold)
- View and search through your collected cards
- Modal view for detailed card information
- Reset your collection
- Track the number of boosters opened and total playtime

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, etc.)
- Node.js and npm installed on your machine

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/pokepoke.git
    cd pokepoke
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Run the scraper to fetch Pokémon card data:
    ```bash
    node scrape.js
    ```

4. Open the `index.html` file in your web browser to start the game.

## Usage

- Click on "Ouvrir un Booster SSP" or "Ouvrir un Booster SCR" to open a booster pack and collect cards.
- Use the search bar to filter your collected cards by name.
- Click on a card to view more details in a modal.
- Click "Réinitialiser la Collection" to reset your collection.
- Click on the profile image to view your statistics, including the number of boosters opened and total playtime.

## Project Structure

- `index.html`: The main HTML file for the game.
- `styles.css`: The CSS file for styling the game.
- `script.js`: The JavaScript file containing the game logic.
- `scrape.js`: The script to scrape Pokémon card data from the web.
- `pokemons.json`: The JSON file containing the scraped Pokémon card data.
- `stats.html`: The HTML file for displaying user statistics.
- `stats.js`: The JavaScript file for handling the statistics page.

## Troubleshooting

If you encounter any issues, try the following steps:

1. Ensure you have the latest version of Node.js and npm installed.
2. Verify that you have an active internet connection when running the scraper.
3. Check the console for any error messages and address them accordingly.
4. If the problem persists, feel free to open an issue on the GitHub repository.

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes. Make sure to follow the project's coding standards and include appropriate tests for your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Pokémon and Pokémon character names are trademarks of Nintendo.
- Card images and data are sourced from [Pokecardex](https://www.pokecardex.com/).
- Special thanks to the contributors and the open-source community for their support.

## Future Enhancements

- Add more editions and cards to the game.
- Implement user authentication to save collections online.
- Add a trading feature to allow users to trade cards with each other.
- Enhance the UI/UX with animations and better design.

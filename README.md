# PokePoke

PokePoke is a web-based Pokémon card collection game where users can open booster packs, collect cards, and view their collection. The game features cards from different editions and allows users to search and filter their collected cards.

## Features

- Open booster packs from different editions (SSP, SCR)
- Collect Pokémon cards with varying rarities (common, rare, ultra-rare, gold)
- View and search through your collected cards
- Modal view for detailed card information
- Reset your collection

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

## Project Structure

- `index.html`: The main HTML file for the game.
- `styles.css`: The CSS file for styling the game.
- `script.js`: The JavaScript file containing the game logic.
- `scrape.js`: The script to scrape Pokémon card data from the web.
- `pokemons.json`: The JSON file containing the scraped Pokémon card data.

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Pokémon and Pokémon character names are trademarks of Nintendo.
- Card images and data are sourced from [Pokecardex](https://www.pokecardex.com/).

const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Initialize SQLite database
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run("CREATE TABLE users (username TEXT PRIMARY KEY, password TEXT, email TEXT)");
    db.run("INSERT INTO users (username, password, email) VALUES ('user1', 'password1', 'user1@example.com')");
    db.run("INSERT INTO users (username, password, email) VALUES ('user2', 'password2', 'user2@example.com')");
});

// Function to log actions to a file
function logToFile(message) {
    const logDir = path.join(__dirname, 'export-users');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
    }
    const logFilePath = path.join(logDir, 'server.log');
    const logEntry = `${new Date().toISOString()} - ${message}\n`;
    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) {
            console.error('Erreur lors de l\'écriture du log :', err);
        }
    });
}

// Function to export user data to a file
function exportUserData(username) {
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err) {
            logToFile(`Erreur lors de la récupération des informations utilisateur : ${err.message}`);
        } else if (user) {
            const userData = `Username: ${user.username}, Email: ${user.email}, Password: ${user.password}\n`;
            const exportDir = path.join(__dirname, 'export-users');
            if (!fs.existsSync(exportDir)) {
                fs.mkdirSync(exportDir);
            }
            const filePath = path.join(exportDir, `${user.username}.txt`);
            fs.writeFile(filePath, userData, (err) => {
                if (err) {
                    logToFile(`Erreur lors de l'écriture du fichier : ${err.message}`);
                } else {
                    logToFile(`Données de l'utilisateur ${user.username} exportées avec succès.`);
                }
            });
        }
    });
}

app.post('/send-password', (req, res) => {
    const { email } = req.body;
    logToFile(`Requête reçue pour l'e-mail : ${email}`);
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
        if (err) {
            logToFile(`Erreur lors de la récupération des informations utilisateur : ${err.message}`);
            res.status(500).send('Erreur lors de la récupération des informations utilisateur.');
        } else if (user) {
            logToFile(`Utilisateur trouvé : ${user.username}`);
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'your-email@gmail.com',
                    pass: 'your-email-password'
                }
            });

            const mailOptions = {
                from: 'your-email@gmail.com',
                to: email,
                subject: 'Votre mot de passe Pokepoke',
                text: `Votre mot de passe est : ${user.password}`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    logToFile(`Erreur lors de l'envoi de l'e-mail : ${error}`);
                    res.status(500).send('Erreur lors de l\'envoi de l\'e-mail.');
                } else {
                    logToFile(`E-mail envoyé : ${info.response}`);
                    res.status(200).send('E-mail envoyé avec succès.');
                }
            });
        } else {
            logToFile('Aucun utilisateur trouvé avec cette adresse e-mail.');
            res.status(404).send('Aucun utilisateur trouvé avec cette adresse e-mail.');
        }
    });
});

app.post('/signup', (req, res) => {
    const { username, password, email } = req.body;
    logToFile(`Requête d'inscription reçue : ${username}, ${email}, ${password}`);
    console.log(`Requête d'inscription reçue : ${username}, ${email}, ${password}`);
    db.get("SELECT * FROM users WHERE username = ? OR email = ?", [username, email], (err, user) => {
        if (err) {
            logToFile(`Erreur lors de la vérification des informations utilisateur : ${err.message}`);
            res.status(500).send('Erreur lors de la vérification des informations utilisateur.');
        } else if (user) {
            res.status(400).send('Nom d\'utilisateur ou adresse e-mail déjà utilisé.');
        } else {
            db.run("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", [username, password, email], (err) => {
                if (err) {
                    logToFile(`Erreur lors de l'inscription : ${err.message}`);
                    res.status(500).send('Erreur lors de l\'inscription.');
                } else {
                    exportUserData(username);
                    res.status(200).send('Inscription réussie.');
                }
            });
        }
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    logToFile(`Requête de connexion reçue : ${username}, ${password}`);
    console.log(`Requête de connexion reçue : ${username}, ${password}`);
    db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, user) => {
        if (err) {
            logToFile(`Erreur lors de la connexion : ${err.message}`);
            res.status(500).send('Erreur lors de la connexion.');
        } else if (user) {
            exportUserData(username);
            res.status(200).send('Connexion réussie.');
        } else {
            res.status(404).send('Nom d\'utilisateur ou mot de passe incorrect.');
        }
    });
});

app.listen(port, () => {
    logToFile(`Serveur en cours d'exécution sur le port ${port}`);
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
});

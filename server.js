const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

let users = [
    { username: 'user1', password: 'password1', email: 'user1@example.com' },
    { username: 'user2', password: 'password2', email: 'user2@example.com' }
];

app.post('/send-password', (req, res) => {
    const { email } = req.body;
    console.log(`Requête reçue pour l'e-mail : ${email}`);
    const user = users.find(user => user.email === email);

    if (user) {
        console.log(`Utilisateur trouvé : ${user.username}`);
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
                console.log(`Erreur lors de l'envoi de l'e-mail : ${error}`);
                res.status(500).send('Erreur lors de l\'envoi de l\'e-mail.');
            } else {
                console.log(`E-mail envoyé : ${info.response}`);
                res.status(200).send('E-mail envoyé avec succès.');
            }
        });
    } else {
        console.log('Aucun utilisateur trouvé avec cette adresse e-mail.');
        res.status(404).send('Aucun utilisateur trouvé avec cette adresse e-mail.');
    }
});

app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
});

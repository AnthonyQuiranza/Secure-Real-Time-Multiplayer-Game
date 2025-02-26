require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const socket = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const nocache = require('nocache');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

// Definimos Collectible
function Collectible({ x, y, value, id }) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.id = id;
    this.radius = 5;
}

const app = express();

// Aplicar nocache primero para todas las rutas
app.use(nocache());

// Configuración de seguridad con Helmet
app.use(helmet({
    hidePoweredBy: { setTo: 'PHP 7.4.3' },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'"]
        }
    },
    xssFilter: true
}));

// Servir archivos estáticos con opciones de no-cache
app.use('/public', express.static(process.cwd() + '/public', {
    setHeaders: (res) => {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
    }
}));
app.use('/assets', express.static(process.cwd() + '/assets', {
    setHeaders: (res) => {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
    }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: '*' }));

app.route('/')
    .get(function (req, res) {
        res.sendFile(process.cwd() + '/views/index.html');
    });

fccTestingRoutes(app);

app.use(function (req, res, next) {
    res.status(404)
        .type('text')
        .send('Not Found');
});

const portNum = process.env.PORT || 3000;

const players = {};
const collectibles = {};
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

const server = app.listen(portNum, () => {
    console.log(`Listening on port ${portNum}`);
    if (process.env.NODE_ENV === 'test') {
        console.log('Running Tests...');
        setTimeout(function () {
            try {
                runner.run();
            } catch (error) {
                console.log('Tests are not valid:');
                console.error(error);
            }
        }, 1500);
    }
});

const io = socket(server);

function generateCollectible() {
    const id = Math.random().toString(36).substr(2, 9);
    const collectible = new Collectible({
        x: Math.floor(Math.random() * (CANVAS_WIDTH - 20)),
        y: Math.floor(Math.random() * (CANVAS_HEIGHT - 20)),
        value: 10,
        id: id
    });
    collectibles[id] = collectible;
    io.emit('collectibleGenerated', collectible);
}

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    const player = {
        id: socket.id,
        x: Math.floor(Math.random() * (CANVAS_WIDTH - 20)),
        y: Math.floor(Math.random() * (CANVAS_HEIGHT - 20)),
        score: 0
    };
    players[socket.id] = player;

    socket.emit('init', { playerId: socket.id, players, collectibles });
    io.emit('playerUpdate', players);

    if (Object.keys(collectibles).length === 0) {
        generateCollectible();
    }

    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            io.emit('playerUpdate', players);
        }
    });

    socket.on('collect', (collectibleId) => {
        if (collectibles[collectibleId]) {
            players[socket.id].score += collectibles[collectibleId].value;
            delete collectibles[collectibleId];
            io.emit('collectibleCollected', collectibleId);
            io.emit('playerUpdate', players);
            generateCollectible();
        }
    });

    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        delete players[socket.id];
        io.emit('playerUpdate', players);
    });
});

module.exports = app;
import Player from './Player.mjs';
import Collectible from './Collectible.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

canvas.width = 600;
canvas.height = 400;

let localPlayer;
const players = {};
const collectibles = {};
const SPEED = 5;

socket.on('init', ({ playerId, players: serverPlayers, collectibles: serverCollectibles }) => {
    localPlayer = new Player(serverPlayers[playerId]);
    Object.keys(serverPlayers).forEach(id => {
        players[id] = new Player(serverPlayers[id]);
    });
    Object.keys(serverCollectibles).forEach(id => {
        collectibles[id] = new Collectible(serverCollectibles[id]);
    });
});

socket.on('playerUpdate', (serverPlayers) => {
    Object.keys(serverPlayers).forEach(id => {
        if (id === socket.id) {
            localPlayer.x = serverPlayers[id].x;
            localPlayer.y = serverPlayers[id].y;
            localPlayer.score = serverPlayers[id].score;
        }
        players[id] = new Player(serverPlayers[id]);
    });
    Object.keys(players).forEach(id => {
        if (!serverPlayers[id]) delete players[id];
    });
});

socket.on('collectibleGenerated', (item) => {
    collectibles[item.id] = new Collectible(item);
});

socket.on('collectibleCollected', (id) => {
    delete collectibles[id];
});

// Movimiento
document.addEventListener('keydown', (e) => {
    if (!localPlayer) return;
    let moved = false;
    switch (e.key) {
        case 'w': case 'ArrowUp':
            localPlayer.movePlayer('up', SPEED);
            moved = true;
            break;
        case 's': case 'ArrowDown':
            localPlayer.movePlayer('down', SPEED);
            moved = true;
            break;
        case 'a': case 'ArrowLeft':
            localPlayer.movePlayer('left', SPEED);
            moved = true;
            break;
        case 'd': case 'ArrowRight':
            localPlayer.movePlayer('right', SPEED);
            moved = true;
            break;
    }
    if (moved) {
        socket.emit('move', { x: localPlayer.x, y: localPlayer.y });
        checkCollisions();
    }
});

function checkCollisions() {
    Object.values(collectibles).forEach(item => {
        if (localPlayer.collision(item)) {
            socket.emit('collect', item.id);
        }
    });
}

// Renderizado
function gameLoop() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar jugadores
    Object.values(players).forEach(player => {
        context.fillStyle = player.id === socket.id ? 'blue' : 'gray';
        context.beginPath();
        context.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = 'black';
        context.fillText(`Score: ${player.score}`, player.x - 20, player.y - 20);
        context.fillText(player.calculateRank(Object.values(players)), player.x - 20, player.y - 30);
    });

    // Dibujar collectibles
    Object.values(collectibles).forEach(item => {
        context.fillStyle = 'gold';
        context.beginPath();
        context.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
        context.fill();
    });

    requestAnimationFrame(gameLoop);
}

gameLoop();
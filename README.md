# CHALLENGE FREECODECAMP

![Estado del Proyecto](https://img.shields.io/badge/Estado-Completado-green.svg)  
![Lenguaje](https://img.shields.io/badge/Lenguaje-JavaScript-yellow.svg)  
![Tecnologías](https://img.shields.io/badge/Tecnologías-Node.js%20|%20Socket.io-blue.svg)

## Descripción

Este proyecto es una solución al reto "Secure Real Time Multiplayer Game" de freeCodeCamp. Se trata de un juego 2D multijugador en tiempo real desarrollado con la API de Canvas de HTML y Socket.io. Los jugadores pueden mover sus avatares, recolectar ítems y ver su clasificación basada en puntajes, todo mientras se implementan medidas de seguridad estrictas.

El juego es funcionalmente similar al ejemplo de freeCodeCamp: https://secure-real-time-multiplayer-game.freecodecamp.rocks/

## Características

- Conexión de múltiples jugadores en tiempo real.
- Cada jugador tiene un avatar representado por un círculo.
- ítems recolectables que aumentan el puntaje al colisionar.
- Movimiento con teclas WASD o flechas.
- Clasificación dinámica basada en puntajes.
- Seguridad: protección contra XSS, ocultamiento de MIME types, sin caché en el cliente, y cabeceras falsas de PHP 7.4.3.

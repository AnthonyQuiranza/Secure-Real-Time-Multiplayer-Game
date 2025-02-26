class Player {
  constructor({ x, y, score, id }) {
      this.x = x;
      this.y = y;
      this.score = score;
      this.id = id;
      this.radius = 10; // Para colisiones y renderizado
  }

  movePlayer(dir, speed) {
      switch (dir) {
          case 'up':
              this.y = Math.max(this.radius, this.y - speed);
              break;
          case 'down':
              this.y = Math.min(400 - this.radius, this.y + speed);
              break;
          case 'left':
              this.x = Math.max(this.radius, this.x - speed);
              break;
          case 'right':
              this.x = Math.min(600 - this.radius, this.x + speed);
              break;
      }
  }

  collision(item) {
      const dx = this.x - item.x;
      const dy = this.y - item.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < this.radius + 5; // 5 es el radio del collectible
  }

  calculateRank(arr) {
      const sortedPlayers = arr.sort((a, b) => b.score - a.score);
      const totalPlayers = sortedPlayers.length;
      const rank = sortedPlayers.findIndex(p => p.id === this.id) + 1;
      return `Rank: ${rank}/${totalPlayers}`;
  }
}

export default Player;
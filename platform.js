class Platform {
  constructor(x, y, type = 'normal') {
    this.position = createVector(x, y);
    this.width = 80;
    this.height = 18;
    this.type = type; // 'normal', 'moving', 'breakable'
    this.broken = false;
    this.direction = random() > 0.5 ? 1 : -1;
    this.speed = 2;
    this.originalX = x; // Moving platform
    this.moveRange = 100; // Moving areas
  }

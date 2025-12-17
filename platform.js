class Platform {
  constructor(x, y, type = 'normal') {
    this.position = createVector(x, y);
    this.width = 80;
    this.height = 18;
    this.type = type; // 'normal', 'moving', 'breakable'
    this.broken = false;
    this.direction = random() > 0.5 ? 1 : -1;
    this.speed = 2;
    this.originalX = x; // Cho moving platform - Moving platform
    this.moveRange = 100; // Phạm vi di chuyển - Moving areas
  }
  
  update() {
    if (this.type === 'moving') {
      // Di chuyển qua lại
      this.position.x += this.speed * this.direction;

      // Đảo chiều khi đến giới hạn
      if (abs(this.position.x - this.originalX) > this.moveRange) {
        this.direction *= -1;
      }
    }
  }

   show() {
    if (this.broken) {
      // Animation broken (vẫn giữ code vẽ)
      push();
      translate(this.position.x + this.width/2, this.position.y + this.height/2);
      rotate(frameCount * 0.1);
      fill(139, 69, 19, 150);
      rect(-this.width/2, -this.height/2, this.width/2, this.height/2, 3);
      rect(0, 0, this.width/2, this.height/2, 3);
      pop();
      return;
    }

    push();
    
    // ===================================
    // BƯỚC 3: THAY ẢNH PLATFORM TẠI ĐÂY
    // ===================================
    let img;
    switch (this.type) {
        case 'moving':
            img = platformMovingImg;
            break;
        case 'breakable':
            img = platformBreakableImg;
            break;
        case 'normal':
        default:
            img = platformNormalImg;
            break;
    }

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
      
      // Giữ trong màn hình
      if (this.position.x < 0) {
        this.position.x = 0;
        this.direction = 1;
      } else if (this.position.x + this.width > width) {
        this.position.x = width - this.width;
        this.direction = -1;
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

     if (img) {
        // Nếu hình ảnh đã được tải (img), vẽ hình ảnh đó.
        image(img, this.position.x, this.position.y, this.width, this.height);
    } else {
      // Nếu chưa tải, vẫn dùng hình vẽ bằng code cũ
      
      // Vẽ theo loại platform
      if (this.type === 'normal') {
        // Platform xanh lá với gradient
        let c1 = color(100, 220, 100);
        let c2 = color(70, 180, 70);
        
        for (let i = 0; i < this.height; i++) {
          let inter = map(i, 0, this.height, 0, 1);
          stroke(lerpColor(c1, c2, inter));
          line(this.position.x, this.position.y + i, 
               this.position.x + this.width, this.position.y + i);
        }

        // Viền trắng phía trên
        stroke(255, 255, 255, 200);
        strokeWeight(2);
        noFill();
        line(this.position.x + 5, this.position.y + 2, 
             this.position.x + this.width - 5, this.position.y + 2);
        
        // Bo góc
        noStroke();
        fill(100, 220, 100);
        rect(this.position.x, this.position.y, this.width, this.height, 8);

         
      } else if (this.type === 'moving') {
        // Platform xanh dương chuyển động
        let c1 = color(100, 200, 255);
        let c2 = color(50, 150, 255);

        for (let i = 0; i < this.height; i++) {
          let inter = map(i, 0, this.height, 0, 1);
          stroke(lerpColor(c1, c2, inter));
          line(this.position.x, this.position.y + i, 
               this.position.x + this.width, this.position.y + i);
        }
   
        // Hiệu ứng di chuyển (mũi tên)
        noStroke();
        fill(255, 255, 255, 150);
        let arrowX = this.position.x + this.width/2;
        let arrowY = this.position.y + this.height/2;
        triangle(arrowX - 5 * this.direction, arrowY, 
                 arrowX + 10 * this.direction, arrowY,
                 arrowX + 2 * this.direction, arrowY - 4);
        triangle(arrowX - 5 * this.direction, arrowY, 
                 arrowX + 10 * this.direction, arrowY,
                 arrowX + 2 * this.direction, arrowY + 4);

      } else if (this.type === 'breakable') {
        // Platform nâu vỡ được
        fill(139, 69, 19);
        stroke(101, 50, 13);
        strokeWeight(2);
        rect(this.position.x, this.position.y, this.width, this.height, 5);
        
        // Vân gỗ
        noStroke();
        fill(160, 82, 45, 150);
        for (let i = 0; i < 4; i++) {
          let lineX = this.position.x + (i + 1) * this.width / 5;
          rect(lineX, this.position.y, 2, this.height);
        }
        
        // Nứt (để biết nó dễ vỡ)
        stroke(80, 40, 10);
        strokeWeight(1.5);
        line(this.position.x + this.width/2 - 5, this.position.y,
             this.position.x + this.width/2 + 5, this.position.y + this.height);
        line(this.position.x + this.width/3, this.position.y + 5,
             this.position.x + this.width/3 + 10, this.position.y + this.height - 5);
      }
    }
    
    pop();
  }
}

// ========== SPRING CLASS ==========
class Spring {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.width = 25;
    this.height = 30;
    this.used = false;
    this.compression = 0; // Animation nén lò xo
  }

  show() {
    if (this.used && this.compression <= 0) return;
    
    push();
    translate(this.position.x, this.position.y);
    
    // Nén lò xo khi dùng
    if (this.used) {
      this.compression = max(0, this.compression - 0.15);
    }

      // Đế lò xo
      fill(200, 50, 50);
      stroke(150, 30, 30);
      strokeWeight(2);
      rect(0, 25 - this.compression * 10, this.width, 5, 2);
      
      // Lò xo (zigzag)
      noFill();
      stroke(255, 200, 50);
      strokeWeight(3);
      beginShape();
      let segments = 6;
      for (let i = 0; i <= segments; i++) {
        let x = (i % 2 === 0) ? 5 : 20;
        let y = map(i, 0, segments, 0, 20 - this.compression * 10);
        vertex(x, y);
      }
      endShape();

      // Đỉnh lò xo
      fill(255, 200, 50);
      noStroke();
      ellipse(12.5, -2, 12, 8);
  
      // Hiệu ứng sáng khi chưa dùng
      if (!this.used) {
          fill(255, 255, 100, 100 + sin(frameCount * 0.1) * 50);
          ellipse(12.5, 12, 30, 30);
        }

    
      pop();
  }

  collidesWith(doodle) {
    if (this.used) return false;
    
    return doodle.position.x + doodle.width > this.position.x &&
           doodle.position.x < this.position.x + this.width &&
           doodle.position.y + doodle.height > this.position.y &&
           doodle.position.y < this.position.y + this.height;
  }
}

// ========== MONSTER CLASS ==========
class Monster {
 constructor(x, y) {
    this.position = createVector(x, y);
    this.width = 45;
    this.height = 45;
    this.angle = 0; // Cho animation
    this.offsetY = 0; // Bay lên xuống
  }

  update() {
    this.angle += 0.1;
    this.offsetY = sin(this.angle) * 5;
  }
  
  show() {
    push();
    translate(this.position.x + this.width/2, this.position.y + this.height/2 + this.offsetY);

    
      // Thân quái vật (tím)
      fill(150, 80, 200);
      stroke(120, 50, 170);
      strokeWeight(2);
      ellipse(0, 0, this.width, this.height);

      // Sừng
      fill(180, 100, 220);
      triangle(-10, -20, -15, -30, -5, -20);
      triangle(10, -20, 15, -30, 5, -20);

      // Đồng tử
      fill(0);
      ellipse(-10, -3, 6, 8);
      ellipse(10, -3, 6, 8);

      // Miệng (răng nanh)
      fill(50);
      arc(0, 5, 20, 15, 0, PI);
      
      fill(255);
      triangle(-8, 5, -5, 15, -2, 5);
      triangle(2, 5, 5, 15, 8, 5);

      // Hiệu ứng nguy hiểm
      noFill();
      stroke(255, 50, 50, 100);
      strokeWeight(2);
      ellipse(0, 0, this.width + sin(frameCount * 0.2) * 5, this.height + sin(frameCount * 0.2) * 5);
  
    pop();
  }
  
  collidesWith(doodle) {
    let distance = dist(
      doodle.position.x + doodle.width / 2,
      doodle.position.y + doodle.height / 2,
      this.position.x + this.width/2,
      this.position.y + this.height/2 + this.offsetY
    );

    return distance < (this.width + doodle.width) / 2.5;
  }
}

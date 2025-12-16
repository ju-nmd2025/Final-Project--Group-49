class Doodle {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.width = 50;
    this.height = 50;
    this.jumpVelocity = -13;
    this.superJumpVelocity = -22;
    this.facing = 'right'; // Hướng nhìn
    this.bounceAnimation = 0; // Animation cho nhảy
  }
  
  update() {
    // Áp dụng trọng lực
    this.velocity.y += gravity;
    this.position.add(this.velocity);
    
    // Giới hạn tốc độ rơi tối đa
    if (this.velocity.y > 20) {
      this.velocity.y = 20;
    }
    
    // Teleport qua biên trái/phải
    if (this.position.x + this.width < 0) {
      this.position.x = width;
    } else if (this.position.x > width) {
      this.position.x = -this.width;
    }
    
    // Cập nhật hướng nhìn
    if (this.velocity.x < -0.5) {
      this.facing = 'left';
    } else if (this.velocity.x > 0.5) {
      this.facing = 'right';
    }
    
    // Animation bounce
    if (this.bounceAnimation > 0) {
      this.bounceAnimation -= 0.1;
    }
  }
  
  // HÀM HIỂN THỊ CHÍNH (Dùng khi đang chơi)
  show() {
    push();
    translate(this.position.x + this.width/2, this.position.y + this.height/2);
    
    // Flip nếu quay trái
    if (this.facing === 'left') {
      scale(-1, 1);
    }
    
    // Bounce effect
    let bounceScale = 1 + this.bounceAnimation * 0.2;
    scale(bounceScale, 1 / bounceScale);
    
    // ===================================
    // BƯỚC 2: THAY ẢNH NHÂN VẬT CHÍNH TẠI ĐÂY
    // ===================================
    if (doodleImg) {
      // Nếu hình ảnh đã được tải (doodleImg), vẽ hình ảnh đó.
      image(doodleImg, -this.width/2, -this.height/2, this.width, this.height);
    } else { // VẼ NHÂN VẬT Ở ĐÂY NÈ
      
      
      // Vẽ thân (hình oval)
      fill(100, 200, 255);
      stroke(70, 170, 225);
      strokeWeight(2);
      ellipse(0, 5, 45, 55);
      
      // Vẽ chân
      noFill();
      stroke(100, 200, 255);
      strokeWeight(5);
      line(-8, 25, -12, 35); // Chân trái
      line(8, 25, 12, 35);  // Chân phải
      
      // Vẽ tay
      strokeWeight(4);
      line(-15, 0, -22, -5); // Tay trái
      line(15, 0, 22, -5);   // Tay phải
      
      noStroke();
      
      // Vẽ mắt
      fill(255);
      ellipse(-10, -5, 12, 14);
      ellipse(10, -5, 12, 14);
      
      // Đồng tử (nhìn theo hướng di chuyển)
      fill(0);
      let eyeOffsetX = 0;
      if (this.velocity.x > 1) eyeOffsetX = 2;
      if (this.velocity.x < -1) eyeOffsetX = -2;
      
      ellipse(-10 + eyeOffsetX, -5, 5, 7);
      ellipse(10 + eyeOffsetX, -5, 5, 7);
      
      // Vẽ mũi
      fill(255, 150, 100);
      triangle(12, -2, 18, 2, 12, 5);
      
      // Vẽ miệng (cười khi nhảy lên)
      noFill();
      stroke(0);
      strokeWeight(2);
      if (this.velocity.y < 0) {
        arc(0, 5, 18, 12, 0, PI);
      } else {
        arc(0, 5, 18, 8, 0, PI);
      }
      
      // Vẽ lông mày
      noFill();
      stroke(70, 170, 225);
      strokeWeight(2);
      arc(-10, -12, 8, 4, PI, TWO_PI);
      arc(10, -12, 8, 4, PI, TWO_PI);
    }
    
    pop();
  }
  
  // HÀM HIỂN THỊ TĨNH (Dùng trong Menu)
  showStatic(x, y, scaleFactor = 1) {
    push();
    translate(x, y);
    scale(scaleFactor);
    
    if (doodleImg) {
        // Nếu có ảnh, vẽ ảnh tĩnh
        image(doodleImg, -this.width/2, -this.height/2, this.width, this.height);
    } else {
        // Dùng hình vẽ bằng code tĩnh
        // Vẽ thân (hình oval)
        fill(100, 200, 255);
        stroke(70, 170, 225);
        strokeWeight(2);
        ellipse(0, 5, 45, 55);
        
        // Vẽ chân
        noFill();
        stroke(100, 200, 255);
        strokeWeight(5);
        line(-8, 25, -12, 35); 
        line(8, 25, 12, 35);
        
        // Vẽ tay
        strokeWeight(4);
        line(-15, 0, -22, -5);
        line(15, 0, 22, -5);
        
        noStroke();
        
        // Vẽ mắt
        fill(255);
        ellipse(-10, -5, 12, 14);
        ellipse(10, -5, 12, 14);
        
        // Đồng tử
        fill(0);
        ellipse(-10, -5, 5, 7);
        ellipse(10, -5, 5, 7);
        
        // Vẽ mũi
        fill(255, 150, 100);
        triangle(12, -2, 18, 2, 12, 5);
        
        // Vẽ miệng cười nhẹ
        noFill();
        stroke(0);
        strokeWeight(2);
        arc(0, 5, 18, 8, 0, PI);
        
        // Vẽ lông mày
        noFill();
        stroke(70, 170, 225);
        strokeWeight(2);
        arc(-10, -12, 8, 4, PI, TWO_PI);
        arc(10, -12, 8, 4, PI, TWO_PI);
    }
    
    pop();
  }
  
  jump() {
    this.velocity.y = this.jumpVelocity;
    this.bounceAnimation = 1;
  }
  
  superJump() {
    this.velocity.y = this.superJumpVelocity;
    this.bounceAnimation = 1.5;
  }
  
  collidesWith(platform) {
    // Chỉ va chạm khi đang rơi xuống
    if (this.velocity.y <= 0) return false;
    
    // Kiểm tra va chạm bounding box
    let doodleBottom = this.position.y + this.height;
    let doodleLeft = this.position.x + 10; // Thu nhỏ hitbox một chút
    let doodleRight = this.position.x + this.width - 10;
    
    let platformTop = platform.position.y;
    let platformBottom = platform.position.y + platform.height;
    let platformLeft = platform.position.x;
    let platformRight = platform.position.x + platform.width;
    
    // Kiểm tra overlap
    let horizontalOverlap = doodleRight > platformLeft && doodleLeft < platformRight;
    let verticalOverlap = doodleBottom > platformTop && doodleBottom < platformBottom + 10;
    
    // Kiểm tra chân doodle có chạm platform không
    let wasAbove = this.position.y + this.height - this.velocity.y <= platformTop;
    
    return horizontalOverlap && verticalOverlap && wasAbove;
  }
}
// ========== BIẾN TOÀN CỤC ==========
let doodle;
let platforms = [];
let springs = [];
let monsters = [];
let particles = [];
let clouds = [];

// Game settings
let gravity = 0.5;
let score = 0;
let highestScore = 0;
let gameState = 'menu'; // 'menu', 'playing', 'gameover'
let cameraY = 0; // Theo dõi độ cao camera - Camera height
let maxHeight = 0;

// Hiệu ứng - Effect
let starField = [];
let showInstructions = false; // BIẾN MỚI: Kiểm soát hiển thị hướng dẫn - Instruction Appeared

// ===================================
// HƯỚNG DẪN: PHẦN TẢI HÌNH ẢNH
// ===================================
// Khai báo các biến sẽ giữ hình ảnh
let doodleImg;
let platformNormalImg;
let platformMovingImg;
let platformBreakableImg;
let springImg;
let monsterImg;

// function preload() { //cái này để thay ảnh nhân vật và mấy bước nhảy nhé 

// //   doodleImg = loadImage('ten_anh_nhan_vat.png'); // ví dụ nè 
// // //   platformNormalImg = loadImage('ten_anh_platform_thuong.png');
// // //   platformMovingImg = loadImage('ten_anh_platform_di_dong.png');
// // //   platformBreakableImg = loadImage('ten_anh_platform_vo.png');
// // //   springImg = loadImage('ten_anh_lo_xo.png');
// // //   monsterImg = loadImage('ten_anh_quai_vat.png');
// }

// ========== SETUP ==========
function setup() {
  createCanvas(400, 600);
  rectMode(CORNER);
  textAlign(CENTER, CENTER);
  
  // Load high score từ localStorage
  if (localStorage.getItem('doodleHighScore')) {
    highestScore = parseInt(localStorage.getItem('doodleHighScore'));
  }
  
  // Tạo starfield cho background
  for (let i = 0; i < 50; i++) {
    starField.push({
      x: random(width),
      y: random(height),
      size: random(1, 3),
      opacity: random(100, 255)
    });
  }
  
  // Tạo clouds
  for (let i = 0; i < 5; i++) {
    clouds.push(new Cloud(random(width), random(height)));
  }
  
  resetGame();
}

// ========== DRAW LOOP ==========
function draw() {
  // Background gradient đẹp
  drawBackground();
  
  if (gameState === 'menu') {
    drawMenu();
    drawInstructionsToggle(); // VẼ NÚT INFO
    if (showInstructions) {
      drawLegendBox(); // VẼ HỘP CHÚ THÍCH KHI BẬT
    }
  } else if (gameState === 'playing') {
    playGame();
    drawInstructionsToggle(); // VẼ NÚT INFO KHI CHƠI
    if (showInstructions) {
      drawLegendBox(); // VẼ HỘP CHÚ THÍCH KHI BẬT
    }
  } else if (gameState === 'gameover') {
    playGame(); // Vẫn hiển thị game phía sau
    drawGameOver();
  }
}

// ========== BACKGROUND ==========
function drawBackground() {
  // Gradient từ trên xuống
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color(135, 206, 250), color(255, 250, 220), inter);
    stroke(c);
    line(0, y, width, y);
  }
  
  // Vẽ stars
  noStroke();
  for (let star of starField) {
    fill(255, 255, 255, star.opacity);
    ellipse(star.x, star.y, star.size);
  }
  
  // Vẽ clouds
  for (let cloud of clouds) {
    cloud.update();
    cloud.show();
  }
}

// ========== GAME LOGIC ==========
function playGame() {
  // Cập nhật doodle
  doodle.update();
  
  // Xử lý điều khiển liên tục
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { // A
    doodle.velocity.x = -5;
  } else if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { // D
    doodle.velocity.x = 5;
  } else {
    doodle.velocity.x *= 0.85; // Friction
  }
  
  // Camera theo doodle khi nhảy cao
  if (doodle.position.y < height * 0.4) {
    let diff = height * 0.4 - doodle.position.y;
    cameraY += diff;
    doodle.position.y = height * 0.4;
    
    // Di chuyển tất cả objects xuống
    for (let platform of platforms) {
      platform.position.y += diff;
    }
    for (let spring of springs) {
      spring.position.y += diff;
    }
    for (let monster of monsters) {
      monster.position.y += diff;
    }
    
    // Cập nhật maxHeight và score
    if (cameraY > maxHeight) {
      maxHeight = cameraY;
      score = floor(maxHeight / 10);
      if (score > highestScore) {
        highestScore = score;
        localStorage.setItem('doodleHighScore', highestScore);
      }
    }
  }
  
  // Kiểm tra va chạm với platforms
  for (let i = platforms.length - 1; i >= 0; i--) {
    let platform = platforms[i];
    platform.update();
    platform.show();
    
    // Va chạm
    if (doodle.collidesWith(platform) && !platform.broken) {
      if (platform.type === 'breakable') {
        platform.broken = true;
        createParticles(platform.position.x + platform.width/2, platform.position.y, color(139, 69, 19));
      } else {
        doodle.jump();
        createParticles(platform.position.x + platform.width/2, platform.position.y, color(100, 200, 100));
      }
    }
    
    // Xóa platform ngoài màn hình
    if (platform.position.y > height + 100) {
      platforms.splice(i, 1);
    }
  }
  
  // Kiểm tra va chạm với springs
  for (let i = springs.length - 1; i >= 0; i--) {
    let spring = springs[i];
    spring.show();
    
    if (spring.collidesWith(doodle) && !spring.used) {
      spring.used = true;
      doodle.superJump();
      createParticles(spring.position.x, spring.position.y, color(255, 200, 0));
    }
    
    if (spring.position.y > height + 100) {
      springs.splice(i, 1);
    }
  }
  
  // Kiểm tra va chạm với monsters
  for (let i = monsters.length - 1; i >= 0; i--) {
    let monster = monsters[i];
    monster.update();
    monster.show();
    
    if (monster.collidesWith(doodle)) {
      gameState = 'gameover';
    }
    
    if (monster.position.y > height + 100) {
      monsters.splice(i, 1);
    }
  }
  
  // Cập nhật particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }
  
  // Tạo platforms mới
  generatePlatforms();
  
  // Vẽ doodle
  doodle.show();
  
  // Game over nếu rơi xuống
  if (doodle.position.y > height + 100) {
    gameState = 'gameover';
  }
  
  // Hiển thị score
  drawScore();
}

// ========== GENERATE PLATFORMS ==========
function generatePlatforms() {
  // Tìm platform cao nhất
  let highestY = height;
  for (let platform of platforms) {
    if (platform.position.y < highestY) {
      highestY = platform.position.y;
    }
  }
  
  // Tạo platforms mới ở trên
  while (highestY > -100) {
    // THAY ĐỔI: Giảm khoảng cách giữa các platform để dễ nhảy hơn
    let newY = highestY - random(50, 80); 
    let newX = random(20, width - 100);
    
    // Chọn loại platform
    let type = 'normal';
    let rand = random();
    if (score > 50 && rand < 0.15) {
      type = 'moving';
    } else if (score > 100 && rand < 0.25) {
      type = 'breakable';
    }
    
    let newPlatform = new Platform(newX, newY, type);
    platforms.push(newPlatform);
    
    // Thêm spring ngẫu nhiên
    if (random() < 0.08 && type === 'normal') {
      springs.push(new Spring(newX + 30, newY - 25));
    }
    
    // Thêm monster ngẫu nhiên
    if (score > 30 && random() < 0.05 && type === 'normal') {
      monsters.push(new Monster(newX + 20, newY - 40));
    }
    
    highestY = newY;
  }
}

// ========== PARTICLES ==========
function createParticles(x, y, col) {
  for (let i = 0; i < 8; i++) {
    particles.push(new Particle(x, y, col));
  }
}

// ========== UI DRAWING ==========

// HỘP CHÚ THÍCH (LEGEND BOX)
function drawLegendBox() {
    push();

    // Hộp nằm ở giữa hơi cao lên để cân đối
    translate(width / 2, height / 2 - 10);

    // Hộp nền
    fill(255, 255, 255, 235);
    stroke(120, 135, 250);
    strokeWeight(3);
    rect(-150, -190, 300, 380, 18);
    noStroke();

    // Tiêu đề
    fill(100, 120, 240);
    textSize(20);
    textAlign(CENTER, CENTER);
    text("📋 Chú Thích & Điều Khiển", 0, -165);

    // --- Thiết lập text ---
    textAlign(LEFT, CENTER);
    let startY = -135;
    let line = 26;   // Giảm line spacing cho gọn
    let iconX = -130;
    let textX = -80;

    // --- Điều Khiển ---
    fill(100, 120, 240);
    textSize(16);
    text("🎯 ĐIỀU KHIỂN:", iconX, startY);

    fill(50);
    textSize(14);
    text("SPACE: Bắt đầu / Chơi lại", textX, startY + line * 1);
    text("← / A: Di chuyển trái",      textX, startY + line * 2);
    text("→ / D: Di chuyển phải",      textX, startY + line * 3);
    text("I: Bật/tắt hướng dẫn",       textX, startY + line * 4);

    // --- Vật thể ---
    startY += line * 6;
    fill(118, 75, 162);
    textSize(16);
    text("🧱 VẬT THỂ:", iconX, startY);

    startY += line;

    addLegend(iconX, startY,  color(100, 220, 100), "Platform Thường: Nhảy bình thường");
    addLegend(iconX, startY + line, color(100, 200, 255), "Platform Di Động: Di chuyển qua lại");
    addLegend(iconX, startY + line * 2, color(139, 69, 19), "Platform Vỡ: Chỉ dùng 1 lần");
    addLegend(iconX, startY + line * 3, color(255, 200, 0), "Lò Xo: Super Jump!");
    addLegend(iconX, startY + line * 4, color(150, 80, 200), "Quái Vật: Chạm là Game Over");

    // --- Mẹo ---
    fill(255, 150, 0);
    textSize(13);
    text("💡 Mẹo: Đi qua biên sẽ xuất hiện ở bên kia!", iconX, startY + line * 6);

    pop();
}

function addLegend(x, y, col, label) {
    push();
    fill(col);
    rect(x, y - 9, 38, 18, 4);
    pop();

    fill(50);
    textSize(14);
    text(label, x + 50, y);
}

function drawLegendIcon(x, y, col) {
    push();
    fill(col);
    rect(x, y - 10, 40, 20, 4);
    pop();
}

// NÚT INFO (i)
function drawInstructionsToggle() {
    let btnX = width - 30;
    let btnY = 30;
    let size = 20;

    // Nền
    fill(255, 255, 255, 200);
    ellipse(btnX, btnY, size * 1.5);

    // Chữ 'i'
    fill(50, 150, 255);
    textSize(18);
    textFont('Georgia');
    text('i', btnX, btnY);
    
    // Thêm hiệu ứng nhấp nháy/nhấn mạnh khi đang ở menu
    if (gameState === 'menu') {
        fill(50, 150, 255, 50 + sin(frameCount * 0.1) * 50);
        ellipse(btnX, btnY, size * 2);
    }
}


function drawScore() {
  // Main text
  fill(255);
  textSize(28);
  textFont('Georgia');
  text('Score: ' + score, width/2, 30);
  
  textSize(18);
  text('Best: ' + highestScore, width/2, 60);
}

function drawMenu() {
  // Title
  fill(0, 0, 0, 100);
  textSize(64);
  text('DOODLE', width/2 + 3, height/2 - 103);
  text('JUMP', width/2 + 3, height/2 - 43);
  
  fill(255, 215, 0);
  textSize(64);
  textFont('Georgia');
  text('DOODLE', width/2, height/2 - 100);
  
  fill(50, 200, 255);
  text('JUMP', width/2, height/2 - 40);
  
  // Instructions
  fill(255);
  textSize(20);
  text('Press SPACE to start', width/2, height/2 + 50);
  
  // Hướng dẫn nhỏ
  textSize(16);
  fill(200);
  text('← → or A D to move', width/2, height/2 + 90);
  
  if (highestScore > 0) {
    textSize(18);
    fill(255, 255, 0);
    text('High Score: ' + highestScore, width/2, height/2 + 140);
  }
  
  // Animated doodle
  push();
  translate(width/2, height/2 + 200);
  rotate(sin(frameCount * 0.05) * 0.2);
  // Sử dụng doodle.show() để vẽ nhân vật
  doodle.showStatic(0, 0, 1.2); 
  pop();
}

function drawGameOver() {
  // Dark overlay
  fill(0, 0, 0, 180);
  rect(0, 0, width, height);
  
  // Game Over Box
  fill(255, 255, 255, 230);
  stroke(255, 100, 100);
  strokeWeight(4);
  rect(width/2 - 150, height/2 - 150, 300, 300, 20);
  noStroke();
  
  // Text
  fill(220, 50, 50);
  textSize(48);
  textFont('Georgia');
  text('GAME OVER', width/2, height/2 - 80);
  
  fill(50);
  textSize(24);
  text('Score: ' + score, width/2, height/2 - 20);
  
  fill(100);
  textSize(20);
  text('Best: ' + highestScore, width/2, height/2 + 20);
  
  // Restart instruction
  fill(100, 150, 255);
  textSize(18);
  text('Press SPACE to restart', width/2, height/2 + 80);
}
// ========== RESET GAME ==========
function resetGame() {
  gameState = 'menu';
  platforms = [];
  springs = [];
  monsters = [];
  particles = [];
  score = 0;
  cameraY = 0;
  maxHeight = 0;
  showInstructions = false;
  
  // 1. Platform khởi đầu (Base Platform)
  let initialPlatform = new Platform(width/2 - 40, height - 50, 'normal');
  platforms.push(initialPlatform);
  
  // ⭐️ ĐIỀU CHỈNH MỚI: Đặt Doodle ngay trên platform đầu tiên và cho nó nhảy ngay
  let doodleWidth = 50; // Kích thước Doodle
  let doodleHeight = 50;
  
  // Căn giữa Doodle (50px) trên Platform (80px)
  let doodleX = initialPlatform.position.x + initialPlatform.width / 2 - doodleWidth / 2; 
  // Đặt đáy Doodle ngay trên đỉnh Platform (Platform y - Doodle height)
  let doodleY = initialPlatform.position.y - doodleHeight; 
  
  doodle = new Doodle(doodleX, doodleY);
  
  // ⭐️ Tự động nhảy (nhảy thường) để bắt đầu game bằng một cú nhảy!
  doodle.jump(); 
  
  // 3. Tạo platforms ban đầu (bắt đầu từ vị trí cao hơn platform khởi đầu)
  let lastY = initialPlatform.position.y;
  for (let i = 0; i < 10; i++) {
    // THAY ĐỔI: Giảm khoảng cách ban đầu để dễ nhảy hơn
    let y = lastY - random(50, 80); 
    let x = random(20, width - 100);
    platforms.push(new Platform(x, y, 'normal'));
    lastY = y;
  }
}

// ========== INPUT ==========
function keyPressed() {
  if (keyCode === 32) { // SPACE
    if (gameState === 'menu') {
      gameState = 'playing';
      showInstructions = false; // Tắt hướng dẫn khi bắt đầu chơi
    } else if (gameState === 'gameover') {
      resetGame();
      gameState = 'playing';
    }
  } else if (keyCode === 73) { // Phím 'I' để bật/tắt hướng dẫn
    showInstructions = !showInstructions;
  }
}

function mousePressed() {
    let btnX = width - 30;
    let btnY = 30;
    let size = 20;
    
    // Kiểm tra nếu nhấp vào nút info (chỉ khi không phải game over)
    if (gameState !== 'gameover' && dist(mouseX, mouseY, btnX, btnY) < size * 1.5 / 2) {
        showInstructions = !showInstructions;
    }
}


// ========== CLOUD CLASS ==========
class Cloud {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = random(0.2, 0.5);
    this.size = random(40, 80);
  }
  
  update() {
    this.x += this.speed;
    if (this.x > width + this.size) {
      this.x = -this.size;
      this.y = random(height);
    }
  }
  
  show() {
    fill(255, 255, 255, 150);
    noStroke();
    ellipse(this.x, this.y, this.size, this.size * 0.6);
    ellipse(this.x - this.size * 0.3, this.y, this.size * 0.7, this.size * 0.5);
    ellipse(this.x + this.size * 0.3, this.y, this.size * 0.7, this.size * 0.5);
  }
}

// ========== PARTICLE CLASS ==========
class Particle {
  constructor(x, y, col) {
    this.position = createVector(x, y);
    this.velocity = createVector(random(-3, 3), random(-5, -2));
    this.life = 255;
    this.col = col;
  }
  
  update() {
    this.velocity.y += 0.3;
    this.position.add(this.velocity);
    this.life -= 8;
  }
  
  show() {
    noStroke();
    fill(red(this.col), green(this.col), blue(this.col), this.life);
    ellipse(this.position.x, this.position.y, 6);
  }
  
  isDead() {
    return this.life <= 0;
  }

}

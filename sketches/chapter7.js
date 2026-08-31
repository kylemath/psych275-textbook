// ============================================
// CHAPTER 6: SENSATION & PERCEPTION
// Receptive Fields and Touch Encoding
// ============================================
// Explore how touch receptors tile the skin and
// encode pressure through receptive fields.
// Click and drag on the skin to feel the response!

window.initSketch = function(p) {
  
  // ========== ADJUSTABLE PARAMETERS ==========
  // Try changing these values and click "Run"!
  
  let numReceptors = 25;        // Number of touch receptors
  let receptorSpacing = 60;     // Spacing between receptors (pixels)
  let receptiveFieldSize = 80;  // Size of each receptive field
  let adaptationRate = 0.02;    // How fast receptors adapt (0-0.1)
  let showReceptiveFields = true; // Toggle field visibility
  
  // ===========================================

  let receptors = [];
  let touchX = -100;
  let touchY = -100;
  let touchPressure = 0;
  let time = 0;

  p.setup = function() {
    p.createCanvas(800, 500);
    initReceptors();
    createControls();
  };

  function createControls() {
    const panel = document.getElementById('controlsPanel');
    panel.style.display = 'flex';
    panel.innerHTML = `
      <div class="control-group">
        <label class="control-label">Touch Pressure</label>
        <input type="range" id="pressure" min="0" max="100" value="70">
        <span class="control-value" id="pressureVal">70%</span>
      </div>
      <div class="control-group">
        <label class="control-label">Field Size</label>
        <input type="range" id="fieldSize" min="30" max="150" value="80">
        <span class="control-value" id="fieldSizeVal">80px</span>
      </div>
      <button class="btn" id="toggleFields">Toggle Fields</button>
      <button class="btn" id="resetBtn">Reset</button>
    `;

    document.getElementById('pressure').addEventListener('input', (e) => {
      touchPressure = e.target.value / 100;
      document.getElementById('pressureVal').textContent = `${e.target.value}%`;
    });

    document.getElementById('fieldSize').addEventListener('input', (e) => {
      receptiveFieldSize = parseInt(e.target.value);
      document.getElementById('fieldSizeVal').textContent = `${e.target.value}px`;
    });

    document.getElementById('toggleFields').addEventListener('click', () => {
      showReceptiveFields = !showReceptiveFields;
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
      receptors.forEach(r => { r.activation = 0; r.firing = false; });
      touchX = -100;
      touchY = -100;
    });
  }

  function initReceptors() {
    receptors = [];
    let cols = 5;
    let rows = 5;
    let startX = 200;
    let startY = 100;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        receptors.push({
          x: startX + j * receptorSpacing,
          y: startY + i * receptorSpacing,
          activation: 0,
          firing: false,
          type: (i + j) % 3 === 0 ? 'Merkel' : ((i + j) % 3 === 1 ? 'Meissner' : 'Pacinian'),
          adaptedLevel: 0
        });
      }
    }
  }

  p.draw = function() {
    p.background(10, 14, 20);
    time += 0.016;

    // Update touch position if mouse is pressed
    if (p.mouseIsPressed && p.mouseX > 100 && p.mouseX < 550 && p.mouseY > 50 && p.mouseY < 450) {
      touchX = p.mouseX;
      touchY = p.mouseY;
      touchPressure = parseFloat(document.getElementById('pressure').value) / 100;
    }

    updateReceptors();
    
    drawSkin();
    drawReceptiveFields();
    drawReceptors();
    drawTouchPoint();
    drawInfoPanel();
    drawLabels();
  };

  function updateReceptors() {
    receptors.forEach(r => {
      let distance = p.dist(touchX, touchY, r.x, r.y);
      let fieldRadius = receptiveFieldSize / 2;
      
      // Calculate activation based on distance from touch
      if (distance < fieldRadius && touchPressure > 0) {
        let newActivation = (1 - distance / fieldRadius) * touchPressure;
        
        // Different adaptation rates for different receptor types
        let typeAdaptation = r.type === 'Merkel' ? 0.5 : (r.type === 'Meissner' ? 1.5 : 3);
        
        // Slowly adapting vs rapidly adapting
        r.adaptedLevel = p.lerp(r.adaptedLevel, newActivation, adaptationRate * typeAdaptation);
        r.activation = newActivation - r.adaptedLevel * 0.7;
        r.activation = Math.max(0, r.activation);
      } else {
        r.activation *= 0.9;
        r.adaptedLevel *= 0.95;
      }

      // Fire if above threshold
      r.firing = r.activation > 0.3;
    });
  }

  function drawSkin() {
    // Skin background
    p.fill(255, 220, 200, 30);
    p.stroke(255, 200, 180, 50);
    p.strokeWeight(2);
    p.rect(100, 50, 450, 400, 20);

    // Skin texture
    p.noStroke();
    for (let i = 0; i < 100; i++) {
      let x = 110 + (i * 73) % 430;
      let y = 60 + (i * 47) % 380;
      p.fill(255, 200, 180, 10 + Math.sin(i + time) * 5);
      p.circle(x, y, 3);
    }

    // Label
    p.fill(150);
    p.textAlign(p.CENTER);
    p.textSize(12);
    p.text('SKIN SURFACE', 325, 470);
  }

  function drawReceptiveFields() {
    if (!showReceptiveFields) return;

    receptors.forEach(r => {
      let alpha = 30 + r.activation * 100;
      
      // Center-surround organization
      // Excitatory center
      p.noStroke();
      p.fill(0, 212, 255, alpha * 0.3);
      p.circle(r.x, r.y, receptiveFieldSize * 0.6);
      
      // Inhibitory surround
      p.noFill();
      p.stroke(255, 100, 100, alpha * 0.5);
      p.strokeWeight(2);
      p.circle(r.x, r.y, receptiveFieldSize);

      // Field edge
      p.stroke(0, 212, 255, alpha);
      p.strokeWeight(1);
      p.circle(r.x, r.y, receptiveFieldSize * 0.6);
    });
  }

  function drawReceptors() {
    receptors.forEach(r => {
      let size = 20;
      
      // Firing glow
      if (r.firing) {
        for (let g = 25; g > 0; g -= 5) {
          p.noStroke();
          p.fill(255, 220, 100, (25 - g) * r.activation * 8);
          p.circle(r.x, r.y, size + g);
        }
      }

      // Receptor colors by type
      let colors = {
        'Merkel': [255, 150, 100],    // Slow adapting
        'Meissner': [100, 200, 255],  // Rapid adapting
        'Pacinian': [200, 100, 255]   // Very rapid adapting
      };
      let c = colors[r.type];

      // Receptor body
      let brightness = 80 + r.activation * 175;
      p.fill(c[0] * brightness / 255, c[1] * brightness / 255, c[2] * brightness / 255);
      p.stroke(c[0], c[1], c[2], 200);
      p.strokeWeight(2);
      p.circle(r.x, r.y, size);

      // Activation indicator
      if (r.activation > 0.1) {
        p.noStroke();
        p.fill(255, 255, 255, r.activation * 200);
        p.circle(r.x, r.y, size * r.activation * 0.8);
      }
    });
  }

  function drawTouchPoint() {
    if (touchPressure > 0 && touchX > 0) {
      // Touch pressure visualization
      let size = 30 + touchPressure * 40;
      
      // Pressure gradient
      for (let g = 40; g > 0; g -= 4) {
        p.noStroke();
        p.fill(255, 200, 150, (40 - g) * touchPressure * 3);
        p.circle(touchX, touchY, size + g);
      }

      // Touch point
      p.fill(255, 220, 200);
      p.stroke(255, 150, 100);
      p.strokeWeight(2);
      p.circle(touchX, touchY, size);

      // Finger icon
      p.noStroke();
      p.fill(255, 200, 180);
      p.ellipse(touchX, touchY - 40, 25, 35);
    }
  }

  function drawInfoPanel() {
    // Panel background
    p.fill(20, 28, 40, 230);
    p.stroke(60, 80, 120);
    p.strokeWeight(1);
    p.rect(580, 80, 200, 280, 8);

    // Title
    p.noStroke();
    p.fill(200);
    p.textAlign(p.LEFT);
    p.textSize(14);
    p.text('Receptor Types', 595, 105);

    // Legend
    const types = [
      { name: 'Merkel', color: [255, 150, 100], desc: 'Slow adapting\nSustained pressure' },
      { name: 'Meissner', color: [100, 200, 255], desc: 'Rapid adapting\nLight touch, texture' },
      { name: 'Pacinian', color: [200, 100, 255], desc: 'Very rapid\nVibration, deep pressure' }
    ];

    types.forEach((t, i) => {
      let y = 130 + i * 55;
      
      // Color dot
      p.fill(t.color[0], t.color[1], t.color[2]);
      p.circle(605, y, 14);
      
      // Name
      p.fill(220);
      p.textSize(12);
      p.text(t.name, 620, y + 4);
      
      // Description
      p.fill(140);
      p.textSize(10);
      let lines = t.desc.split('\n');
      lines.forEach((line, j) => {
        p.text(line, 620, y + 18 + j * 12);
      });
    });

    // Active receptors count
    let activeCount = receptors.filter(r => r.firing).length;
    p.fill(0, 212, 255);
    p.textSize(24);
    p.text(activeCount, 605, 310);
    p.fill(150);
    p.textSize(11);
    p.text('/ ' + receptors.length + ' active', 635, 310);
  }

  function drawLabels() {
    // Title
    p.noStroke();
    p.fill(230);
    p.textAlign(p.LEFT);
    p.textSize(16);
    p.text('Touch Receptive Fields', 30, 30);
    
    p.fill(150);
    p.textSize(11);
    p.text('Click and drag on the skin to stimulate receptors', 30, 50);

    // Hint about receptive fields
    if (!showReceptiveFields) {
      p.fill(120);
      p.textSize(10);
      p.text('(Receptive fields hidden - click Toggle to show)', 30, 480);
    }
  }

  // Handle mouse movement
  p.mouseDragged = function() {
    if (p.mouseX > 100 && p.mouseX < 550 && p.mouseY > 50 && p.mouseY < 450) {
      touchX = p.mouseX;
      touchY = p.mouseY;
    }
  };

  p.mouseReleased = function() {
    touchPressure = 0;
    touchX = -100;
    touchY = -100;
  };
};


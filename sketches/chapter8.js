// ============================================
// CHAPTER 7: VISION
// Center-Surround Receptive Fields
// ============================================
// See how retinal ganglion cells detect edges!
// ON-center cells respond to light in center,
// OFF-center cells respond to light in surround.

window.initSketch = function(p) {
  
  // ========== ADJUSTABLE PARAMETERS ==========
  // Try changing these values and click "Run"!
  
  let gridSize = 7;            // Grid of ganglion cells
  let cellSpacing = 55;        // Spacing between cells
  let centerSize = 20;         // Size of center region
  let surroundSize = 45;       // Size of surround region
  let lightRadius = 60;        // Size of light stimulus
  let showONcells = true;      // Show ON-center cells
  let showOFFcells = true;     // Show OFF-center cells
  
  // ===========================================

  let cells = [];
  let lightX = 400;
  let lightY = 250;
  let time = 0;

  p.setup = function() {
    p.createCanvas(800, 500);
    initCells();
    createControls();
  };

  function createControls() {
    const panel = document.getElementById('controlsPanel');
    panel.style.display = 'flex';
    panel.innerHTML = `
      <div class="control-group">
        <label class="control-label">Light Size</label>
        <input type="range" id="lightSize" min="20" max="150" value="60">
        <span class="control-value" id="lightSizeVal">60px</span>
      </div>
      <div class="control-group">
        <label class="control-label">Center Size</label>
        <input type="range" id="centerSize" min="10" max="40" value="20">
        <span class="control-value" id="centerSizeVal">20px</span>
      </div>
      <button class="btn" id="toggleON">Toggle ON</button>
      <button class="btn" id="toggleOFF">Toggle OFF</button>
    `;

    document.getElementById('lightSize').addEventListener('input', (e) => {
      lightRadius = parseInt(e.target.value);
      document.getElementById('lightSizeVal').textContent = `${e.target.value}px`;
    });

    document.getElementById('centerSize').addEventListener('input', (e) => {
      centerSize = parseInt(e.target.value);
      surroundSize = centerSize * 2.2;
      document.getElementById('centerSizeVal').textContent = `${e.target.value}px`;
    });

    document.getElementById('toggleON').addEventListener('click', () => {
      showONcells = !showONcells;
    });

    document.getElementById('toggleOFF').addEventListener('click', () => {
      showOFFcells = !showOFFcells;
    });
  }

  function initCells() {
    cells = [];
    let startX = 150;
    let startY = 80;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        cells.push({
          x: startX + j * cellSpacing,
          y: startY + i * cellSpacing,
          type: (i + j) % 2 === 0 ? 'ON' : 'OFF',
          response: 0,
          firingRate: 0
        });
      }
    }
  }

  p.draw = function() {
    p.background(5, 8, 15);
    time += 0.016;

    // Follow mouse
    if (p.mouseX > 50 && p.mouseX < 550 && p.mouseY > 30 && p.mouseY < 480) {
      lightX = p.lerp(lightX, p.mouseX, 0.15);
      lightY = p.lerp(lightY, p.mouseY, 0.15);
    }

    updateCells();
    
    drawRetina();
    drawLightStimulus();
    drawCells();
    drawResponseGraph();
    drawLabels();
  };

  function updateCells() {
    cells.forEach(cell => {
      let dist = p.dist(lightX, lightY, cell.x, cell.y);
      
      // Calculate light in center vs surround
      let centerLight = 0;
      let surroundLight = 0;
      
      // Simple approximation of overlap
      if (dist < lightRadius + centerSize) {
        let overlap = Math.max(0, 1 - dist / (lightRadius + centerSize));
        centerLight = overlap;
      }
      
      if (dist < lightRadius + surroundSize && dist > centerSize) {
        let overlap = Math.max(0, 1 - Math.abs(dist - surroundSize/2) / (lightRadius + surroundSize/2));
        surroundLight = overlap * 0.7;
      }

      // ON-center: + center, - surround
      // OFF-center: - center, + surround
      if (cell.type === 'ON') {
        cell.response = centerLight - surroundLight * 0.6;
      } else {
        cell.response = surroundLight - centerLight * 0.6;
      }
      
      cell.response = Math.max(-0.5, Math.min(1, cell.response));
      cell.firingRate = p.lerp(cell.firingRate, Math.max(0, cell.response), 0.1);
    });
  }

  function drawRetina() {
    // Retina background
    p.noStroke();
    p.fill(20, 15, 25);
    p.rect(50, 30, 500, 440, 15);

    // Label
    p.fill(80);
    p.textAlign(p.CENTER);
    p.textSize(11);
    p.text('RETINA', 300, 485);
  }

  function drawLightStimulus() {
    // Light beam
    for (let g = lightRadius + 30; g > 0; g -= 5) {
      let alpha = (lightRadius + 30 - g) / (lightRadius + 30) * 150;
      p.noStroke();
      p.fill(255, 255, 200, alpha);
      p.circle(lightX, lightY, lightRadius * 2 + g);
    }

    // Core
    p.fill(255, 255, 240);
    p.circle(lightX, lightY, lightRadius * 2);

    // Light indicator
    p.fill(255, 255, 200);
    p.textAlign(p.CENTER);
    p.textSize(10);
    p.text('LIGHT', lightX, lightY - lightRadius - 15);
  }

  function drawCells() {
    cells.forEach(cell => {
      // Skip if type is hidden
      if (cell.type === 'ON' && !showONcells) return;
      if (cell.type === 'OFF' && !showOFFcells) return;

      let isON = cell.type === 'ON';
      
      // Surround (inhibitory for ON, excitatory for OFF)
      let surroundColor = isON ? [255, 100, 100] : [100, 255, 150];
      p.noFill();
      p.stroke(surroundColor[0], surroundColor[1], surroundColor[2], 80);
      p.strokeWeight(2);
      p.circle(cell.x, cell.y, surroundSize);

      // Center (excitatory for ON, inhibitory for OFF)
      let centerColor = isON ? [100, 255, 150] : [255, 100, 100];
      p.fill(centerColor[0], centerColor[1], centerColor[2], 40 + cell.firingRate * 150);
      p.stroke(centerColor[0], centerColor[1], centerColor[2], 150);
      p.strokeWeight(1);
      p.circle(cell.x, cell.y, centerSize);

      // Firing activity
      if (cell.firingRate > 0.2) {
        // Spike visualization
        for (let i = 0; i < 3; i++) {
          let angle = (time * 5 + i * 2) + cell.x * 0.01;
          let r = centerSize / 2 + 8 + Math.sin(angle * 3) * 3;
          let sx = cell.x + Math.cos(angle) * r;
          let sy = cell.y + Math.sin(angle) * r;
          
          p.noStroke();
          p.fill(255, 220, 100, cell.firingRate * 200);
          p.circle(sx, sy, 4);
        }
      }

      // Cell type label
      p.noStroke();
      p.fill(isON ? [100, 255, 150] : [255, 100, 100]);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(9);
      p.text(cell.type, cell.x, cell.y);
    });
  }

  function drawResponseGraph() {
    // Panel
    p.fill(15, 20, 30);
    p.stroke(40, 50, 70);
    p.strokeWeight(1);
    p.rect(580, 50, 200, 200, 8);

    p.noStroke();
    p.fill(180);
    p.textAlign(p.LEFT);
    p.textSize(12);
    p.text('Cell Responses', 595, 75);

    // Response bars
    let onCells = cells.filter(c => c.type === 'ON' && showONcells);
    let offCells = cells.filter(c => c.type === 'OFF' && showOFFcells);
    
    let avgON = onCells.length > 0 ? onCells.reduce((s, c) => s + c.firingRate, 0) / onCells.length : 0;
    let avgOFF = offCells.length > 0 ? offCells.reduce((s, c) => s + c.firingRate, 0) / offCells.length : 0;

    // ON-center average
    p.fill(100, 255, 150, 100);
    let onBarWidth = avgON * 150;
    p.rect(595, 95, onBarWidth, 25, 4);
    p.fill(100, 255, 150);
    p.textSize(11);
    p.text('ON-center', 600, 112);
    p.textAlign(p.RIGHT);
    p.text((avgON * 100).toFixed(0) + '%', 760, 112);

    // OFF-center average
    p.textAlign(p.LEFT);
    p.fill(255, 100, 100, 100);
    let offBarWidth = avgOFF * 150;
    p.rect(595, 130, offBarWidth, 25, 4);
    p.fill(255, 100, 100);
    p.textSize(11);
    p.text('OFF-center', 600, 147);
    p.textAlign(p.RIGHT);
    p.text((avgOFF * 100).toFixed(0) + '%', 760, 147);

    // Explanation
    p.textAlign(p.LEFT);
    p.fill(120);
    p.textSize(10);
    p.text('ON cells: respond to light in center', 595, 180);
    p.text('OFF cells: respond to dark in center', 595, 195);
    p.text('This creates edge detection!', 595, 220);

    // Edge detection demo
    p.fill(15, 20, 30);
    p.stroke(40, 50, 70);
    p.rect(580, 270, 200, 180, 8);

    p.noStroke();
    p.fill(180);
    p.textSize(12);
    p.text('Edge Detection', 595, 295);

    // Draw edge example
    p.fill(50);
    p.rect(600, 320, 70, 100);
    p.fill(200);
    p.rect(670, 320, 70, 100);

    // Show where cells respond
    p.fill(100, 255, 150, 150);
    p.circle(670, 370, 20);
    p.fill(255, 100, 100, 150);
    p.circle(650, 370, 20);

    p.fill(120);
    p.textSize(9);
    p.text('Both cell types fire at edges', 595, 440);
    p.text('creating contrast enhancement', 595, 455);
  }

  function drawLabels() {
    // Title
    p.noStroke();
    p.fill(230);
    p.textAlign(p.LEFT);
    p.textSize(16);
    p.text('Visual Receptive Fields', 30, 520);
    
    p.fill(150);
    p.textSize(11);
    p.text('Move mouse to position light stimulus', 200, 520);

    // Legend
    p.fill(100, 255, 150);
    p.circle(600, 520, 8);
    p.fill(150);
    p.textSize(10);
    p.text('Excitatory', 612, 524);

    p.fill(255, 100, 100);
    p.circle(680, 520, 8);
    p.fill(150);
    p.text('Inhibitory', 692, 524);
  }
};





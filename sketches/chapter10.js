// ============================================
// CHAPTER 9: MOTOR CONTROL
// Motor Unit Recruitment (Size Principle)
// ============================================
// See how the brain recruits motor units!
// Small units activate first, large units join
// as more force is needed.

window.initSketch = function(p) {
  
  // ========== ADJUSTABLE PARAMETERS ==========
  // Try changing these values and click "Run"!
  
  let numMotorUnits = 8;       // Number of motor units
  let forceLevel = 0;          // Current force demand (0-1)
  let recruitmentThreshold = 0.1; // Base threshold spacing
  let fatigueRate = 0.001;     // How fast units fatigue
  let recoveryRate = 0.003;    // How fast units recover
  
  // ===========================================

  let motorUnits = [];
  let targetForce = 0;
  let actualForce = 0;
  let forceHistory = [];
  let time = 0;

  p.setup = function() {
    p.createCanvas(800, 500);
    initMotorUnits();
    createControls();
    
    // Initialize force history
    for (let i = 0; i < 200; i++) {
      forceHistory.push(0);
    }
  };

  function createControls() {
    const panel = document.getElementById('controlsPanel');
    panel.style.display = 'flex';
    panel.innerHTML = `
      <div class="control-group">
        <label class="control-label">Force Demand</label>
        <input type="range" id="force" min="0" max="100" value="0">
        <span class="control-value" id="forceVal">0%</span>
      </div>
      <div class="control-group">
        <label class="control-label">Fatigue Rate</label>
        <input type="range" id="fatigue" min="0" max="20" value="5">
        <span class="control-value" id="fatigueVal">0.005</span>
      </div>
      <button class="btn" id="maxForce">Max Force!</button>
      <button class="btn" id="resetBtn">Reset</button>
    `;

    document.getElementById('force').addEventListener('input', (e) => {
      targetForce = e.target.value / 100;
      document.getElementById('forceVal').textContent = `${e.target.value}%`;
    });

    document.getElementById('fatigue').addEventListener('input', (e) => {
      fatigueRate = e.target.value / 2000;
      document.getElementById('fatigueVal').textContent = fatigueRate.toFixed(4);
    });

    document.getElementById('maxForce').addEventListener('click', () => {
      targetForce = 1;
      document.getElementById('force').value = 100;
      document.getElementById('forceVal').textContent = '100%';
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
      targetForce = 0;
      document.getElementById('force').value = 0;
      document.getElementById('forceVal').textContent = '0%';
      motorUnits.forEach(mu => { mu.fatigue = 0; mu.active = false; });
    });
  }

  function initMotorUnits() {
    motorUnits = [];
    
    for (let i = 0; i < numMotorUnits; i++) {
      let size = (i + 1) / numMotorUnits; // 0.125 to 1.0
      motorUnits.push({
        index: i,
        size: size,
        threshold: i * recruitmentThreshold + 0.05, // When it gets recruited
        fibers: Math.floor(5 + size * 30), // Number of muscle fibers
        active: false,
        fatigue: 0,
        firingRate: 0,
        x: 100,
        y: 80 + i * 52
      });
    }
  }

  p.draw = function() {
    p.background(10, 14, 20);
    time += 0.016;

    updateMotorUnits();
    
    drawSpinalCord();
    drawMotorUnits();
    drawMuscle();
    drawForceGraph();
    drawLabels();
  };

  function updateMotorUnits() {
    actualForce = 0;
    
    motorUnits.forEach(mu => {
      // Size Principle: recruit based on threshold
      let effectiveThreshold = mu.threshold * (1 + mu.fatigue);
      mu.active = targetForce > effectiveThreshold && mu.fatigue < 0.9;
      
      if (mu.active) {
        // Firing rate increases with force above threshold
        let excessForce = targetForce - effectiveThreshold;
        mu.firingRate = p.min(1, excessForce * 3 + 0.3);
        
        // Contribution to total force
        let forceContrib = mu.size * mu.firingRate * (1 - mu.fatigue);
        actualForce += forceContrib / numMotorUnits;
        
        // Fatigue accumulation
        mu.fatigue = p.min(1, mu.fatigue + fatigueRate * mu.firingRate);
      } else {
        mu.firingRate = 0;
        // Recovery when not active
        mu.fatigue = p.max(0, mu.fatigue - recoveryRate);
      }
    });

    // Update force history
    forceHistory.push(actualForce);
    if (forceHistory.length > 200) forceHistory.shift();
  }

  function drawSpinalCord() {
    // Spinal cord representation
    p.fill(50, 40, 60);
    p.stroke(80, 70, 100);
    p.strokeWeight(2);
    p.rect(50, 50, 80, 430, 10);

    // Label
    p.noStroke();
    p.fill(150);
    p.textAlign(p.CENTER);
    p.textSize(11);
    p.push();
    p.translate(35, 265);
    p.rotate(-p.HALF_PI);
    p.text('SPINAL CORD', 0, 0);
    p.pop();

    // Motor neuron pool label
    p.fill(120);
    p.textSize(10);
    p.text('Motor', 90, 40);
    p.text('Neurons', 90, 52);
  }

  function drawMotorUnits() {
    motorUnits.forEach(mu => {
      // Motor neuron in spinal cord
      let neuronSize = 15 + mu.size * 15;
      
      // Glow if active
      if (mu.active) {
        for (let g = 20; g > 0; g -= 4) {
          p.noStroke();
          p.fill(255, 200, 100, (20 - g) * mu.firingRate * 5);
          p.circle(90, mu.y, neuronSize + g);
        }
      }

      // Neuron body
      let brightness = mu.active ? 150 + mu.firingRate * 100 : 60;
      p.fill(brightness, brightness - 20, brightness + 30);
      p.stroke(mu.active ? [255, 200, 100] : [100, 90, 120]);
      p.strokeWeight(2);
      p.circle(90, mu.y, neuronSize);

      // Threshold label
      p.noStroke();
      p.fill(mu.active ? 255 : 120);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(8);
      p.text((mu.threshold * 100).toFixed(0) + '%', 90, mu.y);

      // Axon to muscle
      let axonEndX = 280;
      let muscleY = 150 + mu.index * 40;
      
      p.stroke(mu.active ? [255, 200, 100, 200] : [60, 50, 80]);
      p.strokeWeight(mu.active ? 2 : 1);
      p.noFill();
      p.bezier(90 + neuronSize/2, mu.y, 
               150, mu.y,
               200, muscleY,
               axonEndX, muscleY);

      // Action potential traveling
      if (mu.active) {
        let apPos = (time * 3 + mu.index * 0.2) % 1;
        let apX = p.bezierPoint(90 + neuronSize/2, 150, 200, axonEndX, apPos);
        let apY = p.bezierPoint(mu.y, mu.y, muscleY, muscleY, apPos);
        
        p.noStroke();
        p.fill(255, 220, 100);
        p.circle(apX, apY, 6);
      }

      // Motor unit label
      p.noStroke();
      p.fill(150);
      p.textAlign(p.LEFT);
      p.textSize(9);
      p.text(`MU${mu.index + 1}`, 55, mu.y + 4);

      // Size indicator
      let sizeLabel = mu.size < 0.3 ? 'S' : (mu.size < 0.7 ? 'M' : 'L');
      p.fill(mu.size < 0.3 ? [100, 200, 255] : (mu.size < 0.7 ? [255, 200, 100] : [255, 100, 100]));
      p.text(sizeLabel, 115, mu.y + 4);
    });
  }

  function drawMuscle() {
    // Muscle outline
    p.fill(80, 40, 50);
    p.stroke(120, 80, 90);
    p.strokeWeight(2);
    p.rect(280, 100, 150, 370, 15);

    // Label
    p.noStroke();
    p.fill(150);
    p.textAlign(p.CENTER);
    p.textSize(11);
    p.text('MUSCLE', 355, 90);

    // Muscle fibers for each motor unit
    motorUnits.forEach(mu => {
      let fiberY = 150 + mu.index * 40;
      let fiberHeight = 25;
      
      // Number of fibers based on motor unit size
      for (let f = 0; f < mu.fibers / 5; f++) {
        let fiberX = 290 + f * 18;
        if (fiberX > 410) break;
        
        let fatigueColor = p.map(mu.fatigue, 0, 1, 0, 150);
        
        if (mu.active) {
          // Contracting fiber
          let contraction = Math.sin(time * 20 + f) * 0.1 + 0.9;
          p.fill(200 - fatigueColor, 80, 80 + fatigueColor);
          p.stroke(255, 150, 150);
          p.strokeWeight(1);
          p.rect(fiberX, fiberY - fiberHeight/2, 12, fiberHeight * contraction, 3);
        } else {
          // Relaxed fiber
          p.fill(100, 60, 60);
          p.stroke(140, 100, 100);
          p.strokeWeight(1);
          p.rect(fiberX, fiberY - fiberHeight/2, 12, fiberHeight, 3);
        }
      }

      // Fatigue indicator
      if (mu.fatigue > 0.1) {
        p.noStroke();
        p.fill(255, 100, 100, mu.fatigue * 200);
        p.textSize(8);
        p.textAlign(p.RIGHT);
        p.text(`${(mu.fatigue * 100).toFixed(0)}% fatigue`, 425, fiberY + 4);
      }
    });

    // Force output arrow
    let arrowLength = actualForce * 80;
    p.stroke(100, 255, 150);
    p.strokeWeight(3);
    p.line(355, 480, 355, 480 - arrowLength);
    if (arrowLength > 10) {
      p.line(355, 480 - arrowLength, 348, 480 - arrowLength + 8);
      p.line(355, 480 - arrowLength, 362, 480 - arrowLength + 8);
    }
    
    p.noStroke();
    p.fill(100, 255, 150);
    p.textSize(12);
    p.textAlign(p.CENTER);
    p.text(`Force: ${(actualForce * 100).toFixed(0)}%`, 355, 500);
  }

  function drawForceGraph() {
    // Graph panel
    p.fill(15, 20, 30);
    p.stroke(40, 50, 70);
    p.strokeWeight(1);
    p.rect(460, 50, 320, 200, 8);

    p.noStroke();
    p.fill(180);
    p.textAlign(p.LEFT);
    p.textSize(12);
    p.text('Force Output', 475, 75);

    // Target force line
    p.stroke(255, 159, 67, 100);
    p.strokeWeight(1);
    let targetY = p.map(targetForce, 0, 1, 230, 70);
    p.line(480, targetY, 760, targetY);
    p.noStroke();
    p.fill(255, 159, 67);
    p.textSize(9);
    p.text('target', 720, targetY - 5);

    // Force history line
    p.stroke(100, 255, 150);
    p.strokeWeight(2);
    p.noFill();
    p.beginShape();
    for (let i = 0; i < forceHistory.length; i++) {
      let x = p.map(i, 0, forceHistory.length, 480, 760);
      let y = p.map(forceHistory[i], 0, 1, 230, 70);
      p.vertex(x, y);
    }
    p.endShape();

    // Recruitment order panel
    p.fill(15, 20, 30);
    p.stroke(40, 50, 70);
    p.rect(460, 270, 320, 200, 8);

    p.noStroke();
    p.fill(180);
    p.textSize(12);
    p.text('Size Principle', 475, 295);

    p.fill(120);
    p.textSize(10);
    let explanation = [
      '• Small motor units activate first',
      '  (low threshold, precise control)',
      '',
      '• Large motor units recruit later',
      '  (high threshold, more force)',
      '',
      '• This provides smooth force',
      '  gradation from fine to powerful',
      '',
      'Henneman\'s Size Principle (1957)'
    ];
    
    explanation.forEach((line, i) => {
      p.text(line, 475, 315 + i * 14);
    });

    // Active units indicator
    let activeCount = motorUnits.filter(mu => mu.active).length;
    p.fill(100, 255, 150);
    p.textSize(16);
    p.text(`${activeCount}/${numMotorUnits} units active`, 620, 295);
  }

  function drawLabels() {
    p.noStroke();
    p.fill(230);
    p.textAlign(p.LEFT);
    p.textSize(16);
    p.text('Motor Unit Recruitment', 30, 520);
    
    // Size legend
    p.textSize(10);
    p.fill(100, 200, 255);
    p.text('S = Small (slow, fatigue-resistant)', 250, 520);
    p.fill(255, 200, 100);
    p.text('M = Medium', 460, 520);
    p.fill(255, 100, 100);
    p.text('L = Large (fast, fatigable)', 550, 520);
  }
};





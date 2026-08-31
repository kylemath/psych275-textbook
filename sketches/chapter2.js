// ============================================
// CHAPTER 2: ELECTRICAL SIGNALING
// Action Potential Simulation
// ============================================
// Watch how ions flow across the membrane to generate
// action potentials - the electrical language of neurons.

window.initSketch = function(p) {
  // ========== SIMULATION PARAMETERS ==========
  let membranePotential = -70;  // mV
  let threshold = -55;          // mV
  let restingPotential = -70;   // mV
  let peakPotential = 40;       // mV
  let stimulusCurrent = 0;      // Applied current
  
  // Hodgkin-Huxley style variables
  let n = 0.3;  // K+ activation
  let m = 0.05; // Na+ activation
  let h = 0.6;  // Na+ inactivation
  
  let phase = 'resting';
  let phaseTime = 0;
  let voltageHistory = [];
  let ions = [];
  let channels = [];
  let time = 0;

  p.setup = function() {
    p.createCanvas(800, 500);
    createControls();
    initChannels();
    
    // Initialize voltage history
    for (let i = 0; i < 300; i++) {
      voltageHistory.push(-70);
    }
  };

  function createControls() {
    const panel = document.getElementById('controlsPanel');
    panel.style.display = 'flex';
    panel.innerHTML = `
      <div class="control-group">
        <label class="control-label">Stimulus Current</label>
        <input type="range" id="stimulus" min="0" max="100" value="0">
        <span class="control-value" id="stimVal">0 nA</span>
      </div>
      <button class="btn" id="fireBtn">⚡ Trigger Spike</button>
      <button class="btn" id="resetBtn">Reset</button>
    `;

    document.getElementById('stimulus').addEventListener('input', (e) => {
      stimulusCurrent = parseInt(e.target.value);
      document.getElementById('stimVal').textContent = `${stimulusCurrent} nA`;
    });

    document.getElementById('fireBtn').addEventListener('click', () => {
      if (phase === 'resting') {
        phase = 'depolarizing';
        phaseTime = 0;
      }
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
      membranePotential = -70;
      phase = 'resting';
      stimulusCurrent = 0;
      document.getElementById('stimulus').value = 0;
      document.getElementById('stimVal').textContent = '0 nA';
      ions = [];
    });

    // updateCodeDisplay(); // Removed - code shown in editor
  }

  function initChannels() {
    // Na+ channels (left side)
    for (let i = 0; i < 4; i++) {
      channels.push({
        x: 200,
        y: 200 + i * 50,
        type: 'Na',
        open: false,
        color: [255, 100, 100]
      });
    }
    // K+ channels (right side)
    for (let i = 0; i < 4; i++) {
      channels.push({
        x: 400,
        y: 200 + i * 50,
        type: 'K',
        open: false,
        color: [100, 180, 255]
      });
    }
  }

  function updateCodeDisplay() {
    const code = `<span class="comment">// Action Potential Dynamics</span>

<span class="keyword">const</span> <span class="variable">Vm</span> = ${membranePotential.toFixed(1)} <span class="comment">// Membrane potential (mV)</span>
<span class="keyword">const</span> <span class="variable">Vrest</span> = ${restingPotential} <span class="comment">// Resting potential</span>
<span class="keyword">const</span> <span class="variable">threshold</span> = ${threshold} <span class="comment">// Firing threshold</span>

<span class="comment">// Current phase: ${phase}</span>

<span class="comment">// Ion channel states:</span>
<span class="keyword">const</span> <span class="variable">Na_activation</span> = ${m.toFixed(3)};  <span class="comment">// m gate</span>
<span class="keyword">const</span> <span class="variable">Na_inactivation</span> = ${h.toFixed(3)}; <span class="comment">// h gate</span>
<span class="keyword">const</span> <span class="variable">K_activation</span> = ${n.toFixed(3)};   <span class="comment">// n gate</span>

<span class="comment">// Nernst equilibrium potentials:</span>
<span class="keyword">const</span> <span class="variable">E_Na</span> = +60;  <span class="comment">// mV (Na+ wants in)</span>
<span class="keyword">const</span> <span class="variable">E_K</span> = -90;   <span class="comment">// mV (K+ wants out)</span>

<span class="comment">// Action potential phases:</span>
<span class="comment">// 1. Resting: Vm ≈ -70mV</span>
<span class="comment">// 2. Depolarization: Na+ rushes in</span>
<span class="comment">// 3. Repolarization: K+ rushes out</span>
<span class="comment">// 4. Hyperpolarization: undershoot</span>
<span class="comment">// 5. Return to rest</span>`;
    const el = document.getElementById('codeDisplay'); if (el) el.innerHTML = code;
  }

  p.draw = function() {
    p.background(10, 14, 20);
    time += 0.016;

    updatePhysics();
    
    drawMembrane();
    drawChannels();
    drawIons();
    drawVoltageTrace();
    drawLabels();
    
    // updateCodeDisplay(); // Removed - code shown in editor
  };

  function updatePhysics() {
    // Apply stimulus
    if (stimulusCurrent > 0 && phase === 'resting') {
      membranePotential += stimulusCurrent * 0.05;
      if (membranePotential >= threshold) {
        phase = 'depolarizing';
        phaseTime = 0;
      }
    }

    // Phase transitions
    phaseTime += 0.016;
    
    switch(phase) {
      case 'depolarizing':
        m = p.lerp(m, 1, 0.15);
        h = p.lerp(h, 0.3, 0.03);
        membranePotential = p.lerp(membranePotential, peakPotential, 0.2);
        
        // Spawn Na+ ions moving in
        if (p.random() < 0.4) spawnIon('Na', 'in');
        
        // Open Na+ channels
        channels.filter(c => c.type === 'Na').forEach(c => c.open = true);
        
        if (membranePotential > 30) {
          phase = 'repolarizing';
          phaseTime = 0;
        }
        break;
        
      case 'repolarizing':
        m = p.lerp(m, 0, 0.1);
        n = p.lerp(n, 0.8, 0.1);
        h = p.lerp(h, 0, 0.05);
        membranePotential = p.lerp(membranePotential, -80, 0.12);
        
        // Spawn K+ ions moving out
        if (p.random() < 0.4) spawnIon('K', 'out');
        
        // Close Na+, open K+ channels
        channels.filter(c => c.type === 'Na').forEach(c => c.open = false);
        channels.filter(c => c.type === 'K').forEach(c => c.open = true);
        
        if (membranePotential < -75) {
          phase = 'hyperpolarization';
          phaseTime = 0;
        }
        break;
        
      case 'hyperpolarization':
        n = p.lerp(n, 0.3, 0.05);
        membranePotential = p.lerp(membranePotential, -85, 0.05);
        
        if (p.random() < 0.1) spawnIon('K', 'out');
        
        if (phaseTime > 0.5) {
          phase = 'recovery';
          phaseTime = 0;
        }
        break;
        
      case 'recovery':
        membranePotential = p.lerp(membranePotential, restingPotential, 0.03);
        n = p.lerp(n, 0.3, 0.02);
        h = p.lerp(h, 0.6, 0.02);
        
        channels.filter(c => c.type === 'K').forEach(c => c.open = false);
        
        if (Math.abs(membranePotential - restingPotential) < 1) {
          phase = 'resting';
          phaseTime = 0;
        }
        break;
        
      case 'resting':
      default:
        membranePotential = p.lerp(membranePotential, restingPotential, 0.02);
        break;
    }

    // Update voltage history
    voltageHistory.push(membranePotential);
    if (voltageHistory.length > 300) voltageHistory.shift();
  }

  function spawnIon(type, direction) {
    let channel = channels.find(c => c.type === type && c.open);
    if (!channel) return;
    
    ions.push({
      x: channel.x + (direction === 'in' ? -30 : 30),
      y: channel.y + p.random(-10, 10),
      vx: direction === 'in' ? 3 : -3,
      vy: p.random(-1, 1),
      type: type,
      life: 1
    });
  }

  function drawMembrane() {
    // Extracellular label
    p.fill(100, 180, 255, 100);
    p.noStroke();
    p.textAlign(p.CENTER);
    p.textSize(12);
    p.text('EXTRACELLULAR (outside)', 300, 160);
    p.text('High Na⁺, Low K⁺', 300, 175);

    // Membrane
    p.fill(60, 40, 80);
    p.noStroke();
    p.rect(150, 190, 300, 200, 0);

    // Phospholipid representation
    for (let x = 160; x < 440; x += 20) {
      // Outer layer
      p.fill(200, 150, 100);
      p.circle(x, 195, 12);
      p.stroke(200, 150, 100);
      p.strokeWeight(2);
      p.line(x, 200, x, 240);
      
      // Inner layer
      p.noStroke();
      p.fill(200, 150, 100);
      p.circle(x, 385, 12);
      p.stroke(200, 150, 100);
      p.strokeWeight(2);
      p.line(x, 380, x, 340);
    }

    // Intracellular label
    p.noStroke();
    p.fill(255, 100, 100, 100);
    p.textAlign(p.CENTER);
    p.textSize(12);
    p.text('INTRACELLULAR (inside)', 300, 420);
    p.text('Low Na⁺, High K⁺', 300, 435);
  }

  function drawChannels() {
    channels.forEach(ch => {
      // Channel pore
      p.fill(ch.open ? 40 : 80, ch.open ? 60 : 60, ch.open ? 40 : 80);
      p.stroke(ch.color[0], ch.color[1], ch.color[2], ch.open ? 255 : 100);
      p.strokeWeight(2);
      p.rect(ch.x - 15, ch.y - 40, 30, 80, 4);

      // Gate
      let gateY = ch.open ? ch.y - 50 : ch.y;
      p.fill(ch.color[0], ch.color[1], ch.color[2], ch.open ? 100 : 200);
      p.noStroke();
      p.rect(ch.x - 12, gateY - 5, 24, 10, 2);

      // Label
      p.fill(ch.color[0], ch.color[1], ch.color[2]);
      p.textAlign(p.CENTER);
      p.textSize(10);
      p.text(ch.type + '⁺', ch.x, ch.y + 55);
      p.text(ch.open ? 'OPEN' : 'closed', ch.x, ch.y + 68);
    });
  }

  function drawIons() {
    for (let i = ions.length - 1; i >= 0; i--) {
      let ion = ions[i];
      ion.x += ion.vx;
      ion.y += ion.vy;
      ion.life -= 0.01;

      if (ion.life <= 0 || ion.x < 100 || ion.x > 500) {
        ions.splice(i, 1);
        continue;
      }

      // Ion visualization
      let color = ion.type === 'Na' ? [255, 100, 100] : [100, 180, 255];
      
      // Glow
      p.noStroke();
      for (let g = 15; g > 0; g -= 3) {
        p.fill(color[0], color[1], color[2], ion.life * 10);
        p.circle(ion.x, ion.y, 10 + g);
      }
      
      // Ion
      p.fill(color[0], color[1], color[2], ion.life * 255);
      p.circle(ion.x, ion.y, 10);
      
      p.fill(255, ion.life * 255);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(8);
      p.text(ion.type + '⁺', ion.x, ion.y);
    }
  }

  function drawVoltageTrace() {
    // Graph background
    p.fill(20, 25, 35);
    p.stroke(40, 50, 70);
    p.strokeWeight(1);
    p.rect(500, 180, 280, 200, 8);

    // Grid lines
    p.stroke(40, 50, 70);
    for (let v = -80; v <= 40; v += 40) {
      let y = p.map(v, -100, 60, 370, 190);
      p.line(510, y, 770, y);
      p.noStroke();
      p.fill(100);
      p.textAlign(p.RIGHT);
      p.textSize(9);
      p.text(v + 'mV', 505, y + 3);
      p.stroke(40, 50, 70);
    }

    // Threshold line
    let threshY = p.map(threshold, -100, 60, 370, 190);
    p.stroke(255, 159, 67, 100);
    p.strokeWeight(1);
    p.setLineDash([5, 5]);
    p.line(510, threshY, 770, threshY);
    p.setLineDash([]);
    p.noStroke();
    p.fill(255, 159, 67);
    p.textAlign(p.LEFT);
    p.textSize(9);
    p.text('threshold', 715, threshY - 5);

    // Voltage trace
    p.stroke(0, 212, 255);
    p.strokeWeight(2);
    p.noFill();
    p.beginShape();
    for (let i = 0; i < voltageHistory.length; i++) {
      let x = p.map(i, 0, 300, 510, 770);
      let y = p.map(voltageHistory[i], -100, 60, 370, 190);
      p.vertex(x, y);
    }
    p.endShape();

    // Current voltage indicator
    let currentY = p.map(membranePotential, -100, 60, 370, 190);
    p.fill(0, 212, 255);
    p.noStroke();
    p.circle(770, currentY, 8);
    
    p.textAlign(p.LEFT);
    p.textSize(12);
    p.text(`${membranePotential.toFixed(1)} mV`, 720, 175);

    // Title
    p.fill(200);
    p.textAlign(p.CENTER);
    p.textSize(11);
    p.text('Membrane Potential', 640, 172);
  }

  // Helper for dashed lines
  p.setLineDash = function(list) {
    p.drawingContext.setLineDash(list);
  };

  function drawLabels() {
    // Title
    p.noStroke();
    p.fill(230);
    p.textAlign(p.LEFT);
    p.textSize(16);
    p.text('Action Potential', 30, 30);
    
    // Phase indicator
    let phaseColors = {
      'resting': [100, 180, 100],
      'depolarizing': [255, 200, 100],
      'repolarizing': [255, 100, 100],
      'hyperpolarization': [150, 100, 255],
      'recovery': [100, 200, 200]
    };
    let pc = phaseColors[phase] || [150, 150, 150];
    
    p.fill(pc[0], pc[1], pc[2]);
    p.textSize(14);
    p.text(`Phase: ${phase.toUpperCase()}`, 30, 55);

    // Legend
    p.fill(255, 100, 100);
    p.circle(30, 90, 12);
    p.fill(200);
    p.textSize(11);
    p.text('Na⁺ (sodium)', 45, 94);

    p.fill(100, 180, 255);
    p.circle(30, 110, 12);
    p.fill(200);
    p.text('K⁺ (potassium)', 45, 114);

    // Instructions
    p.fill(120);
    p.textSize(10);
    p.text('Use slider or click "Trigger Spike" to fire', 30, 140);
  }
};


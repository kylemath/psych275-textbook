// ============================================
// CHAPTER 12: SLEEP & CONSCIOUSNESS
// Sleep Stages and Brainwave Visualization
// ============================================
// Watch brainwaves change through sleep stages!
// From alert wakefulness to deep slow-wave sleep
// and dreaming REM sleep.

window.initSketch = function(p) {
  
  // ========== ADJUSTABLE PARAMETERS ==========
  // Try changing these values and click "Run"!
  
  let currentStage = 'awake';  // Current sleep stage
  let waveAmplitude = 1.0;     // Brainwave amplitude multiplier
  let waveSpeed = 1.0;         // Animation speed
  let showLabels = true;       // Show frequency labels
  
  // ===========================================

  const stages = {
    awake: { 
      name: 'Awake (Alert)',
      waves: [
        { type: 'beta', freq: 20, amp: 0.3, color: [255, 100, 100] },
        { type: 'alpha', freq: 10, amp: 0.5, color: [255, 200, 100] }
      ],
      desc: 'Beta (13-30Hz): Active thinking\nAlpha (8-12Hz): Relaxed awareness'
    },
    n1: {
      name: 'N1 (Light Sleep)',
      waves: [
        { type: 'theta', freq: 6, amp: 0.7, color: [100, 255, 200] },
        { type: 'alpha', freq: 10, amp: 0.2, color: [255, 200, 100] }
      ],
      desc: 'Theta (4-7Hz): Drowsiness\nHypnagogic imagery, muscle twitches'
    },
    n2: {
      name: 'N2 (Light-Medium Sleep)',
      waves: [
        { type: 'theta', freq: 5, amp: 0.6, color: [100, 255, 200] },
        { type: 'spindle', freq: 12, amp: 0.4, color: [200, 150, 255] },
        { type: 'kcomplex', freq: 0.5, amp: 0.8, color: [255, 150, 200] }
      ],
      desc: 'Sleep spindles (12-14Hz): Memory\nK-complexes: Arousal suppression'
    },
    n3: {
      name: 'N3 (Deep/Slow-Wave Sleep)',
      waves: [
        { type: 'delta', freq: 1.5, amp: 1.0, color: [100, 150, 255] }
      ],
      desc: 'Delta (0.5-4Hz): Deep restoration\nGrowth hormone release, repair'
    },
    rem: {
      name: 'REM (Dreaming)',
      waves: [
        { type: 'theta', freq: 5, amp: 0.5, color: [100, 255, 200] },
        { type: 'beta', freq: 18, amp: 0.4, color: [255, 100, 100] },
        { type: 'sawtooth', freq: 3, amp: 0.3, color: [255, 255, 100] }
      ],
      desc: 'Mixed frequencies like waking\nRapid eye movements, vivid dreams'
    }
  };

  let time = 0;
  let waveHistory = [];
  let eyePosition = 0;
  let muscleActivity = 1;

  p.setup = function() {
    p.createCanvas(800, 500);
    createControls();
    
    // Initialize wave history
    for (let i = 0; i < 400; i++) {
      waveHistory.push(0);
    }
  };

  function createControls() {
    const panel = document.getElementById('controlsPanel');
    panel.style.display = 'flex';
    panel.innerHTML = `
      <button class="btn" id="awakeBtn">☀️ Awake</button>
      <button class="btn" id="n1Btn">😴 N1</button>
      <button class="btn" id="n2Btn">💤 N2</button>
      <button class="btn" id="n3Btn">🌙 N3 (Deep)</button>
      <button class="btn" id="remBtn">💭 REM</button>
      <div class="control-group">
        <label class="control-label">Speed</label>
        <input type="range" id="speed" min="20" max="200" value="100">
      </div>
    `;

    document.getElementById('awakeBtn').addEventListener('click', () => setStage('awake'));
    document.getElementById('n1Btn').addEventListener('click', () => setStage('n1'));
    document.getElementById('n2Btn').addEventListener('click', () => setStage('n2'));
    document.getElementById('n3Btn').addEventListener('click', () => setStage('n3'));
    document.getElementById('remBtn').addEventListener('click', () => setStage('rem'));
    
    document.getElementById('speed').addEventListener('input', (e) => {
      waveSpeed = e.target.value / 100;
    });
  }

  function setStage(stage) {
    currentStage = stage;
    
    // Update physiological states
    switch(stage) {
      case 'awake': muscleActivity = 1; break;
      case 'n1': muscleActivity = 0.7; break;
      case 'n2': muscleActivity = 0.4; break;
      case 'n3': muscleActivity = 0.1; break;
      case 'rem': muscleActivity = 0.05; break; // REM atonia
    }
  }

  p.draw = function() {
    p.background(8, 12, 20);
    time += 0.016 * waveSpeed;

    updateWaves();
    
    drawSleepCycle();
    drawBrainwaves();
    drawEEGTrace();
    drawPhysiology();
    drawInfoPanel();
    drawLabels();
  };

  function updateWaves() {
    let stage = stages[currentStage];
    let combinedWave = 0;
    
    stage.waves.forEach(wave => {
      let freq = wave.freq * waveSpeed;
      let value = 0;
      
      if (wave.type === 'kcomplex') {
        // K-complex: occasional sharp waves
        let kTime = (time * 0.3) % 3;
        if (kTime < 0.3) {
          value = Math.sin(kTime * 20) * Math.exp(-kTime * 5) * wave.amp;
        }
      } else if (wave.type === 'spindle') {
        // Sleep spindle: waxing and waning
        let envelope = Math.sin(time * 0.5) * 0.5 + 0.5;
        value = Math.sin(time * freq) * wave.amp * envelope;
      } else if (wave.type === 'sawtooth') {
        // Sawtooth waves in REM
        value = ((time * freq) % 1) * wave.amp - wave.amp / 2;
      } else {
        // Regular sinusoidal waves
        value = Math.sin(time * freq) * wave.amp;
      }
      
      combinedWave += value * waveAmplitude;
    });
    
    // Add noise
    combinedWave += (p.noise(time * 10) - 0.5) * 0.1;
    
    waveHistory.push(combinedWave);
    if (waveHistory.length > 400) waveHistory.shift();
  }

  function drawSleepCycle() {
    // Hypnogram
    p.fill(20, 25, 35);
    p.stroke(40, 50, 70);
    p.strokeWeight(1);
    p.rect(50, 30, 350, 100, 8);

    p.noStroke();
    p.fill(150);
    p.textAlign(p.LEFT);
    p.textSize(11);
    p.text('Typical Sleep Cycle (90 min)', 60, 50);

    // Draw hypnogram stages
    const stageOrder = ['awake', 'rem', 'n1', 'n2', 'n3'];
    const stageYs = { awake: 60, rem: 70, n1: 85, n2: 100, n3: 115 };
    
    // Stage labels
    p.fill(100);
    p.textSize(9);
    stageOrder.forEach(s => {
      p.text(s.toUpperCase(), 55, stageYs[s] + 4);
    });

    // Typical cycle path
    const cyclePath = [
      { stage: 'awake', x: 0 },
      { stage: 'n1', x: 5 },
      { stage: 'n2', x: 15 },
      { stage: 'n3', x: 35 },
      { stage: 'n2', x: 55 },
      { stage: 'rem', x: 70 },
      { stage: 'n1', x: 90 }
    ];

    p.stroke(0, 212, 255);
    p.strokeWeight(2);
    p.noFill();
    p.beginShape();
    cyclePath.forEach(pt => {
      let x = 90 + pt.x * 3;
      let y = stageYs[pt.stage];
      p.vertex(x, y);
    });
    p.endShape();

    // Current stage indicator
    let currentY = stageYs[currentStage];
    p.fill(255, 200, 100);
    p.noStroke();
    p.circle(95 + ((time * 5) % 270), currentY, 8);

    // Current stage highlight
    p.fill(stages[currentStage].waves[0].color[0], 
           stages[currentStage].waves[0].color[1], 
           stages[currentStage].waves[0].color[2], 100);
    p.rect(90, currentY - 8, 280, 16, 3);
  }

  function drawBrainwaves() {
    let stage = stages[currentStage];
    let yStart = 180;
    let waveHeight = 60;

    p.fill(150);
    p.textAlign(p.LEFT);
    p.textSize(11);
    p.text('Component Waves:', 60, 160);

    stage.waves.forEach((wave, i) => {
      let y = yStart + i * (waveHeight + 20);
      
      // Wave label
      p.noStroke();
      p.fill(wave.color[0], wave.color[1], wave.color[2]);
      p.textSize(10);
      p.text(`${wave.type.toUpperCase()} (${wave.freq}Hz)`, 60, y - 5);

      // Wave display
      p.stroke(wave.color[0], wave.color[1], wave.color[2]);
      p.strokeWeight(2);
      p.noFill();
      p.beginShape();
      
      for (let x = 60; x < 390; x += 2) {
        let t = time + (x - 60) * 0.01;
        let value;
        
        if (wave.type === 'kcomplex') {
          let kTime = (t * 0.3) % 3;
          value = kTime < 0.3 ? Math.sin(kTime * 20) * Math.exp(-kTime * 5) : 0;
        } else if (wave.type === 'spindle') {
          let envelope = Math.sin(t * 0.5) * 0.5 + 0.5;
          value = Math.sin(t * wave.freq) * envelope;
        } else if (wave.type === 'sawtooth') {
          value = ((t * wave.freq) % 1) - 0.5;
        } else {
          value = Math.sin(t * wave.freq);
        }
        
        p.vertex(x, y + value * waveHeight * wave.amp * 0.5);
      }
      p.endShape();
    });
  }

  function drawEEGTrace() {
    // Combined EEG
    p.fill(20, 25, 35);
    p.stroke(40, 50, 70);
    p.strokeWeight(1);
    p.rect(420, 30, 360, 180, 8);

    p.noStroke();
    p.fill(180);
    p.textAlign(p.LEFT);
    p.textSize(12);
    p.text('Combined EEG', 435, 55);

    p.fill(stages[currentStage].waves[0].color[0],
           stages[currentStage].waves[0].color[1],
           stages[currentStage].waves[0].color[2]);
    p.textSize(14);
    p.text(stages[currentStage].name, 540, 55);

    // EEG trace
    p.stroke(0, 212, 255);
    p.strokeWeight(1.5);
    p.noFill();
    p.beginShape();
    for (let i = 0; i < waveHistory.length; i++) {
      let x = p.map(i, 0, waveHistory.length, 435, 765);
      let y = 130 + waveHistory[i] * 60;
      p.vertex(x, y);
    }
    p.endShape();

    // Grid lines
    p.stroke(40, 50, 70);
    p.strokeWeight(0.5);
    for (let y = 70; y < 200; y += 40) {
      p.line(435, y, 765, y);
    }
  }

  function drawPhysiology() {
    // Physiological indicators
    p.fill(20, 25, 35);
    p.stroke(40, 50, 70);
    p.strokeWeight(1);
    p.rect(420, 230, 360, 120, 8);

    p.noStroke();
    p.fill(150);
    p.textAlign(p.LEFT);
    p.textSize(11);
    p.text('Physiological State:', 435, 255);

    // Eye movement
    p.fill(80);
    p.textSize(10);
    p.text('Eye Movement:', 435, 280);
    
    let eyeMovement = currentStage === 'rem' ? 
      Math.sin(time * 8) * 15 : 
      (currentStage === 'awake' ? Math.sin(time * 2) * 5 : 0);
    
    // Eyes
    p.fill(240);
    p.stroke(100);
    p.strokeWeight(1);
    p.ellipse(580, 275, 30, 20);
    p.ellipse(620, 275, 30, 20);
    
    // Pupils
    p.fill(50);
    p.noStroke();
    p.circle(580 + eyeMovement, 275, 8);
    p.circle(620 + eyeMovement, 275, 8);

    // REM indicator
    if (currentStage === 'rem') {
      p.fill(255, 200, 100);
      p.textSize(9);
      p.text('RAPID', 650, 280);
    }

    // Muscle tone
    p.fill(80);
    p.textSize(10);
    p.text('Muscle Tone:', 435, 320);
    
    p.fill(40, 50, 70);
    p.rect(520, 308, 150, 20, 4);
    
    p.fill(100, 255, 180);
    p.rect(520, 308, 150 * muscleActivity, 20, 4);
    
    p.fill(255);
    p.textSize(9);
    p.text(`${(muscleActivity * 100).toFixed(0)}%`, 680, 322);

    // REM atonia note
    if (currentStage === 'rem') {
      p.fill(255, 150, 100);
      p.textSize(9);
      p.text('(REM atonia prevents acting out dreams)', 435, 340);
    }
  }

  function drawInfoPanel() {
    p.fill(20, 25, 35);
    p.stroke(40, 50, 70);
    p.strokeWeight(1);
    p.rect(420, 365, 360, 110, 8);

    let stage = stages[currentStage];
    
    p.noStroke();
    p.fill(180);
    p.textAlign(p.LEFT);
    p.textSize(11);
    p.text('Stage Characteristics:', 435, 390);

    p.fill(120);
    p.textSize(10);
    let lines = stage.desc.split('\n');
    lines.forEach((line, i) => {
      p.text(line, 435, 410 + i * 14);
    });
  }

  function drawLabels() {
    p.noStroke();
    p.fill(230);
    p.textAlign(p.LEFT);
    p.textSize(16);
    p.text('Sleep Stages & Brainwaves', 30, 480);
    
    p.fill(150);
    p.textSize(11);
    p.text('Click stage buttons to see different brainwave patterns', 250, 480);
  }
};





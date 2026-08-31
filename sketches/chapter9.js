// ============================================
// CHAPTER 8: ATTENTION
// Spotlight Attention Visualization
// ============================================
// See how attention filters information!
// The "spotlight" enhances attended stimuli
// while suppressing unattended ones.

window.initSketch = function(p) {
  
  // ========== ADJUSTABLE PARAMETERS ==========
  // Try changing these values and click "Run"!
  
  let spotlightRadius = 120;   // Size of attention spotlight
  let spotlightIntensity = 1.0; // How much attention boosts signals
  let numDistractors = 15;     // Number of distractor stimuli
  let noiseLevel = 0.3;        // Background neural noise
  let attentionDecay = 0.02;   // How fast attention fades
  
  // ===========================================

  let stimuli = [];
  let target = null;
  let attentionX = 400;
  let attentionY = 250;
  let time = 0;
  let particles = [];

  p.setup = function() {
    p.createCanvas(800, 500);
    initStimuli();
    createControls();
  };

  function createControls() {
    const panel = document.getElementById('controlsPanel');
    panel.style.display = 'flex';
    panel.innerHTML = `
      <div class="control-group">
        <label class="control-label">Spotlight Size</label>
        <input type="range" id="spotSize" min="50" max="200" value="120">
        <span class="control-value" id="spotSizeVal">120px</span>
      </div>
      <div class="control-group">
        <label class="control-label">Neural Noise</label>
        <input type="range" id="noise" min="0" max="80" value="30">
        <span class="control-value" id="noiseVal">30%</span>
      </div>
      <button class="btn" id="newTarget">New Target</button>
      <button class="btn" id="resetBtn">Reset</button>
    `;

    document.getElementById('spotSize').addEventListener('input', (e) => {
      spotlightRadius = parseInt(e.target.value);
      document.getElementById('spotSizeVal').textContent = `${e.target.value}px`;
    });

    document.getElementById('noise').addEventListener('input', (e) => {
      noiseLevel = e.target.value / 100;
      document.getElementById('noiseVal').textContent = `${e.target.value}%`;
    });

    document.getElementById('newTarget').addEventListener('click', initStimuli);
    document.getElementById('resetBtn').addEventListener('click', () => {
      attentionX = 400;
      attentionY = 250;
    });
  }

  function initStimuli() {
    stimuli = [];
    
    // Create target (red circle)
    target = {
      x: 100 + p.random(400),
      y: 100 + p.random(300),
      size: 35,
      color: [255, 100, 100],
      isTarget: true,
      activation: 0
    };
    stimuli.push(target);

    // Create distractors (blue circles)
    for (let i = 0; i < numDistractors; i++) {
      stimuli.push({
        x: 50 + p.random(500),
        y: 50 + p.random(400),
        size: 25 + p.random(15),
        color: [100, 150, 255],
        isTarget: false,
        activation: 0
      });
    }
  }

  p.draw = function() {
    p.background(8, 12, 20);
    time += 0.016;

    // Move attention toward mouse
    attentionX = p.lerp(attentionX, p.mouseX, 0.08);
    attentionY = p.lerp(attentionY, p.mouseY, 0.08);

    // Keep within bounds
    attentionX = p.constrain(attentionX, 50, 550);
    attentionY = p.constrain(attentionY, 50, 450);

    updateStimuli();
    updateParticles();
    
    drawBackground();
    drawSpotlight();
    drawStimuli();
    drawNeuralActivity();
    drawLabels();
  };

  function updateStimuli() {
    stimuli.forEach(stim => {
      let distToAttention = p.dist(attentionX, attentionY, stim.x, stim.y);
      let inSpotlight = distToAttention < spotlightRadius;
      
      // Attention modulation
      let attentionBoost = inSpotlight ? 
        (1 - distToAttention / spotlightRadius) * spotlightIntensity : 0;
      
      // Base activation + noise
      let baseActivation = stim.isTarget ? 0.6 : 0.3;
      let noise = (p.noise(stim.x * 0.01, stim.y * 0.01, time) - 0.5) * noiseLevel;
      
      let targetActivation = baseActivation + attentionBoost + noise;
      stim.activation = p.lerp(stim.activation, targetActivation, 0.1);
      stim.activation = p.constrain(stim.activation, 0, 1);

      // Spawn particles for highly activated stimuli
      if (stim.activation > 0.7 && p.random() < 0.1) {
        particles.push({
          x: stim.x,
          y: stim.y,
          vx: p.random(-2, 2),
          vy: p.random(-3, -1),
          life: 1,
          color: stim.color
        });
      }
    });
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      let p_particle = particles[i];
      p_particle.x += p_particle.vx;
      p_particle.y += p_particle.vy;
      p_particle.life -= 0.03;
      
      if (p_particle.life <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  function drawBackground() {
    // Visual field boundary
    p.noFill();
    p.stroke(40, 50, 70);
    p.strokeWeight(2);
    p.rect(30, 30, 540, 440, 12);

    // Neural noise visualization
    p.noStroke();
    for (let i = 0; i < 50; i++) {
      let x = 40 + (i * 73 + time * 50) % 520;
      let y = 40 + (i * 47 + time * 30) % 420;
      let noiseVal = p.noise(x * 0.01, y * 0.01, time * 0.5);
      p.fill(100, 150, 200, noiseVal * noiseLevel * 30);
      p.circle(x, y, 3 + noiseVal * 4);
    }
  }

  function drawSpotlight() {
    // Attention spotlight gradient
    for (let r = spotlightRadius; r > 0; r -= 5) {
      let alpha = (spotlightRadius - r) / spotlightRadius * 30;
      p.noStroke();
      p.fill(255, 220, 100, alpha);
      p.circle(attentionX, attentionY, r * 2);
    }

    // Spotlight edge
    p.noFill();
    p.stroke(255, 220, 100, 100);
    p.strokeWeight(2);
    p.circle(attentionX, attentionY, spotlightRadius * 2);

    // Crosshair
    p.stroke(255, 220, 100, 150);
    p.strokeWeight(1);
    p.line(attentionX - 10, attentionY, attentionX + 10, attentionY);
    p.line(attentionX, attentionY - 10, attentionX, attentionY + 10);
  }

  function drawStimuli() {
    // Draw particles first
    particles.forEach(pt => {
      p.noStroke();
      p.fill(pt.color[0], pt.color[1], pt.color[2], pt.life * 150);
      p.circle(pt.x, pt.y, 5 * pt.life);
    });

    // Draw stimuli
    stimuli.forEach(stim => {
      let size = stim.size * (0.8 + stim.activation * 0.4);
      
      // Glow effect based on activation
      if (stim.activation > 0.3) {
        for (let g = 20; g > 0; g -= 4) {
          p.noStroke();
          p.fill(stim.color[0], stim.color[1], stim.color[2], stim.activation * 15);
          p.circle(stim.x, stim.y, size + g);
        }
      }

      // Stimulus body
      let brightness = 50 + stim.activation * 205;
      p.fill(
        stim.color[0] * brightness / 255,
        stim.color[1] * brightness / 255,
        stim.color[2] * brightness / 255
      );
      p.stroke(stim.color[0], stim.color[1], stim.color[2], 200);
      p.strokeWeight(2);
      p.circle(stim.x, stim.y, size);

      // Target indicator
      if (stim.isTarget) {
        p.noFill();
        p.stroke(255, 100, 100, 100 + Math.sin(time * 5) * 50);
        p.strokeWeight(2);
        p.circle(stim.x, stim.y, size + 15);
        
        p.noStroke();
        p.fill(255, 100, 100);
        p.textAlign(p.CENTER);
        p.textSize(9);
        p.text('TARGET', stim.x, stim.y + size / 2 + 18);
      }
    });
  }

  function drawNeuralActivity() {
    // Info panel
    p.fill(15, 20, 30);
    p.stroke(40, 50, 70);
    p.strokeWeight(1);
    p.rect(590, 50, 190, 400, 8);

    p.noStroke();
    p.fill(180);
    p.textAlign(p.LEFT);
    p.textSize(12);
    p.text('Neural Responses', 605, 75);

    // Target response
    let targetResp = target.activation;
    p.fill(255, 100, 100);
    p.textSize(11);
    p.text('Target:', 605, 100);
    
    p.fill(40, 50, 70);
    p.rect(605, 110, 160, 20, 4);
    p.fill(255, 100, 100);
    p.rect(605, 110, targetResp * 160, 20, 4);
    
    // Distractor average
    let distractors = stimuli.filter(s => !s.isTarget);
    let avgDistractor = distractors.reduce((s, d) => s + d.activation, 0) / distractors.length;
    
    p.fill(100, 150, 255);
    p.textSize(11);
    p.text('Avg Distractor:', 605, 155);
    
    p.fill(40, 50, 70);
    p.rect(605, 165, 160, 20, 4);
    p.fill(100, 150, 255);
    p.rect(605, 165, avgDistractor * 160, 20, 4);

    // Signal-to-noise ratio
    let snr = targetResp / (avgDistractor + 0.1);
    p.fill(180);
    p.textSize(11);
    p.text('Signal/Noise Ratio:', 605, 215);
    
    let snrColor = snr > 2 ? [100, 255, 150] : (snr > 1 ? [255, 220, 100] : [255, 100, 100]);
    p.fill(snrColor[0], snrColor[1], snrColor[2]);
    p.textSize(18);
    p.text(snr.toFixed(2), 605, 240);

    // Detection status
    let detected = snr > 1.5 && targetResp > 0.5;
    p.fill(detected ? [100, 255, 150] : [255, 100, 100]);
    p.textSize(14);
    p.text(detected ? '✓ TARGET DETECTED' : '✗ Target unclear', 605, 280);

    // Explanation
    p.fill(120);
    p.textSize(10);
    let explanation = [
      'Attention mechanisms:',
      '',
      '• Enhancement: Attended stimuli',
      '  show stronger responses',
      '',
      '• Suppression: Unattended stimuli',
      '  are filtered out',
      '',
      '• Competitive interactions:',
      '  Stimuli compete for processing',
      '',
      'Move spotlight over target',
      'to improve detection!'
    ];
    
    explanation.forEach((line, i) => {
      p.text(line, 605, 310 + i * 14);
    });
  }

  function drawLabels() {
    // Title
    p.noStroke();
    p.fill(230);
    p.textAlign(p.LEFT);
    p.textSize(16);
    p.text('Attention Spotlight', 30, 500);
    
    p.fill(150);
    p.textSize(11);
    p.text('Move your mouse to direct attention toward the red target', 180, 500);
  }
};





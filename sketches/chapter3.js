// ============================================
// CHAPTER 3: CHEMICAL SIGNALING
// Synaptic Transmission Visualization
// ============================================
// Watch neurotransmitters cross the synapse!
// Vesicle release, diffusion, and receptor binding.

window.initSketch = function(p) {
  // ========== SYNAPSE PARAMETERS ==========
  let vesicles = [];
  let neurotransmitters = [];
  let receptors = [];
  let actionPotentialActive = false;
  let calciumLevel = 0;
  let postsynapticPotential = 0;
  let time = 0;

  p.setup = function() {
    p.createCanvas(800, 500);
    createControls();
    initSynapse();
  };

  function createControls() {
    const panel = document.getElementById('controlsPanel');
    panel.style.display = 'flex';
    panel.innerHTML = `
      <div class="control-group">
        <label class="control-label">Release Probability</label>
        <input type="range" id="releaseProb" min="10" max="100" value="70">
        <span class="control-value" id="releaseProbVal">70%</span>
      </div>
      <div class="control-group">
        <label class="control-label">Receptor Affinity</label>
        <input type="range" id="affinity" min="10" max="100" value="50">
        <span class="control-value" id="affinityVal">50%</span>
      </div>
      <button class="btn" id="releaseBtn">⚡ Release Vesicle</button>
      <button class="btn" id="resetBtn">Reset</button>
    `;

    document.getElementById('releaseProb').addEventListener('input', (e) => {
      document.getElementById('releaseProbVal').textContent = `${e.target.value}%`;
    });

    document.getElementById('affinity').addEventListener('input', (e) => {
      document.getElementById('affinityVal').textContent = `${e.target.value}%`;
    });

    document.getElementById('releaseBtn').addEventListener('click', () => {
      triggerRelease();
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
      neurotransmitters = [];
      postsynapticPotential = 0;
      calciumLevel = 0;
      receptors.forEach(r => { r.bound = false; r.activated = false; });
      initVesicles();
    });

    // updateCodeDisplay(); // Removed - code shown in editor
  }

  function initSynapse() {
    initVesicles();
    initReceptors();
  }

  function initVesicles() {
    vesicles = [];
    for (let i = 0; i < 8; i++) {
      vesicles.push({
        x: 250 + (i % 4) * 50,
        y: 120 + Math.floor(i / 4) * 40,
        size: 25,
        ready: true,
        releasing: false,
        releaseProgress: 0
      });
    }
  }

  function initReceptors() {
    receptors = [];
    for (let i = 0; i < 12; i++) {
      receptors.push({
        x: 200 + i * 40,
        y: 350,
        bound: false,
        activated: false,
        type: i % 3 === 0 ? 'AMPA' : (i % 3 === 1 ? 'NMDA' : 'mGluR')
      });
    }
  }

  function triggerRelease() {
    actionPotentialActive = true;
    calciumLevel = 1;
    
    let releaseProb = parseInt(document.getElementById('releaseProb').value) / 100;
    
    vesicles.forEach(v => {
      if (v.ready && p.random() < releaseProb) {
        v.releasing = true;
        v.releaseProgress = 0;
      }
    });
  }

  function updateCodeDisplay() {
    let boundCount = receptors.filter(r => r.bound).length;
    let activatedCount = receptors.filter(r => r.activated).length;
    
    const code = `<span class="comment">// Synaptic Transmission</span>

<span class="comment">// Presynaptic terminal state:</span>
<span class="keyword">const</span> <span class="variable">calcium</span> = ${calciumLevel.toFixed(2)};
<span class="keyword">const</span> <span class="variable">vesiclesReady</span> = ${vesicles.filter(v => v.ready).length};
<span class="keyword">const</span> <span class="variable">vesiclesReleasing</span> = ${vesicles.filter(v => v.releasing).length};

<span class="comment">// Synaptic cleft:</span>
<span class="keyword">const</span> <span class="variable">freeNeurotransmitters</span> = ${neurotransmitters.length};

<span class="comment">// Postsynaptic membrane:</span>
<span class="keyword">const</span> <span class="variable">receptorsBound</span> = ${boundCount} / ${receptors.length};
<span class="keyword">const</span> <span class="variable">receptorsActivated</span> = ${activatedCount};
<span class="keyword">const</span> <span class="variable">EPSP</span> = ${postsynapticPotential.toFixed(1)} <span class="comment">mV</span>

<span class="comment">// Receptor types:</span>
<span class="comment">// AMPA - fast ionotropic (Na+/K+)</span>
<span class="comment">// NMDA - slow, voltage-gated (Ca2+)</span>
<span class="comment">// mGluR - metabotropic (G-protein)</span>

<span class="comment">// Steps of transmission:</span>
<span class="comment">// 1. Action potential arrives</span>
<span class="comment">// 2. Ca2+ channels open</span>
<span class="comment">// 3. Vesicles fuse (exocytosis)</span>
<span class="comment">// 4. Neurotransmitter diffusion</span>
<span class="comment">// 5. Receptor binding & activation</span>`;
    const el = document.getElementById('codeDisplay'); if (el) el.innerHTML = code;
  }

  p.draw = function() {
    p.background(10, 14, 20);
    time += 0.016;

    updatePhysics();
    
    drawPresynaptic();
    drawSynapticCleft();
    drawPostsynaptic();
    drawNeurotransmitters();
    drawSignalMeter();
    drawLabels();
    
    // updateCodeDisplay(); // Removed - code shown in editor
  };

  function updatePhysics() {
    // Calcium decay
    calciumLevel *= 0.97;
    if (calciumLevel < 0.01) {
      actionPotentialActive = false;
      calciumLevel = 0;
    }

    // Vesicle release animation
    vesicles.forEach(v => {
      if (v.releasing) {
        v.releaseProgress += 0.05;
        
        // Spawn neurotransmitters during fusion
        if (v.releaseProgress > 0.5 && v.releaseProgress < 0.7) {
          for (let i = 0; i < 3; i++) {
            neurotransmitters.push({
              x: v.x + p.random(-10, 10),
              y: v.y + 30,
              vx: p.random(-1, 1),
              vy: p.random(1, 3),
              life: 1,
              bound: false
            });
          }
        }
        
        if (v.releaseProgress >= 1) {
          v.releasing = false;
          v.ready = false;
          // Reset after cooldown
          setTimeout(() => { v.ready = true; }, 2000);
        }
      }
    });

    // Neurotransmitter physics
    let affinity = parseInt(document.getElementById('affinity').value) / 100;
    
    for (let i = neurotransmitters.length - 1; i >= 0; i--) {
      let nt = neurotransmitters[i];
      if (nt.bound) continue;
      
      // Diffusion
      nt.x += nt.vx + p.random(-0.5, 0.5);
      nt.y += nt.vy;
      nt.vy *= 0.98; // Slow down
      nt.life -= 0.003;
      
      // Check receptor binding
      receptors.forEach(r => {
        if (!r.bound && p.dist(nt.x, nt.y, r.x, r.y) < 25) {
          if (p.random() < affinity * 0.3) {
            nt.bound = true;
            nt.x = r.x;
            nt.y = r.y - 10;
            r.bound = true;
            r.activated = true;
            postsynapticPotential += 3;
          }
        }
      });
      
      // Remove old transmitters
      if (nt.life <= 0 || nt.y > 400) {
        neurotransmitters.splice(i, 1);
      }
    }

    // EPSP decay
    postsynapticPotential *= 0.995;
    
    // Receptor deactivation
    receptors.forEach(r => {
      if (r.bound && p.random() < 0.002) {
        r.bound = false;
        r.activated = false;
      }
    });
  }

  function drawPresynaptic() {
    // Presynaptic terminal
    p.fill(30, 40, 60);
    p.stroke(80, 100, 140);
    p.strokeWeight(2);
    p.rect(150, 50, 350, 150, 0, 0, 20, 20);

    // Label
    p.noStroke();
    p.fill(150);
    p.textAlign(p.CENTER);
    p.textSize(12);
    p.text('PRESYNAPTIC TERMINAL', 325, 70);

    // Vesicles
    vesicles.forEach(v => {
      if (!v.ready && !v.releasing) return;
      
      let yOffset = v.releasing ? v.releaseProgress * 50 : 0;
      let size = v.size * (v.releasing ? (1 - v.releaseProgress * 0.5) : 1);
      
      // Vesicle membrane
      p.fill(100, 150, 200, v.releasing ? 150 : 255);
      p.stroke(150, 200, 255, v.releasing ? 100 : 200);
      p.strokeWeight(2);
      p.circle(v.x, v.y + yOffset, size);
      
      // Neurotransmitters inside
      if (!v.releasing || v.releaseProgress < 0.5) {
        p.noStroke();
        p.fill(255, 200, 100);
        for (let i = 0; i < 5; i++) {
          let angle = (i / 5) * p.TWO_PI + time;
          let r = 6;
          p.circle(v.x + Math.cos(angle) * r, v.y + yOffset + Math.sin(angle) * r, 4);
        }
      }
    });

    // Calcium indicator
    p.noStroke();
    p.fill(0, 255, 200, calciumLevel * 100);
    for (let i = 0; i < 5; i++) {
      p.circle(480 + i * 12, 120, 15 * calciumLevel);
    }
    p.fill(150);
    p.textSize(10);
    p.textAlign(p.LEFT);
    p.text('Ca²⁺', 540, 123);
  }

  function drawSynapticCleft() {
    // Cleft area
    p.noFill();
    p.stroke(60, 80, 120, 100);
    p.strokeWeight(1);
    
    // Wavy lines representing extracellular space
    for (let y = 210; y < 340; y += 20) {
      p.beginShape();
      for (let x = 150; x < 500; x += 5) {
        let yOffset = Math.sin(x * 0.05 + time * 2) * 3;
        p.vertex(x, y + yOffset);
      }
      p.endShape();
    }

    // Label
    p.noStroke();
    p.fill(100);
    p.textAlign(p.RIGHT);
    p.textSize(11);
    p.text('SYNAPTIC', 140, 260);
    p.text('CLEFT', 140, 275);
    p.text('(~20nm)', 140, 290);
  }

  function drawPostsynaptic() {
    // Postsynaptic membrane
    p.fill(40, 50, 70);
    p.stroke(100, 120, 160);
    p.strokeWeight(2);
    p.rect(150, 340, 350, 120, 20, 20, 0, 0);

    // Label
    p.noStroke();
    p.fill(150);
    p.textAlign(p.CENTER);
    p.textSize(12);
    p.text('POSTSYNAPTIC MEMBRANE', 325, 430);

    // Receptors
    receptors.forEach(r => {
      // Receptor base
      let baseColor = r.activated ? [120, 255, 180] : [80, 100, 140];
      p.fill(baseColor[0], baseColor[1], baseColor[2]);
      p.stroke(150);
      p.strokeWeight(1);
      p.rect(r.x - 12, r.y - 30, 24, 35, 4, 4, 0, 0);

      // Binding site
      p.fill(r.bound ? [255, 200, 100] : [60, 70, 90]);
      p.noStroke();
      p.arc(r.x, r.y - 30, 20, 20, p.PI, 0);

      // Receptor type label
      p.fill(r.activated ? 255 : 120);
      p.textAlign(p.CENTER);
      p.textSize(8);
      p.text(r.type, r.x, r.y + 15);
      
      // Ion flow indicator
      if (r.activated) {
        p.fill(0, 255, 200, 150);
        p.circle(r.x, r.y + 30, 8 + Math.sin(time * 10) * 3);
      }
    });
  }

  function drawNeurotransmitters() {
    neurotransmitters.forEach(nt => {
      if (nt.bound) {
        // Bound neurotransmitter
        p.fill(255, 200, 100);
        p.noStroke();
        p.circle(nt.x, nt.y, 10);
      } else {
        // Free neurotransmitter with trail
        p.noStroke();
        p.fill(255, 200, 100, nt.life * 50);
        p.circle(nt.x - nt.vx * 3, nt.y - nt.vy * 3, 6);
        p.fill(255, 200, 100, nt.life * 255);
        p.circle(nt.x, nt.y, 8);
      }
    });
  }

  function drawSignalMeter() {
    // EPSP meter
    p.fill(30, 40, 55);
    p.stroke(60, 80, 120);
    p.strokeWeight(1);
    p.rect(560, 150, 200, 200, 8);

    p.noStroke();
    p.fill(180);
    p.textAlign(p.CENTER);
    p.textSize(12);
    p.text('Postsynaptic Response', 660, 175);

    // Voltage bar
    let barHeight = p.map(postsynapticPotential, 0, 30, 0, 120);
    p.fill(40, 50, 70);
    p.rect(580, 200, 40, 120, 4);
    
    let barColor = postsynapticPotential > 15 ? [120, 255, 180] : [0, 212, 255];
    p.fill(barColor[0], barColor[1], barColor[2]);
    p.rect(580, 320 - barHeight, 40, barHeight, 4);

    // Value
    p.fill(barColor[0], barColor[1], barColor[2]);
    p.textSize(16);
    p.text(`${postsynapticPotential.toFixed(1)} mV`, 600, 335);

    // EPSP label
    p.fill(120);
    p.textSize(10);
    p.text('EPSP', 600, 195);

    // Receptor status
    let boundCount = receptors.filter(r => r.bound).length;
    p.fill(180);
    p.textAlign(p.LEFT);
    p.textSize(11);
    p.text(`Bound: ${boundCount}/${receptors.length}`, 640, 220);
    p.text(`Free NT: ${neurotransmitters.filter(n => !n.bound).length}`, 640, 240);
    p.text(`Vesicles: ${vesicles.filter(v => v.ready).length}`, 640, 260);

    // Threshold indicator
    if (postsynapticPotential > 15) {
      p.fill(120, 255, 180);
      p.textAlign(p.CENTER);
      p.textSize(14);
      p.text('SIGNAL TRANSMITTED!', 660, 300);
    }
  }

  function drawLabels() {
    p.noStroke();
    p.fill(230);
    p.textAlign(p.LEFT);
    p.textSize(16);
    p.text('Synaptic Transmission', 30, 30);
    
    p.fill(150);
    p.textSize(11);
    p.text('Click "Release Vesicle" to trigger neurotransmitter release', 30, 50);
  }
};


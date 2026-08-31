// ============================================
// CHAPTER 1: HISTORY OF MINDS
// Brain Evolution Timeline Visualization
// ============================================
// Explore 500 million years of brain evolution!
// See how neural complexity increased from simple
// nerve nets to the human cerebral cortex.

window.initSketch = function(p) {
  // ========== EVOLUTION DATA ==========
  const species = [
    { name: "Jellyfish", mya: 500, neurons: 5600, brainSize: 0, color: [100, 200, 255], desc: "Nerve net - no brain" },
    { name: "Flatworm", mya: 450, neurons: 8000, brainSize: 0.001, color: [150, 120, 200], desc: "First centralized ganglia" },
    { name: "Insect", mya: 350, neurons: 100000, brainSize: 0.001, color: [200, 150, 50], desc: "Specialized brain regions" },
    { name: "Fish", mya: 300, neurons: 10000000, brainSize: 0.3, color: [50, 180, 220], desc: "Vertebrate brain plan" },
    { name: "Frog", mya: 250, neurons: 16000000, brainSize: 0.1, color: [100, 200, 100], desc: "Amphibian transition" },
    { name: "Bird", mya: 150, neurons: 200000000, brainSize: 2, color: [255, 180, 100], desc: "Complex behaviors" },
    { name: "Mouse", mya: 100, neurons: 70000000, brainSize: 0.4, color: [180, 180, 180], desc: "Mammalian cortex" },
    { name: "Monkey", mya: 25, neurons: 6000000000, brainSize: 95, color: [200, 150, 120], desc: "Primate expansion" },
    { name: "Human", mya: 0.3, neurons: 86000000000, brainSize: 1400, color: [255, 200, 180], desc: "86 billion neurons" }
  ];

  let timeSlider;
  let currentTime = 500;
  let targetTime = 500;
  let particles = [];
  let selectedSpecies = null;

  p.setup = function() {
    p.createCanvas(800, 500);
    createControls();
  };

  function createControls() {
    const panel = document.getElementById('controlsPanel');
    panel.style.display = 'flex';
    panel.innerHTML = `
      <div class="control-group">
        <label class="control-label">Time (Million Years Ago)</label>
        <input type="range" id="timeSlider" min="0" max="500" value="500" style="width: 250px;">
        <span class="control-value" id="timeVal">500 MYA</span>
      </div>
      <button class="btn" id="playBtn">▶ Animate</button>
      <button class="btn" id="resetBtn">Reset</button>
    `;

    let playing = false;
    let playInterval;

    document.getElementById('timeSlider').addEventListener('input', (e) => {
      targetTime = parseInt(e.target.value);
      document.getElementById('timeVal').textContent = `${targetTime} MYA`;
    });

    document.getElementById('playBtn').addEventListener('click', () => {
      playing = !playing;
      document.getElementById('playBtn').textContent = playing ? '⏸ Pause' : '▶ Animate';
      if (playing) {
        targetTime = 500;
        playInterval = setInterval(() => {
          if (targetTime > 0) {
            targetTime -= 2;
            document.getElementById('timeSlider').value = targetTime;
            document.getElementById('timeVal').textContent = `${Math.round(targetTime)} MYA`;
          } else {
            playing = false;
            document.getElementById('playBtn').textContent = '▶ Animate';
            clearInterval(playInterval);
          }
        }, 50);
      } else {
        clearInterval(playInterval);
      }
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
      targetTime = 500;
      document.getElementById('timeSlider').value = 500;
      document.getElementById('timeVal').textContent = '500 MYA';
    });

    // updateCodeDisplay(); // Removed - code shown in editor
  }

  function updateCodeDisplay() {
    let visibleSpecies = species.filter(s => s.mya >= currentTime);
    let latest = visibleSpecies.length > 0 ? visibleSpecies[visibleSpecies.length - 1] : species[0];
    
    const code = `<span class="comment">// Brain Evolution: 500 Million Years</span>

<span class="keyword">const</span> <span class="variable">currentTime</span> = ${Math.round(currentTime)} <span class="comment">// Million years ago</span>

<span class="comment">// Current most evolved species:</span>
<span class="keyword">const</span> <span class="variable">species</span> = {
  name: <span class="string">"${latest.name}"</span>,
  neurons: <span class="number">${formatNumber(latest.neurons)}</span>,
  brainMass: <span class="number">${latest.brainSize}</span> <span class="comment">// grams</span>,
  description: <span class="string">"${latest.desc}"</span>
};

<span class="comment">// Key evolutionary milestones:</span>
<span class="comment">// 500 MYA: First nerve nets (jellyfish)</span>
<span class="comment">// 450 MYA: Centralized ganglia (worms)</span>
<span class="comment">// 300 MYA: Vertebrate brain plan (fish)</span>
<span class="comment">// 100 MYA: Mammalian cortex</span>
<span class="comment">// 0.3 MYA: Homo sapiens emerges</span>

<span class="comment">// Exponential neuron increase:</span>
<span class="keyword">function</span> <span class="function">logScale</span>(neurons) {
  <span class="keyword">return</span> Math.log10(neurons);
}
<span class="comment">// ${latest.name}: 10^${Math.log10(latest.neurons).toFixed(1)} neurons</span>`;
    const el = document.getElementById('codeDisplay'); if (el) el.innerHTML = code;
  }

  function formatNumber(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(1) + ' billion';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + ' million';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + ' thousand';
    return n.toString();
  }

  p.draw = function() {
    p.background(10, 14, 20);
    
    // Smooth time transition
    currentTime = p.lerp(currentTime, targetTime, 0.08);

    // Draw starfield background
    drawStarfield();

    // Draw timeline
    drawTimeline();

    // Draw species
    drawSpecies();

    // Draw info panel
    drawInfoPanel();

    // Update particles
    updateParticles();

    // updateCodeDisplay(); // Removed - code shown in editor
  };

  function drawStarfield() {
    p.noStroke();
    for (let i = 0; i < 80; i++) {
      let x = (i * 137.5 + p.frameCount * 0.1) % p.width;
      let y = (i * 89.3) % p.height;
      let size = (Math.sin(i + p.frameCount * 0.02) + 1) * 1.5;
      p.fill(255, 255, 255, 30 + Math.sin(i + p.frameCount * 0.05) * 20);
      p.circle(x, y, size);
    }
  }

  function drawTimeline() {
    // Timeline bar
    let y = 420;
    p.stroke(0, 212, 255, 50);
    p.strokeWeight(2);
    p.line(50, y, 750, y);

    // Time markers
    p.textAlign(p.CENTER);
    p.textSize(10);
    for (let mya = 500; mya >= 0; mya -= 100) {
      let x = p.map(mya, 500, 0, 50, 750);
      p.stroke(0, 212, 255, 80);
      p.line(x, y - 5, x, y + 5);
      p.noStroke();
      p.fill(150);
      p.text(`${mya}`, x, y + 20);
    }

    // Current time indicator
    let currentX = p.map(currentTime, 500, 0, 50, 750);
    p.stroke(255, 159, 67);
    p.strokeWeight(2);
    p.line(currentX, y - 15, currentX, y + 15);
    
    p.noStroke();
    p.fill(255, 159, 67);
    p.triangle(currentX - 8, y - 20, currentX + 8, y - 20, currentX, y - 10);
    
    p.textSize(12);
    p.text('NOW', currentX, y + 35);

    // Label
    p.fill(100);
    p.textSize(11);
    p.text('Million Years Ago', 400, y + 50);
  }

  function drawSpecies() {
    let visibleSpecies = species.filter(s => s.mya >= currentTime);
    
    species.forEach((s, i) => {
      let x = p.map(s.mya, 500, 0, 50, 750);
      let y = 200;
      let visible = s.mya >= currentTime;
      
      // Calculate display properties
      let targetAlpha = visible ? 255 : 30;
      let size = p.map(Math.log10(s.neurons), 3, 11, 20, 80);
      
      // Draw connection to timeline
      if (visible) {
        p.stroke(s.color[0], s.color[1], s.color[2], 100);
        p.strokeWeight(1);
        p.line(x, y + size/2 + 10, x, 415);
      }

      // Glow effect for visible species
      if (visible) {
        for (let g = 20; g > 0; g -= 4) {
          p.noStroke();
          p.fill(s.color[0], s.color[1], s.color[2], g);
          p.circle(x, y, size + g * 2);
        }

        // Spawn particles
        if (p.random() < 0.05) {
          particles.push({
            x: x + p.random(-size/2, size/2),
            y: y + p.random(-size/2, size/2),
            vx: p.random(-0.5, 0.5),
            vy: p.random(-1, -0.3),
            life: 1,
            color: s.color
          });
        }
      }

      // Species circle
      p.noStroke();
      p.fill(s.color[0], s.color[1], s.color[2], visible ? 200 : 50);
      p.circle(x, y, size);

      // Inner glow
      if (visible) {
        p.fill(255, 255, 255, 100);
        p.circle(x, y, size * 0.3);
      }

      // Label
      p.fill(visible ? 255 : 80);
      p.textAlign(p.CENTER);
      p.textSize(11);
      p.text(s.name, x, y + size/2 + 25);

      // Neuron count
      if (visible) {
        p.fill(s.color[0], s.color[1], s.color[2]);
        p.textSize(9);
        p.text(formatNumber(s.neurons), x, y);
      }
    });

    // Draw most recent as "selected"
    if (visibleSpecies.length > 0) {
      selectedSpecies = visibleSpecies[visibleSpecies.length - 1];
    }
  }

  function drawInfoPanel() {
    if (!selectedSpecies) return;

    let s = selectedSpecies;
    
    // Panel background
    p.fill(20, 28, 40, 230);
    p.stroke(s.color[0], s.color[1], s.color[2], 150);
    p.strokeWeight(1);
    p.rect(550, 30, 220, 130, 8);

    // Content
    p.noStroke();
    p.fill(255);
    p.textAlign(p.LEFT);
    p.textSize(16);
    p.text(s.name, 565, 55);

    p.fill(s.color[0], s.color[1], s.color[2]);
    p.textSize(12);
    p.text(s.desc, 565, 75);

    p.fill(180);
    p.textSize(11);
    p.text(`Neurons: ${formatNumber(s.neurons)}`, 565, 100);
    p.text(`Brain mass: ${s.brainSize}g`, 565, 118);
    p.text(`Appeared: ${s.mya} MYA`, 565, 136);

    // Neuron scale bar
    let barWidth = p.map(Math.log10(s.neurons), 3, 11, 10, 200);
    p.fill(40, 50, 70);
    p.rect(565, 145, 200, 6, 3);
    p.fill(s.color[0], s.color[1], s.color[2]);
    p.rect(565, 145, barWidth, 6, 3);
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      let pt = particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life -= 0.02;
      
      if (pt.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      p.noStroke();
      p.fill(pt.color[0], pt.color[1], pt.color[2], pt.life * 150);
      p.circle(pt.x, pt.y, 4 * pt.life);
    }
  }

  p.mousePressed = function() {
    // Check if clicked on a species
    species.forEach(s => {
      let x = p.map(s.mya, 500, 0, 50, 750);
      let y = 200;
      let size = p.map(Math.log10(s.neurons), 3, 11, 20, 80);
      if (p.dist(p.mouseX, p.mouseY, x, y) < size/2 && s.mya >= currentTime) {
        targetTime = s.mya;
        document.getElementById('timeSlider').value = targetTime;
        document.getElementById('timeVal').textContent = `${targetTime} MYA`;
      }
    });
  };
};


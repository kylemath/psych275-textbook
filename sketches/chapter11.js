// ============================================
// CHAPTER 10: LEARNING & MEMORY
// Memory Consolidation Visualization
// ============================================
// Watch memories form and consolidate!
// See how hippocampus transfers memories to
// cortex during consolidation.

window.initSketch = function(p) {
  
  // ========== ADJUSTABLE PARAMETERS ==========
  // Try changing these values and click "Run"!
  
  let encodingStrength = 0.7;    // How strong initial encoding is
  let consolidationRate = 0.01;  // Speed of consolidation
  let decayRate = 0.002;         // Memory decay rate
  let rehearsalBoost = 0.1;      // Boost from rehearsal
  
  // ===========================================

  let memories = [];
  let hippocampus = { x: 400, y: 350, memories: [] };
  let cortex = { regions: [], memories: [] };
  let time = 0;
  let particles = [];

  p.setup = function() {
    p.createCanvas(800, 500);
    initCortex();
    createControls();
  };

  function createControls() {
    const panel = document.getElementById('controlsPanel');
    panel.style.display = 'flex';
    panel.innerHTML = `
      <div class="control-group">
        <label class="control-label">Encoding Strength</label>
        <input type="range" id="encoding" min="20" max="100" value="70">
        <span class="control-value" id="encodingVal">70%</span>
      </div>
      <button class="btn" id="newMemory">✨ New Memory</button>
      <button class="btn" id="rehearse">🔄 Rehearse</button>
      <button class="btn" id="sleep">😴 Sleep (Consolidate)</button>
      <button class="btn" id="resetBtn">Clear All</button>
    `;

    document.getElementById('encoding').addEventListener('input', (e) => {
      encodingStrength = e.target.value / 100;
      document.getElementById('encodingVal').textContent = `${e.target.value}%`;
    });

    document.getElementById('newMemory').addEventListener('click', createMemory);
    document.getElementById('rehearse').addEventListener('click', rehearseMemories);
    document.getElementById('sleep').addEventListener('click', consolidate);
    document.getElementById('resetBtn').addEventListener('click', () => {
      memories = [];
      hippocampus.memories = [];
      cortex.memories = [];
      particles = [];
    });
  }

  function initCortex() {
    // Create cortical regions
    cortex.regions = [
      { name: 'Visual', x: 600, y: 100, color: [100, 200, 255] },
      { name: 'Auditory', x: 650, y: 200, color: [255, 180, 100] },
      { name: 'Semantic', x: 580, y: 280, color: [200, 100, 255] },
      { name: 'Motor', x: 200, y: 100, color: [100, 255, 180] },
      { name: 'Emotional', x: 300, y: 380, color: [255, 100, 150] }
    ];
  }

  function createMemory() {
    let memory = {
      id: Date.now(),
      age: 0,
      strength: encodingStrength,
      consolidated: 0,
      corticalStrength: 0,
      color: [p.random(150, 255), p.random(100, 200), p.random(150, 255)],
      regions: cortex.regions.filter(() => p.random() > 0.5).map(r => r.name),
      x: hippocampus.x + p.random(-30, 30),
      y: hippocampus.y + p.random(-20, 20),
      pulsePhase: p.random(p.TWO_PI)
    };
    
    if (memory.regions.length === 0) {
      memory.regions = [cortex.regions[Math.floor(p.random(cortex.regions.length))].name];
    }
    
    memories.push(memory);
    hippocampus.memories.push(memory);

    // Create encoding particles
    for (let i = 0; i < 20; i++) {
      particles.push({
        x: 400,
        y: 150,
        targetX: memory.x,
        targetY: memory.y,
        progress: 0,
        color: memory.color,
        type: 'encoding'
      });
    }
  }

  function rehearseMemories() {
    memories.forEach(m => {
      if (m.strength > 0.1) {
        m.strength = Math.min(1, m.strength + rehearsalBoost);
        
        // Visual feedback
        for (let i = 0; i < 5; i++) {
          particles.push({
            x: m.x,
            y: m.y,
            vx: p.random(-2, 2),
            vy: p.random(-2, 2),
            life: 1,
            color: [255, 220, 100],
            type: 'rehearsal'
          });
        }
      }
    });
  }

  function consolidate() {
    memories.forEach(m => {
      if (m.strength > 0.3 && m.consolidated < 1) {
        m.consolidated = Math.min(1, m.consolidated + 0.3);
        m.corticalStrength = Math.min(1, m.corticalStrength + 0.25);
        
        // Create consolidation particles to cortex
        m.regions.forEach(regionName => {
          let region = cortex.regions.find(r => r.name === regionName);
          if (region) {
            for (let i = 0; i < 8; i++) {
              particles.push({
                x: m.x,
                y: m.y,
                targetX: region.x,
                targetY: region.y,
                progress: 0,
                color: region.color,
                type: 'consolidation'
              });
            }
          }
        });
      }
    });
  }

  p.draw = function() {
    p.background(10, 14, 20);
    time += 0.016;

    updateMemories();
    updateParticles();
    
    drawBrain();
    drawHippocampus();
    drawCortex();
    drawMemories();
    drawParticles();
    drawInfoPanel();
    drawLabels();
  };

  function updateMemories() {
    for (let i = memories.length - 1; i >= 0; i--) {
      let m = memories[i];
      m.age += 0.016;
      
      // Decay (less for consolidated memories)
      let decayFactor = 1 - m.consolidated * 0.8;
      m.strength = Math.max(0, m.strength - decayRate * decayFactor);
      
      // Remove completely forgotten memories
      if (m.strength < 0.05) {
        memories.splice(i, 1);
        let hippIdx = hippocampus.memories.indexOf(m);
        if (hippIdx > -1) hippocampus.memories.splice(hippIdx, 1);
      }
    }
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      let pt = particles[i];
      
      if (pt.type === 'encoding' || pt.type === 'consolidation') {
        pt.progress += 0.03;
        if (pt.progress >= 1) {
          particles.splice(i, 1);
        }
      } else if (pt.type === 'rehearsal') {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 0.03;
        if (pt.life <= 0) {
          particles.splice(i, 1);
        }
      }
    }
  }

  function drawBrain() {
    // Brain outline
    p.noFill();
    p.stroke(50, 60, 80);
    p.strokeWeight(2);
    
    // Simplified brain shape
    p.beginShape();
    p.curveVertex(150, 300);
    p.curveVertex(150, 300);
    p.curveVertex(180, 150);
    p.curveVertex(300, 80);
    p.curveVertex(450, 70);
    p.curveVertex(600, 100);
    p.curveVertex(680, 180);
    p.curveVertex(700, 300);
    p.curveVertex(650, 400);
    p.curveVertex(500, 430);
    p.curveVertex(350, 420);
    p.curveVertex(200, 380);
    p.curveVertex(150, 300);
    p.curveVertex(150, 300);
    p.endShape();
  }

  function drawHippocampus() {
    // Hippocampus glow
    for (let g = 50; g > 0; g -= 5) {
      p.noStroke();
      p.fill(100, 255, 200, (50 - g) * 0.3);
      p.ellipse(hippocampus.x, hippocampus.y, 120 + g, 60 + g/2);
    }

    // Hippocampus shape (seahorse-like)
    p.fill(40, 80, 70);
    p.stroke(100, 255, 200);
    p.strokeWeight(2);
    p.ellipse(hippocampus.x, hippocampus.y, 120, 60);

    // Label
    p.noStroke();
    p.fill(100, 255, 200);
    p.textAlign(p.CENTER);
    p.textSize(12);
    p.text('HIPPOCAMPUS', hippocampus.x, hippocampus.y + 50);
    p.fill(150);
    p.textSize(10);
    p.text('Short-term storage', hippocampus.x, hippocampus.y + 65);
    p.text(`${hippocampus.memories.length} memories`, hippocampus.x, hippocampus.y + 80);
  }

  function drawCortex() {
    cortex.regions.forEach(region => {
      // Region glow
      let memCount = memories.filter(m => 
        m.regions.includes(region.name) && m.corticalStrength > 0.3
      ).length;
      
      if (memCount > 0) {
        for (let g = 30; g > 0; g -= 5) {
          p.noStroke();
          p.fill(region.color[0], region.color[1], region.color[2], (30 - g) * 0.4);
          p.circle(region.x, region.y, 50 + g + memCount * 5);
        }
      }

      // Region circle
      p.fill(30, 40, 55);
      p.stroke(region.color[0], region.color[1], region.color[2], 150);
      p.strokeWeight(2);
      p.circle(region.x, region.y, 50);

      // Label
      p.noStroke();
      p.fill(region.color[0], region.color[1], region.color[2]);
      p.textAlign(p.CENTER);
      p.textSize(10);
      p.text(region.name, region.x, region.y + 5);

      // Memory count
      if (memCount > 0) {
        p.fill(255);
        p.textSize(8);
        p.text(`${memCount} stored`, region.x, region.y + 38);
      }
    });
  }

  function drawMemories() {
    memories.forEach(m => {
      let pulse = Math.sin(time * 3 + m.pulsePhase) * 0.2 + 0.8;
      let size = 15 + m.strength * 20 * pulse;
      
      // Memory glow
      for (let g = 15; g > 0; g -= 3) {
        p.noStroke();
        p.fill(m.color[0], m.color[1], m.color[2], m.strength * 20);
        p.circle(m.x, m.y, size + g);
      }

      // Memory core
      p.fill(m.color[0], m.color[1], m.color[2], m.strength * 255);
      p.stroke(255, 255, 255, m.strength * 100);
      p.strokeWeight(1);
      p.circle(m.x, m.y, size);

      // Consolidation ring
      if (m.consolidated > 0.1) {
        p.noFill();
        p.stroke(100, 255, 200, m.consolidated * 200);
        p.strokeWeight(2);
        p.arc(m.x, m.y, size + 10, size + 10, 0, m.consolidated * p.TWO_PI);
      }

      // Strength indicator
      p.noStroke();
      p.fill(255, m.strength * 200);
      p.textAlign(p.CENTER);
      p.textSize(8);
      p.text(`${(m.strength * 100).toFixed(0)}%`, m.x, m.y + size/2 + 15);
    });
  }

  function drawParticles() {
    particles.forEach(pt => {
      if (pt.type === 'encoding' || pt.type === 'consolidation') {
        let x = p.lerp(pt.x, pt.targetX, pt.progress);
        let y = p.lerp(pt.y, pt.targetY, pt.progress);
        
        p.noStroke();
        p.fill(pt.color[0], pt.color[1], pt.color[2], (1 - pt.progress) * 200);
        p.circle(x, y, 5);
      } else if (pt.type === 'rehearsal') {
        p.noStroke();
        p.fill(pt.color[0], pt.color[1], pt.color[2], pt.life * 200);
        p.circle(pt.x, pt.y, 6 * pt.life);
      }
    });
  }

  function drawInfoPanel() {
    // Panel
    p.fill(15, 20, 30, 230);
    p.stroke(40, 50, 70);
    p.strokeWeight(1);
    p.rect(30, 50, 160, 200, 8);

    p.noStroke();
    p.fill(180);
    p.textAlign(p.LEFT);
    p.textSize(12);
    p.text('Memory Stages', 45, 75);

    // Stage indicators
    const stages = [
      { name: 'Encoding', color: [255, 200, 100], desc: 'Initial learning' },
      { name: 'Storage', color: [100, 255, 200], desc: 'Hippocampus hold' },
      { name: 'Consolidation', color: [200, 100, 255], desc: 'Transfer to cortex' },
      { name: 'Retrieval', color: [100, 200, 255], desc: 'Recall patterns' }
    ];

    stages.forEach((s, i) => {
      let y = 95 + i * 30;
      p.fill(s.color[0], s.color[1], s.color[2]);
      p.circle(55, y, 10);
      p.fill(200);
      p.textSize(10);
      p.text(s.name, 68, y + 4);
      p.fill(120);
      p.textSize(8);
      p.text(s.desc, 68, y + 14);
    });

    // Stats
    p.fill(100);
    p.textSize(9);
    p.text(`Total memories: ${memories.length}`, 45, 225);
    p.text(`Consolidated: ${memories.filter(m => m.consolidated > 0.5).length}`, 45, 238);
  }

  function drawLabels() {
    p.noStroke();
    p.fill(230);
    p.textAlign(p.LEFT);
    p.textSize(16);
    p.text('Memory Consolidation', 30, 30);
    
    p.fill(150);
    p.textSize(11);
    p.text('Create memories → Rehearse → Sleep to consolidate to cortex', 200, 30);
  }
};





// ============================================
// CHAPTER 5: NERVOUS SYSTEM ORGANIZATION
// Interactive Brain Regions Map
// ============================================
// Explore the major brain structures and their
// functions through an interactive diagram.

window.initSketch = function(p) {
  // ========== BRAIN REGIONS DATA ==========
  const regions = [
    { name: "Prefrontal Cortex", x: 180, y: 150, w: 80, h: 60, color: [255, 100, 150], 
      desc: "Executive function, planning, decision-making, personality" },
    { name: "Motor Cortex", x: 260, y: 120, w: 70, h: 40, color: [100, 200, 255], 
      desc: "Voluntary movement control, motor planning" },
    { name: "Somatosensory Cortex", x: 330, y: 130, w: 70, h: 40, color: [255, 200, 100], 
      desc: "Touch, temperature, proprioception processing" },
    { name: "Parietal Lobe", x: 380, y: 170, w: 80, h: 60, color: [200, 150, 255], 
      desc: "Spatial awareness, attention, sensory integration" },
    { name: "Visual Cortex", x: 450, y: 220, w: 70, h: 70, color: [100, 255, 180], 
      desc: "Visual processing, object recognition, motion detection" },
    { name: "Temporal Lobe", x: 350, y: 280, w: 100, h: 50, color: [255, 180, 100], 
      desc: "Hearing, language, memory formation" },
    { name: "Broca's Area", x: 200, y: 220, w: 50, h: 40, color: [255, 100, 100], 
      desc: "Speech production, language processing" },
    { name: "Wernicke's Area", x: 380, y: 240, w: 50, h: 35, color: [255, 150, 100], 
      desc: "Language comprehension, speech understanding" },
    { name: "Hippocampus", x: 340, y: 320, w: 60, h: 30, color: [100, 255, 255], 
      desc: "Memory consolidation, spatial navigation" },
    { name: "Amygdala", x: 290, y: 310, w: 40, h: 30, color: [255, 100, 100], 
      desc: "Emotion processing, fear response, memory" },
    { name: "Thalamus", x: 320, y: 270, w: 50, h: 35, color: [200, 200, 100], 
      desc: "Sensory relay station, consciousness" },
    { name: "Hypothalamus", x: 280, y: 290, w: 40, h: 25, color: [255, 200, 150], 
      desc: "Homeostasis, hormones, hunger, thirst, circadian rhythms" },
    { name: "Cerebellum", x: 480, y: 320, w: 90, h: 60, color: [150, 200, 255], 
      desc: "Motor coordination, balance, motor learning" },
    { name: "Brainstem", x: 400, y: 380, w: 60, h: 70, color: [180, 180, 180], 
      desc: "Vital functions: breathing, heart rate, sleep-wake cycles" },
    { name: "Corpus Callosum", x: 300, y: 200, w: 100, h: 20, color: [220, 220, 220], 
      desc: "Connects left and right hemispheres, interhemispheric communication" }
  ];

  let hoveredRegion = null;
  let selectedRegion = null;
  let time = 0;
  let viewMode = 'lateral';  // lateral, coronal, sagittal

  p.setup = function() {
    p.createCanvas(800, 500);
    createControls();
  };

  function createControls() {
    const panel = document.getElementById('controlsPanel');
    panel.style.display = 'flex';
    panel.innerHTML = `
      <div class="control-group">
        <label class="control-label">View</label>
        <select id="viewSelect" style="background: #1a2332; color: #e6edf3; border: 1px solid #00d4ff40; border-radius: 4px; padding: 4px 8px;">
          <option value="lateral">Lateral View</option>
          <option value="systems">By System</option>
        </select>
      </div>
      <button class="btn" id="highlightMotor">Motor System</button>
      <button class="btn" id="highlightSensory">Sensory System</button>
      <button class="btn" id="highlightLimbic">Limbic System</button>
      <button class="btn" id="resetBtn">Clear</button>
    `;

    document.getElementById('viewSelect').addEventListener('change', (e) => {
      viewMode = e.target.value;
    });

    document.getElementById('highlightMotor').addEventListener('click', () => {
      highlightSystem(['Motor Cortex', 'Cerebellum', 'Brainstem']);
    });

    document.getElementById('highlightSensory').addEventListener('click', () => {
      highlightSystem(['Somatosensory Cortex', 'Visual Cortex', 'Temporal Lobe', 'Thalamus']);
    });

    document.getElementById('highlightLimbic').addEventListener('click', () => {
      highlightSystem(['Hippocampus', 'Amygdala', 'Hypothalamus']);
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
      selectedRegion = null;
      regions.forEach(r => r.highlighted = false);
    });

    // updateCodeDisplay(); // Removed - code shown in editor
  }

  function highlightSystem(names) {
    regions.forEach(r => {
      r.highlighted = names.includes(r.name);
    });
    selectedRegion = null;
  }

  function updateCodeDisplay() {
    let r = selectedRegion || hoveredRegion;
    let regionInfo = r ? `
<span class="comment">// Selected: ${r.name}</span>
<span class="keyword">const</span> <span class="variable">region</span> = {
  name: <span class="string">"${r.name}"</span>,
  function: <span class="string">"${r.desc}"</span>
};` : `<span class="comment">// Hover over a region to see details</span>`;

    const code = `<span class="comment">// Brain Organization</span>
<span class="comment">// Hierarchical control from brainstem to cortex</span>

${regionInfo}

<span class="comment">// Major divisions of the CNS:</span>
<span class="keyword">const</span> <span class="variable">CNS</span> = {
  brain: {
    forebrain: [<span class="string">"Cerebral Cortex"</span>, <span class="string">"Limbic System"</span>],
    midbrain: [<span class="string">"Tectum"</span>, <span class="string">"Tegmentum"</span>],
    hindbrain: [<span class="string">"Cerebellum"</span>, <span class="string">"Pons"</span>, <span class="string">"Medulla"</span>]
  },
  spinalCord: [<span class="string">"31 spinal segments"</span>]
};

<span class="comment">// Functional systems:</span>
<span class="keyword">const</span> <span class="variable">motorSystem</span> = [
  <span class="string">"Motor Cortex"</span>,
  <span class="string">"Basal Ganglia"</span>,
  <span class="string">"Cerebellum"</span>
];

<span class="keyword">const</span> <span class="variable">sensorySystem</span> = [
  <span class="string">"Thalamus"</span>, <span class="comment">// relay</span>
  <span class="string">"Primary Cortices"</span>
];

<span class="keyword">const</span> <span class="variable">limbicSystem</span> = [
  <span class="string">"Hippocampus"</span>, <span class="comment">// memory</span>
  <span class="string">"Amygdala"</span> <span class="comment">// emotion</span>
];`;
    const el = document.getElementById('codeDisplay'); if (el) el.innerHTML = code;
  }

  p.draw = function() {
    p.background(10, 14, 20);
    time += 0.016;

    drawBrainOutline();
    drawRegions();
    drawConnections();
    drawInfoPanel();
    drawLabels();
    
    // updateCodeDisplay(); // Removed - code shown in editor
  };

  function drawBrainOutline() {
    // Brain silhouette
    p.noFill();
    p.stroke(60, 80, 120);
    p.strokeWeight(2);
    
    p.beginShape();
    p.curveVertex(150, 250);
    p.curveVertex(150, 250);
    p.curveVertex(160, 180);
    p.curveVertex(200, 110);
    p.curveVertex(300, 80);
    p.curveVertex(400, 90);
    p.curveVertex(480, 130);
    p.curveVertex(530, 200);
    p.curveVertex(540, 280);
    p.curveVertex(510, 350);
    p.curveVertex(450, 400);
    p.curveVertex(380, 420);
    p.curveVertex(300, 400);
    p.curveVertex(220, 350);
    p.curveVertex(170, 300);
    p.curveVertex(150, 250);
    p.curveVertex(150, 250);
    p.endShape();

    // Central sulcus line
    p.stroke(80, 100, 140);
    p.strokeWeight(1);
    p.line(300, 95, 340, 300);

    // Lateral sulcus
    p.beginShape();
    p.curveVertex(200, 220);
    p.curveVertex(200, 220);
    p.curveVertex(280, 250);
    p.curveVertex(350, 280);
    p.curveVertex(380, 290);
    p.endShape();
  }

  function drawRegions() {
    regions.forEach(r => {
      let isHovered = r === hoveredRegion;
      let isSelected = r === selectedRegion;
      let isHighlighted = r.highlighted;

      // Glow effect for highlighted/selected
      if (isHighlighted || isSelected || isHovered) {
        for (let g = 20; g > 0; g -= 4) {
          p.noStroke();
          let alpha = (isSelected ? 30 : isHighlighted ? 20 : 15) * (20 - g) / 20;
          p.fill(r.color[0], r.color[1], r.color[2], alpha);
          p.ellipse(r.x, r.y, r.w + g * 2, r.h + g * 1.5);
        }
      }

      // Region shape
      let alpha = isHighlighted || isSelected || isHovered ? 200 : 100;
      p.fill(r.color[0], r.color[1], r.color[2], alpha);
      p.stroke(r.color[0], r.color[1], r.color[2], isHovered ? 255 : 150);
      p.strokeWeight(isHovered || isSelected ? 2 : 1);
      p.ellipse(r.x, r.y, r.w, r.h);

      // Pulsing animation for highlighted
      if (isHighlighted) {
        let pulse = Math.sin(time * 4) * 0.5 + 0.5;
        p.noFill();
        p.stroke(r.color[0], r.color[1], r.color[2], pulse * 150);
        p.strokeWeight(2);
        p.ellipse(r.x, r.y, r.w + 10 + pulse * 10, r.h + 5 + pulse * 5);
      }

      // Label (only for larger regions or when selected)
      if (r.w > 60 || isHovered || isSelected) {
        p.noStroke();
        p.fill(255, isHovered || isSelected ? 255 : 180);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(isHovered || isSelected ? 11 : 9);
        
        let displayName = r.name.length > 15 ? r.name.split(' ')[0] : r.name;
        p.text(displayName, r.x, r.y);
      }
    });
  }

  function drawConnections() {
    // Draw some key neural pathways
    if (selectedRegion) {
      // Simplified connection arrows
      let connections = getConnections(selectedRegion.name);
      
      connections.forEach(targetName => {
        let target = regions.find(r => r.name === targetName);
        if (target) {
          // Animated signal flow
          let progress = (time * 2) % 1;
          let midX = (selectedRegion.x + target.x) / 2;
          let midY = (selectedRegion.y + target.y) / 2 - 30;
          
          p.noFill();
          p.stroke(0, 212, 255, 100);
          p.strokeWeight(2);
          p.bezier(selectedRegion.x, selectedRegion.y, 
                   midX, midY,
                   midX, midY,
                   target.x, target.y);

          // Signal dot
          let px = p.bezierPoint(selectedRegion.x, midX, midX, target.x, progress);
          let py = p.bezierPoint(selectedRegion.y, midY, midY, target.y, progress);
          
          p.noStroke();
          p.fill(0, 212, 255, 200);
          p.circle(px, py, 8);
        }
      });
    }
  }

  function getConnections(name) {
    const connectionMap = {
      "Prefrontal Cortex": ["Motor Cortex", "Thalamus", "Hippocampus"],
      "Motor Cortex": ["Cerebellum", "Brainstem", "Somatosensory Cortex"],
      "Visual Cortex": ["Parietal Lobe", "Temporal Lobe"],
      "Hippocampus": ["Prefrontal Cortex", "Amygdala", "Temporal Lobe"],
      "Amygdala": ["Prefrontal Cortex", "Hippocampus", "Hypothalamus"],
      "Thalamus": ["Prefrontal Cortex", "Visual Cortex", "Somatosensory Cortex"]
    };
    return connectionMap[name] || [];
  }

  function drawInfoPanel() {
    let r = selectedRegion || hoveredRegion;
    if (!r) return;

    // Panel
    p.fill(20, 28, 40, 240);
    p.stroke(r.color[0], r.color[1], r.color[2], 150);
    p.strokeWeight(1);
    p.rect(580, 80, 200, 150, 8);

    // Content
    p.noStroke();
    p.fill(r.color[0], r.color[1], r.color[2]);
    p.textAlign(p.LEFT);
    p.textSize(14);
    p.text(r.name, 595, 105);

    p.fill(200);
    p.textSize(11);
    
    // Word wrap description
    let words = r.desc.split(' ');
    let lines = [];
    let currentLine = '';
    
    words.forEach(word => {
      let testLine = currentLine + word + ' ';
      if (testLine.length > 25) {
        lines.push(currentLine);
        currentLine = word + ' ';
      } else {
        currentLine = testLine;
      }
    });
    lines.push(currentLine);

    lines.forEach((line, i) => {
      p.text(line.trim(), 595, 125 + i * 16);
    });

    // Click hint
    if (r === hoveredRegion && r !== selectedRegion) {
      p.fill(120);
      p.textSize(10);
      p.text('Click to select', 595, 210);
    }
  }

  function drawLabels() {
    // Title
    p.noStroke();
    p.fill(230);
    p.textAlign(p.LEFT);
    p.textSize(16);
    p.text('Brain Regions', 30, 30);
    
    p.fill(150);
    p.textSize(11);
    p.text('Hover over regions to explore | Click to select', 30, 50);

    // Orientation labels
    p.fill(100);
    p.textAlign(p.CENTER);
    p.textSize(10);
    p.text('ANTERIOR', 150, 100);
    p.text('POSTERIOR', 530, 250);
    p.text('DORSAL', 340, 65);
    p.text('VENTRAL', 350, 440);

    // Legend
    p.fill(30, 40, 55);
    p.stroke(60, 80, 120);
    p.strokeWeight(1);
    p.rect(580, 280, 200, 150, 8);

    p.noStroke();
    p.fill(180);
    p.textAlign(p.LEFT);
    p.textSize(11);
    p.text('Quick Highlight:', 595, 300);

    const systems = [
      { name: 'Motor', color: [100, 200, 255] },
      { name: 'Sensory', color: [255, 200, 100] },
      { name: 'Limbic', color: [100, 255, 255] },
      { name: 'Executive', color: [255, 100, 150] }
    ];

    systems.forEach((s, i) => {
      p.fill(s.color[0], s.color[1], s.color[2]);
      p.circle(605, 325 + i * 25, 10);
      p.fill(180);
      p.text(s.name + ' System', 620, 329 + i * 25);
    });
  }

  p.mouseMoved = function() {
    hoveredRegion = null;
    regions.forEach(r => {
      let dx = (p.mouseX - r.x) / (r.w / 2);
      let dy = (p.mouseY - r.y) / (r.h / 2);
      if (dx * dx + dy * dy < 1) {
        hoveredRegion = r;
      }
    });
  };

  p.mousePressed = function() {
    if (hoveredRegion) {
      selectedRegion = hoveredRegion;
      regions.forEach(r => r.highlighted = false);
    } else {
      selectedRegion = null;
    }
  };
};


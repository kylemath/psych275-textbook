// ============================================
// CHAPTER 14: SYNTHESIS
// Complete Neural Network Integration
// ============================================
// All course concepts in one living network!
// Sensory input → Processing → Motor output
// Watch information flow through the brain.

window.initSketch = function(p) {
  
  // ========== ADJUSTABLE PARAMETERS ==========
  // Try changing these values and click "Run"!
  
  let networkComplexity = 3;    // Layers of processing
  let signalStrength = 0.8;     // Input signal strength
  let learningEnabled = true;   // Enable Hebbian learning
  let noiseLevel = 0.1;         // Neural noise
  
  // ===========================================

  let layers = [];
  let connections = [];
  let signals = [];
  let time = 0;
  let inputActive = false;
  let outputFiring = false;

  const layerNames = ['Sensory Input', 'Primary Processing', 'Association', 'Executive', 'Motor Output'];
  const layerColors = [
    [255, 200, 100],  // Sensory - yellow
    [100, 200, 255],  // Primary - blue
    [200, 150, 255],  // Association - purple
    [255, 150, 200],  // Executive - pink
    [100, 255, 180]   // Motor - green
  ];

  p.setup = function() {
    p.createCanvas(800, 500);
    initNetwork();
    createControls();
  };

  function createControls() {
    const panel = document.getElementById('controlsPanel');
    panel.style.display = 'flex';
    panel.innerHTML = `
      <button class="btn" id="stimBtn" style="font-size: 14px; padding: 10px 20px;">👁️ Sensory Input</button>
      <div class="control-group">
        <label class="control-label">Signal Strength</label>
        <input type="range" id="strength" min="20" max="100" value="80">
        <span class="control-value" id="strengthVal">80%</span>
      </div>
      <div class="control-group">
        <label class="control-label">Noise Level</label>
        <input type="range" id="noise" min="0" max="50" value="10">
        <span class="control-value" id="noiseVal">10%</span>
      </div>
      <button class="btn" id="learnBtn">🧠 Toggle Learning</button>
      <button class="btn" id="resetBtn">Reset</button>
    `;

    document.getElementById('stimBtn').addEventListener('click', stimulateInput);
    
    document.getElementById('strength').addEventListener('input', (e) => {
      signalStrength = e.target.value / 100;
      document.getElementById('strengthVal').textContent = `${e.target.value}%`;
    });

    document.getElementById('noise').addEventListener('input', (e) => {
      noiseLevel = e.target.value / 100;
      document.getElementById('noiseVal').textContent = `${e.target.value}%`;
    });

    document.getElementById('learnBtn').addEventListener('click', () => {
      learningEnabled = !learningEnabled;
      document.getElementById('learnBtn').textContent = learningEnabled ? '🧠 Learning ON' : '🧠 Learning OFF';
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
      connections.forEach(c => c.weight = 0.3);
      layers.flat().forEach(n => { n.activation = 0; n.firing = false; });
    });
  }

  function initNetwork() {
    layers = [];
    connections = [];
    
    // Create neurons in each layer
    const neuronsPerLayer = [4, 6, 8, 6, 3];
    const layerX = [80, 200, 350, 520, 680];

    for (let l = 0; l < 5; l++) {
      let layer = [];
      let count = neuronsPerLayer[l];
      
      for (let i = 0; i < count; i++) {
        let spacing = 400 / (count + 1);
        layer.push({
          x: layerX[l],
          y: 70 + (i + 1) * spacing,
          activation: 0,
          firing: false,
          layer: l,
          color: layerColors[l]
        });
      }
      layers.push(layer);
    }

    // Create connections between adjacent layers
    for (let l = 0; l < 4; l++) {
      layers[l].forEach(from => {
        layers[l + 1].forEach(to => {
          if (p.random() > 0.3) { // Not fully connected
            connections.push({
              from: from,
              to: to,
              weight: 0.2 + p.random(0.3),
              potentiation: 0
            });
          }
        });
      });
    }

    // Add some recurrent connections within association layer
    let assocLayer = layers[2];
    for (let i = 0; i < assocLayer.length; i++) {
      for (let j = i + 1; j < assocLayer.length; j++) {
        if (p.random() > 0.6) {
          connections.push({
            from: assocLayer[i],
            to: assocLayer[j],
            weight: 0.15,
            potentiation: 0,
            recurrent: true
          });
        }
      }
    }
  }

  function stimulateInput() {
    // Activate random input neurons
    layers[0].forEach(n => {
      if (p.random() < 0.7) {
        n.activation = signalStrength;
        n.firing = true;
        setTimeout(() => { n.firing = false; }, 300);
      }
    });
    inputActive = true;
    setTimeout(() => { inputActive = false; }, 500);
  }

  p.draw = function() {
    p.background(8, 12, 20);
    time += 0.016;

    updateNetwork();
    
    drawConnections();
    drawNeurons();
    drawSignals();
    drawLayerLabels();
    drawConceptLabels();
    drawInfoPanel();
  };

  function updateNetwork() {
    // Propagate activations
    for (let l = 1; l < layers.length; l++) {
      layers[l].forEach(neuron => {
        let input = 0;
        connections.filter(c => c.to === neuron).forEach(c => {
          input += c.from.activation * c.weight;
        });
        
        // Add noise
        input += (p.random() - 0.5) * noiseLevel;
        
        // Sigmoid activation
        let target = 1 / (1 + Math.exp(-5 * (input - 0.4)));
        neuron.activation = p.lerp(neuron.activation, target, 0.15);
        
        // Fire if above threshold
        if (neuron.activation > 0.6 && !neuron.firing) {
          neuron.firing = true;
          
          // Spawn signal particles
          connections.filter(c => c.from === neuron).forEach(c => {
            signals.push({
              from: neuron,
              to: c.to,
              progress: 0,
              strength: neuron.activation * c.weight
            });
          });
          
          setTimeout(() => { neuron.firing = false; }, 200);
        }
      });
    }

    // Hebbian learning
    if (learningEnabled) {
      connections.forEach(c => {
        if (c.from.activation > 0.3 && c.to.activation > 0.3) {
          let delta = 0.01 * c.from.activation * c.to.activation;
          c.weight = Math.min(1, c.weight + delta);
          c.potentiation = Math.min(1, c.potentiation + delta * 5);
        }
        c.weight = Math.max(0.05, c.weight - 0.0005); // Decay
        c.potentiation *= 0.95;
      });
    }

    // Decay activations
    layers.flat().forEach(n => {
      n.activation *= 0.95;
    });

    // Update signals
    for (let i = signals.length - 1; i >= 0; i--) {
      signals[i].progress += 0.08;
      if (signals[i].progress >= 1) {
        signals.splice(i, 1);
      }
    }

    // Check motor output
    let motorActivity = layers[4].reduce((sum, n) => sum + n.activation, 0) / layers[4].length;
    outputFiring = motorActivity > 0.4;
  }

  function drawConnections() {
    connections.forEach(c => {
      let weight = c.weight;
      let alpha = p.map(weight, 0, 1, 20, 150);
      let thickness = p.map(weight, 0, 1, 0.5, 3);

      // Potentiation glow
      if (c.potentiation > 0.1) {
        p.stroke(100, 255, 180, c.potentiation * 100);
        p.strokeWeight(thickness + 4);
        p.line(c.from.x, c.from.y, c.to.x, c.to.y);
      }

      // Connection line
      let isActive = c.from.activation > 0.3;
      p.stroke(isActive ? 200 : 80, isActive ? 220 : 100, isActive ? 255 : 130, alpha);
      p.strokeWeight(thickness);
      
      if (c.recurrent) {
        // Curved line for recurrent
        let midX = (c.from.x + c.to.x) / 2;
        let midY = (c.from.y + c.to.y) / 2 - 30;
        p.noFill();
        p.bezier(c.from.x, c.from.y, midX, midY, midX, midY, c.to.x, c.to.y);
      } else {
        p.line(c.from.x, c.from.y, c.to.x, c.to.y);
      }
    });
  }

  function drawNeurons() {
    layers.flat().forEach(n => {
      let size = 25;
      
      // Firing glow
      if (n.firing) {
        for (let g = 20; g > 0; g -= 4) {
          p.noStroke();
          p.fill(n.color[0], n.color[1], n.color[2], (20 - g) * 8);
          p.circle(n.x, n.y, size + g);
        }
      }

      // Neuron body
      let brightness = 40 + n.activation * 200;
      p.fill(brightness * n.color[0] / 255, 
             brightness * n.color[1] / 255, 
             brightness * n.color[2] / 255);
      p.stroke(n.color[0], n.color[1], n.color[2], 150);
      p.strokeWeight(2);
      p.circle(n.x, n.y, size);

      // Activation level
      if (n.activation > 0.1) {
        p.noStroke();
        p.fill(255, 255, 255, n.activation * 200);
        p.circle(n.x, n.y, size * n.activation * 0.6);
      }
    });
  }

  function drawSignals() {
    signals.forEach(sig => {
      let x = p.lerp(sig.from.x, sig.to.x, sig.progress);
      let y = p.lerp(sig.from.y, sig.to.y, sig.progress);
      
      p.noStroke();
      p.fill(255, 255, 255, (1 - sig.progress) * 200 * sig.strength);
      p.circle(x, y, 8);
    });
  }

  function drawLayerLabels() {
    const layerX = [80, 200, 350, 520, 680];
    
    layerNames.forEach((name, i) => {
      p.noStroke();
      p.fill(layerColors[i][0], layerColors[i][1], layerColors[i][2]);
      p.textAlign(p.CENTER);
      p.textSize(10);
      p.text(name, layerX[i], 30);
    });

    // Input/Output indicators
    if (inputActive) {
      p.fill(255, 200, 100, 150 + Math.sin(time * 10) * 50);
      p.textSize(12);
      p.text('INPUT!', 80, 490);
    }

    if (outputFiring) {
      p.fill(100, 255, 180, 150 + Math.sin(time * 10) * 50);
      p.textSize(12);
      p.text('OUTPUT!', 680, 490);
    }
  }

  function drawConceptLabels() {
    // Course concepts mapped to network
    p.noStroke();
    p.fill(80);
    p.textAlign(p.CENTER);
    p.textSize(8);

    // Ch 2-3: Electrical & Chemical
    p.text('Ch 2-3: Signals', 80, 50);
    
    // Ch 6-7: Sensation
    p.text('Ch 6-7: Sensation', 200, 50);
    
    // Ch 8: Attention
    p.text('Ch 8: Association', 350, 50);
    
    // Ch 11: Executive
    p.text('Ch 11: Control', 520, 50);
    
    // Ch 9: Motor
    p.text('Ch 9: Action', 680, 50);

    // Ch 4 & 10: Learning
    p.fill(100, 255, 180, 150);
    p.textSize(9);
    p.textAlign(p.LEFT);
    p.text('Ch 4 & 10: Learning strengthens active pathways', 250, 480);
  }

  function drawInfoPanel() {
    p.fill(15, 20, 30, 230);
    p.stroke(40, 50, 70);
    p.strokeWeight(1);
    p.rect(10, 400, 200, 90, 8);

    p.noStroke();
    p.fill(180);
    p.textAlign(p.LEFT);
    p.textSize(11);
    p.text('Network Status', 25, 420);

    let totalActivity = layers.flat().reduce((s, n) => s + n.activation, 0);
    let avgWeight = connections.reduce((s, c) => s + c.weight, 0) / connections.length;
    let strongConn = connections.filter(c => c.weight > 0.6).length;

    p.fill(120);
    p.textSize(10);
    p.text(`Active neurons: ${layers.flat().filter(n => n.activation > 0.3).length}`, 25, 440);
    p.text(`Avg connection: ${avgWeight.toFixed(2)}`, 25, 455);
    p.text(`Strong paths: ${strongConn}`, 25, 470);
    p.text(`Learning: ${learningEnabled ? 'ON' : 'OFF'}`, 25, 485);
  }

  // Mouse interaction - click neurons to activate
  p.mousePressed = function() {
    layers.flat().forEach(n => {
      if (p.dist(p.mouseX, p.mouseY, n.x, n.y) < 15) {
        n.activation = 1;
        n.firing = true;
        setTimeout(() => { n.firing = false; }, 300);
      }
    });
  };
};





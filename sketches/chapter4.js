// ============================================
// CHAPTER 4: NEURAL PLASTICITY
// Hebbian Learning Visualization
// ============================================
// "Neurons that fire together, wire together"
// Watch synaptic connections strengthen with
// correlated activity and weaken without it.

window.initSketch = function(p) {
  // ========== NETWORK PARAMETERS ==========
  let neurons = [];
  let connections = [];
  let learningRate = 0.1;
  let decayRate = 0.01;
  let selectedNeuron = null;
  let time = 0;

  p.setup = function() {
    p.createCanvas(800, 500);
    createControls();
    initNetwork();
  };

  function createControls() {
    const panel = document.getElementById('controlsPanel');
    panel.style.display = 'flex';
    panel.innerHTML = `
      <div class="control-group">
        <label class="control-label">Learning Rate</label>
        <input type="range" id="learnRate" min="1" max="30" value="10">
        <span class="control-value" id="learnRateVal">0.10</span>
      </div>
      <div class="control-group">
        <label class="control-label">Decay Rate</label>
        <input type="range" id="decayRate" min="0" max="20" value="5">
        <span class="control-value" id="decayRateVal">0.01</span>
      </div>
      <button class="btn" id="stimBtn">⚡ Stimulate Pattern</button>
      <button class="btn" id="resetBtn">Reset Network</button>
    `;

    document.getElementById('learnRate').addEventListener('input', (e) => {
      learningRate = e.target.value / 100;
      document.getElementById('learnRateVal').textContent = learningRate.toFixed(2);
    });

    document.getElementById('decayRate').addEventListener('input', (e) => {
      decayRate = e.target.value / 1000;
      document.getElementById('decayRateVal').textContent = decayRate.toFixed(3);
    });

    document.getElementById('stimBtn').addEventListener('click', stimulatePattern);
    document.getElementById('resetBtn').addEventListener('click', () => {
      connections.forEach(c => { c.weight = 0.3; });
      neurons.forEach(n => { n.activation = 0; n.firing = false; });
    });

    // updateCodeDisplay(); // Removed - code shown in editor
  }

  function initNetwork() {
    neurons = [];
    connections = [];

    // Create neurons in layers
    // Input layer
    for (let i = 0; i < 4; i++) {
      neurons.push({
        x: 150,
        y: 100 + i * 90,
        layer: 'input',
        activation: 0,
        firing: false,
        id: i
      });
    }

    // Hidden layer
    for (let i = 0; i < 5; i++) {
      neurons.push({
        x: 350,
        y: 70 + i * 90,
        layer: 'hidden',
        activation: 0,
        firing: false,
        id: i + 4
      });
    }

    // Output layer
    for (let i = 0; i < 3; i++) {
      neurons.push({
        x: 550,
        y: 130 + i * 100,
        layer: 'output',
        activation: 0,
        firing: false,
        id: i + 9
      });
    }

    // Create connections
    neurons.filter(n => n.layer === 'input').forEach(from => {
      neurons.filter(n => n.layer === 'hidden').forEach(to => {
        connections.push({
          from: from,
          to: to,
          weight: 0.3 + p.random(-0.1, 0.1),
          potentiation: 0
        });
      });
    });

    neurons.filter(n => n.layer === 'hidden').forEach(from => {
      neurons.filter(n => n.layer === 'output').forEach(to => {
        connections.push({
          from: from,
          to: to,
          weight: 0.3 + p.random(-0.1, 0.1),
          potentiation: 0
        });
      });
    });
  }

  function stimulatePattern() {
    // Activate a specific pattern of input neurons
    let pattern = p.random() > 0.5 ? [0, 1] : [2, 3];
    
    pattern.forEach(id => {
      let n = neurons.find(n => n.id === id);
      if (n) {
        n.activation = 1;
        n.firing = true;
        setTimeout(() => { n.firing = false; }, 500);
      }
    });
  }

  function updateCodeDisplay() {
    let avgWeight = connections.reduce((sum, c) => sum + c.weight, 0) / connections.length;
    let strongConnections = connections.filter(c => c.weight > 0.6).length;
    
    const code = `<span class="comment">// Hebbian Learning Rule</span>
<span class="comment">// "Neurons that fire together, wire together"</span>

<span class="keyword">const</span> <span class="variable">learningRate</span> = ${learningRate.toFixed(2)};
<span class="keyword">const</span> <span class="variable">decayRate</span> = ${decayRate.toFixed(3)};

<span class="comment">// Weight update rule:</span>
<span class="comment">// Δw = η × pre × post</span>
<span class="keyword">function</span> <span class="function">hebbianUpdate</span>(pre, post, weight) {
  <span class="comment">// LTP: Long-Term Potentiation</span>
  <span class="keyword">if</span> (pre > <span class="number">0.5</span> && post > <span class="number">0.5</span>) {
    weight += learningRate * pre * post;
  }
  
  <span class="comment">// LTD: Long-Term Depression (decay)</span>
  weight -= decayRate;
  
  <span class="comment">// Keep weights bounded</span>
  <span class="keyword">return</span> Math.max(<span class="number">0</span>, Math.min(<span class="number">1</span>, weight));
}

<span class="comment">// Network statistics:</span>
<span class="keyword">const</span> <span class="variable">avgWeight</span> = ${avgWeight.toFixed(3)};
<span class="keyword">const</span> <span class="variable">strongSynapses</span> = ${strongConnections}; <span class="comment">// (w > 0.6)</span>
<span class="keyword">const</span> <span class="variable">totalSynapses</span> = ${connections.length};

<span class="comment">// Click neurons to activate them!</span>
<span class="comment">// Correlated firing strengthens connections.</span>`;
    const el = document.getElementById('codeDisplay'); if (el) el.innerHTML = code;
  }

  p.draw = function() {
    p.background(10, 14, 20);
    time += 0.016;

    updateNetwork();
    
    drawConnections();
    drawNeurons();
    drawLegend();
    drawLabels();
    
    // updateCodeDisplay(); // Removed - code shown in editor
  };

  function updateNetwork() {
    // Propagate activation through network
    neurons.forEach(n => {
      if (n.layer !== 'input') {
        let incomingSum = 0;
        connections.filter(c => c.to === n).forEach(c => {
          incomingSum += c.from.activation * c.weight;
        });
        
        // Sigmoid activation
        let targetActivation = 1 / (1 + Math.exp(-5 * (incomingSum - 0.5)));
        n.activation = p.lerp(n.activation, targetActivation, 0.1);
        
        // Fire if above threshold
        if (n.activation > 0.7 && !n.firing) {
          n.firing = true;
          setTimeout(() => { n.firing = false; }, 300);
        }
      }
    });

    // Hebbian learning
    connections.forEach(c => {
      // LTP: strengthen if both active
      if (c.from.activation > 0.3 && c.to.activation > 0.3) {
        let delta = learningRate * c.from.activation * c.to.activation;
        c.weight = Math.min(1, c.weight + delta);
        c.potentiation = Math.min(1, c.potentiation + delta * 5);
      }
      
      // Decay
      c.weight = Math.max(0.05, c.weight - decayRate);
      c.potentiation *= 0.95;
    });

    // Decay neuron activations
    neurons.forEach(n => {
      n.activation *= 0.95;
    });
  }

  function drawConnections() {
    connections.forEach(c => {
      let weight = c.weight;
      let alpha = p.map(weight, 0, 1, 30, 255);
      let thickness = p.map(weight, 0, 1, 1, 6);
      
      // Potentiation glow
      if (c.potentiation > 0.1) {
        p.stroke(120, 255, 180, c.potentiation * 150);
        p.strokeWeight(thickness + 8);
        p.line(c.from.x, c.from.y, c.to.x, c.to.y);
      }

      // Connection line
      let hue = p.map(weight, 0, 1, 200, 120);
      p.stroke(hue, 200, 255, alpha);
      p.strokeWeight(thickness);
      p.line(c.from.x, c.from.y, c.to.x, c.to.y);

      // Signal flow visualization
      if (c.from.activation > 0.3) {
        let progress = (time * 3 + c.from.id * 0.5) % 1;
        let px = p.lerp(c.from.x, c.to.x, progress);
        let py = p.lerp(c.from.y, c.to.y, progress);
        
        p.noStroke();
        p.fill(255, 255, 255, c.from.activation * 200);
        p.circle(px, py, 6);
      }
    });
  }

  function drawNeurons() {
    neurons.forEach(n => {
      let size = 40;
      let isSelected = n === selectedNeuron;
      
      // Firing glow
      if (n.firing) {
        for (let g = 30; g > 0; g -= 5) {
          p.noStroke();
          p.fill(255, 220, 100, (30 - g) * 3);
          p.circle(n.x, n.y, size + g * 2);
        }
      }
      
      // Activation glow
      if (n.activation > 0.1) {
        for (let g = 20; g > 0; g -= 4) {
          p.noStroke();
          p.fill(0, 212, 255, n.activation * 30);
          p.circle(n.x, n.y, size + g);
        }
      }

      // Neuron body
      let fillBrightness = p.map(n.activation, 0, 1, 30, 200);
      p.fill(fillBrightness, fillBrightness + 20, fillBrightness + 40);
      p.stroke(isSelected ? [255, 159, 67] : [100, 150, 200]);
      p.strokeWeight(isSelected ? 3 : 2);
      p.circle(n.x, n.y, size);

      // Activation indicator
      if (n.activation > 0.1) {
        p.noStroke();
        p.fill(0, 212, 255, 200);
        p.circle(n.x, n.y, size * n.activation * 0.7);
      }

      // Label
      p.noStroke();
      p.fill(200);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(10);
      p.text(n.activation.toFixed(2), n.x, n.y);
    });
  }

  function drawLegend() {
    // Weight scale
    p.fill(30, 40, 55);
    p.stroke(60, 80, 120);
    p.strokeWeight(1);
    p.rect(630, 50, 150, 180, 8);

    p.noStroke();
    p.fill(180);
    p.textAlign(p.LEFT);
    p.textSize(12);
    p.text('Connection Strength', 645, 75);

    // Color gradient
    for (let i = 0; i < 100; i++) {
      let weight = i / 100;
      let hue = p.map(weight, 0, 1, 200, 120);
      p.stroke(hue, 200, 255);
      p.strokeWeight(2);
      p.line(660, 170 - i, 700, 170 - i);
    }

    p.noStroke();
    p.fill(150);
    p.textSize(10);
    p.textAlign(p.LEFT);
    p.text('Strong', 710, 75);
    p.text('Weak', 710, 175);

    // LTP/LTD legend
    p.fill(120, 255, 180);
    p.circle(655, 200, 10);
    p.fill(150);
    p.text('LTP (strengthening)', 670, 204);
  }

  function drawLabels() {
    // Title
    p.noStroke();
    p.fill(230);
    p.textAlign(p.LEFT);
    p.textSize(16);
    p.text('Hebbian Learning', 30, 30);
    
    p.fill(150);
    p.textSize(11);
    p.text('"Neurons that fire together, wire together"', 30, 50);

    // Layer labels
    p.fill(120);
    p.textAlign(p.CENTER);
    p.textSize(12);
    p.text('Input', 150, 450);
    p.text('Hidden', 350, 450);
    p.text('Output', 550, 450);

    // Instructions
    p.fill(100);
    p.textAlign(p.LEFT);
    p.textSize(10);
    p.text('Click neurons to activate | Watch connections strengthen', 30, 480);
  }

  p.mousePressed = function() {
    neurons.forEach(n => {
      if (p.dist(p.mouseX, p.mouseY, n.x, n.y) < 25) {
        n.activation = 1;
        n.firing = true;
        selectedNeuron = n;
        setTimeout(() => { n.firing = false; }, 500);
      }
    });
  };

  p.mouseReleased = function() {
    selectedNeuron = null;
  };
};


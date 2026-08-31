// ============================================
// CHAPTER 0: WHAT IS A THOUGHT?
// Interactive Perceptron Visualization
// ============================================
// This sketch demonstrates how a simple artificial neuron
// (perceptron) combines weighted inputs to make decisions.
// Adjust the input values and weights to see how
// the output changes - the foundation of neural computation!

window.initSketch = function(p) {
  // ========== ADJUSTABLE PARAMETERS ==========
  let numInputs = 3;           // Number of input neurons
  let inputs = [0.5, 0.7, 0.3]; // Input values (0-1)
  let weights = [0.6, 0.4, 0.8]; // Connection weights
  let bias = -0.5;              // Bias term
  let threshold = 0.5;          // Activation threshold
  // ===========================================

  let sliders = [];
  let weightSliders = [];
  let biasSlider;
  let outputNeuron;
  let animationPhase = 0;
  let particles = [];

  p.setup = function() {
    p.createCanvas(800, 500);
    createControls();
    outputNeuron = { x: 600, y: 250, activation: 0 };
  };

  function createControls() {
    const panel = document.getElementById('controlsPanel');
    panel.style.display = 'flex';
    panel.innerHTML = `
      <div class="control-group">
        <label class="control-label">Input 1</label>
        <input type="range" id="input0" min="0" max="100" value="50">
        <span class="control-value" id="input0Val">0.50</span>
      </div>
      <div class="control-group">
        <label class="control-label">Input 2</label>
        <input type="range" id="input1" min="0" max="100" value="70">
        <span class="control-value" id="input1Val">0.70</span>
      </div>
      <div class="control-group">
        <label class="control-label">Input 3</label>
        <input type="range" id="input2" min="0" max="100" value="30">
        <span class="control-value" id="input2Val">0.30</span>
      </div>
      <div class="control-group">
        <label class="control-label">Bias</label>
        <input type="range" id="bias" min="-100" max="100" value="-50">
        <span class="control-value" id="biasVal">-0.50</span>
      </div>
      <button class="btn" id="resetBtn">Reset</button>
    `;

    // Add event listeners
    for (let i = 0; i < 3; i++) {
      document.getElementById(`input${i}`).addEventListener('input', (e) => {
        inputs[i] = e.target.value / 100;
        document.getElementById(`input${i}Val`).textContent = inputs[i].toFixed(2);
      });
    }
    document.getElementById('bias').addEventListener('input', (e) => {
      bias = e.target.value / 100;
      document.getElementById('biasVal').textContent = bias.toFixed(2);
    });
    document.getElementById('resetBtn').addEventListener('click', () => {
      inputs = [0.5, 0.7, 0.3];
      bias = -0.5;
      document.getElementById('input0').value = 50;
      document.getElementById('input1').value = 70;
      document.getElementById('input2').value = 30;
      document.getElementById('bias').value = -50;
      ['input0Val', 'input1Val', 'input2Val'].forEach((id, i) => {
        document.getElementById(id).textContent = inputs[i].toFixed(2);
      });
      document.getElementById('biasVal').textContent = bias.toFixed(2);
    });

    // updateCodeDisplay(); // Removed - code shown in editor
  }

  function updateCodeDisplay() {
    const code = `<span class="comment">// Perceptron: The Simplest Neural Unit</span>

<span class="keyword">const</span> <span class="variable">inputs</span> = [${inputs.map(v => v.toFixed(2)).join(', ')}];
<span class="keyword">const</span> <span class="variable">weights</span> = [${weights.map(v => v.toFixed(2)).join(', ')}];
<span class="keyword">const</span> <span class="variable">bias</span> = ${bias.toFixed(2)};

<span class="comment">// Weighted sum: Σ(input × weight) + bias</span>
<span class="keyword">let</span> <span class="variable">sum</span> = <span class="number">0</span>;
<span class="keyword">for</span> (<span class="keyword">let</span> i = <span class="number">0</span>; i < inputs.length; i++) {
  sum += inputs[i] * weights[i];
}
sum += bias;

<span class="comment">// Activation function (sigmoid)</span>
<span class="keyword">function</span> <span class="function">sigmoid</span>(x) {
  <span class="keyword">return</span> <span class="number">1</span> / (<span class="number">1</span> + Math.exp(-x));
}

<span class="keyword">const</span> <span class="variable">output</span> = <span class="function">sigmoid</span>(sum);
<span class="comment">// Output: ${sigmoid(computeSum()).toFixed(3)}</span>

<span class="comment">// The output represents the neuron's</span>
<span class="comment">// "confidence" or firing rate.</span>
<span class="comment">// High values = strong activation</span>
<span class="comment">// Low values = weak/no activation</span>`;
    const el = document.getElementById('codeDisplay'); if (el) el.innerHTML = code;
  }

  function computeSum() {
    let sum = bias;
    for (let i = 0; i < numInputs; i++) {
      sum += inputs[i] * weights[i];
    }
    return sum;
  }

  function sigmoid(x) {
    return 1 / (1 + Math.exp(-x * 5));
  }

  p.draw = function() {
    p.background(13, 17, 23);
    animationPhase += 0.02;

    // Calculate output
    let sum = computeSum();
    let output = sigmoid(sum);
    outputNeuron.activation = p.lerp(outputNeuron.activation, output, 0.1);

    // Draw connections with signal flow
    drawConnections(output);

    // Draw input neurons
    drawInputNeurons();

    // Draw output neuron
    drawOutputNeuron();

    // Draw labels
    drawLabels(sum, output);

    // Spawn particles for active signals
    if (p.random() < output * 0.3) {
      spawnParticle();
    }
    updateParticles();

    // updateCodeDisplay(); // Removed - code shown in editor
  };

  function drawConnections(output) {
    for (let i = 0; i < numInputs; i++) {
      let inputY = 120 + i * 130;
      let inputX = 150;
      
      // Connection strength visualization
      let strength = inputs[i] * weights[i];
      let alpha = p.map(Math.abs(strength), 0, 1, 50, 255);
      
      // Animated signal flow
      let signalPos = (animationPhase * 2 + i * 0.3) % 1;
      
      p.stroke(0, 212, 255, alpha * 0.3);
      p.strokeWeight(p.map(Math.abs(strength), 0, 1, 1, 4));
      p.noFill();
      p.bezier(inputX + 40, inputY, 
               inputX + 150, inputY,
               outputNeuron.x - 150, outputNeuron.y,
               outputNeuron.x - 40, outputNeuron.y);

      // Signal pulse
      let px = p.bezierPoint(inputX + 40, inputX + 150, outputNeuron.x - 150, outputNeuron.x - 40, signalPos);
      let py = p.bezierPoint(inputY, inputY, outputNeuron.y, outputNeuron.y, signalPos);
      
      if (inputs[i] > 0.1) {
        p.noStroke();
        p.fill(0, 212, 255, 200);
        p.circle(px, py, 8 + inputs[i] * 6);
        p.fill(255, 255, 255, 150);
        p.circle(px, py, 4);
      }

      // Weight label
      let midX = (inputX + 40 + outputNeuron.x - 40) / 2;
      let midY = (inputY + outputNeuron.y) / 2;
      p.noStroke();
      p.fill(255, 159, 67);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(11);
      p.text(`w=${weights[i].toFixed(1)}`, midX, midY - 15);
    }
  }

  function drawInputNeurons() {
    for (let i = 0; i < numInputs; i++) {
      let y = 120 + i * 130;
      let x = 150;
      let size = 60;
      
      // Glow effect
      let glowIntensity = inputs[i] * 100;
      p.noStroke();
      for (let g = 30; g > 0; g -= 5) {
        p.fill(0, 212, 255, glowIntensity * (30 - g) / 30 * 0.1);
        p.circle(x, y, size + g * 2);
      }

      // Neuron body
      p.fill(20, 30, 45);
      p.stroke(0, 212, 255, 150);
      p.strokeWeight(2);
      p.circle(x, y, size);

      // Inner activation
      let innerSize = p.map(inputs[i], 0, 1, 10, 45);
      p.noStroke();
      p.fill(0, 212, 255, 100 + inputs[i] * 155);
      p.circle(x, y, innerSize);

      // Label
      p.fill(230);
      p.noStroke();
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(14);
      p.text(`x${i+1}`, x, y - 45);
      p.textSize(16);
      p.fill(0, 212, 255);
      p.text(inputs[i].toFixed(2), x, y);
    }
  }

  function drawOutputNeuron() {
    let x = outputNeuron.x;
    let y = outputNeuron.y;
    let size = 80;
    let activation = outputNeuron.activation;

    // Dynamic glow
    let glowColor = activation > 0.5 ? 
      p.color(123, 237, 159) : p.color(255, 107, 157);
    
    for (let g = 40; g > 0; g -= 4) {
      p.noStroke();
      let alpha = activation * 150 * (40 - g) / 40 * 0.15;
      p.fill(p.red(glowColor), p.green(glowColor), p.blue(glowColor), alpha);
      p.circle(x, y, size + g * 2);
    }

    // Neuron body
    p.fill(20, 30, 45);
    p.stroke(p.red(glowColor), p.green(glowColor), p.blue(glowColor), 200);
    p.strokeWeight(3);
    p.circle(x, y, size);

    // Activation fill
    p.noStroke();
    p.fill(p.red(glowColor), p.green(glowColor), p.blue(glowColor), 100 + activation * 155);
    p.circle(x, y, size * activation * 0.8);

    // Output value
    p.fill(255);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(18);
    p.text(activation.toFixed(2), x, y);
    
    p.textSize(12);
    p.fill(200);
    p.text('output', x, y + 55);

    // Firing indicator
    if (activation > 0.5) {
      p.fill(123, 237, 159, 200);
      p.textSize(14);
      p.text('FIRING', x, y - 55);
    } else {
      p.fill(255, 107, 157, 200);
      p.textSize(14);
      p.text('QUIET', x, y - 55);
    }
  }

  function drawLabels(sum, output) {
    // Title
    p.noStroke();
    p.fill(230);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(16);
    p.text('The Perceptron', 30, 25);
    
    p.fill(160);
    p.textSize(12);
    p.text('A single artificial neuron making decisions', 30, 48);

    // Equation display
    p.fill(40, 50, 65);
    p.rect(30, 420, 350, 60, 8);
    
    p.fill(255, 159, 67);
    p.textSize(12);
    p.text('Σ = (x₁×w₁) + (x₂×w₂) + (x₃×w₃) + bias', 45, 435);
    
    p.fill(0, 212, 255);
    p.textSize(14);
    let eqStr = `Σ = (${inputs[0].toFixed(2)}×${weights[0].toFixed(1)}) + (${inputs[1].toFixed(2)}×${weights[1].toFixed(1)}) + (${inputs[2].toFixed(2)}×${weights[2].toFixed(1)}) + (${bias.toFixed(2)})`;
    p.text(eqStr, 45, 455);
    
    p.fill(123, 237, 159);
    p.text(`= ${sum.toFixed(3)} → σ(x) = ${output.toFixed(3)}`, 45, 472);
  }

  function spawnParticle() {
    particles.push({
      x: outputNeuron.x + 50,
      y: outputNeuron.y + p.random(-20, 20),
      vx: p.random(2, 5),
      vy: p.random(-1, 1),
      life: 1,
      size: p.random(3, 8)
    });
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      let pt = particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life -= 0.02;
      
      if (pt.life <= 0 || pt.x > p.width) {
        particles.splice(i, 1);
        continue;
      }

      p.noStroke();
      p.fill(123, 237, 159, pt.life * 200);
      p.circle(pt.x, pt.y, pt.size * pt.life);
    }
  }
};


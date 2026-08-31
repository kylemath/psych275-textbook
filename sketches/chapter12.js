// ============================================
// CHAPTER 11: EXECUTIVE FUNCTION
// Stroop Effect - Cognitive Control Demo
// ============================================
// Test your cognitive control!
// Name the INK COLOR, not the word.
// Experience the conflict when they mismatch!

window.initSketch = function(p) {
  
  // ========== ADJUSTABLE PARAMETERS ==========
  // Try changing these values and click "Run"!
  
  let trialDuration = 3000;    // Time per trial (ms)
  let congruentRatio = 0.5;    // Ratio of congruent trials
  let showFeedback = true;     // Show reaction time feedback
  
  // ===========================================

  const colors = [
    { name: 'RED', rgb: [255, 80, 80] },
    { name: 'BLUE', rgb: [80, 150, 255] },
    { name: 'GREEN', rgb: [80, 200, 120] },
    { name: 'YELLOW', rgb: [255, 220, 80] }
  ];

  let currentTrial = null;
  let trialStartTime = 0;
  let reactionTime = 0;
  let results = { congruent: [], incongruent: [] };
  let state = 'ready'; // ready, showing, feedback
  let feedbackMessage = '';
  let correct = false;
  let prefrontalActivity = 0;
  let accActivity = 0; // Anterior Cingulate Cortex

  p.setup = function() {
    p.createCanvas(800, 500);
    createControls();
  };

  function createControls() {
    const panel = document.getElementById('controlsPanel');
    panel.style.display = 'flex';
    panel.innerHTML = `
      <button class="btn" id="startBtn" style="font-size: 16px; padding: 12px 24px;">▶ Start Trial</button>
      <button class="btn" id="redBtn" style="background: rgba(255,80,80,0.2); border-color: rgb(255,80,80); color: rgb(255,80,80);">RED (1)</button>
      <button class="btn" id="blueBtn" style="background: rgba(80,150,255,0.2); border-color: rgb(80,150,255); color: rgb(80,150,255);">BLUE (2)</button>
      <button class="btn" id="greenBtn" style="background: rgba(80,200,120,0.2); border-color: rgb(80,200,120); color: rgb(80,200,120);">GREEN (3)</button>
      <button class="btn" id="yellowBtn" style="background: rgba(255,220,80,0.2); border-color: rgb(255,220,80); color: rgb(255,220,80);">YELLOW (4)</button>
      <button class="btn" id="resetBtn">Reset Stats</button>
    `;

    document.getElementById('startBtn').addEventListener('click', startTrial);
    document.getElementById('redBtn').addEventListener('click', () => respond('RED'));
    document.getElementById('blueBtn').addEventListener('click', () => respond('BLUE'));
    document.getElementById('greenBtn').addEventListener('click', () => respond('GREEN'));
    document.getElementById('yellowBtn').addEventListener('click', () => respond('YELLOW'));
    document.getElementById('resetBtn').addEventListener('click', () => {
      results = { congruent: [], incongruent: [] };
      state = 'ready';
    });
  }

  function startTrial() {
    if (state !== 'ready' && state !== 'feedback') return;
    
    // Generate trial
    let wordColor = colors[Math.floor(p.random(colors.length))];
    let inkColor;
    
    if (p.random() < congruentRatio) {
      // Congruent trial
      inkColor = wordColor;
      currentTrial = { word: wordColor.name, ink: inkColor, type: 'congruent' };
    } else {
      // Incongruent trial
      do {
        inkColor = colors[Math.floor(p.random(colors.length))];
      } while (inkColor.name === wordColor.name);
      currentTrial = { word: wordColor.name, ink: inkColor, type: 'incongruent' };
    }

    state = 'showing';
    trialStartTime = Date.now();
    prefrontalActivity = currentTrial.type === 'incongruent' ? 0.8 : 0.3;
    accActivity = currentTrial.type === 'incongruent' ? 0.9 : 0.2;
  }

  function respond(colorName) {
    if (state !== 'showing') return;
    
    reactionTime = Date.now() - trialStartTime;
    correct = colorName === currentTrial.ink.name;
    
    // Record result
    if (currentTrial.type === 'congruent') {
      results.congruent.push({ rt: reactionTime, correct });
    } else {
      results.incongruent.push({ rt: reactionTime, correct });
    }

    // Feedback
    if (correct) {
      feedbackMessage = `✓ Correct! ${reactionTime}ms`;
    } else {
      feedbackMessage = `✗ Wrong! The ink was ${currentTrial.ink.name}`;
    }
    
    state = 'feedback';
    setTimeout(() => { state = 'ready'; }, 1500);
  }

  // Keyboard shortcuts
  p.keyPressed = function() {
    if (state === 'showing') {
      if (p.key === '1') respond('RED');
      if (p.key === '2') respond('BLUE');
      if (p.key === '3') respond('GREEN');
      if (p.key === '4') respond('YELLOW');
    }
    if (p.key === ' ') startTrial();
  };

  p.draw = function() {
    p.background(10, 14, 20);

    // Decay brain activity
    prefrontalActivity *= 0.98;
    accActivity *= 0.98;

    drawBrainRegions();
    drawStimulus();
    drawInstructions();
    drawResults();
    drawLabels();
  };

  function drawBrainRegions() {
    // Simplified brain diagram
    p.noFill();
    p.stroke(40, 50, 70);
    p.strokeWeight(2);
    p.ellipse(150, 150, 200, 180);

    // Prefrontal Cortex (PFC)
    let pfcGlow = prefrontalActivity * 150;
    for (let g = 30; g > 0; g -= 5) {
      p.noStroke();
      p.fill(100, 200, 255, pfcGlow * (30 - g) / 30 * 0.5);
      p.ellipse(80, 130, 60 + g, 50 + g);
    }
    p.fill(30, 60, 80);
    p.stroke(100, 200, 255, 100 + prefrontalActivity * 155);
    p.strokeWeight(2);
    p.ellipse(80, 130, 60, 50);
    
    p.noStroke();
    p.fill(100, 200, 255);
    p.textAlign(p.CENTER);
    p.textSize(9);
    p.text('PFC', 80, 133);
    p.text('Control', 80, 185);

    // Anterior Cingulate Cortex (ACC)
    let accGlow = accActivity * 150;
    for (let g = 25; g > 0; g -= 5) {
      p.noStroke();
      p.fill(255, 150, 100, accGlow * (25 - g) / 25 * 0.5);
      p.ellipse(150, 150, 50 + g, 40 + g);
    }
    p.fill(60, 40, 30);
    p.stroke(255, 150, 100, 100 + accActivity * 155);
    p.strokeWeight(2);
    p.ellipse(150, 150, 50, 40);
    
    p.noStroke();
    p.fill(255, 150, 100);
    p.textSize(9);
    p.text('ACC', 150, 153);
    p.text('Conflict', 150, 195);

    // Activity labels
    p.fill(100);
    p.textSize(10);
    p.textAlign(p.LEFT);
    p.text(`PFC: ${(prefrontalActivity * 100).toFixed(0)}%`, 40, 230);
    p.text(`ACC: ${(accActivity * 100).toFixed(0)}%`, 130, 230);

    // Brain region explanation
    p.fill(80);
    p.textSize(9);
    p.text('Prefrontal cortex provides', 40, 260);
    p.text('top-down control to override', 40, 273);
    p.text('the automatic word-reading.', 40, 286);
    
    p.text('ACC detects conflict between', 40, 310);
    p.text('competing responses and', 40, 323);
    p.text('signals need for control.', 40, 336);
  }

  function drawStimulus() {
    // Stimulus area
    p.fill(15, 20, 30);
    p.stroke(40, 50, 70);
    p.strokeWeight(2);
    p.rect(280, 80, 300, 200, 12);

    p.textAlign(p.CENTER, p.CENTER);

    if (state === 'ready') {
      p.fill(100);
      p.textSize(18);
      p.text('Press START or SPACE', 430, 150);
      p.textSize(14);
      p.text('Name the INK COLOR', 430, 180);
      p.fill(150);
      p.text('(ignore the word!)', 430, 200);
    } else if (state === 'showing' && currentTrial) {
      // Show the Stroop stimulus
      p.fill(currentTrial.ink.rgb[0], currentTrial.ink.rgb[1], currentTrial.ink.rgb[2]);
      p.textSize(60);
      p.textStyle(p.BOLD);
      p.text(currentTrial.word, 430, 160);
      p.textStyle(p.NORMAL);
      
      // Trial type indicator
      p.fill(currentTrial.type === 'congruent' ? [100, 255, 150] : [255, 150, 100]);
      p.textSize(12);
      p.text(currentTrial.type.toUpperCase(), 430, 250);
    } else if (state === 'feedback') {
      p.fill(correct ? [100, 255, 150] : [255, 100, 100]);
      p.textSize(24);
      p.text(feedbackMessage, 430, 160);
    }

    // Timer bar during trial
    if (state === 'showing') {
      let elapsed = Date.now() - trialStartTime;
      let progress = Math.min(1, elapsed / trialDuration);
      
      p.noStroke();
      p.fill(40, 50, 70);
      p.rect(290, 275, 280, 6, 3);
      p.fill(0, 212, 255);
      p.rect(290, 275, 280 * (1 - progress), 6, 3);
    }
  }

  function drawInstructions() {
    p.fill(30, 40, 55);
    p.stroke(50, 60, 80);
    p.strokeWeight(1);
    p.rect(280, 300, 300, 170, 8);

    p.noStroke();
    p.fill(180);
    p.textAlign(p.LEFT);
    p.textSize(12);
    p.text('The Stroop Effect', 295, 325);

    p.fill(120);
    p.textSize(10);
    let instructions = [
      'Task: Name the INK COLOR, not the word.',
      '',
      'Congruent: Word matches ink (easy)',
      'Incongruent: Word conflicts with ink (hard)',
      '',
      'Keyboard shortcuts: 1=Red, 2=Blue,',
      '3=Green, 4=Yellow, Space=Start'
    ];
    
    instructions.forEach((line, i) => {
      p.text(line, 295, 345 + i * 14);
    });
  }

  function drawResults() {
    p.fill(20, 28, 40);
    p.stroke(50, 60, 80);
    p.strokeWeight(1);
    p.rect(600, 80, 180, 390, 8);

    p.noStroke();
    p.fill(180);
    p.textAlign(p.LEFT);
    p.textSize(12);
    p.text('Results', 615, 105);

    // Congruent stats
    p.fill(100, 255, 150);
    p.textSize(11);
    p.text('Congruent Trials', 615, 130);
    
    let congCorrect = results.congruent.filter(r => r.correct).length;
    let congTotal = results.congruent.length;
    let congAvgRT = congTotal > 0 ? 
      results.congruent.filter(r => r.correct).reduce((s, r) => s + r.rt, 0) / Math.max(1, congCorrect) : 0;

    p.fill(150);
    p.textSize(10);
    p.text(`Accuracy: ${congTotal > 0 ? ((congCorrect/congTotal)*100).toFixed(0) : '--'}%`, 615, 150);
    p.text(`Avg RT: ${congTotal > 0 ? congAvgRT.toFixed(0) : '--'} ms`, 615, 165);
    p.text(`Trials: ${congTotal}`, 615, 180);

    // Incongruent stats
    p.fill(255, 150, 100);
    p.textSize(11);
    p.text('Incongruent Trials', 615, 210);
    
    let incongCorrect = results.incongruent.filter(r => r.correct).length;
    let incongTotal = results.incongruent.length;
    let incongAvgRT = incongTotal > 0 ? 
      results.incongruent.filter(r => r.correct).reduce((s, r) => s + r.rt, 0) / Math.max(1, incongCorrect) : 0;

    p.fill(150);
    p.textSize(10);
    p.text(`Accuracy: ${incongTotal > 0 ? ((incongCorrect/incongTotal)*100).toFixed(0) : '--'}%`, 615, 230);
    p.text(`Avg RT: ${incongTotal > 0 ? incongAvgRT.toFixed(0) : '--'} ms`, 615, 245);
    p.text(`Trials: ${incongTotal}`, 615, 260);

    // Stroop effect calculation
    if (congTotal >= 3 && incongTotal >= 3) {
      let stroopEffect = incongAvgRT - congAvgRT;
      
      p.fill(0, 212, 255);
      p.textSize(11);
      p.text('Stroop Effect:', 615, 295);
      
      p.textSize(20);
      p.text(`${stroopEffect.toFixed(0)} ms`, 615, 325);
      
      p.fill(100);
      p.textSize(9);
      p.text('(Incongruent RT - Congruent RT)', 615, 345);
      p.text('Higher = more interference', 615, 360);
    }

    // RT comparison bar chart
    if (congTotal > 0 || incongTotal > 0) {
      p.fill(120);
      p.textSize(10);
      p.text('Reaction Time Comparison:', 615, 390);

      let maxRT = Math.max(congAvgRT, incongAvgRT, 500);
      
      // Congruent bar
      let congBarWidth = (congAvgRT / maxRT) * 140;
      p.fill(100, 255, 150, 100);
      p.rect(615, 400, congBarWidth, 15, 3);
      p.fill(100, 255, 150);
      p.textSize(9);
      p.text('C', 620, 411);

      // Incongruent bar
      let incongBarWidth = (incongAvgRT / maxRT) * 140;
      p.fill(255, 150, 100, 100);
      p.rect(615, 420, incongBarWidth, 15, 3);
      p.fill(255, 150, 100);
      p.textSize(9);
      p.text('I', 620, 431);
    }
  }

  function drawLabels() {
    p.noStroke();
    p.fill(230);
    p.textAlign(p.LEFT);
    p.textSize(16);
    p.text('Stroop Task - Cognitive Control', 30, 30);
    
    p.fill(150);
    p.textSize(11);
    p.text('Experience how executive function overrides automatic responses', 280, 30);
  }
};





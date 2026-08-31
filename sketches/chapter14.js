// ============================================
// CHAPTER 13: PSYCHOPHARMACOLOGY
// Drug Effects on Synaptic Transmission
// ============================================
// See how drugs affect neurotransmitter systems!
// Explore agonists, antagonists, and reuptake
// inhibitors at the synapse.

window.initSketch = function(p) {
  
  // ========== ADJUSTABLE PARAMETERS ==========
  // Try changing these values and click "Run"!
  
  let drugType = 'none';        // Current drug effect
  let drugConcentration = 0.7;  // Drug concentration (0-1)
  let releaseRate = 0.5;        // Neurotransmitter release rate
  let reuptakeRate = 0.3;       // Normal reuptake rate
  
  // ===========================================

  const drugs = {
    none: { name: 'No Drug', color: [150, 150, 150], desc: 'Normal synaptic transmission' },
    agonist: { name: 'Agonist', color: [100, 255, 150], desc: 'Mimics neurotransmitter, activates receptors' },
    antagonist: { name: 'Antagonist', color: [255, 100, 100], desc: 'Blocks receptors, prevents activation' },
    reuptake: { name: 'Reuptake Inhibitor', color: [100, 200, 255], desc: 'Blocks reuptake, increases NT in cleft' },
    releaser: { name: 'Releaser', color: [255, 200, 100], desc: 'Increases neurotransmitter release' },
    enzyme: { name: 'Enzyme Inhibitor', color: [200, 150, 255], desc: 'Blocks breakdown, prolongs NT action' }
  };

  let neurotransmitters = [];
  let receptors = [];
  let reuptakeTransporters = [];
  let drugMolecules = [];
  let postsynapticActivity = 0;
  let time = 0;

  p.setup = function() {
    p.createCanvas(800, 500);
    initSynapse();
    createControls();
  };

  function createControls() {
    const panel = document.getElementById('controlsPanel');
    panel.style.display = 'flex';
    panel.innerHTML = `
      <button class="btn" id="noneBtn">💊 No Drug</button>
      <button class="btn" id="agonistBtn" style="border-color: rgb(100,255,150); color: rgb(100,255,150);">Agonist</button>
      <button class="btn" id="antagonistBtn" style="border-color: rgb(255,100,100); color: rgb(255,100,100);">Antagonist</button>
      <button class="btn" id="reuptakeBtn" style="border-color: rgb(100,200,255); color: rgb(100,200,255);">Reuptake Inh.</button>
      <button class="btn" id="releaserBtn" style="border-color: rgb(255,200,100); color: rgb(255,200,100);">Releaser</button>
      <button class="btn" id="releaseNT">⚡ Release NT</button>
    `;

    document.getElementById('noneBtn').addEventListener('click', () => setDrug('none'));
    document.getElementById('agonistBtn').addEventListener('click', () => setDrug('agonist'));
    document.getElementById('antagonistBtn').addEventListener('click', () => setDrug('antagonist'));
    document.getElementById('reuptakeBtn').addEventListener('click', () => setDrug('reuptake'));
    document.getElementById('releaserBtn').addEventListener('click', () => setDrug('releaser'));
    document.getElementById('releaseNT').addEventListener('click', releaseNT);
  }

  function initSynapse() {
    // Create receptors
    receptors = [];
    for (let i = 0; i < 8; i++) {
      receptors.push({
        x: 180 + i * 55,
        y: 320,
        bound: false,
        blocked: false,
        activated: false
      });
    }

    // Create reuptake transporters
    reuptakeTransporters = [];
    for (let i = 0; i < 5; i++) {
      reuptakeTransporters.push({
        x: 130 + i * 80,
        y: 150,
        blocked: false,
        active: false
      });
    }
  }

  function setDrug(type) {
    drugType = type;
    drugMolecules = [];
    
    // Add drug molecules
    if (type !== 'none') {
      for (let i = 0; i < 15; i++) {
        drugMolecules.push({
          x: p.random(100, 600),
          y: p.random(180, 300),
          vx: p.random(-1, 1),
          vy: p.random(-0.5, 0.5),
          type: type
        });
      }
    }

    // Reset states based on drug
    receptors.forEach(r => {
      r.blocked = false;
    });
    reuptakeTransporters.forEach(t => {
      t.blocked = false;
    });
  }

  function releaseNT() {
    let amount = drugType === 'releaser' ? 20 : 10;
    
    for (let i = 0; i < amount; i++) {
      neurotransmitters.push({
        x: 250 + p.random(200),
        y: 160,
        vx: p.random(-1, 1),
        vy: p.random(1, 3),
        bound: false,
        life: 1
      });
    }
  }

  p.draw = function() {
    p.background(10, 14, 20);
    time += 0.016;

    updatePhysics();
    
    drawPresynaptic();
    drawSynapticCleft();
    drawPostsynaptic();
    drawNeurotransmitters();
    drawDrugMolecules();
    drawInfoPanel();
    drawLabels();
  };

  function updatePhysics() {
    // Update neurotransmitters
    for (let i = neurotransmitters.length - 1; i >= 0; i--) {
      let nt = neurotransmitters[i];
      if (nt.bound) continue;
      
      nt.x += nt.vx;
      nt.y += nt.vy;
      nt.vy *= 0.98;
      nt.vx += (p.noise(nt.x * 0.01, time) - 0.5) * 0.3;
      
      // Check reuptake (unless blocked)
      let effectiveReuptake = reuptakeRate;
      if (drugType === 'reuptake') {
        effectiveReuptake *= (1 - drugConcentration * 0.9);
      }
      
      reuptakeTransporters.forEach(t => {
        if (!t.blocked && p.dist(nt.x, nt.y, t.x, t.y) < 30) {
          if (p.random() < effectiveReuptake * 0.1) {
            nt.life = 0; // Reuptake
            t.active = true;
            setTimeout(() => { t.active = false; }, 200);
          }
        }
      });

      // Check receptor binding
      receptors.forEach(r => {
        if (!r.bound && !r.blocked && p.dist(nt.x, nt.y, r.x, r.y) < 30) {
          if (p.random() < 0.3) {
            nt.bound = true;
            nt.x = r.x;
            nt.y = r.y - 15;
            r.bound = true;
            r.activated = true;
          }
        }
      });
      
      nt.life -= 0.003;
      if (nt.life <= 0 || nt.y > 350 || nt.y < 140) {
        neurotransmitters.splice(i, 1);
      }
    }

    // Drug effects
    if (drugType === 'antagonist') {
      drugMolecules.forEach(dm => {
        receptors.forEach(r => {
          if (p.dist(dm.x, dm.y, r.x, r.y) < 35) {
            r.blocked = true;
            r.activated = false;
          }
        });
      });
    }

    if (drugType === 'reuptake') {
      drugMolecules.forEach(dm => {
        reuptakeTransporters.forEach(t => {
          if (p.dist(dm.x, dm.y, t.x, t.y) < 35) {
            t.blocked = true;
          }
        });
      });
    }

    if (drugType === 'agonist') {
      drugMolecules.forEach(dm => {
        receptors.forEach(r => {
          if (!r.blocked && p.dist(dm.x, dm.y, r.x, r.y) < 35) {
            r.activated = true;
          }
        });
      });
    }

    // Update drug molecules
    drugMolecules.forEach(dm => {
      dm.x += dm.vx;
      dm.y += dm.vy;
      
      // Bounce off walls
      if (dm.x < 100 || dm.x > 600) dm.vx *= -1;
      if (dm.y < 160 || dm.y > 340) dm.vy *= -1;
    });

    // Unbind occasionally
    receptors.forEach(r => {
      if (r.bound && p.random() < 0.01) {
        r.bound = false;
        r.activated = false;
      }
    });

    // Calculate postsynaptic activity
    let activeReceptors = receptors.filter(r => r.activated).length;
    postsynapticActivity = p.lerp(postsynapticActivity, activeReceptors / receptors.length, 0.1);
  }

  function drawPresynaptic() {
    // Terminal
    p.fill(30, 40, 60);
    p.stroke(70, 90, 130);
    p.strokeWeight(2);
    p.rect(100, 50, 500, 120, 0, 0, 20, 20);

    // Vesicles
    for (let i = 0; i < 8; i++) {
      let x = 150 + i * 55;
      let y = 100;
      
      p.fill(80, 120, 180);
      p.stroke(120, 160, 220);
      p.strokeWeight(1);
      p.circle(x, y, 30);
      
      // NT inside
      p.noStroke();
      p.fill(255, 200, 100);
      for (let j = 0; j < 4; j++) {
        let angle = j * p.HALF_PI + time;
        p.circle(x + Math.cos(angle) * 8, y + Math.sin(angle) * 8, 5);
      }
    }

    // Reuptake transporters
    reuptakeTransporters.forEach(t => {
      p.fill(t.blocked ? [255, 100, 100] : (t.active ? [100, 255, 150] : [60, 80, 110]));
      p.stroke(t.blocked ? [255, 150, 150] : [100, 130, 170]);
      p.strokeWeight(2);
      p.rect(t.x - 15, t.y - 10, 30, 25, 4);
      
      // Arrow
      p.stroke(t.blocked ? [255, 100, 100] : [150, 180, 220]);
      p.line(t.x, t.y + 15, t.x, t.y - 5);
      p.line(t.x - 5, t.y, t.x, t.y - 5);
      p.line(t.x + 5, t.y, t.x, t.y - 5);
      
      if (t.blocked) {
        p.stroke(255, 100, 100);
        p.strokeWeight(2);
        p.line(t.x - 12, t.y - 8, t.x + 12, t.y + 8);
      }
    });

    // Label
    p.noStroke();
    p.fill(120);
    p.textAlign(p.CENTER);
    p.textSize(10);
    p.text('PRESYNAPTIC', 350, 70);
  }

  function drawSynapticCleft() {
    p.noStroke();
    p.fill(80);
    p.textAlign(p.LEFT);
    p.textSize(10);
    p.text('SYNAPTIC CLEFT', 620, 240);
  }

  function drawPostsynaptic() {
    // Membrane
    p.fill(40, 50, 70);
    p.stroke(80, 100, 140);
    p.strokeWeight(2);
    p.rect(100, 310, 500, 140, 20, 20, 0, 0);

    // Receptors
    receptors.forEach(r => {
      // Receptor body
      let bodyColor = r.blocked ? [100, 50, 50] : 
                      r.activated ? [50, 120, 80] : [50, 60, 80];
      p.fill(bodyColor[0], bodyColor[1], bodyColor[2]);
      p.stroke(r.activated ? [100, 255, 150] : [80, 100, 140]);
      p.strokeWeight(2);
      p.rect(r.x - 18, r.y - 30, 36, 50, 4);

      // Binding site
      p.fill(r.bound ? [255, 200, 100] : (r.blocked ? [255, 100, 100] : [70, 80, 100]));
      p.noStroke();
      p.arc(r.x, r.y - 30, 28, 20, p.PI, 0);

      // Block X
      if (r.blocked) {
        p.stroke(255, 100, 100);
        p.strokeWeight(3);
        p.line(r.x - 10, r.y - 35, r.x + 10, r.y - 20);
        p.line(r.x + 10, r.y - 35, r.x - 10, r.y - 20);
      }

      // Ion flow
      if (r.activated) {
        p.noStroke();
        p.fill(100, 255, 150, 150);
        p.circle(r.x, r.y + 30, 10 + Math.sin(time * 10) * 5);
      }
    });

    // Activity meter
    let meterWidth = 100;
    let meterX = 520;
    let meterY = 380;
    
    p.fill(30, 40, 55);
    p.stroke(60, 80, 120);
    p.strokeWeight(1);
    p.rect(meterX, meterY, meterWidth, 20, 4);
    
    p.noStroke();
    p.fill(100, 255, 150);
    p.rect(meterX, meterY, meterWidth * postsynapticActivity, 20, 4);
    
    p.fill(200);
    p.textSize(10);
    p.textAlign(p.LEFT);
    p.text(`Activity: ${(postsynapticActivity * 100).toFixed(0)}%`, meterX, meterY - 8);
  }

  function drawNeurotransmitters() {
    neurotransmitters.forEach(nt => {
      p.noStroke();
      
      if (nt.bound) {
        p.fill(255, 200, 100);
        p.circle(nt.x, nt.y, 12);
      } else {
        // Trail
        p.fill(255, 200, 100, nt.life * 50);
        p.circle(nt.x - nt.vx * 2, nt.y - nt.vy * 2, 6);
        
        p.fill(255, 200, 100, nt.life * 255);
        p.circle(nt.x, nt.y, 10);
      }
    });
  }

  function drawDrugMolecules() {
    let drug = drugs[drugType];
    
    drugMolecules.forEach(dm => {
      // Drug molecule
      p.noStroke();
      for (let g = 15; g > 0; g -= 3) {
        p.fill(drug.color[0], drug.color[1], drug.color[2], (15 - g) * 3);
        p.circle(dm.x, dm.y, 12 + g);
      }
      
      p.fill(drug.color[0], drug.color[1], drug.color[2]);
      p.stroke(255, 255, 255, 100);
      p.strokeWeight(1);
      
      // Different shapes for different drugs
      if (drugType === 'agonist') {
        p.circle(dm.x, dm.y, 12);
      } else if (drugType === 'antagonist') {
        p.rectMode(p.CENTER);
        p.rect(dm.x, dm.y, 12, 12, 2);
        p.rectMode(p.CORNER);
      } else {
        p.triangle(dm.x, dm.y - 7, dm.x - 6, dm.y + 5, dm.x + 6, dm.y + 5);
      }
    });
  }

  function drawInfoPanel() {
    let drug = drugs[drugType];
    
    p.fill(20, 28, 40, 240);
    p.stroke(drug.color[0], drug.color[1], drug.color[2], 150);
    p.strokeWeight(1);
    p.rect(620, 50, 160, 250, 8);

    p.noStroke();
    p.fill(drug.color[0], drug.color[1], drug.color[2]);
    p.textAlign(p.LEFT);
    p.textSize(12);
    p.text(drug.name, 635, 75);

    p.fill(180);
    p.textSize(10);
    
    // Word wrap description
    let words = drug.desc.split(' ');
    let line = '';
    let y = 95;
    words.forEach(word => {
      if ((line + word).length > 20) {
        p.text(line, 635, y);
        y += 14;
        line = word + ' ';
      } else {
        line += word + ' ';
      }
    });
    p.text(line, 635, y);

    // Stats
    y = 160;
    p.fill(120);
    p.textSize(10);
    p.text('Free NT: ' + neurotransmitters.filter(n => !n.bound).length, 635, y);
    p.text('Bound: ' + receptors.filter(r => r.bound).length, 635, y + 15);
    p.text('Blocked: ' + receptors.filter(r => r.blocked).length, 635, y + 30);
    p.text('Active: ' + receptors.filter(r => r.activated).length, 635, y + 45);

    // Drug legend
    p.fill(100);
    p.textSize(9);
    y = 230;
    p.text('🟡 Neurotransmitter', 635, y);
    p.fill(drug.color[0], drug.color[1], drug.color[2]);
    p.text('⬤ Drug molecule', 635, y + 15);
  }

  function drawLabels() {
    p.noStroke();
    p.fill(230);
    p.textAlign(p.LEFT);
    p.textSize(16);
    p.text('Drug Effects at the Synapse', 30, 30);
    
    p.fill(150);
    p.textSize(11);
    p.text('Select a drug type and click Release NT to see effects', 260, 30);
  }
};





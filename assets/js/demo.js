// ===== BEAMFLOW DEMO SYSTEM =====

class BeamFlowDemo {
  constructor() {
    this.currentDemo = 'streaming';
    this.isRunning = false;
    this.metrics = {
      eventsProcessed: 0,
      processingRate: 0,
      latency: 0
    };
    this.animationFrame = null;
    this.init();
  }

  init() {
    this.setupDemoControls();
    this.setupVisualization();
    this.setupMetrics();
    this.startDemo();
  }

  // ===== DEMO CONTROLS =====
  setupDemoControls() {
    const demoButtons = document.querySelectorAll('.demo-btn');
    
    demoButtons.forEach(button => {
      button.addEventListener('click', () => {
        const demoType = button.getAttribute('data-demo');
        this.switchDemo(demoType);
        
        // Update active state
        demoButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
      });
    });
  }

  switchDemo(demoType) {
    this.currentDemo = demoType;
    this.resetMetrics();
    this.updateVisualization();
    
    // Track demo switch
    if (window.BeamFlowUtils) {
      window.BeamFlowUtils.trackEvent('demo_switch', 'interaction', demoType);
    }
  }

  // ===== VISUALIZATION =====
  setupVisualization() {
    const container = document.getElementById('demoVisualization');
    if (!container) return;

    // Create canvas for visualization
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    container.appendChild(this.canvas);

    // Set canvas size
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Initialize visualization data
    this.visualizationData = {
      nodes: [],
      connections: [],
      particles: [],
      flowData: []
    };

    this.createVisualizationElements();
  }

  resizeCanvas() {
    const container = this.canvas.parentElement;
    this.canvas.width = container.offsetWidth;
    this.canvas.height = container.offsetHeight;
  }

  createVisualizationElements() {
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Create nodes based on demo type
    switch (this.currentDemo) {
      case 'streaming':
        this.createStreamingNodes(width, height);
        break;
      case 'ml':
        this.createMLNodes(width, height);
        break;
      case 'etl':
        this.createETLNodes(width, height);
        break;
    }
  }

  createStreamingNodes(width, height) {
    this.visualizationData.nodes = [
      { x: width * 0.2, y: height * 0.5, type: 'source', label: 'Kafka', color: '#ff6b6b' },
      { x: width * 0.4, y: height * 0.3, type: 'processor', label: 'Filter', color: '#4ecdc4' },
      { x: width * 0.4, y: height * 0.7, type: 'processor', label: 'Transform', color: '#45b7d1' },
      { x: width * 0.6, y: height * 0.5, type: 'processor', label: 'Aggregate', color: '#96ceb4' },
      { x: width * 0.8, y: height * 0.5, type: 'sink', label: 'Elasticsearch', color: '#feca57' }
    ];

    this.visualizationData.connections = [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 3 },
      { from: 3, to: 4 }
    ];
  }

  createMLNodes(width, height) {
    this.visualizationData.nodes = [
      { x: width * 0.15, y: height * 0.5, type: 'source', label: 'Data Source', color: '#ff6b6b' },
      { x: width * 0.35, y: height * 0.3, type: 'processor', label: 'Preprocess', color: '#4ecdc4' },
      { x: width * 0.35, y: height * 0.7, type: 'processor', label: 'Feature Extract', color: '#45b7d1' },
      { x: width * 0.55, y: height * 0.5, type: 'processor', label: 'ML Model', color: '#96ceb4' },
      { x: width * 0.75, y: height * 0.3, type: 'sink', label: 'Predictions', color: '#feca57' },
      { x: width * 0.75, y: height * 0.7, type: 'sink', label: 'Model Update', color: '#ff9ff3' }
    ];

    this.visualizationData.connections = [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 3 },
      { from: 3, to: 4 },
      { from: 3, to: 5 }
    ];
  }

  createETLNodes(width, height) {
    this.visualizationData.nodes = [
      { x: width * 0.1, y: height * 0.5, type: 'source', label: 'MySQL', color: '#ff6b6b' },
      { x: width * 0.3, y: height * 0.3, type: 'processor', label: 'Extract', color: '#4ecdc4' },
      { x: width * 0.3, y: height * 0.7, type: 'processor', label: 'Transform', color: '#45b7d1' },
      { x: width * 0.5, y: height * 0.5, type: 'processor', label: 'Load', color: '#96ceb4' },
      { x: width * 0.7, y: height * 0.3, type: 'sink', label: 'Data Warehouse', color: '#feca57' },
      { x: width * 0.7, y: height * 0.7, type: 'sink', label: 'Analytics DB', color: '#ff9ff3' }
    ];

    this.visualizationData.connections = [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 3 },
      { from: 3, to: 4 },
      { from: 3, to: 5 }
    ];
  }

  updateVisualization() {
    this.createVisualizationElements();
    this.drawVisualization();
  }

  drawVisualization() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw connections
    this.drawConnections();

    // Draw nodes
    this.drawNodes();

    // Draw particles
    this.drawParticles();

    // Draw flow data
    this.drawFlowData();
  }

  drawConnections() {
    const ctx = this.ctx;
    const nodes = this.visualizationData.nodes;

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    this.visualizationData.connections.forEach(connection => {
      const from = nodes[connection.from];
      const to = nodes[connection.to];

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    });

    ctx.setLineDash([]);
  }

  drawNodes() {
    const ctx = this.ctx;
    const nodes = this.visualizationData.nodes;

    nodes.forEach(node => {
      // Draw node circle
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
      ctx.fill();

      // Draw node border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw node label
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y + 35);
    });
  }

  drawParticles() {
    const ctx = this.ctx;
    
    this.visualizationData.particles.forEach(particle => {
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.opacity;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
  }

  drawFlowData() {
    const ctx = this.ctx;
    
    this.visualizationData.flowData.forEach(data => {
      ctx.fillStyle = data.color;
      ctx.globalAlpha = data.opacity;
      ctx.fillRect(data.x, data.y, data.width, data.height);
    });

    ctx.globalAlpha = 1;
  }

  // ===== METRICS =====
  setupMetrics() {
    this.updateMetricsDisplay();
  }

  updateMetricsDisplay() {
    const eventsProcessed = document.getElementById('eventsProcessed');
    const processingRate = document.getElementById('processingRate');
    const latency = document.getElementById('latency');

    if (eventsProcessed) {
      eventsProcessed.textContent = this.formatNumber(this.metrics.eventsProcessed);
    }
    if (processingRate) {
      processingRate.textContent = this.formatNumber(this.metrics.processingRate);
    }
    if (latency) {
      latency.textContent = this.metrics.latency.toFixed(1);
    }
  }

  resetMetrics() {
    this.metrics = {
      eventsProcessed: 0,
      processingRate: 0,
      latency: 0
    };
    this.updateMetricsDisplay();
  }

  updateMetrics() {
    // Simulate real-time metrics updates
    const rateMultiplier = this.getRateMultiplier();
    
    this.metrics.eventsProcessed += Math.floor(Math.random() * 100 * rateMultiplier);
    this.metrics.processingRate = Math.floor(Math.random() * 10000 * rateMultiplier);
    this.metrics.latency = Math.random() * 10 + 0.5;

    this.updateMetricsDisplay();
  }

  getRateMultiplier() {
    switch (this.currentDemo) {
      case 'streaming': return 2;
      case 'ml': return 1.5;
      case 'etl': return 1;
      default: return 1;
    }
  }

  // ===== ANIMATION LOOP =====
  startDemo() {
    this.isRunning = true;
    this.animationLoop();
  }

  stopDemo() {
    this.isRunning = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  animationLoop() {
    if (!this.isRunning) return;

    this.updateMetrics();
    this.updateParticles();
    this.updateFlowData();
    this.drawVisualization();

    this.animationFrame = requestAnimationFrame(() => this.animationLoop());
  }

  updateParticles() {
    const nodes = this.visualizationData.nodes;
    
    // Add new particles
    if (Math.random() < 0.3) {
      const sourceNode = nodes.find(node => node.type === 'source');
      if (sourceNode) {
        this.visualizationData.particles.push({
          x: sourceNode.x + (Math.random() - 0.5) * 20,
          y: sourceNode.y + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: Math.random() * 3 + 1,
          opacity: 1,
          color: sourceNode.color,
          life: 100
        });
      }
    }

    // Update existing particles
    this.visualizationData.particles = this.visualizationData.particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.opacity -= 0.01;
      particle.life--;

      return particle.life > 0 && particle.opacity > 0;
    });
  }

  updateFlowData() {
    const nodes = this.visualizationData.nodes;
    
    // Add flow data between connected nodes
    this.visualizationData.connections.forEach(connection => {
      if (Math.random() < 0.1) {
        const from = nodes[connection.from];
        const to = nodes[connection.to];
        
        const progress = Math.random();
        const x = from.x + (to.x - from.x) * progress;
        const y = from.y + (to.y - from.y) * progress;
        
        this.visualizationData.flowData.push({
          x: x - 2,
          y: y - 2,
          width: 4,
          height: 4,
          opacity: 1,
          color: from.color,
          life: 50
        });
      }
    });

    // Update existing flow data
    this.visualizationData.flowData = this.visualizationData.flowData.filter(data => {
      data.opacity -= 0.02;
      data.life--;
      return data.life > 0 && data.opacity > 0;
    });
  }

  // ===== UTILITY FUNCTIONS =====
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  // ===== DEMO CONFIGURATIONS =====
  getDemoConfig(demoType) {
    const configs = {
      streaming: {
        title: 'Real-Time Streaming Analytics',
        description: 'Process millions of events per second with sub-millisecond latency',
        features: ['Event filtering', 'Real-time aggregation', 'Stream processing', 'Low latency']
      },
      ml: {
        title: 'Machine Learning Pipeline',
        description: 'Train and deploy ML models in real-time data streams',
        features: ['Feature engineering', 'Model training', 'Real-time inference', 'Model updates']
      },
      etl: {
        title: 'ETL Data Processing',
        description: 'Extract, transform, and load data from multiple sources',
        features: ['Data extraction', 'Transformation', 'Loading', 'Scheduling']
      }
    };

    return configs[demoType] || configs.streaming;
  }

  // ===== INTERACTIVE FEATURES =====
  setupInteractiveFeatures() {
    // Node click events
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      this.handleNodeClick(x, y);
    });

    // Hover effects
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      this.handleNodeHover(x, y);
    });
  }

  handleNodeClick(x, y) {
    const nodes = this.visualizationData.nodes;
    
    nodes.forEach((node, index) => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      
      if (distance < 20) {
        this.showNodeDetails(node, index);
      }
    });
  }

  handleNodeHover(x, y) {
    const nodes = this.visualizationData.nodes;
    
    nodes.forEach(node => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      
      if (distance < 20) {
        this.canvas.style.cursor = 'pointer';
        return;
      }
    });
    
    this.canvas.style.cursor = 'default';
  }

  showNodeDetails(node, index) {
    const config = this.getDemoConfig(this.currentDemo);
    
    // Create tooltip or modal with node details
    const tooltip = document.createElement('div');
    tooltip.className = 'node-tooltip';
    tooltip.innerHTML = `
      <h4>${node.label}</h4>
      <p>Type: ${node.type}</p>
      <p>Status: Active</p>
      <p>Processing: ${this.formatNumber(Math.random() * 1000)} events/sec</p>
    `;
    
    tooltip.style.position = 'absolute';
    tooltip.style.left = this.canvas.offsetLeft + node.x + 'px';
    tooltip.style.top = this.canvas.offsetTop + node.y - 60 + 'px';
    
    document.body.appendChild(tooltip);
    
    setTimeout(() => {
      document.body.removeChild(tooltip);
    }, 3000);
  }
}

// ===== DEMO UTILITIES =====

// Generate sample data
function generateSampleData(type, count = 100) {
  const data = [];
  
  for (let i = 0; i < count; i++) {
    switch (type) {
      case 'streaming':
        data.push({
          id: i,
          timestamp: Date.now() + i * 1000,
          event_type: ['click', 'view', 'purchase'][Math.floor(Math.random() * 3)],
          user_id: Math.floor(Math.random() * 10000),
          value: Math.random() * 100
        });
        break;
      case 'ml':
        data.push({
          id: i,
          features: Array.from({ length: 10 }, () => Math.random()),
          prediction: Math.random() > 0.5,
          confidence: Math.random()
        });
        break;
      case 'etl':
        data.push({
          id: i,
          source: ['mysql', 'postgres', 'mongodb'][Math.floor(Math.random() * 3)],
          table: 'users',
          record_count: Math.floor(Math.random() * 1000),
          processed: Math.random() > 0.8
        });
        break;
    }
  }
  
  return data;
}

// Export demo data
function exportDemoData() {
  const data = generateSampleData('streaming', 1000);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'beamflow-demo-data.json';
  a.click();
  
  URL.revokeObjectURL(url);
}

// ===== INITIALIZATION =====

// Initialize demo when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.beamFlowDemo = new BeamFlowDemo();
});

// Export for use in other modules
window.BeamFlowDemo = BeamFlowDemo;

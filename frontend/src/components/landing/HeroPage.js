import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroPage.css';

const HeroPage = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const balls = [];
  const friction = 0.98;
  const bounce = 0.8;
  const gravity = 0.2;
  let physicsActive = false;

  const words = [
    "Food", "طعام", "食べ物", "لذيذ", "delicious ", "भोजन",
    "Bia", "Bwyd", "Menjar", "Biadh", "Їжа", "Hrana", "Maistas",
    "Ēdiens", "Toit", "ምግብ", "Ounjẹ", "Abinci", "Cunto"
  ];

  class LiquidButton {
    constructor(options) {
      this.tension = options.tension || 0.4;
      this.width = options.width || 200;
      this.height = options.height || 50;
      this.margin = options.margin || 50;
      this.padding = options.padding || 17;
      this.hoverFactor = options.hoverFactor || -0.3;
      this.gap = options.gap || 5;
      this.forceFactor = options.forceFactor || 0.2;
      this.color1 = options.color1 || '#2c3e50';
      this.color2 = options.color2 || '#231709';
      this.color3 = options.color3 || '#3D2B1F';
      this.textColor = options.textColor || '#FFFFFF';
      this.layers = [
        { points: [], viscosity: 0.4, mouseForce: 200, forceLimit: 3 },
        { points: [], viscosity: 0.6, mouseForce: 300, forceLimit: 4 },
      ];
      this.text = options.text || 'Begin Journey';
      this.canvas = document.getElementById('liquid-button-canvas');
      this.context = this.canvas?.getContext('2d');
      this.touches = [];
      if (this.canvas && this.context) {
        this.initOrigins();
        this.bindEvents();
        this.animate();
      }
    }

    bindEvents() {
      if (this.canvas) {
        this.canvas.addEventListener('mousemove', this.mousemove.bind(this));
        this.canvas.addEventListener('mouseout', this.mouseout.bind(this));
        this.canvas.addEventListener('click', this.click.bind(this));
      }
    }

    click() {
      startPhysics();
    }

    mousemove(e) {
      const rect = this.canvas?.getBoundingClientRect();
      if (rect) {
        this.touches = [{
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          z: 0,
          force: 1,
        }];
      }
    }

    mouseout() {
      this.touches = [];
    }

    distance(p1, p2) {
      return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }

    update() {
      for (let layerIndex = 0; layerIndex < this.layers.length; layerIndex++) {
        const layer = this.layers[layerIndex];
        const points = layer.points;
        for (let pointIndex = 0; pointIndex < points.length; pointIndex++) {
          const point = points[pointIndex];
          const dx = point.ox - point.x;
          const dy = point.oy - point.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          const f = d * this.forceFactor;
          point.vx += f * ((dx / d) || 0);
          point.vy += f * ((dy / d) || 0);
          for (let touchIndex = 0; touchIndex < this.touches.length; touchIndex++) {
            const touch = this.touches[touchIndex];
            let mouseForce = layer.mouseForce;
            if (
              touch.x > this.margin &&
              touch.x < this.margin + this.width &&
              touch.y > this.margin &&
              touch.y < this.margin + this.height
            ) {
              mouseForce *= -this.hoverFactor;
            }
            const mx = point.x - touch.x;
            const my = point.y - touch.y;
            const md = Math.sqrt(mx * mx + my * my);
            const mf = Math.max(-layer.forceLimit, Math.min(layer.forceLimit, (mouseForce * touch.force) / md));
            point.vx += mf * ((mx / md) || 0);
            point.vy += mf * ((my / md) || 0);
          }
          point.vx *= layer.viscosity;
          point.vy *= layer.viscosity;
          point.x += point.vx;
          point.y += point.vy;
        }
        for (let pointIndex = 0; pointIndex < points.length; pointIndex++) {
          const prev = points[(pointIndex + points.length - 1) % points.length];
          const point = points[pointIndex];
          const next = points[(pointIndex + 1) % points.length];
          const dPrev = this.distance(point, prev);
          const dNext = this.distance(point, next);

          const line = { x: next.x - prev.x, y: next.y - prev.y };
          const dLine = Math.sqrt(line.x * line.x + line.y * line.y);

          point.cPrev = {
            x: point.x - (line.x / dLine) * dPrev * this.tension,
            y: point.y - (line.y / dLine) * dPrev * this.tension,
          };
          point.cNext = {
            x: point.x + (line.x / dLine) * dNext * this.tension,
            y: point.y + (line.y / dLine) * dNext * this.tension,
          };
        }
      }
    }

    animate() {
      if (!this.context) return;
      requestAnimationFrame(() => {
        this.update();
        this.draw();
        this.animate();
      });
    }

    draw() {
      if (!this.context) return;
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (let layerIndex = 0; layerIndex < this.layers.length; layerIndex++) {
        const layer = this.layers[layerIndex];
        if (layerIndex === 1) {
          if (this.touches.length > 0) {
            const gx = this.touches[0].x;
            const gy = this.touches[0].y;
            layer.color = this.context.createRadialGradient(gx, gy, this.height * 2, gx, gy, 0);
            layer.color.addColorStop(0, this.color2);
            layer.color.addColorStop(1, this.color3);
          } else {
            layer.color = this.color2;
          }
        } else {
          layer.color = this.color1;
        }
        const points = layer.points;
        this.context.fillStyle = layer.color;
        this.context.beginPath();
        this.context.moveTo(points[0].x, points[0].y);
        for (let pointIndex = 1; pointIndex < points.length; pointIndex += 1) {
          this.context.bezierCurveTo(
            points[pointIndex % points.length].cNext.x,
            points[pointIndex % points.length].cNext.y,
            points[(pointIndex + 1) % points.length].cPrev.x,
            points[(pointIndex + 1) % points.length].cPrev.y,
            points[(pointIndex + 1) % points.length].x,
            points[(pointIndex + 1) % points.length].y
          );
        }
        this.context.fill();
      }
      this.context.fillStyle = this.textColor;
      this.context.font = '16px "Press Start 2P"';
      this.context.textAlign = 'center';
      this.context.textBaseline = 'middle';
      this.context.fillText(this.text, this.canvas.width / 2, this.canvas.height / 2);
    }

    createPoint(x, y) {
      return { x, y, ox: x, oy: y, vx: 0, vy: 0 };
    }

    initOrigins() {
      if (!this.canvas) return;
      this.canvas.width = this.width + this.margin * 2;
      this.canvas.height = this.height + this.margin * 2;
      for (let layerIndex = 0; layerIndex < this.layers.length; layerIndex++) {
        const layer = this.layers[layerIndex];
        const points = [];
        for (let x = ~~(this.height / 2); x < this.width - ~~(this.height / 2); x += this.gap) {
          points.push(this.createPoint(x + this.margin, this.margin));
        }
        for (let alpha = ~~(this.height * 1.25); alpha >= 0; alpha -= this.gap) {
          const angle = (Math.PI / ~~(this.height * 1.25)) * alpha;
          points.push(this.createPoint(
            Math.sin(angle) * this.height / 2 + this.margin + this.width - this.height / 2,
            Math.cos(angle) * this.height / 2 + this.margin + this.height / 2
          ));
        }
        for (let x = this.width - ~~(this.height / 2) - 1; x >= ~~(this.height / 2); x -= this.gap) {
          points.push(this.createPoint(x + this.margin, this.margin + this.height));
        }
        for (let alpha = 0; alpha <= ~~(this.height * 1.25); alpha += this.gap) {
          const angle = (Math.PI / ~~(this.height * 1.25)) * alpha;
          points.push(this.createPoint(
            (this.height - Math.sin(angle) * this.height / 2) + this.margin - this.height / 2,
            Math.cos(angle) * this.height / 2 + this.margin + this.height / 2
          ));
        }
        layer.points = points;
      }
    }
  }

  const initBalls = () => {
    const background = document.querySelector('.background');
    const spans = background?.querySelectorAll('span');
    if (!spans) return;
    spans.forEach((span) => {
      const rect = span.getBoundingClientRect();
      const size = parseInt(getComputedStyle(span).width) / 2;
      balls.push({
        element: span,
        x: rect.left + size,
        y: rect.top + size,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        radius: size,
        originalColor: getComputedStyle(span).color
      });
    });
  };

  const updatePhysics = () => {
    if (!physicsActive) return;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    let allBallsFaded = true;

    balls.forEach((ball) => {
      if (!ball.element) return;
      ball.vy += gravity;
      ball.x += ball.vx;
      ball.y += ball.vy;

      if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.vx = -ball.vx * bounce;
      } else if (ball.x + ball.radius > windowWidth) {
        ball.x = windowWidth - ball.radius;
        ball.vx = -ball.vx * bounce;
      }

      if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy = -ball.vy * bounce;
      } else if (ball.y + ball.radius > windowHeight) {
        ball.y = windowHeight - ball.radius;
        ball.vy = -ball.vy * bounce;
        ball.element.style.opacity = parseFloat(ball.element.style.opacity || 1) - 0.01;
        if (parseFloat(ball.element.style.opacity) <= 0) {
          ball.element.style.display = 'none';
        }
      } else {
        if (parseFloat(ball.element.style.opacity || 1) > 0) allBallsFaded = false;
      }

      ball.vx *= friction;
      ball.vy *= friction;
      ball.element.style.transform = `translate3d(${ball.x - ball.radius}px, ${ball.y - ball.radius}px, 0)`;
    });

    if (allBallsFaded) {
      navigate('/info');
    } else {
      requestAnimationFrame(updatePhysics);
    }
  };

  const startPhysics = () => {
    const background = document.querySelector('.background');
    if (!background) return;
    physicsActive = true;
    background.classList.remove('active');
    initBalls();
    updatePhysics();
  };

  const showNextWord = (index = 0) => {
    const wordDisplay = document.querySelector('.word-display');
    const finalDisplay = document.querySelector('.final-display');
    if (!wordDisplay || !finalDisplay) return;

    if (index < words.length) {
      wordDisplay.textContent = words[index];
      wordDisplay.style.opacity = 1;

      let fadeOutTime, nextDelay;
      if (index < 4) {
        fadeOutTime = 1000;
        nextDelay = 500;
      } else if (index < 8) {
        fadeOutTime = 260;
        nextDelay = 380;
      } else {
        fadeOutTime = 100;
        nextDelay = 100;
      }

      setTimeout(() => {
        wordDisplay.style.opacity = 0;
        setTimeout(() => showNextWord(index + 1), nextDelay);
      }, fadeOutTime);
    } else {
      setTimeout(() => {
        wordDisplay.style.opacity = 0;
        finalDisplay.style.opacity = 1;
      }, 200);
    }
  };

  useEffect(() => {
    const finalDisplay = document.querySelector('.final-display');
    const background = document.querySelector('.background');

    if (!canvasRef.current || !finalDisplay || !background) return;

    const button = new LiquidButton({
      canvas: canvasRef.current,
      text: 'Begin Journey',
      width: 200,
      height: 50,
      margin: 50,
      padding: 17,
    });

    finalDisplay.style.opacity = 0;
    setTimeout(() => showNextWord(), 500);

    const handleMouseEnter = () => !physicsActive && background.classList.add('active');
    const handleMouseLeave = () => !physicsActive && background.classList.remove('active');

    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [navigate]);

  return (
    <div className="hero-page">
      <div className="background">
        {Array(49).fill().map((_, i) => <span key={i}></span>)}
      </div>
      <div className="word-display"></div>
      <div className="final-display">
        <div className="final-title">Fusion Fridge</div>
        <canvas ref={canvasRef} id="liquid-button-canvas"></canvas>
      </div>
    </div>
  );
};

export default HeroPage;

// ==========================================
// 1. ACCORDION TOGGLE FUNCTIONALITY
// ==========================================
function toggleAccordion(headerElement) {
    const parentItem = headerElement.parentElement;
    const isActive = parentItem.classList.contains('active');
    
    // Sirad-an ang tanang accordion items
    const allItems = document.querySelectorAll('.accordion-item');
    allItems.forEach(item => {
        item.classList.remove('active');
        const span = item.querySelector('.accordion-header span');
        if (span) span.textContent = '+';
    });
    
    // Kung wala pa na-open, ablihi kini
    if (!isActive) {
        parentItem.classList.add('active');
        const span = headerElement.querySelector('span');
        if (span) span.textContent = '−';
    }
}

// ==========================================
// 2. ADMIN PANEL TOGGLE & CMS CONTROL
// ==========================================
function toggleAdminPanel() {
    const panel = document.getElementById('adminPanel');
    if (panel) {
        panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
        panel.scrollIntoView({ behavior: 'smooth' });
    }
}

// Para ma-access ang admin panel pinaagi sa pag-click sa logo o sekreto nga shortcut kung kinahanglan, 
// o pwede nimo butangan og listener kung gkinahanglan.

function saveContent() {
    // Kuhaon ang values gikan sa Admin inputs
    const newTag = document.getElementById('inputTag').value;
    const newTitle = document.getElementById('inputTitle').value;
    const newDesc = document.getElementById('inputDesc').value;
    
    // I-update dayon ang Live Frontend elements kung naa
    if (document.getElementById('displayTag')) document.getElementById('displayTag').textContent = newTag;
    if (document.getElementById('displayTitle')) document.getElementById('displayTitle').textContent = newTitle;
    if (document.getElementById('displayDesc')) document.getElementById('displayDesc').textContent = newDesc;
    
    // Optional: Image upload handler preview
    const imageInput = document.getElementById('imageInput');
    if (imageInput && imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const displayImg = document.getElementById('displayImg');
            if (displayImg) displayImg.src = e.target.result;
        }
        reader.readAsDataURL(imageInput.files[0]);
    }
    
    alert('Na-save na ug na-update ang live frontend, boss!');
}

// ==========================================
// 3. FORM SUBMISSION HANDLER
// ==========================================
function submitClientInquiry(event) {
    // Mahimo nimong pasagdan ang default Formspree action o magdugang og custom notification
    // Ang Formspree na ang bahala sa pagpadaladirekta sa imong email.
}

const canvas = document.getElementById('liquid-glass-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const glassBalls = [];
const ballCount = 14;

// Lain-laing nindot ug harianong kulay para sa 1000D realistic liquid glass effect
const colorPalettes = [
    { tint: '255, 215, 0', rim: '255, 240, 150' },   // Pure Gold
    { tint: '255, 140, 0', rim: '255, 200, 100' },   // Amber Orange
    { tint: '230, 180, 50', rim: '255, 255, 200' },  // Platinum Gold
    { tint: '255, 100, 0', rim: '255, 170, 100' },   // Deep Copper
    { tint: '255, 225, 100', rim: '255, 255, 255' }  // Crystal Shimmer
];

for (let i = 0; i < ballCount; i++) {
    let palette = colorPalettes[i % colorPalettes.length];
    glassBalls.push({
        x: Math.random() * (canvas.width - 150) + 75,
        y: Math.random() * (canvas.height - 150) + 75,
        radius: Math.random() * 55 + 35, // Lain-laing gidak-on para sa realistic mass physics
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        mass: 0, // I-compute sunod base sa radius
        palette: palette,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.04
    });
    glassBalls[i].mass = glassBalls[i].radius; // Mas dako nga bola, masbug-at
}

function animateLiquidGlass() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. ADVANCED ELASTIC PHYSICS COLLISION (True Bounce & Push-apart)
    for (let i = 0; i < glassBalls.length; i++) {
        for (let j = i + 1; j < glassBalls.length; j++) {
            let b1 = glassBalls[i];
            let b2 = glassBalls[j];

            let dx = b2.x - b1.x;
            let dy = b2.y - b1.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let minDist = b1.radius + b2.radius;

            if (distance < minDist) {
                // Normal vector
                let nx = dx / distance;
                let ny = dy / distance;

                // Relative velocity
                let rvx = b2.vx - b1.vx;
                let rvy = b2.vy - b1.vy;

                // Velocity along normal
                let velAlongNormal = rvx * nx + rvy * ny;

                // Ayaw pag-apply kung nagpalayo na sila
                if (velAlongNormal < 0) {
                    let restitution = 0.85; // Elasticity (pagka-bounce)
                    let impulseScalar = -(1 + restitution) * velAlongNormal;
                    impulseScalar /= (1 / b1.mass + 1 / b2.mass);

                    // Apply impulse
                    b1.vx -= (impulseScalar / b1.mass) * nx;
                    b1.vy -= (impulseScalar / b1.mass) * ny;
                    b2.vx += (impulseScalar / b2.mass) * nx;
                    b2.vy += (impulseScalar / b2.mass) * ny;
                }

                // Positional correction aron dili gyud magdikit o mag-stuck
                let percent = 0.5; 
                let correction = (minDist - distance) / (1 / b1.mass + 1 / b2.mass) * percent;
                b1.x -= (1 / b1.mass) * correction * nx;
                b1.y -= (1 / b1.mass) * correction * ny;
                b2.x += (1 / b2.mass) * correction * nx;
                b2.y += (1 / b2.mass) * correction * ny;
            }
        }
    }

    // 2. UPDATE & RENDER 1000D REALISTIC LIQUID GLASS SPHERES
    glassBalls.forEach(ball => {
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Wall Collision Bounce (Screen Edges)
        if (ball.x - ball.radius < 0) { ball.x = ball.radius; ball.vx *= -1; }
        if (ball.x + ball.radius > canvas.width) { ball.x = canvas.width - ball.radius; ball.vx *= -1; }
        if (ball.y - ball.radius < 0) { ball.y = ball.radius; ball.vy *= -1; }
        if (ball.y + ball.radius > canvas.height) { ball.y = canvas.height - ball.radius; ball.vy *= -1; }

        ball.pulse += ball.pulseSpeed;
        ball.angle += ball.spin;
        let currentRadius = ball.radius + Math.sin(ball.pulse) * 4; // Organic liquid breathing

        ctx.save();
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, currentRadius, 0, Math.PI * 2);

        // 1000D Dynamic Refraction Offset (Lahi-lahi ang lihok sa liquid sa sulod)
        let refX = Math.cos(ball.angle) * (currentRadius * 0.35);
        let refY = Math.sin(ball.angle) * (currentRadius * 0.35);

        // Ultra-Realistic Glass Radial Gradient
        let gradient = ctx.createRadialGradient(
            ball.x - refX, ball.y - refY, currentRadius * 0.05,
            ball.x, ball.y, currentRadius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)'); // Core highlight
        gradient.addColorStop(0.3, `rgba(${ball.palette.tint}, 0.55)`);
        gradient.addColorStop(0.75, `rgba(${ball.palette.tint}, 0.2)`);
        gradient.addColorStop(1, `rgba(${ball.palette.rim}, 0.75)`); // Glass rim density

        ctx.fillStyle = gradient;
        ctx.fill();

        // High-End 3D Glass Outer Rim Glow
        ctx.strokeStyle = `rgba(${ball.palette.rim}, 0.9)`;
        ctx.lineWidth = 2.2;
        ctx.shadowBlur = 28;
        ctx.shadowColor = `rgb(${ball.palette.tint})`;
        ctx.stroke();

        // Secondary Specular Gloss Reflection (Para sa ultra-realistic 3D look)
        ctx.beginPath();
        ctx.arc(ball.x - refX * 0.7, ball.y - refY * 0.7, currentRadius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fill();

        // Tertiary Micro-Refraction Spot
        ctx.beginPath();
        ctx.arc(ball.x + refX * 0.5, ball.y + refY * 0.5, currentRadius * 0.08, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();

        ctx.restore();
    });

    requestAnimationFrame(animateLiquidGlass);
}

animateLiquidGlass();
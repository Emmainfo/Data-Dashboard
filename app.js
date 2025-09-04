// Demo data and rendering for the dashboard (vanilla JS + SVG)
const salesByMonth = [6500, 8200, 12500, 11300, 15800, 17200, 14600, 18900, 17600, 19400, 20100, 21800];
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const categoryShares = [
  {label:'Software', value:42},
  {label:'Services', value:33},
  {label:'Hardware', value:20},
  {label:'Other', value:5}
];

function formatCurrency(n){
  return '$' + n.toLocaleString();
}

// small animator for counters
function animateCount(el, target, opts={}){
  const dur = opts.duration || 800;
  const start = 0;
  const s = performance.now();
  function step(t){
    const p = Math.min(1,(t-s)/dur);
    const v = Math.floor(start + (target - start)*p);
    el.textContent = opts.percent ? v + '%' : formatCurrency(v);
    if(p<1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// metrics
const total = salesByMonth.reduce((a,b)=>a+b,0);
const growth = Math.round(((salesByMonth[salesByMonth.length-1] - salesByMonth[0]) / salesByMonth[0]) * 100);
const newCustomers = 215;

document.getElementById('year').textContent = new Date().getFullYear();
animateCount(document.getElementById('totalSales'), total);
animateCount(document.getElementById('growthValue'), growth, {percent:true});
// new customers simple number animation
(function(){ const el = document.getElementById('newCustomers'); let s=0; const dur=800; const start=performance.now(); function step(t){ const p=Math.min(1,(t-start)/dur); el.textContent = Math.floor(newCustomers * p); if(p<1) requestAnimationFrame(step);} requestAnimationFrame(step); })();

// sparkline
(function renderSpark(){
  const svg = document.getElementById('sparkline');
  const w=100,h=36,p=4;
  const max = Math.max(...salesByMonth), min = Math.min(...salesByMonth);
  const pts = salesByMonth.map((v,i)=>{
    const x = p + i * ((w - 2*p) / (salesByMonth.length - 1));
    const y = h - p - ((v - min) / (max - min)) * (h - 2*p);
    return x+','+y;
  }).join(' ');
  svg.innerHTML = `<polyline points="${pts}" fill="none" stroke="var(--primary)" stroke-width="2" />`;
})();

// bar chart
(function renderBars(){
  const svg = document.getElementById('barChart');
  const W = 640, H = 260, pad = {t:10,r:16,b:28,l:40};
  const chartW = W - pad.l - pad.r;
  const chartH = H - pad.t - pad.b;
  const max = Math.max(...salesByMonth) * 1.1;

  // y grid
  const steps = 4;
  for(let i=0;i<=steps;i++){
    const y = pad.t + chartH - (chartH/steps)*i;
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', pad.l);
    line.setAttribute('x2', pad.l+chartW);
    line.setAttribute('y1', y);
    line.setAttribute('y2', y);
    line.setAttribute('stroke', '#e6eefb');
    svg.appendChild(line);

    const text = document.createElementNS('http://www.w3.org/2000/svg','text');
    text.setAttribute('x', 6);
    text.setAttribute('y', y+4);
    text.setAttribute('fill', '#64748b');
    text.setAttribute('font-size', '12');
    text.textContent = '$' + Math.round((max/steps)*i/1000)*10 + 'k';
    svg.appendChild(text);
  }

  const group = document.createElementNS('http://www.w3.org/2000/svg','g');
  const barW = chartW / salesByMonth.length * 0.6;
  salesByMonth.forEach((v,i)=>{
    const x = pad.l + i * (chartW / salesByMonth.length) + (chartW / salesByMonth.length - barW)/2;
    const h = (v / max) * chartH;
    const y = pad.t + chartH - h;
    const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', pad.t + chartH); // start at bottom for animation
    rect.setAttribute('width', barW);
    rect.setAttribute('height', 0);
    rect.setAttribute('rx', 6);
    rect.setAttribute('fill', 'url(#barGrad)');
    group.appendChild(rect);

    const label = document.createElementNS('http://www.w3.org/2000/svg','text');
    label.setAttribute('x', x + barW/2);
    label.setAttribute('y', H - 6);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('fill', '#64748b');
    label.setAttribute('font-size', '12');
    label.textContent = months[i];
    svg.appendChild(label);

    // animate
    setTimeout(()=> {
      rect.setAttribute('height', h);
      rect.setAttribute('y', y);
    }, i*60);
  });
  svg.appendChild(group);

  const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
  defs.innerHTML = `<linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="var(--primary)" stop-opacity=".95" />
      <stop offset="100%" stop-color="var(--primary)" stop-opacity=".6" />
    </linearGradient>`;
  svg.appendChild(defs);
})();

// pie chart
(function renderPie(){
  const svg = document.getElementById('pieChart');
  const legend = document.getElementById('pieLegend');
  const R = 100;
  const cx = 130, cy = 130;
  const total = categoryShares.reduce((a,c)=>a+c.value,0);
  let start = -Math.PI/2;
  const colors = ['#2563eb','#60a5fa','#93c5fd','#bfdbfe'];

  categoryShares.forEach((cat,i)=>{
    const angle = (cat.value/total) * Math.PI * 2;
    const end = start + angle;
    const x1 = cx + R * Math.cos(start);
    const y1 = cy + R * Math.sin(start);
    const x2 = cx + R * Math.cos(end);
    const y2 = cy + R * Math.sin(end);
    const large = angle > Math.PI ? 1 : 0;
    const pathData = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    const path = document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d', pathData);
    path.setAttribute('fill', colors[i % colors.length]);
    path.setAttribute('opacity', '0');
    svg.appendChild(path);
    setTimeout(()=> path.setAttribute('opacity','1'), i*150);

    const item = document.createElement('div');
    item.innerHTML = `<span class="dot" style="background:${colors[i % colors.length]}"></span> ${cat.label} — ${cat.value}%`;
    legend.appendChild(item);

    start = end;
  });

  const hole = document.createElementNS('http://www.w3.org/2000/svg','circle');
  hole.setAttribute('cx', cx);
  hole.setAttribute('cy', cy);
  hole.setAttribute('r', 58);
  hole.setAttribute('fill', '#fff');
  svg.appendChild(hole);

  const caption = document.createElementNS('http://www.w3.org/2000/svg','text');
  caption.setAttribute('x', cx);
  caption.setAttribute('y', cy+4);
  caption.setAttribute('text-anchor', 'middle');
  caption.setAttribute('font-size', '14');
  caption.setAttribute('fill', '#334155');
  caption.textContent = 'Categories';
  svg.appendChild(caption);
})();

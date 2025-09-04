// Demo JS to populate the prototype with interactive-ish content

const reps = [
  {name: 'Chinedu Okafor', sales: 3400000, deals: 12, conv: 34},
  {name: 'Amaka Umeh', sales: 2900000, deals: 10, conv: 30},
  {name: 'Blandeau Rhedes', sales: 3600000, deals: 13, conv: 36},
  {name: 'Femi Ade', sales: 2100000, deals: 8, conv: 22},
  {name: 'Ngozi Chukwu', sales: 1800000, deals: 6, conv: 18},
  {name: 'Aisha Bello', sales: 1500000, deals: 5, conv: 15}
];

const alerts = [
  {text: 'Upcoming Target Deadline — Sep 15', icon: '🔔'},
  {text: 'Low Performer Alert — Rep #17 under 5% target', icon: '⚠️'},
  {text: 'Manager Notes — 3 pending reviews', icon: '📝'}
];

function formatNaira(n){
  return '₦' + (n).toLocaleString();
}

// Populate top meta
const totalSales = reps.reduce((s,r)=>s+r.sales,0);
const avgDeal = Math.round(totalSales / reps.reduce((s,r)=>s+r.deals,0));
document.getElementById('totalSales').textContent = formatNaira(totalSales);
document.getElementById('avgDeal').textContent = formatNaira(avgDeal);
const top = reps.reduce((a,b)=> a.sales > b.sales ? a : b);
document.getElementById('topPerf').textContent = top.name;

// Populate table
const tbody = document.querySelector('#repTable tbody');
reps.sort((a,b)=>b.sales - a.sales);
reps.forEach((r,i)=>{
  const tr = document.createElement('tr');
  tr.innerHTML = `<td>${i+1}</td>
                  <td>${r.name}</td>
                  <td>${formatNaira(r.sales)}</td>
                  <td>${r.deals}</td>
                  <td>${r.conv}%</td>`;
  tbody.appendChild(tr);
});

// Populate alerts
const alertsList = document.getElementById('alertsList');
alerts.forEach(a=>{
  const li = document.createElement('li');
  li.textContent = a.icon + ' ' + a.text;
  alertsList.appendChild(li);
});

// Simple bar chart (Sales by Rep)
(function drawBarChart(){
  const svg = document.querySelector('#barChart svg');
  const W = 600, H = 200, pad = {l:40,b:24,t:10,r:10};
  const chartW = W - pad.l - pad.r;
  const chartH = H - pad.t - pad.b;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const max = Math.max(...reps.map(r=>r.sales)) * 1.1;
  const barW = chartW / reps.length * 0.6;
  reps.forEach((r,i)=>{
    const x = pad.l + i * (chartW / reps.length) + (chartW / reps.length - barW)/2;
    const h = (r.sales / max) * chartH;
    const y = pad.t + chartH - h;
    const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', barW);
    rect.setAttribute('height', h);
    rect.setAttribute('rx', 6);
    rect.setAttribute('fill', '#2563eb');
    svg.appendChild(rect);

    const label = document.createElementNS('http://www.w3.org/2000/svg','text');
    label.setAttribute('x', x + barW/2);
    label.setAttribute('y', H - 6);
    label.setAttribute('text-anchor','middle');
    label.setAttribute('font-size','11');
    label.setAttribute('fill','#64748b');
    label.textContent = r.name.split(' ')[0];
    svg.appendChild(label);
  });
})();

// Trend sparkline demo
(function drawTrend(){
  const svg = document.querySelector('#trendChart svg');
  const W = 600, H = 200, pad = {l:20,t:10,b:24,r:10};
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const weekly = [120000, 150000, 180000, 200000, 170000, 210000, 230000, 250000];
  const max = Math.max(...weekly);
  const pts = weekly.map((v,i)=>{
    const x = pad.l + i * ((W - pad.l - pad.r) / (weekly.length - 1));
    const y = pad.t + (1 - v/max) * (H - pad.t - pad.b);
    return `${x},${y}`;
  }).join(' ');
  const poly = document.createElementNS('http://www.w3.org/2000/svg','polyline');
  poly.setAttribute('points', pts);
  poly.setAttribute('fill','none');
  poly.setAttribute('stroke','#16a34a');
  poly.setAttribute('stroke-width','2');
  svg.appendChild(poly);
})();

// Pie chart for lead sources
(function drawPie(){
  const svg = document.querySelector('#pieChart svg');
  svg.setAttribute('viewBox','0 0 260 260');
  const data = [{label:'Referrals', v:45},{label:'Cold Outreach', v:25},{label:'Events', v:20},{label:'Ads', v:10}];
  const total = data.reduce((s,d)=>s+d.v,0);
  const R = 90, cx=130, cy=130;
  let start = -Math.PI/2;
  const colors = ['#2563eb','#60a5fa','#93c5fd','#bfdbfe'];
  const legend = document.getElementById('pieLegend');
  data.forEach((d,i)=>{
    const angle = (d.v/total)*Math.PI*2;
    const end = start + angle;
    const x1 = cx + R*Math.cos(start), y1 = cy + R*Math.sin(start);
    const x2 = cx + R*Math.cos(end), y2 = cy + R*Math.sin(end);
    const large = angle > Math.PI ? 1 : 0;
    const pathData = [`M ${cx} ${cy}`, `L ${x1} ${y1}`, `A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`, 'Z'].join(' ');
    const path = document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d', pathData);
    path.setAttribute('fill', colors[i]);
    svg.appendChild(path);

    const item = document.createElement('div');
    item.className = 'item';
    item.innerHTML = `<span style="width:12px;height:12px;background:${colors[i]};display:inline-block;border-radius:50%"></span><span style="margin-left:6px">${d.label} — ${d.v}%</span>`;
    legend.appendChild(item);

    start = end;
  });
})();

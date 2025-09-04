
// Sample JavaScript to add interactivity

document.addEventListener('DOMContentLoaded', function () {
  const reportBtn = document.querySelector('button:nth-child(1)');
  const mapBtn = document.querySelector('button:nth-child(2)');

  reportBtn.addEventListener('click', () => {
    alert('Redirecting to detailed report...');
  });

  mapBtn.addEventListener('click', () => {
    alert('Loading map view of Abuja districts...');
  });
});

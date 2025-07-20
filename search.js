// JavaScript for Search Visualizer with elegant success animation and toast notification

// Helper: create an array item DOM element
function createArrayItem(value) {
  const div = document.createElement('div');
  div.classList.add('array-item');
  div.textContent = value;
  div.dataset.value = value;
  return div;
}

// Enable/disable form elements
function setFormEnabled(form, enabled) {
  [...form.elements].forEach(el => {
    el.disabled = !enabled;
  });
  form.querySelector('button[type="submit"]').textContent = enabled ? 'Start Search' : 'Searching...';
}

// Pause helper - waits ms milliseconds asynchronously
function pause(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Toast container management
const toastContainerId = 'toast-container';

function createToastContainer() {
  let container = document.getElementById(toastContainerId);
  if (!container) {
    container = document.createElement('div');
    container.id = toastContainerId;
    container.style.position = 'fixed';
    container.style.top = '2.5rem';
    container.style.left = '50%';
    container.style.transform = 'translateX(-50%)';
    container.style.zIndex = '1600';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);
  }
  return container;
}

function showToast(message, duration = 3000) {
  const container = createToastContainer();
  const toast = document.createElement('div');
  // Styling the toast for minimal elegant design
  toast.style.backgroundColor = 'white';
  toast.style.color = '#374151'; // gray-700
  toast.style.padding = '0.75rem 1.5rem';
  toast.style.marginTop = '0.5rem';
  toast.style.borderRadius = '0.75rem';
  toast.style.boxShadow = '0 4px 10px rgba(0,0,0,0.12)';
  toast.style.fontWeight = '600';
  toast.style.fontSize = '1rem';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  toast.style.pointerEvents = 'auto';
  toast.textContent = message;

  container.appendChild(toast);

  // Trigger fade-in and slight slide-down
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  // Fade out and remove after duration
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    toast.addEventListener('transitionend', () => {
      toast.remove();
      if (container.children.length === 0) {
        container.remove();
      }
    });
  }, duration);
}

// Confetti animation setup
const confettiContainerId = 'confetti-container';

function createConfettiContainer() {
  let container = document.getElementById(confettiContainerId);
  if (!container) {
    container = document.createElement('div');
    container.id = confettiContainerId;
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '1500';
    container.style.overflow = 'visible';
    container.style.userSelect = 'none';
    document.body.appendChild(container);
  }
  return container;
}

function launchConfetti(sourceX, sourceY, duration = 3000) {
  const container = createConfettiContainer();
  const confettiCount = 40;
  const colors = ['#e63946', '#f1faee', '#a8dadc', '#457b9d', '#ffb703'];

  // Clear any old confetti
  container.innerHTML = '';

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'absolute';
    confetti.style.width = `${randomRange(6, 10)}px`;
    confetti.style.height = `${randomRange(8, 14)}px`;
    confetti.style.borderRadius = `${randomRange(2,5)}px`;
    confetti.style.backgroundColor = colors[i % colors.length];
    confetti.style.left = `${sourceX}px`;
    confetti.style.top = `${sourceY}px`;
    confetti.style.opacity = '1';
    confetti.style.transform = `rotate(${randomRange(0, 360)}deg) translateY(0)`;
    confetti.style.willChange = 'transform, opacity';

    container.appendChild(confetti);

    animateConfetti(confetti);
  }

  setTimeout(() => {
    container.innerHTML = '';
  }, duration);
}

function animateConfetti(confetti) {
  const angle = Math.random() * Math.PI * 2;
  const distance = randomRange(80, 140);
  const duration = randomRange(1800, 2800);
  const startTime = performance.now();

  function frame(time) {
    const elapsed = time - startTime;
    const progress = elapsed / duration;
    if (progress > 1) {
      confetti.style.opacity = '0';
      return;
    }
    // Move confetti outwards in a random direction with slight rotation and fading opacity
    const x = Math.cos(angle) * distance * progress;
    const y = Math.sin(angle) * distance * progress + progress * progress * 50; // gravity effect
    const rotate = progress * 720;
    confetti.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg)`;
    confetti.style.opacity = `${1 - progress}`;
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

// Utility random between min and max (inclusive)
function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

// Celebrate successful find: animate confetti on found element + show toast
function celebrateSuccessOnElement(el) {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const sourceX = rect.left + rect.width / 2;
  const sourceY = rect.top + rect.height / 2;

  launchConfetti(sourceX, sourceY);
  showToast('🎉 Congratulations! Value found in the array! 🎈');
}

// Linear Search animation
async function linearSearch(arr, target, container, descEl, form) {
  setFormEnabled(form, false);
  container.querySelectorAll('.array-item').forEach(item => {
    item.classList.remove('current', 'found', 'checked');
  });
  descEl.textContent = '';
  for (let i = 0; i < arr.length; i++) {
    const item = container.children[i];
    item.classList.add('current');
    descEl.textContent = `Checking index ${i}, value ${arr[i]}...`;
    await pause(600);
    if (arr[i] === target) {
      item.classList.replace('current', 'found');
      descEl.textContent = `Value ${target} found at index ${i}.`;
      celebrateSuccessOnElement(item);
      setFormEnabled(form, true);
      return i;
    } else {
      item.classList.replace('current', 'checked');
    }
  }
  descEl.textContent = `Value ${target} not found in the array.`;
  setFormEnabled(form, true);
  return -1;
}

// Binary Search animation
async function binarySearch(arr, target, container, descEl, form) {
  setFormEnabled(form, false);
  container.querySelectorAll('.array-item').forEach(item => {
    item.classList.remove('current', 'found', 'checked');
  });
  descEl.textContent = '';
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    for (let i = 0; i < arr.length; i++) {
      const item = container.children[i];
      if (i < left || i > right) {
        item.classList.add('checked');
        item.classList.remove('current', 'found');
      } else {
        item.classList.remove('checked');
      }
    }
    const mid = Math.floor((left + right) / 2);
    const midItem = container.children[mid];
    midItem.classList.add('current');
    descEl.textContent = `Checking middle index ${mid}, value ${arr[mid]}...`;
    await pause(800);
    if (arr[mid] === target) {
      midItem.classList.replace('current', 'found');
      descEl.textContent = `Value ${target} found at index ${mid}.`;
      celebrateSuccessOnElement(midItem);
      setFormEnabled(form, true);
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
    midItem.classList.remove('current');
  }
  container.querySelectorAll('.array-item').forEach(item => {
    item.classList.add('checked');
    item.classList.remove('current', 'found');
  });
  descEl.textContent = `Value ${target} not found in the array.`;
  setFormEnabled(form, true);
  return -1;
}

// Initialization on DOM load
document.addEventListener('DOMContentLoaded', () => {
  const linearArrayData = [15, 3, 27, 12, 7, 20, 5, 11];
  const linearContainer = document.getElementById('linear-array');
  const linearDesc = document.getElementById('linear-desc');
  const linearForm = document.getElementById('linear-form');

  linearArrayData.forEach(v => linearContainer.appendChild(createArrayItem(v)));

  linearForm.addEventListener('submit', async e => {
    e.preventDefault();
    const val = Number(linearForm.querySelector('#linear-target').value);
    if (Number.isNaN(val)) return;
    await linearSearch(linearArrayData, val, linearContainer, linearDesc, linearForm);
  });

  const binaryArrayData = [1, 4, 6, 8, 10, 13, 17, 21];
  const binaryContainer = document.getElementById('binary-array');
  const binaryDesc = document.getElementById('binary-desc');
  const binaryForm = document.getElementById('binary-form');

  binaryArrayData.forEach(v => binaryContainer.appendChild(createArrayItem(v)));

  binaryForm.addEventListener('submit', async e => {
    e.preventDefault();
    const val = Number(binaryForm.querySelector('#binary-target').value);
    if (Number.isNaN(val)) return;
    await binarySearch(binaryArrayData, val, binaryContainer, binaryDesc, binaryForm);
  });
});


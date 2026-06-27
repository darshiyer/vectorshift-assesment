// ripple.js
// A tiny, dependency-free ripple effect: on mousedown, drop a growing circle at
// the click point and let it fade out. Attach via onMouseDown={spawnRipple}.

export const spawnRipple = (event) => {
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;

  const ripple = document.createElement('span');
  ripple.className = 'btn__ripple';
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

  button.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
};

const gameForm = document.getElementById('game-form');
const gameCanvas = document.getElementById('game-canvas');
const ctx = gameCanvas.getContext('2d');
const loadingSpinner = document.getElementById('loading-spinner');

gameForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const prompt = document.getElementById('prompt').value;

  try {
    loadingSpinner.style.display = 'block';

    const response = await fetch('/generate-game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (response.ok) {
      const { code } = await response.json();
      eval(code);
    } else {
      console.error('Failed to generate game');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    loadingSpinner.style.display = 'none';
  }
});

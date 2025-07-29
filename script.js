let display = document.getElementById('display');
let historyPanel = document.getElementById('history-panel');
let historyList = document.getElementById('history-list');
let lastOperation = null;
let historyInterval = null;
let showAllHistory = false;

function appendValue(val) {
  // Count digits in the current display (ignore non-digits)
  const digits = display.textContent.replace(/[^0-9]/g, '');
  if (digits.length >= 10 && /[0-9]/.test(val)) {
    return; // Prevent adding more than 10 digits
  }
  display.textContent += val;
}

function clearDisplay() {
  display.textContent = '';
}

function deleteLast() {
  display.textContent = display.textContent.slice(0, -1);
}

function calculate() {
  try {
    let expression = display.textContent;
    let result = eval(expression.replace('÷', '/').replace('×', '*'));
    // Limit to 5 decimal places if result is a float
    if (typeof result === 'number' && !Number.isInteger(result)) {
      result = parseFloat(result.toFixed(5));
    }
    display.textContent = result;

    // Only save to DB if not an immediate duplicate
    if (!lastOperation || lastOperation.expression !== expression || lastOperation.result !== result.toString()) {
      fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression, result: result.toString() })
      });
      lastOperation = { expression, result: result.toString() };
    }

  } catch {
    display.textContent = 'Error';
  }
}

function toggleHistory() {
  historyPanel.classList.toggle('visible');
  if (historyPanel.classList.contains('visible')) {
    showAllHistory = false; // Default to last 5
    fetchHistory();
    historyInterval = setInterval(() => {
      if (showAllHistory) {
        loadAllHistory();
      } else {
        fetchHistory();
      }
    }, 1000);
  } else {
    clearInterval(historyInterval);
  }
}

function fetchHistory() {
  fetch(`/api/history`)
    .then(res => res.json())
    .then(data => {
      historyList.innerHTML = '';
      data.forEach(item => {
        let li = document.createElement('li');
        li.textContent = `${item.expression} = ${item.result}`;
        historyList.appendChild(li);
      });
    });
}

function loadAllHistory() {
  showAllHistory = true;
  fetch(`/api/history?all=1`)
    .then(res => {
      if (!res.ok) throw new Error('Failed to load history');
      return res.json();
    })
    .then(data => {
      historyList.innerHTML = '';
      data.forEach(item => {
        let li = document.createElement('li');
        li.textContent = `${item.expression} = ${item.result}`;
        historyList.appendChild(li);
      });
    })
    .catch(err => {
      alert('Could not load history. Please check your server or database.');
    });
}

function clearHistory() {
  fetch('/api/history', { method: 'DELETE' })
    .then(res => {
      if (!res.ok) throw new Error('Failed to clear history');
      historyList.innerHTML = '';
    })
    .catch(err => {
      alert('Could not clear history. Please check your server or database.');
    });
}

function toggleMode() {
  document.body.classList.toggle('light');
  document.body.classList.toggle('dark');
}

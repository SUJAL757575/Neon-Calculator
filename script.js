(() => {
  const exprEl = document.getElementById('expression');
  const resEl = document.getElementById('result');
  const keys = document.querySelector('.keys');
  const histPanel = document.getElementById('historyPanel');
  const histToggle = document.getElementById('historyToggle');
  const histList = document.getElementById('historyList');

  let expression = '';
  let memory = 0;
  let history = [];

  const updateDisplay = () => {
    exprEl.textContent = expression || '0';
    resEl.textContent = formatResult(safeEval(expression));
  };

  const formatResult = v => {
    if (v === null || isNaN(v)) return '0';
    if (!isFinite(v)) return 'Err';
    return Math.round(+v * 1000000) / 1000000;
  };

  const safeEval = expr => {
    if (!expr) return 0;
    if (/[^0-9+\-*/().% ]/.test(expr)) return NaN;
    try {
      const conv = expr.replace(/(\d+(\.\d+)?)%/g, '($1/100)');
      return Function('return ' + conv)();
    } catch {
      return NaN;
    }
  };

  const addHistory = (exp, res) => {
    history.unshift(`${exp} = ${res}`);
    if (history.length > 10) history.pop();
    renderHistory();
  };

  const renderHistory = () => {
    histList.innerHTML = history.map(h => `<li>${h}</li>`).join('');
  };

  keys.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const val = btn.dataset.value;
    const action = btn.dataset.action;

    if (action) {
      if (action === 'clear') expression = '';
      else if (action === 'delete') expression = expression.slice(0, -1);
      else if (action === 'equals') {
        const res = safeEval(expression);
        if (!isNaN(res)) {
          addHistory(expression, res);
          expression = String(res);
        } else resEl.textContent = 'Err';
      } else if (action === 'mc') memory = 0;
      else if (action === 'mr') expression += memory;
      else if (action === 'mplus') memory += safeEval(expression) || 0;
      else if (action === 'mminus') memory -= safeEval(expression) || 0;
      updateDisplay();
      return;
    }

    if (val) {
      const last = expression.slice(-1);
      const ops = ['+', '-', '*', '/'];
      if (ops.includes(val) && ops.includes(last)) return;
      if (val === '.' && last === '.') return;
      expression += val;
      updateDisplay();
    }
  });

  histToggle.addEventListener('click', () => {
    histPanel.classList.toggle('active');
  });

  window.addEventListener('keydown', e => {
    const k = e.key;
    const ops = ['+', '-', '*', '/'];
    if (k >= '0' && k <= '9') expression += k;
    else if (ops.includes(k)) {
      const last = expression.slice(-1);
      if (!ops.includes(last)) expression += k;
    }
    else if (k === '.') {
      const segment = expression.split(/[\+\-\*\/]/).pop();
      if (!segment.includes('.')) expression += '.';
    }
    else if (k === '%') expression += '%';
    else if (k === 'Enter') {
      const res = safeEval(expression);
      if (!isNaN(res)) {
        addHistory(expression, res);
        expression = String(res);
      }
    }
    else if (k === 'Backspace') expression = expression.slice(0, -1);
    else if (k === 'Escape') expression = '';
    updateDisplay();
  });

  updateDisplay();
})();

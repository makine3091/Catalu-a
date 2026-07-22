// Conversor de Unidades de Cocina
// Todas las unidades de volumen y peso se normalizan a una unidad base
// (ml para volumen, gramos para peso) y luego se convierten a la unidad destino.

const DATA = {
  volumen: {
    baseUnit: 'ml',
    units: {
      cucharadita: { label: 'Cucharadita', factor: 5 },
      cucharada:   { label: 'Cucharada',   factor: 15 },
      taza:        { label: 'Taza',        factor: 240 },
      ml:          { label: 'Mililitro',   factor: 1 },
      litro:       { label: 'Litro',       factor: 1000 },
      onzaLiquida: { label: 'Onza líquida (fl oz)', factor: 29.5735 },
      pinta:       { label: 'Pinta',       factor: 473.176 },
    },
    cheatsheet: [
      ['1 taza', '240 ml'],
      ['1 taza', '16 cucharadas'],
      ['1 cucharada', '3 cucharaditas'],
      ['1 cucharada', '15 ml'],
      ['1 litro', '4.2 tazas'],
      ['1 pinta', '2 tazas'],
    ],
  },
  peso: {
    baseUnit: 'g',
    units: {
      gramo:      { label: 'Gramo',      factor: 1 },
      kilogramo:  { label: 'Kilogramo',  factor: 1000 },
      onza:       { label: 'Onza (oz)',  factor: 28.3495 },
      libra:      { label: 'Libra (lb)', factor: 453.592 },
    },
    cheatsheet: [
      ['1 libra', '453.6 g'],
      ['1 onza', '28.3 g'],
      ['1 kg', '2.2 libras'],
      ['4 onzas', '113 g'],
      ['1/2 libra', '227 g'],
      ['1 kg', '1000 g'],
    ],
  },
  temperatura: {
    special: true,
    units: {
      celsius:    { label: 'Celsius (°C)' },
      fahrenheit: { label: 'Fahrenheit (°F)' },
      gasMark:    { label: 'Gas Mark' },
    },
    cheatsheet: [
      ['180 °C', '350 °F · Gas 4'],
      ['200 °C', '400 °F · Gas 6'],
      ['220 °C', '425 °F · Gas 7'],
      ['160 °C', '325 °F · Gas 3'],
      ['150 °C', '300 °F · Gas 2'],
      ['240 °C', '475 °F · Gas 9'],
    ],
  },
};

const state = {
  category: 'volumen',
  from: 'taza',
  to: 'ml',
};

const el = {
  tabs: document.querySelectorAll('.tab'),
  input: document.getElementById('input-value'),
  fromSelect: document.getElementById('from-unit'),
  toSelect: document.getElementById('to-unit'),
  swapBtn: document.getElementById('swap-btn'),
  readoutValue: document.getElementById('readout-value'),
  readoutUnit: document.getElementById('readout-unit'),
  cheatsheet: document.getElementById('cheatsheet-table'),
  year: document.getElementById('year'),
};

function populateSelects(category){
  const units = DATA[category].units;
  const keys = Object.keys(units);

  el.fromSelect.innerHTML = keys
    .map(key => `<option value="${key}">${units[key].label}</option>`)
    .join('');
  el.toSelect.innerHTML = el.fromSelect.innerHTML;

  const defaults = {
    volumen: ['taza', 'ml'],
    peso: ['libra', 'gramo'],
    temperatura: ['celsius', 'fahrenheit'],
  };
  const [fromDefault, toDefault] = defaults[category];
  el.fromSelect.value = keys.includes(fromDefault) ? fromDefault : keys[0];
  el.toSelect.value = keys.includes(toDefault) ? toDefault : keys[1] || keys[0];

  state.from = el.fromSelect.value;
  state.to = el.toSelect.value;
}

function convertTemperature(value, from, to){
  let celsius;
  if (from === 'celsius') celsius = value;
  else if (from === 'fahrenheit') celsius = (value - 32) * (5 / 9);
  else if (from === 'gasMark') celsius = value * 14 + 121;

  if (to === 'celsius') return celsius;
  if (to === 'fahrenheit') return celsius * (9 / 5) + 32;
  if (to === 'gasMark') return (celsius - 121) / 14;
}

function convert(){
  const value = parseFloat(el.input.value);
  const category = state.category;

  if (Number.isNaN(value)){
    el.readoutValue.textContent = '—';
    return;
  }

  let result;
  let unitLabel;

  if (DATA[category].special){
    result = convertTemperature(value, state.from, state.to);
    unitLabel = state.to === 'celsius' ? '°C' : state.to === 'fahrenheit' ? '°F' : 'gas';
  } else {
    const units = DATA[category].units;
    const baseValue = value * units[state.from].factor;
    result = baseValue / units[state.to].factor;
    unitLabel = shortUnitLabel(category, state.to);
  }

  el.readoutValue.textContent = formatNumber(result);
  el.readoutUnit.textContent = unitLabel;
}

function shortUnitLabel(category, key){
  const shortLabels = {
    volumen: { cucharadita: 'cdta', cucharada: 'cda', taza: 'taza(s)', ml: 'ml', litro: 'L', onzaLiquida: 'fl oz', pinta: 'pt' },
    peso: { gramo: 'g', kilogramo: 'kg', onza: 'oz', libra: 'lb' },
  };
  return shortLabels[category]?.[key] || key;
}

function formatNumber(n){
  if (Math.abs(n) >= 1000) return n.toFixed(1);
  if (Math.abs(n) >= 1) return n.toFixed(2);
  return n.toFixed(3);
}

function renderCheatsheet(category){
  const rows = DATA[category].cheatsheet;
  el.cheatsheet.innerHTML = rows
    .map(([a, b]) => `<div class="cheat-item"><span>${a}</span><b>= ${b}</b></div>`)
    .join('');
}

function setCategory(category){
  state.category = category;
  el.tabs.forEach(tab => {
    const isActive = tab.dataset.category === category;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive);
  });
  populateSelects(category);
  renderCheatsheet(category);
  convert();
}

el.tabs.forEach(tab => {
  tab.addEventListener('click', () => setCategory(tab.dataset.category));
});

el.input.addEventListener('input', convert);

el.fromSelect.addEventListener('change', () => {
  state.from = el.fromSelect.value;
  convert();
});

el.toSelect.addEventListener('change', () => {
  state.to = el.toSelect.value;
  convert();
});

el.swapBtn.addEventListener('click', () => {
  const tempFrom = el.fromSelect.value;
  el.fromSelect.value = el.toSelect.value;
  el.toSelect.value = tempFrom;
  state.from = el.fromSelect.value;
  state.to = el.toSelect.value;
  convert();
});

el.year.textContent = new Date().getFullYear();
setCategory('volumen');

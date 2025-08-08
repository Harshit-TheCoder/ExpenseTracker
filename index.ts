// Use this line ONLY if you are including Chart.js via <script> tag in HTML
declare var Chart: any;

interface Transaction {
  id: number;
  description: string;
  amount: number;
  category: string;
}

let transactions: Transaction[] = [];

const descriptionInput = document.getElementById('description') as HTMLInputElement;
const amountInput = document.getElementById('amount') as HTMLInputElement;
const categorySelect = document.getElementById('category') as HTMLSelectElement;
const form = document.getElementById('transactionForm') as HTMLFormElement;
const list = document.getElementById('transactionList') as HTMLUListElement;
const balanceEl = document.getElementById('balance')!;
const incomeEl = document.getElementById('income')!;
const expenseEl = document.getElementById('expense')!;
const chartCanvas = document.getElementById('chart') as HTMLCanvasElement;

let chart: any;

form.onsubmit = (e: Event): void => {
  e.preventDefault();
  const amount: number = +amountInput.value;
  if (descriptionInput.value.trim() === '' || isNaN(amount)) return;

  const newTransaction: Transaction = {
    id: Date.now(),
    description: descriptionInput.value,
    amount,
    category: categorySelect.value
  };

  transactions.push(newTransaction);
  update();
  form.reset();
};

function update(): void {
  localStorage.setItem('transactions', JSON.stringify(transactions));
  renderTransactions();
  renderSummary();
  renderChart();
}

function renderTransactions(): void {
  list.innerHTML = '';
  transactions.forEach((t: Transaction) => {
    const li: HTMLLIElement = document.createElement('li');
    li.className =
      'flex justify-between items-center px-4 py-2 rounded-md ' +
      (t.amount >= 0
        ? 'bg-green-100 text-green-800'
        : 'bg-red-100 text-red-800');

    li.innerHTML = `
      <span>${t.description} (${t.category}): ₹${t.amount}</span>
      <button onclick="removeTransaction(${t.id})" class="ml-4 text-xl hover:text-black">❌</button>
    `;
    list.appendChild(li);
  });
}


function removeTransaction(id: number): void {
  transactions = transactions.filter((t: Transaction) => t.id !== id);
  update();
}

// Allow HTML to access removeTransaction
(window as any).removeTransaction = removeTransaction;

function renderSummary(): void {
  const income: number = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const expense: number = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0);

  balanceEl.textContent = (income + expense).toString();
  incomeEl.textContent = income.toString();
  expenseEl.textContent = Math.abs(expense).toString();
}

function renderChart(): void {
  const categoryTotals: Record<string, number> = {};

  transactions.forEach((t: Transaction) => {
    const cat: string = t.category;
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Math.abs(t.amount);
  });

  const data = {
    labels: Object.keys(categoryTotals),
    datasets: [{
      label: 'Expenses',
      data: Object.values(categoryTotals),
      backgroundColor: ['#f44336', '#2196f3', '#4caf50', '#ff9800', '#9c27b0']
    }]
  };

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(chartCanvas, {
    type: 'pie',
    data
  });
}

function init(): void {
  const saved: string | null = localStorage.getItem('transactions');
  if (saved) {
    transactions = JSON.parse(saved);
  }
  update();
}

init();

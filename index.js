"use strict";
let transactions = [];
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const form = document.getElementById('transactionForm');
const list = document.getElementById('transactionList');
const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income');
const expenseEl = document.getElementById('expense');
const chartCanvas = document.getElementById('chart');
let chart;
form.onsubmit = (e) => {
    e.preventDefault();
    const amount = +amountInput.value;
    if (descriptionInput.value.trim() === '' || isNaN(amount))
        return;
    const newTransaction = {
        id: Date.now(),
        description: descriptionInput.value,
        amount,
        category: categorySelect.value
    };
    transactions.push(newTransaction);
    update();
    form.reset();
};
function update() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    renderTransactions();
    renderSummary();
    renderChart();
}
function renderTransactions() {
    list.innerHTML = '';
    transactions.forEach((t) => {
        const li = document.createElement('li');
        li.className = t.amount >= 0 ? 'income' : 'expense';
        li.innerHTML = `
      ${t.description} (${t.category}): ₹${t.amount}
      <button onclick="removeTransaction(${t.id})">❌</button>
    `;
        list.appendChild(li);
    });
}
function removeTransaction(id) {
    transactions = transactions.filter((t) => t.id !== id);
    update();
}
// Allow HTML to access removeTransaction
window.removeTransaction = removeTransaction;
function renderSummary() {
    const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0);
    balanceEl.textContent = (income + expense).toString();
    incomeEl.textContent = income.toString();
    expenseEl.textContent = Math.abs(expense).toString();
}
function renderChart() {
    const categoryTotals = {};
    transactions.forEach((t) => {
        const cat = t.category;
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
function init() {
    const saved = localStorage.getItem('transactions');
    if (saved) {
        transactions = JSON.parse(saved);
    }
    update();
}
init();

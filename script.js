document.addEventListener('DOMContentLoaded', () => {
    const expenseForm = document.getElementById('expenseForm');
    const expenseList = document.getElementById('expenseList');
    const totalAmount = document.getElementById('totalAmount');
    const deletedExpensesList = document.getElementById('deletedExpensesList');
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    let deletedExpenses = JSON.parse(localStorage.getItem('deletedExpenses')) || [];
    let editIndex = -1; // To track the expense being edited
    let salary = 0; // To store the salary

    // Function to handle form submission
    expenseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('expenseName').value.trim();
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const date = document.getElementById('expenseDate').value;
        salary = parseFloat(document.getElementById('salary').value); // Store salary from input

        if (name && amount && date && salary) {
            const expense = { name, amount, date };
            if (editIndex === -1) {
                expenses.push(expense); // Add new expense
            } else {
                expenses[editIndex] = expense; // Update existing expense
                editIndex = -1; // Reset edit index
            }
            localStorage.setItem('expenses', JSON.stringify(expenses));
            renderExpenses();
            updatePieChart();
            expenseForm.reset();
        } else {
            alert("Please fill out all fields.");
        }
    });

    // Function to render expenses
    function renderExpenses() {
        expenseList.innerHTML = '';
        let total = 0;

        expenses.forEach((expense, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${expense.name} - $${expense.amount} (${expense.date}) 
                <button onclick="deleteExpense(${index})">🗑️</button>
                <button onclick="editExpense(${index})">✏️</button>
            `;
            expenseList.appendChild(li);
            total += expense.amount;
        });

        totalAmount.textContent = total.toFixed(2);
    }

    // Function to delete an expense (move to deleted list)
    window.deleteExpense = function(index) {
        const deletedExpense = expenses.splice(index, 1)[0]; // Remove from expenses
        deletedExpenses.push(deletedExpense); // Add to deleted expenses
        localStorage.setItem('expenses', JSON.stringify(expenses));
        localStorage.setItem('deletedExpenses', JSON.stringify(deletedExpenses));
        renderExpenses();
        updatePieChart();
    }

    // Function to edit an expense
    window.editExpense = function(index) {
        const expense = expenses[index];
        document.getElementById('expenseName').value = expense.name;
        document.getElementById('expenseAmount').value = expense.amount;
        document.getElementById('expenseDate').value = expense.date;
        editIndex = index; // Set edit index to the selected expense
    }

    // Function to search for expenses
    window.searchExpenses = function() {
        const searchInput = document.getElementById('searchInput').value.toLowerCase();
        const filteredExpenses = expenses.filter(expense => 
            expense.name.toLowerCase().includes(searchInput)
        );

        if (filteredExpenses.length === 0) {
            alert("No expenses found!");
        } else {
            displayFilteredExpenses(filteredExpenses);
        }
    }

    // Function to display filtered expenses based on search
    function displayFilteredExpenses(filteredExpenses) {
        expenseList.innerHTML = '';
        let total = 0;

        filteredExpenses.forEach((expense, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${expense.name} - $${expense.amount} (${expense.date}) 
                <button onclick="deleteExpense(${index})">🗑️</button>
                <button onclick="editExpense(${index})">✏️</button>
            `;
            expenseList.appendChild(li);
            total += expense.amount;
        });

        totalAmount.textContent = total.toFixed(2);
    }

    // Function to view deleted expenses
    window.viewDeletedExpenses = function() {
        deletedExpensesList.innerHTML = '';

        deletedExpenses.forEach((expense, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${expense.name} - $${expense.amount} (${expense.date}) 
                <button onclick="restoreExpense(${index})">♻️</button>
                <button onclick="permanentDeleteExpense(${index})">❌</button>
            `;
            deletedExpensesList.appendChild(li);
        });
    }

    // Function to restore deleted expense
    window.restoreExpense = function(index) {
        const restoredExpense = deletedExpenses.splice(index, 1)[0];
        expenses.push(restoredExpense);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        localStorage.setItem('deletedExpenses', JSON.stringify(deletedExpenses));
        renderExpenses();
        viewDeletedExpenses();
        updatePieChart();
    }

    // Function to permanently delete an expense
    window.permanentDeleteExpense = function(index) {
        deletedExpenses.splice(index, 1); // Remove from deleted expenses
        localStorage.setItem('deletedExpenses', JSON.stringify(deletedExpenses));
        viewDeletedExpenses(); // Refresh the deleted expenses list
    }

    // Function to update the pie chart
    function updatePieChart() {
        const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const remainingSalary = salary - totalExpense;

        const ctx = document.getElementById('expensePieChart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Total Expenses', 'Remaining Salary'],
                datasets: [{
                    data: [totalExpense, remainingSalary],
                    backgroundColor: ['#FF6384', '#36A2EB'],
                    hoverOffset: 4
                }]
            }
        });
    }

    // Listen for the Enter key in the search input
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchExpenses();
        }
    });

    // Load expenses on page load
    renderExpenses();
});





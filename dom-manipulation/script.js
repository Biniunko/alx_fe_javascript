// ===== Storage Keys =====
const LS_QUOTES_KEY = "dqg_quotes";
const LS_FILTER_KEY = "dqg_selected_filter";

// ===== Default Quotes =====
const DEFAULT_QUOTES = [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" }
];

// ===== State =====
let quotes = [];
let selectedCategory = "all";

// ===== DOM =====
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const categoryFilter = document.getElementById("categoryFilter");

// ===== Helpers =====
function saveQuotes() {
    localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotes));
}
function loadQuotes() {
    const data = localStorage.getItem(LS_QUOTES_KEY);
    if (data) {
        try {
            quotes = JSON.parse(data);
        } catch {
            quotes = DEFAULT_QUOTES.slice();
        }
    } else {
        quotes = DEFAULT_QUOTES.slice();
    }
}
function saveFilter(cat) {
    localStorage.setItem(LS_FILTER_KEY, cat);
}
function loadFilter() {
    return localStorage.getItem(LS_FILTER_KEY) || "all";
}

// ===== Core Functions =====
function showRandomQuote() {
    let pool = selectedCategory === "all"
        ? quotes
        : quotes.filter(q => q.category === selectedCategory);

    if (pool.length === 0) {
        quoteDisplay.textContent = "No quotes available for this category.";
        return;
    }
    const randomIndex = Math.floor(Math.random() * pool.length);
    quoteDisplay.textContent = `"${pool[randomIndex].text}" — ${pool[randomIndex].category}`;
}

function populateCategories() {
    categoryFilter.innerHTML = ""; // clear old options

    // Always include "All"
    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All Categories";
    categoryFilter.appendChild(allOption);

    // Unique categories from quotes
    const categories = [...new Set(quotes.map(q => q.category))];
    categories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        categoryFilter.appendChild(opt);
    });

    // Restore last selected category
    categoryFilter.value = selectedCategory;
}

function filterQuotes() {
    selectedCategory = categoryFilter.value;
    saveFilter(selectedCategory);
    showRandomQuote();
}

function addQuote() {
    const newText = document.getElementById("newQuoteText").value.trim();
    const newCategory = document.getElementById("newQuoteCategory").value.trim();

    if (!newText || !newCategory) {
        alert("Please enter both a quote and a category.");
        return;
    }

    quotes.push({ text: newText, category: newCategory });
    saveQuotes();

    // Reset inputs
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";

    // Refresh category dropdown
    populateCategories();
    alert("New quote added!");
}

// ===== Init =====
(function init() {
    loadQuotes();
    selectedCategory = loadFilter();

    populateCategories();
    showRandomQuote();

    // Event listeners
    newQuoteBtn.addEventListener("click", showRandomQuote);
    addQuoteBtn.addEventListener("click", addQuote);
})();

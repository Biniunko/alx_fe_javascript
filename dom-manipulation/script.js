// Initial quotes array
let quotes = [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" }
];

// Selected category (default: show from all)
let selectedCategory = "All";

// DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const categoryFilter = document.getElementById("categoryFilter");

// Show a random quote
function showRandomQuote() {
    let filteredQuotes = selectedCategory === "All"
        ? quotes
        : quotes.filter(q => q.category === selectedCategory);

    if (filteredQuotes.length === 0) {
        quoteDisplay.innerText = "No quotes available for this category.";
        return;
    }

    let randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    quoteDisplay.innerText = `"${filteredQuotes[randomIndex].text}" — ${filteredQuotes[randomIndex].category}`;
}

// Dynamically create category filter (radio buttons)
function updateCategoryFilter() {
    categoryFilter.innerHTML = "<h3>Filter by Category:</h3>";

    let categories = ["All", ...new Set(quotes.map(q => q.category))];

    categories.forEach(category => {
        let label = document.createElement("label");
        let radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "category";
        radio.value = category;
        if (category === selectedCategory) radio.checked = true;

        radio.addEventListener("change", () => {
            selectedCategory = category;
            showRandomQuote();
        });

        label.appendChild(radio);
        label.append(" " + category);
        categoryFilter.appendChild(label);
        categoryFilter.appendChild(document.createElement("br"));
    });
}

// Add a new quote dynamically
function addQuote() {
    const newText = document.getElementById("newQuoteText").value.trim();
    const newCategory = document.getElementById("newQuoteCategory").value.trim();

    if (newText && newCategory) {
        quotes.push({ text: newText, category: newCategory });
        document.getElementById("newQuoteText").value = "";
        document.getElementById("newQuoteCategory").value = "";

        updateCategoryFilter(); // Refresh categories
        alert("New quote added!");
    } else {
        alert("Please enter both a quote and a category.");
    }
}

// Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);

// Initialize on page load
updateCategoryFilter();
showRandomQuote();

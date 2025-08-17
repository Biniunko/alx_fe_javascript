// ===== Storage Keys =====
const LS_QUOTES_KEY = "dqg_quotes";
const SS_LAST_QUOTE_KEY = "dqg_last_quote";
const SS_SELECTED_CATEGORY_KEY = "dqg_selected_category";

// ===== Default Data =====
const DEFAULT_QUOTES = [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" }
];

// ===== State =====
let quotes = [];
let selectedCategory = "All";

// ===== DOM =====
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");
const formContainer = document.getElementById("formContainer");
const exportBtn = document.getElementById("exportBtn");

// ===== Utilities =====
function saveQuotes() {
    localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotes));
}

function loadQuotes() {
    const raw = localStorage.getItem(LS_QUOTES_KEY);
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                quotes = parsed.filter(isValidQuote);
            } else {
                quotes = DEFAULT_QUOTES.slice();
            }
        } catch {
            quotes = DEFAULT_QUOTES.slice();
        }
    } else {
        quotes = DEFAULT_QUOTES.slice();
    }
}

// Validate a single quote object
function isValidQuote(obj) {
    return obj
        && typeof obj.text === "string"
        && obj.text.trim().length > 0
        && typeof obj.category === "string"
        && obj.category.trim().length > 0;
}

// Render quote DOM
function renderQuote(q) {
    quoteDisplay.innerHTML = "";

    const block = document.createElement("blockquote");
    const textP = document.createElement("p");
    const footer = document.createElement("footer");

    textP.textContent = `“${q.text}”`;
    footer.textContent = `— ${q.category}`;

    block.appendChild(textP);
    block.appendChild(footer);
    quoteDisplay.appendChild(block);

    // Save last viewed quote in sessionStorage
    try {
        sessionStorage.setItem(SS_LAST_QUOTE_KEY, JSON.stringify(q));
    } catch { }
}

// ===== Core Features =====
function showRandomQuote() {
    const pool = selectedCategory === "All"
        ? quotes
        : quotes.filter(q => q.category === selectedCategory);

    if (pool.length === 0) {
        quoteDisplay.textContent = "No quotes available for this category.";
        return;
    }
    const idx = Math.floor(Math.random() * pool.length);
    renderQuote(pool[idx]);
}

function updateCategoryFilter() {
    categoryFilter.innerHTML = "<h3>Filter by Category:</h3>";
    const categories = ["All", ...new Set(quotes.map(q => q.category))];

    categories.forEach(cat => {
        const id = `cat-${cat.toLowerCase().replace(/\s+/g, "-")}`;

        const lbl = document.createElement("label");
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "category";
        radio.value = cat;
        radio.id = id;
        radio.checked = (cat === selectedCategory);

        radio.addEventListener("change", () => {
            selectedCategory = cat;
            // Persist preference for this session only
            try { sessionStorage.setItem(SS_SELECTED_CATEGORY_KEY, selectedCategory); } catch { }
            showRandomQuote();
        });

        lbl.setAttribute("for", id);
        lbl.appendChild(radio);
        lbl.append(" " + cat);

        categoryFilter.appendChild(lbl);
        categoryFilter.appendChild(document.createElement("br"));
    });
}

// Create "Add Quote" form dynamically (advanced DOM manipulation)
function createAddQuoteForm() {
    formContainer.innerHTML = "";

    const title = document.createElement("h3");
    title.textContent = "Add a New Quote";

    const row = document.createElement("div");
    row.className = "row";

    const quoteInput = document.createElement("input");
    quoteInput.id = "newQuoteText";
    quoteInput.type = "text";
    quoteInput.placeholder = "Enter a new quote";

    const categoryInput = document.createElement("input");
    categoryInput.id = "newQuoteCategory";
    categoryInput.type = "text";
    categoryInput.placeholder = "Enter quote category";

    const addBtn = document.createElement("button");
    addBtn.textContent = "Add Quote";
    addBtn.addEventListener("click", addQuote);

    row.appendChild(quoteInput);
    row.appendChild(categoryInput);
    row.appendChild(addBtn);

    formContainer.appendChild(title);
    formContainer.appendChild(row);
}

// Add a new quote and persist to Local Storage
function addQuote() {
    const quoteInput = document.getElementById("newQuoteText");
    const categoryInput = document.getElementById("newQuoteCategory");

    const newText = quoteInput.value.trim();
    const newCategory = categoryInput.value.trim();

    if (!newText || !newCategory) {
        alert("Please enter both a quote and a category.");
        return;
    }

    const newQuote = { text: newText, category: newCategory };
    if (!isValidQuote(newQuote)) {
        alert("Invalid quote format.");
        return;
    }

    quotes.push(newQuote);
    saveQuotes();

    // Clear inputs
    quoteInput.value = "";
    categoryInput.value = "";

    // Refresh categories (in case a new category was added)
    updateCategoryFilter();

    // If user is currently filtering by the new category, show a quote from it
    if (selectedCategory === newCategory || selectedCategory === "All") {
        renderQuote(newQuote);
    }

    alert("New quote added!");
}

// ===== Import / Export =====
function exportToJsonFile() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    a.href = url;
    a.download = `quotes_${yyyy}-${mm}-${dd}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

// Matches the assignment signature; wired via inline onchange in index.html
function importFromJsonFile(event) {
    const file = event?.target?.files?.[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = function (e) {
        try {
            const text = e.target.result;
            const parsed = JSON.parse(text);

            let incoming = [];
            if (Array.isArray(parsed)) {
                incoming = parsed;
            } else if (parsed && Array.isArray(parsed.quotes)) {
                incoming = parsed.quotes;
            } else {
                throw new Error("JSON must be an array of {text, category} or {quotes: [...] }");
            }

            // Validate and merge; also dedupe by (text|category) pair
            const validIncoming = incoming.filter(isValidQuote);
            const existingSet = new Set(quotes.map(q => `${q.text}|${q.category}`));
            const toAdd = validIncoming.filter(q => !existingSet.has(`${q.text}|${q.category}`));

            if (toAdd.length === 0) {
                alert("No new valid quotes found to import.");
                // Reset input value so the same file can be chosen again later
                event.target.value = "";
                return;
            }

            quotes.push(...toAdd);
            saveQuotes();
            updateCategoryFilter();
            alert(`Quotes imported successfully! (${toAdd.length} added)`);

            // Optionally show a newly imported quote
            renderQuote(toAdd[0]);
        } catch (err) {
            console.error(err);
            alert("Invalid JSON file. Please provide a valid quotes JSON.");
        } finally {
            // Allow re-importing the same file if needed
            event.target.value = "";
        }
    };
    fileReader.readAsText(file);
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
// ===== Server Sync / Mock API =====
const SERVER_API = "https://jsonplaceholder.typicode.com/posts"; // mock API

// Fetch quotes from server (mock)
async function fetchQuotesFromServer() {
    try {
        const res = await fetch(SERVER_API);
        const data = await res.json();
        // Map server data to quote format (mock)
        return data.slice(0, 5).map(item => ({
            text: item.title,
            category: "Server",
            updatedAt: Date.now()
        }));
    } catch (err) {
        console.error("Error fetching server quotes:", err);
        return [];
    }
}

// Post a single quote to server (mock)
async function postQuoteToServer(quote) {
    try {
        await fetch(SERVER_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(quote)
        });
    } catch (err) {
        console.error("Error posting quote to server:", err);
    }
}

// Sync local quotes with server
async function syncQuotes() {
    const serverQuotes = await fetchQuotesFromServer();
    let updated = false;

    serverQuotes.forEach(sq => {
        const exists = quotes.some(lq => lq.text === sq.text && lq.category === sq.category);
        if (!exists) {
            quotes.push(sq);
            updated = true;
        }
    });

    if (updated) {
        saveQuotes();
        updateCategoryFilter();
        showRandomQuote();
        alert("New quotes synced from the server!");
    }
}

// ===== Start periodic syncing every 30s =====
setInterval(syncQuotes, 30000);


// ===== Event Listeners =====
newQuoteBtn.addEventListener("click", showRandomQuote);
exportBtn.addEventListener("click", exportToJsonFile);

// ===== Init =====
(function init() {
    loadQuotes();

    // Restore session-only preferences
    try {
        const savedCat = sessionStorage.getItem(SS_SELECTED_CATEGORY_KEY);
        if (savedCat) selectedCategory = savedCat;
    } catch { }

    updateCategoryFilter();
    createAddQuoteForm();

    // Show last viewed quote for the current session if available; else random
    try {
        const last = sessionStorage.getItem(SS_LAST_QUOTE_KEY);
        if (last) {
            const parsed = JSON.parse(last);
            if (isValidQuote(parsed)) {
                renderQuote(parsed);
                return;
            }
        }
    } catch { }

    showRandomQuote();
})();

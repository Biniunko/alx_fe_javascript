// ==========================
// Local Storage Utilities
// ==========================
function getLocalQuotes() {
    return JSON.parse(localStorage.getItem("quotes")) || [];
}

function setLocalQuotes(quotes) {
    localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ==========================
// Fetch from Server (Simulation)
// ==========================
async function fetchQuotesFromServer() {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts");
        const serverQuotes = await response.json();

        // Map server data -> quote format
        return serverQuotes.slice(0, 5).map(post => ({
            text: post.title,
            category: "server"
        }));
    } catch (error) {
        console.error("Error fetching from server:", error);
        return [];
    }
}

// Post a new quote to server (simulation)
async function postQuoteToServer(quote) {
    try {
        await fetch("https://jsonplaceholder.typicode.com/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(quote),
        });
    } catch (error) {
        console.error("Error posting to server:", error);
    }
}

// ==========================
// Conflict Resolution & Notifications
// ==========================
function notifyUser(message) {
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.className = "notification";
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
}

function resolveConflict(serverQuotes, localQuotes) {
    notifyUser("Conflict detected! Server data applied.");
    return [...serverQuotes, ...localQuotes];
}

// ==========================
// Data Sync Logic
// ==========================
async function syncWithServer() {
    const serverQuotes = await fetchQuotesFromServer();
    let localQuotes = getLocalQuotes();

    // Conflict resolution → server wins
    const mergedQuotes = resolveConflict(serverQuotes, localQuotes);
    setLocalQuotes(mergedQuotes);

    displayQuotes(); // Refresh UI after syncing
    notifyUser("Quotes synced with server!");
}

// Run sync every 30 seconds
setInterval(syncWithServer, 30000);

// ==========================
// Add + Display Quotes
// ==========================
function addQuote(text, category) {
    if (!text || !category) {
        notifyUser("Please enter both a quote and category!");
        return;
    }

    let quotes = getLocalQuotes();
    const newQuote = { text, category };
    quotes.push(newQuote);

    setLocalQuotes(quotes);
    displayQuotes();

    // Also try to send it to server
    postQuoteToServer(newQuote);

    notifyUser("Quote added successfully!");
}
function displayRandomQuote() {
    const quotes = getLocalQuotes();
    if (quotes.length === 0) {
        notifyUser("No quotes available!");
        return;
    }

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];

    const container = document.getElementById("quoteContainer");
    container.innerHTML = `<div>${randomQuote.text} (${randomQuote.category})</div>`;
}

function displayQuotes() {
    const container = document.getElementById("quoteContainer");
    container.innerHTML = "";

    const quotes = getLocalQuotes();
    quotes.forEach(q => {
        const div = document.createElement("div");
        div.textContent = `${q.text} (${q.category})`;
        container.appendChild(div);
    });
}

// ==========================
// Initial Load
// ==========================
window.onload = () => {
    displayQuotes();
    syncWithServer(); // Initial sync on page load
};

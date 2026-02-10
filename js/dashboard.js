// Dashboard JavaScript - TechRedo
document.addEventListener('DOMContentLoaded', () => {
    const cardsGrid = document.getElementById('cardsGrid');
    const emptyState = document.getElementById('emptyState');
    const loadingState = document.getElementById('loadingState');

    let allQuotations = [];

    // Load quotations
    async function loadQuotations() {
        try {
            loadingState.style.display = 'flex';
            emptyState.style.display = 'none';

            // Load from localStorage
            const saved = localStorage.getItem('techredo_quotations');
            if (saved) {
                allQuotations = JSON.parse(saved);
            } else {
                allQuotations = [];
            }

            renderQuotations();

        } catch (error) {
            console.error('Error loading quotations:', error);
            allQuotations = [];
            renderQuotations();
        } finally {
            loadingState.style.display = 'none';
        }
    }

    // Render quotations as cards
    function renderQuotations() {
        if (allQuotations.length === 0) {
            cardsGrid.innerHTML = '';
            emptyState.style.display = 'flex';
            return;
        }

        emptyState.style.display = 'none';
        cardsGrid.innerHTML = '';

        allQuotations.forEach(quote => {
            const card = createQuotationCard(quote);
            cardsGrid.appendChild(card);
        });
    }

    // Create quotation card element
    function createQuotationCard(quote) {
        const card = document.createElement('div');
        card.className = 'quote-card';
        card.onclick = () => viewQuotation(quote.id);

        const formattedDate = formatDate(quote.date);
        const formattedAmount = formatCurrency(quote.amount);
        const formattedCapacity = quote.capacity || '100 KW';

        card.innerHTML = `
            <!-- External Link Icon -->
            <div class="external-icon">
                <i class="fas fa-external-link-alt"></i>
            </div>

            <!-- Card Header -->
            <div class="card-header">
                <div class="card-client-info">
                    <h3>${quote.clientName}</h3>
                    <div class="card-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${quote.location}
                    </div>
                </div>
                <span class="quote-number-badge">${quote.quoteNumber}</span>
            </div>

            <!-- Metrics Row -->
            <div class="metrics-row">
                <!-- Capacity Badge -->
                <div class="metric-badge capacity">
                    <div class="metric-label">Capacity</div>
                    <div class="metric-value">${formattedCapacity}</div>
                </div>

                <!-- Amount Badge -->
                <div class="metric-badge amount">
                    <div class="metric-label">Amount</div>
                    <div class="metric-value">${formattedAmount}</div>
                </div>
            </div>

            <!-- Card Footer -->
            <div class="card-footer">
                <span class="card-date">
                    <i class="far fa-calendar"></i>
                    ${formattedDate}
                </span>
                <span class="view-details">View Details →</span>
            </div>
        `;

        return card;
    }

    // View quotation details
    function viewQuotation(quoteId) {
        window.location.href = `generator.html?id=${quoteId}`;
    }

    // Utility functions
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    function formatCurrency(amount) {
        if (!amount) return '₹ 0';
        return `₹ ${parseFloat(amount).toLocaleString('en-IN')}`;
    }

    // Sample data for demo
    function getSampleQuotations() {
        return [];
    }

    // Initialize
    loadQuotations();
});

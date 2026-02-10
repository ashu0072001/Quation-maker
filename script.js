document.addEventListener('DOMContentLoaded', () => {
    // Clear form on page load to prevent autofill
    const form = document.getElementById('quoteForm');
    if (form) {
        form.reset();
    }

    // Input Elements
    const clientNameInput = document.getElementById('clientName');
    const locationInput = document.getElementById('location');
    const mobileInput = document.getElementById('mobile');
    const quoteYearInput = document.getElementById('quoteYear');
    const quoteMonthInput = document.getElementById('quoteMonth');
    const quoteIdInput = document.getElementById('quoteId');
    const dateInput = document.getElementById('date');
    const authPersonInput = document.getElementById('authPerson');
    const tiplContactInput = document.getElementById('tiplContact');
    const scopeContainer = document.querySelector('.scope-section');
    const addScopeBtn = document.getElementById('addScopeRow');
    const generatePdfBtn = document.getElementById('generatePdfBtn');

    // Preview Elements
    const previewClientName = document.getElementById('previewClientName');
    const coverClientName = document.getElementById('coverClientName');
    const qClientName = document.getElementById('q_client_name');
    const qLocation = document.getElementById('q_location');
    const qMobile = document.getElementById('q_mobile');
    const qNo = document.getElementById('q_no');
    const qDate = document.getElementById('q_date');
    const qAuthPerson = document.getElementById('q_auth_person');
    const qTiplContact = document.getElementById('q_tipl_contact');
    const qScopeContent = document.getElementById('q_scope_content');
    const qQty = document.getElementById('q_qty');
    const qUnit = document.getElementById('q_unit');
    const qUnitRate = document.getElementById('q_unit_rate');
    const qTotal = document.getElementById('q_total');
    const qTotalBottom = document.getElementById('q_total_bottom');
    const qTotalWords = document.getElementById('q_total_words');
    const mainQuoteRateInput = document.getElementById('mainQuoteRate');
    const mainQuoteQtyInput = document.getElementById('mainQuoteQty');

    // State
    let scopeRows = [
        "EPC CONTRACT OF ROOFTOP SOLAR PLANT 3 PH",
        "REGULAR UNDER NON SUBSIDY - C&I",
        "PV PANEL - VIKRAM / WAAREE - 5XX WP",
        "PV INVERTER - VSOLE / EASTMAN 3 PH 100 KW"
    ];

    // Functions
    function numberToWords(num) {
        const a = ['', 'ONE ', 'TWO ', 'THREE ', 'FOUR ', 'FIVE ', 'SIX ', 'SEVEN ', 'EIGHT ', 'NINE ', 'TEN ', 'ELEVEN ', 'TWELVE ', 'THIRTEEN ', 'FOURTEEN ', 'FIFTEEN ', 'SIXTEEN ', 'SEVENTEEN ', 'EIGHTEEN ', 'NINETEEN '];
        const b = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];

        function inWords(n) {
            if ((n = n.toString()).length > 9) return 'overflow';
            let n_arr = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
            if (!n_arr) return '';
            let str = '';
            str += (n_arr[1] != 0) ? (a[Number(n_arr[1])] || b[n_arr[1][0]] + ' ' + a[n_arr[1][1]]) + 'CRORE ' : '';
            str += (n_arr[2] != 0) ? (a[Number(n_arr[2])] || b[n_arr[2][0]] + ' ' + a[n_arr[2][1]]) + 'LAKH ' : '';
            str += (n_arr[3] != 0) ? (a[Number(n_arr[3])] || b[n_arr[3][0]] + ' ' + a[n_arr[3][1]]) + 'THOUSAND ' : '';
            str += (n_arr[4] != 0) ? (a[Number(n_arr[4])] || b[n_arr[4][0]] + ' ' + a[n_arr[4][1]]) + 'HUNDRED ' : '';
            str += (n_arr[5] != 0) ? ((str != '') ? 'AND ' : '') + (a[Number(n_arr[5])] || b[n_arr[5][0]] + ' ' + a[n_arr[5][1]]) + 'RS' : 'RS';
            return str;
        }
        return inWords(num);
    }

    function updatePreview() {
        // Sync Cover Page
        if (coverClientName) {
            coverClientName.textContent = clientNameInput.value || '[Client Name]';
        }

        // Sync New Quotation Summary Page
        if (qClientName) qClientName.textContent = clientNameInput.value || '[Client Name]';
        if (qLocation) qLocation.textContent = locationInput.value || '[Location]';
        if (qMobile) qMobile.textContent = mobileInput.value || '[Mobile]';

        const qtnStr = `QTN/${quoteYearInput.value || '25-26'}/${quoteMonthInput.value || 'DEC'}/${quoteIdInput.value || '00'}`;
        if (qNo) qNo.textContent = qtnStr;

        if (qDate) {
            if (dateInput.value) {
                const d = new Date(dateInput.value);
                qDate.textContent = d.toLocaleDateString('en-GB');
            } else {
                qDate.textContent = '[Date]';
            }
        }

        if (qAuthPerson) qAuthPerson.textContent = authPersonInput.value || '[Auth Person]';
        if (qTiplContact) qTiplContact.textContent = tiplContactInput.value || '[TIPL Contact]';

        // Qty Sync for main summary (taking first item from BOQ usually implies total project kw)
        const projectQty = document.getElementById('input_boq_qty_01').value || '100';
        const projectUnit = document.getElementById('input_boq_unit_01').value || 'KW';
        if (qQty) qQty.textContent = mainQuoteQtyInput.value || '100';
        if (qUnit) qUnit.textContent = projectUnit;

        // Total Logic for Summary Page
        const rate = parseFloat(mainQuoteRateInput.value) || 0;
        const qtyVal = parseFloat(mainQuoteQtyInput.value) || 0;
        const totalAmount = rate * qtyVal;

        if (qUnitRate) qUnitRate.textContent = rate.toFixed(2);
        if (qTotal) qTotal.textContent = totalAmount.toFixed(2);
        if (qTotalBottom) qTotalBottom.textContent = totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 });
        if (qTotalWords) qTotalWords.textContent = numberToWords(Math.floor(totalAmount)) + " ONLY";

        renderScopeTable();
    }

    function renderScopeTable() {
        const previewScopeBody = document.getElementById('previewScopeBody');
        const currentInputs = document.querySelectorAll('.scope-input');

        // Sync boqPage scope (Legacy/Material List style)
        if (previewScopeBody) {
            previewScopeBody.innerHTML = '';
            currentInputs.forEach((input, index) => {
                if (input.value.trim() !== "") {
                    const tr = document.createElement('tr');
                    const tdSn = document.createElement('td');
                    tdSn.textContent = index + 1;
                    const tdDesc = document.createElement('td');
                    tdDesc.textContent = input.value;
                    tr.appendChild(tdSn);
                    tr.appendChild(tdDesc);
                    previewScopeBody.appendChild(tr);
                }
            });
        }

        // Sync NEW Quotation Page scope (Summary style)
        if (qScopeContent) {
            qScopeContent.innerHTML = '';
            currentInputs.forEach((input, index) => {
                if (input.value.trim() !== "") {
                    const p = document.createElement('div');
                    p.style.marginBottom = "5px";
                    p.innerHTML = `<span style="display:inline-block; width: 100px;">${input.value.split('-')[0]}</span> - ${input.value.split('-')[1] || ''}`;
                    // Special logic for EPC line bolding as per image
                    if (index === 0 || index === 1) {
                        p.style.fontWeight = "bold";
                        p.innerHTML = input.value;
                    } else {
                        // For PV Panel etc, handle the dash
                        if (input.value.includes('-')) {
                            const parts = input.value.split('-');
                            p.innerHTML = `<b>${parts[0]}</b> - ${parts[1]}`;
                        }
                    }
                    qScopeContent.appendChild(p);
                }
            });
        }
    }

    // Auto-generate Date
    if (dateInput && !dateInput.value) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    // Load from URL ID if present
    const urlParams = new URLSearchParams(window.location.search);
    const quoteIdParam = urlParams.get('id');

    if (quoteIdParam) {
        loadQuotationData(quoteIdParam);
    } else {
        // Auto-generate Quote Number for NEW quotation
        generateNewQuoteNumber();
    }

    // Event Listeners for seamless updates
    const inputs_to_sync = [clientNameInput, locationInput, mobileInput, quoteYearInput, quoteMonthInput, quoteIdInput, dateInput, authPersonInput, tiplContactInput, mainQuoteRateInput, mainQuoteQtyInput];

    inputs_to_sync.forEach(input => {
        if (input) input.addEventListener('input', updatePreview);
    });

    // Special listener for scope inputs (delegation)
    scopeContainer.addEventListener('input', (e) => {
        if (e.target.classList.contains('scope-input')) {
            updatePreview();
        }
    });

    addScopeBtn.addEventListener('click', () => {
        const div = document.createElement('div');
        div.className = 'scope-item';
        div.innerHTML = `<input type="text" class="scope-input" placeholder="Enter description">`;
        scopeContainer.insertBefore(div, document.getElementById('mainQuoteRate').closest('.form-row'));
        updatePreview();
    });

    generatePdfBtn.addEventListener('click', async () => {
        const opt = {
            margin: 0,
            filename: 'Quotation.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2, // 2 is safer for mobile memory than 3
                useCORS: true,
                letterRendering: true,
                logging: false,
                scrollX: 0,
                scrollY: 0
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Highly robust capture: Clones to body, waits for images, and uses a paint delay
        const capturePage = async (elementId) => {
            const element = document.getElementById(elementId);
            if (!element) return null;

            // Temporary container to ensure element is rendered at full size
            const clone = element.cloneNode(true);
            Object.assign(clone.style, {
                position: 'absolute',
                top: '0',
                left: '0',
                width: '210mm',
                height: '297mm',
                transform: 'none',
                visibility: 'visible',
                display: 'block',
                zIndex: '9999',
                background: 'white',
                margin: '0',
                padding: '10mm 15mm'
            });

            // Special handling for pages with different padding
            if (elementId === 'frontPage') {
                clone.style.padding = '0';
            } else if (elementId === 'boqPage') {
                clone.style.padding = '15mm';
            }

            document.body.appendChild(clone);

            // Ensure all images are loaded before capture
            const imgs = Array.from(clone.querySelectorAll('img'));
            await Promise.all(imgs.map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(res => { img.onload = res; img.onerror = res; });
            }));

            // Allow browser to paint the clone
            await new Promise(r => setTimeout(r, 600));

            // Use the full Promise-based html2pdf API for better consistency
            const buffer = await html2pdf().set(opt).from(clone).toPdf().get('pdf').output('arraybuffer');

            document.body.removeChild(clone);
            return buffer;
        };

        try {
            // Scroll to top to prevention capture offsets
            window.scrollTo(0, 0);

            // 1. Generate PDFs from HTML elements sequentially
            const frontPagePdf = await capturePage('frontPage');
            const quotationPagePdf = await capturePage('quotationPage');
            const boqPagePdf = await capturePage('boqPage');

            // 2. Fetch external PDFs
            const [permResp, lastResp] = await Promise.all([
                fetch('Permanent.pdf'),
                fetch('last.pdf')
            ]);

            const permBuffer = await permResp.arrayBuffer();
            const lastBuffer = await lastResp.arrayBuffer();

            // 3. Merge PDFs
            const { PDFDocument } = PDFLib;
            const mergedPdf = await PDFDocument.create();

            const pdfsToLoad = [
                { buffer: frontPagePdf, pages: [0] },
                { buffer: permBuffer, all: true },
                { buffer: boqPagePdf, pages: [0] },
                { buffer: quotationPagePdf, pages: [0] },
                { buffer: lastBuffer, all: true }
            ];

            for (const item of pdfsToLoad) {
                if (!item.buffer) continue;
                const pdf = await PDFDocument.load(item.buffer);
                const indices = item.all ? pdf.getPageIndices() : item.pages;
                const copiedPages = await mergedPdf.copyPages(pdf, indices);
                copiedPages.forEach(p => mergedPdf.addPage(p));
            }

            // 4. Save and Download
            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Quotation_${clientNameInput.value || 'Client'}.pdf`;
            link.click();
            URL.revokeObjectURL(url);

            // 6. Save Quotation to localStorage
            saveQuotation();

            // 7. Auto-reload to refresh form and generate next Quote No.
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF. check console.");
        }
    });

    // BOQ Logic
    const boqItems = [
        "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11"
    ];

    function updateBoq(idSuffix, type, value) {
        // type: make, narration, qty, unit
        const cellId = `boq_${type}_${idSuffix}`;
        const cell = document.getElementById(cellId);
        if (cell) {
            cell.textContent = value;
        }
    }

    // Attach listeners to BOQ inputs
    boqItems.forEach(suffix => {
        ['make', 'narration', 'qty', 'unit'].forEach(field => {
            const inputId = `input_boq_${field}_${suffix}`;
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', (e) => {
                    updateBoq(suffix, field, e.target.value);
                });
            }
        });
    });

    // Initial BOQ sync
    boqItems.forEach(suffix => {
        ['make', 'narration', 'qty', 'unit'].forEach(field => {
            const inputId = `input_boq_${field}_${suffix}`;
            const input = document.getElementById(inputId);
            if (input) {
                updateBoq(suffix, field, input.value);
            }
        });
    });

    updatePreview();

    function generateNewQuoteNumber() {
        const now = new Date();
        const year = now.getFullYear();
        const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const month = monthNames[now.getMonth()];
        const finYear = now.getMonth() >= 3 ? `${String(year).slice(-2)}-${String(year + 1).slice(-2)}` : `${String(year - 1).slice(-2)}-${String(year).slice(-2)}`;

        const saved = localStorage.getItem('techredo_quotations');
        let nextId = 1;
        if (saved) {
            const quotes = JSON.parse(saved);
            if (quotes.length > 0) {
                // Find the maximum ID used so far to ensure we always increment correctly
                const ids = quotes.map(q => {
                    const idPart = q.formData ? q.formData.quoteId : q.id.split('-').pop();
                    return parseInt(idPart) || 0;
                });
                nextId = Math.max(...ids) + 1;
            }
        }

        if (quoteYearInput) quoteYearInput.value = finYear;
        if (quoteMonthInput) quoteMonthInput.value = month;
        if (quoteIdInput) quoteIdInput.value = String(nextId).padStart(2, '0');
    }

    function saveQuotation() {
        const quoteObj = {
            id: `QTN-${quoteYearInput.value}-${quoteMonthInput.value}-${quoteIdInput.value}`,
            quoteNumber: `QTN/${quoteYearInput.value}/${quoteMonthInput.value}/${quoteIdInput.value}`,
            clientName: clientNameInput.value,
            location: locationInput.value,
            mobile: mobileInput.value,
            date: dateInput.value,
            capacity: (mainQuoteQtyInput.value || '100') + ' KW',
            amount: (parseFloat(mainQuoteRateInput.value) || 0) * (parseFloat(mainQuoteQtyInput.value) || 0),
            formData: {
                clientName: clientNameInput.value,
                location: locationInput.value,
                mobile: mobileInput.value,
                quoteYear: quoteYearInput.value,
                quoteMonth: quoteMonthInput.value,
                quoteId: quoteIdInput.value,
                date: dateInput.value,
                authPerson: authPersonInput.value,
                tiplContact: tiplContactInput.value,
                rate: mainQuoteRateInput.value,
                qty: mainQuoteQtyInput.value,
                scope: Array.from(document.querySelectorAll('.scope-input')).map(i => i.value),
                boq: boqItems.map(suffix => ({
                    suffix,
                    make: document.getElementById(`input_boq_make_${suffix}`).value,
                    narration: document.getElementById(`input_boq_narration_${suffix}`).value,
                    qty: document.getElementById(`input_boq_qty_${suffix}`).value,
                    unit: document.getElementById(`input_boq_unit_${suffix}`).value
                }))
            }
        };

        let quotes = JSON.parse(localStorage.getItem('techredo_quotations') || '[]');
        const existingIndex = quotes.findIndex(q => q.id === quoteObj.id);
        if (existingIndex > -1) {
            quotes[existingIndex] = quoteObj;
        } else {
            quotes.unshift(quoteObj);
        }
        localStorage.setItem('techredo_quotations', JSON.stringify(quotes));
    }

    function loadQuotationData(id) {
        const quotes = JSON.parse(localStorage.getItem('techredo_quotations') || '[]');
        const quote = quotes.find(q => q.id === id);
        if (quote && quote.formData) {
            const data = quote.formData;
            clientNameInput.value = data.clientName || '';
            locationInput.value = data.location || '';
            mobileInput.value = data.mobile || '';
            quoteYearInput.value = data.quoteYear || '';
            quoteMonthInput.value = data.quoteMonth || '';
            quoteIdInput.value = data.quoteId || '';
            dateInput.value = data.date || '';
            authPersonInput.value = data.authPerson || '';
            tiplContactInput.value = data.tiplContact || '';
            mainQuoteRateInput.value = data.rate || '';
            mainQuoteQtyInput.value = data.qty || '';

            // Handle Scope
            if (data.scope && data.scope.length > 0) {
                const scopeContainer = document.querySelector('.scope-section');
                const existingItems = scopeContainer.querySelectorAll('.scope-item');
                existingItems.forEach(item => item.remove());

                data.scope.forEach(val => {
                    const div = document.createElement('div');
                    div.className = 'scope-item';
                    div.innerHTML = `<input type="text" class="scope-input" value="${val}">`;
                    scopeContainer.insertBefore(div, document.getElementById('mainQuoteRate').closest('.form-row'));
                });
            }

            // Handle BOQ
            if (data.boq) {
                data.boq.forEach(item => {
                    const makeInput = document.getElementById(`input_boq_make_${item.suffix}`);
                    const narrInput = document.getElementById(`input_boq_narration_${item.suffix}`);
                    const qtyInput = document.getElementById(`input_boq_qty_${item.suffix}`);
                    const unitInput = document.getElementById(`input_boq_unit_${item.suffix}`);

                    if (makeInput) makeInput.value = item.make || '';
                    if (narrInput) narrInput.value = item.narration || '';
                    if (qtyInput) qtyInput.value = item.qty || '';
                    if (unitInput) unitInput.value = item.unit || '';

                    updateBoq(item.suffix, 'make', item.make || '');
                    updateBoq(item.suffix, 'narration', item.narration || '');
                    updateBoq(item.suffix, 'qty', item.qty || '');
                    updateBoq(item.suffix, 'unit', item.unit || '');
                });
            }
            updatePreview();
        }
    }
});

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
        const firstQtyInput = document.getElementById('input_boq_qty_01');
        const firstUnitInput = document.getElementById('input_boq_unit_01');
        const projectQty = firstQtyInput ? firstQtyInput.value : '100';
        const projectUnit = firstUnitInput ? firstUnitInput.value : 'KW';

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

                    // Fixed logic for multiple dashes: preserve all content after first dash
                    const firstDashIndex = input.value.indexOf('-');
                    if (firstDashIndex !== -1) {
                        const prefix = input.value.substring(0, firstDashIndex).trim();
                        const suffix = input.value.substring(firstDashIndex + 1).trim();

                        if (index === 0 || index === 1) {
                            p.style.fontWeight = "bold";
                            p.innerHTML = input.value;
                        } else {
                            p.innerHTML = `<b>${prefix}</b> - ${suffix}`;
                        }
                    } else {
                        // No dash present
                        if (index === 0 || index === 1) {
                            p.style.fontWeight = "bold";
                        }
                        p.textContent = input.value;
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
    if (scopeContainer) {
        scopeContainer.addEventListener('input', (e) => {
            if (e.target.classList.contains('scope-input')) {
                updatePreview();
            }
        });
    }

    if (addScopeBtn) {
        addScopeBtn.addEventListener('click', () => {
            const div = document.createElement('div');
            div.className = 'scope-item';
            div.innerHTML = `<input type="text" class="scope-input" placeholder="Enter description">`;
            const mainRateRow = document.getElementById('mainQuoteRate').closest('.form-row');
            scopeContainer.insertBefore(div, mainRateRow);
            updatePreview();
        });
    }

    // Cache for external PDFs
    const pdfCache = {};

    generatePdfBtn.addEventListener('click', async () => {
        const loader = document.getElementById('pdfLoader');
        const loaderText = loader ? loader.querySelector('p') : null;
        if (loader) loader.style.display = 'flex';

        // 1. Enter Atomic Capture Mode
        document.body.classList.add('printing-mode');
        window.scrollTo(0, 0);

        const opt = {
            margin: 0,
            filename: 'Quotation.pdf',
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: {
                scale: 1.5,
                useCORS: true,
                letterRendering: true,
                logging: false,
                scrollX: 0,
                scrollY: 0,
                windowWidth: 800
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true }
        };

        const capturePageInPlace = async (elementId) => {
            const element = document.getElementById(elementId);
            if (!element) return null;

            try {
                await document.fonts.ready;
                const imgs = Array.from(element.querySelectorAll('img'));
                await Promise.all(imgs.map(img => {
                    if (img.complete) return Promise.resolve();
                    return new Promise(res => { img.onload = res; img.onerror = res; });
                }));

                // Optimized delay from 1500ms to 500ms
                await new Promise(r => setTimeout(r, 500));

                const buffer = await html2pdf().set(opt).from(element).toPdf().get('pdf').output('arraybuffer');
                return buffer;
            } catch (e) {
                console.error(`Error capturing ${elementId}:`, e);
                return null;
            }
        };

        const fetchPdf = async (url) => {
            if (pdfCache[url]) return pdfCache[url];
            try {
                const resp = await fetch(url);
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                const buffer = await resp.arrayBuffer();
                pdfCache[url] = buffer;
                return buffer;
            } catch (e) { return null; }
        };

        try {
            if (loaderText) loaderText.textContent = "Processing PDF components...";

            // 2. Start all tasks in parallel
            const tasks = [
                capturePageInPlace('frontPage'),
                capturePageInPlace('boqPage'),
                capturePageInPlace('quotationPage'),
                fetchPdf('Permanent.pdf'),
                fetchPdf('last.pdf')
            ];

            const [frontPagePdf, boqPagePdf, quotationPagePdf, permBuffer, lastBuffer] = await Promise.all(tasks);

            if (loaderText) loaderText.textContent = "Merging documents...";

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
                try {
                    const pdf = await PDFDocument.load(item.buffer);
                    const indices = item.all ? pdf.getPageIndices() : item.pages;
                    const copiedPages = await mergedPdf.copyPages(pdf, indices);
                    copiedPages.forEach(p => mergedPdf.addPage(p));
                } catch (e) { }
            }

            // 4. Download & Save to Database
            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });

            // Trigger local download
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Quotation_${quoteIdInput.value || 'New'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // 5. Upload to MySQL Database
            if (loaderText) loaderText.textContent = "Saving to Database...";
            const quoteData = saveQuotation(); // Get current state

            const formData = new FormData();
            formData.append('json_data', JSON.stringify(quoteData));
            formData.append('pdf_file', blob, 'quotation.pdf');

            try {
                const response = await fetch('api.php?action=save', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                console.log('Database Save:', result);
            } catch (saveError) {
                console.error('Error saving to MySQL:', saveError);
            }

            // Cleanup
            setTimeout(() => {
                document.body.classList.remove('printing-mode');
                pdfLoader.style.display = 'none';
                window.location.reload();
            }, 1000);

        } catch (error) {
            console.error("Critical error generating PDF:", error);
            alert("Failed to generate PDF. Check console.");
            document.body.classList.remove('printing-mode');
            if (loader) loader.style.display = 'none';
        }
    });

    // BOQ Logic
    const boqItems = [
        "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11"
    ];

    function updateBoq(idSuffix, type, value) {
        const cellId = `boq_${type}_${idSuffix}`;
        const cell = document.getElementById(cellId);
        if (cell) cell.textContent = value;
    }

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

    // Initial sync
    boqItems.forEach(suffix => {
        ['make', 'narration', 'qty', 'unit'].forEach(field => {
            const inputId = `input_boq_${field}_${suffix}`;
            const input = document.getElementById(inputId);
            if (input) updateBoq(suffix, field, input.value);
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
        if (existingIndex > -1) quotes[existingIndex] = quoteObj;
        else quotes.unshift(quoteObj);
        localStorage.setItem('techredo_quotations', JSON.stringify(quotes));
        return quoteObj;
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

            if (data.scope && data.scope.length > 0) {
                const sContainer = document.querySelector('.scope-section');
                sContainer.querySelectorAll('.scope-item').forEach(item => item.remove());
                data.scope.forEach(val => {
                    const div = document.createElement('div');
                    div.className = 'scope-item';
                    div.innerHTML = `<input type="text" class="scope-input" value="${val}">`;
                    sContainer.insertBefore(div, document.getElementById('mainQuoteRate').closest('.form-row'));
                });
            }

            if (data.boq) {
                data.boq.forEach(item => {
                    ['make', 'narration', 'qty', 'unit'].forEach(f => {
                        const i = document.getElementById(`input_boq_${f}_${item.suffix}`);
                        if (i) i.value = item[f] || '';
                        updateBoq(item.suffix, f, item[f] || '');
                    });
                });
            }
            updatePreview();
        }
    }
});

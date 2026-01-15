// Export functions for PDF and Excel
export function exportPDF(currentHolidays) {
    const holiday = currentHolidays.find(h => h.id === window.activeHolidayId);
    if (!holiday) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text(holiday.name, 14, 20);

    const items = (holiday.itinerary || [])
        .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''));

    const tableBody = [];
    let lastDate = null;

    items.forEach(item => {
        // Check for new date group
        if (item.date !== lastDate) {
            const dateObj = dayjs(item.date);
            const dateStr = dateObj.format('dddd, MMMM D, YYYY');

            // Add Header Row
            tableBody.push([{
                content: dateStr,
                colSpan: 4,
                styles: {
                    fillColor: [253, 226, 231],
                    textColor: [0, 0, 0],
                    fontStyle: 'bold',
                    halign: 'left'
                }
            }]);
            lastDate = item.date;
        }

        tableBody.push([
            item.time || '',
            item.activity,
            item.location || '',
            item.notes || ''
        ]);
    });

    doc.autoTable({
        head: [['Time', 'Activity', 'Location', 'Notes']],
        body: tableBody,
        startY: 30,
        theme: 'grid',
        headStyles: { fillColor: [193, 125, 142], fontStyle: 'bold', textColor: [0, 0, 0] },
        didParseCell: function (data) {
            // Check if we are in 'Location' column
            if (data.section === 'body' && data.column.index === 2) {
                const textArray = data.cell.text;
                const text = Array.isArray(textArray) ? textArray.join('') : textArray;
                if (text && text !== '-' && data.cell.raw && !data.cell.raw.colSpan) {
                    data.cell.styles.textColor = [56, 189, 248]; // Light Blue
                }
            }
        },
        didDrawCell: function (data) {
            // Check if we are in 'Location' column
            if (data.section === 'body' && data.column.index === 2) {
                // jspdf-autotable v3 stores text as an array in data.cell.text
                const textArray = data.cell.text;
                const text = Array.isArray(textArray) ? textArray.join('') : textArray;

                // Simple check to avoid linking the colspan header if it accidentally matches index 2
                if (text && text !== '-' && data.cell.raw && !data.cell.raw.colSpan) {
                    const linkUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text)}`;
                    doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: linkUrl });
                }
            }
        }
    });

    doc.save(`${holiday.name.replace(/\s+/g, ' ')} Itinerary.pdf`);
}

export function exportExcel(currentHolidays) {
    const holiday = currentHolidays.find(h => h.id === window.activeHolidayId);
    if (!holiday) return;

    const getMapLink = (loc) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`;

    const items = (holiday.itinerary || [])
        .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''));

    // Build the data array for the sheet (Array of Arrays)
    const wsData = [
        ['Time', 'Activity', 'Location', 'Notes'] // Header Row
    ];

    const merges = []; // Array to store merge ranges
    let lastDate = null;
    let currentRowIndex = 1; // Start after header (0-indexed)

    items.forEach(item => {
        // Check for new date group
        if (item.date !== lastDate) {
            const dateObj = dayjs(item.date);
            const dateStr = dateObj.format('dddd, MMMM D, YYYY');

            // Add Date Header Row
            wsData.push([dateStr, '', '', '']); // Only first cell has content

            // Merge this row across 4 columns
            merges.push({ s: { r: currentRowIndex, c: 0 }, e: { r: currentRowIndex, c: 3 } });

            lastDate = item.date;
            currentRowIndex++;
        }

        // Add Item Row
        wsData.push([
            item.time || '',
            item.activity,
            item.location || '',
            item.notes || ''
        ]);
        currentRowIndex++;
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Apply merges
    if (!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push(...merges);

    // Apply hyperlinks to the Location column (Index 2: A=0, B=1, C=2)
    // Iterate through rows to find Location cells.
    // We can just iterate through the range.
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = 1; R <= range.e.r; ++R) {
        // Skip link if it's a merged date row (check if R is in merges? Or simpler: verify column 2 has content and is not part of a header row logic)
        // Actually, merged rows usually have content only in the first cell (C=0). C=2 will be empty/undefined in the data array, 
        // but SheetJS might fill it. 
        // Safer check: look at ws data. Date rows have content in col 0. Item rows have content in col 0 (Time) or col 1 (Activity).
        // Let's just check the cell value at C=2.

        const cellAddress = XLSX.utils.encode_cell({ c: 2, r: R }); // Column 2 = Location
        const cell = ws[cellAddress];

        if (cell && cell.v && cell.v !== '-') {
            // It's likely a location. Note: Date rows have empty C=2.
            cell.l = { Target: getMapLink(cell.v) };
        }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Itinerary");
    XLSX.writeFile(wb, `${holiday.name.replace(/\s+/g, ' ')} Itinerary.xlsx`);
}

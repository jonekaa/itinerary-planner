// Export functions for PDF and Excel
export function exportPDF(currentHolidays) {
    const holiday = currentHolidays.find(h => h.id === window.activeHolidayId);
    if (!holiday) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text(holiday.name, 14, 20);

    const tableData = (holiday.itinerary || [])
        .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''))
        .map(item => [
            item.date,
            item.time || '-',
            item.activity,
            item.location || '-',
            item.notes || '-'
        ]);

    doc.autoTable({
        head: [['Date', 'Time', 'Activity', 'Location', 'Notes']],
        body: tableData,
        startY: 30,
        theme: 'grid',
        headStyles: { fillColor: [14, 165, 233] } // Primary-500
    });

    doc.save(`${holiday.name.replace(/\s+/g, '_')}_Itinerary.pdf`);
}

export function exportExcel(currentHolidays) {
    const holiday = currentHolidays.find(h => h.id === window.activeHolidayId);
    if (!holiday) return;

    const data = (holiday.itinerary || []).map(item => ({
        Date: item.date,
        Time: item.time,
        Activity: item.activity,
        Location: item.location,
        Notes: item.notes
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Itinerary");
    XLSX.writeFile(wb, `${holiday.name.replace(/\s+/g, '_')}.xlsx`);
}

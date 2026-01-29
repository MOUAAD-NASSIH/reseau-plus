import * as XLSX from 'xlsx';
import { format } from 'date-fns';

interface PaymentExportData {
    status: string;
    missionTitle: string;
    workerName: string;
    workerSpeciality: string;
    date: string;
    amount: number;
    platformFee?: number;
}

/**
 * Format payment data for export
 */
export const formatPaymentDataForExport = (payments: any[]): PaymentExportData[] => {
    return payments.map(payment => {
        const assignment = payment.assignment || payment.missionAssignment;
        const mission = assignment?.mission;
        const worker = assignment?.worker;

        const isInitiated = payment.stripePaymentId !== null;
        let displayStatus = payment.status || 'N/A';
        if (displayStatus === 'PENDING' && isInitiated) {
            displayStatus = 'COMPLETED';
        }

        return {
            status: displayStatus,
            missionTitle: mission?.title || `Assignment #${payment.missionAssignmentId}`,
            workerName: worker
                ? `${worker.firstName} ${worker.lastName}`
                : 'N/A',
            workerSpeciality: worker?.speciality?.name || 'N/A',
            date: payment.paidAt
                ? format(new Date(payment.paidAt), 'dd/MM/yyyy')
                : payment.createdAt
                    ? format(new Date(payment.createdAt), 'dd/MM/yyyy')
                    : 'N/A',
            amount: payment.amountTotal || 0,
            platformFee: payment.platformFee || 0
        };
    });
};

/**
 * Export payments to Excel with professional formatting
 */
export const exportToExcel = (
    payments: any[],
    institutionName: string = 'Institution'
) => {
    const formattedData = formatPaymentDataForExport(payments);

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Prepare data for sheet
    const exportDate = format(new Date(), 'dd/MM/yyyy HH:mm');
    const totalAmount = formattedData.reduce((sum, p) => sum + p.amount, 0);
    const totalPlatformFee = formattedData.reduce((sum, p) => sum + (p.platformFee || 0), 0);

    // Create header rows - matching table structure
    const headerData = [
        [`Payment History - ${institutionName}`],
        [`Export Date: ${exportDate}`],
        [`Total Payments: ${formattedData.length}`],
        [], // Empty row
        ['Worker', 'Speciality', 'Mission', 'Status', 'Date', 'Amount (MAD)', 'Platform Fee (MAD)']
    ];

    // Add payment data
    const paymentRows = formattedData.map(p => [
        p.workerName,
        p.workerSpeciality,
        p.missionTitle,
        p.status,
        p.date,
        p.amount,
        p.platformFee || 0
    ]);

    // Add totals row
    const totalsRow = [
        '',
        '',
        '',
        '',
        'TOTAL:',
        totalAmount,
        totalPlatformFee
    ];

    // Combine all data
    const sheetData = [
        ...headerData,
        ...paymentRows,
        [], // Empty row before totals
        totalsRow
    ];

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Set column widths - optimized for new order
    ws['!cols'] = [
        { wch: 25 },  // Worker
        { wch: 25 },  // Speciality
        { wch: 35 },  // Mission
        { wch: 12 },  // Status
        { wch: 14 },  // Date
        { wch: 15 },  // Amount
        { wch: 18 }   // Platform Fee
    ];

    // Merge cells for title and metadata
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // Title row
        { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }, // Export date row
        { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } }  // Total payments row
    ];
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Payment History');

    // Generate filename
    const filename = `Payment_History_${format(new Date(), 'yyyy-MM-dd_HHmm')}.xlsx`;

    // Write file
    XLSX.writeFile(wb, filename);
};

/**
 * Export payments to CSV (simple fallback)
 */
export const exportToCSV = (
    payments: any[],
    institutionName: string = 'Institution'
) => {
    const formattedData = formatPaymentDataForExport(payments);

    // Create CSV content
    const headers = ['Status', 'Mission', 'Worker', 'Date', 'Amount (MAD)', 'Platform Fee (MAD)'];
    const rows = formattedData.map(p => [
        p.status,
        `"${p.missionTitle}"`, // Quote to handle commas in mission titles
        p.workerName,
        p.date,
        p.amount,
        p.platformFee || 0
    ]);

    const csvContent = [
        [`Payment History - ${institutionName}`],
        [`Export Date: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`],
        [],
        headers,
        ...rows,
        [],
        ['', '', '', 'TOTAL:',
            formattedData.reduce((sum, p) => sum + p.amount, 0),
            formattedData.reduce((sum, p) => sum + (p.platformFee || 0), 0)
        ]
    ].map(row => row.join(',')).join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `Payment_History_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Generate and print a colorful receipt for a single payment
 */
export const exportReceiptToPDF = (payment: any) => {
    const assignment = payment.assignment || payment.missionAssignment;
    const mission = assignment?.mission;
    const worker = assignment?.worker;

    const receiptNumber = `RCP-${payment.id.toString().padStart(6, '0')}`;
    const paymentDate = payment.paidAt
        ? format(new Date(payment.paidAt), 'dd MMMM yyyy')
        : format(new Date(payment.createdAt), 'dd MMMM yyyy');

    const workerAmount = payment.amountTotal - (payment.platformFee || 0);

    // Status color mapping
    const statusColors: Record<string, { bg: string; text: string; label: string }> = {
        COMPLETED: { bg: '#10b981', text: '#ffffff', label: 'Paid' },
        PENDING: { bg: '#f59e0b', text: '#ffffff', label: 'Pending' },
        FAILED: { bg: '#ef4444', text: '#ffffff', label: 'Failed' }
    };

    const isInitiated = payment.stripePaymentId !== null;
    const effectiveStatus = (payment.status === 'PENDING' && isInitiated) ? 'COMPLETED' : payment.status;
    const statusStyle = statusColors[effectiveStatus] || statusColors.PENDING;

    // Create receipt HTML matching app design system
    const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Receipt ${receiptNumber}</title>
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Spline+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                
                :root {
                    --primary: oklch(0.5273 0.1371 150.0693);
                    --foreground: oklch(0.2046 0 0);
                    --muted-foreground: oklch(0.2435 0 0);
                    --border: oklch(0.9037 0 0);
                    --card: oklch(0.9911 0 0);
                }
                
                body {
                    font-family: 'Outfit', sans-serif;
                    padding: 40px 20px;
                    background: #f8fafc;
                    color: var(--foreground);
                    line-height: 1.6;
                }
                
                .receipt-container {
                    max-width: 650px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0px 1px 3px 0px hsl(0 0% 0% / 0.17), 0px 4px 6px -1px hsl(0 0% 0% / 0.17);
                }
                
                .header {
                    background: white;
                    padding: 40px 40px 32px;
                    text-align: center;
                    border-bottom: 2px solid var(--primary);
                }
                
                .header h1 {
                    font-family: 'Spline Sans', sans-serif;
                    font-size: 42px;
                    font-weight: 700;
                    color: var(--foreground);
                    margin-bottom: 4px;
                    letter-spacing: -0.02em;
                }
                
                .header .subtitle {
                    font-size: 13px;
                    color: var(--muted-foreground);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    font-weight: 500;
                }
                
                .meta-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 0;
                    background: #fafafa;
                    border-bottom: 1px solid var(--border);
                }
                
                .meta-item {
                    padding: 20px;
                    text-align: center;
                    border-right: 1px solid var(--border);
                }
                
                .meta-item:last-child {
                    border-right: none;
                }
                
                .meta-label {
                    font-size: 10px;
                    color: var(--muted-foreground);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    font-weight: 600;
                    margin-bottom: 6px;
                }
                
                .meta-value {
                    font-size: 14px;
                    color: var(--foreground);
                    font-weight: 600;
                }
                
                .status-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.03em;
                }
                
                .content {
                    padding: 40px;
                }
                
                .section {
                    margin-bottom: 32px;
                }
                
                .section:last-child {
                    margin-bottom: 0;
                }
                
                .section-title {
                    font-family: 'Spline Sans', sans-serif;
                    font-size: 12px;
                    color: var(--primary);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    font-weight: 700;
                    margin-bottom: 16px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid var(--border);
                }
                
                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                }
                
                .info-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                
                .info-label {
                    font-size: 11px;
                    color: var(--muted-foreground);
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                
                .info-value {
                    font-size: 15px;
                    color: var(--foreground);
                    font-weight: 600;
                }
                
                .amount-box {
                    background: #f8faf9;
                    border: 2px solid var(--primary);
                    border-radius: 8px;
                    padding: 24px;
                }
                
                .amount-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 0;
                    font-size: 14px;
                    color: var(--foreground);
                    border-bottom: 1px dashed var(--border);
                }
                
                .amount-row:last-of-type {
                    border-bottom: none;
                }
                
                .amount-row.total {
                    border-top: 2px solid var(--primary);
                    margin-top: 12px;
                    padding-top: 16px;
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--primary);
                }
                
                .footer {
                    background: #fafafa;
                    padding: 24px 40px;
                    text-align: center;
                    border-top: 1px solid var(--border);
                }
                
                .footer .thank-you {
                    font-family: 'Spline Sans', sans-serif;
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--primary);
                    margin-bottom: 8px;
                }
                
                .footer p {
                    font-size: 12px;
                    color: var(--muted-foreground);
                    margin-bottom: 4px;
                }
                
                .footer .timestamp {
                    font-size: 10px;
                    color: var(--muted-foreground);
                    margin-top: 12px;
                    opacity: 0.7;
                }
                
                @media print {
                    body {
                        background: white;
                        padding: 0;
                    }
                    .receipt-container {
                        box-shadow: none;
                        max-width: 100%;
                    }
                }
            </style>
        </head>
        <body>
            <div class="receipt-container">
                <div class="header">
                    <h1>RÉSEAU+</h1>
                    <div class="subtitle">Payment Receipt</div>
                </div>
                <div class="meta-grid">
                    <div class="meta-item">
                        <div class="meta-label">Receipt Number</div>
                        <div class="meta-value">${receiptNumber}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Payment Date</div>
                        <div class="meta-value">${paymentDate}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Status</div>
                        <div class="meta-value">
                            <span class="status-badge" style="background: ${statusStyle.bg}; color: ${statusStyle.text};">
                                ${statusStyle.label}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="content">
                    <div class="section">
                        <div class="section-title">Payment Information</div>
                        <div class="info-grid">
                            <div class="info-item">
                                <div class="info-label">Worker</div>
                                <div class="info-value">${worker ? `${worker.firstName} ${worker.lastName}` : 'N/A'}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Speciality</div>
                                <div class="info-value">${worker?.speciality?.name || 'N/A'}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Mission</div>
                                <div class="info-value">${mission?.title || `Assignment #${payment.missionAssignmentId}`}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Assignment ID</div>
                                <div class="info-value">#${payment.missionAssignmentId}</div>
                            </div>
                        </div>
                    </div>
                    <div class="section">
                        <div class="section-title">Amount Breakdown</div>
                        <div class="amount-box">
                            <div class="amount-row">
                                <span>Worker Payment</span>
                                <span>${workerAmount.toLocaleString('fr-MA')} MAD</span>
                            </div>
                            ${payment.platformFee ? `
                            <div class="amount-row">
                                <span>Platform Fee</span>
                                <span>${payment.platformFee.toLocaleString('fr-MA')} MAD</span>
                            </div>
                            ` : ''}
                            <div class="amount-row total">
                                <span>Total Amount</span>
                                <span>${payment.amountTotal.toLocaleString('fr-MA')} MAD</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="footer">
                    <p class="thank-you">Thank You!</p>
                    <p>This is an official receipt from Réseau+</p>
                    <p>For any questions, please contact our support team</p>
                    <p class="timestamp">Generated on ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
                </div>
            </div>
        </body>
        </html>
    `;

    // Create a hidden iframe for printing to avoid opening a new tab
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(receiptHTML);
        iframeDoc.close();

        // Use a slight timeout to ensure styles are applied
        setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();

            // Clean up: remove the iframe after the print dialog is closed
            // (1 second delay is usually enough for the browser to handle the print)
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 1000);
        }, 500);
    }
};

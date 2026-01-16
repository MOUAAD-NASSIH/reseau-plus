import * as XLSX from 'xlsx';
import { format } from 'date-fns';

interface PaymentExportData {
    status: string;
    missionTitle: string;
    workerName: string;
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
    
    // Create header rows
    const headerData = [
        [`Payment History - ${institutionName}`],
        [`Export Date: ${exportDate}`],
        [], // Empty row
        ['Status', 'Mission', 'Worker', 'Date', 'Amount (MAD)', 'Platform Fee (MAD)']
    ];
    
    // Add payment data
    const paymentRows = formattedData.map(p => [
        p.status,
        p.missionTitle,
        p.workerName,
        p.date,
        p.amount,
        p.platformFee || 0
    ]);
    
    // Add totals row
    const totalsRow = [
        '',
        '',
        '',
        'TOTAL:',
        totalAmount,
        formattedData.reduce((sum, p) => sum + (p.platformFee || 0), 0)
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
    
    // Set column widths
    ws['!cols'] = [
        { wch: 12 },  // Status
        { wch: 35 },  // Mission
        { wch: 25 },  // Worker
        { wch: 12 },  // Date
        { wch: 15 },  // Amount
        { wch: 18 }   // Platform Fee
    ];
    
    // Merge cells for title
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // Title row
        { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }  // Export date row
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
    
    // Create receipt HTML with colorful design
    const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Receipt ${receiptNumber}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    padding: 40px;
                    background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
                    min-height: 100vh;
                }
                .receipt-container {
                    max-width: 800px; margin: 0 auto; background: white;
                    border-radius: 16px; overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                }
                .header {
                    background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
                    color: white; padding: 40px; text-align: center;
                }
                .header h1 {
                    font-size: 32px; font-weight: 700; margin-bottom: 8px; letter-spacing: 1px;
                }
                .header .subtitle { font-size: 18px; opacity: 0.9; font-weight: 300; }
                .receipt-info {
                    background: #f8fafc; padding: 30px 40px;
                    display: flex; justify-content: space-between; border-bottom: 3px solid #16a34a;
                }
                .receipt-info div { flex: 1; }
                .receipt-info .label {
                    font-size: 12px; color: #64748b; text-transform: uppercase;
                    font-weight: 600; letter-spacing: 0.5px; margin-bottom: 4px;
                }
                .receipt-info .value { font-size: 16px; color: #1e293b; font-weight: 600; }
                .content { padding: 40px; }
                .section { margin-bottom: 30px; }
                .section-title {
                    font-size: 14px; color: #16a34a; text-transform: uppercase;
                    font-weight: 700; letter-spacing: 1px; margin-bottom: 16px;
                    padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;
                }
                .detail-row {
                    display: flex; justify-content: space-between;
                    padding: 12px 0; border-bottom: 1px solid #f1f5f9;
                }
                .detail-row:last-child { border-bottom: none; }
                .detail-label { color: #64748b; font-size: 14px; font-weight: 500; }
                .detail-value { color: #1e293b; font-size: 14px; font-weight: 600; text-align: right; }
                .status-badge {
                    display: inline-block; padding: 6px 16px; border-radius: 20px;
                    font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
                }
                .amount-breakdown {
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                    border-radius: 12px; padding: 24px; margin-top: 20px;
                }
                .amount-row {
                    display: flex; justify-content: space-between; padding: 10px 0; font-size: 15px;
                }
                .amount-row.total {
                    border-top: 3px solid #16a34a; margin-top: 12px; padding-top: 16px;
                    font-size: 20px; font-weight: 700; color: #16a34a;
                }
                .footer {
                    background: #1e293b; color: white; padding: 30px 40px; text-align: center;
                }
                .footer p { margin-bottom: 8px; opacity: 0.9; }
                .footer .thank-you { font-size: 18px; font-weight: 600; margin-bottom: 12px; }
                @media print {
                    body { background: white; padding: 0; }
                    .receipt-container { box-shadow: none; max-width: 100%; }
                }
            </style>
        </head>
        <body>
            <div class="receipt-container">
                <div class="header">
                    <h1>RÉSEAU+</h1>
                    <div class="subtitle">Payment Receipt</div>
                </div>
                <div class="receipt-info">
                    <div>
                        <div class="label">Receipt Number</div>
                        <div class="value">${receiptNumber}</div>
                    </div>
                    <div>
                        <div class="label">Payment Date</div>
                        <div class="value">${paymentDate}</div>
                    </div>
                    <div>
                        <div class="label">Status</div>
                        <div class="value">
                            <span class="status-badge" style="background: ${statusStyle.bg}; color: ${statusStyle.text};">
                                ${statusStyle.label}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="content">
                    <div class="section">
                        <div class="section-title">Payment Details</div>
                        <div class="detail-row">
                            <span class="detail-label">Mission</span>
                            <span class="detail-value">${mission?.title || `Assignment #${payment.missionAssignmentId}`}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Worker</span>
                            <span class="detail-value">${worker ? `${worker.firstName} ${worker.lastName}` : 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Assignment ID</span>
                            <span class="detail-value">#${payment.missionAssignmentId}</span>
                        </div>
                    </div>
                    <div class="section">
                        <div class="section-title">Amount Breakdown</div>
                        <div class="amount-breakdown">
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
                    <p class="thank-you">Thank you for your payment!</p>
                    <p>This is an official receipt from Réseau+</p>
                    <p style="font-size: 12px; opacity: 0.7; margin-top: 16px;">
                        Generated on ${format(new Date(), 'dd/MM/yyyy HH:mm')}
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;
    
    // Open in new window and trigger print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(receiptHTML);
        printWindow.document.close();
        printWindow.onload = () => {
            setTimeout(() => printWindow.print(), 250);
        };
    }
};

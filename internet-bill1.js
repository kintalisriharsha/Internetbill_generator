document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const serviceInput = document.getElementById('Service');
    const billNumberInput = document.getElementById('billnumber');
    const invoiceNumberInput = document.getElementById('invoicenumber');
    const billingDateInput = document.getElementById('calander');
    const customerNameInput = document.getElementById('Customername');
    const amountInput = document.getElementById('Amount');
    const speedSelect = document.getElementById('speed');
    const PackageSelect = document.getElementById('Package');
    const PlanSelect = document.getElementById('plan');
    const CurrencySelect = document.getElementById('Curr');
    const InvoiceSelect = document.getElementById('invoicenumber');
    const InvoiceDescriptionSelect = document.getElementById('Description');
    const AddressInput = document.getElementById('Customeraddress');
    const ExecutiveAddressInput = document.getElementById('provider');
    const imageInput = document.getElementById('imageInput');
    const imageDisplay = document.getElementById('myImage');

    // Get preview elements
    const previewService = document.querySelector('.container1 p:nth-child(1)'); // For "Name:"
    const previewBillNumber = document.querySelector('.container1 p:nth-child(2)'); // For "Account No:"
    const previewInvoiceNumber = document.querySelector('.container1 p:nth-child(3)'); // For "Invoice No:"
    const previewCustomerName = document.querySelector('.container1 p:nth-child(4)'); // For "Customer Name:"
    const previewBillingDate = document.querySelector('.container1 p:nth-child(5)'); // For "Bill Date:"
    const previewAddress = document.querySelector('.container1 p:nth-child(6)');

    const previewOfficeAddress = document.querySelector('.officeaddress p:nth-child(1)');

    // Get table cells for updating
    const taxableAmountCell = document.querySelector('#tax-row td:nth-child(1)');
    const cgstRateCell = document.querySelector('#tax-row td:nth-child(2)');
    const cgstAmountCell = document.querySelector('#tax-row td:nth-child(3)');
    const sgstRateCell = document.querySelector('#tax-row td:nth-child(4)');
    const sgstAmountCell = document.querySelector('#tax-row td:nth-child(5)');
    const paymentReceivedCell = document.querySelector('#tax-row td:nth-child(6)');

    // CGST and SGST rates
    const cgstRate = 9;
    const sgstRate = 9;

    const planSpeedCell = document.querySelector('#plan-row td:nth-child(1)');
    const planPackageCell = document.querySelector('#plan-row td:nth-child(2)');
    const planPlanCell = document.querySelector('#plan-row td:nth-child(3)');
    const planAmountCell = document.querySelector('#plan-row td:nth-child(5)'); // Update this cell with original amount

    const invoiceNoCell = document.querySelector('#invoice-row td:nth-child(1)');
    const invoiceDescriptionCell = document.querySelector('#invoice-row td:nth-child(2)');
    const invoiceAmountCell = document.querySelector('#invoice-row td:nth-child(3)'); // Cell for amount incl. tax

    const planAccountCell = document.querySelector('#plan-details td:nth-child(2)')
    const planUserNameCell = document.querySelector('#plan-details td:nth-child(3)');

    const recieptAccountCell = document.querySelector('#reciept-details td:nth-child(2)');
    const recieptUserNameCell = document.querySelector('#reciept-details td:nth-child(3)');

    // Get acknowledgment slip cells
    const acknowledgementAccountNoCell = document.querySelector('#acknowledgement-slip td:nth-child(1)'); 
    const acknowledgementSubscriberNameCell = document.querySelector('#acknowledgement-slip td:nth-child(2)');
    const acknowledgementPaymentMethodCell = document.querySelector('#acknowledgement-slip td:nth-child(3)');
    const acknowledgementInvoiceNoCell = document.querySelector('#acknowledgement-slip td:nth-child(4)');

    // Function to update preview
    function updatePreview() {
        previewService.textContent = `Name: ${serviceInput.value}`;
        previewBillNumber.textContent = `Account No: ${billNumberInput.value}`;
        previewInvoiceNumber.textContent = `Invoice No: ${invoiceNumberInput.value}`;
        
        // Correcting the date format
        const rawBillingDate = billingDateInput.value;
        if (rawBillingDate) {
            const formattedDate = formatDate(rawBillingDate);
            previewBillingDate.textContent = `Bill Date: ${formattedDate}`;
        } else {
            previewBillingDate.textContent = `Bill Date: `;
        }

        previewCustomerName.textContent = `Customer Name: ${customerNameInput.value}`;
        previewAddress.textContent = `Address : ${AddressInput.value}`;
    }

    function updateOfficePreview(){
        previewOfficeAddress.textContent = `Registered office address : ${ExecutiveAddressInput.value}`;
    }

    function updatePlan(){
        planAccountCell.textContent = `Account :${billNumberInput.value}`;
        planUserNameCell.textContent = `User Name :${customerNameInput.value}`
    }

    function updateReciept(){
        recieptAccountCell.textContent = `Account :${billNumberInput.value}`
        recieptUserNameCell.textContent = `User Name :${customerNameInput.value}`
    }
    // Function to update tax details
    function updateTaxDetails() {
        const amount = parseFloat(amountInput.value) || 0; // Get the amount entered, default to 0 if empty

        const cgstAmount = (amount * cgstRate) / 100; // Calculate CGST
        const sgstAmount = (amount * sgstRate) / 100; // Calculate SGST
        const taxableAmount = amount - cgstAmount - sgstAmount; // Total taxable amount
        const totalPayment = amount; // Total amount after tax

        // Update the table cells with the calculated values
        taxableAmountCell.textContent = `₹${taxableAmount.toFixed(2)}`; // Total taxable amount
        cgstRateCell.textContent = `${cgstRate}%`;                // CGST rate
        cgstAmountCell.textContent = `₹${cgstAmount.toFixed(2)}`; // CGST amount
        sgstRateCell.textContent = `${sgstRate}%`;                // SGST rate
        sgstAmountCell.textContent = `₹${sgstAmount.toFixed(2)}`; // SGST amount
        paymentReceivedCell.textContent = `₹${totalPayment.toFixed(2)}`; // Total amount after tax

        planAmountCell.textContent = `₹${totalPayment.toFixed(2)}`; // Update the amount in the plan
        // Update invoice row amount cell
        invoiceAmountCell.textContent = `₹${totalPayment.toFixed(2)}`; // Amount incl. tax
    }

    function updateTable() {
        const selectedSpeed = speedSelect.value;
        planSpeedCell.textContent = selectedSpeed;
    }

    function updateTable1() {
        const selectedPackage = PackageSelect.value;
        planPackageCell.textContent = selectedPackage;
    }

    function updateTable2() {
        const selectedPlan = PlanSelect.value;
        // const originalAmount = parseFloat(amountInput.value) || 0; // Get the original amount
        planPlanCell.textContent = selectedPlan;
        
    }

    function updateTable3() {
        const selectedCurrency = CurrencySelect.value;
        // Update currency if necessary
    }

    function updateTable4(){
        const selectedInvoiceNo = InvoiceSelect.value;
        invoiceNoCell.textContent = selectedInvoiceNo;
    }

    function updateTable5() {
        const selectedInvoiceDescription = InvoiceDescriptionSelect.value;
        invoiceDescriptionCell.textContent = selectedInvoiceDescription;
    }

    function updateAcknowledgementSlip() {
        const accountNo = billNumberInput.value.trim();
        const subscriberName = customerNameInput.value.trim();
        const paymentMethod = document.getElementById('Payment').value.trim();
        const invoiceNo = invoiceNumberInput.value.trim();
    
        // Make sure all elements exist before trying to update them

        acknowledgementAccountNoCell.textContent = accountNo ? accountNo : 'N/A';
        
        acknowledgementSubscriberNameCell.textContent = subscriberName ? subscriberName : 'N/A';
        
        acknowledgementPaymentMethodCell.textContent = paymentMethod ? paymentMethod : 'N/A';
        
        acknowledgementInvoiceNoCell.textContent = invoiceNo ? invoiceNo : 'N/A';

    }
    

    function displayImage(event) {
        const file = event.target.files[0]; // Get the uploaded file
        if (file) {
            const reader = new FileReader(); // Create a FileReader to read the file
            reader.onload = function(e) {
                imageDisplay.src = e.target.result; // Set the image source to the uploaded file
                imageDisplay.style.display = 'block'; // Make sure the image is visible
            };
            reader.readAsDataURL(file); // Read the file as a data URL
        }
    }
    
    // Helper function to format date from YYYY-MM-DD to DD/MM/YYYY
    function formatDate(dateString) {
        const dateParts = dateString.split('-');
        if (dateParts.length === 3) {
            // Rearranging the parts: YYYY-MM-DD -> DD/MM/YYYY
            return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
        }
        return dateString; // In case of invalid date, return the original string
    }

    function downloadPdf(event) {
        event.preventDefault();
        console.log("Download button clicked");
    
        const containerElement = document.querySelector('.container .table-container');
        if (!containerElement) {
            console.error('Could not find .container .table-container element');
            return;
        }
    
        console.log("Generating PDF from element:", containerElement);
    
        const filenameInput = document.getElementById('filename');
        let filename = filenameInput.value.trim() || 'Internet Bill';
        if (!filename.toLowerCase().endsWith('.pdf')) {
            filename += '.pdf';
        }
    
        html2canvas(containerElement).then((canvas) => {
            console.log("Canvas created");
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
    
            const margin = 10;
            const imgWidth = pageWidth - (2 * margin);
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
            // Add image to PDF
            pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
    
            // Add outline
            pdf.outline.add(null, "Invoice", { pageNumber: 1 });
            pdf.outline.add(null, "Customer Details", { pageNumber: 1 });
            pdf.outline.add(null, "Bill Details", { pageNumber: 1 });
            pdf.outline.add(null, "Payment Summary", { pageNumber: 1 });
    
            // Add simple border
            pdf.setDrawColor(0);
            pdf.setLineWidth(0.5);
            pdf.rect(margin, margin, imgWidth, imgHeight);
    
            console.log("PDF created");
            pdf.save(filename);
            console.log("PDF saved");
        }).catch(error => {
            console.error('Error generating PDF:', error);
        });
    }
    
    // Attach event listener for download button
    const downloadButton = document.getElementById('download');
    if (downloadButton) {
        downloadButton.addEventListener('click', downloadPdf);
        console.log("Download event listener attached");
    } else {
        console.error('Download button not found');
    }

    // Attach event listeners for live updating
    serviceInput.addEventListener('input', updatePreview);
    billNumberInput.addEventListener('input', updatePreview);
    invoiceNumberInput.addEventListener('input', updatePreview);
    billingDateInput.addEventListener('input', updatePreview);
    customerNameInput.addEventListener('input', updatePreview);
    AddressInput.addEventListener('input', updatePreview);
    amountInput.addEventListener('input', updateTaxDetails);
    ExecutiveAddressInput.addEventListener('input', updateOfficePreview);
    speedSelect.addEventListener('change', updateTable);
    PackageSelect.addEventListener('change', updateTable1);
    PlanSelect.addEventListener('change', updateTable2);
    CurrencySelect.addEventListener('change', updateTable3);
    InvoiceSelect.addEventListener('change', updateTable4);
    InvoiceDescriptionSelect.addEventListener('change', updateTable5);
    billNumberInput.addEventListener('input',updatePlan);
    customerNameInput.addEventListener('input',updatePlan);
    billNumberInput.addEventListener('input',updateReciept);
    customerNameInput.addEventListener('input',updateReciept);
    imageInput.addEventListener('change', displayImage);
    billNumberInput.addEventListener('input',updateAcknowledgementSlip);
    customerNameInput.addEventListener('input',updateAcknowledgementSlip);
    document.getElementById('Payment').addEventListener('change', updateAcknowledgementSlip); // Add event listener for payment method
    invoiceNumberInput.addEventListener('input',updateAcknowledgementSlip);

    // Initialize on page load
    updateAcknowledgementSlip();
});

// document.addEventListener('DOMContentLoaded',function() {
//     function generateInvoiceNumber(){
//         const randomNumber = Math.floor(1000 + Math.random() * 9000);
//         return `IN${randomNumber}`;
//     }
//     const invoiceNumber = generateInvoiceNumber();

//     document.getElementById('generatedInvoiceNo').textContent = invoiceNumber;
//     document.getElementById('invoiceParagraph').textContent = `Invoice Number : ${invoiceNumber}`;
//     document.getElementById('invoiceTableData1').textContent = invoiceNumber; // First td
//     document.getElementById('invoiceTableData2').textContent = invoiceNumber; // Second td
// });
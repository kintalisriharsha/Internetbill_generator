/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import * as React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { useState, useEffect, useRef, ChangeEvent } from 'react';
import html2canvas from 'html2canvas';
import {jsPDF} from 'jspdf';
import { Dayjs } from 'dayjs';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { FaCalendarAlt } from 'react-icons/fa';
import CreatableSelect from 'react-select/creatable';
import 'app/InternetBillGenerator.css'

interface FormData {
  service: string;
  billNumber: string;
  invoiceNumber: string;
  billingDate: Dayjs | null;
  customerName: string;
  address: string;
  amount: string;
  speed: string;
  package: string;
  plan: string;
  currency: string;
  paymentMethod: string;
  description: string;
  customerAddress: string;
  logo: File | null;
  filename: string;
}

export default function InternetBillGenerator() {
  const [formData, setFormData] = useState<FormData>({
    service: '',
    billNumber: '',
    invoiceNumber: 'IN',
    billingDate: null,
    customerName: '',
    address: '',
    amount: '',
    speed: '',
    package: '',
    plan: '',
    currency: '',
    paymentMethod: '',
    description: '',
    customerAddress: '',
    logo: null,
    filename: 'Internet Bill',
  });

  const [previewData, setPreviewData] = useState({
    taxableAmount: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    totalPayment: 0,

  });

  const [calendarOpen, setCalendarOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    updateTaxDetails();
  }, [formData.amount]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, files } = e.target;
    if (type === 'file' && files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (date: Dayjs | null) => {
    setFormData((prev) => ({ ...prev, billingDate: date }));
    setCalendarOpen(false); // Close calendar after selecting date
  };

  const updateTaxDetails = () => {
    const amount = parseFloat(formData.amount) || 0;
    const cgstRate = 9;
    const sgstRate = 9;
    const cgstAmount = (amount * cgstRate) / 100;
    const sgstAmount = (amount * sgstRate) / 100;
    const taxableAmount = amount - cgstAmount - sgstAmount;
    const totalPayment = amount;

    setPreviewData({
      taxableAmount,
      cgstAmount,
      sgstAmount,
      totalPayment,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    downloadPdf();
  };
  
  const downloadPdf = () => {
    if (!previewRef.current) return;

    html2canvas(previewRef.current).then((canvas) => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      // Add company logo
      if (formData.logo) {
        const reader = new FileReader();
        reader.onload = function(event) {
          const logoData = event.target?.result as string;
          // Adjust the logo size and position as needed
          pdf.addImage(logoData, 'JPEG', pageWidth - 60, margin, 50, 25);
          
          // Continue with the rest of the PDF generation
          generatePDFContent(pdf, pageWidth, pageHeight, margin);
        };
        reader.readAsDataURL(formData.logo);
      } else {
        // If no logo, proceed with the rest of the PDF generation
        generatePDFContent(pdf, pageWidth, pageHeight, margin);
      }
    });
  };

  const generatePDFContent = (pdf: jsPDF, pageWidth: number, pageHeight: number, margin: number) => {
    pdf.setFont('helvetica');
    pdf.setFontSize(12);
    
    // Add company and customer details
    pdf.text(`Name: ${formData.service}`, margin, margin + 10);
    pdf.text(`Bill Number: ${formData.billNumber}`, margin, margin + 20);
    pdf.text(`Customer Name: ${formData.customerName}`, margin, margin + 30);
    pdf.text(`Bill Date: ${formData.billingDate?.format('DD-MM-YYYY')}`, margin, margin + 40);
    pdf.text(`Address: ${formData.address}`, margin, margin + 50);

    // Add tax details
    let yPos = margin + 70;

    // Table function
    const addTable = (headers: string[], data: (string | number)[][], startY: number): number => {
      const cellWidth = (pageWidth - 2 * margin) / headers.length;
      const cellHeight = 10;

      // Headers
      pdf.setTextColor(255,255,255);
      pdf.setFontSize(9);
      headers.forEach((header: string, index: number) => {
        pdf.setFillColor(0,0,0)
        pdf.rect(margin + index * cellWidth, startY, cellWidth, cellHeight, 'F');
        const xPos = margin + index * cellWidth + 2;
        const yPos = startY + cellHeight / 2 + 3;
        pdf.text(header, xPos, yPos);
      });

      // Data Rows
      pdf.setTextColor(0);
      data.forEach((row: (string | number)[], rowIndex: number) => {
        row.forEach((cell: string | number, cellIndex: number) => {
          pdf.rect(margin + cellIndex * cellWidth, startY + (rowIndex + 1) * cellHeight, cellWidth, cellHeight);
          const xPos = margin + cellIndex * cellWidth + 2;
          const yPos = startY + (rowIndex + 1) * cellHeight + cellHeight / 2 + 3;
          pdf.text(cell.toString(), xPos, yPos);
        });
      });

      return startY + (data.length + 1) * cellHeight;
    };

    yPos -= 10;

    const taxHeaders = ["Taxable Amount", "CGST Rate %", "CGST Amount", "SGST Rate %", "SGST Amount", "Total Payment"];
    const taxData = [
      [
        previewData.taxableAmount.toFixed(2),
        "9%",
        previewData.cgstAmount.toFixed(2),
        "9%",
        previewData.sgstAmount.toFixed(2),
        previewData.totalPayment.toFixed(2)
      ]
    ];

    yPos = addTable(taxHeaders, taxData, yPos);

    // Service Plan Summary
    yPos += 15;
    pdf.setFontSize(20);
    pdf.text("Service Plan Summary", margin, yPos);
    pdf.setFontSize(10);
    pdf.text(`Account No: ${formData.billNumber}`, margin + 80, yPos);
    pdf.text(`UserName: ${formData.customerName}`, margin + 120, yPos);
    yPos += 3;

    const planHeaders = ["Plan Speed", "Plan Package", "Plan Validity", "Discount", "Plan Amount"];
    const planData = [[formData.speed, formData.package, formData.plan, "0", formData.amount]];

    yPos = addTable(planHeaders, planData, yPos);

    // Receipt Details
    yPos += 15;
    pdf.setFontSize(20);
    pdf.text("Receipt Details", margin, yPos);
    pdf.setFontSize(10);
    pdf.text(`Account No: ${formData.billNumber}`, margin + 80, yPos);
    pdf.text(`UserName: ${formData.customerName}`, margin + 120, yPos);
    yPos += 3;

    const receiptHeaders = ["Invoice No:", "Internet Service Description", "Amount Incl. Tax"];
    const receiptData = [[formData.invoiceNumber, formData.description, formData.amount]];

    yPos = addTable(receiptHeaders, receiptData, yPos);

    // Registered office address
    yPos += 10;
    pdf.setFontSize(9);
    pdf.text(`Registered office address: ${formData.address}`, margin, yPos);

    // Terms and Conditions Section
    yPos += 20;
    pdf.setFont('Arial', 'bold');
    pdf.setFontSize(23);
    pdf.setTextColor(255, 0, 0);

    pdf.setTextColor(255, 99, 71);
    pdf.text("Terms and Conditions", pageWidth / 2, yPos, { align: "center" });

    pdf.setFont('Arial', 'normal');
    pdf.setTextColor(0);
    pdf.setFontSize(13);
    yPos += 15;

    pdf.text("1. Cheques to be in favour of ''.", margin + 7, yPos);
    yPos += 8;
    pdf.text("2. In case of cheque bounce, 100/- penalty will be applicable.", margin + 7, yPos);
    yPos += 8;
    pdf.text("3. Shall levy late fee charge in case the bill is paid after the due date.", margin + 7, yPos);
    yPos += 8;
    pdf.text("4. In case of overdue, the right to deactivate your services is reserved.", margin + 7, yPos);
    yPos += 8;
    pdf.text("5. This Invoice is system generated hence signature and stamp are not required.", margin + 7, yPos);

    pdf.setDrawColor(211, 211, 211);
    pdf.setLineWidth(0.75);
    pdf.roundedRect(margin, yPos - 5 * 10 - 8, pageWidth - margin * 2 + 0.5, 5 * 5 + 45, 5, 5);

    // Acknowledgment Slip
    yPos += 20;
    pdf.setFontSize(12);
    pdf.text("Acknowledgment Slip", pageWidth / 2, yPos, { align: "center" });
    yPos += 10;
    pdf.setFontSize(10);
    pdf.text(`Account No: ${formData.billNumber}`, margin, yPos);
    pdf.text(`Name: ${formData.customerName}`, margin + 100, yPos);
    yPos += 10;
    pdf.text(`Method: ${formData.paymentMethod}`, margin, yPos);
    pdf.text(`Invoice Number: ${formData.invoiceNumber}`, margin + 100, yPos);

    // Save the PDF
    let filename = formData.filename.trim() || 'Internet Bill';
    if (!filename.toLowerCase().endsWith('.pdf')) {
      filename += '.pdf';
    }
    pdf.save(filename);
  };
  const planOptions = [
    { value: '500 mbps', label: '500 mbps'},
    { value: '1 Gbps', label: '1 Gbps' },
  ];

  const packageOptions = [
    {value: 'limited', label: 'limited'},
    {value: 'Unlimited', label: 'Unlimited'}
  ];

  const tariffOptions = [
    {value: 'Monthly', label: 'Monthly'},
    {value: 'Quarterly', label: 'Quarterly'},
    {value: 'Yearly', label: 'Yearly'}
  ];

  const currencyDetails = [
    {value: 'currency1', label: <span>Indian Rupee - &#8377;</span>},
    {value: 'currency2', label: <span>U.S dollar - &#36;</span>},
    {value: 'currency3', label: <span>Kuwaiti Dinar - &#1603;&#46;&#1603;</span>},
    {value: 'currency4', label: <span>Bahraini Dinar - &#46;&#1603;&#46;&#1576;</span>},
    {value: 'currency5', label: <span>Euro - &#8364;</span>}
  ]

  const paymentDetails = [
    {value: 'Cash', label: 'Cash'},{value: 'Online', label: 'Online'},{value: 'Check', label:'Check'}
  ];

  const handleSelectChange = (selectedOption: any, actionMeta: any) => {
    const { name } = actionMeta;
    setFormData((prev) => ({ ...prev, [name]: selectedOption ? selectedOption.value : '' }));
  };
  
  
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 ">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-black mb-12">
          Internet Bill Generator
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-md rounded-lg p-8"
          >
            <div className="space-y-6">
              <fieldset className="border border-gray-300 p-4 rounded-md mb-6">
                <legend className="text-lg font-semibold text-black px-2">
                  Internet Provider Details
                </legend>
                <div>
                  <label
                    htmlFor="service"
                    className="block text-sm font-medium text-black"
                  >
                    Internet Service Provider Name
                  </label>
                  <input
                    type="text"
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    className="text-black mt-3 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Internet Service Provider Name, airtel, bsnl, jio, act etc"
                  />
                  <br />
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-black"
                  >
                    Internet Service Provider Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="text-black mt-3 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Internet Service Provider Address"
                  />
                  <br />
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-black"
                  >
                    Description
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="text-black mt-3 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Internet Description"
                  />
                  <br />
                  <label
                    htmlFor="billNumber"
                    className="block text-sm font-medium text-black"
                  >
                    Bill Number
                  </label>
                  <input
                    type="number"
                    id="billNumber"
                    name="billNumber"
                    value={formData.billNumber}
                    onChange={handleInputChange}
                    className="text-black mt-3 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Bill Account Number"
                  />
                  <br />
                  {/* Date Picker with Calendar Icon */}
                  <label
                    htmlFor="billingDate"
                    className="block text-sm font-medium text-black mb-3"
                  >
                    Billing Date
                  </label>
                  <TextField
                    variant="outlined"
                    fullWidth
                    name="billingDate"
                    size="small"
                    value={
                      formData.billingDate
                        ? formData.billingDate.format("DD-MM-YYYY")
                        : ""
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setCalendarOpen(!calendarOpen)}
                          >
                            <FaCalendarAlt />
                          </IconButton>
                        </InputAdornment>
                      ),
                      readOnly: true,
                    }}
                    placeholder="Select a date"
                  />

                  {calendarOpen && (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateCalendar
                        value={formData.billingDate}
                        onChange={handleDateChange}
                        disableFuture={true}
                      />
                    </LocalizationProvider>
                  )}
                </div>
              </fieldset>
              <fieldset className="border border-gray-300 p-4 rounded-md mb-6">
                <legend className="text-lg font-semibold text-black px-2">
                  Customer Details
                </legend>
                <label
                  htmlFor="customerName"
                  className="block text-sm font-medium text-black"
                >
                  Customer Name
                </label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  placeholder="Enter Customer Name"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="mt-3 text-black block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <br />
                <label
                  htmlFor="customerAddress"
                  className="block text-sm font-medium text-black"
                >
                  Address
                </label>
                <input
                  type="text"
                  id="customerAddress"
                  name="customerAddress"
                  placeholder="Enter Customer Address"
                  value={formData.customerAddress}
                  onChange={handleInputChange}
                  className="mt-3 text-black block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </fieldset>
              <fieldset className="border border-gray-300 p-4 rounded-md mb-6">
                <legend className="text-lg font-semibold text-black px-2">
                  Plan Details
                </legend>
                <label
                  htmlFor="speed"
                  className="mb-3 block text-sm font-medium text-black"
                >
                  Tariff Plan Speed
                </label>
                <CreatableSelect
                  name="speed"
                  isClearable
                  isSearchable
                  options={planOptions}
                  value={planOptions.find(
                    (option) => option.value === formData.speed
                  )}
                  onChange={handleSelectChange}
                  classNamePrefix="select"
                  className='text-black'
                />
                <br />
                <label
                  htmlFor="package"
                  className="mb-3 block text-sm font-medium text-black"
                >
                  Tariff Plan Package
                </label>
                <CreatableSelect
                  name="package"
                  isClearable
                  isSearchable
                  options={packageOptions}
                  value={packageOptions.find(
                    (option) => option.value === formData.package
                  )}
                  onChange={handleSelectChange}
                  classNamePrefix="select"
                  className='text-black'
                />
                <br />
                <label
                  htmlFor="plan"
                  className="mb-3 block text-sm font-medium text-black"
                >
                  Tariff Plan
                </label>
                <CreatableSelect
                  name="plan"
                  isClearable
                  isSearchable
                  options={tariffOptions}
                  value={tariffOptions.find(
                    (option) => option.value === formData.plan
                  )}
                  onChange={handleSelectChange}
                  classNamePrefix="select"
                  className='text-black'
                />
                <br />
              </fieldset>
              <fieldset className="border border-gray-300 p-4 rounded-md mb-6">
                <legend className="text-lg font-semibold text-black px-2">
                  Payment Details
                </legend>
                <label
                  htmlFor="currency"
                  className="mb-3 block text-sm font-medium text-black"
                >
                  Currency{" "}
                </label>
                <CreatableSelect
                  name="currency"
                  isClearable
                  isSearchable
                  options={currencyDetails}
                  value={currencyDetails.find(
                    (option) => option.value === formData.currency
                  )}
                  onChange={handleSelectChange}
                  classNamePrefix="select"
                  className='text-black'
                />
                <br />
                <label
                  htmlFor="paymentMethod"
                  className="mb-3 block text-sm font-medium text-black"
                >
                  Payment method
                </label>
                <CreatableSelect
                  name="paymentMethod"
                  isClearable
                  isSearchable
                  options={paymentDetails}
                  value={paymentDetails.find(
                    (option) => option.value === formData.paymentMethod
                  )}
                  onChange={handleSelectChange}
                  classNamePrefix="select"
                  className='text-black'
                />
                <br />
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-black"
                >
                  Total Plan Amount
                </label>
                <input
                  type="number"
                  placeholder="Plan Amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="mt-3 text-black block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </fieldset>
              <fieldset className="border border-gray-300 p-4 rounded-md mb-6">
                <legend className="text-lg font-semibold text-black px-2">
                  Logo Details
                </legend>
                <label
                  htmlFor="logo"
                  className="block text-sm font-medium text-black"
                >
                  Logo
                </label>
                <input
                  type="file"
                  placeholder="none"
                  name="logo"
                  id="logo"
                  onChange={handleInputChange}
                  className="mt-3 text-black block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </fieldset>
              <br />
              <fieldset className="border border-gray-300 p-4 rounded-md mb-6">
                <legend className="text-lg font-semibold text-black px-2">
                  File Details
                </legend>
                <label htmlFor="filename">Download File Name</label>
                <input
                  type="text"
                  placeholder="File Name"
                  name="filename"
                  id="filename"
                  value={formData.filename}
                  onChange={handleInputChange}
                  className="mt-3 text-black block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <br />
                <label htmlFor="invoiceNumber">Invoice Number</label>
                <input
                  type="text"
                  placeholder="Invoice Number"
                  name="invoiceNumber"
                  id="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleInputChange}
                  className="mt-3 block text-black w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </fieldset>
            </div>
            <button
              type="submit"
              className="mt-8 w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Generate and Download Bill
            </button>
          </form>

          <div
            ref={previewRef}
            className="bg-white shadow-md rounded-lg p-8 text-black"
          >
            <h2 className="text-2xl font-semibold text-black mb-6">
              Internet Bill Preview
            </h2>
            {/* Bill Preview Section */}
            <div className="flex justify-between items-start space-y-1 leading-none">
              <div>
                <p className="text-sm text-black">
                  <span className="text-gray-600 text-base">Name:</span>{" "}
                  {formData.service}
                </p>
                <p className="text-sm text-black">
                  <span className="text-gray-600 text-base">Bill Number:</span>{" "}
                  {formData.billNumber}
                </p>
                <p className="text-xs text-black">
                  <span className="text-gray-600 text-base">
                    Customer Name:
                  </span>{" "}
                  {formData.customerName}
                </p>
                <p className="text-sm text-black">
                  <span className="text-gray-600 text-base">Bill Date:</span>{" "}
                  {formData.billingDate
                    ? formData.billingDate.format("DD-MM-YYYY")
                    : ""}
                </p>
                <p className="text-sm text-black">
                  <span className="text-gray-600 text-base">Address:</span>{" "}
                  {formData.address}
                </p>
              </div>
              {formData.logo && (<img src={URL.createObjectURL(formData.logo)} alt="Company Logo" className="w-24 max-h-32 object-cover ml-2" />)}
              </div>
            <div ref={previewRef} className="mt-8">
              <h3 className="text-xl font-semibold text-black mb-4">
                Tax Details
              </h3>

              {/* Add overflow container for small screens */}
              <div className="mt-8 overflow-x-auto">
                <table className="min-w-full table-fixed divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-1/6 px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Taxable Amount
                      </th>
                      <th className="w-1/6 px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CGST Rate %
                      </th>
                      <th className="w-1/6 px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CGST Amount
                      </th>
                      <th className="w-1/6 px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SGST Rate %
                      </th>
                      <th className="w-1/6 px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SGST Amount
                      </th>
                      <th className="w-1/6 px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Payment
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {previewData.taxableAmount.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">9%</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {previewData.cgstAmount.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">9%</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {previewData.sgstAmount.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {previewData.totalPayment.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table className="mt-8 -mb-3 border-b-2 border-gray-200 w-full text-xs">
                  <tbody className="bg-gray-50">
                    <tr>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        <h1>Service Plan Summary</h1>
                      </td>
                      <td className="text-xs">
                        <p>Account No: {formData.billNumber}</p>
                      </td>
                      <td>
                        <p>UserName :{formData.customerName}</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table className="mt-3 min-w-full table-fixed divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-1/5 px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase">
                        Plan Speed
                      </th>
                      <th className="w-1/5 px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase">
                        Plan Package
                      </th>
                      <th className="w-1/5 px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase">
                        Plan Validity
                      </th>
                      <th className="w-1/5 px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase">
                        Discount
                      </th>
                      <th className="w-1/5 px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase">
                        Plan Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <p>{formData.speed}</p>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <p>{formData.package}</p>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <p>{formData.plan}</p>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">0</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <p>{formData.amount}</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table className="mt-8 -mb-3 border-b-2 border-gray-200 w-full text-xs">
                  <tbody className="bg-gray-50">
                    <tr>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        <h1>Reciept Details</h1>
                      </td>
                      <td>
                        <p>Account No: {formData.billNumber}</p>
                      </td>
                      <td>
                        <p>UserName :{formData.customerName}</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table className="mt-3 min-w-full table-fixed divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-1/5 px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase">
                        Invoice No:
                      </th>
                      <th className="w-1/5 px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase">
                        Internet Service Description
                      </th>
                      <th className="w-1/5 px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount Incl. Tax
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <p>{formData.invoiceNumber}</p>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <p>{formData.description}</p>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <p>{formData.amount}</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-left p-4 text-sm text-gray-500 ">
                  Registered office address : {formData.address}
                </p>
                <div className="border-2 mt-3 rounded-lg">
                  <h1 className="text-red-500 text-3xl text-center m-5">
                    Terms and Conditions
                  </h1>
                  <ol className="pr-8 pl-8 pb-6">
                    <li>1. Cheques to be in favour of &quot;&quot;.</li>
                    <li>
                      2. In case of cheque bounce, ₹ 100/- penalty will be
                      applicable.
                    </li>
                    <li>
                      3. Shall levy late fee charge in case the bill is paid
                      after the due date.
                    </li>
                    <li>
                      4. In case of overdue, the right to deactivate your
                      services is reserved.
                    </li>
                    <li>
                      5. This Invoice is system generated hence signature and
                      stamp are not required.
                    </li>
                  </ol>
                </div>
                <table className="mt-10 min-w-full table-fixed divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="w-full text-center px-3 py-1 text-xs font-medium text-gray-500 uppercase"
                        colSpan={3}
                      >
                        Acknowledgment Slip
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <p>Account No: {formData.billNumber}</p>
                      </td>
                      <td>
                        <p>Name :{formData.customerName}</p>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <p>Method :{formData.paymentMethod}</p>
                      </td>
                      <td>
                        <p>Invoice Number: {formData.invoiceNumber}</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

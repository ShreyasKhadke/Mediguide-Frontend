
import { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

export const usePDFExport = () => {
    const [isExporting, setIsExporting] = useState(false);

    const downloadPDF = async (elementRef: React.RefObject<HTMLElement>, filename: string = 'report.pdf') => {
        if (!elementRef.current) {
            toast.error("Nothing to export");
            return;
        }

        try {
            setIsExporting(true);
            const element = elementRef.current;

            // Capture the element as a canvas
            const canvas = await html2canvas(element, {
                scale: 2, // Higher scale for better quality
                useCORS: true, // Handle cross-origin images if any
                logging: false,
                backgroundColor: '#0a0a0a', // Use app background color (dark mode)
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight
            });

            // Convert canvas to image data
            const imgData = canvas.toDataURL('image/png');

            // PDF setup
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm

            // Calculate height while maintaining aspect ratio
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            // Add first page
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Add subsequent pages if content overflows
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Save the PDF
            pdf.save(filename);
            toast.success("PDF downloaded successfully");

        } catch (error) {
            console.error("PDF Export Error:", error);
            toast.error("Failed to export PDF");
        } finally {
            setIsExporting(false);
        }
    };

    return { downloadPDF, isExporting };
};

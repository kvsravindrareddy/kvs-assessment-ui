import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Common PDF Generator Utility
 * Professional worksheet generation with proper formatting
 */

const addHeader = (doc, title, subtitle = '') => {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(title, pageWidth / 2, 15, { align: 'center' });

  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(subtitle, pageWidth / 2, 22, { align: 'center' });
  }

  doc.setFontSize(9);
  doc.text(`Name: ${'_'.repeat(30)}     Date: ${'_'.repeat(20)}`, 15, 30);
  doc.setDrawColor(200);
  doc.line(15, 32, pageWidth - 15, 32);
};

const addFooter = (doc) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const totalPages = doc.internal.pages.length - 1;

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(
      `KiVO Learning © ${new Date().getFullYear()} - Page ${i}/${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.setTextColor(0);
  }
};

export const PDFGenerator = {
  /**
   * Generate Multiplication Tables with proper 2-column layout
   */
  generateMultiplicationTable(from, to, includeAnswers = false) {
    const doc = new jsPDF();
    addHeader(doc, `Multiplication Tables (${from} to ${to})`, includeAnswers ? 'ANSWER KEY' : 'Student Worksheet');

    let yPosition = 40;
    const leftMargin = 15;
    const columnWidth = 90;
    let currentPage = 1;

    for (let num = from; num <= to; num++) {
      const tablesOnPage = (num - from) % 2;
      const xPosition = leftMargin + (tablesOnPage * columnWidth);

      // New page after every 2 tables
      if (tablesOnPage === 0 && num > from) {
        doc.addPage();
        addHeader(doc, `Multiplication Tables (${from} to ${to})`, includeAnswers ? 'ANSWER KEY' : 'Student Worksheet');
        yPosition = 40;
        currentPage++;
      }

      // Reset Y for second column
      if (tablesOnPage === 1) {
        yPosition = 40;
      }

      // Table header with box
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.setFillColor(240, 240, 240);
      doc.rect(xPosition, yPosition, 80, 7, 'FD');
      doc.text(`Table of ${num}`, xPosition + 40, yPosition + 5, { align: 'center' });

      yPosition += 10;

      // Table rows
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');

      for (let i = 1; i <= 10; i++) {
        const result = num * i;
        const line = includeAnswers
          ? `${num} × ${String(i).padStart(2, ' ')} = ${String(result).padStart(4, ' ')}`
          : `${num} × ${String(i).padStart(2, ' ')} = _______`;

        doc.text(line, xPosition + 5, yPosition);
        yPosition += 5.5;
      }

      yPosition += 5;
    }

    addFooter(doc);
    return doc;
  },

  /**
   * Generate Addition/Subtraction/Multiplication/Division worksheets with table format
   */
  generateMathProblems(type, count, maxNumber, difficulty, includeAnswers = false) {
    const doc = new jsPDF();
    const title = `${type.charAt(0).toUpperCase() + type.slice(1)} Worksheet`;
    addHeader(doc, title, includeAnswers ? 'ANSWER KEY' : `${difficulty.toUpperCase()} Level`);

    const tableData = [];

    for (let i = 0; i < count; i++) {
      let num1, num2, result, operation;

      switch (type) {
        case 'addition':
          num1 = Math.floor(Math.random() * maxNumber) + 1;
          num2 = Math.floor(Math.random() * maxNumber) + 1;
          result = num1 + num2;
          operation = '+';
          break;
        case 'subtraction':
          num1 = Math.floor(Math.random() * maxNumber) + 1;
          num2 = Math.floor(Math.random() * num1) + 1;
          result = num1 - num2;
          operation = '-';
          break;
        case 'multiplication':
          num1 = Math.floor(Math.random() * Math.min(maxNumber, 12)) + 1;
          num2 = Math.floor(Math.random() * Math.min(maxNumber, 12)) + 1;
          result = num1 * num2;
          operation = '×';
          break;
        case 'division':
          num2 = Math.floor(Math.random() * 12) + 1;
          result = Math.floor(Math.random() * Math.min(maxNumber / num2, 12)) + 1;
          num1 = num2 * result;
          operation = '÷';
          break;
      }

      tableData.push([
        i + 1,
        `${num1} ${operation} ${num2}`,
        includeAnswers ? result : '_______'
      ]);
    }

    doc.autoTable({
      startY: 38,
      head: [['#', 'Problem', 'Answer']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [100, 150, 200], fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { halign: 'left', cellWidth: 80 },
        2: { halign: 'center', cellWidth: 60 }
      },
      styles: { fontSize: 11, cellPadding: 5 },
      margin: { left: 15, right: 15 }
    });

    addFooter(doc);
    return doc;
  },

  generateAdditionWorksheet(count, maxNumber, difficulty, includeAnswers = false) {
    return this.generateMathProblems('addition', count, maxNumber, difficulty, includeAnswers);
  },

  generateSubtractionWorksheet(count, maxNumber, difficulty, includeAnswers = false) {
    return this.generateMathProblems('subtraction', count, maxNumber, difficulty, includeAnswers);
  },

  generateMultiplicationWorksheet(count, maxMultiplier, difficulty, includeAnswers = false) {
    return this.generateMathProblems('multiplication', count, maxMultiplier, difficulty, includeAnswers);
  },

  generateDivisionWorksheet(count, maxDividend, difficulty, includeAnswers = false) {
    return this.generateMathProblems('division', count, maxDividend, difficulty, includeAnswers);
  },

  /**
   * Generate Number Writing worksheet with proper grid
   */
  generateNumberWritingWorksheet(from, to, percentage) {
    const doc = new jsPDF();
    addHeader(doc, `Number Writing Practice (${from} to ${to})`, `Fill in ${percentage}% of the missing numbers`);

    const tableData = [];
    let row = [];

    for (let num = from; num <= to; num++) {
      const shouldBlank = Math.random() * 100 < percentage;
      row.push(shouldBlank ? '' : num.toString());

      if (row.length === 10 || num === to) {
        // Pad the last row if needed
        while (row.length < 10) {
          row.push('');
        }
        tableData.push(row);
        row = [];
      }
    }

    doc.autoTable({
      startY: 38,
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 12,
        cellPadding: 8,
        halign: 'center',
        valign: 'middle',
        minCellHeight: 15
      },
      columnStyles: Array(10).fill({ cellWidth: 18 }).reduce((acc, style, i) => {
        acc[i] = style;
        return acc;
      }, {}),
      margin: { left: 15, right: 15 },
      didParseCell: function(data) {
        // Add light background to filled cells
        if (data.cell.raw !== '') {
          data.cell.styles.fillColor = [240, 240, 255];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    addFooter(doc);
    return doc;
  },

  /**
   * Generate Mixed Operations worksheet with table format
   */
  generateMixedOperationsWorksheet(count, maxNumber, difficulty, includeAnswers = false) {
    const doc = new jsPDF();
    addHeader(doc, 'Mixed Operations Worksheet', includeAnswers ? 'ANSWER KEY' : `${difficulty.toUpperCase()} Level`);

    const operations = ['+', '-', '×', '÷'];
    const tableData = [];

    for (let i = 0; i < count; i++) {
      const operation = operations[Math.floor(Math.random() * operations.length)];
      let num1, num2, result;

      switch (operation) {
        case '+':
          num1 = Math.floor(Math.random() * maxNumber) + 1;
          num2 = Math.floor(Math.random() * maxNumber) + 1;
          result = num1 + num2;
          break;
        case '-':
          num1 = Math.floor(Math.random() * maxNumber) + 1;
          num2 = Math.floor(Math.random() * num1) + 1;
          result = num1 - num2;
          break;
        case '×':
          num1 = Math.floor(Math.random() * 12) + 1;
          num2 = Math.floor(Math.random() * 12) + 1;
          result = num1 * num2;
          break;
        case '÷':
          num2 = Math.floor(Math.random() * 12) + 1;
          result = Math.floor(Math.random() * 12) + 1;
          num1 = num2 * result;
          break;
      }

      tableData.push([
        i + 1,
        `${num1} ${operation} ${num2}`,
        includeAnswers ? result : '_______'
      ]);
    }

    doc.autoTable({
      startY: 38,
      head: [['#', 'Problem', 'Answer']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [150, 100, 200], fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { halign: 'left', cellWidth: 80 },
        2: { halign: 'center', cellWidth: 60 }
      },
      styles: { fontSize: 11, cellPadding: 5 },
      margin: { left: 15, right: 15 }
    });

    addFooter(doc);
    return doc;
  },

  /**
   * Download PDF with given filename
   */
  downloadPDF(doc, filename) {
    doc.save(filename);
  },

  /**
   * Preview PDF in new tab
   */
  previewPDF(doc) {
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  },

  /**
   * Print PDF directly
   */
  printPDF(doc) {
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.onload = function() {
        printWindow.print();
      };
    }
  },

  /**
   * Generate Custom Question Worksheet from Backend Questions
   * Supports multiple choice questions with answer keys
   */
  generateCustomQuestionWorksheet(questions, options = {}) {
    const doc = new jsPDF();
    const {
      title = 'Worksheet',
      grade = '',
      difficulty = '',
      topic = '',
      includeAnswers = false,
      showDifficulty = false  // New option to control difficulty display
    } = options;

    // Header - build subtitle without difficulty
    let subtitle = [];
    if (grade) subtitle.push(`Grade: ${grade}`);
    if (showDifficulty && difficulty) subtitle.push(`Difficulty: ${difficulty}`);
    if (topic) subtitle.push(`Topic: ${topic}`);

    addHeader(
      doc,
      title,
      includeAnswers ? `ANSWER KEY | ${subtitle.join(' | ')}` : subtitle.join(' | ')
    );

    let yPosition = 40;
    const leftMargin = 15;
    const rightMargin = 195;
    const lineHeight = 6;
    const pageHeight = doc.internal.pageSize.getHeight();

    questions.forEach((question, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        addHeader(doc, title, includeAnswers ? `ANSWER KEY | ${subtitle.join(' | ')}` : subtitle.join(' | '));
        yPosition = 40;
      }

      // Question number and difficulty badge
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(`Q${index + 1}.`, leftMargin, yPosition);

      // Difficulty badge
      if (question.complexity) {
        doc.setFontSize(8);
        const complexityColor = {
          EASY: [34, 197, 94],
          MEDIUM: [234, 179, 8],
          COMPLEX: [239, 68, 68]
        };
        const color = complexityColor[question.complexity] || [156, 163, 175];
        doc.setFillColor(...color);
        doc.setTextColor(255, 255, 255);
        doc.roundedRect(rightMargin - 25, yPosition - 4, 25, 6, 1, 1, 'F');
        doc.text(question.complexity, rightMargin - 12.5, yPosition, { align: 'center' });
        doc.setTextColor(0, 0, 0);
      }

      yPosition += lineHeight;

      // Question text
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const questionText = question.question?.name || question.name || 'Question text not available';
      const splitQuestion = doc.splitTextToSize(questionText, rightMargin - leftMargin - 5);

      splitQuestion.forEach(line => {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          addHeader(doc, title, includeAnswers ? `ANSWER KEY | ${subtitle.join(' | ')}` : subtitle.join(' | '));
          yPosition = 40;
        }
        doc.text(line, leftMargin + 5, yPosition);
        yPosition += lineHeight;
      });

      yPosition += 2;

      // Options (if multiple choice)
      if (question.question?.options || question.options) {
        const options = question.question?.options || question.options;
        const correctAnswer = question.answer?.values || question.correctAnswerKeys || [];

        Object.entries(options).forEach(([key, value]) => {
          if (yPosition > pageHeight - 40) {
            doc.addPage();
            addHeader(doc, title, includeAnswers ? `ANSWER KEY | ${subtitle.join(' | ')}` : subtitle.join(' | '));
            yPosition = 40;
          }

          const isCorrect = includeAnswers && correctAnswer.includes(key);

          if (isCorrect) {
            doc.setFont(undefined, 'bold');
            doc.setFillColor(220, 252, 231);
            doc.rect(leftMargin + 5, yPosition - 4, rightMargin - leftMargin - 10, lineHeight, 'F');
          } else {
            doc.setFont(undefined, 'normal');
          }

          const optionText = `${key}) ${value}`;
          const splitOption = doc.splitTextToSize(optionText, rightMargin - leftMargin - 15);

          splitOption.forEach((line, idx) => {
            if (yPosition > pageHeight - 40) {
              doc.addPage();
              addHeader(doc, title, includeAnswers ? `ANSWER KEY | ${subtitle.join(' | ')}` : subtitle.join(' | '));
              yPosition = 40;
            }
            doc.text(line, leftMargin + 10, yPosition);
            yPosition += lineHeight;
          });

          doc.setFont(undefined, 'normal');
        });
      }

      // Answer section (if not showing answers)
      if (!includeAnswers) {
        yPosition += 2;
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          addHeader(doc, title, subtitle.join(' | '));
          yPosition = 40;
        }
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('Answer: _________________', leftMargin + 10, yPosition);
        doc.setTextColor(0, 0, 0);
        yPosition += lineHeight;
      }

      yPosition += 8; // Space between questions
    });

    // Add answer summary at the end if includeAnswers
    if (includeAnswers) {
      doc.addPage();
      addHeader(doc, 'Answer Key Summary', subtitle.join(' | '));
      yPosition = 40;

      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('Quick Reference:', leftMargin, yPosition);
      yPosition += lineHeight + 2;

      doc.setFont(undefined, 'normal');
      questions.forEach((question, index) => {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          addHeader(doc, 'Answer Key Summary', subtitle.join(' | '));
          yPosition = 40;
        }

        const correctAnswer = question.answer?.values || question.correctAnswerKeys || [];
        const answerText = correctAnswer.length > 0 ? correctAnswer.join(', ') : 'N/A';
        doc.text(`Q${index + 1}: ${answerText}`, leftMargin + 5, yPosition);
        yPosition += lineHeight;
      });
    }

    addFooter(doc);
    return doc;
  }
};

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

// Currency images storage (will be populated with real images)
let CURRENCY_IMAGES = {
  bills: {},
  coins: {}
};

export const PDFGenerator = {
  /**
   * Set currency images (loaded from external source)
   */
  setCurrencyImages(images) {
    if (images) {
      CURRENCY_IMAGES = images;
    }
  },
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
  },

  /**
   * Generate Simple Addition Worksheet (vertical format)
   */
  generateSimpleAdditionWorksheet(count, maxNumber, includeAnswers = false) {
    const doc = new jsPDF();
    addHeader(doc, 'Simple Addition', includeAnswers ? 'ANSWER KEY' : 'Student Worksheet');

    let yPosition = 40;
    const leftMargin = 20;
    const problemsPerRow = 4;
    const columnWidth = 45;
    const problemHeight = 25;

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');

    for (let i = 0; i < count; i++) {
      const a = Math.floor(Math.random() * maxNumber) + 1;
      const b = Math.floor(Math.random() * maxNumber) + 1;
      const answer = a + b;

      const column = i % problemsPerRow;
      const xPosition = leftMargin + (column * columnWidth);

      if (column === 0 && i > 0) {
        yPosition += problemHeight;
      }

      if (yPosition > 250) {
        doc.addPage();
        addHeader(doc, 'Simple Addition', includeAnswers ? 'ANSWER KEY' : 'Student Worksheet');
        yPosition = 40;
      }

      // Problem number
      doc.setFontSize(9);
      doc.text(`${i + 1}.`, xPosition, yPosition);

      // Vertical format
      doc.setFontSize(12);
      const aStr = String(a).padStart(4, ' ');
      const bStr = String(b).padStart(4, ' ');

      doc.text(aStr, xPosition + 15, yPosition + 3, { align: 'right' });
      doc.text(`+${bStr}`, xPosition + 15, yPosition + 8, { align: 'right' });
      doc.line(xPosition + 3, yPosition + 10, xPosition + 18, yPosition + 10);

      if (includeAnswers) {
        const ansStr = String(answer).padStart(4, ' ');
        doc.text(ansStr, xPosition + 15, yPosition + 15, { align: 'right' });
      }
    }

    addFooter(doc);
    return doc;
  },

  /**
   * Generate Simple Subtraction Worksheet (vertical format)
   */
  generateSimpleSubtractionWorksheet(count, maxNumber, includeAnswers = false) {
    const doc = new jsPDF();
    addHeader(doc, 'Simple Subtraction', includeAnswers ? 'ANSWER KEY' : 'Student Worksheet');

    let yPosition = 40;
    const leftMargin = 20;
    const problemsPerRow = 4;
    const columnWidth = 45;
    const problemHeight = 25;

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');

    for (let i = 0; i < count; i++) {
      let a = Math.floor(Math.random() * maxNumber) + 1;
      let b = Math.floor(Math.random() * maxNumber) + 1;

      // Ensure a >= b for positive results
      if (a < b) [a, b] = [b, a];

      const answer = a - b;

      const column = i % problemsPerRow;
      const xPosition = leftMargin + (column * columnWidth);

      if (column === 0 && i > 0) {
        yPosition += problemHeight;
      }

      if (yPosition > 250) {
        doc.addPage();
        addHeader(doc, 'Simple Subtraction', includeAnswers ? 'ANSWER KEY' : 'Student Worksheet');
        yPosition = 40;
      }

      // Problem number
      doc.setFontSize(9);
      doc.text(`${i + 1}.`, xPosition, yPosition);

      // Vertical format
      doc.setFontSize(12);
      const aStr = String(a).padStart(4, ' ');
      const bStr = String(b).padStart(4, ' ');

      doc.text(aStr, xPosition + 15, yPosition + 3, { align: 'right' });
      doc.text(`-${bStr}`, xPosition + 15, yPosition + 8, { align: 'right' });
      doc.line(xPosition + 3, yPosition + 10, xPosition + 18, yPosition + 10);

      if (includeAnswers) {
        const ansStr = String(answer).padStart(4, ' ');
        doc.text(ansStr, xPosition + 15, yPosition + 15, { align: 'right' });
      }
    }

    addFooter(doc);
    return doc;
  },

  /**
   * Generate Simple Multiplication Worksheet (vertical format)
   */
  generateSimpleMultiplicationWorksheet(count, maxNumber, includeAnswers = false) {
    const doc = new jsPDF();
    addHeader(doc, 'Simple Multiplication', includeAnswers ? 'ANSWER KEY' : 'Student Worksheet');

    let yPosition = 40;
    const leftMargin = 20;
    const problemsPerRow = 4;
    const columnWidth = 45;
    const problemHeight = 25;

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');

    for (let i = 0; i < count; i++) {
      const a = Math.floor(Math.random() * maxNumber) + 1;
      const b = Math.floor(Math.random() * maxNumber) + 1;
      const answer = a * b;

      const column = i % problemsPerRow;
      const xPosition = leftMargin + (column * columnWidth);

      if (column === 0 && i > 0) {
        yPosition += problemHeight;
      }

      if (yPosition > 250) {
        doc.addPage();
        addHeader(doc, 'Simple Multiplication', includeAnswers ? 'ANSWER KEY' : 'Student Worksheet');
        yPosition = 40;
      }

      // Problem number
      doc.setFontSize(9);
      doc.text(`${i + 1}.`, xPosition, yPosition);

      // Vertical format
      doc.setFontSize(12);
      const aStr = String(a).padStart(4, ' ');
      const bStr = String(b).padStart(4, ' ');

      doc.text(aStr, xPosition + 15, yPosition + 3, { align: 'right' });
      doc.text(`×${bStr}`, xPosition + 15, yPosition + 8, { align: 'right' });
      doc.line(xPosition + 3, yPosition + 10, xPosition + 18, yPosition + 10);

      if (includeAnswers) {
        const ansStr = String(answer).padStart(4, ' ');
        doc.text(ansStr, xPosition + 15, yPosition + 15, { align: 'right' });
      }
    }

    addFooter(doc);
    return doc;
  },

  /**
   * Generate Simple Division Worksheet (vertical format)
   */
  generateSimpleDivisionWorksheet(count, maxDividend, includeAnswers = false) {
    const doc = new jsPDF();
    addHeader(doc, 'Simple Division', includeAnswers ? 'ANSWER KEY' : 'Student Worksheet');

    let yPosition = 40;
    const leftMargin = 20;
    const problemsPerRow = 4;
    const columnWidth = 45;
    const problemHeight = 25;

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');

    for (let i = 0; i < count; i++) {
      const divisor = Math.floor(Math.random() * 10) + 2; // 2-11
      const quotient = Math.floor(Math.random() * (maxDividend / divisor)) + 1;
      const dividend = divisor * quotient; // Ensure even division

      const column = i % problemsPerRow;
      const xPosition = leftMargin + (column * columnWidth);

      if (column === 0 && i > 0) {
        yPosition += problemHeight;
      }

      if (yPosition > 250) {
        doc.addPage();
        addHeader(doc, 'Simple Division', includeAnswers ? 'ANSWER KEY' : 'Student Worksheet');
        yPosition = 40;
      }

      // Problem number
      doc.setFontSize(9);
      doc.text(`${i + 1}.`, xPosition, yPosition);

      // Vertical format (long division style)
      doc.setFontSize(12);
      const divisorStr = String(divisor);
      const dividendStr = String(dividend);

      // Long division bracket
      doc.text(divisorStr, xPosition + 5, yPosition + 8);
      doc.line(xPosition + 9, yPosition + 2, xPosition + 9, yPosition + 10);
      doc.line(xPosition + 9, yPosition + 2, xPosition + 18, yPosition + 2);
      doc.text(dividendStr, xPosition + 11, yPosition + 8);

      if (includeAnswers) {
        const ansStr = String(quotient);
        doc.text(ansStr, xPosition + 11, yPosition + 15);
        doc.line(xPosition + 11, yPosition + 10, xPosition + 18, yPosition + 10);
      }
    }

    addFooter(doc);
    return doc;
  },

  /**
   * Convert number to Roman numeral
   */
  toRoman(num) {
    const romanNumerals = [
      { value: 1000, symbol: 'M' },
      { value: 900, symbol: 'CM' },
      { value: 500, symbol: 'D' },
      { value: 400, symbol: 'CD' },
      { value: 100, symbol: 'C' },
      { value: 90, symbol: 'XC' },
      { value: 50, symbol: 'L' },
      { value: 40, symbol: 'XL' },
      { value: 10, symbol: 'X' },
      { value: 9, symbol: 'IX' },
      { value: 5, symbol: 'V' },
      { value: 4, symbol: 'IV' },
      { value: 1, symbol: 'I' }
    ];

    let result = '';
    for (const { value, symbol } of romanNumerals) {
      while (num >= value) {
        result += symbol;
        num -= value;
      }
    }
    return result;
  },

  /**
   * Generate Roman Numerals Basic Worksheet (I-X)
   */
  generateRomanNumeralsBasicWorksheet(count, includeAnswers = false) {
    const doc = new jsPDF();
    addHeader(doc, 'Roman Numerals (I - X)', includeAnswers ? 'ANSWER KEY' : 'Student Worksheet');

    let yPosition = 45;
    const leftMargin = 20;
    const problemsPerRow = 2;
    const columnWidth = 90;
    const lineHeight = 15;

    doc.setFontSize(11);
    doc.text('Convert the following numbers to Roman numerals:', leftMargin, 40);

    for (let i = 0; i < count; i++) {
      const num = Math.floor(Math.random() * 10) + 1; // 1-10
      const roman = this.toRoman(num);

      const column = i % problemsPerRow;
      const xPosition = leftMargin + (column * columnWidth);

      if (column === 0 && i > 0) {
        yPosition += lineHeight;
      }

      if (yPosition > 270) {
        doc.addPage();
        addHeader(doc, 'Roman Numerals (I - X)', includeAnswers ? 'ANSWER KEY' : 'Student Worksheet');
        yPosition = 45;
      }

      const problem = includeAnswers ? `${num} = ${roman}` : `${num} = _______`;
      doc.text(problem, xPosition, yPosition);
    }

    addFooter(doc);
    return doc;
  },

  /**
   * Generate Roman Numerals Advanced Worksheet (X-M)
   */
  generateRomanNumeralsAdvancedWorksheet(count, includeAnswers = false) {
    const doc = new jsPDF();
    addHeader(doc, 'Roman Numerals (X - M)', includeAnswers ? 'ANSWER KEY' : 'Student Worksheet');

    let yPosition = 45;
    const leftMargin = 20;
    const problemsPerRow = 2;
    const columnWidth = 90;
    const lineHeight = 15;

    doc.setFontSize(11);
    doc.text('Convert the following numbers to Roman numerals:', leftMargin, 40);

    for (let i = 0; i < count; i++) {
      const num = Math.floor(Math.random() * 991) + 10; // 10-1000
      const roman = this.toRoman(num);

      const column = i % problemsPerRow;
      const xPosition = leftMargin + (column * columnWidth);

      if (column === 0 && i > 0) {
        yPosition += lineHeight;
      }

      if (yPosition > 270) {
        doc.addPage();
        addHeader(doc, 'Roman Numerals (X - M)', includeAnswers ? 'ANSWER KEY' : 'Student Worksheet');
        yPosition = 45;
      }

      const problem = includeAnswers ? `${num} = ${roman}` : `${num} = ____________`;
      doc.text(problem, xPosition, yPosition);
    }

    addFooter(doc);
    return doc;
  },

  /**
   * Convert Roman numeral to number
   */
  fromRoman(roman) {
    const romanValues = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    let result = 0;

    for (let i = 0; i < roman.length; i++) {
      const current = romanValues[roman[i]];
      const next = romanValues[roman[i + 1]];

      if (next && current < next) {
        result -= current;
      } else {
        result += current;
      }
    }

    return result;
  },

  /**
   * Generate Roman to Arabic Conversion Worksheet
   */
  generateRomanToArabicWorksheet(count, maxNumber, includeAnswers = false) {
    const doc = new jsPDF();
    addHeader(doc, 'Roman Numerals to Numbers', includeAnswers ? 'ANSWER KEY' : 'Student Worksheet');

    let yPosition = 45;
    const leftMargin = 20;
    const problemsPerRow = 2;
    const columnWidth = 90;
    const lineHeight = 15;

    doc.setFontSize(11);
    doc.text('Convert the following Roman numerals to numbers:', leftMargin, 40);

    for (let i = 0; i < count; i++) {
      const num = Math.floor(Math.random() * maxNumber) + 1;
      const roman = this.toRoman(num);

      const column = i % problemsPerRow;
      const xPosition = leftMargin + (column * columnWidth);

      if (column === 0 && i > 0) {
        yPosition += lineHeight;
      }

      if (yPosition > 270) {
        doc.addPage();
        addHeader(doc, 'Roman Numerals to Numbers', includeAnswers ? 'ANSWER KEY' : 'Student Worksheet');
        yPosition = 45;
      }

      const problem = includeAnswers ? `${roman} = ${num}` : `${roman} = _______`;
      doc.text(problem, xPosition, yPosition);
    }

    addFooter(doc);
    return doc;
  },

  /**
   * Generate Arabic to Roman Conversion Worksheet
   */
  generateArabicToRomanWorksheet(count, maxNumber, includeAnswers = false) {
    const doc = new jsPDF();
    addHeader(doc, 'Numbers to Roman Numerals', includeAnswers ? 'ANSWER KEY' : 'Student Worksheet');

    let yPosition = 45;
    const leftMargin = 20;
    const problemsPerRow = 2;
    const columnWidth = 90;
    const lineHeight = 15;

    doc.setFontSize(11);
    doc.text('Convert the following numbers to Roman numerals:', leftMargin, 40);

    for (let i = 0; i < count; i++) {
      const num = Math.floor(Math.random() * maxNumber) + 1;
      const roman = this.toRoman(num);

      const column = i % problemsPerRow;
      const xPosition = leftMargin + (column * columnWidth);

      if (column === 0 && i > 0) {
        yPosition += lineHeight;
      }

      if (yPosition > 270) {
        doc.addPage();
        addHeader(doc, 'Numbers to Roman Numerals', includeAnswers ? 'ANSWER KEY' : 'Student Worksheet');
        yPosition = 45;
      }

      const problem = includeAnswers ? `${num} = ${roman}` : `${num} = ____________`;
      doc.text(problem, xPosition, yPosition);
    }

    addFooter(doc);
    return doc;
  },

  /**
   * Draw professional analog clock face
   */
  drawAnalogClock(doc, centerX, centerY, radius, hour, minute) {
    // Outer circle (clock frame)
    doc.setDrawColor(40, 40, 40);
    doc.setLineWidth(1);
    doc.circle(centerX, centerY, radius);

    // Inner circle (clock face)
    doc.setFillColor(255, 255, 255);
    doc.circle(centerX, centerY, radius - 0.5, 'F');

    // Draw all 12 numbers
    doc.setFontSize(7);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0);

    const numbers = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 - 90) * Math.PI / 180;
      const numberRadius = radius - 4;
      const x = centerX + numberRadius * Math.cos(angle);
      const y = centerY + numberRadius * Math.sin(angle);

      const num = numbers[i].toString();
      const offset = num.length === 2 ? 2 : 1;
      doc.text(num, x - offset, y + 2);
    }

    // Draw hour tick marks
    doc.setDrawColor(0);
    for (let i = 0; i < 60; i++) {
      const angle = (i * 6 - 90) * Math.PI / 180;
      const isHourMark = i % 5 === 0;
      const tickStart = radius - (isHourMark ? 3 : 1.5);
      const tickEnd = radius - 0.5;

      doc.setLineWidth(isHourMark ? 0.8 : 0.3);
      const x1 = centerX + tickStart * Math.cos(angle);
      const y1 = centerY + tickStart * Math.sin(angle);
      const x2 = centerX + tickEnd * Math.cos(angle);
      const y2 = centerY + tickEnd * Math.sin(angle);
      doc.line(x1, y1, x2, y2);
    }

    // Hour hand (thick, short)
    const hourAngle = ((hour % 12 + minute / 60) * 30 - 90) * Math.PI / 180;
    const hourLength = radius * 0.45;
    doc.setLineWidth(2);
    doc.setDrawColor(0);
    const hourX = centerX + hourLength * Math.cos(hourAngle);
    const hourY = centerY + hourLength * Math.sin(hourAngle);
    doc.line(centerX, centerY, hourX, hourY);

    // Minute hand (thin, long)
    const minuteAngle = (minute * 6 - 90) * Math.PI / 180;
    const minuteLength = radius * 0.65;
    doc.setLineWidth(1.2);
    const minX = centerX + minuteLength * Math.cos(minuteAngle);
    const minY = centerY + minuteLength * Math.sin(minuteAngle);
    doc.line(centerX, centerY, minX, minY);

    // Center circle
    doc.setFillColor(0);
    doc.circle(centerX, centerY, 1.2, 'F');

    doc.setFont(undefined, 'normal');
  },

  /**
   * Generate Professional Time & Clock Worksheet
   */
  generateTimeClockWorksheet(count, difficulty, includeAnswers = false) {
    const doc = new jsPDF();
    addHeader(doc, 'Time & Clock Reading', includeAnswers ? 'ANSWER KEY' : 'Student Worksheet');

    let yPosition = 48;
    const leftMargin = 15;
    const clockRadius = 18;
    const problemsPerRow = 3;
    const colWidth = 62;
    const rowHeight = 60;

    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Read each clock and write the time below:', leftMargin, 42);
    doc.setFont(undefined, 'normal');

    for (let i = 0; i < count; i++) {
      const column = i % problemsPerRow;
      const row = Math.floor(i / problemsPerRow);
      const xPosition = leftMargin + (column * colWidth);
      const yPos = yPosition + (row * rowHeight);

      // Check page break
      if (yPos > 240) {
        doc.addPage();
        addHeader(doc, '🕐 Time & Clock Reading', includeAnswers ? 'ANSWER KEY' : 'Student Worksheet');
        yPosition = 48;
        const newRow = 0;
        const newYPos = yPosition + (newRow * rowHeight);
      }

      const actualY = yPos > 240 ? yPosition : yPos;

      // Problem number with box
      doc.setFontSize(8);
      doc.setFillColor(240, 240, 240);
      doc.rect(xPosition, actualY, 8, 6, 'F');
      doc.setFont(undefined, 'bold');
      doc.text(`${i + 1}`, xPosition + 2, actualY + 4);
      doc.setFont(undefined, 'normal');

      // Generate time
      const hour = Math.floor(Math.random() * 12) + 1;
      const minute = difficulty === 'easy'
        ? [0, 15, 30, 45][Math.floor(Math.random() * 4)]
        : (Math.floor(Math.random() * 12) * 5); // 5-minute intervals for medium
      const period = Math.random() > 0.5 ? 'AM' : 'PM';

      // Draw professional clock
      const clockCenterX = xPosition + 28;
      const clockCenterY = actualY + 25;
      this.drawAnalogClock(doc, clockCenterX, clockCenterY, clockRadius, hour, minute);

      // Answer box
      doc.setDrawColor(200);
      doc.setLineWidth(0.3);
      doc.rect(xPosition + 5, actualY + 48, 46, 7);

      doc.setFontSize(9);
      if (includeAnswers) {
        const timeStr = `${hour}:${String(minute).padStart(2, '0')} ${period}`;
        doc.setFont(undefined, 'bold');
        doc.text(timeStr, xPosition + 17, actualY + 53);
        doc.setFont(undefined, 'normal');
      } else {
        doc.setTextColor(150);
        doc.text('___:___ ___', xPosition + 15, actualY + 53);
        doc.setTextColor(0);
      }
    }

    addFooter(doc);
    return doc;
  },

  /**
   * Draw realistic US coin with proper details
   */
  drawCoin(doc, x, y, value) {
    // Coin sizes (in mm)
    const sizes = {
      1.00: 6.5,   // Dollar coin (largest)
      0.25: 6,     // Quarter
      0.10: 4.5,   // Dime (smallest)
      0.05: 5.5,   // Nickel
      0.01: 5      // Penny
    };

    const radius = sizes[value] || 5;
    const isGold = value === 1.00 || value === 0.01; // Dollar and penny are golden
    const isSilver = value === 0.25 || value === 0.10 || value === 0.05;

    // 3D Shadow
    doc.setFillColor(100, 100, 100);
    doc.circle(x + 0.5, y + 0.5, radius, 'F');

    // Coin edge (darker outer ring)
    if (isGold) {
      doc.setFillColor(150, 120, 50);
    } else {
      doc.setFillColor(160, 160, 160);
    }
    doc.circle(x, y, radius, 'F');

    // Coin face
    if (isGold) {
      doc.setFillColor(218, 165, 32); // Gold
    } else {
      doc.setFillColor(220, 220, 220); // Silver
    }
    doc.circle(x, y, radius - 0.4, 'F');

    // Outer circle border
    doc.setDrawColor(100, 80, 40);
    doc.setLineWidth(0.6);
    doc.circle(x, y, radius);

    // Inner circle (raised edge effect)
    doc.setLineWidth(0.3);
    doc.circle(x, y, radius - 1);

    // Text and details based on denomination
    doc.setTextColor(80, 60, 30);
    doc.setFont(undefined, 'bold');

    if (value === 1.00) {
      doc.setFontSize(8);
      doc.text('$1', x - 2, y + 1);
      doc.setFontSize(4);
      doc.text('LIBERTY', x - 3, y - 2);
    } else if (value === 0.25) {
      doc.setFontSize(7);
      doc.text('25', x - 2, y + 1);
      doc.setFontSize(3.5);
      doc.text('QUARTER', x - 3.5, y + 4);
      doc.text('DOLLAR', x - 3, y - 2.5);
    } else if (value === 0.10) {
      doc.setFontSize(6);
      doc.text('10', x - 1.5, y + 1);
      doc.setFontSize(3);
      doc.text('DIME', x - 2, y - 2);
    } else if (value === 0.05) {
      doc.setFontSize(6.5);
      doc.text('5', x - 1, y + 1);
      doc.setFontSize(3);
      doc.text('NICKEL', x - 2.5, y + 3.5);
    } else if (value === 0.01) {
      doc.setFontSize(6);
      doc.text('1', x - 0.8, y + 1);
      doc.setFontSize(3);
      doc.text('CENT', x - 2, y - 2);
    }

    // Small stars decoration
    doc.setFontSize(3);
    doc.text('*', x - radius + 1, y);
    doc.text('*', x + radius - 2, y);

    doc.setFont(undefined, 'normal');
    doc.setTextColor(0);
  },

  /**
   * Draw real US dollar bill image
   */
  drawRealBill(doc, x, y, value, width, height) {
    try {
      // Find closest bill denomination
      let billValue = value >= 20 ? 20 : value >= 10 ? 10 : value >= 5 ? 5 : 1;

      // Try to use real currency image if available
      if (CURRENCY_IMAGES.bills && CURRENCY_IMAGES.bills[billValue]) {
        doc.addImage(CURRENCY_IMAGES.bills[billValue], 'PNG', x, y, width, height);
        return true;
      }
    } catch (error) {
      console.log('Real bill image not available, using drawn version');
    }

    // Fallback to drawn version
    this.drawBill(doc, x, y, value);
    return false;
  },

  /**
   * Draw real US coin image
   */
  drawRealCoin(doc, x, y, value, radius) {
    try {
      // Map value to coin name
      const coinMap = {
        1.00: 'dollar',
        0.25: 'quarter',
        0.10: 'dime',
        0.05: 'nickel',
        0.01: 'penny'
      };

      const coinName = coinMap[value];

      // Try to use real coin image if available
      if (coinName && CURRENCY_IMAGES.coins && CURRENCY_IMAGES.coins[coinName]) {
        const size = radius * 2;
        doc.addImage(CURRENCY_IMAGES.coins[coinName], 'PNG', x - radius, y - radius, size, size);
        return true;
      }
    } catch (error) {
      console.log('Real coin image not available, using drawn version');
    }

    // Fallback to drawn version
    this.drawCoin(doc, x, y, value);
    return false;
  },

  /**
   * Draw realistic US dollar bill (drawn version - fallback)
   */
  drawBill(doc, x, y, value) {
    const width = 32;
    const height = 14;

    // Shadow effect
    doc.setFillColor(80, 80, 80);
    doc.rect(x + 1, y + 1, width, height, 'F');

    // Bill background (greenish)
    const gradient = value >= 20 ? [180, 210, 180] :
                     value >= 10 ? [190, 220, 190] :
                     value >= 5 ? [195, 225, 195] : [200, 230, 200];
    doc.setFillColor(gradient[0], gradient[1], gradient[2]);
    doc.rect(x, y, width, height, 'F');

    // Outer border (dark green)
    doc.setDrawColor(40, 80, 40);
    doc.setLineWidth(1);
    doc.rect(x, y, width, height);

    // Inner decorative border
    doc.setDrawColor(60, 100, 60);
    doc.setLineWidth(0.4);
    doc.rect(x + 1.5, y + 1.5, width - 3, height - 3);

    // Serial number strip (top)
    doc.setFillColor(150, 180, 150);
    doc.rect(x + 2, y + 2, width - 4, 2, 'F');

    // Portrait circle (left side)
    doc.setFillColor(220, 240, 220);
    doc.circle(x + 8, y + height/2, 3.5, 'F');
    doc.setDrawColor(60, 100, 60);
    doc.setLineWidth(0.5);
    doc.circle(x + 8, y + height/2, 3.5);

    // Portrait initial
    doc.setFontSize(6);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(40, 80, 40);
    const initial = value === 1 ? 'W' : value === 5 ? 'L' : value === 10 ? 'H' : value === 20 ? 'J' : '$';
    doc.text(initial, x + 7, y + height/2 + 1.5);

    // Large denomination number (center)
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(30, 70, 30);
    const valueStr = value.toString();
    doc.text(valueStr, x + width/2 - (valueStr.length * 2), y + height/2 + 2);

    // Corner denomination boxes
    doc.setFontSize(7);
    doc.setFont(undefined, 'bold');
    doc.text(valueStr, x + 2, y + 5);
    doc.text(valueStr, x + width - 5, y + height - 2);

    // "UNITED STATES" text
    doc.setFontSize(4);
    doc.setFont(undefined, 'normal');
    doc.text('UNITED STATES', x + 14, y + 5);

    // "NOTE" text
    doc.setFontSize(5);
    doc.setFont(undefined, 'bold');
    doc.text('NOTE', x + width/2 - 3, y + height - 2);

    // Federal Reserve seal (right side)
    doc.setDrawColor(40, 80, 40);
    doc.setLineWidth(0.5);
    doc.circle(x + width - 7, y + height/2, 3, 'S');

    doc.setFont(undefined, 'normal');
    doc.setTextColor(0);
  },

  /**
   * Draw money representation with real images (coins or bills)
   */
  drawMoneyVisual(doc, x, y, amount) {
    const coins = [
      { value: 1.00, label: '$1' },
      { value: 0.25, label: '25¢' },
      { value: 0.10, label: '10¢' },
      { value: 0.05, label: '5¢' },
      { value: 0.01, label: '1¢' }
    ];

    let remaining = amount;
    let xOffset = x;

    if (amount >= 1) {
      // Draw bills for dollars
      const dollars = Math.floor(amount);
      if (dollars >= 5) {
        // Use real bill image
        this.drawRealBill(doc, xOffset, y, dollars >= 20 ? 20 : dollars >= 10 ? 10 : dollars >= 5 ? 5 : 1, 28, 12);
        xOffset += 32;
        remaining = amount - dollars;
      } else {
        for (let i = 0; i < Math.min(dollars, 3); i++) {
          // Use real coin image for dollar coins
          this.drawRealCoin(doc, xOffset + 6, y + 6, 1.00, 6.5);
          xOffset += 12;
        }
        remaining = amount - dollars;
      }
    }

    // Draw coins for cents
    if (remaining > 0 && xOffset < x + 50) {
      const cents = Math.round(remaining * 100);
      for (const coin of coins) {
        if (coin.value < 1) {
          const coinValue = coin.value * 100;
          const count = Math.floor((cents % 100) / coinValue);
          if (count > 0 && xOffset < x + 50) {
            // Use real coin image
            const coinSizes = { 0.25: 6, 0.10: 4.5, 0.05: 5.5, 0.01: 5 };
            this.drawRealCoin(doc, xOffset + 5, y + 6, coin.value, coinSizes[coin.value]);
            xOffset += 10;
            if (count > 1) {
              doc.setFontSize(6);
              doc.text(`x${count}`, xOffset - 8, y);
            }
            break;
          }
        }
      }
    }
  },

  /**
   * Generate Professional Money & Currency Worksheet
   */
  generateMoneyCurrencyWorksheet(count, difficulty, includeAnswers = false) {
    const doc = new jsPDF();
    addHeader(doc, 'Money & Currency', includeAnswers ? 'ANSWER KEY' : 'Student Worksheet');

    let yPosition = 48;
    const leftMargin = 15;
    const rowHeight = 45;

    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Count the money and solve the problems:', leftMargin, 42);
    doc.setFont(undefined, 'normal');

    for (let i = 0; i < count; i++) {
      if (yPosition > 235) {
        doc.addPage();
        addHeader(doc, '💰 Money & Currency', includeAnswers ? 'ANSWER KEY' : 'Student Worksheet');
        yPosition = 48;
      }

      const maxAmount = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 20 : 50;
      const amt1 = parseFloat((Math.random() * maxAmount + 0.25).toFixed(2));
      const amt2 = parseFloat((Math.random() * maxAmount + 0.25).toFixed(2));
      const operation = Math.random() > 0.5 ? 'add' : 'subtract';

      // Problem number box
      doc.setFontSize(8);
      doc.setFillColor(240, 240, 240);
      doc.rect(leftMargin, yPosition, 8, 6, 'F');
      doc.setFont(undefined, 'bold');
      doc.text(`${i + 1}`, leftMargin + 2, yPosition + 4);
      doc.setFont(undefined, 'normal');

      // Draw first amount with visual
      this.drawMoneyVisual(doc, leftMargin + 12, yPosition + 2, amt1);
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(`$${amt1.toFixed(2)}`, leftMargin + 12, yPosition + 22);

      // Operation symbol
      doc.setFontSize(14);
      doc.text(operation === 'add' ? '+' : '-', leftMargin + 72, yPosition + 20);

      // Draw second amount with visual
      this.drawMoneyVisual(doc, leftMargin + 85, yPosition + 2, amt2);
      doc.setFontSize(11);
      doc.text(`$${amt2.toFixed(2)}`, leftMargin + 85, yPosition + 22);

      // Equals sign
      doc.setFontSize(14);
      doc.text('=', leftMargin + 145, yPosition + 20);

      // Answer box
      doc.setDrawColor(100);
      doc.setLineWidth(0.5);
      doc.rect(leftMargin + 157, yPosition + 12, 30, 10);

      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      if (includeAnswers) {
        const answer = operation === 'add'
          ? (amt1 + amt2).toFixed(2)
          : (Math.max(amt1, amt2) - Math.min(amt1, amt2)).toFixed(2);
        doc.text(`$${answer}`, leftMargin + 162, yPosition + 20);
      } else {
        doc.setTextColor(150);
        doc.text('$___.__', leftMargin + 160, yPosition + 20);
        doc.setTextColor(0);
      }

      doc.setFont(undefined, 'normal');
      yPosition += rowHeight;
    }

    addFooter(doc);
    return doc;
  },

  /**
   * Draw professional ruler with accurate markings
   */
  drawProfessionalRuler(doc, x, y, lengthCm, actualValue, unit) {
    const pixelsPerCm = 6;
    const rulerWidth = lengthCm * pixelsPerCm;
    const rulerHeight = 12;

    // Ruler shadow
    doc.setFillColor(150, 150, 150);
    doc.rect(x + 0.5, y + 0.5, rulerWidth, rulerHeight, 'F');

    // Ruler body (wood texture)
    doc.setFillColor(245, 222, 179);
    doc.rect(x, y, rulerWidth, rulerHeight, 'F');

    // Border
    doc.setDrawColor(139, 90, 43);
    doc.setLineWidth(0.5);
    doc.rect(x, y, rulerWidth, rulerHeight);

    // Draw cm markings
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);

    for (let i = 0; i <= lengthCm; i++) {
      const markX = x + (i * pixelsPerCm);

      // Major marks (cm)
      doc.setLineWidth(0.5);
      doc.line(markX, y, markX, y + 8);

      // Numbers
      doc.setFontSize(6);
      doc.setFont(undefined, 'bold');
      doc.text(String(i), markX - 1.5, y + rulerHeight - 1);

      // Minor marks (mm)
      if (i < lengthCm) {
        doc.setLineWidth(0.2);
        for (let j = 1; j < 10; j++) {
          const mmX = markX + (j * pixelsPerCm / 10);
          const mmHeight = j === 5 ? 5 : 3;
          doc.line(mmX, y, mmX, y + mmHeight);
        }
      }
    }

    // Draw measurement line with arrow
    const measureLineY = y + rulerHeight + 5;
    doc.setDrawColor(255, 0, 0);
    doc.setLineWidth(0.8);
    doc.line(x, measureLineY, x + (actualValue * pixelsPerCm), measureLineY);

    // Arrows
    doc.line(x, measureLineY, x + 2, measureLineY - 1);
    doc.line(x, measureLineY, x + 2, measureLineY + 1);
    doc.line(x + (actualValue * pixelsPerCm), measureLineY, x + (actualValue * pixelsPerCm) - 2, measureLineY - 1);
    doc.line(x + (actualValue * pixelsPerCm), measureLineY, x + (actualValue * pixelsPerCm) - 2, measureLineY + 1);

    // Measurement label
    doc.setFontSize(8);
    doc.setTextColor(255, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text(`${actualValue} ${unit}`, x + (actualValue * pixelsPerCm / 2) - 4, measureLineY + 5);

    doc.setTextColor(0);
    doc.setFont(undefined, 'normal');
    doc.setDrawColor(0);
  },

  /**
   * Draw scale/balance for weight
   */
  drawScale(doc, x, y, weight, unit) {
    // Scale platform
    doc.setFillColor(200, 200, 200);
    doc.rect(x, y + 10, 25, 3, 'F');

    // Scale body
    doc.setFillColor(220, 220, 220);
    doc.rect(x + 8, y + 13, 9, 8, 'F');

    // Digital display
    doc.setFillColor(50, 50, 50);
    doc.rect(x + 9, y + 15, 7, 4, 'F');

    // Weight reading
    doc.setFontSize(7);
    doc.setTextColor(0, 255, 0);
    doc.setFont(undefined, 'bold');
    doc.text(`${weight}`, x + 10, y + 18);
    doc.setTextColor(0);
    doc.setFont(undefined, 'normal');

    // Unit label
    doc.setFontSize(6);
    doc.text(unit, x + 10, y + 23);
  },

  /**
   * Draw measuring cup for volume
   */
  drawMeasuringCup(doc, x, y, volume, unit) {
    // Cup outline
    doc.setDrawColor(100);
    doc.setLineWidth(0.8);
    doc.line(x, y, x + 2, y + 15);
    doc.line(x + 18, y, x + 16, y + 15);
    doc.line(x + 2, y + 15, x + 16, y + 15);

    // Liquid
    const fillPercent = Math.min(volume / 1000, 1);
    const fillHeight = fillPercent * 15;
    doc.setFillColor(135, 206, 235);
    doc.rect(x + 2, y + 15 - fillHeight, 14, fillHeight, 'F');

    // Measurement lines
    doc.setDrawColor(150);
    doc.setLineWidth(0.2);
    for (let i = 1; i <= 4; i++) {
      const lineY = y + (i * 3);
      doc.line(x + 3, lineY, x + 15, lineY);
    }

    // Volume label
    doc.setFontSize(7);
    doc.setFont(undefined, 'bold');
    doc.text(`${volume}${unit}`, x + 5, y + 20);
    doc.setFont(undefined, 'normal');
  },

  /**
   * Generate Professional Measurements Worksheet
   */
  generateMeasurementsWorksheet(count, difficulty, includeAnswers = false) {
    const doc = new jsPDF();
    addHeader(doc, 'Measurements & Conversions', includeAnswers ? 'ANSWER KEY' : 'Student Worksheet');

    let yPosition = 48;
    const leftMargin = 15;
    const rowHeight = 50;

    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Measure and convert the units:', leftMargin, 42);
    doc.setFont(undefined, 'normal');

    const conversions = [
      { from: 'cm', to: 'm', factor: 100, type: 'length', icon: 'ruler' },
      { from: 'mm', to: 'cm', factor: 10, type: 'length', icon: 'ruler' },
      { from: 'm', to: 'km', factor: 1000, type: 'length', icon: 'ruler' },
      { from: 'g', to: 'kg', factor: 1000, type: 'weight', icon: 'scale' },
      { from: 'ml', to: 'L', factor: 1000, type: 'volume', icon: 'cup' }
    ];

    for (let i = 0; i < count; i++) {
      if (yPosition > 220) {
        doc.addPage();
        addHeader(doc, '📏 Measurements & Conversions', includeAnswers ? 'ANSWER KEY' : 'Student Worksheet');
        yPosition = 48;
      }

      const conv = conversions[Math.floor(Math.random() * conversions.length)];
      const maxValue = difficulty === 'easy' ? 100 : difficulty === 'medium' ? 500 : 1000;
      const value = Math.floor(Math.random() * maxValue) + 10;
      const result = (value / conv.factor).toFixed(conv.factor >= 100 ? 2 : 1);

      // Problem number box
      doc.setFontSize(8);
      doc.setFillColor(240, 240, 240);
      doc.rect(leftMargin, yPosition, 8, 6, 'F');
      doc.setFont(undefined, 'bold');
      doc.text(`${i + 1}`, leftMargin + 2, yPosition + 4);
      doc.setFont(undefined, 'normal');

      // Draw visual representation
      if (conv.icon === 'ruler' && value <= 15 && conv.from === 'cm') {
        this.drawProfessionalRuler(doc, leftMargin + 12, yPosition + 2, 15, value, conv.from);
      } else if (conv.icon === 'scale' && value <= 500) {
        this.drawScale(doc, leftMargin + 12, yPosition + 5, value, conv.from);
      } else if (conv.icon === 'cup' && value <= 1000) {
        this.drawMeasuringCup(doc, leftMargin + 12, yPosition + 5, value, conv.from);
      }

      // Conversion problem
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      const problemY = conv.icon === 'ruler' && value <= 15 && conv.from === 'cm' ? yPosition + 32 : yPosition + 28;

      doc.text(`${value} ${conv.from}`, leftMargin + 80, problemY);
      doc.setFontSize(14);
      doc.text('=', leftMargin + 110, problemY);

      // Answer box
      doc.setDrawColor(100);
      doc.setLineWidth(0.5);
      doc.rect(leftMargin + 120, problemY - 7, 40, 10);

      doc.setFontSize(11);
      if (includeAnswers) {
        doc.text(`${result} ${conv.to}`, leftMargin + 125, problemY);
      } else {
        doc.setTextColor(150);
        doc.text(`_____ ${conv.to}`, leftMargin + 123, problemY);
        doc.setTextColor(0);
      }

      doc.setFont(undefined, 'normal');
      yPosition += rowHeight;
    }

    addFooter(doc);
    return doc;
  },

  /**
   * Generate Patterns & Sequences Worksheet
   */
  generatePatternsWorksheet(count, difficulty, includeAnswers = false) {
    const doc = new jsPDF();
    addHeader(doc, 'Patterns & Sequences', includeAnswers ? 'ANSWER KEY' : 'Student Worksheet');

    let yPosition = 45;
    const leftMargin = 20;
    const lineHeight = 18;

    doc.setFontSize(11);
    doc.text('Complete the patterns:', leftMargin, 40);

    for (let i = 0; i < count; i++) {
      if (yPosition > 260) {
        doc.addPage();
        addHeader(doc, 'Patterns & Sequences', includeAnswers ? 'ANSWER KEY' : 'Student Worksheet');
        yPosition = 45;
      }

      const start = Math.floor(Math.random() * 20) + 1;
      const step = difficulty === 'easy' ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 10) + 1;

      const seq = [start, start + step, start + (2 * step), start + (3 * step)];
      const next = start + (4 * step);

      const pattern = includeAnswers
        ? `${i + 1}. ${seq.join(', ')}, ${next}`
        : `${i + 1}. ${seq.join(', ')}, ____`;

      doc.text(pattern, leftMargin, yPosition);
      yPosition += lineHeight;
    }

    addFooter(doc);
    return doc;
  },

  /**
   * Print PDF
   */
  printPDF(doc) {
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  },

  /**
   * Download PDF
   */
  downloadPDF(doc, filename) {
    doc.save(filename);
  }
};

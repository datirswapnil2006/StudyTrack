import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatReadableDate, formatMinutesToHours } from './dateUtils';

/**
 * Generates an executive, professional PDF performance report
 * with cream and light-blue styling, multi-page tables, and goals.
 */
export function generateStudyReportPDF({
  reportTitle = 'Study Progress & Performance Analytics Report',
  analytics,
  reportType = 'weekly',
  reflections = '',
  goals = '',
  userFullName = 'Scholar'
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const COLOR_NAVY = [36, 50, 74];
  const COLOR_LIGHT_BLUE = [220, 235, 250];
  const COLOR_MEDIUM_BLUE = [107, 154, 207];
  const COLOR_WARM_CREAM = [255, 249, 240];
  const COLOR_CARD_CREAM = [255, 252, 247];
  const COLOR_MUTED_GRAY = [100, 116, 139];
  const COLOR_GREEN = [59, 138, 97];
  const COLOR_CORAL = [217, 83, 79];

  let currentY = margin;

  // ==========================================
  // Header Banner
  // ==========================================
  doc.setFillColor(...COLOR_WARM_CREAM);
  doc.roundedRect(margin, currentY, contentWidth, 75, 6, 6, 'F');
  doc.setDrawColor(...COLOR_LIGHT_BLUE);
  doc.setLineWidth(1.5);
  doc.roundedRect(margin, currentY, contentWidth, 75, 6, 6, 'S');

  // Title text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLOR_NAVY);
  doc.text(reportTitle.toUpperCase(), margin + 16, currentY + 28);

  // Subtitle & period
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...COLOR_MUTED_GRAY);
  const periodText = `Reporting Period: ${formatReadableDate(analytics.reportingPeriod.startDate)}  to  ${formatReadableDate(analytics.reportingPeriod.endDate)} (Asia/Kolkata)`;
  doc.text(periodText, margin + 16, currentY + 46);

  const metaText = `Prepared for: ${userFullName}  |  Generated on: ${new Date().toLocaleDateString('en-IN')}`;
  doc.text(metaText, margin + 16, currentY + 60);

  currentY += 90;

  // ==========================================
  // Key Metrics Summary Cards
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLOR_NAVY);
  doc.text('1. Executive Performance Summary', margin, currentY);
  currentY += 14;

  const cardWidth = (contentWidth - 15 * 3) / 4;
  const cardHeight = 52;

  const summaryStats = [
    {
      label: 'Completion Rate',
      val: analytics.totals.completionPercentage !== null ? `${analytics.totals.completionPercentage}%` : 'N/A',
      sub: `${analytics.totals.completedTasks}/${analytics.totals.totalStudyTasksScheduled} Tasks`
    },
    {
      label: 'Study Duration',
      val: `${analytics.totals.actualHours} hrs`,
      sub: `Planned: ${analytics.totals.plannedHours} hrs`
    },
    {
      label: 'Question Accuracy',
      val: analytics.totals.accuracyPercentage !== null ? `${analytics.totals.accuracyPercentage}%` : 'N/A',
      sub: `${analytics.totals.correctAnswers}/${analytics.totals.questionsAttempted} Correct`
    },
    {
      label: 'Mistakes Logged',
      val: `${analytics.totals.mistakesLogged}`,
      sub: `${analytics.totals.resolvedMistakesCount} Resolved`
    }
  ];

  summaryStats.forEach((stat, i) => {
    const cardX = margin + i * (cardWidth + 15);
    doc.setFillColor(...COLOR_CARD_CREAM);
    doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 4, 4, 'F');
    doc.setDrawColor(...COLOR_LIGHT_BLUE);
    doc.setLineWidth(1);
    doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 4, 4, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_MUTED_GRAY);
    doc.text(stat.label.toUpperCase(), cardX + 8, currentY + 15);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...COLOR_NAVY);
    doc.text(stat.val, cardX + 8, currentY + 32);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_MUTED_GRAY);
    doc.text(stat.sub, cardX + 8, currentY + 44);
  });

  currentY += cardHeight + 20;

  // ==========================================
  // Subject-Wise Breakdown Table
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLOR_NAVY);
  doc.text('2. Subject-Wise Study Time & Completion', margin, currentY);
  currentY += 8;

  const subjectTableRows = analytics.subjectBreakdown.map((s) => [
    s.subject,
    `${s.completedTasks} / ${s.totalTasks}`,
    `${s.completionRate}%`,
    `${s.actualHours} hrs`,
    `${s.plannedHours} hrs`,
    `${s.questionsAttempted}`,
    s.accuracyRate !== null ? `${s.accuracyRate}%` : 'N/A'
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Subject / Domain', 'Completed', 'Comp %', 'Actual Time', 'Planned Time', 'Attempted', 'Accuracy']],
    body: subjectTableRows.length > 0 ? subjectTableRows : [['No subject study records found in this range', '-', '-', '-', '-', '-', '-']],
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      textColor: COLOR_NAVY,
      cellPadding: 5
    },
    headStyles: {
      fillColor: COLOR_MEDIUM_BLUE,
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: COLOR_CARD_CREAM
    },
    margin: { left: margin, right: margin }
  });

  currentY = doc.lastAutoTable.finalY + 22;

  // Check if page break needed
  if (currentY > pageHeight - 160) {
    doc.addPage();
    currentY = margin;
  }

  // ==========================================
  // Daily Performance Log Table
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLOR_NAVY);
  doc.text('3. Daily Performance Breakdown', margin, currentY);
  currentY += 8;

  const dailyRows = analytics.dailyPerformance.map((d) => [
    formatReadableDate(d.date),
    `${d.completed} / ${d.scheduled}`,
    `${d.completionRate}%`,
    `${d.actualHours} hrs`,
    `${d.plannedHours} hrs`,
    `${d.questionsAttempted}`,
    `${d.correctAnswers}`
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Date (Asia/Kolkata)', 'Tasks Done', 'Comp %', 'Actual Hrs', 'Planned Hrs', 'Questions', 'Correct']],
    body: dailyRows.length > 0 ? dailyRows : [['No daily study sessions logged during this period', '-', '-', '-', '-', '-', '-']],
    theme: 'grid',
    styles: {
      fontSize: 8,
      textColor: COLOR_NAVY,
      cellPadding: 4.5
    },
    headStyles: {
      fillColor: COLOR_NAVY,
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: COLOR_WARM_CREAM
    },
    margin: { left: margin, right: margin }
  });

  currentY = doc.lastAutoTable.finalY + 22;

  if (currentY > pageHeight - 160) {
    doc.addPage();
    currentY = margin;
  }

  // ==========================================
  // Coding Mistakes & Patterns Table
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLOR_NAVY);
  doc.text('4. DSA Coding Mistakes & Pattern Analysis', margin, currentY);
  currentY += 8;

  const mistakeRows = (analytics.rankedDifficultTopics.length > 0 || analytics.frequentMistakePatterns.length > 0)
    ? Object.entries(analytics.mistakeCategoryCounts).map(([cat, count]) => [
        cat,
        `${count} mistakes`,
        count > 0 ? `${Math.round((count / (analytics.totals.mistakesLogged || 1)) * 100)}%` : '0%'
      ])
    : [['No mistakes logged in this period', '-', '-']];

  autoTable(doc, {
    startY: currentY,
    head: [['Mistake Category', 'Frequency', 'Share of Total']],
    body: mistakeRows,
    theme: 'grid',
    styles: { fontSize: 8.5, textColor: COLOR_NAVY, cellPadding: 4.5 },
    headStyles: { fillColor: COLOR_CORAL, textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: COLOR_CARD_CREAM },
    margin: { left: margin, right: margin }
  });

  currentY = doc.lastAutoTable.finalY + 22;

  if (currentY > pageHeight - 160) {
    doc.addPage();
    currentY = margin;
  }

  // ==========================================
  // High Priority Weak Topics & Revision Checklist
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLOR_NAVY);
  doc.text('5. High-Priority Weak Topics (Revision Checklist)', margin, currentY);
  currentY += 8;

  const topicRows = analytics.rankedDifficultTopics.slice(0, 6).map((t) => [
    t.topic_name,
    t.domain,
    `${t.confidence_rating} / 5`,
    `${t.revision_attempts || 0} times`,
    t.understanding_status,
    t.reason_difficult ? t.reason_difficult.slice(0, 40) + '...' : 'Under study'
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Topic Name', 'Domain', 'Confidence', 'Revisions', 'Status', 'Core Difficulty']],
    body: topicRows.length > 0 ? topicRows : [['All topics currently mastered or no difficult topics registered', '-', '-', '-', '-', '-']],
    theme: 'grid',
    styles: { fontSize: 8, textColor: COLOR_NAVY, cellPadding: 4.5 },
    headStyles: { fillColor: [126, 87, 194], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: COLOR_CARD_CREAM },
    margin: { left: margin, right: margin }
  });

  currentY = doc.lastAutoTable.finalY + 22;

  if (currentY > pageHeight - 150) {
    doc.addPage();
    currentY = margin;
  }

  // ==========================================
  // Actionable Recommendations
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLOR_NAVY);
  doc.text('6. Actionable Study Recommendations', margin, currentY);
  currentY += 14;

  analytics.recommendations.forEach((rec, idx) => {
    doc.setFillColor(...COLOR_CARD_CREAM);
    doc.roundedRect(margin, currentY, contentWidth, 28, 3, 3, 'F');
    doc.setDrawColor(...COLOR_LIGHT_BLUE);
    doc.rect(margin, currentY, 4, 28, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...COLOR_NAVY);
    doc.text(`${idx + 1}. ${rec.title}:`, margin + 12, currentY + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_MUTED_GRAY);
    const splitMsg = doc.splitTextToSize(rec.message, contentWidth - 30);
    doc.text(splitMsg, margin + 12, currentY + 22);

    currentY += 34;
  });

  currentY += 10;

  if (currentY > pageHeight - 140) {
    doc.addPage();
    currentY = margin;
  }

  // ==========================================
  // Reflections & Next Period Goals
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLOR_NAVY);
  doc.text('7. Personal Reflections & Next-Period Goals', margin, currentY);
  currentY += 14;

  // Reflections Box
  doc.setFillColor(...COLOR_WARM_CREAM);
  doc.roundedRect(margin, currentY, contentWidth, 42, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_NAVY);
  doc.text('Personal Reflections:', margin + 10, currentY + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_MUTED_GRAY);
  const refText = reflections || 'No reflections recorded for this cycle.';
  doc.text(doc.splitTextToSize(refText, contentWidth - 20), margin + 10, currentY + 28);

  currentY += 50;

  // Goals Box
  doc.setFillColor(...COLOR_CARD_CREAM);
  doc.roundedRect(margin, currentY, contentWidth, 42, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_NAVY);
  doc.text('Goals for Next Period:', margin + 10, currentY + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_MUTED_GRAY);
  const goalText = goals || 'No specific goals set yet.';
  doc.text(doc.splitTextToSize(goalText, contentWidth - 20), margin + 10, currentY + 28);

  // ==========================================
  // Page Numbers Footer
  // ==========================================
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_MUTED_GRAY);
    doc.text(
      `StudyTrack Analytics  •  Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 20,
      { align: 'center' }
    );
  }

  // Save the PDF
  const filename = `Study_Performance_Report_${reportType}_${analytics.reportingPeriod.startDate}_to_${analytics.reportingPeriod.endDate}.pdf`;
  doc.save(filename);
  return filename;
}

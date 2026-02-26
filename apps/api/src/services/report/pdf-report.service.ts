import PDFDocument from "pdfkit";
import type { AnalysisResult } from "@fairdev/shared";

export async function generateAnalysisReportPdf(input: {
  analysisId: string;
  githubUrl: string | null;
  offeredSalaryUsd: number;
  createdAt: Date;
  result: AnalysisResult;
}): Promise<Buffer> {
  return await new Promise<Buffer>((resolve) => {
    const doc = new PDFDocument({ size: "LETTER", margin: 48 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    doc.fontSize(20).text("FairDev Salary Fairness Report", { align: "left" });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#555").text(`Analysis ID: ${input.analysisId}`);
    doc.text(`Generated: ${new Date().toISOString()}`);
    doc.text(`GitHub: ${input.githubUrl ?? "Not provided"}`);
    doc.text(`Offered Salary: $${input.offeredSalaryUsd.toLocaleString()}`);

    doc.moveDown(1);
    doc.fillColor("#000").fontSize(14).text("Outcome");
    doc.fontSize(11).text(`Skill Level: ${input.result.skillLevel.toUpperCase()}`);
    doc.text(`Fairness: ${input.result.offerAssessment.status.toUpperCase()}`);
    doc.text(
      `Market Range: $${input.result.marketRangeUsd.min.toLocaleString()} - $${input.result.marketRangeUsd.max.toLocaleString()} (midpoint $${input.result.marketRangeUsd.midpoint.toLocaleString()})`,
    );

    doc.moveDown(1);
    doc.fontSize(14).text("Scores");
    doc.fontSize(11)
      .text(`Code Quality: ${input.result.scores.codeQuality}`)
      .text(`Architecture: ${input.result.scores.architecture}`)
      .text(`Testing: ${input.result.scores.testing}`)
      .text(`Documentation: ${input.result.scores.documentation}`)
      .text(`Project Complexity: ${input.result.scores.projectComplexity}`)
      .text(`Final Skill Score: ${input.result.scores.finalSkillScore}`);

    doc.moveDown(1);
    doc.fontSize(14).text("Strengths");
    input.result.strengths.forEach((item) => doc.fontSize(11).text(`- ${item}`));

    doc.moveDown(1);
    doc.fontSize(14).text("Weaknesses");
    input.result.weaknesses.forEach((item) => doc.fontSize(11).text(`- ${item}`));

    doc.moveDown(1);
    doc.fontSize(14).text("Improvement Suggestions");
    input.result.improvementSuggestions.forEach((item) => doc.fontSize(11).text(`- ${item}`));

    doc.moveDown(1);
    doc.fontSize(14).text("Negotiation Guidance");
    doc.fontSize(11).text(input.result.negotiationSuggestion);

    if (input.result.portfolioInsights) {
      doc.moveDown(1);
      doc.fontSize(14).text("Portfolio Insights");
      doc
        .fontSize(11)
        .text(`Portfolio URL: ${input.result.portfolioInsights.url}`)
        .text(`Summary: ${input.result.portfolioInsights.summary}`);

      if (input.result.portfolioInsights.technologies.length > 0) {
        doc.text(`Tech Signals: ${input.result.portfolioInsights.technologies.join(", ")}`);
      }

      if (input.result.portfolioInsights.projectLinks.length > 0) {
        doc.text("Project/Demo Links:");
        input.result.portfolioInsights.projectLinks.slice(0, 8).forEach((item) => doc.text(`- ${item}`));
      }
    }

    doc.end();
  });
}

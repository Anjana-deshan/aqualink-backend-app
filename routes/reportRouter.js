// routes/reportRouter.js
import { Router } from "express";
import User from "../Models/user.js";
import PDFDocument from "pdfkit";

const reportRouter = Router();

reportRouter.get("/report", async (req, res) => {
  try {
    const users = await User.find().lean();

    // Create PDF in landscape
    const doc = new PDFDocument({ margin: 30, size: "A3", layout: "landscape" });

    const filename = "User_Management_Report.pdf";
    res.setHeader("Content-disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-type", "application/pdf");

    // Title
    doc.fontSize(20).text("User Management Report", { align: "center" });
    doc.moveDown(2);

    // Table setup
    const rowHeight = 25;
    const colWidths = [80, 120, 120, 200, 100, 80, 120]; // column widths
    const tableWidth = colWidths.reduce((a, b) => a + b, 0); // total table width

    // Center table horizontally
    const startX = (doc.page.width - tableWidth) / 2;
    const tableTop = doc.y;

    // Column positions
    const colPositions = [];
    colWidths.reduce((acc, width) => {
      colPositions.push(acc);
      return acc + width;
    }, startX);

    // Table header with blue background
    doc.fontSize(12).fillColor("white").rect(startX, tableTop, tableWidth, rowHeight).fill("#1E3A8A");
    const headers = ["User ID", "First Name", "Last Name", "Email", "Role", "Blocked", "Created At"];
    headers.forEach((text, i) => {
      doc.fillColor("white").text(text, colPositions[i] + 5, tableTop + 7, { width: colWidths[i] - 10 });
    });

    let y = tableTop + rowHeight;

    users.forEach((user, index) => {
      // Alternating row colors
      doc.rect(startX, y, tableWidth, rowHeight).fill(index % 2 === 0 ? "#E0F2FE" : "#ffffff");

      doc.fillColor("black");

      // User ID padded
      const userId = String(index + 1).padStart(4, "0");

      const rowData = [
        userId,
        user.firstName || "-",
        user.lastName || "-",
        user.email || "-",
        user.role,
        user.isBlocked ? "Yes" : "No",
        new Date(user.createdAt).toLocaleString(),
      ];

      // Draw row text
      rowData.forEach((text, i) => {
        doc.fillColor("black").text(text, colPositions[i] + 5, y + 7, { width: colWidths[i] - 10 });
      });

      // Draw cell borders
      colPositions.forEach((x, i) => {
        doc.strokeColor("#000000").lineWidth(1).rect(x, y, colWidths[i], rowHeight).stroke();
      });

      y += rowHeight;

      // Page break
      if (y + rowHeight > doc.page.height - 50) {
        doc.addPage();
        y = 50;
      }
    });

    doc.pipe(res);
    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate report", error: err.message });
  }
});

export default reportRouter;

// controllers/salaryController.js
import SalaryRun from "../Models/SalaryRun.js";
import Transaction from "../Models/Transaction.js";
import bus from "../utils/eventBus.js";

// Calculation helper
// NOTE: Currently deducts ETF from net (as in your original).
// If you DON'T want ETF deducted from employee net, change net below to:
// const net = gross - (epfN + loanN + taxN);
function calc({
  basicSalary,
  allowances = 0,
  otHoursWeekday = 0,
  otHoursHoliday = 0,
  epf = 0,
  etf = 0,
  loan = 0,
  tax = 0,
}) {
  const b = Number(basicSalary) || 0;
  const a = Number(allowances) || 0;
  const otW = Number(otHoursWeekday) || 0;
  const otH = Number(otHoursHoliday) || 0;
  const epfN = Number(epf) || 0;
  const etfN = Number(etf) || 0;
  const loanN = Number(loan) || 0;
  const taxN = Number(tax) || 0;

  const daily = b / 28;
  const hourly = daily / 8;

  const otWeekdayAmt = otW * (hourly * 1.0);
  const otHolidayAmt = otH * (hourly * 1.5);

  const gross = b + a + otWeekdayAmt + otHolidayAmt;

  const net = gross - (epfN + etfN + loanN + taxN);

  return {
    daily,
    hourly,
    otWeekdayAmt,
    otHolidayAmt,
    gross,
    net,
  };
}

const toEmailLC = (s) => (s ? String(s).trim().toLowerCase() : "");

// Create salary run
export const create = async (req, res) => {
  try {
    const {
      staffEmail,
      staffName,
      periodStart,
      periodEnd,
      basicSalary,
      allowances,
      otHoursWeekday,
      otHoursHoliday,
      epf,
      etf,
      loan,
      tax,
    } = req.body;

    const emailLC = toEmailLC(staffEmail);

    const c = calc({
      basicSalary,
      allowances,
      otHoursWeekday,
      otHoursHoliday,
      epf,
      etf,
      loan,
      tax,
    });

    const run = await SalaryRun.create({
      staffEmail: emailLC,
      staffName: staffName?.trim() || "",
      periodStart,
      periodEnd,
      basicSalary: Number(basicSalary) || 0,
      allowances: Number(allowances) || 0,
      otHoursWeekday: Number(otHoursWeekday) || 0,
      otHoursHoliday: Number(otHoursHoliday) || 0,
      epf: Number(epf) || 0,
      etf: Number(etf) || 0,
      loan: Number(loan) || 0,
      tax: Number(tax) || 0,

      dailySalary: c.daily,
      hourlySalary: c.hourly,
      otWeekdayAmt: c.otWeekdayAmt,
      otHolidayAmt: c.otHolidayAmt,
      grossSalary: c.gross,
      netSalary: c.net,
    });

    // Mirror as a DR transaction
    await Transaction.create({
      name: `Salary - ${run.staffName || emailLC}`,
      description: `Payroll ${new Date(periodStart).toLocaleDateString()} – ${new Date(
        periodEnd
      ).toLocaleDateString()} (${emailLC})`,
      amount: run.netSalary,
      type: "DR",
      staffId: null,
      date: new Date(periodEnd),
    });

    bus.emit("finance:update");
    res.status(201).json(run);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// List salary runs (optionally filter by email)
export const list = async (req, res) => {
  try {
    const { email } = req.query;

    const query = {};
    if (email) {
      query.staffEmail = toEmailLC(email);
    }

    const items = await SalaryRun.find(query)
      .sort({ periodStart: -1, createdAt: -1 })
      .lean();

    res.json(items);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// Get one salary run
export const getOne = async (req, res) => {
  try {
    const item = await SalaryRun.findById(req.params.id);
    if (!item) return res.sendStatus(404);
    res.json(item);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// Update salary run
export const update = async (req, res) => {
  try {
    if (req.body.staffEmail) {
      req.body.staffEmail = toEmailLC(req.body.staffEmail);
    }
    if (typeof req.body.staffName === "string") {
      req.body.staffName = req.body.staffName.trim();
    }

    const fieldsAffectingCalc = [
      "basicSalary",
      "allowances",
      "otHoursWeekday",
      "otHoursHoliday",
      "epf",
      "etf",
      "loan",
      "tax",
    ];
    const shouldRecalc = fieldsAffectingCalc.some((k) => k in req.body);

    let payload = { ...req.body };

    if (shouldRecalc) {
      const current = await SalaryRun.findById(req.params.id).lean();
      if (!current) return res.sendStatus(404);

      const merged = {
        basicSalary: payload.basicSalary ?? current.basicSalary,
        allowances: payload.allowances ?? current.allowances,
        otHoursWeekday: payload.otHoursWeekday ?? current.otHoursWeekday,
        otHoursHoliday: payload.otHoursHoliday ?? current.otHoursHoliday,
        epf: payload.epf ?? current.epf,
        etf: payload.etf ?? current.etf,
        loan: payload.loan ?? current.loan,
        tax: payload.tax ?? current.tax,
      };

      Object.keys(merged).forEach((k) => (merged[k] = Number(merged[k]) || 0));

      const c = calc(merged);

      payload = {
        ...payload,
        dailySalary: c.daily,
        hourlySalary: c.hourly,
        otWeekdayAmt: c.otWeekdayAmt,
        otHolidayAmt: c.otHolidayAmt,
        grossSalary: c.gross,
        netSalary: c.net,
      };
    }

    const item = await SalaryRun.findByIdAndUpdate(
      req.params.id,
      { $set: payload },
      { new: true }
    );

    if (!item) return res.sendStatus(404);

    bus.emit("finance:update");
    res.json(item);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// Remove salary run
export const remove = async (req, res) => {
  try {
    await SalaryRun.findByIdAndDelete(req.params.id);
    bus.emit("finance:update");
    res.sendStatus(204);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// SSE endpoint: pushes updates to clients (staff dashboards)
export const events = (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const send = () => {
    res.write(`data: update\n\n`);
  };

  bus.on("finance:update", send);

  req.on("close", () => {
    bus.off("finance:update", send);
  });
};

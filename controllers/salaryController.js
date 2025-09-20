// controllers/salaryController.js
import SalaryRun from "../Models/SalaryRun.js";
import Transaction from "../Models/Transaction.js";

function calc({ basicSalary, allowances = 0, otHoursWeekday = 0, otHoursHoliday = 0, epf = 0, etf = 0, loan = 0, tax = 0 }) {
  const daily = basicSalary / 28;
  const hourly = daily / 8;
  const otWeekdayAmt = otHoursWeekday * (hourly * 1.0);
  const otHolidayAmt = otHoursHoliday * (hourly * 1.5);
  const gross = basicSalary + allowances + otWeekdayAmt + otHolidayAmt;
  const net = gross - (epf + etf + loan + tax);
  return { daily, hourly, otWeekdayAmt, otHolidayAmt, gross, net };
}

export const create = async (req, res) => {
  if (req.user?.role !== "owner") return res.sendStatus(403);
  try {
    const {
      staffId, staffName, periodStart, periodEnd,
      basicSalary, allowances, otHoursWeekday, otHoursHoliday, epf, etf, loan, tax,
    } = req.body;

    const c = calc({ basicSalary, allowances, otHoursWeekday, otHoursHoliday, epf, etf, loan, tax });

    const run = await SalaryRun.create({
      staffId, staffName, periodStart, periodEnd,
      basicSalary, allowances, otHoursWeekday, otHoursHoliday, epf, etf, loan, tax,
      dailySalary: c.daily, hourlySalary: c.hourly,
      otWeekdayAmt: c.otWeekdayAmt, otHolidayAmt: c.otHolidayAmt,
      grossSalary: c.gross, netSalary: c.net,
    });

    await Transaction.create({
      name: `Salary - ${staffName}`,
      description: `Payroll ${new Date(periodStart).toLocaleDateString()} – ${new Date(periodEnd).toLocaleDateString()}`,
      amount: run.netSalary,
      type: "DR",
      staffId,
      date: new Date(periodEnd),
    });

    res.status(201).json(run);
  } catch (e) { res.status(400).json({ error: e.message }); }
};

export const list = async (req, res) => {
  if (req.user?.role !== "owner") return res.sendStatus(403);
  try {
    const items = await SalaryRun.find({}).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (e) { res.status(400).json({ error: e.message }); }
};

export const getOne = async (req, res) => {
  if (req.user?.role !== "owner") return res.sendStatus(403);
  try {
    const item = await SalaryRun.findById(req.params.id);
    if (!item) return res.sendStatus(404);
    res.json(item);
  } catch (e) { res.status(400).json({ error: e.message }); }
};

export const update = async (req, res) => {
  if (req.user?.role !== "owner") return res.sendStatus(403);
  try {
    const item = await SalaryRun.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(item);
  } catch (e) { res.status(400).json({ error: e.message }); }
};

export const remove = async (req, res) => {
  if (req.user?.role !== "owner") return res.sendStatus(403);
  try {
    await SalaryRun.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (e) { res.status(400).json({ error: e.message }); }
};

// Models/SalaryRun.js
import mongoose from "mongoose";

const SalaryRunSchema = new mongoose.Schema(
  {
    staffId: { type: String, required: true },
    staffName: { type: String, required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },

    basicSalary: { type: Number, required: true },
    allowances: { type: Number, default: 0 },
    otHoursWeekday: { type: Number, default: 0 },
    otHoursHoliday: { type: Number, default: 0 },

    epf: { type: Number, default: 0 },
    etf: { type: Number, default: 0 },
    loan: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },

    dailySalary: { type: Number, required: true },
    hourlySalary: { type: Number, required: true },
    otWeekdayAmt: { type: Number, default: 0 },
    otHolidayAmt: { type: Number, default: 0 },

    grossSalary: { type: Number, required: true },
    netSalary: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("SalaryRun", SalaryRunSchema);

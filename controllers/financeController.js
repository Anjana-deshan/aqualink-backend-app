// controllers/financeController.js
import Transaction from "../Models/Transaction.js";
import SalaryRun from "../Models/SalaryRun.js";
import Payment from "../Models/Payment.js";
import bus from "../utils/eventBus.js";

/**
 * Helper to sum a numeric field safely.
 */
function sum(arr, pick = (x) => x) {
  return arr.reduce((a, b) => a + Number(pick(b) || 0), 0);
}

/**
 * Compute monthly net for a given year & month (0-based month)
 */
function monthlyNetFor(txs, pays, year, month) {
  const inMonth = (d) =>
    d && new Date(d).getFullYear() === year && new Date(d).getMonth() === month;

  const incomeTx = sum(
    txs.filter((t) => t.type === "CR" && inMonth(t.date)),
    (t) => t.amount
  );
  const expenseTx = sum(
    txs.filter((t) => t.type === "DR" && inMonth(t.date)),
    (t) => t.amount
  );
  const incomePayments = sum(pays.filter((p) => inMonth(p.date)), (p) => p.amount);

  return incomeTx + incomePayments - expenseTx;
}

export const overview = async (req, res) => {
  try {
    const txs = await Transaction.find({ deletedAt: null }).lean();
    const pays = await Payment.find({}).lean();
    // SalaryRuns are already reflected as DR transactions, but we also return a count
    const salaries = await SalaryRun.find({}).lean();

    // Totals
    const incomeTx = sum(txs.filter((t) => t.type === "CR"), (t) => t.amount);
    const expenseTx = sum(txs.filter((t) => t.type === "DR"), (t) => t.amount);
    const incomePayments = sum(pays, (p) => p.amount);

    const income = incomeTx + incomePayments;
    const expense = expenseTx;
    const net = income - expense;

    // This month (net) & lifetime
    const now = new Date();
    const thisMonthNet = monthlyNetFor(txs, pays, now.getFullYear(), now.getMonth());
    const lifetimeEarnings = income; // treat as lifetime gross income

    // Last 4 months net + growth
    const months = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      months.push({
        label: d.toLocaleString(undefined, { month: "long" }),
        net: monthlyNetFor(txs, pays, y, m),
        y,
        m,
      });
    }
    const earnings = months.map((x, i) => ({
      month: x.label,
      amount: Math.round((x.net + Number.EPSILON) * 100) / 100,
      growth:
        i === 0 || months[i - 1].net === 0
          ? 0
          : Math.round(((x.net - months[i - 1].net) / Math.abs(months[i - 1].net)) * 100),
    }));

    // Recent unified activity (Transactions + Payments)
    const recentTx = txs.map((t) => ({
      id: t._id?.toString(),
      source: "Transaction",
      type: t.type === "CR" ? "Income" : "Expense",
      description: t.description || t.name || "Transaction",
      amount: (t.type === "CR" ? "+" : "-") + `$${Number(t.amount || 0).toFixed(2)}`,
      date: t.date || t.createdAt,
      status: "Completed",
    }));

    const recentPayments = pays.map((p) => ({
      id: p._id?.toString(),
      source: "Payment",
      type: "Payment",
      description: p.description || p.method || "Payment",
      amount: "+" + `$${Number(p.amount || 0).toFixed(2)}`,
      date: p.date || p.createdAt,
      status: "Completed",
    }));

    const recent = [...recentTx, ...recentPayments]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    res.json({
      totals: {
        availableBalance: net,
        thisMonthNet,
        lifetimeEarnings,
        income,
        expense,
        net,
      },
      earnings,        // [{ month, amount, growth }]
      recent,          // last 10 mixed
      counts: {
        transactions: txs.length,
        payments: pays.length,
        salaries: salaries.length,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// ---- Server-Sent Events (SSE) stream ----
export const events = (req, res) => {
  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const send = () => {
    res.write(`event: finance\ndata: ${JSON.stringify({ ts: Date.now() })}\n\n`);
  };

  // Initial ping
  send();

  const onUpdate = () => send();
  bus.on("finance:update", onUpdate);

  // Heartbeat every 25s to keep connections alive (esp. behind proxies)
  const hb = setInterval(() => res.write(":\n\n"), 25000);

  req.on("close", () => {
    clearInterval(hb);
    bus.off("finance:update", onUpdate);
    res.end();
  });
};

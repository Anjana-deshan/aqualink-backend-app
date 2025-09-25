import Transaction from "../Models/Transaction.js";

// ---- helpers ----
const toDate = (v) => (v ? new Date(v) : undefined);
const toNumber = (v) => Number(v || 0);

// Create
export const create = async (req, res) => {
  try {
    const payload = {
      name: req.body.name,
      description: req.body.description || "",
      amount: toNumber(req.body.amount),
      type: req.body.type,                 // "CR" | "DR"
      date: toDate(req.body.date) || new Date(), // occurred date
      recordedAt: toDate(req.body.recordedAt) || new Date(), // NEW
    };

    const tx = await Transaction.create(payload);
    res.status(201).json(tx);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// List (supports ?from, ?to, ?type, ?q) — unchanged behavior for display
export const list = async (req, res) => {
  try {
    const { from, to, type, q } = req.query;

    const filter = { deletedAt: null };
    if (type) filter.type = type;

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const items = await Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    const filtered = q
      ? items.filter(
          (i) =>
            i.name?.toLowerCase().includes(q.toLowerCase()) ||
            i.description?.toLowerCase().includes(q.toLowerCase())
        )
      : items;

    res.json(filtered);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// Get one
export const getOne = async (req, res) => {
  try {
    const item = await Transaction.findById(req.params.id);
    if (!item || item.deletedAt) return res.sendStatus(404);
    res.json(item);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// Update (allow changing both dates)
export const update = async (req, res) => {
  try {
    const payload = { ...req.body };

    if ("amount" in payload) payload.amount = toNumber(payload.amount);
    if ("date" in payload) payload.date = toDate(payload.date);
    if ("recordedAt" in payload) payload.recordedAt = toDate(payload.recordedAt);

    const item = await Transaction.findByIdAndUpdate(
      req.params.id,
      { $set: payload },
      { new: true }
    );
    if (!item) return res.sendStatus(404);
    res.json(item);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// Soft delete (unchanged)
export const remove = async (req, res) => {
  try {
    await Transaction.findByIdAndUpdate(req.params.id, {
      $set: { deletedAt: new Date() },
    });
    res.sendStatus(204);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// Optional summary (if you already use it)
export const summaryTotals = async (req, res) => {
  try {
    const txs = await Transaction.find({ deletedAt: null }).lean();
    const income = txs.filter((t) => t.type === "CR").reduce((a, b) => a + Number(b.amount || 0), 0);
    const expense = txs.filter((t) => t.type === "DR").reduce((a, b) => a + Number(b.amount || 0), 0);
    res.json({ income, expense, net: income - expense });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

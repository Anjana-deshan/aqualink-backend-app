// controllers/transactionController.js
import Transaction from "../Models/Transaction.js";

export const create = async (req, res) => {
  try {
    const tx = await Transaction.create({ ...req.body });
    res.status(201).json(tx);
  } catch (e) { res.status(400).json({ error: e.message }); }
};

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
    const items = await Transaction.find(filter).sort({ date: -1, createdAt: -1 }).lean();
    const filtered = q
      ? items.filter(i =>
          i.name?.toLowerCase().includes(q.toLowerCase()) ||
          i.description?.toLowerCase().includes(q.toLowerCase())
        )
      : items;
    res.json(filtered);
  } catch (e) { res.status(400).json({ error: e.message }); }
};

export const getOne = async (req, res) => {
  try {
    const item = await Transaction.findById(req.params.id);
    if (!item || item.deletedAt) return res.sendStatus(404);
    res.json(item);
  } catch (e) { res.status(400).json({ error: e.message }); }
};

export const update = async (req, res) => {
  try {
    const item = await Transaction.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(item);
  } catch (e) { res.status(400).json({ error: e.message }); }
};

export const remove = async (req, res) => {
  try {
    await Transaction.findByIdAndUpdate(req.params.id, { $set: { deletedAt: new Date() } });
    res.sendStatus(204);
  } catch (e) { res.status(400).json({ error: e.message }); }
};

export const summaryTotals = async (req, res) => {
  try {
    const txs = await Transaction.find({ deletedAt: null }).lean();
    const income = txs.filter(t => t.type === "CR").reduce((a, b) => a + b.amount, 0);
    const expense = txs.filter(t => t.type === "DR").reduce((a, b) => a + b.amount, 0);
    res.json({ income, expense, net: income - expense });
  } catch (e) { res.status(400).json({ error: e.message }); }
};
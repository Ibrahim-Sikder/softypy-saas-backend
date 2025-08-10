import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id: String, // e.g. "supplierId"
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);

async function getNextSequence(name: string): Promise<number> {
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

export const generateSupplierId = async () => {
  const seq = await getNextSequence('supplierId');
  return `S-${seq.toString().padStart(4, '0')}`;
};

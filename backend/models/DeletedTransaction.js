const mongoose = require('mongoose');

// Server-side snapshot of a deleted transaction so "undo" restores exactly what
// was deleted instead of trusting data sent by the client. Snapshots expire on
// their own once the undo window has passed.
const UNDO_WINDOW_SECONDS = 10 * 60;

const deletedTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  snapshot: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  deletedAt: {
    type: Date,
    default: Date.now,
    expires: UNDO_WINDOW_SECONDS
  }
});

deletedTransactionSchema.index({ userId: 1, transactionId: 1 });

module.exports = mongoose.model('DeletedTransaction', deletedTransactionSchema);

import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    loanApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanApplication",
      required: true
    },
    email: String,
    amount: Number,
    currency: { type: String, default: "usd" },
    transactionId: String,
    stripeSessionId: String
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);

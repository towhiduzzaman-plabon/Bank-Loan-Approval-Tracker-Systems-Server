import mongoose from "mongoose";

const loanApplicationSchema = new mongoose.Schema(
  {
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    borrowerName: String,
    borrowerEmail: String,

    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Loan",
      required: true
    },
    loanTitle: String,
    loanCategory: String,
    interestRate: Number,
    loanAmount: Number,

    firstName: String,
    lastName: String,
    contactNumber: String,
    nationalId: String,
    incomeSource: String,
    monthlyIncome: Number,
    reason: String,
    address: String,
    extraNotes: String,

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Cancelled"],
      default: "Pending"
    },

    feeStatus: {
      type: String,
      enum: ["Unpaid", "Paid"],
      default: "Unpaid"
    },

    approvedAt: Date,
    rejectedAt: Date,
    cancelledAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("LoanApplication", loanApplicationSchema);

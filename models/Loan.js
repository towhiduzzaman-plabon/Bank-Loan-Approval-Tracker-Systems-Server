import mongoose from "mongoose";

const loanSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    category: String,
    interestRate: Number,
    maxLimit: Number,
    requiredDocuments: [String],
    emiPlans: [String],
    image: String,
    showOnHome: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    createdByEmail: String
  },
  { timestamps: true }
);

export default mongoose.model("Loan", loanSchema);

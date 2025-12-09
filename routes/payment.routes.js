import express from "express";
import Stripe from "stripe";
import { verifyJWT } from "../middleware/verifyJWT.js";
import { verifyRole } from "../middleware/verifyRole.js";
import LoanApplication from "../models/LoanApplication.js";
import Payment from "../models/Payment.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// create checkout session
router.post(
  "/create-checkout-session",
  verifyJWT,
  verifyRole("borrower"),
  async (req, res) => {
    try {
      const { applicationId } = req.body;

      const app = await LoanApplication.findById(applicationId);
      if (!app) return res.status(404).json({ message: "Not found" });

      if (app.feeStatus === "Paid")
        return res.status(400).json({ message: "Already paid" });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: req.user.email,
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: 10 * 100,
              product_data: {
                name: `Loan Application Fee - ${app.loanTitle}`
              }
            },
            quantity: 1
          }
        ],
        success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&applicationId=${app._id}`,
        cancel_url: `${process.env.CLIENT_URL}/dashboard/my-loans`
      });

      res.json({ url: session.url });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// confirm payment (client e success page e hit korbe)
router.post("/confirm", verifyJWT, async (req, res) => {
  try {
    const { sessionId, applicationId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Not paid" });
    }

    const payment = await Payment.create({
      loanApplication: applicationId,
      email: session.customer_email,
      amount: session.amount_total / 100,
      currency: session.currency,
      transactionId: session.payment_intent,
      stripeSessionId: session.id
    });

    await LoanApplication.findByIdAndUpdate(applicationId, {
      feeStatus: "Paid"
    });

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// get payment details by applicationId
router.get(
  "/by-application/:id",
  verifyJWT,
  async (req, res) => {
    const payment = await Payment.findOne({
      loanApplication: req.params.id
    });
    if (!payment)
      return res.status(404).json({ message: "Payment not found" });

    res.json(payment);
  }
);

export default router;

import mongoose, { Schema } from "mongoose";

const emailVerificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    // Store hashed token
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    // TTL index: documents expire at the time specified in this field
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { collection: "email_verifications" }
);

const Verification = mongoose.model("Verification", emailVerificationSchema);

export default Verification;

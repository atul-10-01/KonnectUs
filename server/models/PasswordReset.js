import mongoose, { Schema } from "mongoose";

const passwordResetSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    email: { type: String, required: true, index: true },
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { collection: "password_resets" }
);

const PasswordReset = mongoose.model("PasswordReset", passwordResetSchema);
export default PasswordReset;

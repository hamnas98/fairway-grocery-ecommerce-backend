import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },

    password: {
      type: String,
      minlength: 8,
      select: false, // DO NOT return password in queries
    },

    phone: {
      type: String,
      trim: true,
      match: [/^\+?[0-9]{10,15}$/, "Invalid phone number"],
      sparse: true,
      unique: true,
    },
    
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    blockedAt: Date,
    deletedAt: Date,

    avatar: {
      type: String,
      default: null,
    },

    addresses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
      },
    ],

    // Referral system
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },

    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date,

    verificationToken: String,
    verificationTokenExpires: Date,
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ referralCode: 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Generate referral code once
userSchema.pre("save", function (next) {
  if (!this.referralCode && this.isNew) {
    this.referralCode = this._id.toString().substring(0, 8).toUpperCase();
  }
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Remove sensitive fields
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  delete obj.verificationToken;
  delete obj.verificationTokenExpires;
  return obj;
};

const User = mongoose.model("User", userSchema);
export default User;

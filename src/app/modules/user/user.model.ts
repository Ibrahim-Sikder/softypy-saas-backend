import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import { TUser, UserModel } from './user.interface';
import config from '../../config';

export const userSchema = new Schema<TUser>(
  {
    name: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    tenantDomain: {
      type: String
    },
    createdBy: {
      type: String,
      required: [true, 'Created by is required'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    role: {
      type: String
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    passwordChangeAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  },
);

// Virtual populate to get role information
// userSchema.virtual('role', {
//   ref: 'Role',
//   localField: 'role',
//   foreignField: '_id',
//   justOne: true,
// });

userSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this; // doc
  // hashing password and save into DB
  user.password = await bcrypt.hash(user.password, Number(config.default_pass));
  next();
});

// set '' after saving password
userSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});

userSchema.statics.isUserExistsByCustomId = async function (name: string) {
  const isUserExists = await User.findOne({ name }).select('+password');
  return isUserExists;
};

userSchema.statics.isPasswordMatched = async function (
  plaingTextPassword,
  hashedPassword,
) {
  return await bcrypt.compare(plaingTextPassword, hashedPassword);
};

userSchema.statics.isJWTIssuedBeforePasswordChanged = function (
  passwordChangedTimestamp: Date,
  jwtIssuedTimestamp: number,
) {
  const passwordChangedTime =
    new Date(passwordChangedTimestamp).getTime() / 1000;
  return passwordChangedTime > jwtIssuedTimestamp;
};

export const User = model<TUser, UserModel>('User', userSchema);

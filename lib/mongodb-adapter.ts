// lib/mongodb-adapter.ts
import { connectDB } from './db';
import { User,IUser } from '@/models/User';
import { Account, IAccount } from '@/models/Account';
import { Session } from '@/models/Session';
import { VerificationToken } from '@/models/VerificationToken';
import type { Adapter } from 'next-auth/adapters';
import mongoose from 'mongoose';

export function MongoDBAdapter(): Adapter {
  return {
    // lib/mongodb-adapter.ts - Update createUser method
async createUser(user: IUser) {
  await connectDB();
  
  // Auto-verify if this is an OAuth signup (no password)
  const userData = {
    ...user,
    emailVerified: user.password ? null : new Date(), // OAuth = auto-verified
  };
  
  const newUser = await User.create(userData);
  const userObj = newUser.toObject();
  return {
    id: userObj._id.toString(),
    name: userObj.name,
    email: userObj.email,
    emailVerified: userObj.emailVerified ?? null,
    image: userObj.image,
  };
},

    async getUser(id) {
      await connectDB();
      const user = await User.findById(id).lean();
      if (!user) return null;
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified ?? null,
        image: user.image,
      };
    },

    async getUserByEmail(email) {
      await connectDB();
      const user = await User.findOne({ email }).lean();
      if (!user) return null;
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified ?? null,
        image: user.image,
      };
    },

    async getUserByAccount({ providerAccountId, provider }) {
      await connectDB();
      const account = await Account.findOne({ provider, providerAccountId }).lean();
      if (!account) return null;
      const user = await User.findById(account.userId).lean();
      if (!user) return null;
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified ?? null,
        image: user.image,
      };
    },

    async updateUser(user) {
      await connectDB();
      const { id, ...data } = user;
      const updatedUser = await User.findByIdAndUpdate(id, data, { new: true }).lean();
      if (!updatedUser) throw new Error('User not found');
      return {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        emailVerified: updatedUser.emailVerified ?? null,
        image: updatedUser.image,
      };
    },

    async deleteUser(userId) {
      await connectDB();
      await User.findByIdAndDelete(userId);
      await Account.deleteMany({ userId });
      await Session.deleteMany({ userId });
    },

    async linkAccount(account: IAccount) {
      await connectDB();
      const newAccount = await Account.create(account);
      return newAccount.toObject();
    },

    async unlinkAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
      await connectDB();
      await Account.findOneAndDelete({ provider, providerAccountId });
    },

    async createSession({ sessionToken, userId, expires }) {
      await connectDB();
      const session = await Session.create({ sessionToken, userId, expires });
      return {
        sessionToken: session.sessionToken,
        userId: session.userId.toString(),
        expires: session.expires,
      };
    },

    async getSessionAndUser(sessionToken) {
      await connectDB();
      const session = await Session.findOne({ sessionToken }).lean();
      if (!session) return null;
      const user = await User.findById(session.userId).lean();
      if (!user) return null;
      return {
        session: {
          sessionToken: session.sessionToken,
          userId: (session.userId as mongoose.Types.ObjectId).toString(),
          expires: session.expires,
        },
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified ?? null,
          image: user.image,
        },
      };
    },

    async updateSession({ sessionToken, ...data }) {
      await connectDB();
      const session = await Session.findOneAndUpdate(
        { sessionToken },
        data,
        { new: true }
      ).lean();
      if (!session) return null;
      return {
        sessionToken: session.sessionToken,
        userId: (session.userId as mongoose.Types.ObjectId).toString(),
        expires: session.expires,
      };
    },

    async deleteSession(sessionToken) {
      await connectDB();
      await Session.findOneAndDelete({ sessionToken });
    },

    async createVerificationToken({ identifier, expires, token }) {
      await connectDB();
      const verificationToken = await VerificationToken.create({
        identifier,
        token,
        expires,
      });
      return {
        identifier: verificationToken.identifier,
        token: verificationToken.token,
        expires: verificationToken.expires,
      };
    },

    async useVerificationToken({ identifier, token }) {
      await connectDB();
      const verificationToken = await VerificationToken.findOneAndDelete({
        identifier,
        token,
      }).lean();
      if (!verificationToken) return null;
      return {
        identifier: verificationToken.identifier,
        token: verificationToken.token,
        expires: verificationToken.expires,
      };
    },
  };
}
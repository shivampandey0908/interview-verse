import mongoose, { Schema } from 'mongoose';
const UserSchema = new Schema({ name: { type: String, required: true, trim: true }, email: { type: String, required: true, unique: true, lowercase: true, trim: true }, passwordHash: { type: String, required: true, select: false }, profile: { skills: [String], experience: String, education: String, preferredRoles: [String] } }, { timestamps: true });
export default mongoose.models.User || mongoose.model('User', UserSchema);

import mongoose, { Schema } from 'mongoose';
const ReportSchema = new Schema({ userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, interviewId: { type: Schema.Types.ObjectId, ref: 'Interview', required: true, unique: true }, scores: Schema.Types.Mixed, level: String, strengths: [String], improvements: [String], recommendations: [String], summary: String, questionAnalysis: [Schema.Types.Mixed] }, { timestamps: true });
export default mongoose.models.InterviewReport || mongoose.model('InterviewReport', ReportSchema);

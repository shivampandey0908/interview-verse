import mongoose, { Schema } from 'mongoose';
const AnswerSchema = new Schema({ interviewId: { type: Schema.Types.ObjectId, ref: 'Interview', required: true, index: true }, questionId: { type: Schema.Types.ObjectId, ref: 'Question' }, text: String, evaluation: Schema.Types.Mixed }, { timestamps: true });
export default mongoose.models.Answer || mongoose.model('Answer', AnswerSchema);

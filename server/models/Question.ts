import mongoose, { Schema } from 'mongoose';
const QuestionSchema = new Schema({ interviewId: { type: Schema.Types.ObjectId, ref: 'Interview', required: true, index: true }, topic: String, text: String, difficulty: String, position: Number }, { timestamps: true });
export default mongoose.models.Question || mongoose.model('Question', QuestionSchema);

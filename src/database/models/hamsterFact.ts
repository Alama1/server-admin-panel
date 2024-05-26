import mongoose, { Schema, Document } from 'mongoose'

export interface IHamster extends Document {
    title: string
    description: string
}

const HamsterSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
})

export const hamstersModel = mongoose.model<IHamster>('hamsterFacts', HamsterSchema)
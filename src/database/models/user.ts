import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
    name: string
    email: string
    avatar?: string
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatar: { type: String, required: false }
})

export const userModel = mongoose.model<IUser>('user', UserSchema)
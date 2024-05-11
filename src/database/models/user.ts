import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
    username: string
    email: string
    password: string
    verified: string
    verificationString: string
    accessLevel: string
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false },
    verificationString: { type: String, required: true },
    acessLevel: { type: String, default: 'user' }
})

export const userModel = mongoose.model<IUser>('user', UserSchema)
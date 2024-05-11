const {Schema, model} = require("mongoose");

export const schema = new Schema(
    {
    _id: {
        type: String,
        required: [true, 'ID is required.']
    },
    title: {
        type: String,
        required: [true, 'Title is required.']
    },
    description: {
        type: String,
        required: [true, 'Description is required.']
    },
    questions: {
        all: {
            type: Array,
            validate: [arrayLimit, 'Questions array can only be 4 items long.']
        },
        correct: {
            type: String,
            required: [true, 'Specifying correct answer is required.']
        }
    },
    created_by: {
        type: String,
        required: [true, 'ID of creator is required.']
    },
    theme: {
        type: String,
        required: [true, 'Theme of the card is required.'],
        lowercase: true
    },
    created: String
})

function arrayLimit(val: Array<String>) {
    return val.length === 4;
}

const cardModel = model('card', schema)
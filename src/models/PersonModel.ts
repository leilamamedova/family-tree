import mongoose, { Schema } from 'mongoose';

const PersonSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    patronymic: {
      type: String,
      default: '',
      trim: true,
    },

    birthYear: {
      type: Number,
      default: null,
    },

    deathYear: {
      type: Number,
      default: null,
    },

    image: {
      type: String,
      default: '/placeholder.png',
    },

    description: {
      type: String,
      default: '',
    },

    parents: {
      type: [String],
      default: [],
    },

    children: {
      type: [String],
      default: [],
    },

    spouseId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const PersonModel =
  mongoose.models.Person || mongoose.model('Person', PersonSchema);

export default PersonModel;

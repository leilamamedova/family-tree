import { connectMongo } from '@/lib/mongodb';
import PersonModel from '@/models/PersonModel';

type CreatePersonInput = {
  firstName: string;
  lastName: string;
  patronymic?: string;
  birthYear?: number | null;
  deathYear?: number | null;
  image?: string;
  description?: string;
  parents?: string[];
  children?: string[];
  spouseId?: string | null;
};

type UpdatePersonInput = Partial<CreatePersonInput>;

type MongoPerson = {
  _id: {
    toString: () => string;
  };
  id?: string;
  firstName: string;
  lastName: string;
  patronymic?: string;
  birthYear?: number | null;
  deathYear?: number | null;
  image?: string;
  description?: string;
  parents?: string[];
  children?: string[];
  spouseId?: string | null;
};

function normalizePerson(person: MongoPerson) {
  return {
    id: person._id.toString(),
    firstName: person.firstName,
    lastName: person.lastName,
    patronymic: person.patronymic || '',
    birthYear: person.birthYear ?? null,
    deathYear: person.deathYear ?? null,
    image: person.image || '/placeholder.png',
    description: person.description || '',
    parents: person.parents || [],
    children: person.children || [],
    spouseId: person.spouseId || null,
  };
}

async function normalizeParents(parents?: string[]) {
  if (!parents || parents.length === 0) return [];

  const selectedParentId = parents[0];
  const selectedParent = await PersonModel.findById(selectedParentId).lean();

  if (selectedParent?.spouseId) {
    return [selectedParentId, selectedParent.spouseId];
  }

  return [selectedParentId];
}

async function validateSpouse(
  spouseId: string | null | undefined,
  currentPersonId?: string,
) {
  if (!spouseId) return;

  const spouse = await PersonModel.findById(spouseId).lean();

  if (!spouse) {
    throw new Error('Selected spouse does not exist');
  }

  if (spouse.spouseId && spouse.spouseId !== currentPersonId) {
    throw new Error('Selected person already has a spouse');
  }
}

export const resolvers = {
  Query: {
    persons: async () => {
      await connectMongo();

      const persons = await PersonModel.find().sort({ createdAt: 1 }).lean();

      return persons.map(normalizePerson);
    },

    person: async (_: unknown, args: { id: string }) => {
      await connectMongo();

      const person = await PersonModel.findById(args.id).lean();

      return person ? normalizePerson(person) : null;
    },

    searchPersons: async (_: unknown, args: { query: string }) => {
      await connectMongo();

      const regex = new RegExp(args.query, 'i');

      const persons = await PersonModel.find({
        $or: [{ firstName: regex }, { lastName: regex }, { patronymic: regex }],
      })
        .sort({ firstName: 1 })
        .lean();

      return persons.map(normalizePerson);
    },
  },

  Mutation: {
    createPerson: async (_: unknown, args: { input: CreatePersonInput }) => {
      await connectMongo();

      const normalizedParents = await normalizeParents(args.input.parents);

      await validateSpouse(args.input.spouseId);

      const created = await PersonModel.create({
        firstName: args.input.firstName,
        lastName: args.input.lastName,
        patronymic: args.input.patronymic || '',
        birthYear: args.input.birthYear ?? null,
        deathYear: args.input.deathYear ?? null,
        image: args.input.image || '/placeholder.png',
        description: args.input.description || '',
        parents: normalizedParents,
        children: args.input.children || [],
        spouseId: args.input.spouseId || null,
      });

      if (args.input.spouseId) {
        await PersonModel.findByIdAndUpdate(args.input.spouseId, {
          spouseId: created._id.toString(),
        });
      }

      const freshPerson = await PersonModel.findById(created._id).lean();

      if (!freshPerson) {
        throw new Error('Person was not created');
      }

      return normalizePerson(freshPerson);
    },

    updatePerson: async (
      _: unknown,
      args: { id: string; input: UpdatePersonInput },
    ) => {
      await connectMongo();

      const existingPerson = await PersonModel.findById(args.id).lean();

      if (!existingPerson) {
        throw new Error('Person not found');
      }

      const oldSpouseId = existingPerson.spouseId || null;
      const newSpouseId =
        args.input.spouseId === undefined ? oldSpouseId : args.input.spouseId;

      await validateSpouse(newSpouseId, args.id);

      if (oldSpouseId && oldSpouseId !== newSpouseId) {
        await PersonModel.findByIdAndUpdate(oldSpouseId, {
          spouseId: null,
        });
      }

      if (newSpouseId && newSpouseId !== oldSpouseId) {
        await PersonModel.findByIdAndUpdate(newSpouseId, {
          spouseId: args.id,
        });
      }

      const normalizedParents =
        args.input.parents === undefined
          ? existingPerson.parents || []
          : await normalizeParents(args.input.parents);

      const updated = await PersonModel.findByIdAndUpdate(
        args.id,
        {
          ...args.input,
          parents: normalizedParents,
          spouseId: newSpouseId || null,
        },
        {
          new: true,
        },
      ).lean();

      if (!updated) {
        throw new Error('Person could not be updated');
      }

      return normalizePerson(updated);
    },

    deletePerson: async (_: unknown, args: { id: string }) => {
      await connectMongo();

      await PersonModel.findByIdAndDelete(args.id);

      await PersonModel.updateMany(
        {},
        {
          $pull: {
            parents: args.id,
            children: args.id,
          },
        },
      );

      await PersonModel.updateMany(
        {
          spouseId: args.id,
        },
        {
          spouseId: null,
        },
      );

      return true;
    },
  },
};

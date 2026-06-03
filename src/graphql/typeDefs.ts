export const typeDefs = `#graphql
  type Person {
    id: ID!

    firstName: String!
    lastName: String!
    patronymic: String

    birthYear: Int
    deathYear: Int

    image: String
    description: String

    parents: [ID!]
    children: [ID!]

    spouseId: ID
  }

  input CreatePersonInput {
    firstName: String!
    lastName: String!
    patronymic: String

    birthYear: Int
    deathYear: Int

    image: String
    description: String

    parents: [ID!]
    children: [ID!]

    spouseId: ID
  }

  input UpdatePersonInput {
    firstName: String
    lastName: String
    patronymic: String

    birthYear: Int
    deathYear: Int

    image: String
    description: String

    parents: [ID!]
    children: [ID!]

    spouseId: ID
  }

  type Query {
    persons: [Person!]!
    person(id: ID!): Person
    searchPersons(query: String!): [Person!]!
  }

  type Mutation {
    createPerson(input: CreatePersonInput!): Person!
    updatePerson(id: ID!, input: UpdatePersonInput!): Person!
    deletePerson(id: ID!): Boolean!
  }
`;

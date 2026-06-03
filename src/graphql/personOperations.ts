import { gql, TypedDocumentNode } from '@apollo/client';
import { Person } from '@/types/person';

type GetPersonsData = {
  persons: Person[];
};

export const GET_PERSONS: TypedDocumentNode<GetPersonsData> = gql`
  query GetPersons {
    persons {
      id
      firstName
      lastName
      patronymic
      birthYear
      deathYear
      image
      description
      parents
      children
      spouseId
    }
  }
`;

export const CREATE_PERSON = gql`
  mutation CreatePerson($input: CreatePersonInput!) {
    createPerson(input: $input) {
      id
      firstName
      lastName
      patronymic
      birthYear
      deathYear
      image
      description
      parents
      children
      spouseId
    }
  }
`;

export const UPDATE_PERSON = gql`
  mutation UpdatePerson($id: ID!, $input: UpdatePersonInput!) {
    updatePerson(id: $id, input: $input) {
      id
      firstName
      lastName
      patronymic
      birthYear
      deathYear
      image
      description
      parents
      children
      spouseId
    }
  }
`;

export const DELETE_PERSON = gql`
  mutation DeletePerson($id: ID!) {
    deletePerson(id: $id)
  }
`;

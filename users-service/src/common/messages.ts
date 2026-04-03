import { capitalize } from './utils';

export const validationErrorMessages = {
  type: {
    email: 'Email must be a valid email address.',
  },
  required: 'Please enter a value.',
  unique: (attribute: string) => `Can't use this ${attribute}.`,
  min: (limit: number, attribute: string) =>
    `${capitalize(attribute)} must be at least ${limit} characters long.`,
  max: (limit: number, attribute: string) =>
    `${capitalize(attribute)} must not exceed ${limit} characters.`,
  invalid: 'Ooops! Invalid value!',
};

export const CustomErrorMessages = {
  ...validationErrorMessages,
  etc: {
    failedLogin: 'The email or password you entered is incorrect.',
    doubleCollaborator: 'This user is already a collaborator.',
    collaborateWithSelf: "Hey, you can't collaborate with yourself.",
    unauthenticated: 'You must login first.',
    unauthorized: "Ooops, you don't have permission.",
    loggedIn: 'You are already logged in.',
    checkInput: 'Please check your input fields.',
  },
};

export const CustomSuccessMessages = {
  login: 'Login successful',
  logout: 'Logout successful',
  signup: 'Signup successful',
  fetch: 'Data retrieved successfully',
  update: 'Data updated successfully',
  projects: {
    post: 'Project successfully created',
    patch: 'Project successfully updated',
    delete: 'Project successfully deleted',
    restore: 'Project successfully restored',
  },
  issues: {
    post: 'Issue successfully created',
    patch: 'Issue successfully updated',
  },
  comments: {
    post: 'Comment successfully added',
    delete: 'Comment successfully deleted',
  },
  users: {
    patch: 'Profile successfully updated',
  },
  collaborations: {
    post: 'Collaboration successfully created',
    delete: 'Collaboration successfully deleted',
  },
};

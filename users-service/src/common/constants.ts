/**
 * MESSAGE PATTERNS
 */
// USERS
export const USER_SIGNUP = 'user.signup';
export const USER_LOGIN = 'user.login';
export const USER_LOGOUT = 'user.logout';
export const USER_VIEW_PROFILE = 'user.view.profile';
export const USER_CHANGE_PROFILE = 'user.change.profile';
export const USER_CHANGED = 'user.changed';
export const USER_VIEW_PROFILE_BY_EMAIL = 'user.view.profile.by.email';

// PROJECTS
export const PROJECT_CREATE = 'project.create';
export const PROJECT_CREATED = 'project.created';
export const PROJECT_VIEW_ALL_OWNED = 'project.view.all.owned';
export const PROJECT_VIEW_ALL_COLLABORATION = 'project.view.all.collaboration';
export const PROJECT_VIEW_DETAIL = 'project.view.detail';
export const PROJECT_VIEW_ALL_DELETED = 'project.view.all.deleted';
export const PROJECT_CHANGE = 'project.change';
export const PROJECT_DELETE = 'project.delete';
export const PROJECT_DELETED = 'project.deleted';
export const PROJECT_RESTORE = 'project.restore';
export const PROJECT_RESTORED = 'project.restored';

// COLLABORATIONS
export const COLLABORATION_CREATE = 'collaboration.create';
export const COLLABORATION_CREATED = 'collaboration.created';
export const COLLABORATION_DELETE = 'collaboration.delete';
export const COLLABORATION_DELETED = 'collaboration.deleted';

/**
 * ENV
 */
export const APP_STATUS = 'APP_STATUS';
export const JWT_SECRET_KEY = 'JWT_SECRET_KEY';
export const JWT_ALGORITHM = 'JWT_ALGORITHM';
export const JWT_ACCESS_TOKEN_EXPIRES_IN = 'JWT_ACCESS_TOKEN_EXPIRES_IN';
export const JWT_ISSUER = 'JWT_ISSUER';
export const DATABASE_URL = 'DATABASE_URL';

/**
 * TOKENS
 */
// SERVICE
export const LOGGING_SERVICE = Symbol('LOGGING_SERVICE');
export const HASH_SERVICE = Symbol('HASH_SERVICE');
export const JWT_SERVICE = Symbol('JWT_SERVICE');

// REPOSITORY
export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');
export const PROJECTS_REPOSITORY = Symbol('PROJECTS_REPOSITORY');
export const COLLABORATIONS_REPOSITORY = Symbol('COLLABORATIONS_REPOSITORY');

/**
 * MICROSERVICES
 */
export const USER_MS = Symbol('USER_MS');
export const PROJECT_MS = Symbol('PROJECT_MS');
export const ISSUE_MS = Symbol('ISSUE_MS');
export const NOTIFICATION_MS = Symbol('NOTIFICATION_MS');

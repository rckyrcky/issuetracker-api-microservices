export const APP_STATUS = 'APP_STATUS';

// MICROSERVICES
export const USER_MS = Symbol('USER_MS');
export const PROJECT_MS = Symbol('PROJECT_MS');
export const ISSUE_MS = Symbol('ISSUE_MS');
export const NOTIFICATION_MS = Symbol('NOTIFICATION_MS');

// ENV
export const JWT_SECRET_KEY = 'JWT_SECRET_KEY';
export const JWT_ALGORITHM = 'JWT_ALGORITHM';
export const JWT_ACCESS_TOKEN_EXPIRES_IN = 'JWT_ACCESS_TOKEN_EXPIRES_IN';
export const JWT_ISSUER = 'JWT_ISSUER';
export const UPSTASH_REDIS_REST_URL = 'UPSTASH_REDIS_REST_URL';
export const UPSTASH_REDIS_REST_TOKEN = 'UPSTASH_REDIS_REST_TOKEN';

// REPOSITORY
export const COLLABORATIONS_REPOSITORY = Symbol('CollaborationsRepository');
export const COMMENTS_REPOSITORY = Symbol('CommentsRepository');
export const ISSUE_HISTORIES_REPOSITORY = Symbol('IssueHistoriesRepository');
export const ISSUES_REPOSITORY = Symbol('IssuesRepository');
export const NOTIFICATIONS_REPOSITORY = Symbol('NotificationsRepository');
export const PROJECTS_REPOSITORY = Symbol('ProjectsRepository');
export const USERS_REPOSITORY = Symbol('UsersRepository');

// SERVICE
export const HASH_SERVICE = Symbol('HashService');
export const JWT_SERVICE = Symbol('JwtService');
export const LOGGING_SERVICE = Symbol('LoggingService');
export const RATELIMIT_SERVICE = Symbol('RateLimitService');

/**
 * MESSAGE PATTERNS
 */
// USERS
export const USER_SIGNUP = 'user.signup';
export const USER_LOGIN = 'user.login';
export const USER_LOGOUT = 'user.logout';
export const USER_VIEW_PROFILE = 'user.view.profile';
export const USER_CHANGE_PROFILE = 'user.change.profile';
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

// ISSUE HISTORIES
export const ISSUE_HISTORIES_VIEW = 'issue.histories.view';

// ISSUES
export const ISSUE_CREATE = 'issue.create';
export const ISSUE_CREATED = 'issue.created';
export const ISSUE_CHANGE = 'issue.change';
export const ISSUE_VIEW_DETAIL = 'issue.view.detail';
export const ISSUE_VIEW_ALL = 'issue.view.all';

// COMMENTS
export const COMMENT_CREATE = 'comment.create';
export const COMMENT_CREATED = 'comment.created';
export const COMMENT_VIEW_DETAIL = 'comment.view.detail';
export const COMMENT_VIEW_ALL = 'comment.view.all';
export const COMMENT_DELETE = 'comment.delete';

// NOTIFICATIONS
export const NOTIFICATION_CREATE = 'notification.create';
export const NOTIFICATION_IS_READ = 'notification.is.read';
export const NOTIFICATION_VIEW_DETAIL = 'notification.view.detail';
export const NOTIFICATION_VIEW_UNREAD_NUMBER =
  'notification.view.unread.number';
export const NOTIFICATION_VIEW_ALL = 'notification.view.all';

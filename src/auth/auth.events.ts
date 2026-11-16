/** Emitted when a user's existing sessions must stop working immediately
 *  (password change/reset, deactivation, role change, deletion). */
export const SESSIONS_REVOKED = 'auth.sessions_revoked';

export interface SessionsRevokedEvent {
  userId: string;
}

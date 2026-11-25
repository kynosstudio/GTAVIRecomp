import { logout } from '../../_lib/admin.js';

export async function onRequestPost(context) {
  return logout(context);
}

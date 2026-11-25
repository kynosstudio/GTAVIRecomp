import { login } from '../../_lib/admin.js';

export async function onRequestPost(context) {
  return login(context);
}

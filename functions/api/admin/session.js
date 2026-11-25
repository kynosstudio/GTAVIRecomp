import { session } from '../../_lib/admin.js';

export async function onRequestGet(context) {
  return session(context);
}

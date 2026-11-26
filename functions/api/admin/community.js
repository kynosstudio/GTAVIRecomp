import { listAdminCommunity, moderateCommunity } from '../../_lib/community.js';

export async function onRequestGet(context) {
  return listAdminCommunity(context);
}

export async function onRequestPost(context) {
  return moderateCommunity(context);
}

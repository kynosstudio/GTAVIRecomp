import { listAdminResource, mutateAdminResource } from '../../_lib/admin.js';

export async function onRequestGet(context) {
  return listAdminResource(context, 'news');
}

export async function onRequestPost(context) {
  return mutateAdminResource(context, 'news', 'admin_upsert_news');
}

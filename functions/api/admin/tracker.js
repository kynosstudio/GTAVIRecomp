import { listAdminResource, mutateAdminResource } from '../../_lib/admin.js';

export async function onRequestGet(context) {
  return listAdminResource(context, 'tracker');
}

export async function onRequestPost(context) {
  return mutateAdminResource(context, 'tracker', 'admin_upsert_tracker_update');
}

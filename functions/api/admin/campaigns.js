import { listAdminResource, mutateAdminResource } from '../../_lib/admin.js';

export async function onRequestGet(context) {
  return listAdminResource(context, 'campaigns');
}

export async function onRequestPost(context) {
  return mutateAdminResource(context, 'campaigns', 'admin_upsert_campaign');
}

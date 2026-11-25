import { listAdminResource, mutateAdminResource } from '../../_lib/admin.js';

export async function onRequestGet(context) {
  return listAdminResource(context, 'donations');
}

export async function onRequestPost(context) {
  return mutateAdminResource(context, 'donations', 'admin_record_donation');
}

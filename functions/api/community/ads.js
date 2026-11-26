import { createCommunityAd } from '../../_lib/community.js';

export async function onRequestPost(context) {
  return createCommunityAd(context);
}

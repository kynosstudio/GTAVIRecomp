import { reactToCommunityPost } from '../../../../_lib/community.js';

export async function onRequestPost(context) {
  return reactToCommunityPost(context, context.params.postId);
}

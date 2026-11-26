import { createCommunityComment, listCommunityComments } from '../../../../_lib/community.js';

export async function onRequestGet(context) {
  return listCommunityComments(context, context.params.postId);
}

export async function onRequestPost(context) {
  return createCommunityComment(context, context.params.postId);
}

import { createCommunityPost, listCommunityPosts } from '../../_lib/community.js';

export async function onRequestGet(context) {
  return listCommunityPosts(context);
}

export async function onRequestPost(context) {
  return createCommunityPost(context);
}

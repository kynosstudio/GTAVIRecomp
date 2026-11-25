import { getFundraiserData } from '../_lib/public-data.js';

export async function onRequestGet(context) {
  return getFundraiserData(context);
}

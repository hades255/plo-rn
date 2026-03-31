import { api } from '../api/api';
type PostAuthRoute = 'Home' | 'SoftTierKyc';

export async function getPostAuthRedirectRoute(): Promise<PostAuthRoute> {
  try {
    const data = await api.kyc.getStatus();
    return data?.verifiedForOrdering ? 'Home' : 'SoftTierKyc';
  } catch {
    return 'SoftTierKyc';
  }
}

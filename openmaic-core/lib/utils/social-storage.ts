import { supabase, getCurrentUser } from '../supabase';
import { createLogger } from '@/lib/logger';

const log = createLogger('SocialStorage');

/**
 * Toggle like/unlike for a specific stage/course.
 * Updates both the 'likes' table and the 'likes_count' on 'stages'.
 */
export async function toggleLike(stageId: string): Promise<{ liked: boolean; count: number }> {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Authentication required to like courses');

    // 1. Check if already liked
    const { data: existingLike, error: likeCheckError } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('stage_id', stageId)
      .single();

    if (likeCheckError && likeCheckError.code !== 'PGRST116') {
      throw likeCheckError;
    }

    const isLiked = !!existingLike;

    if (isLiked) {
      // 2. Unlike: Remove like record and decrement counter
      const { error: unlikeError } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id);
      if (unlikeError) throw unlikeError;

      const { data: updatedStage, error: decrError } = await supabase.rpc('decrement_likes', { target_id: stageId });
      // Fallback if RPC doesn't exist yet
      if (decrError) {
         await supabase.from('stages').update({ likes_count: (await getCurrentLikes(stageId)) - 1 }).eq('id', stageId);
      }

      return { liked: false, count: await getCurrentLikes(stageId) };
    } else {
      // 3. Like: Add like record and increment counter
      const { error: likeAddError } = await supabase
        .from('likes')
        .insert({ user_id: user.id, stage_id: stageId });
      if (likeAddError) throw likeAddError;

      const { data: updatedStage, error: incrError } = await supabase.rpc('increment_likes', { target_id: stageId });
      // Fallback
      if (incrError) {
         await supabase.from('stages').update({ likes_count: (await getCurrentLikes(stageId)) + 1 }).eq('id', stageId);
      }

      return { liked: true, count: await getCurrentLikes(stageId) };
    }
  } catch (err) {
    log.error('Failed to toggle like:', err);
    throw err;
  }
}

/**
 * Update course view count (analytics).
 */
export async function trackView(stageId: string): Promise<void> {
  try {
    // Basic increment via RPC for performance/concurrency
    await supabase.rpc('increment_views', { target_id: stageId });
  } catch (err) {
    log.warn('Failed to track view (silently ignoring):', err);
  }
}

/**
 * Fetch a TikTok-style recommended feed based on popularity and recency.
 * Sorting Score: (Likes * 5) + (Forks * 2) + (Views * 0.5) / Age^1.5
 */
export async function getRecommendedFeed(limit = 20) {
  try {
    const { data, error } = await supabase
      .from('stages')
      .select('id, name, description, likes_count, views_count, forks_count, updated_at, is_public')
      .eq('is_public', true)
      .order('likes_count', { ascending: false }) // Simple version first
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    log.error('Failed to fetch recommended feed:', err);
    return [];
  }
}

async function getCurrentLikes(stageId: string): Promise<number> {
    const { data } = await supabase.from('stages').select('likes_count').eq('id', stageId).single();
    return data?.likes_count || 0;
}

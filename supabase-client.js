// supabase-client.js — Phiên bản sửa lỗi
const SUPABASE_URL = "https://fgesawwyjidyyfuiiqga.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_JrCxME29MxPgfehEiOR1LQ_kyqrOXGx";

// Biến toàn cục, sẽ được gán sau khi thư viện load
let supabaseClient = null;

function initSupabase() {
  if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase đã kết nối');
  } else {
    console.warn('⚠️ Supabase SDK chưa được load');
  }
}

async function fetchFlashcardTopicsFromSupabase() {
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient
    .from('flashcard_topics')
    .select('id, title, description, icon, card_count, sort_order')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data || []).map(topic => ({
    ...topic,
    cardCount: topic.card_count || 0
  }));
}

async function fetchFlashcardsFromSupabase(topicId) {
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient
    .from('flashcards')
    .select('english, phonetic, vietnamese, type')
    .eq('topic_id', topicId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

function normalizeBlogPost(row) {
  return {
    ...row,
    coverEmoji: row.cover_emoji,
    coverColor: row.cover_color,
    readingTime: row.reading_time,
    authorAvatar: row.author_avatar,
    publishedAt: row.published_at,
    featured: row.is_featured,
    pinned: row.is_pinned,
    linkedUnit: row.linked_unit_id,
    linkedFlashcard: row.linked_flashcard_id,
    relatedPosts: row.related_post_ids || []
  };
}

async function fetchBlogPostsFromSupabase() {
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient
    .from('blog_posts')
    .select('id, slug, title, excerpt, category, tags, cover_emoji, cover_color, reading_time, author, author_avatar, is_featured, is_pinned, status, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(normalizeBlogPost);
}

async function fetchBlogPostFromSupabase(postId) {
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient
    .from('blog_posts')
    .select('*')
    .eq('id', postId)
    .single();
  if (error) throw error;
  return normalizeBlogPost(data);
}

async function fetchSpeakingTopicsFromSupabase() {
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient
    .from('speaking_topics')
    .select('id, title, description, icon, sort_order')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

async function fetchSpeakingTopicFromSupabase(topicId) {
  if (!supabaseClient) return null;
  const { data: topic, error: topicError } = await supabaseClient
    .from('speaking_topics')
    .select('*')
    .eq('id', topicId)
    .single();
  if (topicError) throw topicError;

  const { data: subtopics, error: subtopicError } = await supabaseClient
    .from('speaking_subtopics')
    .select('*')
    .eq('topic_id', topicId)
    .order('sort_order', { ascending: true });
  if (subtopicError) throw subtopicError;

  const subtopicIds = (subtopics || []).map(item => item.id);
  let sentences = [];
  if (subtopicIds.length > 0) {
    const { data, error } = await supabaseClient
      .from('speaking_sentences')
      .select('*')
      .in('subtopic_id', subtopicIds)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    sentences = data || [];
  }

  return {
    ...topic,
    subtopics: (subtopics || []).map(sub => ({
      ...sub,
      sentences: sentences
        .filter(sentence => sentence.subtopic_id === sub.id)
        .map(sentence => ({
          text: sentence.text_en,
          vi: sentence.text_vi,
          type: sentence.type
        }))
    }))
  };
}

import { supabase } from './supabase';

export interface Account {
  user_iid: number;
  name: string;
  userid: string;
  password?: string;
  created_at: string;
  post_limit: number;
  whats_app_number?: string | number | null;
  profile_photo?: string | null;
}

export interface UpdateAccountParams {
  user_iid: number;
  name?: string;
  userid?: string;
  whats_app_number?: string | null;
  profile_photo?: string | null;
  currentPassword?: string;
  newPassword?: string;
}


export interface CommentItem {
  id: string;
  user_iid?: number;
  name: string;
  userid?: string;
  avatar?: string;
  text: string;
  created_at: string;
}

export interface Postcard {
  postcard_iid: number;
  image_url: string;
  title?: string | null;
  thumbnail_url?: string | null;
  created_at?: string;
}

export interface Post {
  post_iid: number;
  image_iid?: number; // fallback alias
  created_at: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  postcard_iid?: number | null;
  is_approved: boolean;
  like_count: number;
  user_comment: CommentItem[];
  user_iid: number | null;
  author?: Account | null;
  postcard?: Postcard | null;
}

const LOCAL_STORAGE_USER_KEY = 'kabir_user_session';

export const postService = {
  // Current session storage
  getCurrentUser(): Account | null {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser(account: Account | null) {
    if (account) {
      // Don't save raw password in local storage
      const safeAccount = { ...account };
      delete safeAccount.password;
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(safeAccount));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }
  },

  logout() {
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  },

  // Account management
  async register(params: {
    name: string;
    userid: string;
    password: string;
    whats_app_number?: string;
    profile_photo?: string;
  }): Promise<{ success: boolean; error?: string; account?: Account }> {
    const cleanUserId = params.userid.trim().toLowerCase().replace(/^@/, '');
    
    // Check if userid already exists
    const { data: existing, error: checkError } = await supabase
      .from('kabirdatabase_account')
      .select('user_iid')
      .eq('userid', cleanUserId)
      .maybeSingle();

    if (checkError) {
      return { success: false, error: 'Database connection error: ' + checkError.message };
    }
    if (existing) {
      return { success: false, error: 'This username is already taken. Please choose another one.' };
    }

    const { data, error } = await supabase
      .from('kabirdatabase_account')
      .insert([
        {
          name: params.name.trim(),
          userid: cleanUserId,
          password: params.password,
          whats_app_number: params.whats_app_number ? Number(params.whats_app_number.replace(/\D/g, '')) : null,
          profile_photo: params.profile_photo || null,
          post_limit: 5
        }
      ])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    this.setCurrentUser(data);
    return { success: true, account: data };
  },

  async login(userid: string, password: string): Promise<{ success: boolean; error?: string; account?: Account }> {
    const cleanUserId = userid.trim().toLowerCase().replace(/^@/, '');

    const { data, error } = await supabase
      .from('kabirdatabase_account')
      .select('*')
      .eq('userid', cleanUserId)
      .eq('password', password)
      .maybeSingle();

    if (error) {
      return { success: false, error: 'Login failed: ' + error.message };
    }
    if (!data) {
      return { success: false, error: 'Incorrect username or password!' };
    }

    this.setCurrentUser(data);
    return { success: true, account: data };
  },

  async getAccountCount(userIid: number): Promise<number> {
    const { count, error } = await supabase
      .from('kabirdatabase_post')
      .select('*', { count: 'exact', head: true })
      .eq('user_iid', userIid);

    if (error) return 0;
    return count || 0;
  },

  async getTodayPostCount(userIid: number): Promise<number> {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const { count, error } = await supabase
      .from('kabirdatabase_post')
      .select('*', { count: 'exact', head: true })
      .eq('user_iid', userIid)
      .gte('created_at', startOfToday);

    if (error) {
      console.error('getTodayPostCount error:', error);
      return 0;
    }
    return count || 0;
  },

  async getAccount(userIid: number): Promise<Account | null> {
    const { data, error } = await supabase
      .from('kabirdatabase_account')
      .select('user_iid, name, userid, created_at, post_limit, whats_app_number, profile_photo')
      .eq('user_iid', userIid)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  },

  async updateAccount(params: UpdateAccountParams): Promise<{ success: boolean; error?: string; account?: Account }> {
    // 1. Fetch current account record including password
    const { data: current, error: fetchErr } = await supabase
      .from('kabirdatabase_account')
      .select('*')
      .eq('user_iid', params.user_iid)
      .maybeSingle();

    if (fetchErr || !current) {
      return { success: false, error: 'Account not found.' };
    }

    const updates: Record<string, any> = {};

    // 2. Validate and handle username change
    if (params.userid !== undefined) {
      const cleanUserId = params.userid.trim().toLowerCase().replace(/^@/, '');
      if (!cleanUserId) {
        return { success: false, error: 'Username cannot be empty.' };
      }
      if (cleanUserId !== current.userid) {
        // Check uniqueness
        const { data: existing, error: checkError } = await supabase
          .from('kabirdatabase_account')
          .select('user_iid')
          .eq('userid', cleanUserId)
          .neq('user_iid', params.user_iid)
          .maybeSingle();

        if (checkError) {
          return { success: false, error: 'Database connection error: ' + checkError.message };
        }
        if (existing) {
          return { success: false, error: 'This username is already taken. Please choose another one.' };
        }
        updates.userid = cleanUserId;
      }
    }

    // 3. Name update
    if (params.name !== undefined) {
      const cleanName = params.name.trim();
      if (!cleanName) {
        return { success: false, error: 'Full name cannot be empty.' };
      }
      updates.name = cleanName;
    }

    // 4. WhatsApp update
    if (params.whats_app_number !== undefined) {
      updates.whats_app_number = params.whats_app_number 
        ? Number(String(params.whats_app_number).replace(/\D/g, '')) 
        : null;
    }

    // 5. Profile photo update
    if (params.profile_photo !== undefined) {
      updates.profile_photo = params.profile_photo ? params.profile_photo.trim() : null;
    }

    // 6. Password update
    if (params.newPassword && params.newPassword.trim()) {
      if (!params.currentPassword) {
        return { success: false, error: 'Please enter your current password to change password.' };
      }
      if (params.currentPassword !== current.password) {
        return { success: false, error: 'Current password is incorrect!' };
      }
      if (params.newPassword.length < 4) {
        return { success: false, error: 'New password must be at least 4 characters long.' };
      }
      updates.password = params.newPassword;
    }

    // 7. Perform update in database if there are changes
    if (Object.keys(updates).length === 0) {
      return { success: true, account: current };
    }

    const { data: updated, error: updateErr } = await supabase
      .from('kabirdatabase_account')
      .update(updates)
      .eq('user_iid', params.user_iid)
      .select('user_iid, name, userid, created_at, post_limit, whats_app_number, profile_photo')
      .single();

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    // Update local storage session
    this.setCurrentUser(updated);
    return { success: true, account: updated };
  },

  // Postcard management
  async fetchPostcards(): Promise<Postcard[]> {
    const { data, error } = await supabase
      .from('kabirdatabase_postcard')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch postcards error:', error);
      return [];
    }
    return data || [];
  },

  async addPostcard(params: { image_url: string; title?: string }): Promise<Postcard | null> {
    const { data, error } = await supabase
      .from('kabirdatabase_postcard')
      .insert([
        {
          image_url: params.image_url,
          title: params.title || null
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Add postcard error:', error);
      return null;
    }
    return data;
  },

  async deletePostcard(postcardIid: number): Promise<boolean> {
    const { error } = await supabase
      .from('kabirdatabase_postcard')
      .delete()
      .eq('postcard_iid', postcardIid);

    return !error;
  },

  // Post management
  async fetchApprovedPosts(): Promise<Post[]> {
    const { data, error } = await supabase
      .from('kabirdatabase_post')
      .select(`
        *,
        author:kabirdatabase_account(
          user_iid,
          name,
          userid,
          profile_photo
        ),
        postcard:kabirdatabase_postcard(
          postcard_iid,
          image_url,
          title,
          thumbnail_url
        )
      `)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch approved posts error:', error);
      return [];
    }

    return (data || []).map(p => ({
      ...p,
      post_iid: p.post_iid,
      image_iid: p.post_iid,
      like_count: Number(p.like_count) || 0,
      user_comment: Array.isArray(p.user_comment) ? p.user_comment : []
    }));
  },

  async fetchUserPosts(userIid: number): Promise<Post[]> {
    const { data, error } = await supabase
      .from('kabirdatabase_post')
      .select(`
        *,
        author:kabirdatabase_account(
          user_iid,
          name,
          userid,
          profile_photo,
          whats_app_number
        ),
        postcard:kabirdatabase_postcard(
          postcard_iid,
          image_url,
          title,
          thumbnail_url
        )
      `)
      .eq('user_iid', userIid)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch user posts error:', error);
      return [];
    }

    return (data || []).map(p => ({
      ...p,
      post_iid: p.post_iid,
      image_iid: p.post_iid,
      like_count: Number(p.like_count) || 0,
      user_comment: Array.isArray(p.user_comment) ? p.user_comment : []
    }));
  },

  async fetchAllPostsForAdmin(): Promise<Post[]> {
    const { data, error } = await supabase
      .from('kabirdatabase_post')
      .select(`
        *,
        author:kabirdatabase_account(
          user_iid,
          name,
          userid,
          profile_photo,
          whats_app_number
        ),
        postcard:kabirdatabase_postcard(
          postcard_iid,
          image_url,
          title,
          thumbnail_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch admin posts error:', error);
      return [];
    }

    return (data || []).map(p => ({
      ...p,
      post_iid: p.post_iid,
      image_iid: p.post_iid,
      like_count: Number(p.like_count) || 0,
      user_comment: Array.isArray(p.user_comment) ? p.user_comment : []
    }));
  },

  async createPost(params: {
    user_iid: number;
    title: string;
    description: string;
    image_url?: string;
    postcard_iid?: number | null;
  }): Promise<{ success: boolean; error?: string; post?: Post }> {
    // Check user's daily post limit (5 posts per day)
    const { data: userAcc } = await supabase
      .from('kabirdatabase_account')
      .select('post_limit')
      .eq('user_iid', params.user_iid)
      .single();

    const dailyLimit = userAcc?.post_limit ?? 5;
    const todayCount = await this.getTodayPostCount(params.user_iid);

    if (todayCount >= dailyLimit) {
      return { 
        success: false, 
        error: `You have reached your daily limit of ${dailyLimit} posts for today. You can submit more posts tomorrow!` 
      };
    }

    const { data, error } = await supabase
      .from('kabirdatabase_post')
      .insert([
        {
          user_iid: params.user_iid,
          title: params.title.trim() || null,
          description: params.description.trim() || null,
          image_url: params.image_url || null,
          postcard_iid: params.postcard_iid || null,
          is_approved: false, // Must be approved by admin
          like_count: 0,
          user_comment: []
        }
      ])
      .select(`
        *,
        author:kabirdatabase_account(
          user_iid,
          name,
          userid,
          profile_photo,
          whats_app_number
        ),
        postcard:kabirdatabase_postcard(
          postcard_iid,
          image_url,
          title,
          thumbnail_url
        )
      `)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { 
      success: true, 
      post: {
        ...data,
        post_iid: data.post_iid,
        image_iid: data.post_iid,
        like_count: 0,
        user_comment: []
      } 
    };
  },

  async toggleLike(postId: number, newCount: number): Promise<boolean> {
    const { error } = await supabase
      .from('kabirdatabase_post')
      .update({ like_count: newCount })
      .eq('post_iid', postId);

    return !error;
  },

  async addComment(postId: number, comment: CommentItem): Promise<boolean> {
    // Fetch current comments
    const { data, error: fetchErr } = await supabase
      .from('kabirdatabase_post')
      .select('user_comment')
      .eq('post_iid', postId)
      .single();

    if (fetchErr) return false;

    const comments = Array.isArray(data?.user_comment) ? data.user_comment : [];
    const updatedComments = [...comments, comment];

    const { error } = await supabase
      .from('kabirdatabase_post')
      .update({ user_comment: updatedComments })
      .eq('post_iid', postId);

    return !error;
  },

  async updatePost(params: {
    post_iid: number;
    user_iid: number;
    title: string;
    description: string;
    postcard_iid?: number | null;
    image_url?: string | null;
  }): Promise<{ success: boolean; error?: string; post?: Post }> {
    const { data, error } = await supabase
      .from('kabirdatabase_post')
      .update({
        title: params.title.trim() || null,
        description: params.description.trim() || null,
        postcard_iid: params.postcard_iid || null,
        image_url: params.image_url || null,
        is_approved: false // Explicitly resets to false so admin must approve again
      })
      .eq('post_iid', params.post_iid)
      .eq('user_iid', params.user_iid)
      .select(`
        *,
        author:kabirdatabase_account(
          user_iid,
          name,
          userid,
          profile_photo,
          whats_app_number
        ),
        postcard:kabirdatabase_postcard(
          postcard_iid,
          image_url,
          title,
          thumbnail_url
        )
      `)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      post: {
        ...data,
        post_iid: data.post_iid,
        image_iid: data.post_iid,
        like_count: Number(data.like_count) || 0,
        user_comment: Array.isArray(data.user_comment) ? data.user_comment : []
      }
    };
  },

  async approvePost(postId: number): Promise<boolean> {
    const { error } = await supabase
      .from('kabirdatabase_post')
      .update({ is_approved: true })
      .eq('post_iid', postId);

    return !error;
  },

  async deletePost(postId: number): Promise<boolean> {
    const { error } = await supabase
      .from('kabirdatabase_post')
      .delete()
      .eq('post_iid', postId);

    return !error;
  },

  // Admin Account Management
  async fetchAllAccountsForAdmin(): Promise<Account[]> {
    const { data, error } = await supabase
      .from('kabirdatabase_account')
      .select('*')
      .order('user_iid', { ascending: false });

    if (error) {
      console.error('Fetch all accounts error:', error);
      return [];
    }
    return data || [];
  },

  async updateAccountLimit(userIid: number, newLimit: number): Promise<boolean> {
    const { error } = await supabase
      .from('kabirdatabase_account')
      .update({ post_limit: newLimit })
      .eq('user_iid', userIid);

    return !error;
  },

  async updateAccountPasswordByAdmin(userIid: number, newPass: string): Promise<boolean> {
    const { error } = await supabase
      .from('kabirdatabase_account')
      .update({ password: newPass })
      .eq('user_iid', userIid);

    return !error;
  },

  async deleteAccountByAdmin(userIid: number): Promise<boolean> {
    const { error } = await supabase
      .from('kabirdatabase_account')
      .delete()
      .eq('user_iid', userIid);

    return !error;
  }
};

export function formatTimeAgo(dateString: string): string {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return 'Recently';
  }
}

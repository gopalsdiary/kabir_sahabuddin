import { supabase } from './supabase';

export interface SiteMetadata {
  title: string;
  description: string;
  keywords: string;
  author: string;
  og_image: string;
}

export interface HeroContent {
  eyebrow: string;
  title_prefix: string;
  title_emphasis: string;
  title_suffix: string;
  lede: string;
  cta_primary: { text: string; url: string };
  cta_secondary: { text: string; url: string };
  location: string;
  birth_date: string;
  portrait_image: string;
  image_tag: string;
  caption_number: string;
  caption_text: string;
}

export interface AboutContent {
  kicker_number: string;
  kicker_text: string;
  heading: string;
  heading_emphasis: string;
  paragraphs: string[];
  link: { text: string; url: string };
  identity_strip: Array<{ label: string; value: string }>;
}

export interface BookItem {
  id: string;
  title_bn: string;
  title_en: string;
  author: string;
  category: string;
  display_title: string;
  url: string;
  action_label: string;
  cover_class: string;
  card_class?: string;
}

export interface BooksContent {
  kicker_number: string;
  kicker_text: string;
  heading: string;
  description: string;
  items: BookItem[];
}

export interface AudioItem {
  id: string;
  number: string;
  title: string;
  title_bn?: string;
  subtitle: string;
  category: string;
  description?: string;
  url: string;
  action_label: string;
  art_class: string;
  is_featured?: boolean;
}

export interface AudioContent {
  kicker_number: string;
  kicker_text: string;
  heading_prefix: string;
  heading_emphasis: string;
  channel_cta: { text: string; url: string };
  items: AudioItem[];
  bottom_links: Array<{ text: string; url: string }>;
}

export interface FilmContent {
  kicker_number: string;
  kicker_text: string;
  poster: {
    tag: string;
    title_bn: string;
    title_en: string;
    studio: string;
    mark: string;
  };
  headline_lines: string[];
  headline_emphasis: string;
  description: string;
  details: Array<{ label: string; value: string }>;
  cta: { text: string; url: string };
}

export interface PressItem {
  id: string;
  no: string;
  source: string;
  title: string;
  url: string;
}

export interface PressContent {
  kicker_number: string;
  kicker_text: string;
  heading: string;
  description: string;
  items: PressItem[];
}

export interface ConnectLink {
  platform: string;
  action: string;
  url: string;
}

export interface ConnectContent {
  kicker_number: string;
  kicker_text: string;
  heading_prefix: string;
  heading_emphasis: string;
  description: string;
  links: ConnectLink[];
}

export interface FooterContent {
  brand_mark: string;
  brand_name_prefix: string;
  brand_name_bold: string;
  tagline: string;
  copyright: string;
}

export interface PortfolioData {
  id?: number;
  site_metadata: SiteMetadata;
  hero: HeroContent;
  marquee: string[];
  about: AboutContent;
  books: BooksContent;
  audio: AudioContent;
  film: FilmContent;
  press: PressContent;
  connect: ConnectContent;
  footer: FooterContent;
  created_at?: string;
  updated_at?: string;
}

export const portfolioService = {
  /**
   * Directly fetch portfolio data from Supabase table `kabirdatabase_home`.
   * No hardcoded default data is stored or returned.
   */
  async getPortfolioData(): Promise<PortfolioData | null> {
    try {
      const { data, error } = await supabase
        .from('kabirdatabase_home')
        .select('*')
        .order('id', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error querying kabirdatabase_home from Supabase:', error);
        return null;
      }

      if (!data) {
        console.warn('No record found in kabirdatabase_home table.');
        return null;
      }

      return data as PortfolioData;
    } catch (err) {
      console.error('Unexpected error fetching portfolio data:', err);
      return null;
    }
  },

  /**
   * Save or update an individual section in `kabirdatabase_home`.
   * Allows modular, section-by-section updating without altering other columns.
   */
  async savePortfolioSection<K extends keyof PortfolioData>(
    section: K,
    value: PortfolioData[K]
  ): Promise<{ success: boolean; error?: any }> {
    try {
      // Find the existing row id
      const { data: existing, error: selectErr } = await supabase
        .from('kabirdatabase_home')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (selectErr) throw selectErr;

      const payload = {
        [section]: value,
        updated_at: new Date().toISOString()
      };

      if (existing?.id) {
        const { error } = await supabase
          .from('kabirdatabase_home')
          .update(payload)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('kabirdatabase_home')
          .insert([payload]);
        if (error) throw error;
      }

      return { success: true };
    } catch (err) {
      console.error(`Failed to save section "${String(section)}":`, err);
      return { success: false, error: err };
    }
  },

  /**
   * Save the entire portfolio data object to `kabirdatabase_home`.
   */
  async savePortfolioData(data: PortfolioData): Promise<{ success: boolean; error?: any }> {
    try {
      const payload: Record<string, any> = {
        site_metadata: data.site_metadata,
        hero: data.hero,
        marquee: data.marquee,
        about: data.about,
        books: data.books,
        audio: data.audio,
        film: data.film,
        press: data.press,
        connect: data.connect,
        footer: data.footer,
        updated_at: new Date().toISOString()
      };

      if (data.id) {
        const { error } = await supabase
          .from('kabirdatabase_home')
          .update(payload)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { data: existing } = await supabase
          .from('kabirdatabase_home')
          .select('id')
          .limit(1)
          .maybeSingle();

        if (existing?.id) {
          const { error } = await supabase
            .from('kabirdatabase_home')
            .update(payload)
            .eq('id', existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('kabirdatabase_home')
            .insert([payload]);
          if (error) throw error;
        }
      }

      return { success: true };
    } catch (err) {
      console.error('Failed to save portfolio data to Supabase:', err);
      return { success: false, error: err };
    }
  }
};

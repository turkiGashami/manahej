/**
 * Hand-written database types mirroring supabase/migrations/0001_init.sql.
 * Once a Supabase project exists you can regenerate these with the CLI/MCP
 * (`generate_typescript_types`) and replace this file.
 */

export type CurriculumStatus = 'draft' | 'published' | 'removed';
export type ContributorType = 'author' | 'publisher' | 'center';
export type ProfileRole = 'contributor' | 'admin';
export type ReportStatus = 'open' | 'reviewed' | 'actioned';

export interface Stage {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  sort_order: number;
}

export interface Subject {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  sort_order: number;
}

export interface Language {
  id: string;
  code: string;
  name_ar: string;
  name_en: string;
  direction: 'rtl' | 'ltr';
}

export interface Contributor {
  id: string;
  name_ar: string;
  name_en: string | null;
  type: ContributorType;
  user_id: string | null;
}

export interface Profile {
  id: string;
  role: ProfileRole;
  display_name: string | null;
}

export interface Curriculum {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string | null;
  description: string | null;
  cover_url: string | null;
  pdf_url: string | null;
  page_count: number | null;
  file_size: number | null;
  stage_id: string;
  subject_id: string;
  grade: string | null;
  language_id: string;
  contributor_id: string;
  version: string;
  status: CurriculumStatus;
  is_editor_pick: boolean;
  download_count: number;
  created_at: string;
  updated_at: string;
}

/** A curriculum joined with its reference rows, as the listing UI consumes it. */
export interface CurriculumWithRefs extends Curriculum {
  stage: Pick<Stage, 'slug' | 'name_ar' | 'name_en'> | null;
  subject: Pick<Subject, 'slug' | 'name_ar' | 'name_en'> | null;
  language: Pick<Language, 'code' | 'name_ar' | 'name_en' | 'direction'> | null;
  contributor: Pick<Contributor, 'name_ar' | 'name_en' | 'type'> | null;
}

export interface Report {
  id: string;
  curriculum_id: string;
  reason: string;
  message: string | null;
  reporter_email: string | null;
  status: ReportStatus;
  created_at: string;
}

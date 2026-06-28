'use server';

import { PDFDocument } from 'pdf-lib';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { PDF_BUCKET, COVER_BUCKET } from '@/lib/supabase/env';
import { slugify } from '@/lib/utils';
import type { ContributorType } from '@/types/database';

export type UploadState = { ok: boolean; error?: string; slug?: string };

const CONTRIBUTOR_TYPES: ContributorType[] = ['author', 'publisher', 'center'];

async function pdfPageCount(bytes: Uint8Array): Promise<number | null> {
  try {
    const doc = await PDFDocument.load(bytes, { updateMetadata: false });
    return doc.getPageCount();
  } catch {
    return null; // not fatal — store null
  }
}

export async function uploadCurriculum(
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, error: 'not-configured' };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'unauthorized' };

  // --- Read & validate input -------------------------------------------------
  const titleAr = String(formData.get('title_ar') || '').trim();
  const titleEn = String(formData.get('title_en') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const stageSlug = String(formData.get('stage') || '');
  const subjectSlug = String(formData.get('subject') || '');
  const langCode = String(formData.get('lang') || '');
  const grade = String(formData.get('grade') || '').trim();
  const version = String(formData.get('version') || '1.0').trim() || '1.0';
  const contributorName = String(formData.get('contributor_name') || '').trim();
  const contributorTypeRaw = String(formData.get('contributor_type') || 'author');
  const contributorType: ContributorType = CONTRIBUTOR_TYPES.includes(
    contributorTypeRaw as ContributorType,
  )
    ? (contributorTypeRaw as ContributorType)
    : 'author';

  const pdf = formData.get('pdf');
  const cover = formData.get('cover');

  if (!titleAr || !stageSlug || !subjectSlug || !langCode || !contributorName) {
    return { ok: false, error: 'missing-fields' };
  }
  if (!(pdf instanceof File) || pdf.size === 0) return { ok: false, error: 'missing-pdf' };
  if (pdf.type !== 'application/pdf' && !pdf.name.toLowerCase().endsWith('.pdf')) {
    return { ok: false, error: 'not-pdf' };
  }

  // --- Resolve reference ids -------------------------------------------------
  const [{ data: stage }, { data: subject }, { data: language }] = await Promise.all([
    supabase.from('stages').select('id').eq('slug', stageSlug).maybeSingle(),
    supabase.from('subjects').select('id').eq('slug', subjectSlug).maybeSingle(),
    supabase.from('languages').select('id').eq('code', langCode).maybeSingle(),
  ]);
  if (!stage || !subject || !language) return { ok: false, error: 'bad-taxonomy' };

  // --- Find or create the contributor ---------------------------------------
  let contributorId: string;
  const { data: existing } = await supabase
    .from('contributors')
    .select('id')
    .eq('name_ar', contributorName)
    .maybeSingle();
  if (existing) {
    contributorId = (existing as { id: string }).id;
  } else {
    const { data: created, error: cErr } = await supabase
      .from('contributors')
      .insert({
        name_ar: contributorName,
        name_en: null,
        type: contributorType,
        user_id: user.id,
      })
      .select('id')
      .single();
    if (cErr || !created) return { ok: false, error: 'contributor-failed' };
    contributorId = (created as { id: string }).id;
  }

  // --- Upload files ----------------------------------------------------------
  const pdfBytes = new Uint8Array(await pdf.arrayBuffer());
  const fileSize = pdf.size;
  const pageCount = await pdfPageCount(pdfBytes);

  const uid = crypto.randomUUID();
  const pdfPath = `${user.id}/${uid}.pdf`;

  const { error: upErr } = await supabase.storage
    .from(PDF_BUCKET)
    .upload(pdfPath, pdfBytes, { contentType: 'application/pdf', upsert: false });
  if (upErr) return { ok: false, error: 'pdf-upload-failed' };

  const pdfUrl = supabase.storage.from(PDF_BUCKET).getPublicUrl(pdfPath).data.publicUrl;

  let coverUrl: string | null = null;
  if (cover instanceof File && cover.size > 0) {
    const ext = cover.name.split('.').pop()?.toLowerCase() || 'jpg';
    const coverPath = `${user.id}/${uid}.${ext}`;
    const coverBytes = new Uint8Array(await cover.arrayBuffer());
    const { error: covErr } = await supabase.storage
      .from(COVER_BUCKET)
      .upload(coverPath, coverBytes, { contentType: cover.type || 'image/jpeg' });
    if (!covErr) {
      coverUrl = supabase.storage.from(COVER_BUCKET).getPublicUrl(coverPath).data.publicUrl;
    }
  }

  // --- Insert the draft curriculum ------------------------------------------
  const slug = `${slugify(titleEn || titleAr) || 'curriculum'}-${uid.slice(0, 6)}`;

  const { error: insErr } = await supabase.from('curricula').insert({
    slug,
    title_ar: titleAr,
    title_en: titleEn || null,
    description: description || null,
    cover_url: coverUrl,
    pdf_url: pdfUrl,
    page_count: pageCount,
    file_size: fileSize,
    stage_id: (stage as { id: string }).id,
    subject_id: (subject as { id: string }).id,
    language_id: (language as { id: string }).id,
    contributor_id: contributorId,
    grade: grade || null,
    version,
    created_by: user.id,
    status: 'draft',
  });
  if (insErr) {
    console.error('uploadCurriculum insert error:', insErr.message);
    return { ok: false, error: 'insert-failed' };
  }

  return { ok: true, slug };
}

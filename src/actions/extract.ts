"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireAdmin } from "@/lib/auth-guard";

export type ExtractedAssetData = {
  nama_barang: string | null;
  kategori: string | null;
  merk: string | null;
  type_model: string | null;
  serial_number: string | null;
  tahun_barang: number | null;
  tahun_pembelian: number | null;
  sumber_dana: string | null;
  vendor: string | null;
  pengguna: string | null;
  jabatan: string | null;
  kondisi: string | null;
  keterangan: string | null;
};

type ExtractResult = {
  success: boolean;
  data?: ExtractedAssetData;
  error?: string;
};

const EXTRACTION_PROMPT = `Ekstrak informasi aset/barang inventaris dari gambar ini ke format JSON.
Jika field tidak ditemukan atau tidak terbaca, isi dengan null.
Respond ONLY with valid JSON, no markdown, no explanation.

{
  "nama_barang": string | null,
  "kategori": string | null,
  "merk": string | null,
  "type_model": string | null,
  "serial_number": string | null,
  "tahun_barang": number | null,
  "tahun_pembelian": number | null,
  "sumber_dana": string | null,
  "vendor": string | null,
  "pengguna": string | null,
  "jabatan": string | null,
  "kondisi": string | null,
  "keterangan": string | null
}`;

// Fallback chain: newest → stable → most available
const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",   // lighter, separate quota from gemini-2.0-flash
  "gemini-2.0-flash",
  "gemini-1.5-flash-latest", // correct model name for v1beta API
];

function isRetryableError(e: unknown): boolean {
  if (!(e instanceof Error)) return false;
  // 429 = quota/rate limit, 503 = overloaded, 404 = model not available (try next)
  return (
    e.message.includes("429") ||
    e.message.includes("503") ||
    e.message.includes("404")
  );
}

export async function extractAssetFromImage(
  formData: FormData
): Promise<ExtractResult> {
  try {
    await requireAdmin();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { success: false, error: "GEMINI_API_KEY belum dikonfigurasi" };
    }

    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, error: "File tidak ditemukan" };
    }

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        error: "Format file tidak didukung (JPG, PNG, WEBP, PDF)",
      };
    }

    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: "Ukuran file maksimal 10MB" };
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const genAI = new GoogleGenerativeAI(apiKey);

    let lastError: unknown = null;

    // Try each model in the fallback chain
    for (const modelName of GEMINI_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent([
          EXTRACTION_PROMPT,
          {
            inlineData: {
              mimeType: file.type,
              data: base64,
            },
          },
        ]);

        const responseText = result.response.text();

        // Clean markdown code blocks if present
        const cleaned = responseText
          .replace(/```json\s*/g, "")
          .replace(/```\s*/g, "")
          .trim();

        const parsed: ExtractedAssetData = JSON.parse(cleaned);
        console.log(`extractAssetFromImage: success with model ${modelName}`);
        return { success: true, data: parsed };
      } catch (e) {
        console.warn(
          `extractAssetFromImage: model ${modelName} failed:`,
          e instanceof Error ? e.message : e
        );
        lastError = e;

        // Only try next model if it's a retryable error (429 / 503)
        if (!isRetryableError(e)) break;
      }
    }

    // All models failed
    console.error("extractAssetFromImage: all models failed:", lastError);

    if (lastError instanceof SyntaxError) {
      return { success: false, error: "Gagal memproses respons AI" };
    }
    if (lastError instanceof Error && isRetryableError(lastError)) {
      return {
        success: false,
        error:
          "Layanan AI sedang sibuk. Silakan coba lagi dalam beberapa saat.",
      };
    }
    return { success: false, error: "Gagal mengekstrak data dari gambar" };
  } catch (e) {
    console.error("extractAssetFromImage error:", e);
    return { success: false, error: "Terjadi kesalahan yang tidak terduga" };
  }
}

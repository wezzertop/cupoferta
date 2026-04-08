import sharp from 'sharp';
import { createClient } from '@/lib/supabase/server';

export async function processAndUploadImage(url: string, userId: string): Promise<string | null> {
  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      console.error(`Failed to fetch image from ${url}`);
      return null;
    }
    
    // Read the arrayBuffer
    const arrayBuffer = await resp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process with sharp (Square 1:1, white background padding)
    const MAX_SIZE = 800;
    const processedBuffer = await sharp(buffer)
      .resize(MAX_SIZE, MAX_SIZE, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    const fileName = `${Math.random().toString(36).substring(2,15)}.jpg`;
    const filePath = `${userId}/${fileName}`;
    
    // Server-side supabase client
    const supabase = createClient();
    const { error: uploadError } = await supabase.storage.from('deal_images').upload(filePath, processedBuffer, {
      contentType: 'image/jpeg',
      upsert: true
    });

    if (uploadError) {
      console.error("Upload Error:", uploadError.message);
      return null;
    }

    const { data } = supabase.storage.from('deal_images').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    console.error("Error processing image url:", error);
    return null;
  }
}

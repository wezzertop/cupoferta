import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import exceljs from 'exceljs';
import stringSimilarity from 'string-similarity';
import { processAndUploadImage } from '@/lib/image-processing';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No se encontró archivo en la petición.' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.worksheets[0]; // Coger la primera hoja
    if (!worksheet) {
      return NextResponse.json({ error: 'El archivo Excel está vacío.' }, { status: 400 });
    }

    // Identificar cabeceras
    const headerRow = worksheet.getRow(1);
    const headers: Record<string, number> = {};
    headerRow.eachCell((cell, colNumber) => {
      let headerText = cell.value?.toString().trim().toUpperCase();
      if (headerText) {
        headerText = headerText.replace(/\*/g, '').trim(); // Remove strict indicators
        headers[headerText] = colNumber;
      }
    });

    const requiredHeaders = ['TITLE', 'DESCRIPTION', 'PRICE', 'STORE', 'CATEGORY', 'LINK'];
    const missingHeaders = requiredHeaders.filter(h => !headers[h] && !headers['ID (NO TOCAR)']);
    
    // Asumir que "ID (NO TOCAR)" puede tener ID
    const ID_HDR = headers['ID (NO TOCAR)'] || headers['ID'];

    if (missingHeaders.length > 0) {
      return NextResponse.json({ 
        error: `Faltan cabeceras requeridas en el Excel: ${missingHeaders.join(', ')}. Descarga la plantilla primero.` 
      }, { status: 400 });
    }

    // Extraer filas para proceso
    const rowsToProcess: any[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip cabecera
      
      const id = ID_HDR ? row.getCell(ID_HDR).value?.toString().trim() : null;
      const title = row.getCell(headers['TITLE']).value?.toString().trim();
      const description = row.getCell(headers['DESCRIPTION']).value?.toString().trim();
      
      let price = parseFloat(row.getCell(headers['PRICE']).value?.toString() || '0');
      let oldPriceRaw = row.getCell(headers['OLD_PRICE'])?.value?.toString();
      let old_price = oldPriceRaw ? parseFloat(oldPriceRaw) : null;
      
      const store = row.getCell(headers['STORE']).value?.toString().trim() || 'Otra';
      const category = row.getCell(headers['CATEGORY']).value?.toString().trim() || 'Otra';
      let linkText = row.getCell(headers['LINK']).value;
      // Excel URLs might be Objects { text: "url", hyperlink: "url" }
      const link = typeof linkText === 'object' && linkText !== null && 'hyperlink' in linkText ? (linkText as any).hyperlink : linkText?.toString().trim();
      
      const deal_type = row.getCell(headers['DEAL_TYPE'])?.value?.toString().trim() || 'offer';
      const coupon_code = row.getCell(headers['COUPON_CODE'])?.value?.toString().trim() || null;
      const shipping_type = row.getCell(headers['SHIPPING_TYPE'])?.value?.toString().trim() || 'Gratis';

      // Advanced Optional Fields
      let expiresAtValue = row.getCell(headers['EXPIRES_AT'])?.value;
      let expires_at = null;
      if (expiresAtValue instanceof Date) {
         expires_at = expiresAtValue.toISOString();
      } else if (typeof expiresAtValue === 'string') {
         // Attempt to parse string if it's YYYY-MM-DD
         const parsedDate = new Date(expiresAtValue);
         if (!isNaN(parsedDate.getTime())) expires_at = parsedDate.toISOString();
      }

      // Collect images
      const images: string[] = [];
      ['IMAGE_1', 'IMAGE_2', 'IMAGE_3', 'IMAGE_4'].forEach(imgKey => {
         if (headers[imgKey]) {
            let cellVal = row.getCell(headers[imgKey]).value;
            let imgUrl = typeof cellVal === 'object' && cellVal !== null && 'hyperlink' in cellVal ? (cellVal as any).hyperlink : cellVal?.toString().trim();
            if (imgUrl) images.push(imgUrl);
         }
      });

      if (title && description && link) {
        rowsToProcess.push({
          rowNumber,
          id,
          title,
          description,
          price: isNaN(price) ? 0 : price,
          old_price: isNaN(old_price as number) ? null : old_price,
          store,
          category,
          link,
          deal_type,
          coupon_code,
          shipping_type,
          expires_at,
          image_url: images
        });
      }
    });

    if (rowsToProcess.length === 0) {
      return NextResponse.json({ error: 'No se encontraron filas con datos válidos para procesar.' }, { status: 400 });
    }

    // Traer todos los deals relevantes para la lógica de duplicados (en las mismas tiendas subidas)
    const storesInProcess = Array.from(new Set(rowsToProcess.map(r => r.store)));
    
    // Pre-cargar la DB para comparar en memoria y no hacer miles de llamadas DB
    const { data: existingDeals, error: dbErr } = await supabase
      .from('deals')
      .select('id, user_id, title, store, link, image_url')
      .in('store', storesInProcess);

    if (dbErr) {
      return NextResponse.json({ error: 'Error accediendo a la base de datos para verificación de duplicados' }, { status: 500 });
    }

    const report = {
      inserted: 0,
      updated: 0,
      failed: 0,
      errors: [] as { row: number; title: string; issue: string }[]
    };

    for (const row of rowsToProcess) {
      // 1. Es un UPDATE (Upsert) a través del ID
      if (row.id) {
        // Verificar si existe y pertenece al usuario
        const existing = existingDeals?.find(d => d.id === row.id);
        if (existing) {
          if (existing.user_id !== user.id) {
            report.failed++;
            report.errors.push({ row: row.rowNumber, title: row.title, issue: 'No puedes editar un deal que no es tuyo.' });
            continue;
          }
          
          // Process Images from Excel if they are new or modified!
          let finalImages: string[] = existing.image_url || [];
          if (row.image_url && row.image_url.length > 0) {
             const processed = await Promise.all(row.image_url.map(async (url: string) => {
                if (url.includes('supabase.co/storage/v1/object/public/deal_images')) return url;
                return await processAndUploadImage(url, user.id);
             }));
             finalImages = processed.filter(Boolean) as string[];
          }
          
          // Ejecutar Update
          const { error: patchErr } = await supabase.from('deals').update({
            title: row.title,
            description: row.description,
            price: row.price,
            old_price: row.old_price,
            category: row.category,
            store: row.store,
            link: row.link,
            deal_type: row.deal_type,
            coupon_code: row.coupon_code,
            shipping_type: row.shipping_type,
            expires_at: row.expires_at,
            image_url: finalImages, // Uses the freshly processed images, or conserved if none
            status: 'pending' // Volver a sugerir revisión por seguridad
          }).eq('id', row.id);
          
          if (patchErr) {
            report.failed++;
            report.errors.push({ row: row.rowNumber, title: row.title, issue: 'Error en la actualización: ' + patchErr.message });
          } else {
            report.updated++;
          }
          continue;
        }
      }

      // 2. Es un INSERT (Nuevo Deal)
      // Lógica de Duplicados
      
      // Coincidencia exacta de LINK
      const exactLink = existingDeals?.find(d => d.link === row.link);
      if (exactLink) {
        report.failed++;
        report.errors.push({ 
          row: row.rowNumber, 
          title: row.title, 
          issue: `Duplicado exacto por enlace detectado en la plataforma. Sugerimos "Editar oferta existente".` 
        });
        continue;
      }

      // Similitud de TÍTULO dentro de la MISMA TIENDA
      const sameStoreDeals = existingDeals?.filter(d => d.store === row.store) || [];
      const sameStoreTitles = sameStoreDeals.map(d => d.title);
      
      if (sameStoreTitles.length > 0) {
        const matches = stringSimilarity.findBestMatch(row.title, sameStoreTitles);
        if (matches.bestMatch.rating > 0.85) { // 85% similitud
          report.failed++;
          report.errors.push({ 
            row: row.rowNumber, 
            title: row.title, 
            issue: `Posible duplicado. Se parece demasiado a "${matches.bestMatch.target}". Revisa si ya existe o cámbiale el nombre.`
          });
          continue;
        }
      }

      // Process Images from Excel if they are new or modified!
      let finalImages: string[] = [];
      if (row.image_url && row.image_url.length > 0) {
         // Run sharply for all 4
         const processed = await Promise.all(row.image_url.map(async (url: string) => {
            // Fast skip logic for already-processed supadase links, saving computation
            if (url.includes('supabase.co/storage/v1/object/public/deal_images')) return url;
            return await processAndUploadImage(url, user.id);
         }));
         finalImages = processed.filter(Boolean) as string[];
      }

      const insertData = {
        user_id: user.id, // Seguridad y Trazabilidad obligatoria (Server-Side)
        title: row.title,
        description: row.description,
        price: row.price,
        old_price: row.old_price,
        store: row.store,
        category: row.category,
        link: row.link,
        deal_type: row.deal_type,
        coupon_code: row.coupon_code,
        shipping_type: row.shipping_type,
        status: 'pending',
        expires_at: row.expires_at,
        image_url: finalImages 
      };

      const { error: insertErr } = await supabase.from('deals').insert(insertData);
      
      if (insertErr) {
        report.failed++;
        report.errors.push({ row: row.rowNumber, title: row.title, issue: 'Fallo al insertar en DB: ' + insertErr.message });
      } else {
        report.inserted++;
      }
    }

    return NextResponse.json({
      success: true,
      report
    });

  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Error del servidor procesando el archivo.', detalles: error.message }, { status: 500 });
  }
}

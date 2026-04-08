import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import exceljs from 'exceljs';

const STORES = ['Amazon', 'Miravia', 'AliExpress', 'El Corte Inglés', 'MediaMarkt', 'PcComponentes', 'Carrefour', 'Decathlon', 'Nike', 'Adidas', 'Zalando', 'eBay', 'Shein', 'Temu', 'Fnac', 'Leroy Merlin', 'IKEA', 'Promofarma', 'Douglas', 'Chollómetro', 'Otra'];
const CATEGORIES = ['Electrónica', 'Informática y Redes', 'Videojuegos', 'Hogar y Jardín', 'Salud y Belleza', 'Moda y Accesorios', 'Deportes y Aire Libre', 'Supermercado', 'Motor', 'Viajes', 'Bebés y Niños', 'Mascotas', 'Ocio y Cultura', 'Herramientas y Bricolaje', 'Juguetes', 'Cursos y Software', 'Otra'];
const DEAL_TYPES = ['offer', 'coupon'];
const SHIPPING_TYPES = ['Gratis', 'De pago', 'No aplica'];

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('mode') || 'template'; // 'template' or 'export'

    const workbook = new exceljs.Workbook();
    workbook.creator = 'CupOferta';
    const worksheet = workbook.addWorksheet('Ofertas_v1');
    const instructionsSheet = workbook.addWorksheet('LEER_PRIMERO');

    instructionsSheet.columns = [{ width: 100 }];
    instructionsSheet.addRow(['=========================================']);
    instructionsSheet.addRow(['INSTRUCCIONES IMPORTANTES DE IMPORTACIÓN:']);
    instructionsSheet.addRow(['=========================================']);
    instructionsSheet.addRow([]);
    instructionsSheet.addRow(['1. Hay campos marcados con un asterisco (*) que son OBLIGATORIOS.']);
    instructionsSheet.addRow(['2. Si dejas uno de estos campos obligatorios vacíos, la fila entera DARA ERROR y no se guardará.']);
    instructionsSheet.addRow(['   Campos mandatorios: TITLE, DESCRIPTION, PRICE, STORE, CATEGORY, LINK.']);
    instructionsSheet.addRow(['3. El ID (NO TOCAR) no se debe alterar si estás editando una oferta existente sacada del botón "Exportar".']);
    instructionsSheet.addRow(['   Si importas ofertas totalmente nuevas, deja la columna ID en blanco.']);
    instructionsSheet.addRow(['4. Utiliza los menús desplegables integrados en las columnas CATEGORY, STORE y DEAL_TYPE.']);
    instructionsSheet.addRow(['5. En caso de repetirse un nombre/enlace existente exacto, saltará el algoritmo anti-spam denegando la fila.']);
    instructionsSheet.addRow([]);
    instructionsSheet.addRow(['Vuelve a la pestaña "Ofertas_v1" para llenar tus datos.']);
    
    // Dar negrita y fondo rojo a la advertencia de falla
    instructionsSheet.getRow(6).font = { bold: true, color: { argb: 'FFFF0000' } };
    instructionsSheet.getRow(3).font = { bold: true };

    // Definir las columnas
    worksheet.columns = [
      { header: 'ID (NO TOCAR)', key: 'id', width: 36 }, // Solo en export
      { header: 'TITLE *', key: 'title', width: 40 },
      { header: 'DESCRIPTION *', key: 'description', width: 50 },
      { header: 'PRICE *', key: 'price', width: 15 },
      { header: 'OLD_PRICE', key: 'old_price', width: 15 },
      { header: 'STORE *', key: 'store', width: 25 },
      { header: 'CATEGORY *', key: 'category', width: 25 },
      { header: 'LINK *', key: 'link', width: 50 },
      { header: 'DEAL_TYPE', key: 'deal_type', width: 15 },
      { header: 'COUPON_CODE', key: 'coupon_code', width: 20 },
      { header: 'SHIPPING_TYPE', key: 'shipping_type', width: 20 },
      { header: 'EXPIRES_AT', key: 'expires_at', width: 20 },
      { header: 'IMAGE_1', key: 'image_1', width: 40 },
      { header: 'IMAGE_2', key: 'image_2', width: 40 },
      { header: 'IMAGE_3', key: 'image_3', width: 40 },
      { header: 'IMAGE_4', key: 'image_4', width: 40 },
    ];

    // Darle estilo a la cabecera
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF009EA8' }
    };

    if (mode === 'export') {
      // Exportar deals actuales del usuario
      const { data: deals, error: dbError } = await supabase
        .from('deals')
        .select('*')
        .eq('user_id', user.id);

      if (!dbError && deals) {
        deals.forEach(deal => {
          worksheet.addRow({
            id: deal.id,
            title: deal.title,
            description: deal.description,
            price: deal.price,
            old_price: deal.old_price,
            store: deal.store,
            category: deal.category,
            link: deal.link,
            deal_type: deal.deal_type || 'offer',
            coupon_code: deal.coupon_code,
            shipping_type: deal.shipping_type || 'Gratis',
            expires_at: deal.expires_at ? new Date(deal.expires_at).toISOString().split('T')[0] : '',
            image_1: deal.image_url?.[0] || '',
            image_2: deal.image_url?.[1] || '',
            image_3: deal.image_url?.[2] || '',
            image_4: deal.image_url?.[3] || '',
          });
        });
      }
    } else {
      // Modo plantilla (fila de ejemplo sin ID real)
      worksheet.addRow({
        id: '',
        title: 'Ejemplo de Oferta',
        description: 'Descripción detallada de la oferta aquí que llame a la acción.',
        price: 99.99,
        old_price: 149.99,
        store: 'Amazon',
        category: 'Electrónica',
        link: 'https://amazon.es/ejemplo',
        deal_type: 'offer',
        coupon_code: '',
        shipping_type: 'Gratis',
        expires_at: '',
        image_1: 'https://ejemplo.com/imagen.jpg',
        image_2: '',
        image_3: '',
        image_4: ''
      });
    }

    // Aplicar Data Validation a unas cuantas filas (por ejemplo, las primeras 1000)
    for (let i = 2; i <= 1000; i++) {
      // STORE
      worksheet.getCell(`F${i}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: [`"${STORES.join(',')}"`],
        showErrorMessage: true,
        errorTitle: 'Error de Tienda',
        error: 'Por favor, selecciona una tienda permitida de la lista.'
      };
      
      // CATEGORY
      worksheet.getCell(`G${i}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: [`"${CATEGORIES.join(',')}"`],
        showErrorMessage: true,
        errorTitle: 'Error de Categoría',
        error: 'Selecciona una categoría de la lista.'
      };

      // DEAL_TYPE
      worksheet.getCell(`I${i}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: [`"${DEAL_TYPES.join(',')}"`],
        showErrorMessage: true,
        errorTitle: 'Error de Tipo',
        error: 'Debe ser offer o coupon'
      };

      // SHIPPING_TYPE
      worksheet.getCell(`K${i}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`"${SHIPPING_TYPES.join(',')}"`],
        showErrorMessage: true,
        errorTitle: 'Error Envío',
        error: 'Opciones: Gratis, De pago, No aplica'
      };

      // PRICE (Numérico)
      worksheet.getCell(`D${i}`).dataValidation = {
        type: 'decimal',
        operator: 'greaterThanOrEqual',
        formulae: [0],
        showErrorMessage: true,
        errorTitle: 'Precio Inválido',
        error: 'El precio debe ser un número igual o mayor a cero.'
      };
      
      // OLD_PRICE (Numérico)
      worksheet.getCell(`E${i}`).dataValidation = {
        type: 'decimal',
        operator: 'greaterThanOrEqual',
        formulae: [0],
        allowBlank: true,
        showErrorMessage: true,
        errorTitle: 'Precio Antiguo Inválido',
        error: 'El precio antiguo debe ser un número.'
      };

      // EXPIRES_AT (Fecha YYYY-MM-DD o formato válido)
      worksheet.getCell(`L${i}`).dataValidation = {
        type: 'date',
        operator: 'greaterThanOrEqual',
        formulae: [new Date()],
        allowBlank: true,
        showErrorMessage: true,
        errorTitle: 'Fecha Inválida',
        error: 'La fecha de expiración debe ser futura.'
      };
    }

    // Ocultar columna ID en modo plantilla para no confundir al usuario, pero requiere estar para Upsert, la dejamos visible solo si están exportando o la dejamos protegida/gris
    worksheet.getColumn('A').hidden = mode === 'template';

    const buffer = await workbook.xlsx.writeBuffer();

    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.set('Content-Disposition', `attachment; filename=CupOferta_${mode === 'export' ? 'Mis_Ofertas' : 'Plantilla'}.xlsx`);

    return new NextResponse(buffer, {
      status: 200,
      statusText: "OK",
      headers
    });
  } catch (error: any) {
    console.error('Error in export:', error);
    return NextResponse.json({ error: 'Hubo un error exportando el Excel' }, { status: 500 });
  }
}

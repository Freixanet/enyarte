import { config, fields, collection } from '@keystatic/core';

// F6 — Keystatic en modo local (git). Mapea EXACTAMENTE el schema zod de
// src/content/config.ts (§5.1). No modifica el schema: el slug sale del nombre
// de fichero (fields.slug sobre title), el contenido vive en src/content/works/
// como ficheros .md (format.contentField + fields.markdoc extension 'md').
export default config({
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'Enya Fontanills' },
  },
  collections: {
    works: collection({
      label: 'Obras',
      slugField: 'title',
      path: 'src/content/works/*',
      format: { contentField: 'content' },
      columns: ['title', 'year', 'status'],
      schema: {
        title: fields.slug({
          name: { label: 'Título', validation: { isRequired: true } },
        }),
        year: fields.integer({
          label: 'Año',
          validation: { isRequired: true },
        }),
        technique_es: fields.text({
          label: 'Técnica (ES)',
          validation: { isRequired: true },
        }),
        technique_en: fields.text({
          label: 'Technique (EN)',
          validation: { isRequired: true },
        }),
        width_cm: fields.number({ label: 'Ancho (cm)', step: 0.01 }),
        height_cm: fields.number({ label: 'Alto (cm)', step: 0.01 }),
        depth_cm: fields.number({ label: 'Profundidad (cm)', step: 0.01 }),
        kind: fields.select({
          label: 'Tipo',
          options: [
            { label: 'Pintura', value: 'painting' },
            { label: 'Instalación', value: 'installation' },
            { label: 'Objeto', value: 'object' },
          ],
          defaultValue: 'painting',
        }),
        series: fields.select({
          label: 'Serie (travesía)',
          options: [
            { label: 'Cuba', value: 'cuba' },
            { label: 'Miami', value: 'miami' },
            { label: 'San Francisco', value: 'sf' },
            { label: 'Roma', value: 'roma' },
            { label: 'España', value: 'espana' },
            { label: 'Sin serie', value: 'none' },
          ],
          defaultValue: 'none',
        }),
        status: fields.select({
          label: 'Estado',
          options: [
            { label: 'Disponible', value: 'available' },
            { label: 'Reservada', value: 'reserved' },
            { label: 'Vendida', value: 'sold' },
          ],
          defaultValue: 'available',
        }),
        price_eur: fields.number({ label: 'Precio (€)' }),
        featured: fields.checkbox({ label: 'Destacada', defaultValue: false }),
        // cover/gallery se editan como RUTA (texto) para respetar el convenio
        // plano de F1 (../../assets/works/<slug>.svg) sin migrar contenido.
        // El schema zod sigue siendo image(); en F7, con fotos raster reales, se
        // puede migrar a fields.image con selector de subida.
        cover: fields.text({
          label: 'Portada (ruta)',
          description: 'Ruta relativa desde src/content/works/, p. ej. ../../assets/works/mi-obra.svg',
          validation: { isRequired: true },
        }),
        gallery: fields.array(
          fields.text({ label: 'Ruta de imagen' }),
          { label: 'Galería', itemLabel: (props) => props.value || 'Imagen' },
        ),
        story_es: fields.text({
          label: 'Historia (ES)',
          multiline: true,
          validation: { isRequired: true },
        }),
        story_en: fields.text({
          label: 'Story (EN)',
          multiline: true,
          validation: { isRequired: true },
        }),
        order: fields.integer({ label: 'Orden', defaultValue: 0 }),
        content: fields.markdoc({ label: 'Cuerpo (opcional)', extension: 'md' }),
      },
    }),
  },
});

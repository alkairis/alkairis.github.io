// Declarative config for every admin section. Each entry drives both the
// read table and the create form, so adding a section is config-only.
//
// Field types: text | textarea | url | date | list (semicolon-separated -> array) | bool

export const SECTIONS = [
  {
    key: 'social-media',
    label: 'Social Media',
    endpoint: '/api/social-media',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'url', label: 'URL', type: 'url', required: true },
      {
        name: 'icon',
        label: 'Icon',
        type: 'text',
        required: true,
        placeholder: 'fa-brands fa-github',
        hint: 'Font Awesome class (brands or solid), e.g. "fa-brands fa-linkedin-in"',
      },
    ],
  },
  {
    key: 'resume',
    label: 'Resume',
    endpoint: '/api/resume',
    single: true, // upsert of a single record
    fields: [{ name: 'url', label: 'Resume URL', type: 'url', required: true }],
  },
  {
    key: 'projects',
    label: 'Projects',
    endpoint: '/api/projects',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'github_url', label: 'GitHub URL', type: 'url', required: true },
      { name: 'demo_url', label: 'Demo URL', type: 'url', required: true },
      { name: 'technologies', label: 'Technologies (semicolon separated)', type: 'list', required: true },
      { name: 'image_url', label: 'Image URL', type: 'url', required: true },
    ],
  },
  {
    key: 'technical-skills',
    label: 'Technical Skills',
    endpoint: '/api/technical-skills',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'image_url', label: 'Image URL', type: 'url', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'skill_type', label: 'Skill Type', type: 'text', required: true },
    ],
  },
  {
    key: 'professional-experience',
    label: 'Professional Experience',
    endpoint: '/api/professional-experience',
    fields: [
      { name: 'company_name', label: 'Company Name', type: 'text', required: true },
      { name: 'position', label: 'Position', type: 'text', required: true },
      { name: 'banner_image', label: 'Banner Image URL', type: 'url' },
      { name: 'logo', label: 'Logo URL', type: 'url' },
      { name: 'start_date', label: 'Start Date', type: 'date', required: true },
      { name: 'end_date', label: 'End Date', type: 'date' },
      { name: 'responsibilities', label: 'Responsibilities (semicolon separated)', type: 'list', required: true },
      { name: 'recognition', label: 'Recognition (semicolon separated)', type: 'list' },
      { name: 'is_present', label: 'Currently working here', type: 'bool' },
    ],
  },
  {
    key: 'certificates',
    label: 'Certificates',
    endpoint: '/api/certificates',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'issued_by', label: 'Issued By', type: 'text', required: true },
      { name: 'issued_by_image_url', label: 'Issuer Image URL', type: 'url', required: true },
      { name: 'certificate_image_url', label: 'Certificate Image URL', type: 'url' },
      { name: 'issue_date', label: 'Issue Date', type: 'date', required: true },
      { name: 'expiration_date', label: 'Expiration Date', type: 'date' },
      { name: 'credential_id', label: 'Credential ID', type: 'text' },
      { name: 'credential_url', label: 'Credential URL', type: 'url' },
    ],
  },
  {
    key: 'achievements',
    label: 'Achievements',
    endpoint: '/api/achievements',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'issued_by', label: 'Issued By', type: 'text', required: true },
      { name: 'keywords', label: 'Keywords (semicolon separated)', type: 'list', required: true },
      { name: 'image_url', label: 'Image URL', type: 'url' },
      { name: 'link', label: 'Link', type: 'url' },
    ],
  },
];

export const getSection = (key) => SECTIONS.find((section) => section.key === key);

// Build an empty form state from a section's fields.
export const emptyForm = (section) =>
  Object.fromEntries(
    section.fields.map((field) => [field.name, field.type === 'bool' ? false : ''])
  );

// Convert form state into the JSON payload the backend expects.
export const toPayload = (section, form) => {
  const payload = {};
  for (const field of section.fields) {
    const raw = form[field.name];

    if (field.type === 'bool') {
      payload[field.name] = Boolean(raw);
      continue;
    }

    if (field.type === 'list') {
      const items = String(raw ?? '')
        .split(';')
        .map((item) => item.trim())
        .filter(Boolean);
      if (items.length > 0) {
        payload[field.name] = items;
      } else if (field.required) {
        payload[field.name] = [];
      }
      continue;
    }

    const value = typeof raw === 'string' ? raw.trim() : raw;
    if (value !== '' && value != null) {
      payload[field.name] = value;
    }
  }
  return payload;
};

// Build form state from an existing record (inverse of toPayload) for editing.
export const formFromRow = (section, row) =>
  Object.fromEntries(
    section.fields.map((field) => {
      const raw = row[field.name];
      if (field.type === 'bool') return [field.name, Boolean(raw)];
      if (field.type === 'list')
        return [field.name, Array.isArray(raw) ? raw.join('; ') : ''];
      return [field.name, raw == null ? '' : String(raw)];
    })
  );

// Render a single record cell value for the read table.
export const formatCell = (value) => {
  if (value == null || value === '') return '—';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
};

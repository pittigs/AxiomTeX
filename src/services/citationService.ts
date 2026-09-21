/**
 * Citation & Bibliography Service for AxiomTeX
 * Fetches BibTeX from DOI / arXiv and provides automated citation auditing.
 */

export interface CitationAuditResult {
  citedKeys: string[];
  definedKeys: string[];
  missingKeys: string[]; // Cited in TeX but missing in .bib
  unusedKeys: string[];  // Defined in .bib but never cited in TeX
}

/**
 * Extracts citation keys from LaTeX source code (\cite{key1, key2}, \citep{}, \citet{}, \citeauthor{}, etc.)
 */
export function extractCitationsFromTex(texCode: string): string[] {
  const keysSet = new Set<string>();
  // Match \cite, \citep, \citet, \nocite, etc.
  const regex = /\\(?:cite|citep|citet|nocite|citeauthor|citeyear|parencite)\*?(?:\[.*?\])*\{([^}]+)\}/g;
  let match;
  while ((match = regex.exec(texCode)) !== null) {
    const rawKeys = match[1];
    rawKeys.split(',').forEach((k) => {
      const trimmed = k.trim();
      if (trimmed) {
        keysSet.add(trimmed);
      }
    });
  }
  return Array.from(keysSet);
}

/**
 * Extracts entry keys from BibTeX file content (@article{key, @book{key, ...)
 */
export function extractKeysFromBib(bibContent: string): string[] {
  const keysSet = new Set<string>();
  const regex = /@([a-zA-Z]+)\s*\{\s*([^,\s]+)\s*,/g;
  let match;
  while ((match = regex.exec(bibContent)) !== null) {
    const key = match[2].trim();
    if (key) {
      keysSet.add(key);
    }
  }
  return Array.from(keysSet);
}

/**
 * Audits citations between LaTeX document and Bibliography files.
 */
export function auditCitations(texCode: string, bibContent: string): CitationAuditResult {
  const citedKeys = extractCitationsFromTex(texCode);
  const definedKeys = extractKeysFromBib(bibContent);

  const definedSet = new Set(definedKeys);
  const citedSet = new Set(citedKeys);

  const missingKeys = citedKeys.filter((k) => !definedSet.has(k));
  const unusedKeys = definedKeys.filter((k) => !citedSet.has(k));

  return {
    citedKeys,
    definedKeys,
    missingKeys,
    unusedKeys,
  };
}

/**
 * Fetches BibTeX formatted entry using a DOI (Digital Object Identifier).
 */
export async function fetchBibtexByDoi(rawDoi: string): Promise<string> {
  const cleanDoi = rawDoi.trim().replace(/^https?:\/\/doi\.org\//, '').replace(/^doi:\s*/i, '');
  if (!cleanDoi) {
    throw new Error('Bitte eine gültige DOI angeben.');
  }

  // Use CrossRef API content negotiation
  const url = `https://api.crossref.org/works/${encodeURIComponent(cleanDoi)}/transform/application/x-bibtex`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/x-bibtex',
    },
  });

  if (!response.ok) {
    throw new Error(`DOI nicht gefunden oder Netzwerkfehler (${response.status})`);
  }

  const bibtex = await response.text();
  return bibtex.trim();
}

/**
 * Fetches BibTeX metadata for an arXiv paper ID.
 */
export async function fetchBibtexByArxiv(rawArxivId: string): Promise<string> {
  const cleanId = rawArxivId.trim().replace(/^https?:\/\/arxiv\.org\/(?:abs|pdf)\//, '').replace(/^arxiv:\s*/i, '');
  if (!cleanId) {
    throw new Error('Bitte eine gültige arXiv ID angeben.');
  }

  const url = `https://export.arxiv.org/api/query?id_list=${encodeURIComponent(cleanId)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`arXiv Anfrage fehlgeschlagen (${response.status})`);
  }

  const xmlText = await response.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, 'text/xml');
  const entry = xml.querySelector('entry');

  if (!entry) {
    throw new Error(`Kein arXiv-Eintrag für ID '${cleanId}' gefunden.`);
  }

  const title = entry.querySelector('title')?.textContent?.trim().replace(/\s+/g, ' ') || 'Untitled';
  const published = entry.querySelector('published')?.textContent || '2026';
  const year = published.split('-')[0] || '2026';
  
  const authors: string[] = [];
  entry.querySelectorAll('author > name').forEach((el) => {
    if (el.textContent) authors.push(el.textContent.trim());
  });

  const firstAuthorLast = authors[0] ? authors[0].split(' ').pop()?.toLowerCase() : 'arxiv';
  const citeKey = `${firstAuthorLast}${year}${cleanId.replace(/[^a-zA-Z0-9]/g, '')}`;

  return `@article{${citeKey},
  author    = {${authors.join(' and ')}},
  title     = {{${title}}},
  journal   = {arXiv preprint arXiv:${cleanId}},
  year      = {${year}},
  eprint    = {${cleanId}},
  archivePrefix = {arXiv},
  primaryClass = {cs.SE}
}`;
}

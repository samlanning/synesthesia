import {
  Reflection,
  JsonApi,
  isExternalModule
} from './reflection';
import { generatePageHTML } from './generate-html';
import { getUrl, requiresOwnPage } from './urls';

export interface DocumentationSection {
  reflection: Reflection;
  children: DocumentationSection[];
  page: InitialDocumentationPage;
}

export interface InitialDocumentationPage {
  title: string;
  /**
   * URL, without any preceeding or training slashes,
   * relative to the root of the documentation for a particular API
   */
  url: string;
  sections: DocumentationSection[];
}

export interface ProcessedDocumentationPage {
  title: string;
  url: string;
  html: string;
}

/**
 * Roughly check whether the given api is a valid json output from typedoc
 */
export function isTypedocApi(api: any): api is JsonApi {
  const a: JsonApi = api;
  return (
    a.id !== undefined &&
    a.flags !== undefined &&
    a.kind !== undefined &&
    a.name !== undefined
  )
}

export function processTypedoc(api: JsonApi) {
  /**
   * List of pages to output
   */
  const pages = new Map<string, InitialDocumentationPage>();
  /**
   * Mapping from reflection IDs
   */
  const sectionMap = new Map<number, DocumentationSection>();

  const processReflection = (parent: DocumentationSection, reflection: Reflection) => {
    let section: DocumentationSection | null = null;
    if (isExternalModule(reflection)) {
      // Strip quote marks
      let url = reflection.name.substr(1, reflection.name.length - 2);
      if (url === 'index')
        url = '';
      if (url.endsWith('/index'))
        url = url.substr(0, url.length - 6);
      section = outputTopLevelSection(url, reflection, api.name + '/' + url);
    } else if (requiresOwnPage(reflection)) {
      const url = getUrl(parent, reflection);
      section = outputTopLevelSection(url, reflection, api.name + '/' + url);
    } else {
      outputSupsection(parent, reflection);
    }
    if (section) {
      if (reflection.children) {
        for(const child of reflection.children) {
          processReflection(section, child);
        }
      }
    }
  }

  const outputTopLevelSection = (url: string, reflection: Reflection, title: string) => {
    let page = pages.get(url);
    if (!page) {
      page = { url, sections: [], title };
      pages.set(url, page);
    }
    const section: DocumentationSection = {
      reflection,
      children: [],
      page
    }
    sectionMap.set(reflection.id, section);
    page.sections.push(section);
    return section;
  }

  const outputSupsection = (parent: DocumentationSection, reflection: Reflection) => {
    const section: DocumentationSection = {
      reflection,
      children: [],
      page: parent.page
    }
    sectionMap.set(reflection.id, section);
    parent.children.push(section);
    return section;
  }

  // Organize into pages
  const root = outputTopLevelSection('', api, api.name);
  for (const c of api.children || []) {
    processReflection(root, c);
  }

  // TODO: sort sections of pages

  // Generate HTML for pages
  const output: ProcessedDocumentationPage[] = [];
  for (const page of pages.values()) {
    output.push({
      url: page.url,
      html: generatePageHTML(root, pages, sectionMap, page),
      title: page.title
    });
  }
  return output;
}
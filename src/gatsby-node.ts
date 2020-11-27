import axios from 'axios';

const CategoryType = 'ZendeskHelpCenterCategory';
const SectionType = 'ZendeskHelpCenterSection';
const ArticleType = 'ZendeskHelpCenterArticle';

export const sourceNodes = async ({
  createNodeId,
  createContentDigest,
  actions: { createNode },
}: {
  createNodeId: (input: string) => string;
  createContentDigest: (input: string | Record<string, unknown>) => string;
  actions: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createNode: (node: any, plugin?: any, options?: any) => void;
  };
}, { subdomain, locale }: Options): Promise<void> => {
  const categoriesResponse = await axios.get<{
    categories: {
      id: number;
    }[];
  }>(`https://${subdomain}.zendesk.com/api/v2/help_center/${locale}/categories`);

  const sectionsResponse = await axios.get<{
    sections: {
      id: number;
      category_id: number;
    }[];
  }>(`https://${subdomain}.zendesk.com/api/v2/help_center/${locale}/sections`);

  const articlesResponse = await axios.get<{
    articles: {
      id: number;
      section_id: number;
    }[];
  }>(`https://${subdomain}.zendesk.com/api/v2/help_center/${locale}/articles`);

  const categoryMap: {[categoryId: number]: string} = {};
  categoriesResponse.data.categories.forEach((category) => {
    const id = createNodeId(`${CategoryType}${category.id}`);
    createNode({
      ...category,
      id,
      categoryId: category.id,
      internal: {
        type: CategoryType,
        contentDigest: createContentDigest(category),
      },
    });
    categoryMap[category.id] = id;
  });

  const sectionMap: {[sectionId: number]: string} = {};
  sectionsResponse.data.sections.forEach((section) => {
    const id = createNodeId(`${SectionType}${section.id}`);
    createNode({
      ...section,
      id,
      sectionId: section.id,
      categoryId: section.category_id,
      internal: {
        type: SectionType,
        contentDigest: createContentDigest(section),
      },
      parent: categoryMap[section.category_id],
    });
    sectionMap[section.id] = id;
  });

  articlesResponse.data.articles.forEach((article) => {
    createNode({
      ...article,
      id: createNodeId(`${ArticleType}${article.id}`),
      articleId: article.id,
      sectionId: article.section_id,
      internal: {
        type: ArticleType,
        contentDigest: createContentDigest(article),
      },
      parent: sectionMap[article.section_id],
    });
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Node = any;

export const onCreateNode = (
  { node, actions: { createParentChildLink }, getNodes }: {
    node: Node;
    actions: {
      createParentChildLink: ({ parent, child }: { parent: Node; child: Node }) => void;
    };
    getNodes: () => Node[];
  },
): void => {
  if (node.internal.type === SectionType) {
    const category = getNodes()
      .find((n) => n.internal.type === CategoryType && n.categoryId === node.categoryId);
    if (category !== undefined) {
      createParentChildLink({ parent: category, child: node });
    }
  }
  if (node.internal.type === ArticleType) {
    const section = getNodes()
      .find((n) => n.internal.type === SectionType && n.sectionId === node.sectionId);
    if (section !== undefined) {
      createParentChildLink({ parent: section, child: node });
    }
  }
};

type Options = {
  subdomain: string;
  locale: string;
};

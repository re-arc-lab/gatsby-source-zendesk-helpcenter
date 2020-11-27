"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onCreateNode = exports.sourceNodes = void 0;
const axios_1 = require("axios");
const CategoryType = 'ZendeskHelpCenterCategory';
const SectionType = 'ZendeskHelpCenterSection';
const ArticleType = 'ZendeskHelpCenterArticle';
const sourceNodes = async ({ createNodeId, createContentDigest, actions: { createNode }, }, { subdomain, locale }) => {
    const categoriesResponse = await axios_1.default.get(`https://${subdomain}.zendesk.com/api/v2/help_center/${locale}/categories`);
    const sectionsResponse = await axios_1.default.get(`https://${subdomain}.zendesk.com/api/v2/help_center/${locale}/sections`);
    const articlesResponse = await axios_1.default.get(`https://${subdomain}.zendesk.com/api/v2/help_center/${locale}/articles`);
    const categoryMap = {};
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
    const sectionMap = {};
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
exports.sourceNodes = sourceNodes;
const onCreateNode = ({ node, actions: { createParentChildLink }, getNodes }) => {
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
exports.onCreateNode = onCreateNode;
//# sourceMappingURL=gatsby-node.js.map
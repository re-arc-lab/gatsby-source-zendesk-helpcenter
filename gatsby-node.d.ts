export declare const sourceNodes: ({ createNodeId, createContentDigest, actions: { createNode }, }: {
    createNodeId: (input: string) => string;
    createContentDigest: (input: string | Record<string, unknown>) => string;
    actions: {
        createNode: (node: any, plugin?: any, options?: any) => void;
    };
}, { subdomain, locale }: Options) => Promise<void>;
declare type Node = any;
export declare const onCreateNode: ({ node, actions: { createParentChildLink }, getNodes }: {
    node: Node;
    actions: {
        createParentChildLink: ({ parent, child }: {
            parent: Node;
            child: Node;
        }) => void;
    };
    getNodes: () => Node[];
}) => void;
declare type Options = {
    subdomain: string;
    locale: string;
};
export {};

import type { OrgNode } from "../types/orgChart";

/**
 * Add a new node to the tree at the given path.
 *
 * @param tree Current org chart tree (root node)
 * @param path Path string (e.g. "/root/child")
 * @param newNode Node to add
 * @returns Updated tree
 */
export function handleAddNode(
  tree: OrgNode,
  path: string,
  newNode: OrgNode
): OrgNode {
  const segments = path.split("/").filter(Boolean);

  function recurse(node: OrgNode, depth: number): OrgNode {
    if (depth === segments.length) {
      return {
        ...node,
        children: [...(node.children || []), newNode],
      };
    }

    return {
      ...node,
      children: (node.children || []).map((child) =>
        child.name === segments[depth] ? recurse(child, depth + 1) : child
      ),
    };
  }

  if (segments.length === 0) {
    // Adding directly to the root
    return {
      ...tree,
      children: [...(tree.children || []), newNode],
    };
  }

  return recurse(tree, 0);
}

// app/lib/treeUtils.ts
import type { OrgNode } from "../types/orgChart";

/**
 * Centralized tree manipulation utilities to eliminate code duplication
 * across mutation hooks.
 */
export const TreeOps = {
  /**
   * Generic tree traversal with callback
   * Performs depth-first traversal and calls fn on each node
   */
  traverse<T>(tree: OrgNode, fn: (node: OrgNode) => T | void): void {
    fn(tree);
    if (tree.children && tree.children.length > 0) {
      tree.children.forEach((child) => this.traverse(child, fn));
    }
  },

  /**
   * Find a node by ID in the tree
   * Returns null if not found
   */
  findById(tree: OrgNode, targetId: number): OrgNode | null {
    if (tree.id === targetId) {
      return tree;
    }

    if (tree.children && tree.children.length > 0) {
      for (const child of tree.children) {
        const found = this.findById(child, targetId);
        if (found) return found;
      }
    }

    return null;
  },

  /**
   * Update a node immutably by ID
   * Returns a new tree with the updated node
   */
  updateNode(
    tree: OrgNode,
    targetId: number,
    updates: Partial<OrgNode>
  ): OrgNode {
    if (tree.id === targetId) {
      return {
        ...tree,
        ...updates,
      };
    }

    if (tree.children && tree.children.length > 0) {
      const updatedChildren = tree.children.map((child) =>
        this.updateNode(child, targetId, updates)
      );
      return {
        ...tree,
        children: updatedChildren,
      };
    }

    return tree;
  },

  /**
   * Add a child node to a parent node by parent ID
   * Returns a new tree with the child added
   * If parentId is not provided or not found, adds to root level
   */
  addChild(
    tree: OrgNode,
    parentId: number | undefined,
    child: OrgNode
  ): OrgNode {
    // If no parent ID, add to root level
    if (!parentId) {
      return {
        ...tree,
        children: [...(tree.children ?? []), child],
      };
    }

    // If this node is the parent, add child here
    if (tree.id === parentId) {
      return {
        ...tree,
        children: [...(tree.children ?? []), child],
      };
    }

    // Recursively search children
    if (tree.children && tree.children.length > 0) {
      return {
        ...tree,
        children: tree.children.map((c) => this.addChild(c, parentId, child)),
      };
    }

    return tree;
  },

  /**
   * Remove a node and its children by ID
   * Returns a new tree with the node removed, or null if the root is removed
   */
  removeNode(tree: OrgNode, targetId: number): OrgNode | null {
    // If this is the node to remove, return null
    if (tree.id === targetId) {
      return null;
    }

    // Recursively remove from children
    if (tree.children && tree.children.length > 0) {
      const updatedChildren = tree.children
        .map((child) => this.removeNode(child, targetId))
        .filter((child) => child !== null) as OrgNode[];

      return {
        ...tree,
        children: updatedChildren,
      };
    }

    return tree;
  },

  /**
   * Get all descendants of a node as a flat list
   * Includes the node itself
   */
  getDescendants(node: OrgNode): OrgNode[] {
    const descendants: OrgNode[] = [node];

    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        descendants.push(...this.getDescendants(child));
      });
    }

    return descendants;
  },

  /**
   * Get the path from root to a target node
   * Returns an array of nodes from root to target, or empty array if not found
   */
  getNodePath(tree: OrgNode, targetId: number): OrgNode[] {
    if (tree.id === targetId) {
      return [tree];
    }

    if (tree.children && tree.children.length > 0) {
      for (const child of tree.children) {
        const childPath = this.getNodePath(child, targetId);
        if (childPath.length > 0) {
          return [tree, ...childPath];
        }
      }
    }

    return [];
  },

  /**
   * Count total nodes in tree (including root)
   */
  countNodes(tree: OrgNode): number {
    let count = 1;
    if (tree.children && tree.children.length > 0) {
      count += tree.children.reduce(
        (sum, child) => sum + this.countNodes(child),
        0
      );
    }
    return count;
  },

  /**
   * Get maximum depth of the tree
   */
  getMaxDepth(tree: OrgNode): number {
    if (!tree.children || tree.children.length === 0) {
      return 1;
    }
    return (
      1 + Math.max(...tree.children.map((child) => this.getMaxDepth(child)))
    );
  },

  /**
   * Filter nodes by predicate (returns all matching nodes in a flat list)
   */
  filter(tree: OrgNode, predicate: (node: OrgNode) => boolean): OrgNode[] {
    const matches: OrgNode[] = [];

    this.traverse(tree, (node) => {
      if (predicate(node)) {
        matches.push(node);
      }
    });

    return matches;
  },

  /**
   * Map over all nodes in the tree, transforming each one
   * Preserves tree structure
   */
  map(tree: OrgNode, fn: (node: OrgNode) => OrgNode): OrgNode {
    const transformed = fn(tree);

    if (transformed.children && transformed.children.length > 0) {
      return {
        ...transformed,
        children: transformed.children.map((child) => this.map(child, fn)),
      };
    }

    return transformed;
  },
};

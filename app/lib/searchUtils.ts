// app/lib/searchUtils.ts
import Fuse from "fuse.js";
import type { OrgNodeRow, Category } from "../types/orgChart";

export interface SearchResult {
  node: OrgNodeRow;
  path: string[]; // Array of ancestor names leading to this node
  categoryId: string; // For navigation
  score?: number; // Fuse.js relevance score
}

/**
 * Build the full path for a node by walking up parent relationships
 * Returns array of ancestor names from root to node
 */
export function buildNodePath(
  node: OrgNodeRow,
  allNodes: OrgNodeRow[],
  categories: Category[]
): string[] {
  const path: string[] = [];
  let currentNode: OrgNodeRow | undefined = node;

  // Walk up the parent chain
  while (currentNode) {
    path.unshift(currentNode.name); // Add to front of array

    if (currentNode.parent_id) {
      currentNode = allNodes.find((n) => n.id === currentNode.parent_id);
    } else {
      // Reached root - add category name if we have it
      const category = categories.find((c) => c.id === currentNode?.category_id);
      if (category) {
        path.unshift(category.name);
      }
      break;
    }
  }

  return path;
}

/**
 * Configure Fuse.js for fuzzy search on nodes
 */
function createFuseInstance(nodes: OrgNodeRow[]) {
  return new Fuse(nodes, {
    keys: [
      { name: "name", weight: 2 }, // Prioritize name matches
      { name: "details", weight: 1 },
    ],
    threshold: 0.4, // 0 = exact match, 1 = match anything
    includeScore: true,
    minMatchCharLength: 2,
  });
}

/**
 * Search through all nodes using fuzzy matching
 * Returns results sorted by relevance, grouped by type
 */
export function searchNodes(
  query: string,
  allNodes: OrgNodeRow[],
  categories: Category[],
  maxResults = 20
): SearchResult[] {
  if (!query.trim()) {
    return [];
  }

  const fuse = createFuseInstance(allNodes);
  const fuseResults = fuse.search(query);

  // Convert Fuse results to SearchResult format
  const searchResults: SearchResult[] = fuseResults
    .slice(0, maxResults)
    .map((result) => ({
      node: result.item,
      path: buildNodePath(result.item, allNodes, categories),
      categoryId: result.item.category_id,
      score: result.score,
    }));

  // Sort: categories first, then tasks, then by relevance score
  return searchResults.sort((a, b) => {
    // Group by type
    if (a.node.type === "category" && b.node.type !== "category") return -1;
    if (a.node.type !== "category" && b.node.type === "category") return 1;

    // Within same type, sort by score (lower is better in Fuse.js)
    return (a.score || 0) - (b.score || 0);
  });
}

/**
 * Grid layout utility functions for enhanced dashboard behavior
 */
import { Layout, LayoutItem } from 'react-grid-layout';
import { memoize } from './performanceUtils';

// We need this type to handle layouts that might be using different interfaces
export interface GridItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
}

/**
 * Auto-arranges layout items to eliminate gaps and optimize space usage
 * 
 * @param layout Current layout items
 * @param cols Number of columns in the grid
 * @returns Optimized layout with no gaps
 */
export const autoArrangeLayout = memoize((layout: Layout[] | GridItem[], cols: number): Layout[] | GridItem[] => {
  // Sort items by position (top to bottom, left to right)
  const sortedItems = [...layout].sort((a, b) => {
    if (a.y === b.y) return a.x - b.x;
    return a.y - b.y;
  });

  // Create a new layout with optimized positions
  const optimizedLayout: (Layout | GridItem)[] = [];
  
  // Create a grid representation to track occupied cells
  const grid: boolean[][] = Array(cols).fill(null).map(() => []);
  
  // Process each item
  sortedItems.forEach(item => {
    // Find the optimal position for this item (top-most, then left-most)
    const position = findOptimalPosition(grid, item.w, item.h, cols);
    
    // Create a new item with the optimal position
    const newItem = {
      ...item,
      x: position.x,
      y: position.y
    };
    
    // Mark the occupied cells in our grid
    markOccupiedCells(grid, position.x, position.y, item.w, item.h);
    
    // Add the item to our optimized layout
    optimizedLayout.push(newItem);
  });
  
  return optimizedLayout;
});

/**
 * Finds the optimal position for an item in the grid
 * 
 * @param grid Current grid occupation state
 * @param width Item width
 * @param height Item height
 * @param cols Number of grid columns
 * @returns Optimal position {x, y}
 */
const findOptimalPosition = (grid: boolean[][], width: number, height: number, cols: number): {x: number, y: number} => {
  let bestY = Infinity;
  let bestX = 0;
  
  // Try each possible x position
  for (let x = 0; x <= cols - width; x++) {
    // Find the highest available y position at this x
    let y = 0;
    while (isPositionOccupied(grid, x, y, width, height)) {
      y++;
    }
    
    // If this is better than our current best, update it
    if (y < bestY) {
      bestY = y;
      bestX = x;
    }
  }
  
  return { x: bestX, y: bestY };
};

/**
 * Checks if a position in the grid is occupied
 * 
 * @param grid Current grid occupation state
 * @param x X coordinate
 * @param y Y coordinate
 * @param width Item width
 * @param height Item height
 * @returns Whether the position is occupied
 */
const isPositionOccupied = (grid: boolean[][], x: number, y: number, width: number, height: number): boolean => {
  // Check each cell that would be occupied by this item
  for (let i = x; i < x + width; i++) {
    for (let j = y; j < y + height; j++) {
      if (grid[i] && grid[i][j]) {
        return true;
      }
    }
  }
  
  return false;
};

/**
 * Marks cells in the grid as occupied
 * 
 * @param grid Grid to mark
 * @param x X coordinate
 * @param y Y coordinate
 * @param width Item width
 * @param height Item height
 */
const markOccupiedCells = (grid: boolean[][], x: number, y: number, width: number, height: number): void => {
  for (let i = x; i < x + width; i++) {
    if (!grid[i]) grid[i] = [];
    
    for (let j = y; j < y + height; j++) {
      grid[i][j] = true;
    }
  }
};

/**
 * Applies snap-to-grid behavior for layout items
 * Ensures all items fit perfectly in the grid with consistent dimensions
 * 
 * @param layout Current layout
 * @returns Layout with items snapped to grid
 */
export const snapToGrid = <T extends Layout | GridItem>(layout: T[]): T[] => {
  // First round all values to ensure they're on the grid
  const roundedLayout = layout.map(item => ({
    ...item,
    x: Math.round(item.x),
    y: Math.round(item.y),
    w: Math.max(item.minW || 1, Math.round(item.w)),
    h: Math.max(item.minH || 1, Math.round(item.h))
  }));
  
  // Then enforce uniformity and proper alignment
  return roundedLayout.map(item => {
    // Ensure width is at least 1 and respects minW
    const w = Math.max(item.minW || 1, item.w);
    
    // Ensure height is at least 1 and respects minH
    const h = Math.max(item.minH || 1, item.h);
    
    return {
      ...item,
      w,
      h,
      // Ensure x position is valid (not negative and not causing overflow)
      x: Math.max(0, item.x),
      // Ensure y position is valid (not negative)
      y: Math.max(0, item.y)
    };
  }) as T[];
};

/**
 * Fills any empty spaces in the grid with expanded items
 * 
 * @param layout Current layout
 * @param cols Number of columns
 * @returns Layout with items expanded to fill empty spaces
 */
export const autoFillLayout = memoize((layout: Layout[], cols: number): Layout[] => {
  // First ensure all items are properly arranged
  const arrangedLayout = autoArrangeLayout(layout, cols);
  const filledLayout = [...arrangedLayout];
  
  // Create a grid representation
  const grid: {itemIndex: number | null}[][] = Array(cols).fill(null).map(() => []);
  
  // Mark all occupied cells with the item index
  arrangedLayout.forEach((item, index) => {
    for (let i = item.x; i < item.x + item.w; i++) {
      if (!grid[i]) grid[i] = [];
      
      for (let j = item.y; j < item.y + item.h; j++) {
        grid[i][j] = { itemIndex: index };
      }
    }
  });
  
  // For each item, try to expand it right and down
  for (let itemIndex = 0; itemIndex < filledLayout.length; itemIndex++) {
    const item = filledLayout[itemIndex];
    
    // Try to expand width
    let canExpandWidth = true;
    while (canExpandWidth && item.x + item.w < cols) {
      // Check if the column to the right is free
      for (let j = item.y; j < item.y + item.h; j++) {
        if (grid[item.x + item.w] && grid[item.x + item.w][j] && grid[item.x + item.w][j].itemIndex !== null) {
          canExpandWidth = false;
          break;
        }
      }
      
      if (canExpandWidth) {
        // Expand and update grid
        item.w += 1;
        for (let j = item.y; j < item.y + item.h; j++) {
          if (!grid[item.x + item.w - 1]) grid[item.x + item.w - 1] = [];
          grid[item.x + item.w - 1][j] = { itemIndex };
        }
      }
    }
    
    // Try to expand height
    let canExpandHeight = true;
    while (canExpandHeight) {
      // Check if the row below is free
      for (let i = item.x; i < item.x + item.w; i++) {
        if (grid[i] && grid[i][item.y + item.h] && grid[i][item.y + item.h].itemIndex !== null) {
          canExpandHeight = false;
          break;
        }
      }
      
      if (canExpandHeight) {
        // Expand and update grid
        item.h += 1;
        for (let i = item.x; i < item.x + item.w; i++) {
          if (!grid[i][item.y + item.h - 1]) {
            grid[i][item.y + item.h - 1] = { itemIndex };
          }
        }
      }
    }
  }
  
  return filledLayout;
});

/**
 * Checks if a layout has gaps between items
 * 
 * @param layout Layout to check
 * @param cols Number of columns
 * @returns Whether the layout has gaps
 */
export const hasGaps = <T extends Layout | GridItem>(layout: T[], cols: number): boolean => {
  if (!layout.length) return false;
  
  // Create a grid representation
  const grid: boolean[][] = [];
  const maxY = Math.max(...layout.map(item => item.y + item.h));
  
  // Initialize grid
  for (let y = 0; y <= maxY; y++) {
    grid[y] = Array(cols).fill(false);
  }
  
  // Mark occupied cells
  layout.forEach(item => {
    for (let y = item.y; y < item.y + item.h; y++) {
      for (let x = item.x; x < item.x + item.w; x++) {
        if (x < cols && y < grid.length) {
          grid[y][x] = true;
        }
      }
    }
  });
  
  // Find gaps by checking each row
  for (let y = 0; y < maxY; y++) {
    let hasGapInRow = false;
    let hasCellAfterGap = false;
    
    for (let x = 0; x < cols; x++) {
      if (!grid[y][x]) {
        hasGapInRow = true;
      } else if (hasGapInRow) {
        hasCellAfterGap = true;
        break;
      }
    }
    
    if (hasGapInRow && hasCellAfterGap) {
      return true;
    }
  }
  
  return false;
};

/**
 * Creates a default grid layout configuration optimized for dashboards
 * 
 * @returns Default grid configuration
 */
export const getDefaultGridConfig = () => {
  return {
    breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
    cols: { lg: 12, md: 8, sm: 6, xs: 4, xxs: 2 },
    rowHeight: 100,
    compactType: 'vertical',
    preventCollision: false,
    margin: [10, 10],
    containerPadding: [10, 10],
    autoSize: true,
    verticalCompact: true
  };
}; 
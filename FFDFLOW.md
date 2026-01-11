# FFD Greedy Algorithm Flow

## Overview
This project implements a **First Fit Decreasing (FFD) Greedy Algorithm** for the bin packing problem using a generic, problem-agnostic greedy algorithm framework with support for multiple selection criteria (area or height-based).

---

## Architecture

### 1. Generic Greedy Algorithm (`GreedyAlgorithm.ts`)
Core algorithm that works for any optimization problem:

```
┌─────────────────────────────────────────────────────┐
│        GreedyAlgorithm<T, S>                        │
│  (Generic - no problem-specific knowledge)          │
└─────────────────────────────────────────────────────┘
         ↓
    solve(elements: T[])
         ↓
┌─────────────────────────────────────────────────────┐
│ 1. Prepare & Sort elements via SolutionBuilder      │
│    (delegates to prepareElements())                 │
│    ├─ Calculates value for each element             │
│    │  (based on criterion: area or height)          │
│    └─ Sorts descending by value                     │
│                                                     │
│ 2. Initialize empty solution                        │
│                                                     │
│ 3. WHILE remaining candidates exist:                │
│    ├─ SelectionStrategy.selectNext()                │
│    │  (pick highest value from candidates)          │
│    │                                                │
│    ├─ Remove selected from remaining candidates     │
│    │                                                │
│    ├─ SolutionBuilder.addElement()                  │
│    │  (try to place in existing box, create if      │
│    │   needed, using Bottom-Left fill)              │
│    │                                                │
│    └─ Track selected elements                       │
│                                                     │
│ 4. Return result with boxes and execution time      │
└─────────────────────────────────────────────────────┘
```

**Key Pattern:**
- Pre-sort all rectangles by criterion (descending)
- Iteratively pick the highest remaining value
- Use First Fit: place in first box where it fits
- Create new box only when necessary
- Repeats until all elements processed or none fit

---

## 2. FFD Greedy Implementation for Bin Packing

### Selection Criteria

The algorithm supports two selection criteria via the `SelectionCriterion` type:

```typescript
type SelectionCriterion = 'area' | 'height'
```

### Problem-Specific Components

#### A. **Selection Strategies**

**`AreaBasedSelection`** (Default FFD by area):
- Compares rectangles by: `width × height`
- Larger rectangles packed first
- Most aggressive packing strategy

**`HeightBasedSelection`** (FFD by height):
- Compares rectangles by: `max(width, height)`
- Taller/wider rectangles packed first
- Alternative heuristic

#### B. **Solution Builder: `BinPackingSolutionBuilder`**

Accepts criterion parameter to determine value calculation:

```typescript
constructor(boxSize: number, criterion: SelectionCriterion = 'area')
```

**`prepareElements(rectangles)`** → Pre-sort Step:
```
INPUT: Rectangles [50, 100, 60, 80]
         ↓
CALCULATE VALUE based on criterion:
  - If criterion = 'area': [50, 100, 60, 80]
  - If criterion = 'height': [50, 100, 60, 80] (simplified)
         ↓
SORT: Descending by value
  - Result: [100, 80, 60, 50] ← Largest first
         ↓
OUTPUT: Pre-sorted GreedyElements array
```

**`addElement(currentSolution, rectangle)`** → First Fit Placement:
```
INPUT: Rectangle to place + Current solution with boxes
         ↓
FOR each existing box (in order):
  ├─ findBestPosition(box, rectangle)
  │  ├─ Try both orientations (normal & rotated)
  │  ├─ Generate candidate positions (0,0 + positions next to existing rects)
  │  ├─ Check each position with Bottom-Left preference
  │  └─ Return first valid position or null
  ├─ If position found:
  │  ├─ Place rectangle with exact coordinates
  │  └─ Return solution (STOP - First Fit found)
  └─ Else continue to next box
       ↓
IF not placed in any box:
  ├─ Create NEW box
  ├─ findBestPosition(newBox, rectangle)
  ├─ Place rectangle in new box
  └─ Add box to solution
```

---

## 3. Complete FFD Flow Example

```
INPUT: [Rect A (area:100), Rect B (area:80), Rect C (area:60), Rect D (area:50)]

STEP 1: Prepare & Sort (prepareElements)
├─ Calculate areas: [100, 80, 60, 50]
├─ Sort descending: [100, 80, 60, 50]
└─ Candidates (remaining): [100, 80, 60, 50]

STEP 2: Main Loop - Iteration 1
├─ selectNext([100, 80, 60, 50])
├─ Pick: Rect A (value=100) ← Highest
├─ Remove from candidates → [80, 60, 50]
├─ addElement(no boxes yet, Rect A)
│  └─ Create Box 1, place Rect A at (0, 0)
└─ Status: Box1: [A]

STEP 3: Iteration 2
├─ selectNext([80, 60, 50])
├─ Pick: Rect B (value=80) ← Highest
├─ Remove → [60, 50]
├─ addElement(Box 1, Rect B)
│  ├─ Check if Rect B fits in Box 1
│  ├─ If YES → Place and RETURN
│  └─ If NO → Create Box 2, place Rect B
└─ Status: Box1: [A, B] or Box1:[A], Box2:[B]

STEP 4: Iteration 3
├─ selectNext([60, 50])
├─ Pick: Rect C (value=60) ← Highest
├─ Remove → [50]
├─ addElement(try Box1, Box2, create if needed)
└─ Continue...

STEP 5: Iteration 4
├─ selectNext([50])
├─ Pick: Rect D (value=50) ← Last item
├─ Remove → []
├─ addElement(place in appropriate box)
└─ No more candidates - DONE

OUTPUT: Packed boxes with FFD order maintained across all boxes
```

---

## 4. Key FFD Properties

✅ **Pre-sorted Descending:** All rectangles sorted by criterion before iteration
✅ **First Fit:** Place in first box where it fits (no rearrangement)
✅ **Order Preserved:** Large items always processed before smaller items
✅ **Greedy:** No backtracking or optimization
✅ **Multiple Criteria:** Supports area-based or height-based selection
✅ **Bottom-Left Fill:** Positions rectangles starting from bottom-left in each box

---

## 5. File Structure

```
GreedyAlgorithm.ts
├─ GreedyAlgorithm<T, S>  (Generic container)
├─ SelectionStrategy<T>   (Interface: selectNext)
├─ SolutionBuilder<T, S>  (Interface: prepare, addElement, create)
└─ GreedyElement<T>       (Interface: element + value)
         ↑
         │ Implemented by
         ↓
binPackingProblem.ts
├─ SelectionCriterion    (Type: 'area' | 'height')
├─ AreaBasedSelection    (FFD by area - default)
├─ HeightBasedSelection  (FFD by max dimension)
├─ BinPackingSolutionBuilder (Packing logic with criterion)
├─ BinPackingSolver      (Main entry point)
└─ greedyPacking.ts
   ├─ GreedyPacker       (area-based)
   └─ HeightBasedGreedyPacker (height-based)
```

---

## 6. Usage Examples

### Area-Based FFD (Default):
```typescript
const solver = new BinPackingSolver(boxSize, new AreaBasedSelection(), 'area');
const result = solver.solve(rectangles);

// Or using the convenience class:
const packer = new GreedyPacker(boxSize);
const result = packer.pack(rectangles);
```

### Height-Based FFD:
```typescript
const solver = new BinPackingSolver(boxSize, new HeightBasedSelection(), 'height');
const result = solver.solve(rectangles);

// Or using the convenience class:
const packer = new HeightBasedGreedyPacker(boxSize);
const result = packer.pack(rectangles);
```

### Result Structure:
```typescript
{
  boxes: Box[],           // Packed rectangles organized by box
  totalBoxes: number,     // Total number of boxes used
  utilization: number,    // Space utilization percentage
  algorithm: string,      // Algorithm description
  executionTime: number   // Execution time in ms
}
```

---

## Summary

The algorithm achieves **true FFD** by:
1. **Pre-sorting all rectangles by criterion (area or height) in descending order**
2. **Maintaining sorted order** throughout the selection process
3. **Selecting largest first** using greedy strategy
4. **Using First Fit placement** - placing in first available box
5. **Creating new boxes only when needed** - no rearrangement
6. **Supporting multiple criteria** for different packing heuristics

This ensures FFD behavior for bin packing with flexible selection criteria.

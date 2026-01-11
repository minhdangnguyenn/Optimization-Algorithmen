# FFD Greedy Algorithm Flow

## Overview
This project implements a **First Fit Decreasing (FFD) Greedy Algorithm** for the bin packing problem using a generic, problem-agnostic greedy algorithm framework.

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
│                                                     │
│ 2. Initialize empty solution                        │
│                                                     │
│ 3. WHILE remaining candidates exist:                │
│    ├─ SelectionStrategy.selectNext()                │
│    │  (pick best from candidates)                   │
│    │                                                │
│    ├─ Remove selected from remaining candidates     │
│    │                                                │
│    ├─ SolutionBuilder.addElement()                  │
│    │  (try to place in solution)                    │
│    │                                                │
│    └─ Track selected elements                       │
│                                                     │
│ 4. Return result                                    │
└─────────────────────────────────────────────────────┘
```

**Key Pattern:**
- Selects best element based on strategy
- Removes selected from candidates
- Adds to solution
- Repeats until no elements or all placed

---

## 2. FFD Greedy Implementation for Bin Packing

### Problem-Specific Components

#### A. **Selection Strategy: `AreaBasedSelection`**
```typescript
selectNext(candidates: GreedyElement<Rectangle>[]): GreedyElement<Rectangle> | null
```
- Receives **pre-sorted candidates** (largest area first)
- Returns the element with **highest area value** from remaining
- Implements the "Decreasing" part of FFD

#### B. **Solution Builder: `BinPackingSolutionBuilder`**

**`prepareElements(rectangles)`** → FFD Pre-sort Step:
```
INPUT: Rectangles in any order
         ↓
SORT: By area (descending) ← KEY: Largest first
         ↓
OUTPUT: Pre-sorted GreedyElements array
```

**`addElement(currentSolution, rectangle)`** → First Fit Placement:
```
TRY: Place in each existing box (in order)
  ├─ findBestPosition(box, rect)
  │  └─ Uses Bottom-Left fill strategy
  ├─ If found → place & return
  └─ If not found → continue
       ↓
CREATE: New box if doesn't fit anywhere
  ├─ findBestPosition(newBox, rect)
  ├─ Place rectangle
  └─ Add box to solution
```

---

## 3. Complete FFD Flow Example

```
INPUT: [Rect A: 100, Rect B: 80, Rect C: 60, Rect D: 50]

STEP 1: Prepare & Sort
├─ prepareElements()
├─ Sort by area descending
└─ Candidates: [100, 80, 60, 50]  ← Pre-sorted

STEP 2: Main Loop - Iteration 1
├─ selectNext([100, 80, 60, 50])
├─ Pick: Rect A (100) ← Highest area
├─ Remove from candidates → [80, 60, 50]
├─ addElement(Box 1, Rect A)
│  └─ Place at (0, 0)
└─ Status: Box1: [A(100)]

STEP 3: Iteration 2
├─ selectNext([80, 60, 50])
├─ Pick: Rect B (80)
├─ Remove → [60, 50]
├─ addElement(Box 1, Rect B)
│  └─ If fits in Box1 → Place
│  └─ Else → Create Box2 & place there
└─ Status: Box1: [A, B] or Box1:[A], Box2:[B]

STEP 4: Iteration 3
├─ selectNext([60, 50])
├─ Pick: Rect C (60)
├─ Remove → [50]
├─ Try Box1, Box2, create if needed
└─ Continue...

STEP 5: Iteration 4
├─ selectNext([50])
├─ Pick: Rect D (50)
├─ Remove → []
├─ Place in appropriate box
└─ Done

OUTPUT: Packed boxes with FFD order maintained
```

---

## 4. Key FFD Properties

✅ **Sorted Descending:** Rectangles pre-sorted by area
✅ **First Fit:** Place in first box where it fits (no swapping)
✅ **Order Preserved:** Large items processed first across all boxes
✅ **Greedy:** No backtracking or optimization

---

## 5. File Structure

```
GreedyAlgorithm.ts
├─ GreedyAlgorithm<T, S>  (Generic container)
├─ SelectionStrategy<T>    (Interface: selectNext)
├─ SolutionBuilder<T, S>   (Interface: prepare, addElement)
└─ FeasibilityChecker<T, S> (Interface: isFeasible)
         ↑
         │ Implemented by
         ↓
binPackingProblem.ts
├─ AreaBasedSelection      (FFD selection)
├─ HeightBasedSelection    (Alternative)
├─ WidthBasedSelection     (Alternative)
├─ BinPackingSolutionBuilder (Packing logic)
├─ BinPackingFeasibility
└─ BinPackingSolver        (Main entry point)
```

---

## 6. Usage Example

```typescript
// Create solver with FFD strategy
const solver = new BinPackingSolver(boxSize, new AreaBasedSelection());

// Solve
const result = solver.solve(rectangles);

// Result contains:
// - boxes: Box[] (packed rectangles)
// - totalBoxes: number
// - algorithm: string description
// - executionTime: number
```

---

## Summary

The algorithm achieves **true FFD** by:
1. **Pre-sorting all rectangles by area (descending)**
2. **Selecting in order** from the pre-sorted list
3. **Using First Fit placement** (first box where it fits)
4. **Maintaining global order** across multiple boxes

This ensures optimal FFD behavior for bin packing problems.

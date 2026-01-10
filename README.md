# Optimization Algorithmen - 2D Rectangle Packing Problem

**Module**: Optimization Algorithm  
**Course Project**: WS 2526

A modern web application demonstrating various optimization algorithms for solving the 2D rectangle packing problem. This project implements and compares multiple algorithmic approaches including greedy algorithms and local search optimization techniques.

This project showcases a freely-chosen tech stack combining React, TypeScript, and Vite to create an interactive, performant solution for algorithm visualization and experimentation.

## Project Overview

The 2D Rectangle Packing Problem is a classic combinatorial optimization challenge: given a set of rectangles and bins of fixed size, find an efficient way to pack the rectangles into the minimum number of bins. This project provides interactive visualization and implementation of multiple solution strategies.

## Features

- **Multiple Algorithm Implementations**
  - Generic Greedy Algorithm framework
  - Multiple selection strategies (Area-based, Width-based, Height-based)
  - Local Search optimization with neighborhood operations
  - Rectangle rotation support

- **Interactive Web Interface**
  - Add, edit, and remove rectangles
  - Configure bin dimensions
  - Run different algorithms and compare results
  - Real-time visualization of packing results
  - Performance metrics and statistics

- **Advanced Optimization Techniques**
  - **Geometry-based Neighborhood**: Repositions rectangles within and between bins
  - **Structure-based Neighborhood**: Removes and re-inserts rectangles for optimization
  - Support for rotated rectangles to improve packing efficiency

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Language**: TypeScript 5
- **Styling**: CSS
- **Build & Deploy**: Vite + gh-pages

## Project Structure

```
src/
├── components/              # React UI components
│   ├── AlgorithmControls.tsx    # Algorithm selection and execution
│   ├── PackingVisualization.tsx # Canvas-based visualization
│   ├── RectangleInput.tsx       # Input form for rectangles
│   └── RectangleList.tsx        # Display and manage rectangles
├── algorithms/              # Algorithm implementations
│   ├── genericGreedy.ts         # Generic greedy algorithm framework
│   ├── binPackingProblem.ts     # Problem-specific logic and strategies
│   ├── greedyPacking.ts         # Greedy packing wrapper
│   └── localSearch.ts           # Local search optimization algorithms
├── App.tsx                  # Main application component
├── types.ts                 # TypeScript interfaces
└── main.tsx                 # Application entry point
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
cd /home/dangminh/repo_ubuntu/optalg/Optimization-Algorithmen
npm install
```

2. Start the development server
```bash
npm run dev
```

The application will open at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

This creates optimized production files in the `dist/` directory.

## Usage

### Basic Workflow

1. **Add Rectangles**: Enter width and height values to add rectangles to the problem
2. **Set Box Size**: Configure the square bin size for packing
3. **Select Algorithm**: Choose from available packing algorithms
4. **Run Algorithm**: Execute the selected algorithm and visualize results
5. **View Results**: See metrics including number of boxes used and utilization percentage

### Available Algorithms

#### Greedy Algorithms
- **Area-Based Selection (First Fit Decreasing)**: Prioritizes larger rectangles
- **Width-Based Selection**: Sorts by width
- **Height-Based Selection**: Sorts by height

#### Local Search
- **Geometry-Based Neighborhood**: Adjusts rectangle positions
- **Structure-Based Neighborhood**: Re-inserts rectangles for better placement

## Core Concepts

### Generic Greedy Framework

The `GenericGreedyAlgorithm` provides a reusable framework for any optimization problem requiring greedy selection. It separates concerns through:

- **Selection Strategy**: Defines how to choose the next element
- **Feasibility Checker**: Validates if placements are possible
- **Solution Builder**: Constructs the final solution

### Data Types

Key interfaces defined in `types.ts`:

- **Rectangle**: Represents a rectangle with dimensions and ID
- **PlacedRectangle**: Rectangle with assigned position (x, y, boxId)
- **Box**: Container with rectangles and dimensions
- **PackingResult**: Complete packing solution with metrics
- **PackingResult**: Complete packing solution with metrics

## Algorithm Details

### Greedy Packing
Greedy algorithms work by selecting rectangles according to a strategy and attempting to fit them into boxes using a First Fit approach. The algorithm is fast but doesn't guarantee optimal solutions.

### Local Search
Local search improvements operate on an initial solution by exploring neighboring solutions through small modifications:
- Moving rectangles within the same box
- Transferring rectangles between boxes
- Re-inserting rectangles for better placement

## Performance Metrics

The application tracks:
- **Total Boxes**: Number of bins used
- **Utilization**: Percentage of used space vs total space
- **Execution Time**: Algorithm runtime in milliseconds

## Development

### Available Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build for production
npm run preview  # Preview production build
npm run deploy   # Deploy to GitHub Pages
npm run lint     # Run ESLint
```

### Code Quality

The project uses ESLint for code quality with TypeScript support:
```bash
npm run lint
```

## Contributing

When extending this project:

1. Keep algorithm implementations generic where possible
2. Separate problem-specific logic from algorithm logic
3. Add TypeScript types for all functions and interfaces
4. Update tests as you add new features

## References

This project implements solutions for the classic NP-hard 2D Rectangle Packing Problem, covering both classical optimization approaches (greedy algorithms) and metaheuristic techniques (local search).

## License

Private project for educational purposes.

---

**Created**: 2025-2026
**Status**: Active Development

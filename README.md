# Optimization Algorithm

## 🎯 Project Overview
This project implements and compares **greedy** and **local search** algorithms for solving the **2D rectangle packing problem**. Given a set of rectangles with varying dimensions (rotatable by 90°) and a fixed container box size, the objective is to **minimize the number of boxes** required to pack all rectangles.

---

## 📊 Problem Description

### **Input Parameters:**
- **Rectangles**: Set of `n` rectangles with dimensions `(widthᵢ, heightᵢ)`
- **Rotation**: Each rectangle can be rotated 90° (width ↔ height)
- **Box Size**: Square container with fixed edge length `L`
- **Constraints**: No overlap between rectangles, all rectangles must be fully contained within boxes

### **Objective Function:**
- Minimize: Number of boxes used
- Subject to: All rectangles must be packed without overlap

### **Algorithmen Idea**
- FFD + local search optimal
1. Find the largest rectangle, after that go to the smaller triangles
2. Put the biggest one into the first box, then calculate the rest space 
3. Base on the left space, put sequentially other rectangles (put them from bigger to smaller)
4. Then use local search to fill up all the left spaces
5. Iterate in all left spaces and left triangles, find a way to orient them
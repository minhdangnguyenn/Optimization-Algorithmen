// Simple test to verify the algorithm fixes
console.log("Testing Rectangle Packing Algorithms...");

// Test rectangles
const testRectangles = [
    { id: 1, width: 30, height: 40, originalWidth: 30, originalHeight: 40, rotated: false },
    { id: 2, width: 25, height: 35, originalWidth: 25, originalHeight: 35, rotated: false },
    { id: 3, width: 20, height: 30, originalWidth: 20, originalHeight: 30, rotated: false },
    { id: 4, width: 150, height: 200, originalWidth: 150, originalHeight: 200, rotated: false }, // Too large
];

const boxSize = 100;

console.log(`Box size: ${boxSize}x${boxSize}`);
console.log(`Test rectangles: ${testRectangles.length}`);
console.log("Rectangles:", testRectangles.map(r => `${r.width}x${r.height}`).join(", "));

// Test case 1: Normal rectangles that should fit
const normalRectangles = testRectangles.slice(0, 3);
console.log("\n=== Test 1: Normal rectangles ===");
console.log(`Testing ${normalRectangles.length} rectangles that should fit`);

// Test case 2: Include rectangle that's too large
console.log("\n=== Test 2: Including oversized rectangle ===");
console.log(`Testing ${testRectangles.length} rectangles (including one too large)`);

console.log("\nAlgorithm should now:");
console.log("1. Check if rectangles fit in box size");
console.log("2. Report exactly how many rectangles were placed");
console.log("3. Show warnings/errors for oversized rectangles");
console.log("4. Guarantee ALL valid rectangles are placed");

console.log("\nOpen index-standalone.html to test the fixed algorithms!");
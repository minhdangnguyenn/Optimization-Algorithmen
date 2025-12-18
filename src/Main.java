public static void main(String[] args) {
    // Create a test instance
    TestInstance testInstance = new TestInstance(
            1,      // instance ID
            100,    // box length
            20,     // number of rectangles
            2, 10,  // min and max width
            3, 15,  // min and max height
            12345L  // random seed (for reproducibility)
    );

    // Display instance information
    System.out.println(testInstance.toString());
    System.out.println("\nDetailed information:");
    System.out.println(testInstance.toDetailedString());

    // Get instance properties
    System.out.println("Box length: " + testInstance.getBoxLength());
    System.out.println("Rectangle count: " + testInstance.getRectangleCount());
    System.out.println("Total rectangle area: " + testInstance.getTotalRectangleArea());
    System.out.println("Packing density: " + testInstance.getPackingDensity());

    System.out.println("-------DRAW RECTANGLES-----------");

    LocalSearch localSearch = new LocalSearch(testInstance.getRectangles(), testInstance.getBoxLength());

    for (Rectangle r : localSearch.getRectangles()) {
        r.draw();
        System.out.println();
        System.out.println("Rectangle Area: "+r.getArea());
    }

    System.out.println("---------DRAW BOX----------");
    Box box = testInstance.getBox();
    box.draw();

    localSearch.runFFD();
}
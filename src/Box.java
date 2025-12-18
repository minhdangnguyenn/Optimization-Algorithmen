import java.util.ArrayList;
import java.util.List;
import java.util.Vector;

public class Box {
    private final int length;
    private int usedArea;
    private List<Rectangle> rectangles = new ArrayList<>();
    private int area;

    // Constructor
    public Box(int length) {
        this.length = length;
        this.area = calculateArea();
        this.rectangles = new Vector<>();
        this.usedArea = 0;
    }

    public int getLength() {
        return this.length;
    }

    // Calculate area based on length and width
    private int calculateArea() {
        return this.length * this.length;
    }

    // Method to remove rectangle by index
    public void removeRectangle(Rectangle rec) {
        rectangles.remove(rec);
        usedArea -= rec.getArea();
    }

    // Method to calculate total area of all rectangles in the box
    public int calculateTotalRectanglesArea() {
        int totalArea = 0;
        for (Rectangle rect : rectangles) {
            totalArea += (rect.getWidth() * rect.getHeight());
        }
        return totalArea;
    }

    // Method to calculate remaining empty area in the box
    public int calculateEmptyArea() {
        return this.usedArea - calculateTotalRectanglesArea();
    }

    // Override toString for better representation
    @Override
    public String toString() {
        return String.format("Box[L=%d, W=%d, Area=%d, Rectangles=%d, EmptyArea=%d]",
                length, length, usedArea, rectangles.size(), calculateEmptyArea());
    }

    // Utility method to display box contents
    public void displayContents() {
        System.out.println("=== Box Information ===");
        System.out.println("Dimensions: " + length + " x " + length);
        System.out.println("Total Area: " + usedArea);
        System.out.println("Number of Rectangles: " + rectangles.size());
        System.out.println("Total Rectangles Area: " + calculateTotalRectanglesArea());
        System.out.println("Empty Area: " + calculateEmptyArea());

        if (!rectangles.isEmpty()) {
            System.out.println("\nRectangles in box:");
            for (int i = 0; i < rectangles.size(); i++) {
                Rectangle rect = rectangles.get(i);
                System.out.printf("  [%d] Rectangle: %d x %d (Area: %d)%n",
                        i, rect.getWidth(), rect.getHeight(), rect.getWidth() * rect.getHeight());
            }
        }
    }

    public boolean canFit(Rectangle r) {
        return usedArea + r.getArea() <= length * length;
    }

    public void addRectangle(Rectangle r) {
        rectangles.add(r);
        usedArea += r.getArea();
    }

    public void draw() {
        for (int i = 0; i < this.length; i++) {          // rows
            for (int j = 0; j < this.length; j++) {       // columns
                // Top edge, bottom edge, left edge, right edge
                if (i == 0 || i == this.length - 1 ||
                        j == 0 || j == this.length - 1) {
                    System.out.print("*");
                } else {
                    System.out.print(" ");               // interior
                }
            }
            System.out.println();
        }
    }

    public void placeRectangle(Rectangle rec, int x, int y) {
        // subtract the area
        this.usedArea -= rec.getArea();

        // add inside the box
        this.rectangles.add(rec);

        // calculate the position
    }

    public List<Rectangle> getRectangles() {
        return rectangles;
    }

    public int getFreeArea() {
        return length * length - usedArea;
    }

    public boolean isEmpty() {
        return rectangles.isEmpty();
    }
}
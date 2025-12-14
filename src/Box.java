import java.util.Vector;

public class Box {
    private int length;
    private int width;
    private int area;
    private Vector<Rectangle> insideRectangles;

    // Constructor
    public Box(int length, int width) {
        setLength(length);
        setWidth(width);
        calculateArea();
        this.insideRectangles = new Vector<>();
    }

    public Box() {
        this(0, 0);
    }

    // Calculate area based on length and width
    private void calculateArea() {
        this.area = this.length * this.width;
    }

    // Method to add a rectangle to the box
    public void addRectangle(Rectangle rectangle) {
        if (rectangle == null) {
            throw new IllegalArgumentException("Rectangle cannot be null");
        }

        // Validate rectangle fits within box limits
        if (rectangle.getX() < 0 || rectangle.getX() > this.length ||
                rectangle.getY() < 0 || rectangle.getY() > this.width) {
            throw new IllegalArgumentException(
                    String.format("Rectangle (x=%d, y=%d) doesn't fit in box (L=%d, W=%d)",
                            rectangle.getX(), rectangle.getY(), this.length, this.width)
            );
        }

        insideRectangles.add(rectangle);
    }

    // Method to remove a rectangle
    public boolean removeRectangle(Rectangle rectangle) {
        return insideRectangles.remove(rectangle);
    }

    // Method to remove rectangle by index
    public Rectangle removeRectangle(int index) {
        if (index < 0 || index >= insideRectangles.size()) {
            throw new IndexOutOfBoundsException("Invalid rectangle index: " + index);
        }
        return insideRectangles.remove(index);
    }

    // Method to calculate total area of all rectangles in the box
    public int calculateTotalRectanglesArea() {
        int totalArea = 0;
        for (Rectangle rect : insideRectangles) {
            totalArea += (rect.getX() * rect.getY());
        }
        return totalArea;
    }

    // Method to calculate remaining empty area in the box
    public int calculateEmptyArea() {
        return this.area - calculateTotalRectanglesArea();
    }

    // Method to check if a specific rectangle can fit in the box
    public boolean canFitRectangle(Rectangle rectangle) {
        if (rectangle == null) return false;

        // Check if rectangle dimensions fit within box
        return rectangle.getX() <= this.length && rectangle.getY() <= this.width;
    }

    // Method to find rectangles by size
    public Vector<Rectangle> findRectanglesBySize(int width, int height) {
        Vector<Rectangle> result = new Vector<>();
        for (Rectangle rect : insideRectangles) {
            if (rect.getX() == width && rect.getY() == height) {
                result.add(rect);
            }
        }
        return result;
    }

    // Method to get rectangle count
    public int getRectangleCount() {
        return insideRectangles.size();
    }

    // Method to clear all rectangles
    public void clearRectangles() {
        insideRectangles.clear();
    }

    // Getter and Setter for length with validation
    public int getLength() {
        return length;
    }

    public void setLength(int length) {
        if (length < 0) {
            throw new IllegalArgumentException("Length cannot be negative");
        }
        this.length = length;
        calculateArea(); // Recalculate area when length changes
    }

    // Getter and Setter for width with validation
    public int getWidth() {
        return width;
    }

    public void setWidth(int width) {
        if (width < 0) {
            throw new IllegalArgumentException("Width cannot be negative");
        }
        this.width = width;
        calculateArea(); // Recalculate area when width changes
    }

    // Getter for area (read-only, calculated automatically)
    public int getArea() {
        return area;
    }

    // Note: No setter for area since it's calculated from length and width

    // Getter for insideRectangles
    public Vector<Rectangle> getInsideRectangles() {
        // Return a copy to prevent external modification
        return new Vector<>(insideRectangles);
    }

    // Setter for insideRectangles with validation
    public void setInsideRectangles(Vector<Rectangle> insideRectangles) {
        if (insideRectangles == null) {
            this.insideRectangles = new Vector<>();
        } else {
            // Validate all rectangles fit in the box
            for (Rectangle rect : insideRectangles) {
                if (!canFitRectangle(rect)) {
                    throw new IllegalArgumentException(
                            String.format("Rectangle (x=%d, y=%d) doesn't fit in box",
                                    rect.getX(), rect.getY())
                    );
                }
            }
            this.insideRectangles = new Vector<>(insideRectangles);
        }
    }

    // Override toString for better representation
    @Override
    public String toString() {
        return String.format("Box[L=%d, W=%d, Area=%d, Rectangles=%d, EmptyArea=%d]",
                length, width, area, insideRectangles.size(), calculateEmptyArea());
    }

    // Utility method to display box contents
    public void displayContents() {
        System.out.println("=== Box Information ===");
        System.out.println("Dimensions: " + length + " x " + width);
        System.out.println("Total Area: " + area);
        System.out.println("Number of Rectangles: " + insideRectangles.size());
        System.out.println("Total Rectangles Area: " + calculateTotalRectanglesArea());
        System.out.println("Empty Area: " + calculateEmptyArea());

        if (!insideRectangles.isEmpty()) {
            System.out.println("\nRectangles in box:");
            for (int i = 0; i < insideRectangles.size(); i++) {
                Rectangle rect = insideRectangles.get(i);
                System.out.printf("  [%d] Rectangle: %d x %d (Area: %d)%n",
                        i, rect.getX(), rect.getY(), rect.getX() * rect.getY());
            }
        }
    }
}
import java.util.Vector;

public static void main(String[] args) {
    System.out.println("Hello World");

    final int minX = 1;
    final int maxX = 5;
    final int minY = 2;
    final int maxY = 7;

    try {
        // create limits for rectangles
        Rectangle.initializeLimits(minX, minY, maxX, maxY);

        // create rectangles with valid sides
        Rectangle a = new Rectangle(3, 4);

        Box box = new Box(10, 10);

        box.addRectangle(a);

        System.out.println("\n=== Rectangle Information ===");
        System.out.println("Rectangle a: " + a.getX() + " x " + a.getY());
        System.out.println("Rectangle area: " + (a.getX() * a.getY()));
        System.out.println("Global limits - X: [" + Rectangle.getMinX() + "-" + Rectangle.getMaxX() +
                "], Y: [" + Rectangle.getMinY() + "-" + Rectangle.getMaxY() + "]");

        System.out.println("\n=== Box Information ===");
        box.displayContents();

        // add more rectangles
        System.out.println("\n=== Adding more rectangles ===");

        Rectangle b = new Rectangle(2, 3);
        Rectangle c = new Rectangle(4, 5);
        Rectangle d = new Rectangle(1, 2);

        box.addRectangle(b);
        box.addRectangle(c);
        box.addRectangle(d);

        System.out.println("Added 3 more rectangles");
        box.displayContents();

        try {
            Rectangle invalidRect = new Rectangle(10, 10); // 10 > maxX (5)
            box.addRectangle(invalidRect);
        } catch (IllegalArgumentException e) {
            System.out.println("\n=== Expected Error ===");
            System.out.println("Cannot create rectangle (10,10): " + e.getMessage());
        }

        try {
            Rectangle bigRect = new Rectangle(5, 7); // max values
            Box smallBox = new Box(3, 3); // Box quá nhỏ
            smallBox.addRectangle(bigRect); // Sẽ throw exception
        } catch (IllegalArgumentException e) {
            System.out.println("\n=== Expected Error ===");
            System.out.println("Rectangle too big for box: " + e.getMessage());
        }

        System.out.println("\n=== Additional Calculations ===");
        System.out.println("Total rectangles in box: " + box.getRectangleCount());
        System.out.println("Box empty area: " + box.calculateEmptyArea());

        Vector<Rectangle> foundRects = box.findRectanglesBySize(1, 2);
        System.out.println("Found " + foundRects.size() + " rectangle(s) with size 1x2");

    } catch (IllegalStateException e) {
        System.err.println("ERROR: " + e.getMessage());
        System.err.println("Did you forget to call Rectangle.initializeLimits()?");
    } catch (IllegalArgumentException e) {
        System.err.println("VALIDATION ERROR: " + e.getMessage());
    } catch (Exception e) {
        System.err.println("UNEXPECTED ERROR: " + e.getMessage());
        e.printStackTrace();
    }
}
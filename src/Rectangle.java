public class Rectangle {
   private static int maxX;
    private static int maxY;
    private static int minX;
    private static int minY;

    private static boolean limitsInitialized = false;

    // Instance fields
    private int x;
    private int y;
    private int area;

    public static void initializeLimits(int userMinX, int userMinY, int userMaxX, int userMaxY) {
        if (limitsInitialized) {
            throw new IllegalStateException("Limits have already been initialized");
        }

        if (userMinX >= userMaxX) {
            throw new IllegalArgumentException("minX must be less than maxX");
        }
        if (userMinY >= userMaxY) {
            throw new IllegalArgumentException("minY must be less than maxY");
        }

        minX = userMinX;
        minY = userMinY;
        maxX = userMaxX;
        maxY = userMaxY;
        limitsInitialized = true;
    }

    // Constructor
    public Rectangle(int x, int y) {
        if (!limitsInitialized) {
            throw new IllegalStateException("Rectangle limits not initialized. Call initializeLimits() first.");
        }
        setX(x);
        setY(y);
        this.area = x*y;
    }

    // Validation methods
    private static void validateLimitsInitialized() {
        if (!limitsInitialized) {
            throw new IllegalStateException("Limits not initialized");
        }
    }

    public static void validateX(int x) {
        validateLimitsInitialized();
        if (x < minX || x > maxX) {
            throw new IllegalArgumentException(
                    String.format("x must be between %d and %d, got %d", minX, maxX, x)
            );
        }
    }

    public static void validateY(int y) {
        validateLimitsInitialized();
        if (y < minY || y > maxY) {
            throw new IllegalArgumentException(
                    String.format("y must be between %d and %d, got %d", minY, maxY, y)
            );
        }
    }

    // Setters với validation
    public void setX(int x) {
        validateX(x);
        this.x = x;

        // recalculate area
        this.area = x*y;
    }

    public void setY(int y) {
        validateY(y);
        this.y = y;

        // recalculate area
        this.area = x*y;
    }

    // Getters
    public int getX() { return x; }
    public int getY() { return y; }

    public static int getMinX() {
        validateLimitsInitialized();
        return minX;
    }
    public static int getMaxX() {
        validateLimitsInitialized();
        return maxX;
    }
    public static int getMinY() {
        validateLimitsInitialized();
        return minY;
    }
    public static int getMaxY() {
        validateLimitsInitialized();
        return maxY;
    }
}
public class Rectangle {
    private int x;
    private int y;
    private int area;
    private boolean isVertical;
    private int minX;
    private int minY;
    private int maxX;
    private int maxY;

    public Rectangle(int x, int y, boolean isVertical) {
        this.x = x;
        this.y = y;
        this.area = x * y;
        this.isVertical = isVertical;
    }

    public void setX(int x) throws Exception {
        if (x < this.minX) {
            throw new Exception("minX is too small: " + x);
        }

        if (x > this.maxX) {
            throw new Exception("miaxX is too big: " + x);
        }

        this.x = x;
        this.area = x*y;
    }

    public int getY() {
        return y;
    }

    public void setY(int y) throws Exception {
        if (y < this.minY) {
            throw new Exception("minY is too small: " + y);
        }

        if (y > this.maxY) {
            throw new Exception("maxY is too big: " + y);
        }

        this.y = y;
        this.area = x*y;
    }

    public int getX() {
        return x;
    }

    public int getArea() {
        return area;
    }

    public void setVertical(boolean vertical) {
        isVertical = vertical;
    }

    public int getMinX() {
        return minX;
    }

    public void setMinX(int minX) {
        this.minX = minX;
    }

    public int getMinY() {
        return minY;
    }

    public void setMinY(int minY) {
        this.minY = minY;
    }

    public int getMaxX() {
        return maxX;
    }

    public void setMaxX(int maxX) {
        this.maxX = maxX;
    }

    public int getMaxY() {
        return maxY;
    }

    public void setMaxY(int maxY) {
        this.maxY = maxY;
    }
}

import java.util.Vector;

public class Box {
    private int length;
    private int area;

    private Vector<Rectangle> insideRectangles;

    public int getLength() {
        return length;
    }

    public void setLength(int length) {
        this.length = length;
    }

    public int getArea() {
        return area;
    }

    public void setArea(int area) {
        this.area = area;
    }

    public Vector<Rectangle> getInsideRectangles() {
        return insideRectangles;
    }

    public void setInsideRectangles(Vector<Rectangle> insideRectangles) {
        this.insideRectangles = insideRectangles;
    }
}

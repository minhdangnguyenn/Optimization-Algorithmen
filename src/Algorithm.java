import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class Algorithm {
    private List<Rectangle> rectangles;
    private int boxLength;
    private List<Box> boxes;

    public Algorithm(List<Rectangle> rectangles, int boxLength) {
        this.rectangles = sortRectanglesByAreaDesc(rectangles);
        this.boxLength = boxLength;
        this.boxes = new ArrayList<>();
    }

    /**
     * Sorts rectangles in DESCENDING order based on their area
     * Larger rectangles come first, smaller ones come later
     *
     * @param rectangles list of rectangles to sort
     * @return new ArrayList sorted by area in descending order
     */
    private List<Rectangle> sortRectanglesByAreaDesc(List<Rectangle> rectangles) {
        // Create a copy to avoid modifying the original list

        // Sort using Comparator - compare by area in DESCENDING order
        rectangles.sort(new Comparator<Rectangle>() {
            @Override
            public int compare(Rectangle r1, Rectangle r2) {
                // Calculate areas
                int area1 = r1.getArea();
                int area2 = r2.getArea();

                // For descending order: r2.area - r1.area
                return Integer.compare(area2, area1);
            }
        });

        return rectangles;
    }

    // Rectangles is a desc sorted array base on the area of the rectangles
    public List<Rectangle> getRectangles() {
        return rectangles;
    }

    // First Fit Decreasing

    // Local Search Optimal to fill the left spaces
}

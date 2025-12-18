import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class LocalSearch {

    private List<Rectangle> rectangles;
    private int boxLength;
    private List<Box> boxes;
    private int boxArea;

    public LocalSearch(List<Rectangle> rectangles, int boxLength) {
        this.rectangles = sortRectanglesByAreaDesc(new ArrayList<>(rectangles));
        this.boxLength = boxLength;
        this.boxes = new ArrayList<>();
        this.boxArea = boxLength * boxLength;
    }

    /**
     * Sort rectangles DESCENDING by area
     */
    private List<Rectangle> sortRectanglesByAreaDesc(List<Rectangle> rectangles) {
        rectangles.sort((r1, r2) ->
                Integer.compare(r2.getArea(), r1.getArea()));
        return rectangles;
    }

    public List<Rectangle> getRectangles() {
        return rectangles;
    }

    /**
     * FIRST FIT DECREASING
     * Creates a bad-but-valid initial solution
     */
    public void runFFD() {
        boxes.clear();

        // Greedy here, pull all into the first box if they can be fit in
        for (Rectangle r : rectangles) {
            boolean placed = false;

            for (Box box : boxes) {
                // check if rectangle could be fit inside the box
                if (box.canFit(r)) {
                    box.addRectangle(r);
                    placed = true;
                    break;
                }
            }

            if (!placed) {
                Box newBox = new Box(boxLength);
                newBox.addRectangle(r);
                boxes.add(newBox);
            }
        }

        System.out.println("Number of box need to use for the FFD: " + boxes.size());
    }

    /**
     * LOCAL SEARCH
     * Try to move rectangles from one box to another
     * Goal: eliminate boxes
     */
    public void runLocalSearch() {
        boolean improvement = true;

        while (improvement) {
            improvement = false;

            // Iterate over boxes (try to empty one box)
            Iterator<Box> boxIterator = boxes.iterator();

            while (boxIterator.hasNext()) {
                Box sourceBox = boxIterator.next();

                // Copy to avoid ConcurrentModificationException
                List<Rectangle> rects = new ArrayList<>(sourceBox.getRectangles());

                for (Rectangle r : rects) {
                    if (tryMoveRectangle(r, sourceBox)) {
                        improvement = true;

                        // Remove empty box
                        if (sourceBox.isEmpty()) {
                            boxIterator.remove();
                        }
                        break;
                    }
                }

                if (improvement) {
                    break;
                }
            }
        }

        System.out.println("Boxes after Local Search: " + boxes.size());
    }

    /**
     * Try to move rectangle r from sourceBox to another box
     */
    private boolean tryMoveRectangle(Rectangle r, Box sourceBox) {
        for (Box targetBox : boxes) {
            if (targetBox == sourceBox) continue;

            if (targetBox.canFit(r)) {
                sourceBox.removeRectangle(r);
                targetBox.addRectangle(r);
                return true;
            }
        }
        return false;
    }

    public List<Box> getBoxes() {
        return boxes;
    }
}

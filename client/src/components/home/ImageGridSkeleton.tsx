const SKELETON_HEIGHTS = [300, 420, 260, 360, 280, 460]
const SKELETON_COUNT = 9

const ImageGridSkeleton = () => {
    return (
        <div
            role="status"
            aria-label="Loading images"
            className="columns-1 sm:columns-2 md:columns-3 md:gap-32 gap-12 space-y-[120px] md:space-y-[180px]"
        >
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                <div key={index} className="break-inside-avoid">
                    <div
                        className="rounded-sm bg-surface-secondary animate-pulse"
                        style={{ height: SKELETON_HEIGHTS[index % SKELETON_HEIGHTS.length] }}
                    />
                </div>
            ))}
        </div>
    )
}

export default ImageGridSkeleton

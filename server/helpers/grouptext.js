export const groupTextBubbles = (boxes, yThreshold = 60, xOverlapThreshold = 0.3) => {
    const groups = [];
    const sorted = [...boxes].sort((a, b) => a.bbox[1] - b.bbox[1]);

    for (const item of sorted) {
        const [x0, y0, x1, y1] = item.bbox;
        let matchedGroup = null;

        for (const group of groups) {
            const g = group.bbox;
            const verticalGap = y0 - g[3];
            const horizontallyOverlap =
                Math.min(x1, g[2]) - Math.max(x0, g[0]) >
                -xOverlapThreshold * (x1 - x0);

            if (verticalGap <= yThreshold && horizontallyOverlap) {
                matchedGroup = group;
                break;
            }
        }

        if (matchedGroup) {
            matchedGroup.bbox = [
                Math.min(matchedGroup.bbox[0], x0),
                Math.min(matchedGroup.bbox[1], y0),
                Math.max(matchedGroup.bbox[2], x1),
                Math.max(matchedGroup.bbox[3], y1),
            ];
            matchedGroup.items.push(item);
        } else {
            groups.push({
                bbox: [...item.bbox],
                items: [item],
            });
        }
    }

    return groups.map((group) => {
        const combinedText = group.items.map((i) => i.text).join("");
        const avgConfidence =
            group.items.reduce((sum, i) => sum + i.confidence, 0) / group.items.length;

        return {
            text: combinedText,
            bbox: group.bbox.map(Math.round),
            confidence: avgConfidence,
            verified: false,
        };
    });
}

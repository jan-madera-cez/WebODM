import Detection3DUtils from '../classes/Detection3D';

describe('Detection3DUtils', () => {
    it('normalizes valid Detection3D scene entries', () => {
        const entries = Detection3DUtils.normalizeDetection3DEntries({
            sjzDetections: [{
                label: '103VF291',
                coordinates: [1, 2, 3],
                dimensions: [0.4, 0.2, 0.05],
                localization_method: 'triangulation',
                uncertainty: 0.12,
                supporting_image_count: 2,
                supporting_detections: [{ room: 'A116', scan_id: 'scan_001', text: '103VF291' }]
            }]
        });

        expect(entries).toHaveLength(1);
        expect(entries[0].displayLabel).toBe('103VF291');
        expect(entries[0].coordinates).toEqual([1, 2, 3]);
        expect(entries[0].supporting_image_count).toBe(2);
    });

    it('drops invalid entries without coordinates', () => {
        const entries = Detection3DUtils.normalizeDetection3DEntries({
            sjzDetections: [{ label: '103VF291' }]
        });

        expect(entries).toEqual([]);
    });
});

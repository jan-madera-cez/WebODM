import Utils from './Utils';

const SCENE_KEY = 'sjzDetections';

const normalizeSupportingDetection = (entry) => {
    if (!entry || typeof entry !== 'object') return null;

    const score = Utils.isNumeric(entry.score) ? parseFloat(entry.score) : null;
    return {
        text: typeof entry.text === 'string' ? entry.text : null,
        score,
        source_kind: typeof entry.source_kind === 'string' ? entry.source_kind : null,
        room: typeof entry.room === 'string' ? entry.room : null,
        scan_id: typeof entry.scan_id === 'string' ? entry.scan_id : null,
        image_path: typeof entry.image_path === 'string' ? entry.image_path : null
    };
};

const normalizeTriplet = (value) => {
    if (!Array.isArray(value) || value.length !== 3) return null;

    const triplet = value.map((coord) => {
        if (!Utils.isNumeric(coord)) return null;
        return parseFloat(coord);
    });
    return triplet.some(coord => coord === null) ? null : triplet;
};

const normalizeDetection3DEntry = (entry, index = 0) => {
    if (!entry || typeof entry !== 'object') return null;

    const coordinates = normalizeTriplet(entry.coordinates);
    if (!coordinates) return null;

    const dimensions = normalizeTriplet(entry.dimensions);
    const label = typeof entry.label === 'string' && entry.label.trim() ? entry.label.trim() : null;
    const supportingDetections = Array.isArray(entry.supporting_detections)
        ? entry.supporting_detections.map(normalizeSupportingDetection).filter(Boolean)
        : [];

    let supportingImageCount = supportingDetections.length;
    if (Utils.isNumeric(entry.supporting_image_count)){
        supportingImageCount = parseInt(entry.supporting_image_count, 10);
    }

    return {
        id: typeof entry.id === 'string' && entry.id ? entry.id : `detection3d-${index}`,
        label,
        displayLabel: label || '(unlabeled)',
        coordinates,
        dimensions,
        localization_method: typeof entry.localization_method === 'string' ? entry.localization_method : null,
        uncertainty: Utils.isNumeric(entry.uncertainty) ? parseFloat(entry.uncertainty) : null,
        supporting_image_count: supportingImageCount,
        supporting_detections: supportingDetections
    };
};

const normalizeDetection3DEntries = (sceneData) => {
    if (!sceneData || typeof sceneData !== 'object') return [];

    const entries = Array.isArray(sceneData[SCENE_KEY]) ? sceneData[SCENE_KEY] : [];
    return entries
        .map((entry, index) => normalizeDetection3DEntry(entry, index))
        .filter(Boolean);
};

export default {
    SCENE_KEY,
    normalizeDetection3DEntry,
    normalizeDetection3DEntries
};

export {
    SCENE_KEY,
    normalizeDetection3DEntry,
    normalizeDetection3DEntries
};

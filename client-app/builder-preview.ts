import builderPreview from "./builder-preview/BuilderPreview";
import runner from "./app-runner";

runner((options) => [{ plugin: builderPreview, options }]);

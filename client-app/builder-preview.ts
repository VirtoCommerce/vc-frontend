import runner from "@/app-runner";
import builderPreviewPlugin from "@/builder-preview/builder-preview.plugin";

runner((options) => [{ plugin: builderPreviewPlugin, options }]);

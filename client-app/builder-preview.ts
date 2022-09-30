import builderPreviewPlugin from "@/builder-preview/builder-preview.plugin";
import runner from "@/app-runner";

runner((options) => [{ plugin: builderPreviewPlugin, options }]);

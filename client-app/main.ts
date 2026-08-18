import runner from "./app-runner";
import { installChunkLoadRecovery } from "./chunk-load-recovery";

installChunkLoadRecovery();

void runner();

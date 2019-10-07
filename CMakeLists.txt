# Project body
message(">>>>>>>>>>>>>>> ThingJS frontend included <<<<<<<<<<<<<<<<<<<")

idf_component_register(
        EMBED_TXTFILES "dist/platform.gz"
        "dist/apps/ante/ante.smt")
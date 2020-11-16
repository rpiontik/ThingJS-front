# Project body
message(">>>>>>>>>>>>>>> ThingJS frontend included <<<<<<<<<<<<<<<<<<<")

idf_component_register(
        SRC_DIRS "./"
        INCLUDE_DIRS  "./"
        EMBED_TXTFILES "dist/platform.gz"
        "dist/apps/ante/ante.smt"
#        "dist/apps/lucerna/lucerna.smt"
        "dist/apps/tinyled/tinyled.smt"
        )
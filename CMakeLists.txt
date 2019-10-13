# Project body
message(">>>>>>>>>>>>>>> ThingJS frontend included <<<<<<<<<<<<<<<<<<<")

idf_component_register(
        SRCS "./fake.c"
        EMBED_TXTFILES "dist/platform.gz"
        "dist/apps/ante/ante.smt")
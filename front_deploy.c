//
// Created by rip on 11.05.2020.
//

#include "front_deploy.h"

// Platform file
extern unsigned char platform_gz_start[] asm("_binary_platform_gz_start");
extern unsigned char platform_gz_end[]   asm("_binary_platform_gz_end");

// Ante launcher
extern unsigned char ante_smt_start[] asm("_binary_ante_smt_start");
extern unsigned char ante_smt_end[]   asm("_binary_ante_smt_end");

// Lucerna application
// extern unsigned char lucerna_smt_start[]  asm("_binary_lucerna_smt_start");
// extern unsigned char lucerna_smt_end[]  asm("_binary_lucerna_smt_end");

#define PREINSTALLED_APPS_NUMBER 2

struct st_thingjs_ext_app preinstalled_applications[PREINSTALLED_APPS_NUMBER] = {
        // !!! REQUIRED !!! Root html file
        { .path = "/platform.html",  .start = platform_gz_start, .end = platform_gz_end },
        // Preinstalled applications
        // Default launcher
        { .path = "/ante.smt",       .start = ante_smt_start,    .end = ante_smt_end },
        // Other preinstalled applications
        //{ .path = "/lucerna.smt",    .start = lucerna_smt_start, .end = lucerna_smt_end }
};

void thingjsGetPreinstalledApplications(struct st_thingjs_ext_app ** list, int * size) {
    *list = preinstalled_applications;
    *size = PREINSTALLED_APPS_NUMBER;
}
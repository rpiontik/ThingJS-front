//
// Created by rip on 11.05.2020.
//

#include "front_deploy.h"
#include "stdbool.h"

// Ante launcher
extern unsigned char ante_smt_start[] asm("_binary_ante_smt_start");
extern unsigned char ante_smt_end[]   asm("_binary_ante_smt_end");

// Lucerna application
extern unsigned char lucerna_smt_start[]  asm("_binary_lucerna_smt_start");
extern unsigned char lucerna_smt_end[]  asm("_binary_lucerna_smt_end");

#define PREINSTALLED_APPS_NUMBER 2

struct st_thingjs_ext_app preinstalled_applications[PREINSTALLED_APPS_NUMBER] = {
        { .file = "ante.smt",       .start = ante_smt_start,    .end = ante_smt_end },
        { .file = "lucerna.smt",    .start = lucerna_smt_start, .end = lucerna_smt_end }
};

void thingjsGetPreinstalledApplications(struct st_thingjs_ext_app ** list, int * size) {
    *list = preinstalled_applications;
    *size = PREINSTALLED_APPS_NUMBER;
}
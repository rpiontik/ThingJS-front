//
// Created by rip on 11.05.2020.
//

#ifndef THINGJS_FRONT_DEPLOY_H
#define THINGJS_FRONT_DEPLOY_H

#include "stdbool.h"
#include "stdint.h"

/*
 * Deploy applications on clear device (after full reset)
 */
struct st_thingjs_ext_app {
    char path[32];
    unsigned char * start;
    unsigned char * end;
};

// Return preinstalled application list
//  list - list of external application
//  size - size of list
void thingjsGetPreinstalledApplications(struct st_thingjs_ext_app ** list, int * size);

#endif //THINGJS_FRONT_DEPLOY_H

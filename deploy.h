//
// Created by rip on 11.05.2020.
//

#ifndef THINGJS_DEPLOY_H
#define THINGJS_DEPLOY_H

#include "stdbool.h"
#include "stdint.h"

/*
 * Deploy applications on clear device (after full reset)
 */
struct st_thingjs_ext_app {
    char file[32];
    char * offset;
    uint32_t size;
};

// Get external application list
//  list - list of external application
//  size - size of list
void thingjsGetExtAppList(struct st_thingjs_ext_app ** list, int * size);

#endif //THINGJS_DEPLOY_H

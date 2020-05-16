'use strict';

const Binary = require('../../build/storage-binary');

module.exports = {
    namespaced: true,
    state: {},

    mutations: {
        // Setting storage status
        $setStorageStatus (state, object) {
            state.$status[object.name] = object.status;
        },

        // Setting new data to storage
        applyData (state, object) {
            if (object.name in state) {
                state[object.name] = object.data;
            } else {
                new Error(`Undefined object storage ${object.name} for ${state.$namespace}`);
            }
        }
    },

    actions: {
        reload (context, object) {
            if (object in context.state) {
                let url =
                    (process.env.NODE_ENV === 'development' ? (process.env.HW_DEVICE_URL ? process.env.HW_DEVICE_URL : '') : '') +
                    `/apps/${context.state.$namespace}/data/${object}`;

                $axios._addPendingRequest(url);

                $axios.get(url,
                    {
                        responseType: 'arraybuffer'
                    }
                ).then((response) => {
                    $axios._removePendingRequest(url);
                    context.commit('applyData',
                        {
                            'name': object,
                            'data': Binary.parseBinaryObject(response.data)
                        }
                    );
                    this.$bus.$emit($consts.EVENTS.STORE_RELOADED, `${context.state.$namespace}/${object}`);
                }).catch((e) => {
                    console.error(e);
                    $axios._removePendingRequest(url);
                    this.$bus.$emit($consts.EVENTS.STORE_ERROR_RELOADED, `${context.state.$namespace}/${object}`);
                });
            } else {
                new Error(`Undefined object storage ${object} for ${context.state.$namespace}`);
            }
        },

        post (context, object) {
            let profile = null;
            for (let index in $store.state.apps.manifest) {
                if ($store.state.apps.manifest[index].name === context.state.$namespace) {
                    profile = $store.state.apps.manifest[index];
                    break;
                }
            }

            if (!profile || !('storage' in profile) || !('objects' in profile.storage) ||
                !(object in profile.storage.objects)) {
                throw `Could not found profile for storage /apps/${context.state.$namespace}/data/${object}`;
            }

            let formData = new FormData();
            formData.append(
                object,
                new Blob([Binary.makeBinaryObject(profile.storage.objects[object], context.state[object])]),
                `${object}.str`
            );

            let url =
                (process.env.NODE_ENV === 'development' ? (process.env.HW_DEVICE_URL ? process.env.HW_DEVICE_URL : '') : '') +
                `/apps/${context.state.$namespace}/data/${object}`;

            $axios._addPendingRequest(url);

            $axios.post(url, formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            ).then(() => {
                $axios._removePendingRequest(url);
            })
                .catch((e) => {
                    console.error(e);
                    $axios._removePendingRequest(url);
                    this.$bus.$emit(
                        $consts.EVENTS.ALERT, $consts.ALERT_TYPE.ERROR,
                        `Error of posting data for ${context.state.$namespace}/${object}`
                    );
                });
        }
    }
};

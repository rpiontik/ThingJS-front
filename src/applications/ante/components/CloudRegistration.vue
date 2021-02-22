<template>
    <v-container style="min-height: 100%; position: relative">
      <h1>{{'PREPARE_IMAGE_DEVICE' | lang}}</h1>
      <h3 class="subheading">{{status}}</h3>
      <v-progress-linear
          v-model="progress"
          :indeterminate="preparing"
      >
      </v-progress-linear>
      <form id="imageForm" method="post" :action="target" enctype="multipart/form-data">
        <input v-for="(file, index) in files" :key="index" type="hidden" :name="file.name" :value="file.payload">
      </form>
      <v-btn @click="doRegister">GO</v-btn>
    </v-container>
</template>

<script>
const CHUNK_SIZE = 500000;
export default {
    name: 'CloudRegistration',
    mounted () {
        setTimeout(() => {
            this.doRegister();
        }, 100);
    },
    computed: {
        target () {
            let url = new URL(process.env.CLOUD_URL);
            url.pathname = '/api/v1/device/pwa/deploy';
            return url;
        }
    },
    methods: {
        doRegister () {
            this.isError = false;
            this.files.push({
                name: '0:/token',
                payload: this.$router.currentRoute.query.token
            });
            this.files.push({
                name: '0:/profile',
                payload: JSON.stringify(this.$store.state.hardware.profile)
            });

            let manifest = JSON.parse(JSON.stringify(this.$store.state.apps.manifest));

            let marks = {};
            let uploadFiles = [
                { source: '/', dist: '/' }
            ];

            for (let index in manifest) {
                const app = manifest[index];
                if (!app.components) continue;
                for (let componentName in app.components) {
                    const component = app.components[componentName];
                    const source = `/${component.source}`;
                    component.source = `apps/${app.name}${source}`;
                    if (marks[component.source]) continue;
                    uploadFiles.push({
                        source,
                        dist: `/${component.source}`
                    });
                    marks[component.source] = true;
                }
            }

            this.files.push({
                name: '0:/manifest',
                payload: JSON.stringify(manifest)
            });

            let uploaded = 0;
            this.status = Vue.filter('lang')('LOAD_FILES');

            uploadFiles.map((object) => {
                this.$axios.get(object.source,
                    {
                        headers: {
                            'Content-Type': 'text/plain'
                        }
                    }
                ).then((response) => {
                    console.info('>>>>>', object.source, '=', response.data.length);
                    const partCount = Math.round(response.data.length / CHUNK_SIZE + 0.5);
                    for (let part = 0; part < partCount; part++) {
                        const chunk = response.data.slice(part * CHUNK_SIZE, part * CHUNK_SIZE + CHUNK_SIZE);
                        this.files.push({
                            name: `${part}:${object.dist}`,
                            payload: chunk
                        });
                    }
                    uploaded++;
                    this.progress = uploaded / uploadFiles.length * 100;
                })
                    .catch((e) => {
                        console.error(e);
                        this.isError = true;
                    });
            });

            this.preparing = false;

            let watcher = setInterval(() => {
                if (this.isError) {
                    clearInterval(watcher);
                } else if (uploadFiles.length === uploaded) {
                    clearInterval(watcher);
                    this.status = Vue.filter('lang')('DEPLOY_TO_CLOUD');
                    document.getElementById('imageForm').submit();
                }
            }, 100);
        }
    },
    data () {
        return {
            isError: false,
            status: '...',
            files: [],
            progress: 0,
            preparing: true
        };
    }
};
</script>

<style scoped>
</style>

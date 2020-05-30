.storage-editor-table-selected-row {

}
.storage-editor-table-selected-row {

}
<template>
    <div class="storage-editor">
        <v-toolbar dense flat>
            <v-btn icon>
                <v-icon title="Post data" @click="post" :disabled="!data">save</v-icon>
            </v-btn>

            <v-btn icon>
                <v-icon title="Add record" @click="appendRecord" :disabled="!data">add</v-icon>
            </v-btn>

            <v-btn icon>
                <v-icon title="Delete records" @click="deleteRecords" :disabled="!data || !selected.length">delete</v-icon>
            </v-btn>

            <v-btn icon>
                <v-icon title="Refresh data" @click="reload">refresh</v-icon>
            </v-btn>

        </v-toolbar>
        <div class="storage-editor-table-place" ref="storage_editor_table_place">
            <table v-if="header" class="storage-edit-table">
                <thead ref="table_header">
                    <tr v-for="(row, row_no) in header.mapHeader" :key="row_no">
                        <th
                                v-if="row_no == 0"
                                :rowspan="header.mapHeader && header.mapHeader.length > 1 ? header.mapHeader.length : null"
                                class="storage-editor-table-numbers"
                        >#</th>
                        <th
                                v-if="column"
                                v-for="(column, column_no) in row"
                                :title="column.type"
                                :key="column_no"
                                :colspan="column.colspan ? column.colspan + 1 : null"
                                :rowspan="column.rowspan ? column.rowspan + 1 : null"
                        >
                            {{column.title}}
                        </th>
                    </tr>
                </thead>
                <tbody>
                <tr v-for="(row, row_no) in pageData" :class="{'storage-editor-table-selected-row' : selected.indexOf(row) >= 0}">
                    <td
                            :style="{ height: recordHeight - 6 + 'px'}"
                            class="storage-editor-table-numbers"
                    >
                        {{currOffset + row_no + 1}}
                    </td>
                    <td
                            v-for="(cell, cell_no) in makeDataRow(row, row_no, header.mapData)"
                            @dblclick="editCell(cell)"
                            @mousedown.prevent.stop="selectCell(cell)"
                            :style="{ height: recordHeight - 6 + 'px'}"
                    >
                        <template v-if="cell.addr === edited">
                            <input
                                    v-model="cell.ref[cell.id]"
                                    class="storage-editor-cell-input"
                                    ref="cell_input"
                                    :type="cell.inputType"
                                    :step="cell.inputStep"
                                    @blur="closeCellInput(cell)"
                                    @keydown.enter.stop="closeCellInput(cell)"
                                    @keydown.tab.stop="nextCellInput(cell)"
                            >
                        </template>
                        <template v-else>
                            {{cell.ref[cell.id]}}
                        </template>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
        <div class="storage-editor-paginator">
            <table v-if="data">
                <tr>
                    <td width="99%">
                        <v-chip>
                            <div
                                    class="v-avatar teal storage-editor-chip-indicator"
                                    style="width: auto !important;"
                            >
                                {{recordCount}}
                            </div>
                            Records
                        </v-chip>
                        <v-chip>
                            <div
                                    class="v-avatar teal storage-editor-chip-indicator"
                                    style="width: auto !important;"
                            >
                                {{struct.version}}
                            </div>
                            Ver
                        </v-chip>
                        <v-chip v-if="struct.migration && struct.migration.length">
                            <div
                                    class="v-avatar teal storage-editor-chip-indicator"
                                    style="width: auto !important;"
                            >
                                {{struct.migration}}
                            </div>
                            Migration
                        </v-chip>
                        <v-chip>
                            <div
                                    class="v-avatar teal storage-editor-chip-indicator"
                                    style="width: auto !important;"
                            >
                                {{struct.header_size}}B
                            </div>
                            Header
                        </v-chip>
                        <v-chip>
                            <div
                                    class="v-avatar teal storage-editor-chip-indicator"
                                    style="width: auto !important;"
                            >
                                {{struct.row_size}}B
                            </div>
                            Record
                        </v-chip>
                        <v-chip>
                            <div
                                    class="v-avatar teal storage-editor-chip-indicator"
                                    style="width: auto !important;"
                            >
                                {{struct.sig_size + struct.header_size + struct.row_size * recordCount}}B
                            </div>
                            Total
                        </v-chip>
                    </td>
                    <td width="1%" style="min-width: 320px; text-align: center">
                        <v-pagination
                                v-if="pageCount > 1"
                                v-model="page"
                                :length="pageCount"
                                circle
                        ></v-pagination>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script>
    import consts from '../../consts'
    import utils from '../../utils'
    import Axios from 'axios';
    import Binary from '../../../storage-binary';

    export default {
        name: 'StorageEditor',
        props : ["uri"],
        created(){
        },
        mounted() {
            window.addEventListener('resize', this.onResize);
            window.addEventListener("mousewheel", this.onWheel);
            this.reload();
        },
        beforeDestroy () {
            window.removeEventListener('resize', this.onResize);
            window.removeEventListener('mousewheel', this.onWheel);
        },
        watch : {
            uri() {
                this.data = null;
                this.reload();
            }
        },
        methods : {
            deleteRecords() {
                this.selected.map((item) => {
                    let index = this.data.indexOf(item);
                    if(index >= 0)
                        this.data.splice(index, 1);
                });
                this.selected = [];
            },
            appendRecord() {
                let offset =  this.recordCount - this.pageSize + 1;
                if(offset < 0)
                    offset = 0;

                if(this.currOffset < offset)
                    this.currOffset = offset;

                let parser = (struct, record) => {
                    record = record || {};
                    for(let field in struct) {
                        if(typeof struct[field] === 'object') {
                            record[field] = {};
                            parser(struct[field], record[field]);
                        } else {
                            switch(struct[field]) {
                                case "int":
                                case "double":
                                    record[field] = 0;
                                    break;

                            };
                        }
                    }
                    return record;
                };

                this.data.push(parser(this.manifest.storage.objects[this.storage].struct));
                this.edited = `${this.recordCount - this.currOffset - 1}:${0}`;
                this.$nextTick(() => this.$refs.cell_input[0].focus());
            },
            onWheel(event) {
                let e = window.event || event;
                let delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

                if (e.path.indexOf(this.$el) >= 0) {
                    if((delta < 0) && (this.page < this.pageCount))
                        this.page += 1;
                    else if((delta > 0) && (this.page > 1))
                        this.page -= 1;
                }
                if(this.edited)
                    this.$nextTick(() => this.$refs.cell_input[0].blur());
            },
            onResize() {
                this.gridHeight = this.$refs.storage_editor_table_place.offsetHeight
                                    - this.$refs.table_header.offsetHeight - 6;
            },
            makeDataRow(row, row_no, map_data) {
                let result = [];
                map_data.map((cell, cell_no) => {
                    let item = {
                        addr : `${row_no}:${cell_no}`,
                        type : cell.type,
                        id : cell.id,
                        ref : eval(`row${cell.path}`),
                        row
                    };

                    switch(cell.type) {
                        case "int" :
                            item.inputType = "number";
                            item.inputStep = 1;
                            break;
                        case "double" :
                            item.inputType = "number";
                            item.inputStep = null;
                            break;
                    }
                    result.push(item);
                });
                return result;
            },
            nextCellInput(cell) {
                let pos = cell.addr.split(':');
                let row = 1 * pos[0];
                let col = 1 * pos[1];

                col++;
                if(col >= this.header.col_count) {
                    row++;
                    col = 0;
                }

                if (this.currOffset + row >= this.recordCount) {
                    setTimeout(() => this.appendRecord(), 10);
                    return;
                } else if(row >= this.pageSize) {
                    row = this.pageSize - 1;
                    if(this.recordCount > this.currOffset + this.pageSize)
                        this.currOffset++;
                }
                this.$refs.cell_input[0].blur();
                this.edited = `${row}:${col}`;
                setTimeout(() => this.$refs.cell_input[0].focus(), 10);
            },
            closeCellInput(cell) {
                switch(cell.type) {
                    case "int" :
                        cell.ref[cell.id] = Math.floor(1 * cell.ref[cell.id]);
                        break;
                    case "double" :
                        cell.ref[cell.id] = 1 * cell.ref[cell.id];
                        break;
                }
                this.edited = null;
            },
            selectCell(cell) {
                if(window.event && (window.event.ctrlKey || window.event.shiftKey) ) {
                    let index = this.selected.indexOf(cell.row);
                    if(index >=0 )
                        this.selected.splice(index, 1);
                    else
                        this.selected.push(cell.row);
                } else
                    this.selected = [cell.row];
                if(this.edited)
                    this.$refs.cell_input[0].blur();
            },
            editCell(cell) {
                this.edited = cell.addr;
                this.$nextTick(() => this.$refs.cell_input[0].focus());
            },
            reload() {
                this.selected = [];
                this.edited = null;
                Axios.get(this.url, { responseType : 'arraybuffer' }).then((response) => {
                    this.data = Binary.parseBinaryObject(response.data);
                    this.struct = Binary.parseStructObject(response.data);
                    this.currOffset = 0;
                    this.onResize();
                }).catch((e) => {
                    console.error(e);
                    this.$bus.$emit(consts.EVENTS.ALERT, consts.ALERT_TYPE.ERROR,
                            `Error of loading storage object for ${this.url}`);
                });
            },
            post() {
                let formData = new FormData();
                formData.append(
                        this.storage,
                        new Blob([Binary.makeBinaryObject(this.manifest.storage.objects[this.storage], this.data)]),
                        `${this.storage}.str`
                );
                Axios.post(this.url, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(() => {
                }).catch((e) => {
                    console.error(e);
                    this.$bus.$emit(consts.EVENTS.ALERT, consts.ALERT_TYPE.ERROR,
                            `Error of posting storage object for ${this.url}`);
                });
            }
        },
        computed: {
            recordHeight(){
                return 26;
            },
            pageData() {
                return this.data ? this.data.slice(this.currOffset, this.currOffset + this.pageSize) : [];
            },
            pageSize(){
                let result = Math.floor(this.gridHeight / this.recordHeight)
                        + (this.data.length * 0); //watch
                return result ? result : 1;
            },
            recordCount(){
                return this.data ? this.data.length : 0;
            },
            pageCount() {
                return this.recordCount == this.pageSize ? 1 : Math.floor((this.recordCount - 1) / this.pageSize + 1);
            },
            page: {
                get(){
                    if(this.currOffset >= this.recordCount)
                        this.currOffset = this.recordCount - this.pageSize;
                    if(this.currOffset < 0)
                        this.currOffset = 0;
                    return Math.floor(this.currOffset  / this.pageSize + 0.5) + 1;
                },
                set(page) {
                    this.currOffset = (page - 1) * this.pageSize;
                }

            },
            header() {
                let map = [];
                let column = 0;
                let parser = (struct, level, path) => {
                    for(let field in struct) {
                        if(!map[level])
                            map[level] = [];
                        let node = {
                            title : field,
                            id : field,
                            colspan : 0,
                            rowspan : 0,
                            path

                        };
                        map[level][column] = node;
                        if(typeof struct[field] === 'object') {
                            node.type = 'object';
                            parser(struct[field], level + 1, `${path}["${node.id}"]`);
                        } else {
                            node.type = struct[field];
                            column++;
                        }
                    }
                };

                parser(this.manifest.storage.objects[this.storage].struct, 0, '');

                let top_cells = [];
                for(let row = 0; row < map.length; row++){
                    let left_cell = null;
                    for(let col = 0; col <= column; col++) {
                        if(!map[row][col]){
                            if(left_cell && !top_cells[col + 1]) left_cell.colspan++;
                            if(top_cells[col])
                                top_cells[col].rowspan++;
                        } else {
                            left_cell = map[row][col];
                            top_cells[col] = left_cell;
                        }
                    }
                }
                return {
                    mapHeader : map,
                    mapData : top_cells,
                    col_count : top_cells.length
                };
            },
            manifest() {
                return this.$store.state.manifest[this.appname];
            },
            url() {
                return `${this.host}/apps/${this.appname}/data/${this.storage}`;
            },
            host(){
                return this.$store.state.url;
            },
            storage() {
                return this.uri ? utils.parseURI(this.uri).id : null;
            },
            appname() {
                return this.uri ? utils.parseURI(this.uri).app : null;
            },
        },
        data () {
            return {
                gridHeight : 0,
                currOffset : 0,
                data : null,
                struct : null,
                edited : null,
                selected : []
            }
        }
    }
</script>

<style>
    .storage-editor-paginator * {
        outline: none;
    }

    .storage-editor {
        background: #fff;
        overflow: hidden;
    }

    .storage-editor-table-place {
        position: absolute;
        top: 48px;
        left: 0px;
        right: 0px;
        bottom: 48px;
        overflow-y: hidden;
    }

    .storage-editor-paginator {
        position: absolute;
        bottom: 0;
        right: 0;
        left: 0;
        background: #eee;
        padding: 4px;
    }


    .storage-edit-table {
        min-width: 100%;
        border-collapse: collapse;
    }

    .storage-edit-table th,
    .storage-edit-table td {
        vertical-align: middle;
        border: solid #ccc 1px;
        min-width: 80px;
        padding: 2px;
    }

    .storage-edit-table thead tr {
        background: #eee;
    }

    .storage-edit-table tbody tr:nth-child(2n) {
        background: #f7f7f7;
    }


    .storage-edit-table td {
        text-align: right;
        position: relative;
    }

    .storage-editor-cell-input {
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        right: 0;
    }

    .storage-editor-chip-indicator {
        width: auto !important;
        border-radius: 16px;
        color: #fff;
        padding-left: 8px;
        padding-right: 8px;
    }

    .storage-editor-table-numbers {
        min-width: 40px !important;
        width: 40px;
        background: #eee  !important;
        color: #000 !important;
    }

    .storage-editor-table-selected-row {
        background: #2d7091 !important;
        color: #fff !important;
    }

</style>

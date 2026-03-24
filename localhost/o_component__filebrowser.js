// Copyright (C) [2026] [Jonas Immanuel Frey] - Licensed under GPLv2. See LICENSE file for details.

import { f_o_html_from_o_js } from "./lib/handyhelpers.js";
import { f_send_wsmsg_with_response, o_wsmsg__syncdata, o_state } from './index.js';
import { f_s_path_parent } from './functions.js';
import {
    f_o_wsmsg,
    o_wsmsg__f_a_o_fsnode,
} from './constructors.js';

let o_component__filebrowser = {
    name: 'component-filebrowser',
    template: (await f_o_html_from_o_js({
        s_tag: 'div',
        class: 'o_filebrowser',
        a_o: [
            {
                s_tag: 'div',
                class: 'o_filebrowser__path_bar',
                a_o: [
                    {
                        s_tag: 'div',
                        ':class': "'interactable' + (s_path_absolute === s_ds ? ' disabled' : '')",
                        'v-on:click': 'f_navigate_up',
                        innerText: '..',
                    },
                    {
                        s_tag: 'div',
                        class: 'o_filebrowser__path',
                        innerText: '{{ s_path_absolute }}',
                    },
                ],
            },
            {
                s_tag: 'div',
                class: 'o_filebrowser__list',
                a_o: [
                    {
                        s_tag: 'div',
                        'v-for': 'o_fsnode of a_o_fsnode',
                        ':class': "'o_fsnode interactable' + (o_fsnode.b_folder ? '' : (f_b_video(o_fsnode) ? ' o_fsnode--video' : ' file'))",
                        'v-on:click': 'f_click_fsnode(o_fsnode)',
                        a_o: [
                            {
                                s_tag: 'div',
                                class: 'o_fsnode__type',
                                innerText: "{{ o_fsnode.b_folder ? 'dir' : (f_b_video(o_fsnode) ? 'vid' : 'file') }}",
                            },
                            {
                                s_tag: 'div',
                                class: 'o_fsnode__name',
                                innerText: '{{ o_fsnode.s_name }}',
                            },
                        ],
                    },
                ],
            },
        ],
    })).outerHTML,
    data: function() {
        return {
            s_path_absolute: '/',
            s_ds: '/',
            a_o_fsnode: [],
        };
    },
    methods: {
        f_load_a_o_fsnode: async function() {
            let o_resp = await f_send_wsmsg_with_response(
                f_o_wsmsg(o_wsmsg__f_a_o_fsnode.s_name, [
                    this.s_path_absolute,
                    false, 
                    false
                ])
            );
            this.a_o_fsnode = o_resp.v_result || [];
        },
        f_save_path: async function(s_path_absolute) {
            await o_wsmsg__syncdata.f_v_sync({
                s_name_table: 'a_o_keyvalpair',
                s_operation: 'update',
                o_data: { n_id: o_state.o_keyvalpair__s_path_absolute__filebrowser.n_id, s_value: s_path_absolute }
            });
        },
        f_b_video: function(o_fsnode) {
            let s_name = (o_fsnode.s_name || '').toLowerCase();
            let a_s_ext = ['.mp4', '.webm', '.mkv', '.avi', '.mov'];
            return a_s_ext.some(function(s_ext){ return s_name.endsWith(s_ext); });
        },
        f_click_fsnode: async function(o_fsnode) {
            if(o_fsnode.b_folder){
                this.s_path_absolute = o_fsnode.s_path_absolute;
                await this.f_save_path(this.s_path_absolute);
                await this.f_load_a_o_fsnode();
            } else if(this.f_b_video(o_fsnode)){
                // open video in videocutter in new tab
                let s_url = window.location.origin + '/#/videocutter?s_path=' + encodeURIComponent(o_fsnode.s_path_absolute);
                window.open(s_url, '_blank');
            }
        },
        f_navigate_up: async function() {
            let s_path_parent = f_s_path_parent(this.s_path_absolute, this.s_ds);
            if (s_path_parent === this.s_path_absolute) return;
            this.s_path_absolute = s_path_parent;
            await this.f_save_path(this.s_path_absolute);
            await this.f_load_a_o_fsnode();
        },
    },
    created: function() {
        let o_self = this;
        let n_id__init = setInterval(async function() {
            let o_kv_path = o_state.o_keyvalpair__s_path_absolute__filebrowser;
            let o_kv_ds = o_state.o_keyvalpair__s_ds;
            if (o_kv_path && o_kv_path.s_value && o_kv_ds && o_kv_ds.s_value) {
                clearInterval(n_id__init);
                o_self.s_ds = o_kv_ds.s_value;
                o_self.s_path_absolute = o_kv_path.s_value;
                await o_self.f_load_a_o_fsnode();
            }
        }, 50);
    },
};

export { o_component__filebrowser };

// Copyright (C) [2026] [Jonas Immanuel Frey] - Licensed under GPLv2. See LICENSE file for details.

import { f_o_html_from_o_js } from "./lib/handyhelpers.js";
import { f_send_wsmsg_with_response, o_state } from './index.js';
import {
    f_o_wsmsg,
    o_wsmsg__export_gif,
    f_o_logmsg,
    s_o_logmsg_s_type__info,
    s_o_logmsg_s_type__error,
    s_o_logmsg_s_type__log,
} from './constructors.js';

let f_s_time__from_n_ms = function(n_ms){
    let n_min = Math.floor(n_ms / 60000);
    let n_sec = Math.floor((n_ms % 60000) / 1000);
    let n_ms_remainder = Math.floor(n_ms % 1000);
    return String(n_min).padStart(2, '0') + ':' +
           String(n_sec).padStart(2, '0') + '.' +
           String(n_ms_remainder).padStart(3, '0');
};

let o_component__videocutter = {
    name: 'component-videocutter',
    template: (await f_o_html_from_o_js({
        s_tag: 'div',
        class: 'o_videocutter',
        a_o: [
            // file picker overlay
            {
                s_tag: 'div',
                class: 'o_videocutter__filepicker',
                'v-if': '!s_path_video',
                a_o: [
                    {
                        s_tag: 'div',
                        class: 'o_videocutter__filepicker__title',
                        innerText: 'Select a video file',
                    },
                    {
                        s_tag: 'div',
                        class: 'o_videocutter__filepicker__input_wrap',
                        a_o: [
                            {
                                s_tag: 'input',
                                type: 'file',
                                accept: 'video/*',
                                ref: 'el_input_file',
                                'v-on:change': 'f_on_file_selected($event)',
                            },
                            {
                                s_tag: 'div',
                                'v-if': 'b_uploading',
                                class: 'o_videocutter__filepicker__status',
                                innerText: 'Uploading to server for export...',
                            },
                        ],
                    },
                ],
            },
            // main video cutter UI
            {
                s_tag: 'div',
                class: 'o_videocutter__main',
                'v-if': 's_path_video',
                a_o: [
                    // toolbar
                    {
                        s_tag: 'div',
                        class: 'o_videocutter__toolbar',
                        a_o: [
                            {
                                s_tag: 'div',
                                class: 'interactable o_videocutter__btn',
                                'v-on:click': 'f_clear_video',
                                innerText: 'Change Video',
                            },
                            {
                                s_tag: 'div',
                                class: 'o_videocutter__filename',
                                innerText: '{{ s_path_video.split("/").pop() }}',
                            },
                            {
                                s_tag: 'div',
                                class: 'o_videocutter__time',
                                innerText: '{{ f_s_time(n_ms_current) }} / {{ f_s_time(n_ms_duration) }}',
                            },
                            {
                                s_tag: 'div',
                                class: 'interactable o_videocutter__btn o_videocutter__btn--export',
                                ':class': "{ disabled: a_o_section.length === 0 || b_exporting }",
                                'v-on:click': 'f_export_gif',
                                innerText: "{{ b_exporting ? 'Exporting...' : 'Export GIF' }}",
                            },
                            {
                                s_tag: 'div',
                                'v-if': 'b_transcoding',
                                class: 'o_videocutter__status',
                                innerText: 'Transcoding to H.264 for browser playback...',
                            },
                        ],
                    },
                    // video player
                    {
                        s_tag: 'div',
                        class: 'o_videocutter__player',
                        a_o: [
                            {
                                s_tag: 'video',
                                ref: 'el_video',
                                'v-on:loadedmetadata': 'f_on_loaded',
                                'v-on:timeupdate': 'f_on_timeupdate',
                                'v-on:ended': 'f_on_ended',
                                'v-on:error': 'f_on_video_error',
                                ':src': 's_url_video',
                            },
                        ],
                    },
                    // controls
                    {
                        s_tag: 'div',
                        class: 'o_videocutter__control',
                        a_o: [
                            {
                                s_tag: 'div',
                                class: 'interactable o_videocutter__btn',
                                'v-on:click': 'f_toggle_play',
                                innerText: "{{ b_playing ? 'Pause' : 'Play' }}",
                            },
                            {
                                s_tag: 'div',
                                class: 'o_videocutter__hint',
                                innerText: "Press 'S' to mark cut start/end",
                            },
                        ],
                    },
                    // timeline
                    {
                        s_tag: 'div',
                        class: 'o_videocutter__timeline',
                        ref: 'el_timeline',
                        'v-on:click': 'f_click_timeline($event)',
                        a_o: [
                            // section markers
                            {
                                s_tag: 'div',
                                'v-for': '(o_section, n_idx) in a_o_section',
                                class: 'o_videocutter__section',
                                ':style': 'f_s_style_section(o_section)',
                                a_o: [
                                    {
                                        s_tag: 'div',
                                        class: 'o_videocutter__section__label',
                                        innerText: '{{ n_idx + 1 }}',
                                    },
                                ],
                            },
                            // pending section (start set, no end yet)
                            {
                                s_tag: 'div',
                                'v-if': 'o_section__pending !== null',
                                class: 'o_videocutter__section o_videocutter__section--pending',
                                ':style': 'f_s_style_pending()',
                            },
                            // playhead
                            {
                                s_tag: 'div',
                                class: 'o_videocutter__playhead',
                                ':style': "'left: ' + (n_ms_duration > 0 ? (n_ms_current / n_ms_duration * 100) : 0) + '%'",
                            },
                        ],
                    },
                    // sections list
                    {
                        s_tag: 'div',
                        class: 'o_videocutter__section_list',
                        a_o: [
                            {
                                s_tag: 'div',
                                class: 'o_videocutter__section_list__title',
                                innerText: 'Sections ({{ a_o_section.length }})',
                            },
                            {
                                s_tag: 'div',
                                'v-for': '(o_section, n_idx) in a_o_section',
                                class: 'o_videocutter__section_item',
                                ':class': "{ active: n_idx__section_selected === n_idx }",
                                'v-on:click': 'f_select_section(n_idx)',
                                a_o: [
                                    {
                                        s_tag: 'div',
                                        class: 'o_videocutter__section_item__num',
                                        innerText: '{{ n_idx + 1 }}',
                                    },
                                    {
                                        s_tag: 'div',
                                        class: 'o_videocutter__section_item__time',
                                        innerText: '{{ f_s_time(o_section.n_ms_start) }} - {{ f_s_time(o_section.n_ms_start + o_section.n_ms_duration) }}',
                                    },
                                    {
                                        s_tag: 'div',
                                        class: 'o_videocutter__section_item__dur',
                                        innerText: '{{ f_s_time(o_section.n_ms_duration) }}',
                                    },
                                    {
                                        s_tag: 'div',
                                        class: 'interactable o_videocutter__btn o_videocutter__btn--delete',
                                        'v-on:click.stop': 'f_delete_section(n_idx)',
                                        innerText: 'X',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    })).outerHTML,
    data: function() {
        return {
            s_path_video: null,
            s_url_video: null,
            b_uploading: false,
            b_transcoding: false,
            n_ms_current: 0,
            n_ms_duration: 0,
            b_playing: false,
            b_exporting: false,
            a_o_section: [],
            o_section__pending: null, // {n_ms_start} - waiting for end
            n_idx__section_selected: -1,
        };
    },
    methods: {
        f_s_time: f_s_time__from_n_ms,
        // file picker
        f_on_file_selected: async function(o_evt) {
            let o_file = o_evt.target.files[0];
            if(!o_file) return;
            // object URL for immediate playback
            this.s_url_video = URL.createObjectURL(o_file);
            this.a_o_section = [];
            this.o_section__pending = null;
            // upload to server so ffmpeg can access it for export
            this.b_uploading = true;
            try {
                let o_formdata = new FormData();
                o_formdata.append('file', o_file);
                let o_resp = await fetch('/api/upload', { method: 'POST', body: o_formdata });
                let o_json = await o_resp.json();
                if(o_json.s_error) throw new Error(o_json.s_error);
                this.s_path_video = o_json.s_path;
            } catch(o_err) {
                o_state.a_o_logmsg.push(
                    f_o_logmsg('Upload failed: ' + o_err.message, false, true, s_o_logmsg_s_type__error, Date.now(), 10000)
                );
                this.s_url_video = null;
            }
            this.b_uploading = false;
        },
        f_clear_video: function() {
            if(this.s_url_video) URL.revokeObjectURL(this.s_url_video);
            this.s_path_video = null;
            this.s_url_video = null;
            this.a_o_section = [];
            this.o_section__pending = null;
            this.n_ms_current = 0;
            this.n_ms_duration = 0;
            this.b_playing = false;
        },
        // video controls
        f_on_loaded: function() {
            let el_video = this.$refs.el_video;
            this.n_ms_duration = el_video.duration * 1000;
        },
        f_on_timeupdate: function() {
            let el_video = this.$refs.el_video;
            this.n_ms_current = el_video.currentTime * 1000;
        },
        f_on_ended: function() {
            this.b_playing = false;
        },
        f_on_video_error: async function() {
            if(this.b_transcoding || !this.s_path_video) return;
            this.b_transcoding = true;
            o_state.a_o_logmsg.push(
                f_o_logmsg('Video codec not supported by browser — transcoding with ffmpeg...', false, true, s_o_logmsg_s_type__info, Date.now(), 30000)
            );
            try {
                let o_resp = await fetch('/api/transcode', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ s_path: this.s_path_video }),
                });
                let o_json = await o_resp.json();
                if(o_json.s_error) throw new Error(o_json.s_error);
                if(this.s_url_video) URL.revokeObjectURL(this.s_url_video);
                this.s_url_video = '/api/file?path=' + encodeURIComponent(o_json.s_path);
                o_state.a_o_logmsg.push(
                    f_o_logmsg('Transcoding complete — video ready.', false, true, s_o_logmsg_s_type__info, Date.now(), 5000)
                );
            } catch(o_err) {
                o_state.a_o_logmsg.push(
                    f_o_logmsg('Transcode failed: ' + o_err.message, false, true, s_o_logmsg_s_type__error, Date.now(), 10000)
                );
            }
            this.b_transcoding = false;
        },
        f_toggle_play: async function() {
            let el_video = this.$refs.el_video;
            if(!el_video) return;
            if(this.b_transcoding) return;
            if(el_video.paused){
                try {
                    await el_video.play();
                    this.b_playing = true;
                } catch(o_err) {
                    // transcode is handled by f_on_video_error
                }
            } else {
                el_video.pause();
                this.b_playing = false;
            }
        },
        // timeline
        f_click_timeline: function(o_evt) {
            let el_timeline = this.$refs.el_timeline;
            let el_video = this.$refs.el_video;
            if(!el_timeline || !el_video) return;
            let o_rect = el_timeline.getBoundingClientRect();
            let n_ratio = (o_evt.clientX - o_rect.left) / o_rect.width;
            n_ratio = Math.max(0, Math.min(1, n_ratio));
            el_video.currentTime = n_ratio * el_video.duration;
            this.n_ms_current = el_video.currentTime * 1000;
        },
        f_s_style_section: function(o_section) {
            if(this.n_ms_duration <= 0) return '';
            let n_left = (o_section.n_ms_start / this.n_ms_duration) * 100;
            let n_width = (o_section.n_ms_duration / this.n_ms_duration) * 100;
            return 'left: ' + n_left + '%; width: ' + n_width + '%;';
        },
        f_s_style_pending: function() {
            if(!this.o_section__pending || this.n_ms_duration <= 0) return '';
            let n_left = (this.o_section__pending.n_ms_start / this.n_ms_duration) * 100;
            let n_width = ((this.n_ms_current - this.o_section__pending.n_ms_start) / this.n_ms_duration) * 100;
            if(n_width < 0) n_width = 0;
            return 'left: ' + n_left + '%; width: ' + n_width + '%;';
        },
        // section management via 'S' key
        f_mark_section: function() {
            if(!this.s_path_video) return;
            if(this.o_section__pending === null){
                // start new section
                this.o_section__pending = {
                    n_ms_start: this.n_ms_current,
                };
            } else {
                // end section
                let n_ms_end = this.n_ms_current;
                let n_ms_start = this.o_section__pending.n_ms_start;
                if(n_ms_end <= n_ms_start){
                    // ignore zero or negative duration
                    this.o_section__pending = null;
                    return;
                }
                this.a_o_section.push({
                    n_ms_start: n_ms_start,
                    n_ms_duration: n_ms_end - n_ms_start,
                    n_scl_x: 0,
                    n_scl_y: 0,
                    n_trn_x: 0,
                    n_trn_y: 0,
                    n_idx__order: this.a_o_section.length,
                });
                this.o_section__pending = null;
            }
        },
        f_select_section: function(n_idx) {
            this.n_idx__section_selected = n_idx;
            let o_section = this.a_o_section[n_idx];
            let el_video = this.$refs.el_video;
            if(el_video && o_section){
                el_video.currentTime = o_section.n_ms_start / 1000;
            }
        },
        f_delete_section: function(n_idx) {
            this.a_o_section.splice(n_idx, 1);
            // reindex
            for(let n_i = 0; n_i < this.a_o_section.length; n_i++){
                this.a_o_section[n_i].n_idx__order = n_i;
            }
            if(this.n_idx__section_selected >= this.a_o_section.length){
                this.n_idx__section_selected = this.a_o_section.length - 1;
            }
        },
        // export
        f_export_gif: async function() {
            if(this.a_o_section.length === 0 || this.b_exporting) return;
            this.b_exporting = true;
            o_state.a_o_logmsg.push(
                f_o_logmsg('Starting GIF export...', false, true, s_o_logmsg_s_type__info, Date.now(), 10000)
            );
            try {
                let o_resp = await f_send_wsmsg_with_response(
                    f_o_wsmsg(o_wsmsg__export_gif.s_name, {
                        s_path_video: this.s_path_video,
                        a_o_section: this.a_o_section,
                    })
                );
                if(o_resp.s_error){
                    throw new Error(o_resp.s_error);
                }
                let v_result = o_resp.v_result;
                o_state.a_o_logmsg.push(
                    f_o_logmsg(
                        'GIF exported: ' + v_result.s_path_output + ' (' + Math.round(v_result.n_bytes / 1024) + ' KB)',
                        false, true, s_o_logmsg_s_type__info, Date.now(), 15000
                    )
                );
            } catch(o_err) {
                o_state.a_o_logmsg.push(
                    f_o_logmsg('Export failed: ' + o_err.message, false, true, s_o_logmsg_s_type__error, Date.now(), 10000)
                );
            }
            this.b_exporting = false;
        },
        f_on_keydown: function(o_evt) {
            if(o_evt.key === 's' || o_evt.key === 'S'){
                // don't trigger if typing in an input
                if(o_evt.target.tagName === 'INPUT' || o_evt.target.tagName === 'TEXTAREA') return;
                o_evt.preventDefault();
                this.f_mark_section();
            }
            if(o_evt.key === ' '){
                if(o_evt.target.tagName === 'INPUT' || o_evt.target.tagName === 'TEXTAREA') return;
                o_evt.preventDefault();
                this.f_toggle_play();
            }
        },
    },
    created: function() {
        let o_self = this;
        this._f_on_keydown = function(o_evt){ o_self.f_on_keydown(o_evt); };
        document.addEventListener('keydown', this._f_on_keydown);
    },
    unmounted: function() {
        if(this._f_on_keydown){
            document.removeEventListener('keydown', this._f_on_keydown);
        }
    },
};

export { o_component__videocutter };

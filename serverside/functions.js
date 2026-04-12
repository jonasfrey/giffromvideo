// Copyright (C) [2026] [Jonas Immanuel Frey] - Licensed under GPLv2. See LICENSE file for details.

// backend utility functions
// add shared server-side helper functions here and import them where needed

import { s_ds } from './runtimedata.js';
import { s_db_create, s_db_read, s_db_update, s_db_delete } from '../localhost/runtimedata.js';
import { a_o_wsmsg, f_o_model_instance, f_s_name_table__from_o_model, o_model__o_fsnode, o_model__o_utterance, o_wsmsg__deno_copy_file, o_wsmsg__deno_mkdir, o_wsmsg__deno_stat, o_wsmsg__f_a_o_fsnode, o_wsmsg__f_delete_table_data, o_wsmsg__f_v_crud__indb, o_wsmsg__logmsg, o_wsmsg__set_state_data, o_wsmsg__syncdata, o_wsmsg__export_gif } from '../localhost/constructors.js';
import { f_v_crud__indb, f_db_delete_table_data } from './database_functions.js';
import { f_o_uttdatainfo } from './cli_functions.js';

let f_a_o_fsnode = async function(
    s_path,
    b_recursive = false,
    b_store_in_db = false
) {
    let a_o = [];

    if (!s_path) {
        console.error('Invalid path:', s_path);
        return a_o;
    }
    if (!s_path.startsWith(s_ds)) {
        console.error('Path is not absolute:', s_path);
        return a_o;
    }

    try {
        for await (let o_dir_entry of Deno.readDir(s_path)) {
            let s_path_absolute = `${s_path}${s_ds}${o_dir_entry.name}`;

            let o_fsnode = f_o_model_instance(
                o_model__o_fsnode,
                {
                    s_path_absolute,
                    s_name: s_path_absolute.split(s_ds).at(-1),
                    b_folder: o_dir_entry.isDirectory,
                }
            );
            if(b_store_in_db){
                let s_name_table__fsnode = f_s_name_table__from_o_model(o_model__o_fsnode);
                let o_fsnode__fromdb = (o_wsmsg__syncdata.f_v_sync({s_name_table: s_name_table__fsnode, s_operation: 'read', o_data: { s_path_absolute }}) || []).at(0);
                if (o_fsnode__fromdb) {
                    o_fsnode.n_id = o_fsnode__fromdb.n_id;
                } else {
                    let o_fsnode__created = o_wsmsg__syncdata.f_v_sync({s_name_table: s_name_table__fsnode, s_operation: 'create', o_data: { s_path_absolute, b_folder: o_dir_entry.isDirectory }});
                    o_fsnode.n_id = o_fsnode__created.n_id;
                }
                if (o_dir_entry.isDirectory && b_recursive) {
                    o_fsnode.a_o_fsnode = await f_a_o_fsnode(s_path_absolute, b_recursive);
                }
            }

            a_o.push(o_fsnode);
        }
    } catch (o_error) {
        console.error(`Error reading directory: ${s_path}`, o_error.message);
        console.error(o_error.stack);
    }

    a_o.sort(function(o_a, o_b) {
        if (o_a.b_folder === o_b.b_folder) return (o_a.s_name || '').localeCompare(o_b.s_name || '');
        return o_a.b_folder ? -1 : 1;
    });

    return a_o;
};



// WARNING: the following deno_copy_file, deno_stat, deno_mkdir handlers expose raw Deno APIs
// to any connected WebSocket client with arbitrary arguments. Fine for local dev use,
// but must be restricted or removed before any network-exposed deployment.
o_wsmsg__deno_copy_file.f_v_server_implementation = function(o_wsmsg){
    let a_v_arg = Array.isArray(o_wsmsg.v_data) ? o_wsmsg.v_data : [];
    return Deno.copyFile(...a_v_arg);
}
o_wsmsg__deno_stat.f_v_server_implementation = function(o_wsmsg){
    let a_v_arg = Array.isArray(o_wsmsg.v_data) ? o_wsmsg.v_data : [];
    return Deno.stat(...a_v_arg);
}
o_wsmsg__deno_mkdir.f_v_server_implementation = function(o_wsmsg){
    let a_v_arg = Array.isArray(o_wsmsg.v_data) ? o_wsmsg.v_data : [];
    return Deno.mkdir(...a_v_arg);
}
o_wsmsg__f_v_crud__indb.f_v_server_implementation = function(o_wsmsg){
    let a_v_arg = Array.isArray(o_wsmsg.v_data) ? o_wsmsg.v_data : [];
    return f_v_crud__indb(...a_v_arg);
}
o_wsmsg__f_delete_table_data.f_v_server_implementation = function(o_wsmsg){
    let a_v_arg = Array.isArray(o_wsmsg.v_data) ? o_wsmsg.v_data : [];
    return f_db_delete_table_data(...a_v_arg);
}
o_wsmsg__f_a_o_fsnode.f_v_server_implementation = function(o_wsmsg){
    let a_v_arg = Array.isArray(o_wsmsg.v_data) ? o_wsmsg.v_data : [];
    return f_a_o_fsnode(...a_v_arg);
}
o_wsmsg__logmsg.f_v_server_implementation = function(o_wsmsg){
    let o_logmsg = o_wsmsg.v_data;
    if(o_logmsg.b_consolelog){
        console[o_logmsg.s_type](o_logmsg.s_message);
    }
    return null;
}
o_wsmsg__set_state_data.f_v_server_implementation = function(o_wsmsg, o_wsmsg__existing, o_state){
    o_state[o_wsmsg.v_data.s_property] = o_wsmsg.v_data.value;
    return null;
}
let f_o_uttdatainfo__read_or_create = async function(s_text){
    let s_name_table__utterance = f_s_name_table__from_o_model(o_model__o_utterance);
    let s_name_table__fsnode = f_s_name_table__from_o_model(o_model__o_fsnode);
    let a_o_existing = o_wsmsg__syncdata.f_v_sync({s_name_table: s_name_table__utterance, s_operation: 'read', o_data: { s_text }}) || [];
    if(a_o_existing.length > 0){
        let o_utterance = a_o_existing[0];
        let o_fsnode = o_utterance.n_o_fsnode_n_id
            ? (o_wsmsg__syncdata.f_v_sync({s_name_table: s_name_table__fsnode, s_operation: 'read', o_data: { n_id: o_utterance.n_o_fsnode_n_id }}) || []).at(0)
            : null;
        return { o_utterance, o_fsnode };
    }
    // not found in db, generate new utterance audio
    return await f_o_uttdatainfo(s_text);
};

let f_v_result_from_o_wsmsg = async function(
    o_wsmsg,
    o_state,
    o_socket__sender
){
    let o_wsmsg__existing = a_o_wsmsg.find(o=>o.s_name === o_wsmsg.s_name);
    if(!o_wsmsg__existing){
        console.error('No such wsmsg:', o_wsmsg.s_name);
        return null;
    }
    if(!o_wsmsg__existing.f_v_server_implementation) {
        console.error('No server implementation for wsmsg:', o_wsmsg.s_name);
        return null;
    }
    return o_wsmsg__existing.f_v_server_implementation(
        o_wsmsg,
        o_wsmsg__existing,
        o_state,
        o_socket__sender
    );

}

// ffmpeg export: concatenate video sections into a single GIF
o_wsmsg__export_gif.f_v_server_implementation = async function(o_wsmsg){
    let v_data = o_wsmsg.v_data;
    let s_path_video = v_data.s_path_video;
    let a_o_section = v_data.a_o_section; // [{n_ms_start, n_ms_duration, n_scl_x, n_scl_y, n_trn_x, n_trn_y}]
    let s_path_dir__export = v_data.s_path_dir__export || null;
    let s_name__composition = v_data.s_name__composition || null;

    // export settings with defaults
    let n_fps = v_data.n_fps || 15;
    let n_scl_x__target = v_data.n_scl_x__target || 0; // 0 = original
    let n_cnt__color = v_data.n_cnt__color || 256;
    let s_dither = v_data.s_dither || 'bayer';
    let n_cnt__loop = (v_data.n_cnt__loop !== undefined) ? v_data.n_cnt__loop : 0;
    let n_ratio__speed = v_data.n_ratio__speed || 1.0;
    let n_bytes__max = v_data.n_bytes__max || (20 * 1024 * 1024);

    // color adjustment settings
    let n_ratio__gamma = v_data.n_ratio__gamma || 1.0;
    let n_ratio__contrast = v_data.n_ratio__contrast || 1.0;
    let n_val__shadow = (v_data.n_val__shadow !== undefined) ? v_data.n_val__shadow : 0.0;
    let n_ratio__saturation = v_data.n_ratio__saturation || 1.0;

    // build eq filter string if any color adjustments are non-default
    let b_color_adjust = (n_ratio__gamma !== 1.0 || n_ratio__contrast !== 1.0 || n_val__shadow !== 0.0 || n_ratio__saturation !== 1.0);
    let s_eq = '';
    if(b_color_adjust){
        s_eq = `,eq=gamma=${n_ratio__gamma}:contrast=${n_ratio__contrast}:brightness=${n_val__shadow}:saturation=${n_ratio__saturation}`;
    }

    let s_format = v_data.s_format || 'gif';

    if(!s_path_video || !a_o_section || a_o_section.length === 0){
        throw new Error('s_path_video and a_o_section are required');
    }

    // determine output path: use export dir if provided, otherwise beside the video
    let s_ext = (s_format === 'mp4') ? '.mp4' : '.gif';
    let s_path_output = v_data.s_path_output;
    if(!s_path_output){
        let s_filename = s_path_video.split(s_ds).pop().replace(/\.[^.]+$/, '');
        if(s_name__composition){
            s_filename = s_name__composition.replace(/[^a-zA-Z0-9_\-]/g, '_');
        }
        if(s_path_dir__export){
            // ensure export directory exists
            try { await Deno.mkdir(s_path_dir__export, { recursive: true }); } catch {}
            s_path_output = s_path_dir__export + s_ds + s_filename + s_ext;
        } else {
            s_path_output = s_path_video.replace(/\.[^.]+$/, s_ext);
        }
    }

    // build ffmpeg filter_complex: trim each section, crop, pad centered on max canvas, concat
    let a_s_filter_input = [];
    let a_s_filter_scaled = [];
    // output resolution = max width and max height across all sections
    let n_scl_x__output = 0;
    let n_scl_y__output = 0;
    for(let n_idx = 0; n_idx < a_o_section.length; n_idx++){
        let n_scl_x = a_o_section[n_idx].n_scl_x || 480;
        let n_scl_y = a_o_section[n_idx].n_scl_y || 320;
        if(n_scl_x > n_scl_x__output) n_scl_x__output = n_scl_x;
        if(n_scl_y > n_scl_y__output) n_scl_y__output = n_scl_y;
    }
    // ensure even dimensions for codec compatibility
    n_scl_x__output = Math.ceil(n_scl_x__output / 2) * 2;
    n_scl_y__output = Math.ceil(n_scl_y__output / 2) * 2;

    for(let n_idx = 0; n_idx < a_o_section.length; n_idx++){
        let o_section = a_o_section[n_idx];
        let n_sec_start = o_section.n_ms_start / 1000;
        let n_sec_duration = o_section.n_ms_duration / 1000;
        let n_scl_x = o_section.n_scl_x || n_scl_x__output;
        let n_scl_y = o_section.n_scl_y || n_scl_y__output;
        let n_trn_x = o_section.n_trn_x || 0;
        let n_trn_y = o_section.n_trn_y || 0;

        // trim segment, normalize SAR to square pixels (browser videoWidth accounts for SAR), then crop
        let s_filter = `[0:v]trim=start=${n_sec_start}:duration=${n_sec_duration},setpts=PTS-STARTPTS`;
        s_filter += `,scale=iw*sar:ih,setsar=1`;
        s_filter += `,crop=${n_scl_x}:${n_scl_y}:${n_trn_x}:${n_trn_y}`;
        // color adjustments (gamma, contrast, shadows, saturation)
        s_filter += s_eq;
        // speed adjustment: setpts=PTS/speed
        if(n_ratio__speed !== 1.0){
            s_filter += `,setpts=PTS/${n_ratio__speed}`;
        }
        // pad to output canvas centered with black background
        if(n_scl_x !== n_scl_x__output || n_scl_y !== n_scl_y__output){
            let n_pad_x = Math.floor((n_scl_x__output - n_scl_x) / 2);
            let n_pad_y = Math.floor((n_scl_y__output - n_scl_y) / 2);
            s_filter += `,pad=${n_scl_x__output}:${n_scl_y__output}:${n_pad_x}:${n_pad_y}:black`;
        }
        s_filter += `[v${n_idx}]`;
        a_s_filter_input.push(s_filter);
        a_s_filter_scaled.push(`[v${n_idx}]`);
    }

    // scale filter (after concat)
    let s_scale = '';
    if(n_scl_x__target > 0){
        s_scale = `,scale=${n_scl_x__target}:-1:flags=lanczos`;
    }

    // build fallback fps chain from requested fps down to 4
    let a_n_fps = [n_fps];
    for(let n of [12, 10, 8, 6, 4]){
        if(n < n_fps && a_n_fps.indexOf(n) === -1) a_n_fps.push(n);
    }

    let n_bytes__result = 0;
    let n_fps__used = a_n_fps[0];

    for(let n_attempt = 0; n_attempt < a_n_fps.length; n_attempt++){
        let n_fps__cur = a_n_fps[n_attempt];
        n_fps__used = n_fps__cur;

        let a_s_arg;
        if(s_format === 'mp4'){
            // MP4 export: H.264 + yuv420p, no audio, faststart for streaming
            let s_concat = a_s_filter_scaled.join('')
                + `concat=n=${a_o_section.length}:v=1:a=0`
                + `,fps=${n_fps__cur}`
                + s_scale;
            let s_filter_complex = a_s_filter_input.join(';') + ';' + s_concat;
            a_s_arg = [
                '-y',
                '-i', s_path_video,
                '-filter_complex', s_filter_complex,
                '-c:v', 'libx264',
                '-preset', 'medium',
                '-crf', '23',
                '-pix_fmt', 'yuv420p',
                '-movflags', '+faststart',
                '-an',
                s_path_output
            ];
        } else {
            // GIF export: palette generation + dithering
            let s_dither_opt = (s_dither === 'none')
                ? 'dither=none'
                : (s_dither === 'floyd_steinberg')
                    ? 'dither=floyd_steinberg'
                    : 'dither=bayer:bayer_scale=5';
            let s_concat = a_s_filter_scaled.join('')
                + `concat=n=${a_o_section.length}:v=1:a=0`
                + `,fps=${n_fps__cur}`
                + s_scale
                + `,split[s0][s1];[s0]palettegen=max_colors=${n_cnt__color}:stats_mode=diff[p];[s1][p]paletteuse=${s_dither_opt}`;
            let s_filter_complex = a_s_filter_input.join(';') + ';' + s_concat;
            a_s_arg = [
                '-y',
                '-i', s_path_video,
                '-filter_complex', s_filter_complex,
                '-loop', String(n_cnt__loop),
                '-f', 'gif',
                s_path_output
            ];
        }

        console.log(`ffmpeg attempt ${n_attempt + 1} (fps=${n_fps__cur}, format=${s_format}):`, a_s_arg.join(' '));

        let o_command = new Deno.Command('ffmpeg', {
            args: a_s_arg,
            stdout: 'piped',
            stderr: 'piped',
        });
        let o_process = await o_command.output();
        let s_stderr = new TextDecoder().decode(o_process.stderr);

        if(!o_process.success){
            throw new Error('ffmpeg failed: ' + s_stderr);
        }

        let o_stat = await Deno.stat(s_path_output);
        n_bytes__result = o_stat.size;

        if(n_bytes__result <= n_bytes__max){
            break;
        }
        console.log(`${s_format.toUpperCase()} too large: ${Math.round(n_bytes__result / 1024 / 1024)}MB > ${Math.round(n_bytes__max / 1024 / 1024)}MB, retrying with lower fps...`);
    }

    return {
        s_path_output,
        n_bytes: n_bytes__result,
        n_fps: n_fps__used,
        s_status: 'complete',
    };
};

export {
    f_a_o_fsnode,
    f_o_uttdatainfo__read_or_create,
    f_v_result_from_o_wsmsg
};

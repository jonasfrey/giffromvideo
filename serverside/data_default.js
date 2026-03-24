import { s_ds, s_root_dir } from "./runtimedata.js";


let o_o_keyvalpair__default = {

    o_keyvalpair__s_path_absolute__filebrowser : {
        s_key: 's_path_absolute__filebrowser',
        s_value: s_root_dir
    },
    o_keyvalpair__s_name_model_selected : {
        s_key: 's_name_model_selected',
        s_value: 'o_keyvalpair',
    },
    o_keyvalpair__s_path_page_selected : {
        s_key: 's_path_page_selected',
        s_value: '/data',
    },
    o_keyvalpair__s_root_dir : {
        s_key: 's_root_dir',
        s_value: s_root_dir,
    },
    o_keyvalpair__s_ds : {
        s_key: 's_ds',
        s_value: s_ds,
    },
    o_keyvalpair__s_path_dir__export : {
        s_key: 's_path_dir__export',
        s_value: s_root_dir + s_ds + 'export',
    },
}

let o_course__opensource101 = {
    s_name: 'Opensource 101'
}
let o_course__geometry101 = {
    s_name: 'Geometry 101'
}
let o_student__gretel = {
    s_name: 'Gretel',
    o_course: o_course__geometry101
}
let o_student__olaf = {
    s_name: 'Olaf',
    o_course: o_course__opensource101
}
let a_o_data_default = [
    {o_student: o_student__gretel},
    {o_student: o_student__olaf},
    {
        o_student: {
            s_name: "Daria",
            o_course: o_course__opensource101
        }
    },

        ...Object.values(o_o_keyvalpair__default).map(o=>{
            return {o_keyvalpair: o}
    }),
    {
        o_course: {
            s_name: 'Database Systems 101',
            a_o_student: [
                'Gretel',
                'Olaf',
                'Daria',
                'Isabel',
                'Salomon',
                'Gandalf',
                'Rumplestiltskin',
                'Elizabeth',
                'Albert',
                'Tiffany',
            ]
        }
    },
]
// console.log({a_o_data_default})



export {
    a_o_data_default,
    o_o_keyvalpair__default
}
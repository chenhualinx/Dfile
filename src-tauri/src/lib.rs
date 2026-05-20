pub mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::device::list_devices,
            commands::session::connect_device,
            commands::session::disconnect_device,
            commands::session::list_connected_devices,
            commands::file::list_objects,
            commands::file::get_object_info,
            commands::transfer::download_file,
            commands::transfer::upload_file,
            commands::transfer::batch_download,
            commands::transfer::delete_objects,
            commands::transfer::cancel_transfer,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

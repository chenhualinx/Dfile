use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct PermissionStatus {
    pub usb_permission: bool,
    pub error: Option<String>,
}

#[tauri::command]
pub fn check_usb_permission() -> PermissionStatus {
    match mtp_rs::mtp::MtpDevice::list_devices() {
        Ok(_) => PermissionStatus {
            usb_permission: true,
            error: None,
        },
        Err(e) => {
            let err_str = e.to_string().to_lowercase();
            let is_perm = err_str.contains("permission") || err_str.contains("denied")
                || err_str.contains("access") || err_str.contains("13");
            PermissionStatus {
                usb_permission: !is_perm,
                error: Some(e.to_string()),
            }
        }
    }
}

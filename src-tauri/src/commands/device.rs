use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct DeviceListEntry {
    pub id: String,
    pub name: String,
    pub manufacturer: String,
    pub model: String,
    pub serial: String,
}

#[tauri::command]
pub fn list_devices() -> Result<Vec<DeviceListEntry>, String> {
    let infos = mtp_rs::mtp::MtpDevice::list_devices()
        .map_err(|e| format!("list_devices failed: {}", e))?;
    Ok(infos.into_iter().map(|info| {
        let serial = info.serial_number.clone().unwrap_or_default();
        let manufacturer = info.manufacturer.clone().unwrap_or_default();
        let product = info.product.clone().unwrap_or_default();
        DeviceListEntry {
            id: serial.clone(),
            name: if product.is_empty() { format!("{:04x}:{:04x}", info.vendor_id, info.product_id) } else { product.clone() },
            manufacturer,
            model: product,
            serial,
        }
    }).collect())
}

use tokio::sync::Mutex;

pub struct ConnectedDevice {
    pub device: mtp_rs::mtp::MtpDevice,
    pub device_id: String,
}

pub static DEVICE: std::sync::LazyLock<Mutex<Option<ConnectedDevice>>> =
    std::sync::LazyLock::new(|| Mutex::new(None));

async fn open_device_with_retry(device_id: &str) -> Result<mtp_rs::mtp::MtpDevice, String> {
    let mut last_err = String::new();
    for attempt in 0..3 {
        if attempt > 0 {
            tokio::time::sleep(std::time::Duration::from_millis(500)).await;
        }
        match mtp_rs::mtp::MtpDeviceBuilder::new()
            .open_by_serial(device_id)
            .await
        {
            Ok(device) => return Ok(device),
            Err(e) => last_err = format!("connect failed: {}", e),
        }
    }
    Err(last_err)
}

#[tauri::command]
pub async fn connect_device(device_id: String) -> Result<serde_json::Value, String> {
    // If already connected to this device, return stored info
    {
        let guard = DEVICE.lock().await;
        if let Some(ref cd) = *guard {
            if cd.device_id == device_id {
                let info = cd.device.device_info();
                let storages = cd.device.storages().await.map_err(|e| format!("storages: {}", e))?;
                let storage_list: Vec<serde_json::Value> = storages.iter().map(|s| {
                    let si = s.info();
                    serde_json::json!({
                        "storage_id": s.id().0,
                        "description": si.description,
                        "max_capacity": si.max_capacity,
                        "free_space": si.free_space_bytes,
                        "filesystem_type": format!("{:?}", si.filesystem_type),
                    })
                }).collect();
                return Ok(serde_json::json!({
                    "device_id": device_id,
                    "manufacturer": info.manufacturer,
                    "model": info.model,
                    "serial": info.serial_number,
                    "storage": storage_list,
                }));
            }
        }
    }

    let device = open_device_with_retry(&device_id).await?;

    let info = device.device_info();
    let storages = device.storages().await
        .map_err(|e| format!("storages failed: {}", e))?;

    let storage_list: Vec<serde_json::Value> = storages.iter().map(|s| {
        let si = s.info();
        serde_json::json!({
            "storage_id": s.id().0,
            "description": si.description,
            "max_capacity": si.max_capacity,
            "free_space": si.free_space_bytes,
            "filesystem_type": format!("{:?}", si.filesystem_type),
        })
    }).collect();

    let dev_info = serde_json::json!({
        "device_id": device_id,
        "manufacturer": info.manufacturer,
        "model": info.model,
        "serial": info.serial_number,
        "storage": storage_list,
    });

    let mut guard = DEVICE.lock().await;
    *guard = Some(ConnectedDevice { device, device_id: device_id.clone() });
    drop(guard);

    Ok(dev_info)
}

#[tauri::command]
pub async fn disconnect_device(device_id: String) -> Result<(), String> {
    let mut guard = DEVICE.lock().await;
    if let Some(cd) = guard.take() {
        cd.device.close().await.map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub async fn list_connected_devices() -> Result<Vec<String>, String> {
    let guard = DEVICE.lock().await;
    Ok(guard.as_ref().map(|cd| vec![cd.device_id.clone()]).unwrap_or_default())
}

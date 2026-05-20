use serde::{Deserialize, Serialize};
use tauri::Emitter;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransferProgressPayload {
    pub file_name: String,
    pub bytes_transferred: u64,
    pub total_bytes: u64,
    pub speed_mbps: f64,
    pub status: String,
}

#[tauri::command]
pub async fn download_file(
    app_handle: tauri::AppHandle,
    device_id: String,
    object_handle: u32,
    dest_path: String,
) -> Result<(), String> {
    let (data, file_name) = {
        let guard = crate::commands::session::DEVICE.lock().await;
        let cd: &crate::commands::session::ConnectedDevice = guard.as_ref().ok_or("No device connected")?;
        let storages = cd.device.storages().await.map_err(|e| format!("storages: {}", e))?;
        let mut result = None;
        for storage in &storages {
            if let Ok(info) = storage.get_object_info(mtp_rs::ObjectHandle(object_handle)).await {
                let data = storage.download(mtp_rs::ObjectHandle(object_handle)).await
                    .map_err(|e| format!("download: {}", e))?;
                result = Some((data, info.filename));
                break;
            }
        }
        result.ok_or("Object not found")?
    };
    std::fs::write(&dest_path, &data).map_err(|e| format!("write: {}", e))?;
    let _ = app_handle.emit("transfer:progress", TransferProgressPayload {
        file_name,
        bytes_transferred: data.len() as u64,
        total_bytes: data.len() as u64,
        speed_mbps: 0.0,
        status: "completed".into(),
    });
    Ok(())
}

#[tauri::command]
pub async fn upload_file(
    app_handle: tauri::AppHandle,
    device_id: String,
    parent_handle: u32,
    source_path: String,
) -> Result<(), String> {
    let path = std::path::Path::new(&source_path);
    let file_name = path.file_name().and_then(|n| n.to_str()).ok_or("Invalid filename")?.to_string();
    let data = std::fs::read(&source_path).map_err(|e| format!("read: {}", e))?;
    let total = data.len();

    let stream = futures::stream::once(async move { Ok::<_, std::io::Error>(bytes::Bytes::from(data)) });
    tokio::pin!(stream);

    {
        let guard = crate::commands::session::DEVICE.lock().await;
        let cd: &crate::commands::session::ConnectedDevice = guard.as_ref().ok_or("No device connected")?;
        let storages = cd.device.storages().await.map_err(|e| format!("storages: {}", e))?;
        let storage = storages.first().ok_or("No storage")?;

        let info = mtp_rs::mtp::NewObjectInfo::file(&file_name, total as u64);
        storage.upload(Some(mtp_rs::ObjectHandle(parent_handle)), info, stream).await
            .map_err(|e| format!("upload: {}", e))?;
    }

    let _ = app_handle.emit("transfer:progress", TransferProgressPayload {
        file_name,
        bytes_transferred: total as u64,
        total_bytes: total as u64,
        speed_mbps: 0.0,
        status: "completed".into(),
    });
    Ok(())
}

#[tauri::command]
pub async fn delete_objects(
    device_id: String,
    handles: Vec<u32>,
) -> Result<u32, String> {
    let guard = crate::commands::session::DEVICE.lock().await;
    let cd: &crate::commands::session::ConnectedDevice = guard.as_ref().ok_or("No device connected")?;
    let storages = cd.device.storages().await.map_err(|e| format!("storages: {}", e))?;
    drop(guard);

    let mut deleted = 0u32;
    for storage in &storages {
        for h in &handles {
            if storage.delete(mtp_rs::ObjectHandle(*h)).await.is_ok() {
                deleted += 1;
            }
        }
    }
    Ok(deleted)
}

#[tauri::command]
pub async fn batch_download(
    app_handle: tauri::AppHandle,
    device_id: String,
    items: Vec<u32>,
    dest_dir: String,
) -> Result<(), String> {
    for (i, h) in items.iter().enumerate() {
        let dest = format!("{}/file_{}", dest_dir, i);
        download_file(app_handle.clone(), device_id.clone(), *h, dest).await?;
    }
    Ok(())
}

#[tauri::command]
pub async fn cancel_transfer(_app_handle: tauri::AppHandle, _file_name: String) -> Result<(), String> {
    Ok(())
}

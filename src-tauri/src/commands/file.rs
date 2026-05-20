use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct FileEntry {
    pub handle: u32,
    pub name: String,
    pub size: u64,
    pub is_directory: bool,
    pub date_modified: String,
    pub mime_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaginatedResult {
    pub entries: Vec<FileEntry>,
    pub total: u32,
    pub offset: u32,
    pub count: u32,
}

#[tauri::command]
pub async fn list_objects(
    _device_id: String,
    storage_id: u32,
    parent_handle: u32,
    offset: u32,
    count: u32,
) -> Result<PaginatedResult, String> {
    let storage = {
        let guard = crate::commands::session::DEVICE.lock().await;
        let cd: &crate::commands::session::ConnectedDevice = guard.as_ref().ok_or("No device connected")?;
        cd.device.storage(mtp_rs::StorageId(storage_id)).await
            .map_err(|e| format!("get storage: {}", e))?
    };

    let parent = if parent_handle == 0xFFFFFFFF { None } else { Some(mtp_rs::ObjectHandle(parent_handle)) };
    let mut listing = storage.list_objects_stream(parent).await
        .map_err(|e| format!("list objects: {}", e))?;

    let total = listing.total() as u32;
    let mut entries = Vec::new();
    let mut idx = 0u32;
    let end = offset + count;

    while let Some(result) = listing.next().await {
        let obj = result.map_err(|e| format!("get object info: {}", e))?;
        if idx >= offset && idx < end {
            let is_folder = obj.is_folder();
            entries.push(FileEntry {
                handle: obj.handle.0,
                name: obj.filename,
                size: obj.size,
                is_directory: is_folder,
                date_modified: obj.modified.map(|dt| format!("{:04}-{:02}-{:02}", dt.year, dt.month, dt.day)).unwrap_or_default(),
                mime_type: if is_folder { "folder".into() } else { "application/octet-stream".into() },
            });
        }
        idx += 1;
        if idx >= end {
            break;
        }
    }

    Ok(PaginatedResult { entries, total, offset, count })
}

#[tauri::command]
pub async fn get_object_info(
    device_id: String,
    handle: u32,
) -> Result<FileEntry, String> {
    let storages = {
        let guard = crate::commands::session::DEVICE.lock().await;
        let cd: &crate::commands::session::ConnectedDevice = guard.as_ref().ok_or("No device connected")?;
        cd.device.storages().await.map_err(|e| format!("storages: {}", e))?
    };

    for storage in &storages {
        if let Ok(info) = storage.get_object_info(mtp_rs::ObjectHandle(handle)).await {
            let is_folder = info.is_folder();
            return Ok(FileEntry {
                handle: info.handle.0,
                name: info.filename,
                size: info.size,
                is_directory: is_folder,
                date_modified: info.modified.map(|dt| format!("{:04}-{:02}-{:02} {:02}:{:02}:{:02}", dt.year, dt.month, dt.day, dt.hour, dt.minute, dt.second)).unwrap_or_default(),
                mime_type: if is_folder { "folder".into() } else { "application/octet-stream".into() },
            });
        }
    }
    Err("Object not found".into())
}

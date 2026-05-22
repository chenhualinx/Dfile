use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{LazyLock, Mutex};

type DirCacheKey = (u32, u32);
static DIR_CACHE: LazyLock<Mutex<HashMap<DirCacheKey, Vec<FileEntry>>>> =
    LazyLock::new(|| Mutex::new(HashMap::new()));

pub fn invalidate_dir_cache(storage_id: u32, parent_handle: u32) {
    if let Ok(mut cache) = DIR_CACHE.lock() {
        cache.remove(&(storage_id, parent_handle));
    }
}

pub fn clear_all_dir_caches() {
    if let Ok(mut cache) = DIR_CACHE.lock() {
        cache.clear();
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
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
    let cache_key = (storage_id, parent_handle);

    // Try cache first
    {
        if let Ok(cache) = DIR_CACHE.lock() {
            if let Some(all) = cache.get(&cache_key) {
                let total = all.len() as u32;
                let entries: Vec<FileEntry> = all
                    .iter()
                    .skip(offset as usize)
                    .take(count as usize)
                    .cloned()
                    .collect();
                return Ok(PaginatedResult { entries, total, offset, count });
            }
        }
    }

    // Cache miss — fetch from device
    let storage = {
        let guard = crate::commands::session::DEVICE.lock().await;
        let cd: &crate::commands::session::ConnectedDevice = guard.as_ref().ok_or("No device connected")?;
        cd.device.storage(mtp_rs::StorageId(storage_id)).await
            .map_err(|e| format!("get storage: {}", e))?
    };

    let parent = if parent_handle == 0xFFFFFFFF { None } else { Some(mtp_rs::ObjectHandle(parent_handle)) };
    let all_objects = storage.list_objects(parent).await
        .map_err(|e| format!("list objects: {}", e))?;

    let all_entries: Vec<FileEntry> = all_objects.into_iter()
        .map(|obj| {
            let is_folder = obj.is_folder();
            FileEntry {
                handle: obj.handle.0,
                name: obj.filename,
                size: obj.size,
                is_directory: is_folder,
                date_modified: obj.modified.map(|dt| format!("{:04}-{:02}-{:02} {:02}:{:02}:{:02}", dt.year, dt.month, dt.day, dt.hour, dt.minute, dt.second)).unwrap_or_default(),
                mime_type: if is_folder { "folder".into() } else { "application/octet-stream".into() },
            }
        })
        .collect();

    let total = all_entries.len() as u32;

    // Store in cache
    {
        if let Ok(mut cache) = DIR_CACHE.lock() {
            cache.insert(cache_key, all_entries.clone());
        }
    }

    let entries: Vec<FileEntry> = all_entries.into_iter()
        .skip(offset as usize)
        .take(count as usize)
        .collect();

    Ok(PaginatedResult { entries, total, offset, count })
}

#[tauri::command]
pub async fn refresh_directory(
    _device_id: String,
    storage_id: u32,
    parent_handle: u32,
) -> Result<(), String> {
    invalidate_dir_cache(storage_id, parent_handle);
    Ok(())
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

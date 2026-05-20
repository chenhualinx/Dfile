use serde::{Deserialize, Serialize};
use crate::commands::session::with_device_manager;

#[derive(Debug, Serialize, Deserialize)]
pub struct StorageUsage {
    pub storage_id: u32,
    pub description: String,
    pub max_capacity: u64,
    pub free_space: u64,
    pub used_space: u64,
    pub usage_pct: f64,
    pub category: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StorageCategory {
    pub category: String,
    pub size: u64,
    pub count: u32,
}

#[tauri::command]
pub fn get_storage_info(device_id: String) -> Result<Vec<StorageUsage>, String> {
    with_device_manager(|mgr| {
        let session = mgr.get_session(&device_id)?;
        let storage_ids = session.handle.get_storage_ids()?;
        let mut result = Vec::new();
        for id in storage_ids {
            let info = session.handle.get_storage_info(id)?;
            let used = info.max_capacity.saturating_sub(info.free_space);
            let pct = if info.max_capacity > 0 {
                (used as f64 / info.max_capacity as f64) * 100.0
            } else {
                0.0
            };
            let category = match info.storage_type {
                1 => "Fixed".into(),
                2 => "Removable".into(),
                _ => "Unknown".into(),
            };
            result.push(StorageUsage {
                storage_id: id,
                description: info.storage_description,
                max_capacity: info.max_capacity,
                free_space: info.free_space,
                used_space: used,
                usage_pct: pct,
                category,
            });
        }
        Ok(result)
    })
}

#[tauri::command]
pub fn get_storage_usage_by_type(device_id: String) -> Result<Vec<StorageCategory>, String> {
    with_device_manager(|mgr| {
        let session = mgr.get_session(&device_id)?;
        let storage_ids = session.handle.get_storage_ids()?;
        let mut categories: std::collections::HashMap<String, (u64, u32)> = std::collections::HashMap::new();

        for sid in storage_ids {
            let handles = session.handle.get_object_handles(sid, 0xFFFFFFFF, 0, 10000)?;
            for h in handles {
                if let Ok(info) = session.handle.get_object_info(h) {
                    let cat = if info.object_format == 0x3001 { "Folders"
                    } else if info.object_format >= 0x3800 && info.object_format <= 0x38FF { "Images"
                    } else if info.object_format >= 0x3008 && info.object_format <= 0x300F { "Media"
                    } else { "Other" };
                    let entry = categories.entry(cat.to_string()).or_insert((0, 0));
                    entry.0 += info.compressed_size;
                    entry.1 += 1;
                }
            }
        }

        Ok(categories.into_iter().map(|(k, (size, count))| StorageCategory {
            category: k,
            size,
            count,
        }).collect())
    })
}

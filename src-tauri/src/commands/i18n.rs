use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;

static CURRENT_LANG: std::sync::LazyLock<Mutex<String>> =
    std::sync::LazyLock::new(|| Mutex::new("zh-CN".into()));

fn load_translations() -> HashMap<String, HashMap<String, String>> {
    let en: serde_json::Value = serde_json::from_str(include_str!("../../../src/i18n/locales/en-US.json")).unwrap_or_default();
    let zh: serde_json::Value = serde_json::from_str(include_str!("../../../src/i18n/locales/zh-CN.json")).unwrap_or_default();
    let mut map: HashMap<String, HashMap<String, String>> = HashMap::new();
    for (lang, data) in [("en-US", en), ("zh-CN", zh)] {
        let mut flat = HashMap::new();
        flatten_json(&data, "", &mut flat);
        map.insert(lang.into(), flat);
    }
    map
}

fn flatten_json(val: &serde_json::Value, prefix: &str, out: &mut HashMap<String, String>) {
    match val {
        serde_json::Value::Object(obj) => {
            for (k, v) in obj {
                let key = if prefix.is_empty() { k.clone() } else { format!("{}.{}", prefix, k) };
                flatten_json(v, &key, out);
            }
        }
        serde_json::Value::String(s) => {
            out.insert(prefix.into(), s.clone());
        }
        _ => {}
    }
}

#[tauri::command]
pub fn set_language(lang: String) -> Result<(), String> {
    let mut current = CURRENT_LANG.lock().map_err(|e| e.to_string())?;
    *current = lang;
    Ok(())
}

#[tauri::command]
pub fn get_language() -> Result<String, String> {
    CURRENT_LANG.lock().map(|l| l.clone()).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn t(key: String) -> String {
    let translations = load_translations();
    let lang = CURRENT_LANG.lock().unwrap_or_else(|e| e.into_inner());
    let lang_map = translations.get(lang.as_str());
    if let Some(map) = lang_map {
        if let Some(val) = map.get(&key) {
            return val.clone();
        }
    }
    // fallback to zh-CN
    if let Some(map) = translations.get("zh-CN") {
        if let Some(val) = map.get(&key) {
            return val.clone();
        }
    }
    key
}

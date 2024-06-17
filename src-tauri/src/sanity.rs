use std::time::{SystemTime, UNIX_EPOCH};

#[tauri::command]
pub fn sanity_check() -> String {
    let start = SystemTime::now();
    let since_the_epoch = start
        .duration_since(UNIX_EPOCH)
        .expect("Time went backwards")
        .as_millis();
    format!("sanity_check sanity check from Rust! (timestamp: {since_the_epoch}ms)")
}

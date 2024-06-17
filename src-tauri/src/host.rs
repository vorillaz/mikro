#[tauri::command]
pub fn get_machine_id() -> String {
    let machine_id: String = machine_uid::get().unwrap();
    let res = mac_address::get_mac_address().unwrap();

    // Use this if machine_uid is not available
    let mac_address = res.unwrap().to_string();

    if machine_id.is_empty() {
        mac_address
    } else {
        machine_id
    }
}

#[tauri::command]
pub fn get_hostname() -> String {
    let hostname = hostname::get()
        .ok()
        .and_then(|h| h.into_string().ok())
        .unwrap_or("unknown".to_owned());

    format!("{hostname}")
}

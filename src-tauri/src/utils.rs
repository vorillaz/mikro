use ffmpeg_sidecar::paths::sidecar_dir;
use std::fmt::Debug;
use std::process::Command;
use uuid::Uuid;

static mut TOKEN: String = String::new();
static mut PORT: u16 = 0;

pub fn errstr(e: impl Debug) -> String {
    format!("{:?}", e)
}

pub fn run_command(command: &str, args: Vec<&str>) -> Result<(String, String), String> {
    let output = Command::new(command)
        .args(args)
        .output()
        .expect("Failed to execute command");

    let stdout = String::from_utf8(output.stdout).unwrap_or_else(|_| "".to_string());
    let stderr = String::from_utf8(output.stderr).unwrap_or_else(|_| "".to_string());

    println!("Command output: {}", stdout);
    println!("Command error: {}", stderr);

    Ok((stdout, stderr))
}

pub fn ffmpeg_path_as_str() -> Result<String, String> {
    let binary_name = if cfg!(target_os = "windows") {
        "ffmpeg.exe"
    } else {
        "ffmpeg"
    };

    let path = sidecar_dir().map_err(|e| e.to_string())?.join(binary_name);
    path.to_str()
        .map(|s| s.to_owned()) // Converts the &str to a String
        .ok_or_else(|| "Failed to convert FFmpeg binary path to string".to_string())
}

pub fn get_random_access_token() -> String {
    if unsafe { TOKEN.is_empty() } {
        unsafe {
            TOKEN = Uuid::new_v4().to_string();
        }
    }
    unsafe { TOKEN.to_string() }
}

pub fn get_tcp_port() -> u16 {
    if unsafe { PORT == 0 } {
        unsafe {
            PORT = portpicker::pick_unused_port().expect("failed to find unused port");
        }
    }
    unsafe { PORT }
}

#[tauri::command]
pub fn frontend_port() -> u16 {
    return get_tcp_port();
}

#[tauri::command]
pub fn frontend_token() -> String {
    return get_random_access_token();
}

#[tauri::command]
pub fn filestat(filename: &str) -> Result<String, String> {
    use std::fmt::format;
    use std::fs;
    use std::time::UNIX_EPOCH;

    let metadata = fs::metadata(filename).expect("Failed to stat file");
    let time = metadata.modified().expect("Failed to get mtime");
    let millis = time
        .duration_since(UNIX_EPOCH)
        .expect("Failed to calculate mtime")
        .as_millis();

    let u64millis = u64::try_from(millis).expect("Integer to large");

    let is_file = if metadata.is_file() { "true" } else { "false" };
    let is_dir = if metadata.is_dir() { "true" } else { "false" };
    let size = metadata.len();

    return Ok(format!(
        "{{\"mtime\":{},\"isFile\":{},\"isDir\":{},\"size\":{}}}",
        u64millis, is_file, is_dir, size
    ));
}

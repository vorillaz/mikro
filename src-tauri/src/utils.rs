use ffmpeg_sidecar::paths::sidecar_dir;
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

use anyhow::Result;
use ffmpeg_sidecar::{
    command::FfmpegCommand,
    event::{FfmpegEvent, LogLevel},
};
use serde::Serialize;
use std::{
    env,
    path::{Path, PathBuf},
    process::Command,
};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ThumbnailData {
    index: i16,
    path: String,
}

#[tauri::command]
pub async fn compress_video() {}

#[tauri::command(async)]
pub async fn get_duration(app: tauri::AppHandle, video_path: &str) -> Result<f32, String> {
    if !Path::exists(Path::new(video_path)) {
        return Err("Path not found".to_owned().to_string());
    }

    let output = Command::new("ffprobe")
        .args([
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            video_path,
        ])
        .output()
        .map_err(|e| format!("Failed to run ffprobe: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "ffprobe exited with non-zero status: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }
    let info = String::from_utf8_lossy(&output.stdout);
    let d = info.trim().parse::<f32>().unwrap();

    // ceil to two decimal places
    let duration = (d * 100.0).ceil() / 100.0;

    Ok(duration)
}

#[tauri::command(async)]
pub async fn generate_timeline_thumbnail(
    _app: tauri::AppHandle,
    video_path: &str,
    index: i16,
    duration: i16,
    frames: i16,
) -> Result<ThumbnailData, String> {
    if !Path::exists(Path::new(video_path)) {
        return Err("Path not found".into());
    }
    let digest = md5::compute(video_path);
    let tmp = env::temp_dir();
    let next = index + 1;
    let file_name = format!("{:x}_{}___{}.jpg", digest, frames, next);
    let output_path: PathBuf = [tmp.clone(), PathBuf::from(&file_name)].iter().collect();
    let thumb = ThumbnailData {
        index: index,
        path: output_path.display().to_string(),
    };

    // Check if the file already exists
    if Path::exists(Path::new(&output_path)) {
        return Ok(thumb);
    }

    // Generate the thumbnail

    let sub = f64::from(next) - 0.5;
    let ftime = (sub * f64::from(duration) / f64::from(frames));
    let time = ftime.floor() as i16;

    let pict = format!(r##"select="eq(pict_type\,I)""##);

    print!(
        "args {}",
        [
            "-ss",
            &time.to_string(),
            "-i",
            video_path,
            "-vf",
            &pict,
            "-vframes",
            "1",
            &output_path.display().to_string(),
            "-y",
        ]
        .join(" ")
        .to_string()
    );

    let exec = FfmpegCommand::new()
        .args([
            "-ss",
            &time.to_string(),
            "-i",
            video_path,
            // Remove the filter to get all frames since it is not working as expected
            // "-vf",
            // "select=eq(pict_type\\,I)",
            "-vframes",
            "1",
            &output_path.display().to_string(),
            "-y",
        ])
        .create_no_window()
        .spawn()
        .map_err(|e| format!("Failed to run ffmpeg: {}", e))
        .unwrap()
        .iter()
        .unwrap()
        .for_each(|e| match e {
            FfmpegEvent::Log(LogLevel::Error, e) => println!("Error: {}", e),
            FfmpegEvent::Progress(p) => println!("Progress: {}", p.time),
            _ => {}
        });

    return Ok(thumb);
}

#[tauri::command(async)]
pub async fn generate_video_thumbnail(
    app: tauri::AppHandle,
    video_path: &str,
) -> Result<String, String> {
    if !Path::exists(Path::new(video_path)) {
        return Err("Path not found".into());
    }

    let digest = md5::compute(video_path);
    let file_name = format!("{:x}.jpg", digest);

    let tmp = env::temp_dir();
    let output_path: PathBuf = [tmp.clone(), PathBuf::from(&file_name)].iter().collect();

    let errors = FfmpegCommand::new()
        .args([
            "-ss",
            "00:00:01.00",
            "-i",
            video_path,
            "-threads",
            "2",
            "-vf",
            "scale=1080:720:force_original_aspect_ratio=decrease",
            "-vframes",
            "1",
            &output_path.display().to_string(),
            "-y",
        ])
        .spawn()
        .unwrap()
        .iter()
        .unwrap()
        .filter_errors()
        .count();

    if (errors > 0) {
        return Err("Failed to generate thumbnail".into());
    }
    let out = output_path.display().to_string();
    Ok(out)
}

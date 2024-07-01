use anyhow::Result;
use ffmpeg_sidecar::{
    command::FfmpegCommand,
    event::{FfmpegEvent, LogLevel},
};
use shared_child::SharedChild;
use std::{
    env,
    path::{Path, PathBuf},
    process::Command,
    sync::{Arc, Mutex},
};
use tauri::{AppHandle, Manager};

use crate::domain::{
    CancelInProgressCompressionPayload, CompressionResult, CustomEvents, EventPayload, TauriEvents,
    ThumbnailData, VideoCompressionProgress,
};

const VIDEO_EXTENSIONS: [&str; 12] = [
    "flv", "mp4", "m3u8", "webm", "ogg", "mov", "avi", "mkv", "wmv", "m4v", "3gp", "3g2",
];
const IMAGE_EXTENSIONS: [&str; 7] = ["png", "jpg", "jpeg", "gif", "webp", "avif", "svg"];

// pub async fn compress_video(
//     video_path: &str,
//     convert_to_extension: &str,
//     preset_name: Option<&str>,
//     video_id: Option<&str>,
//     should_mute_video: bool,
//     quality: u16,
// ) -> Result<CompressionResult, String> {
// 1. try to convert the video to the desired extension and setup in tmp file
// 2. send events for progress
// 3. copy the file to the destination
// 4. cleanup the tmp file
// 5. return the result
// }

pub async fn compress_all_videos(app: tauri::AppHandle, video_paths: Vec<String>) {}

pub async fn compress_all_images(app: tauri::AppHandle, image_paths: Vec<String>) {}

//
pub async fn compress_all(app: tauri::AppHandle, file_paths: Vec<String>) -> Result<(), String> {
    let mut videofiles = vec![];
    let mut imagefiles = vec![];

    // if one of the files does not exist, return an error
    for file in file_paths.iter() {
        if !Path::exists(Path::new(file)) {
            let _s = app.emit_all(
                CustomEvents::CancelInProgressCompression.as_ref(),
                EventPayload {
                    message: "One of the files does not exist".to_owned(),
                },
            );

            return Err("One of the files does not exist".to_owned());
        }
    }

    for file in file_paths {
        let ext = file.split('.').last().unwrap();
        if VIDEO_EXTENSIONS.contains(&ext) {
            videofiles.push(file);
        } else if IMAGE_EXTENSIONS.contains(&ext) {
            imagefiles.push(file);
        }
    }

    if videofiles.len() > 0 {
        let imgs = compress_all_videos(app.clone(), videofiles).await;
    }

    if (imagefiles.len() > 0) {
        let videos = compress_all_images(app.clone(), imagefiles).await;
    }
    return Ok(());
}

#[tauri::command(async)]
pub async fn get_duration(_app: tauri::AppHandle, video_path: &str) -> Result<f32, String> {
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
        return Err("Path not found".to_owned().to_string());
    }

    let digest = md5::compute(video_path);
    let file_name = format!("{:x}-thumb.jpg", digest);

    let tmp = env::temp_dir();
    let output_path: PathBuf = [tmp.clone(), PathBuf::from(&file_name)].iter().collect();

    let errors = FfmpegCommand::new()
        .args([
            "-i",
            video_path,
            "-threads",
            "2",
            "-vf",
            "thumbnail=300",
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

use ffmpeg_sidecar::command::FfmpegCommand;
use std::sync::{Arc, Mutex};
use std::{
    env,
    io::{Read, Seek, SeekFrom, Write},
    path::{Path, PathBuf},
    process::{Command, Stdio},
};
use tokio::process::Command as AsyncCommand;
use uuid::Uuid;

#[tauri::command]
pub fn play_video() {
    // let video_file = PathBuf::from(path);
    // let video_file_str = video_file.to_string_lossy().into_owned();
    // let mut ffmpeg = FfmpegCommand::new()
    //     .realtime()
    //     .format("lavfi")
    //     .input(&video_file_str)
    //     .codec_video("rawvideo")
    //     .format("avi")
    //     .output("-")
    //     .spawn()
    //     .unwrap();

    // let mut ffplay = Command::new("ffplay")
    //     .args("-i -".split(' '))
    //     .stdin(Stdio::piped())
    //     .spawn()
    //     .unwrap();

    // let mut ffmpeg_stdout = ffmpeg.take_stdout().unwrap();
    // let mut ffplay_stdin = ffplay.stdin.take().unwrap();
}

#[tauri::command]
pub fn pause_video() {}

#[tauri::command]
pub fn stop_video() {}

#[tauri::command]
pub fn get_duration(app: tauri::AppHandle, video_path: &str) -> Result<u16, String> {
    if !Path::exists(Path::new(video_path)) {
        return Err("Path not found".into());
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
        .expect("Failed to execute command");

    let duration = String::from_utf8(output.stdout).unwrap_or_else(|_| "".to_string());
    let duration = duration.trim().parse::<f64>().unwrap_or(0.0).ceil();

    Ok(duration as u16)
}

#[tauri::command]
pub fn generate_video_thumbnail(app: tauri::AppHandle, video_path: &str) -> Result<String, String> {
    if !Path::exists(Path::new(video_path)) {
        return Err("Path not found".into());
    }

    let id = Uuid::new_v4();
    let file_name = format!("{}.jpg", id);
    let tmp = env::temp_dir();

    let output_path: PathBuf = [tmp.clone(), PathBuf::from(&file_name)].iter().collect();

    let errors = FfmpegCommand::new()
        .args([
            "-i",
            video_path,
            "-ss",
            "00:00:01.00",
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

    Ok(output_path.display().to_string())
}

use ffmpeg_sidecar::command::FfmpegCommand;
use md5::Digest;
use std::{
    borrow::Borrow,
    env,
    path::{Path, PathBuf},
    process::Command,
    vec,
};
use tokio;

#[tauri::command]
pub async fn compress_video() {}

#[tauri::command]
pub fn get_duration(app: tauri::AppHandle, video_path: &str) -> Result<f64, String> {
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
    let duration: f64 = duration.trim().parse::<f64>().unwrap();

    Ok(duration as f64)
}

async fn thumb(part: f64, index: usize, v_path: String) -> Result<String, String> {
    print!("thumb number {} \n", index);
    let p = v_path.clone();
    let tmp: PathBuf = env::temp_dir();
    let digest = md5::compute(p);
    let start = index as f64 * part;
    let file_name = format!("{:x}_{}.jpg", digest, index);
    let output_path: PathBuf = [tmp.clone(), PathBuf::from(&file_name)].iter().collect();
    let errors = FfmpegCommand::new()
        .args([
            "-i",
            v_path.borrow(),
            "-ss",
            &start.to_string(),
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

    print!("thumb number {} done \n", index);
    Ok(output_path.display().to_string())
}

async fn boom(part: f64, index: usize, v_path: String) -> Result<String, String> {
    Ok("".to_string())
}

#[tauri::command]
pub async fn generate_timeline_thumbnails(
    app: tauri::AppHandle,
    video_path: &str,
) -> Result<Vec<String>, String> {
    // Split the video into 10 equal parts and generate thumbnails for each part
    let duration = get_duration(app, video_path).unwrap();
    let parts = 20;
    let part_duration = duration / parts as f64;

    let mut thumbnails = Vec::new();

    let mut handles = Vec::new();
    let path = video_path.to_string();

    for i in 0..parts {
        let job = tokio::spawn(thumb(part_duration, i, path.clone()));
        handles.push(job);
        // thumbnails.push(output_path.display().to_string());
    }

    for job in handles {
        thumbnails.push(job.await.unwrap()?);
    }

    print!("thumbs");
    print!("{:?}", thumbnails);

    Ok(thumbnails)
}

#[tauri::command]
pub fn generate_video_thumbnail(app: tauri::AppHandle, video_path: &str) -> Result<String, String> {
    if !Path::exists(Path::new(video_path)) {
        return Err("Path not found".into());
    }

    let digest = md5::compute(video_path);
    let file_name = format!("{:x}.jpg", digest);

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

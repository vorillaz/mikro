#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use anyhow::Result;

use ffmpeg_sidecar::{
    command::ffmpeg_is_installed,
    download::{check_latest_version, download_ffmpeg_package, ffmpeg_download_url, unpack_ffmpeg},
    paths::sidecar_dir,
    version::ffmpeg_version,
};

mod host;
mod localhost;
mod media;
mod sanity;
mod utils;

fn main() {
    std::panic::set_hook(Box::new(|info| {
        eprintln!("Thread panicked: {:?}", info);
    }));

    fn handle_ffmpeg_installation() -> Result<()> {
        if ffmpeg_is_installed() {
            println!("FFmpeg is already installed! 🎉");
            return Ok(());
        }

        // Short version without customization:
        // ```rust
        // ffmpeg_sidecar::download::auto_download().unwrap();
        // ```

        match check_latest_version() {
            Ok(version) => println!("Latest available version: {}", version),
            Err(_) => println!("Skipping version check on this platform."),
        }

        let download_url = ffmpeg_download_url()?;
        let destination = sidecar_dir()?;

        println!("Downloading from: {:?}", download_url);
        let archive_path = download_ffmpeg_package(download_url, &destination)?;
        println!("Downloaded package: {:?}", archive_path);

        println!("Extracting...");
        unpack_ffmpeg(&archive_path, &destination)?;

        let version = ffmpeg_version()?;
        println!("FFmpeg version: {}", version);

        println!("Done! 🏁");
        Ok(())
    }

    handle_ffmpeg_installation().expect("Failed to install FFmpeg");

    tauri::Builder::default()
        .setup(|app| {
            let port = utils::get_tcp_port();
            let token = utils::get_random_access_token();

            print!(
                "Starting localhost server on port {} with token {}",
                port, token
            );
            localhost::spawn_localhost_server(port, token);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            sanity::sanity_check,
            host::get_machine_id,
            host::get_hostname,
            utils::filestat,
            media::generate_video_thumbnail,
            media::get_duration,
            media::play_video,
            media::pause_video,
            media::stop_video,
            utils::frontend_token,
            utils::frontend_port,
        ])
        .run(tauri::generate_context!())
        .expect("Error while running tauri application");
}

use serde::{Deserialize, Serialize};
use strum::{AsRefStr, EnumProperty};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompressionResult {
    pub file_name: String,
    pub file_path: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileMetadata {
    pub path: String,
    pub file_name: String,
    pub mime_type: String,
    pub extension: String,
    pub size: u64,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct VideoCompressionProgress {
    pub video_id: String,
    pub file_name: String,
    pub current_duration: String,
}

#[derive(Clone, AsRefStr)]
pub enum CustomEvents {
    VideoCompressionProgress,
    CancelInProgressCompression,
}

#[derive(EnumProperty)]
pub enum TauriEvents {
    #[strum(props(key = "tauri://destroyed"))]
    Destroyed,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CancelInProgressCompressionPayload {
    pub video_id: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ThumbnailData {
    pub index: i16,
    pub path: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EventPayload {
    message: String,
}

use std::thread::JoinHandle;

/// Filesystem proxy server with strictly limited permissions and auth required.
/// Required workaround for Edge Webview2 streaming memory leak
pub fn spawn_localhost_server(localhost_port: u16, random_access_token: String) -> JoinHandle<()> {
    use rouille::{percent_encoding, Response};
    use std::{
        cmp::min,
        collections::HashMap,
        ffi::OsStr,
        fs::File,
        io::{Read, Seek, SeekFrom},
        path::Path,
        thread,
    };
    use tauri::http::HttpRange;

    let allowed_mime_types = HashMap::from([
        ("flv", "video/x-flv"),
        ("mp4", "video/mp4"),
        ("m3u8", "application/x-mpegURL"),
        ("ts", "video/MP2T"),
        ("3gp", "video/3gpp"),
        ("mov", "video/quicktime"),
        ("avi", "video/x-msvideo"),
        ("wmv", "video/x-ms-wmv"),
        ("mkv", "video/x-matroska"),
        ("webm", "video/webm"),
    ]);

    thread::Builder::new()
        .name("localhost".into())
        .spawn(move || {
            println!("[localhost] Starting server on port {}", localhost_port);
            println!("[localhost] Access token = {}", random_access_token);

            rouille::start_server(format!("0.0.0.0:{}", localhost_port), move |request| {
                println!("[localhost] Received request: {:?}", request);

                if request.method() != "GET" {
                    println!("[localhost] blocked request with non-GET method");
                    return Response::text("").with_status_code(405);
                }

                let token = request.get_param("access_token");
                if token.is_none() {
                    println!("[localhost] Blocked request with missing access_token");
                    return Response::empty_400();
                }
                if token.unwrap() != random_access_token {
                    println!("[localhost] Blocked request with incorrect access_token");
                    return Response::text("").with_status_code(403);
                }

                // Only allow connection from localhost (though this includes local js on any page)
                let is_loopback = request.remote_addr().ip().is_loopback();
                if !is_loopback {
                    println!("[localhost] Blocked request from unknown remote_addr");
                    return Response::text("").with_status_code(403);
                }

                let url = request.url();
                let input = url[1..].as_bytes();
                let path = percent_encoding::percent_decode(input)
                    .decode_utf8_lossy()
                    .to_string();

                let ext = Path::new(&path)
                    .extension()
                    .and_then(OsStr::to_str)
                    .unwrap();
                let mime = match allowed_mime_types.get(ext) {
                    Some(mime) => *mime,
                    None => {
                        println!(
                            "[localhost] Blocked request with unsupported extension {}",
                            ext
                        );
                        return Response::text("").with_status_code(403);
                    }
                };

                let range = match request.header("range") {
                    Some(range) => range,
                    None => {
                        println!("[localhost] Blocked request with no range header");
                        return Response::empty_400();
                    }
                };

                // Streaming from file via this example:
                // https://github.com/tauri-apps/tauri/blob/dev/examples/streaming/main.rs
                let mut content = match File::open(&path) {
                    Err(_) => {
                        println!("[localhost] Blocked request with invalid path {}", &path);
                        return Response::empty_404();
                    }
                    Ok(file) => file,
                };

                let mut buf = Vec::new();

                // Get the file size
                let file_size = content.metadata().unwrap().len();

                // we parse the range header with tauri helper
                let http_range = HttpRange::parse(range, file_size).unwrap();

                // let support only 1 range for now
                let range = match http_range.first() {
                    None => {
                        println!("[localhost] Blocked request with missing range");
                        return Response::text("").with_status_code(403);
                    }
                    Some(range) => range,
                };

                let mut real_length = range.length;

                // The Webview will greedily request chunks bigger than it can swallow
                // (10GB chunks or longer, all the way to the end of the video)
                // We enforce a max Content-Length on the server side to protect the client from itself
                const MAX_LENGTH: u64 = 32 * 1024 * 1024;
                if range.length > MAX_LENGTH {
                    real_length = min(range.length, MAX_LENGTH);
                }

                // last byte we are reading, the length of the range include the last byte
                // who should be skipped on the header
                let last_byte = range.start + real_length - 1;

                // FIXME: Add ETag support (caching on the webview)

                // seek our file bytes
                content.seek(SeekFrom::Start(range.start)).expect("seek");
                content
                    .take(real_length)
                    .read_to_end(&mut buf)
                    .expect("take");

                // println!("[localhost] requested {}MB", (range.length) / (1024 * 1024));
                // println!("[localhost] sending {}MB", (real_length) / (1024 * 1024));

                Response::from_data(mime, buf)
                    .with_status_code(206)
                    .with_additional_header("Connection", "Keep-Alive")
                    .with_additional_header("Accept-Ranges", "bytes")
                    .with_additional_header("Access-Control-Allow-Origin", "*")
                    .with_additional_header(
                        "Content-Range",
                        format!("bytes {}-{}/{}", range.start, last_byte, file_size),
                    )
            });
        })
        .expect("localhost thread")
}

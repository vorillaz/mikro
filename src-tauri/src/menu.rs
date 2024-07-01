use tauri::utils::assets::EmbeddedAssets;
use tauri::{AboutMetadata, Context, CustomMenuItem, Menu, MenuItem, Submenu, WindowMenuEvent};
use tauri::{AppHandle, Manager};

fn build_tray() {}

pub fn build_menu(context: &Context<EmbeddedAssets>) -> Menu {
    let _env = "YO";
    let name = context.package_info().name.clone();
    let app_menu = Submenu::new(
        "",
        Menu::new()
            .add_native_item(MenuItem::About(name.into(), AboutMetadata::new()))
            .add_native_item(MenuItem::Separator)
            .add_item(
                CustomMenuItem::new("settings".to_string(), "Settings")
                    .accelerator("CmdOrControl+,"),
            )
            .add_item(CustomMenuItem::new(
                "check_for_updates".to_string(),
                "Check for Updates",
            ))
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Hide)
            .add_native_item(MenuItem::HideOthers)
            .add_native_item(MenuItem::Separator)
            .add_item(
                CustomMenuItem::new("quit".to_string(), "Quit").accelerator("CmdOrControl+Q"),
            ),
    );

    let window_menu = Submenu::new(
        "Window",
        Menu::new()
            .add_native_item(MenuItem::Minimize)
            .add_native_item(MenuItem::Zoom)
            .add_native_item(MenuItem::CloseWindow)
            .add_native_item(MenuItem::EnterFullScreen),
    );

    Menu::new().add_submenu(app_menu).add_submenu(window_menu)
}

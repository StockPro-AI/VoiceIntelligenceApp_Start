#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{GlobalShortcutManager, Manager};
use tauri_plugin_global_shortcut::GlobalShortcutExt;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn register_hotkey(app_handle: tauri::AppHandle, hotkey: &str) -> Result<(), String> {
    let app_handle_clone = app_handle.clone();
    
    app_handle
        .global_shortcut()
        .on_shortcut(hotkey, move |_| {
            if let Some(window) = app_handle_clone.get_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        })
        .map_err(|e| e.to_string())?;

    app_handle
        .global_shortcut()
        .register(hotkey, move |_| {})
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn unregister_hotkey(app_handle: tauri::AppHandle, hotkey: &str) -> Result<(), String> {
    app_handle
        .global_shortcut()
        .unregister(hotkey)
        .map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            register_hotkey,
            unregister_hotkey
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

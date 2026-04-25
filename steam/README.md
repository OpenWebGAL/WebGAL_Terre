# WebGAL Terre Steam Release Checklist

This folder contains SteamPipe templates for the WebGAL Terre Electron app target.
Do not commit Steam partner credentials, real passwords, or one-time Steam Guard codes.

Current Steamworks IDs:

```text
AppID: 2978410
Windows DepotID: 2978412
Latest uploaded BuildID: 22954857
Latest depot ManifestID: 7145900282530938654
Live branch: default
```

## 1. Build the Electron App Target

From the repository root:

```sh
./release-terre-electron.sh
```

The Windows Steam depot content is expected at:

```text
terre-electron/build/win-unpacked
```

Steam should launch this executable:

```text
WebGAL Terre.exe
```

Do not use `WebGAL_Terre.exe` here; the packaged Electron app uses a space in
the executable name.

## 2. Local Steamworks Test

For local testing outside the Steam client, create this file next to the built executable:

```text
terre-electron/build/win-unpacked/steam_appid.txt
```

Its content must be only the numeric Steam AppID. Use `480` only for local SpaceWar testing.
Remove `steam_appid.txt` before uploading the depot to Steam.

You can also start the app with:

```sh
STEAM_APP_ID=480 yarn start
```

## 3. Steamworks App Admin

In Steamworks:

1. Create or open the WebGAL Terre app and note its AppID.
2. Create a Windows depot and note its DepotID.
3. In General Installation Settings, add a Windows launch option pointing to `WebGAL Terre.exe`.
4. Publish Steamworks metadata changes before testing package ownership.

## 4. SteamPipe Upload

Copy `app_build_TEMPLATE.vdf` and `depot_build_TEMPLATE.vdf` into the Steamworks SDK
`tools/ContentBuilder/scripts` directory, then replace:

```text
__APP_ID__
__DEPOT_ID__
__CONTENT_ROOT__
```

For the current WebGAL Terre Steam Edition app, use:

```text
app_build_2978410.vdf
depot_build_2978412.vdf
```

Run SteamCMD from the SDK `tools/ContentBuilder/builder` directory:

```sh
steamcmd.exe +login <build_account> +run_app_build ..\scripts\app_build_2978410.vdf +quit
```

Or run the local helper script from this repository:

```powershell
powershell.exe -ExecutionPolicy Bypass -File .\steam\upload_2978410.ps1
```

After upload, set the build live on a private beta branch first, install through Steam,
then verify launch, overlay, file access, editor save/export flows, and achievements.

## 5. If Steam Installs an Empty Folder

The uploaded depot is not enough by itself. The depot must also be included in the package
that grants ownership to the test account.

For this app, make sure depot `2978412` is included in the relevant package:

```text
All Associated Packages, DLC, Demos And Tools
Package landing page
Depots Included
Add/Remove Depots
2978412
```

At minimum, add it to the Developer Comp package used by the Steamworks test account.
If testing with beta/release override keys, add it to that package too.

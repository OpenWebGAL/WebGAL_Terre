package com.openwebgal.terre.utils

import android.content.Context
import android.content.pm.PackageManager
import android.content.res.AssetManager
import android.util.Log
import androidx.core.content.edit
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.io.InputStream
import java.io.OutputStream

object Assets {
    private const val NODE_DIR_NAME = "terre"

    fun copyAssets(context: Context, nodeDir: String) {
        if (wasAPKUpdated(context)) {
            Log.i("ASSETS", "Start copying assets")
            copyAssetFolder(context.assets, NODE_DIR_NAME, nodeDir)
            saveLastUpdateTime(context)
            Log.i("ASSETS", "Copying assets successful")
        }
    }

    private fun copyAssetFolder(
        assetManager: AssetManager,
        fromAssetPath: String,
        toPath: String
    ): Boolean {
        return try {
            val files = assetManager.list(fromAssetPath) ?: return copyAsset(
                assetManager,
                fromAssetPath,
                toPath
            )
            var res = true

            if (files.isEmpty()) {
                res = copyAsset(assetManager, fromAssetPath, toPath)
            } else {
                File(toPath).mkdirs()
                for (file in files) {
                    res = copyAssetFolder(assetManager, "$fromAssetPath/$file", "$toPath/$file")
                }
            }
            res
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    private fun copyAsset(
        assetManager: AssetManager,
        fromAssetPath: String,
        toPath: String
    ): Boolean {
        var `in`: InputStream? = null
        var out: OutputStream? = null
        return try {
            `in` = assetManager.open(fromAssetPath)
            File(toPath).createNewFile()
            out = FileOutputStream(toPath)
            copyFile(`in`, out)
            `in`.close()
            out.flush()
            out.close()
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        } finally {
            try {
                `in`?.close()
                out?.close()
            } catch (e: IOException) {
                e.printStackTrace()
            }
        }
    }

    private fun copyFile(inputStream: InputStream, outputStream: OutputStream) {
        val buffer = ByteArray(1024)
        var read: Int
        while (inputStream.read(buffer).also { read = it } != -1) {
            outputStream.write(buffer, 0, read)
        }
    }

    private fun deleteFolderRecursively(file: File): Boolean {
        return try {
            var res = true
            val childFiles = file.listFiles() ?: return file.delete()

            for (childFile in childFiles) {
                res = if (childFile.isDirectory) {
                    res and deleteFolderRecursively(childFile)
                } else {
                    res and childFile.delete()
                }
            }
            res and file.delete()
            res
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    private fun wasAPKUpdated(context: Context): Boolean {
        val prefs =
            context.getSharedPreferences("NODEJS_MOBILE_PREFS", Context.MODE_PRIVATE)
        val previousLastUpdateTime = prefs.getLong("NODEJS_MOBILE_APK_LastUpdateTime", 0)
        var lastUpdateTime: Long = 1
        try {
            val packageInfo =
                context.packageManager.getPackageInfo(context.packageName, 0)
            lastUpdateTime = packageInfo.lastUpdateTime
        } catch (e: PackageManager.NameNotFoundException) {
            e.printStackTrace()
        }
        return lastUpdateTime != previousLastUpdateTime
    }

    private fun saveLastUpdateTime(context: Context) {
        var lastUpdateTime: Long = 1
        try {
            val packageInfo =
                context.packageManager.getPackageInfo(context.packageName, 0)
            lastUpdateTime = packageInfo.lastUpdateTime
        } catch (e: PackageManager.NameNotFoundException) {
            e.printStackTrace()
        }
        val prefs =
            context.getSharedPreferences("NODEJS_MOBILE_PREFS", Context.MODE_PRIVATE)
        prefs.edit() {
            putLong("NODEJS_MOBILE_APK_LastUpdateTime", lastUpdateTime)
        }
    }
}
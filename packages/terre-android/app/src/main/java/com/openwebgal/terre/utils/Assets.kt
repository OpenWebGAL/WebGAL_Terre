package com.openwebgal.terre.utils

import android.content.Context
import android.content.pm.PackageManager
import android.util.Log
import androidx.core.content.edit
import org.apache.commons.compress.archivers.tar.TarArchiveInputStream
import java.io.BufferedInputStream
import java.io.File
import java.io.FileOutputStream
import java.io.IOException

object Assets {

    fun extractAssets(context: Context, nodeDir: String) {
        if (wasAPKUpdated(context)) {
            Log.i("ASSETS", "Start extracting assets from TAR")
//            val destinationDir = File(nodeDir)
//            if (destinationDir.exists()) {
//                deleteFolderRecursively(destinationDir)
//            }
            unTar(context, "terre.tar", nodeDir)
            saveLastUpdateTime(context)
            Log.i("ASSETS", "Extracting assets successful")
        }
    }

    private fun unTar(context: Context, assetName: String, toPath: String) {
        try {
            val assetManager = context.assets
            val tarInputStream =
                TarArchiveInputStream(BufferedInputStream(assetManager.open(assetName)))
            tarInputStream.use { tis ->
                var entry = tis.nextTarEntry
                while (entry != null) {
                    val destPath = File(toPath, entry.name)
                    if (entry.isDirectory) {
                        destPath.mkdirs()
                    } else {
                        destPath.parentFile?.mkdirs()
                        val fos = FileOutputStream(destPath)
                        fos.use {
                            tis.copyTo(it)
                        }
                    }
                    entry = tis.nextTarEntry
                }
            }
        } catch (e: IOException) {
            e.printStackTrace()
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
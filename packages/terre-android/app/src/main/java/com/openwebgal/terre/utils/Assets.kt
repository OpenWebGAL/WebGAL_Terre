package com.openwebgal.terre.utils

import android.content.Context
import android.content.pm.PackageManager
import androidx.core.content.edit
import com.openwebgal.terre.store.LogStore

object Assets {

    fun ensureNodeRuntime(context: Context) {
        val abi = android.os.Build.SUPPORTED_ABIS.first()
        val key = "runtime_$abi"

        if (shouldExtract(context, key)) {
            val bundleName = when (abi) {
                "arm64-v8a" -> "nodejs-aarch64.tar.xz"
                "armeabi-v7a" -> "nodejs-arm.tar.xz"
                "x86_64" -> "nodejs-x86_64.tar.xz"
                else -> error("Unsupported ABI: $abi")
            }

            LogStore.addLog("TERRE", "Extracting node runtime: $bundleName")
            ArchiveUtils.unTarXz(
                context,
                bundleName,
                context.filesDir.absolutePath,
                prefix = "data/data/com.termux/files/"
            )
            markExtracted(context, key)
            LogStore.addLog("TERRE", "Node runtime extracted successfully")
        }
    }

    fun extractAssets(context: Context, nodeDir: String) {
        if (shouldExtract(context, "project")) {
            LogStore.addLog("TERRE", "Start extracting assets")
            ArchiveUtils.unTarXz(context, "terre.tar.xz", nodeDir)
            markExtracted(context, "project")
            LogStore.addLog("TERRE", "Extracting assets successful")
        }
    }

    private fun shouldExtract(context: Context, key: String): Boolean {
        val prefs = context.getSharedPreferences("ASSETS_PREFS", Context.MODE_PRIVATE)
        return prefs.getLong(key, 0L) != getApkUpdateTime(context)
    }

    private fun markExtracted(context: Context, key: String) {
        val prefs = context.getSharedPreferences("ASSETS_PREFS", Context.MODE_PRIVATE)
        prefs.edit { putLong(key, getApkUpdateTime(context)) }
    }

    private fun getApkUpdateTime(context: Context): Long {
        return try {
            context.packageManager.getPackageInfo(context.packageName, 0).lastUpdateTime
        } catch (e: PackageManager.NameNotFoundException) {
            1L
        }
    }
}

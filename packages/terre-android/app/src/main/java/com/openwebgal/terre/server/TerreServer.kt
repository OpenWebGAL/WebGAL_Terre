package com.openwebgal.terre.server

import android.content.Context
import android.util.Log
import com.openwebgal.terre.utils.Assets.extractAssets
import java.util.concurrent.Executors

class TerreServer(private val applicationContext: Context) {

    private external fun startNodeWithArguments(arguments: Array<String>): Int
    private external fun stopNode(): Int

    @Volatile
    var isRunning: Boolean = false
        private set

    fun start() {
        isRunning = true
        try {
            applicationContext.getExternalFilesDir(null) // May return null, call to create directory
            val externalFilesDir = applicationContext.getExternalFilesDir(null)
            Log.i("ASSETS", externalFilesDir?.absolutePath.toString())
            if (externalFilesDir != null) {
                val nodeDir = externalFilesDir.absolutePath
                val executor = Executors.newSingleThreadExecutor()
                executor.submit {
                    extractAssets(applicationContext, nodeDir)
                    startNodeWithArguments(
                        arrayOf(
                            "node",
                            "$nodeDir/main.js",
                            "--cwd",
                            nodeDir
                        )
                    )
                }
            } else {
                Log.e("StorageError", "External files directory is unavailable")
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun stop() {
        isRunning = false
        try {
            stopNode()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
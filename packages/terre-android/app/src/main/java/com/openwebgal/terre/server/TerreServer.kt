package com.openwebgal.terre.server

import android.content.Context
import com.openwebgal.terre.store.LogStore
import java.io.File
import java.util.concurrent.Executors

class TerreServer(private val applicationContext: Context) {

    @Volatile
    var isRunning: Boolean = false
        private set

    @Volatile
    private var nodeProcess: Process? = null

    fun start() {
        isRunning = true
        try {
            applicationContext.getExternalFilesDir(null)
            val externalFilesDir = applicationContext.getExternalFilesDir(null)
            if (externalFilesDir == null) {
                LogStore.addLog("TERRE-NODE", "External files directory is unavailable")
                return
            }

            val nodeDir = externalFilesDir.absolutePath
            val filesDir = applicationContext.filesDir.absolutePath
            val nativeLibraryDir = applicationContext.applicationInfo.nativeLibraryDir

            val executor = Executors.newSingleThreadExecutor()
            executor.submit {
                val homeDir = File(filesDir, "home")

                val process = ProcessBuilder(
                    "$nativeLibraryDir/libnode.so",
                    "$nodeDir/main.js",
                    "--cwd",
                    nodeDir
                ).apply {
                    directory(File(nodeDir))
                    redirectErrorStream(true)

                    val env = environment()
                    env["HOME"] = homeDir.absolutePath
                    env["PREFIX"] = "$filesDir/usr"
                    env["PATH"] = "$filesDir/usr/bin"
                    env["LD_LIBRARY_PATH"] = "$filesDir/usr/lib:$nativeLibraryDir"
                    env["NODE_PATH"] = "$filesDir/usr/lib/node_modules"
                    env["TMPDIR"] = applicationContext.cacheDir.absolutePath
                }.start()

                nodeProcess = process

                process.inputStream.bufferedReader().forEachLine { raw ->
                    if (isRunning) {
                        val line = raw.replace(Regex("\u001B\\[[;\\d]*m"), "")
                        LogStore.addLog("TERRE-NODE", line)
                    }
                }

                process.waitFor()
                isRunning = false
            }
            executor.shutdown()
        } catch (e: Exception) {
            e.printStackTrace()
            isRunning = false
        }
    }

    fun stop() {
        isRunning = false
        try {
            nodeProcess?.destroy()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}

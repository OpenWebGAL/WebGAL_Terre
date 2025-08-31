package com.openwebgal.terre.service

import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.util.Log
import com.openwebgal.terre.notification.Notification.NOTIFICATION_ID
import com.openwebgal.terre.notification.Notification.createNotification
import com.openwebgal.terre.notification.Notification.createNotificationChannel
import com.openwebgal.terre.server.TerreServer
import com.openwebgal.terre.store.LogStore
import com.openwebgal.terre.store.TerreStore
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import java.io.BufferedReader
import java.io.IOException
import java.io.InputStreamReader

class TerreService : Service() {

    companion object {
        init {
            System.loadLibrary("terre")
            System.loadLibrary("node")
        }
    }

    private val ADBTAG = "NODEJS-MOBILE"

    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    private var terreServer: TerreServer? = null

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel(this)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForeground(NOTIFICATION_ID, createNotification(this))
        val context = this

        serviceScope.launch {
            if (terreServer == null) {
                println("TerreServer: Initializing and starting...")
                terreServer = TerreServer(context)
                terreServer?.start()
                TerreStore.updateIsRunning(true)
                startLogcat()
                println("TerreServer: Started and running!")
            } else {
                println("TerreServer: Already initialized and running.")
            }
        }

        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        TerreStore.updateIsRunning(false)
        LogStore.resetLogs()
        serviceScope.cancel()
        terreServer?.stop()
        println("TerreServer: Stop")
    }

    private fun startLogcat() {
        try {
            clearLogcat()

            val process = ProcessBuilder("logcat").redirectErrorStream(true).start()
            val bufferedReader = BufferedReader(InputStreamReader(process.inputStream))

            var line: String?
            while (bufferedReader.readLine().also { line = it } != null) {
                line?.let { message ->
                    if (message.contains(ADBTAG) || message.contains("ASSETS") || message.contains("E/")) {
                        val log = cleanLog(message)
                        LogStore.addLog(log)
                    }
                }
            }
            process.destroy()
            Log.d("Logcat", "Logcat reading stopped.")
            bufferedReader.close()
        } catch (e: IOException) {
            Log.e(
                "Logcat",
                "Error reading logcat in coroutine: ${e.message}"
            )
        }
    }

    private fun clearLogcat() {
        try {
            val process = Runtime.getRuntime().exec("logcat -c")
            process.waitFor()
        } catch (e: IOException) {
            Log.e("Logcat", "Error clearing logcat: ${e.message}")
        } catch (e: InterruptedException) {
            Log.e("Logcat", "Error clearing logcat: ${e.message}")
            Thread.currentThread().interrupt()
        }
    }

    private fun cleanLog(message: String): String =
        message.split("$ADBTAG:").last().replace(Regex("\u001B\\[[;\\d]*m"), "").trim()
}
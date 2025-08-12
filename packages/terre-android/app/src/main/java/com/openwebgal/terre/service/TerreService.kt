package com.openwebgal.terre.service

import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.util.Log
import com.openwebgal.terre.notification.Notification.NOTIFICATION_ID
import com.openwebgal.terre.notification.Notification.createNotification
import com.openwebgal.terre.notification.Notification.createNotificationChannel
import com.openwebgal.terre.receiver.StoreUpdateReceiver
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

    private fun sendStoreUpdate(method: String, block: (Intent.() -> Unit)? = null) {
        val intent =
            Intent(StoreUpdateReceiver.ACTION_UPDATE_STORE).setClassName(
                packageName,
                StoreUpdateReceiver::class.java.name
            ).apply {
                putExtra(StoreUpdateReceiver.EXTRA_METHOD, method)
                block?.invoke(this)
            }
        sendBroadcast(intent)
    }

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
                sendStoreUpdate(StoreUpdateReceiver.METHOD_UPDATE_IS_RUNNING) {
                    putExtra(StoreUpdateReceiver.EXTRA_IS_RUNNING, true)
                }
                startLogcat()
                println("TerreServer: Started and running!")
            } else {
                sendStoreUpdate(StoreUpdateReceiver.METHOD_UPDATE_IS_RUNNING) {
                    putExtra(StoreUpdateReceiver.EXTRA_IS_RUNNING, TerreStore.isRunning.value)
                }
                sendStoreUpdate(StoreUpdateReceiver.METHOD_SET_LOGS) {
                    putExtra(StoreUpdateReceiver.EXTRA_LOGS, ArrayList(LogStore.logs.value))
                }
                println("TerreServer: Already initialized and running.")
            }
        }

        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        TerreStore.updateIsRunning(false)
        LogStore.resetLogs()
        sendStoreUpdate(StoreUpdateReceiver.METHOD_UPDATE_IS_RUNNING) {
            putExtra(StoreUpdateReceiver.EXTRA_IS_RUNNING, false)
        }
        sendStoreUpdate(StoreUpdateReceiver.METHOD_RESET_LOGS)
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
                        sendStoreUpdate(StoreUpdateReceiver.METHOD_ADD_LOG) {
                            putExtra(StoreUpdateReceiver.EXTRA_LOG_MESSAGE, log)
                        }
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
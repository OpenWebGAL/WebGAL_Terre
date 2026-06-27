package com.openwebgal.terre.service

import android.app.Service
import android.content.Intent
import android.os.IBinder
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

class TerreService : Service() {

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
}

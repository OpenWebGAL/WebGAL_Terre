package com.openwebgal.terre

import android.content.Intent
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.platform.LocalContext
import com.openwebgal.terre.notification.Notification
import com.openwebgal.terre.notification.Notification.checkAndShowNotification
import com.openwebgal.terre.notification.Notification.requestNotificationPermission
import com.openwebgal.terre.service.TerreService
import com.openwebgal.terre.store.TerreStore
import com.openwebgal.terre.ui.screen.MainScreen
import com.openwebgal.terre.ui.theme.TerreTheme

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        requestNotificationPermission(this)
        setContent {
            TerreTheme {
                val context = LocalContext.current
                val isInitialized by TerreStore.isInitialized.collectAsState()

                LaunchedEffect(Unit) {
                    if (isInitialized) return@LaunchedEffect

                    val serviceIntent = Intent(context, TerreService::class.java)
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        context.startForegroundService(serviceIntent)
                    } else {
                        context.startService(serviceIntent)
                    }

                    TerreStore.updateIsInitialized(true)
                }

                MainScreen()
            }
        }
    }

    override fun onResume() {
        super.onResume()
        checkAndShowNotification(this)
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray,
        deviceId: Int
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults, deviceId)
        Notification.onRequestPermissionsResult(this, requestCode, grantResults)
    }
}
package com.openwebgal.terre

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.openwebgal.terre.notification.Notification
import com.openwebgal.terre.notification.Notification.checkAndShowNotification
import com.openwebgal.terre.notification.Notification.requestNotificationPermission
import com.openwebgal.terre.ui.screen.MainScreen
import com.openwebgal.terre.ui.theme.TerreTheme

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        requestNotificationPermission(this)
        setContent {
            TerreTheme {
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
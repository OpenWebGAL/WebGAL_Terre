package com.openwebgal.terre

import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.platform.LocalContext
import androidx.core.net.toUri
import com.openwebgal.terre.Notification.checkAndShowNotification
import com.openwebgal.terre.Notification.requestNotificationPermission
import com.openwebgal.terre.service.TerreService
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

                LaunchedEffect(Unit) {
                    val serviceIntent = Intent(context, TerreService::class.java)
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        context.startForegroundService(serviceIntent)
                    } else {
                        context.startService(serviceIntent)
                    }
                }

                MainScreen(
                    launchUrl = ::launchUrl,
                )
            }
        }
    }

    private fun launchUrl(url: String) {
        val intent = Intent(Intent.ACTION_VIEW).apply {
            data = url.toUri()
        }
        try {
            startActivity(intent)
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(this, getString(R.string.could_not_open_browser), Toast.LENGTH_SHORT)
                .show()
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
package com.openwebgal.terre

import android.content.Intent
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.browser.customtabs.CustomTabsIntent
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.platform.LocalContext
import androidx.core.net.toUri
import com.openwebgal.terre.notification.Notification
import com.openwebgal.terre.notification.Notification.checkAndShowNotification
import com.openwebgal.terre.notification.Notification.requestNotificationPermission
import com.openwebgal.terre.service.TerreService
import com.openwebgal.terre.store.TerreStore
import com.openwebgal.terre.ui.screen.MainScreen
import com.openwebgal.terre.ui.theme.TerreTheme

class MainActivity : ComponentActivity() {

    companion object {
        const val ACTION_OPEN = "com.openwebgal.terre.ACTION_OPEN"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        requestNotificationPermission(this)
        handleIntent(intent)
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

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleIntent(intent)
    }

    private fun handleIntent(intent: Intent?) {
        if (intent?.action == ACTION_OPEN) {
            openBrowser()
        }
    }

    private fun openBrowser() {
        val uri = getString(R.string.local_url).toUri()
        try {
            val customTabsIntent = CustomTabsIntent.Builder().build()
            customTabsIntent.launchUrl(this, uri)
        } catch (e: Exception) {
            val intent = Intent(Intent.ACTION_VIEW, uri).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(intent)
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
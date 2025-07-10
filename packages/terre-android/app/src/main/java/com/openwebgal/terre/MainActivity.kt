package com.openwebgal.terre

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.core.net.toUri
import com.openwebgal.terre.Assets.copyAssets
import com.openwebgal.terre.Notification.cancelNotification
import com.openwebgal.terre.Notification.checkAndCreateNotification
import com.openwebgal.terre.Notification.createNotificationChannel
import com.openwebgal.terre.Notification.requestNotificationPermission
import com.openwebgal.terre.Notification.showNotification
import com.openwebgal.terre.ui.screen.MainScreen
import com.openwebgal.terre.ui.theme.TerreTheme
import java.util.concurrent.Executors

class MainActivity : ComponentActivity() {

    companion object {
        init {
            System.loadLibrary("terre")
            System.loadLibrary("node")
        }
    }

    private external fun startNodeWithArguments(arguments: Array<String>): Int
    private external fun stopNode(): Int

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        createNotificationChannel(this)
        requestNotificationPermission(this)
        setContent {
            TerreTheme {
                val showDialog = remember { mutableStateOf(false) }

                BackHandler(enabled = true) {
                    showDialog.value = true
                }

                if (showDialog.value) {
                    AlertDialog(
                        onDismissRequest = { showDialog.value = false },
                        title = { Text(getString(R.string.confirm_exit_title)) },
                        text = { Text(getString(R.string.confirm_exit_message)) },
                        confirmButton = {
                            TextButton(onClick = {
                                showDialog.value = false
                                stop()
                            }) {
                                Text(getString(R.string.confirm))
                            }
                        },
                        dismissButton = {
                            TextButton(onClick = { showDialog.value = false }) {
                                Text(getString(R.string.cancel))
                            }
                        }
                    )
                }
                MainScreen(
                    launchUrl = ::launchUrl,
                    start = ::start,
                    stop = ::stop,
                )
            }
        }
    }

    fun start() {
        try {
            applicationContext.getExternalFilesDir(null) // May return null, call to create directory
            val externalFilesDir = applicationContext.getExternalFilesDir(null)
            Log.i("ASSETS", externalFilesDir?.absolutePath.toString())
            if (externalFilesDir != null) {
                val nodeDir = externalFilesDir.absolutePath
                val executor = Executors.newSingleThreadExecutor()
                executor.submit {
                    copyAssets(applicationContext, nodeDir)
                    startNodeWithArguments(
                        arrayOf(
                            "node",
                            "$nodeDir/main.js",
                            "--cwd",
                            nodeDir
                        )
                    )
                }
                showNotification(this)
            } else {
                Log.e("StorageError", "External files directory is unavailable")
            }
        } catch (e: Exception) {
            cancelNotification(this)
            e.printStackTrace()
        }
    }

    fun stop() {
        try {
            cancelNotification(this)
            stopNode()
        } catch (e: Exception) {
            e.printStackTrace()
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
        checkAndCreateNotification(this)
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
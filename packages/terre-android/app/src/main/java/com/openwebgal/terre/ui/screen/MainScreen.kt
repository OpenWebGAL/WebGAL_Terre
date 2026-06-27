package com.openwebgal.terre.ui.screen

import android.app.Activity
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.DocumentsContract
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.OpenInNew
import androidx.compose.material.icons.rounded.Folder
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material.icons.rounded.Stop
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.TextButton
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.core.net.toUri
import androidx.lifecycle.viewmodel.compose.viewModel
import com.openwebgal.terre.R
import com.openwebgal.terre.service.TerreService
import com.openwebgal.terre.store.TerreStore
import com.openwebgal.terre.utils.BrowserUtils
import com.openwebgal.terre.viewmodel.TerreViewModel
import kotlin.system.exitProcess

@Composable
fun MainScreen(
    terreViewModel: TerreViewModel = viewModel(),
) {
    val context = LocalContext.current
    val isRunning by TerreStore.isRunning.collectAsState()
    val isExtracting by TerreStore.isExtracting.collectAsState()
    var showStopDialog by remember { mutableStateOf(false) }

    LaunchedEffect(terreViewModel) {
        terreViewModel.startExtraction(context)
    }

    if (showStopDialog) {
        AlertDialog(
            onDismissRequest = { showStopDialog = false },
            title = { Text(stringResource(R.string.confirm_exit_title)) },
            text = { Text(stringResource(R.string.confirm_exit_message)) },
            confirmButton = {
                TextButton(onClick = {
                    showStopDialog = false
                    context.stopService(Intent(context, TerreService::class.java))
                }) {
                    Text(stringResource(R.string.confirm))
                }
            },
            dismissButton = {
                TextButton(onClick = { showStopDialog = false }) {
                    Text(stringResource(R.string.cancel))
                }
            }
        )
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
    topBar = {
        AppBar()
    },
    floatingActionButton = {
        Row {
            if (isRunning) {
                ExtendedFloatingActionButton(
                    icon = {
                        Icon(Icons.AutoMirrored.Rounded.OpenInNew, contentDescription = null)
                    },
                    text = {
                        Text(stringResource(R.string.open_browser))
                    },
                    onClick = {
                        BrowserUtils.openBrowser(context, context.getString(R.string.local_url))
                    }
                )
                Spacer(modifier = Modifier.width(8.dp))
            }
            if (!isExtracting) {
                ExtendedFloatingActionButton(
                    icon = {
                        if (isRunning) {
                            Icon(Icons.Rounded.Stop, contentDescription = null)
                        } else {
                            Icon(Icons.Rounded.PlayArrow, contentDescription = null)
                        }
                    },
                    text = {
                        if (isRunning) {
                            Text(stringResource(R.string.stop))
                        } else {
                            Text(stringResource(R.string.start))
                        }
                    },
                    onClick = {
                        if (isRunning) {
                            showStopDialog = true
                        } else {
                            val serviceIntent = Intent(context, TerreService::class.java)
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                                context.startForegroundService(serviceIntent)
                            } else {
                                context.startService(serviceIntent)
                            }
                        }
                    }
                )
                Spacer(modifier = Modifier.width(8.dp))
            }
            ExtendedFloatingActionButton(
                icon = {
                    Icon(Icons.Rounded.Folder, contentDescription = null)
                },
                text = {
                    Text(stringResource(R.string.files))
                },
                onClick = {
                    val intent = Intent(Intent.ACTION_VIEW).apply {
                        val uri = DocumentsContract.buildRootUri(
                            "com.openwebgal.terre.provider.documents",
                            "root"
                        )
                        setDataAndType(uri, DocumentsContract.Root.MIME_TYPE_ITEM)
                        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    }
                    context.startActivity(intent)
                }
            )
        }
    }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            verticalArrangement = Arrangement.Top,
            horizontalAlignment = Alignment.Start,
        ) {
            Logcat()
        }
    }
}

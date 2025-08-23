package com.openwebgal.terre.ui.screen

import android.content.Intent
import android.os.Build
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.OpenInNew
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material.icons.rounded.Stop
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
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
import com.openwebgal.terre.viewmodel.TerreViewModel

@Composable
fun MainScreen(
    terreViewModel: TerreViewModel = viewModel(),
) {
    val context = LocalContext.current
    val isRunning by TerreStore.isRunning.collectAsState()

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = {
            AppBar()
        },
        floatingActionButton = {
            Row {
                if (isRunning)
                    ExtendedFloatingActionButton(
                        icon = {
                            Icon(Icons.AutoMirrored.Rounded.OpenInNew, contentDescription = null)
                        },
                        text = {
                            Text(stringResource(R.string.open_browser))
                        },
                        onClick = {
                            val intent =
                                Intent(
                                    Intent.ACTION_VIEW,
                                    context.getString(R.string.local_url).toUri()
                                )
                            context.startActivity(intent)
                        }
                    )
                Spacer(modifier = Modifier.width(8.dp))
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
                        val serviceIntent = Intent(context, TerreService::class.java)
                        if (isRunning) {
                            context.stopService(serviceIntent)
                        } else {
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                                context.startForegroundService(serviceIntent)
                            } else {
                                context.startService(serviceIntent)
                            }
                        }
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